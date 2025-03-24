'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { createDidDocument } from '@gaia-x/did-web-generator';
import { getPermissionsProxy } from '@/utils/auth';
import {
	assignAttributeToUser,
	assignClientRoleToUser,
	assignGroupToUser,
	createUser,
	getAdminToken,
	getUser,
} from '@/utils/keycloak';
import {
	JsonWebSignature2020Signer,
	VerifiableCredential,
} from '@gaia-x/json-web-signature-2020';
import { Signer } from '@gaia-x/json-web-signature-2020/dist/src/signer/signer';
import { createPrivateKey } from 'crypto';
import { addParticipant } from '@/generated';
import { packIntoVP } from '@/utils/verifiableCredentials';

export async function getRequests() {
	const requests = await prisma.participantOnboardingRequest.findMany({
		where: {
			frApproved: false,
		},
		include: {
			form: true,
		},
	});

	return requests.map((req) => ({
		id: req.id,
		email: req.form.email,
		participantName: req.form.participantName,
		city: req.form.city,
		acceptable:
			req.emailVerified &&
			req.registrationNumberVc != null &&
			req.participantVc != null &&
			req.termsAndConditionsVc != null,
	}));
}

// TODO use transactions
export async function acceptRequest(id: string) {
	// TODO check if this is a proper check
	const session = await getServerSession(authOptions);
	const permissions = getPermissionsProxy(session);

	if (!session || !permissions?.requests.approve.any()) {
		throw new Error(
			'The user does not have the permission to execute this request.',
		);
	}

	const options = {
		baseURL: process.env.NEXT_PUBLIC_FEDERATED_CATALOG_URL,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.accessToken}`,
		},
	};

	const participantOnboardingRequest =
		await prisma.participantOnboardingRequest.findUniqueOrThrow({
			where: {
				id,
			},
			include: {
				form: true,
			},
		});

	if (
		participantOnboardingRequest.form == null ||
		!participantOnboardingRequest.emailVerified
	) {
		throw new Error('Invalid request');
	}

	const participantVcJson = participantOnboardingRequest.participantVc;
	const termsAndConditionsVc =
		participantOnboardingRequest.termsAndConditionsVc;
	const legalRegistrationNumberVc =
		participantOnboardingRequest.registrationNumberVc;
	const complianceUrl = participantOnboardingRequest.complianceUrl;
	const complianceVc = participantOnboardingRequest.complianceVc;

	if (
		participantVcJson == null ||
		termsAndConditionsVc == null ||
		legalRegistrationNumberVc == null ||
		complianceUrl == null ||
		complianceVc == null
	) {
		throw new Error('Invalid request');
	}

	const participantVc = JSON.parse(participantVcJson) as VerifiableCredential;

	// POST to FC

	const didDocument = await createDidDocument(
		process.env.PORTAL_BASE_URL,
		'x509Certificate.pem',
		process.env.PORTAL_CERT,
	);

	const verificationMethod = (await didDocument).verificationMethod[0]!;
	const privateKeyAlg = verificationMethod.publicKeyJwk.alg!;
	const signer: Signer = new JsonWebSignature2020Signer({
		privateKey: createPrivateKey(process.env.PORTAL_KEY!),
		privateKeyAlg,
		verificationMethod: verificationMethod.id,
	});

	const participantVP: VerifiableCredential = await signer.sign(
		packIntoVP([participantVc]),
	);

	// POST participant to FC
	const participantId = (
		await addParticipant(JSON.stringify(participantVP, null, 2), options)
	).id!;

	// TODO handle error case

	await prisma.participant.create({
		data: {
			id: participantId,
			complianceUrl,
			legalRegistrationNumberVc,
			termsAndConditionsVc,
			complianceVc,
		},
	});

	// User creation
	const accessToken = await getAdminToken();
	try {
		await createUser(
			participantOnboardingRequest.form.firstName,
			participantOnboardingRequest.form.lastName,
			participantOnboardingRequest.form.email,
			// password,
			accessToken,
		);
	} catch (e) {
		// TODO ignore already present user
		throw e;
	}

	const userId = await getUser(
		participantOnboardingRequest.form.email,
		accessToken,
	);
	await assignClientRoleToUser(
		userId,
		process.env.KEYCLOAK_ID,
		'Ro-MU-A',
		accessToken,
	);
	await assignAttributeToUser(
		userId,
		'participantId',
		participantId,
		accessToken,
	);
	await assignGroupToUser(userId, participantId, accessToken);

	// TODO this is a workaround to delete form and request
	const request = await prisma.participantOnboardingRequest.findUniqueOrThrow({
		where: {
			id,
		},
		include: {
			form: true,
		},
	});
	await prisma.participantOnboardingFrom.delete({
		where: {
			id: request.form.id,
		},
	});

	console.log('Gaia-X: request approved by federator');

	return {};
}

export async function denyRequest(id: string) {
	const session = await getServerSession(authOptions);
	const permissions = getPermissionsProxy(session);

	if (!session || !permissions?.requests.deny.any()) {
		throw new Error(
			'The user does not have the permission to execute this request.',
		);
	}

	// TODO this is a workaround to delete form and request
	const request = await prisma.participantOnboardingRequest.findUniqueOrThrow({
		where: {
			id,
		},
		include: {
			form: true,
		},
	});
	const did = await prisma.did.findUnique({
		where: {
			id: request.id,
		},
	});
	await prisma.$transaction([
		prisma.participantOnboardingFrom.delete({
			where: {
				id: request.form.id,
			},
		}),
		...(did == null
			? []
			: [
					prisma.did.delete({
						where: {
							id: request.id,
						},
					}),
				]),
	]);

	// "send email"
	console.log('Gaia-X: request denied by federator');
}
