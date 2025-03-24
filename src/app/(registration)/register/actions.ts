'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { randomUUID } from 'node:crypto';
import { VerifiableCredential } from '@gaia-x/json-web-signature-2020';
import { getAdminToken, getUser } from '@/utils/keycloak';
import { notaryUrlsScheme } from '@/lib/env';

const formScheme = z.discriminatedUnion('provideLrnVc', [
	z.object({
		firstName: z.string(),
		lastName: z.string(),
		email: z.string().email(),
		participantName: z.string(),
		street: z.string(),
		zipCode: z.string(),
		city: z.string(),
		countrySubdivisionCode: z.string().regex(/[A-Z]{2}-[A-Z0-9]{1,3}/),
		provideLrnVc: z.literal(false),
		vatID: z.string().min(1),
		notaryUrl: z.string(),
	}),
	z.object({
		firstName: z.string(),
		lastName: z.string(),
		email: z.string().email(),
		participantName: z.string(),
		street: z.string(),
		zipCode: z.string(),
		city: z.string(),
		countrySubdivisionCode: z.string().regex(/[A-Z]{2}-[A-Z0-9]{1,3}/),
		provideLrnVc: z.literal(true),
		lrnVc: z.string(),
	}),
]);

const LegalRegistrationNumberSchema = z.object({
	'@context': z.array(z.string()),
	type: z.array(z.string()),
	id: z.string().url(),
	issuer: z.string(),
	issuanceDate: z.string().datetime(),
	credentialSubject: z.object({
		'@context': z.string().url(),
		type: z.string(),
		id: z.string().url(),
		'gx:vatID': z.string(),
		'gx:vatID-countryCode': z.string(),
	}),
	evidence: z.array(
		z.object({
			'gx:evidenceURL': z.string().url(),
			'gx:executionDate': z.string().datetime(),
			'gx:evidenceOf': z.string(),
		}),
	),
	proof: z.object({
		type: z.string(),
		created: z.string().datetime(),
		proofPurpose: z.string(),
		verificationMethod: z.string(),
		jws: z.string(),
	}),
});

export type State = {
	errorMsg?: string;
};

async function generateLegalRegistrationNumberVC(
	vatID: string,
	notaryUrl: string,
): Promise<VerifiableCredential> {
	const legalRegistrationNumberId = `urn:uuid:${randomUUID()}`;

	const legalRegistrationNumberResponse = await fetch(
		`${notaryUrl}?vcid=urn%3Auuid%3A${randomUUID()}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(
				{
					'@context': [
						'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/participant',
					],
					type: 'gx:legalRegistrationNumber',
					id: legalRegistrationNumberId,
					'gx:vatID': vatID,
				},
				null,
				2,
			),
		},
	);

	if (!legalRegistrationNumberResponse.ok) {
		if (legalRegistrationNumberResponse.status === 400) {
			throw new Error(
				`Invalid VatID: ${await legalRegistrationNumberResponse.text()}`,
			);
		}
		throw new Error('Could not fetch legalRegistrationNumber');
	}
	return (await legalRegistrationNumberResponse.json()) as VerifiableCredential;
}

export async function getNotaryUrls() {
	const notaryUrls = notaryUrlsScheme.parse(
		JSON.parse(global.process.env.NOTARY_URLS),
	);

	return Promise.resolve(notaryUrls);
}

export async function registerUser(variables: unknown): Promise<State> {
	const notaryUrls = notaryUrlsScheme.parse(
		JSON.parse(global.process.env.NOTARY_URLS),
	);

	const input = formScheme.safeParse(variables);
	if (!input.success) {
		return {
			errorMsg: 'Invalid arguments',
		};
	}

	let form, legalRegistrationNumberVC;
	if (input.data.provideLrnVc) {
		const { provideLrnVc, lrnVc, ..._form } = input.data;
		try {
			legalRegistrationNumberVC = LegalRegistrationNumberSchema.parse(
				JSON.parse(lrnVc),
			);
		} catch {
			return {
				errorMsg: 'Invalid legal registration number VC',
			};
		}

		const vc = legalRegistrationNumberVC;
		if (
			!notaryUrls.some(
				({ issuer }) =>
					vc.issuer === issuer &&
					vc.proof.verificationMethod.startsWith(`${issuer}#`),
			)
		) {
			return {
				errorMsg: 'Invalid issuer for legal registration number VC',
			};
		}

		form = {
			..._form,
			vatID: legalRegistrationNumberVC.credentialSubject['gx:vatID'],
		};
	} else {
		const { notaryUrl, provideLrnVc, ..._form } = input.data;
		form = _form;

		if (!notaryUrls.some(({ url }) => url === notaryUrl)) {
			return {
				errorMsg: 'Invalid notary url',
			};
		}

		try {
			legalRegistrationNumberVC = await generateLegalRegistrationNumberVC(
				form.vatID,
				notaryUrl,
			);
		} catch (err) {
			if (
				err != null &&
				typeof err === 'object' &&
				'message' in err &&
				typeof err.message === 'string'
			) {
				return {
					errorMsg: err.message,
				};
			}
			return {
				errorMsg: 'Could not fetch VatID',
			};
		}
	}

	let request;
	try {
		request = await prisma.participantOnboardingRequest.create({
			data: {
				form: {
					// zod checks that only spezified properties are set on rawFormData
					create: {
						...form,
						countryCode:
							legalRegistrationNumberVC.credentialSubject[
								'gx:vatID-countryCode'
							],

						participantVcId: `urn:uuid:${randomUUID()}`,
						participantSubjectId: `urn:uuid:${randomUUID()}`,
						termsAndConditionsVcId: `urn:uuid:${randomUUID()}`,
						termsAndConditionsSubjectId: `urn:uuid:${randomUUID()}`,
						registrationNumberVcId: legalRegistrationNumberVC.id,
						registrationNumberSubjectId:
							legalRegistrationNumberVC.credentialSubject.id,
					},
				},
				registrationNumberVc: JSON.stringify(
					legalRegistrationNumberVC,
					null,
					2,
				),
			},
		});

		// check for keycloak user after creation to avoid race condition
		try {
			await getUser(form.email, await getAdminToken());
			// user already exists!
			await prisma.participantOnboardingRequest.delete({
				where: {
					id: request.id,
				},
			});
			return {
				errorMsg: 'User for this email already exists',
			};
		} catch {
			// user does not exists, so request is fine
		}
	} catch (e) {
		if (e == null || typeof e != 'object' || !('meta' in e)) {
			return {
				errorMsg: 'Unknown error',
			};
		}

		const meta: any = e.meta;
		if (
			meta.modelName !== 'ParticipantOnboardingRequest' ||
			meta.target?.length !== 1 ||
			meta.target?.[0] !== 'email'
		) {
			return {
				errorMsg: 'Unknown error',
			};
		}
		return {
			errorMsg: 'User for this email already exists',
		};
	}

	// TODO send mail

	redirect(`/confirm/${request.id}`);
}
