'use server';

import { authOptions } from '@/lib/authOptions';
import { getServerSession, Session } from 'next-auth';

function logoutParams(session: Session): Record<string, string> {
	return {
		id_token_hint: session.idToken as string,
		post_logout_redirect_uri: process.env.NEXTAUTH_URL!,
	};
}

function sendEndSessionEndpointToURL(token: Session) {
	const endSessionEndPoint = new URL(
		`${process.env.KEYCLOAK_ISSUER}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`,
	);
	const params: Record<string, string> = logoutParams(token);
	const endSessionParams = new URLSearchParams(params);
	const response = { url: `${endSessionEndPoint.href}/?${endSessionParams}` };
	return response;
}

export async function getLogoutUrl() {
	const session = await getServerSession(authOptions);
	if (!session) {
		throw new Error('No session present');
	}
	return sendEndSessionEndpointToURL(session);
}
