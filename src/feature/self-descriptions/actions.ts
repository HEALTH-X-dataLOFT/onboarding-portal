'use server';

import {
	addSelfDescription,
	deleteSelfDescription,
	getParticipant,
	readSelfDescriptionByHash,
	ReadSelfDescriptionByHashQueryResponse,
	verify,
} from '@/generated';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getPermissionsProxy } from '@/utils/auth';
import { ensureArray } from '@/utils/verifiableCredentials';
import { ResponseConfig } from '@kubb/swagger-client/client';
import { getServerSession } from 'next-auth';

export async function provideSelfDescriptions(
	participantId: string,
	selfDescription: string,
) {
	const session = await getServerSession(authOptions);

	// if (!session || !permissions?.selfDescriptions.create.for(issuer)) {
	// 	throw new Error(
	// 		'The user does not have the permission to execute this request.',
	// 	);
	// }

	const options = {
		baseURL: process.env.NEXT_PUBLIC_FEDERATED_CATALOG_URL,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.accessToken}`,
		},
	};

	const participant = await getParticipant(participantId, options);

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
						ensureArray(
							JSON.parse(participant.selfDescription!).verifiableCredential,
						)[0],
						...ensureArray(JSON.parse(selfDescription).verifiableCredential),
					],
				},
				null,
				2,
			),
		});

		if (!compliance.ok) {
			// TODO
			return {
				errorMsg: `Credentials are not compliant: ${await compliance.text()}`,
			};
		}

		complianceVc = JSON.stringify(await compliance.json(), null, 2);
	}

	try {
		const { sdHash } = await addSelfDescription(selfDescription, options);

		if (complianceVc) {
			await prisma.compliance.create({
				data: {
					hash: sdHash!,
					complianceVc,
				},
			});
		}

		// TODO check permission per issuer
	} catch (e) {
		console.error('addSelfDescription failed', selfDescription);
		throw e;
	}
}

export async function updateSelfDescription(
	issuer: string,
	sdHash: string,
	content: string,
) {
	// TODO check if user is allowed for issuer

	// mimics update by post and delete

	const session = await getServerSession(authOptions);
	const permissions = getPermissionsProxy(session);

	if (!session || !permissions?.selfDescriptions.update.for(issuer)) {
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

	const participant = await getParticipant(issuer, options);

	// do not throw to be backwards compatible
	const info = await prisma.participant.findUnique({
		where: {
			id: issuer,
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
						ensureArray(
							JSON.parse(participant.selfDescription!).verifiableCredential,
						)[0],
						...ensureArray(JSON.parse(content).verifiableCredential),
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

	try {
		await verify(content, {}, options);
	} catch (e: any) {
		throw new Error(`Invalid self-description ${e?.response?.data?.message}`);
	}

	let originalSelfDescription: ResponseConfig<ReadSelfDescriptionByHashQueryResponse>['data'];
	try {
		originalSelfDescription = await readSelfDescriptionByHash(sdHash, options);
	} catch (e) {
		console.error(e);
		throw new Error('Self-description could not be fetched');
	}

	try {
		deleteSelfDescription(sdHash, options);
		const meta = await addSelfDescription(content, options);

		if (info) {
			await prisma.compliance.create({
				data: {
					hash: meta.sdHash!,
					complianceVc,
				},
			});
			await prisma.compliance.delete({
				where: {
					hash: sdHash,
				},
			});
		}

		return {
			meta,
			content,
		};
	} catch (e) {
		console.error('addSelfDescription failed', content);
		// try to recover the previous self-description again
		addSelfDescription(originalSelfDescription, options);
		throw e;
	}
}

export async function deleteSelfDescriptionAndCompliance(
	issuer: string,
	sdHash: string,
) {
	const session = await getServerSession(authOptions);
	const permissions = getPermissionsProxy(session);

	if (!session || !permissions?.selfDescriptions.delete.for(issuer)) {
		throw new Error(
			'The user does not have the permission to execute this request.',
		);
	}

	await deleteSelfDescription(sdHash, {
		baseURL: process.env.NEXT_PUBLIC_FEDERATED_CATALOG_URL,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.accessToken}`,
		},
	});

	await prisma.compliance.delete({
		where: {
			hash: sdHash,
		},
	});
}

export async function getSelfDescriptionCompliance(hash: string) {
	return (
		await prisma.compliance.findUniqueOrThrow({
			where: {
				hash,
			},
		})
	).complianceVc;
}
