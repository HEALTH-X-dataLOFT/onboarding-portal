'use server';

import { deleteParticipant, updateParticipant } from '@/generated';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getPermissionsProxy } from '@/utils/auth';
import { ensureArray } from '@/utils/verifiableCredentials';
import { getDidWeb } from '@gaia-x/did-web-generator';
import { getServerSession } from 'next-auth';

export async function putParticipant(participantId: string, provider: string) {
	const session = await getServerSession(authOptions);
	const permissions = getPermissionsProxy(session);

	if (!session || !permissions?.participants.update.for(participantId)) {
		throw new Error(
			'The user does not have the permission to execute this request.',
		);
	}

	// do not throw to be backwards compatible
	const info = await prisma.participant.findUnique({
		where: {
			id: participantId,
		},
	});

	let complianceVc;
	if (info) {
		const compliance = await fetch(info.complianceUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(
				{
					'@context': 'https://www.w3.org/2018/credentials/v1',
					type: 'VerifiablePresentation',
					verifiableCredential: [
						JSON.parse(info.legalRegistrationNumberVc),
						JSON.parse(info.termsAndConditionsVc),
						ensureArray(JSON.parse(provider).verifiableCredential)[0],
					],
				},
				null,
				2,
			),
		});

		if (!compliance.ok) {
			// TODO
			throw new Error(
				`Credentials are not compliant: ${await compliance.text()}`,
			);
		}

		complianceVc = JSON.stringify(await compliance.json(), null, 2);
	}

	const result = await updateParticipant(participantId, provider, {
		baseURL: process.env.NEXT_PUBLIC_FEDERATED_CATALOG_URL,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.accessToken}`,
		},
	});

	if (info) {
		await prisma.participant.update({
			where: {
				id: participantId,
			},
			data: {
				complianceVc,
			},
		});
	}

	return result;
}

export async function deleteParticipantAndDid(participantId: string) {
	const session = await getServerSession(authOptions);
	const permissions = getPermissionsProxy(session);

	if (!session || !permissions?.participants.delete.for(participantId)) {
		throw new Error(
			'The user does not have the permission to execute this request.',
		);
	}

	await deleteParticipant(participantId, {
		baseURL: process.env.NEXT_PUBLIC_FEDERATED_CATALOG_URL,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.accessToken}`,
		},
	});

	const managedDidPrefix = getDidWeb(
		new URL('did/', process.env.PORTAL_BASE_URL).href,
	);

	// TODO transactional

	if (participantId.startsWith(managedDidPrefix)) {
		const didId = participantId.slice(managedDidPrefix.length);
		await prisma.did.delete({
			where: {
				id: didId,
			},
		});
	}

	await prisma.participant.delete({
		where: {
			id: participantId,
		},
	});
}

export async function getParticipantCompliance(participantId: string) {
	return (
		await prisma.participant.findUniqueOrThrow({
			where: {
				id: participantId,
			},
		})
	).complianceVc;
}
