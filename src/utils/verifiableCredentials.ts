import { VerifiableCredential } from '@gaia-x/json-web-signature-2020';
import { Signer } from '@gaia-x/json-web-signature-2020/dist/src/signer/signer';
import { ParticipantOnboardingFrom } from '@prisma/client';

export function ensureArray<T>(arrayOrEntry: T | T[]): T[] {
	if (Array.isArray(arrayOrEntry)) return arrayOrEntry;
	return [arrayOrEntry];
}

function mapOrApply<T, U>(data: T | T[], fn: (entry: T) => U) {
	if (Array.isArray(data)) {
		return data.map(fn);
	}
	return fn(data);
}

export function removeProofsFromVc(vc: VerifiableCredential, issuer: string) {
	const result = { ...vc };

	if (result.verifiableCredential) {
		result.verifiableCredential = mapOrApply(
			result.verifiableCredential,
			(vc) => removeProofsFromVc(vc, issuer),
		);
	}
	const childModified =
		result.verifiableCredential != null &&
		ensureArray(result.verifiableCredential).some((vc) => vc.proof == null);

	if (
		childModified ||
		vc.proof.verificationMethod.startsWith(`${issuer}#X509-JWK2020`)
	) {
		delete result.proof;
	}

	return result;
}

export function urlToDid(url: string) {
	return `did:web:${url
		.replace('https://', '')
		.replace(':', '%3A')
		.replace(/\//g, ':')}`;
}

export function didToUrl(did: string) {
	if (!did.startsWith('did:web:')) {
		throw new Error('Did must use did:web');
	}
	let unprefixed = did.slice('did:web:'.length);

	if (!unprefixed.includes(':')) {
		unprefixed += ':.well-known';
	}

	return `https://${unprefixed.replace(/\:/g, '/').replace('%3A', ':')}`;
}

export function packIntoVP(
	verifiableCredential: VerifiableCredential | VerifiableCredential[],
): Omit<VerifiableCredential, 'proof'> {
	return {
		'@context': [
			'https://www.w3.org/2018/credentials/v1',
			'https://w3id.org/security/suites/jws-2020/v1',
		],
		id: `urn:uuid:${crypto.randomUUID()}`,
		type: ['VerifiablePresentation'],
		verifiableCredential,
	};
}

export async function signVc(vc: any, signer: Signer, issuanceDate: string) {
	if (vc.proof != null) {
		return vc;
	}

	const isVP = vc.verifiableCredential != null;

	if (!isVP) {
		// issuanceDate must not be set on VP
		vc.issuanceDate = issuanceDate;
	}
	if (isVP) {
		if (Array.isArray(vc.verifiableCredential)) {
			vc = {
				...vc,
				verifiableCredential: await Promise.all(
					vc.verifiableCredential.map((vc) => signVc(vc, signer, issuanceDate)),
				),
			};
		} else {
			vc = {
				...vc,
				verifiableCredential: await signVc(
					vc.verifiableCredential,
					signer,
					issuanceDate,
				),
			};
		}
	}

	return signer.sign(vc);
}

export function mapRequestToCredentialSubject(
	participantOnboardingRequest: ParticipantOnboardingFrom,
	subjectId: string,
	legalRegistrationNumberId: string,
) {
	return {
		type: 'gx:LegalParticipant',
		'gx:legalName': participantOnboardingRequest.participantName,
		'gx:legalRegistrationNumber': {
			id: legalRegistrationNumberId,
		},
		'gx:headquarterAddress': {
			'gx:addressCountryCode': participantOnboardingRequest.countryCode,
			'gx:countrySubdivisionCode':
				participantOnboardingRequest.countrySubdivisionCode,
			'gx:streetAddress': participantOnboardingRequest.street,
			'gx:postalCode': participantOnboardingRequest.zipCode,
			'gx:locality': participantOnboardingRequest.city,
		},
		'gx:legalAddress': {
			'gx:addressCountryCode': participantOnboardingRequest.countryCode,
			'gx:countrySubdivisionCode':
				participantOnboardingRequest.countrySubdivisionCode,
			'gx:streetAddress': participantOnboardingRequest.street,
			'gx:postalCode': participantOnboardingRequest.zipCode,
			'gx:locality': participantOnboardingRequest.city,
		},
		id: subjectId,
		'gx-terms-and-conditions:gaiaxTermsAndConditions':
			'70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700',
	};
}

export function mapRequestToUnsignedVC(
	id: string,
	credentialSubject: unknown,
	issuer: string,
	issuanceDate: string,
): Omit<VerifiableCredential, 'proof'> {
	return {
		'@context': [
			'https://www.w3.org/2018/credentials/v1',
			'https://w3id.org/security/suites/jws-2020/v1',
			'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#',
		],
		type: ['VerifiableCredential'],
		id,
		issuer,
		issuanceDate,
		credentialSubject,
	};
}
