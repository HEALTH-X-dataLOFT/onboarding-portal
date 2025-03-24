'use server';

import prisma from '@/lib/prisma';
import { createDidDocument } from '@gaia-x/did-web-generator';
import { pki } from 'node-forge';
import { z } from 'zod';
import {
	createUnsignedParticipantVC,
	createUnsignedTermsAndConditionsVC,
} from './utils';
import { VerifiableCredential } from '@gaia-x/json-web-signature-2020';
import { deepStrictEqual } from 'node:assert';

const onBoardingScheme = z.object({
	requestId: z.string(),
	formId: z.string(),
	crtPem: z.string().optional(),
	participantVc: z.string(),
	termsAndConditionsVc: z.string(),
	complianceUrl: z.string(),
});

export async function onboardParticipant(
	_data: z.infer<typeof onBoardingScheme>,
) {
	const data = onBoardingScheme.parse(_data);

	const complianceUrls = z
		.array(z.string())
		.parse(JSON.parse(global.process.env.COMPLIANCE_URLS));
	if (!complianceUrls.includes(data.complianceUrl)) {
		return {
			errorMsg: 'Invalid compliance url',
		};
	}

	const request = await prisma.participantOnboardingRequest.findFirst({
		where: {
			id: data.requestId,
		},
		include: {
			form: true,
		},
	});
	if (
		request == null ||
		request.formId !== data.formId ||
		request.vcsSubmitted
	) {
		return {
			errorMsg: `Invalid request`,
		};
	}

	const legalRegistrationNumberVC = JSON.parse(request.registrationNumberVc!);

	// validate certificate
	if (data.crtPem) {
		try {
			pki.certificateFromPem(data.crtPem);
		} catch {
			return {
				errorMsg: 'Invalid certificate',
			};
		}
	}
	// validate VCs
	try {
		const participantVc = JSON.parse(
			data.participantVc,
		) as VerifiableCredential;
		const issuer = participantVc.issuer;
		validateVC(
			participantVc,
			createUnsignedParticipantVC(request.form, issuer),
		);
		validateVC(
			JSON.parse(data.termsAndConditionsVc) as VerifiableCredential,
			createUnsignedTermsAndConditionsVC(request.form, issuer),
		);
	} catch {
		return {
			errorMsg: 'Invalid VC',
		};
	}

	if (data.crtPem) {
		await prisma.did.create({
			data: {
				id: data.requestId,
				certificate: data.crtPem,
				did: JSON.stringify(
					await createDidDocument(
						`${process.env.PORTAL_BASE_URL}/did/${data.requestId}`,
						'x509Certificate.pem',
						data.crtPem,
					),
				),
			},
		});
	}

	const providerVp = JSON.stringify(
		{
			'@context': 'https://www.w3.org/2018/credentials/v1',
			type: 'VerifiablePresentation',
			verifiableCredential: [
				legalRegistrationNumberVC,
				JSON.parse(data.termsAndConditionsVc),
				JSON.parse(data.participantVc),
			],
		},
		null,
		2,
	);

	const compliance = await fetch(data.complianceUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: providerVp,
	});

	if (!compliance.ok) {
		if (data.crtPem) {
			await prisma.did.delete({
				where: {
					id: data.requestId,
				},
			});
		}
		return {
			errorMsg: `Credentials are not compliant: ${await compliance.text()}`,
		};
	}

	const complianceVc = JSON.stringify(await compliance.json(), null, 2);

	await prisma.participantOnboardingRequest.update({
		where: {
			id: request.id,
		},
		data: {
			participantVc: data.participantVc,
			termsAndConditionsVc: data.termsAndConditionsVc,
			complianceUrl: data.complianceUrl,
			complianceVc,
			vcsSubmitted: true,
			emailVerified: true,
		},
	});

	return {
		providerVp,
		compliance: complianceVc,
	};
}

const VcScheme = z.object({
	issuanceDate: z.string().datetime({ offset: true }),
	issuer: z.string(),
	proof: z.object({
		type: z.string(),
		created: z.string().datetime({ offset: true }),
		proofPurpose: z.string(),
		verificationMethod: z.string(),
		jws: z.string(),
	}),
});

function validateVC(
	input: VerifiableCredential,
	_expected: Omit<VerifiableCredential, 'proof'>,
) {
	const { proof, issuanceDate: _, ...unsignedInput } = input;

	const { issuanceDate: __, ...expected } = _expected;

	// Validate known values
	deepStrictEqual(unsignedInput, expected);

	// Validate dynamic values
	const data = VcScheme.parse(input);

	if (!data.proof.verificationMethod.startsWith(`${data.issuer}#`)) {
		throw new Error('Invalid verificationMethod');
	}
	if (Object.keys(proof).length > 5) {
		throw new Error('Invalid proof');
	}
}
