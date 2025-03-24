'use server';

import { z } from 'zod';
import { didToUrl } from './verifiableCredentials';

const didScheme = z.object({
	verificationMethod: z.array(
		z.object({
			id: z.string(),
			publicKeyJwk: z.object({
				alg: z.string(),
				x5u: z.string().url(),
			}),
		}),
	),
});

export async function getByVerificationMethod(verificationMethod: string) {
	const parts = verificationMethod.split('#');
	if (parts.length !== 2) {
		throw new Error('Invalid VerficationMethod');
	}

	if (parts[1] !== 'X509-JWK2020') {
		throw new Error('VerficationMethod must end with #X509-JWK2020');
	}

	const response = await fetch(`${didToUrl(parts[0])}/did.json`);

	if (!response.ok) {
		throw new Error('Could not fetch did');
	}

	const json = didScheme.safeParse(await response.json());

	if (!json.success) {
		throw new Error('Invalid did');
	}
	const did = json.data;

	const result = did.verificationMethod.find(
		(e) => e.id === verificationMethod,
	);

	if (result == null) {
		throw new Error('VerificationMethod is not present in did');
	}

	return result;
}
