import { getParticipant, GetParticipantQueryResponse } from '@/generated';
import { ResponseConfig } from '@kubb/plugin-client/client';
import { Session } from 'next-auth';

export async function getTemplateValuesForIssuer(
	catalogURL: string,
	issuer: string,
	session: Session,
) {
	const options = {
		// we are passing this as prop, because we are using this function in an ssr: false
		// environment (see https://github.com/vercel/next.js/discussions/45785)
		baseURL: catalogURL,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.accessToken}`,
		},
	};

	let response: ResponseConfig<GetParticipantQueryResponse>['data'];
	try {
		// TODO use unauthenticated endpoint
		response = await getParticipant(issuer, options);
	} catch {
		throw new Error('Could not resolve participant');
	}

	const participant = JSON.parse(response.selfDescription!);

	return {
		issuer,
		provider:
			participant.verifiableCredential?.[0]?.credentialSubject?.id ??
			participant.verifiableCredential?.credentialSubject?.id,
	};
}

export function renderTemplate(
	template: string,
	values: Record<string, string>,
) {
	const uuidCache = new Map<string, string>();

	let value = template;
	let iteration = 0;

	while (true) {
		if (iteration++ > 100) {
			throw new Error('Invalid template: Recursion');
		}
		const match = /\{\{(.+)\}\}/.exec(value);
		if (!match) {
			return JSON.parse(value);
		}

		const fn = match[1];
		if (fn in values) {
			value = value.replace(match[0], values[fn]);
			continue;
		}
		// render {{uuid(uuidKey)}}
		const uuidKey = /^uuid\((.+)\)$/.exec(fn)?.[0];
		if (uuidKey) {
			if (!uuidCache.has(uuidKey)) {
				uuidCache.set(uuidKey, `urn:uuid:${crypto.randomUUID()}`);
			}
			value = value.replace(match[0], uuidCache.get(uuidKey)!);
			continue;
		}
		throw new Error(`Unknown placeholder '${value}'`);
	}
}
