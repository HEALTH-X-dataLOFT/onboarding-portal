import { PermissionScope } from '@/utils/auth';
import { AuthOptions, TokenSet } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';

declare module 'next-auth/jwt' {
	export interface JWT {
		accessToken: string;
		refreshToken: string;
		idToken: string;
		expiresAt: number;

		roles: string[];
		participantId: string | undefined;
	}
}

declare module 'next-auth' {
	export interface Session {
		participantId: string | undefined;
		permissions?: {
			users: {
				list: PermissionScope | false;
				read: PermissionScope | false;
				create: PermissionScope | false;
				update: PermissionScope | false;
				delete: PermissionScope | false;
			};
			participants: {
				list: PermissionScope | false;
				read: PermissionScope | false;
				create: PermissionScope | false;
				update: PermissionScope | false;
				delete: PermissionScope | false;
			};
			selfDescriptions: {
				list: PermissionScope | false;
				read: PermissionScope | false;
				create: PermissionScope | false;
				update: PermissionScope | false;
				delete: PermissionScope | false;
			};
			requests: {
				list: PermissionScope | false;
				approve: PermissionScope | false;
				deny: PermissionScope | false;
			};
		};
		/**
		 * Access token
		 */
		accessToken: string;
		idToken: string;
	}
}

const keycloak = KeycloakProvider({
	clientId: process.env.KEYCLOAK_ID,
	clientSecret: process.env.KEYCLOAK_SECRET,
	issuer: `${process.env.KEYCLOAK_ISSUER}/realms/${process.env.KEYCLOAK_REALM}`,
});

async function doFinalSignoutHandshake(jwt: JWT) {
	const { provider, id_token } = jwt;

	if (provider == keycloak.id) {
		try {
			// Add the id_token_hint to the query string
			const params = new URLSearchParams();
			// @ts-expect-error fix when type of id_token is known
			params.append('id_token_hint', id_token);
			const { status, statusText } = await fetch(
				`${
					keycloak.options!.issuer
				}/protocol/openid-connect/logout?${params.toString()}`,
			);

			// The response body should contain a confirmation that the user has been logged out
			console.log('Completed post-logout handshake', status, statusText);
		} catch (e: any) {
			console.error('Unable to perform post-logout handshake', e?.code || e);
		}
	}
}

// https://medium.com/inspiredbrilliance/implementing-authentication-in-next-js-v13-application-with-keycloak-part-2-6f68406bb3b5
// TODO add SessionGuard
export const authOptions: AuthOptions = {
	providers: [keycloak],
	session: {
		// TODO default refresh token lifespan
		maxAge: 60 * 30,
	},
	callbacks: {
		async jwt({ token, account }) {
			if (account != null) {
				token.accessToken = account.access_token!;
				token.idToken = account.id_token!;
				token.refreshToken = account.refresh_token!;
				token.expiresAt = account.expires_at!;

				const payload = getPayloadOfToken(token.accessToken);
				token.roles = payload?.resource_access?.['federated-catalogue']?.roles;
				token.participantId = payload?.participant_id;
			}
			// we take a buffer of one minute
			return updateToken(token, 1);
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken;
			session.idToken = token.idToken;

			session.participantId = token.participantId;

			const isCatalogAdmin = token.roles?.includes('Ro-MU-CA');
			const isParticipantAdmin =
				isCatalogAdmin || token.roles?.includes('Ro-MU-A');
			const isUserAdmin =
				isParticipantAdmin || token.roles?.includes('Ro-PA-A');
			const isSelfDescriptionAdmin =
				isParticipantAdmin || token.roles?.includes('Ro-SD-A');

			const unrestrictedScope: PermissionScope = {
				restricted: false,
				participantId: null,
			};

			const participantScope: PermissionScope | false = isCatalogAdmin
				? unrestrictedScope
				: token.participantId
					? {
							restricted: true,
							participantId: token.participantId,
						}
					: false;

			if (token.roles?.length > 0) {
				session.permissions = {
					users: {
						list: isUserAdmin && participantScope,
						read: isUserAdmin && participantScope,
						create: isUserAdmin && participantScope,
						update: isUserAdmin && participantScope,
						delete: isUserAdmin && participantScope,
					},
					participants: {
						list: unrestrictedScope,
						read: unrestrictedScope,
						create: isCatalogAdmin ? unrestrictedScope : false,
						update: isParticipantAdmin && participantScope, // TODO approval from FR required to sign with trust anchor
						delete: isParticipantAdmin && participantScope,
					},
					selfDescriptions: {
						list: unrestrictedScope,
						read: unrestrictedScope,
						create: isSelfDescriptionAdmin && participantScope,
						update: isSelfDescriptionAdmin && participantScope,
						delete: isSelfDescriptionAdmin && participantScope,
					},
					requests: {
						list: isCatalogAdmin && unrestrictedScope,
						approve: isCatalogAdmin && unrestrictedScope,
						deny: isCatalogAdmin && unrestrictedScope,
					},
				};
			}

			return session;
		},
	},
	events: {
		signOut: ({ token }) => doFinalSignoutHandshake(token),
	},
};

function getPayloadOfToken(accessToken: string) {
	const [_headerBase64, payloadBase64, _signature] = accessToken.split('.');
	return JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
}

async function updateToken(token: JWT, minutes: number) {
	if (Date.now() < token.expiresAt! * 1000 - 60 * 1000 * minutes) {
		return token;
	} else {
		try {
			const response = await requestRefreshOfAccessToken(token);

			const tokens: TokenSet = await response.json();

			if (!response.ok) throw tokens;

			const updatedToken: JWT = {
				...token,
				idToken: tokens.id_token,
				accessToken: tokens.access_token!,
				expiresAt: Math.floor(
					Date.now() / 1000 + (tokens.expires_in as number),
				),
				refreshToken: tokens.refresh_token ?? token.refreshToken,
			};
			return updatedToken;
		} catch (error) {
			console.error('Error refreshing access token', error);
			// will require login on refresh
			throw new Error('Error refreshing access token');
		}
	}
}

function requestRefreshOfAccessToken(token: JWT) {
	return fetch(
		`${process.env.KEYCLOAK_ISSUER}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
		{
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: process.env.KEYCLOAK_ID,
				client_secret: process.env.KEYCLOAK_SECRET,
				grant_type: 'refresh_token',
				refresh_token: token.refreshToken!,
			}),
			method: 'POST',
			cache: 'no-store',
		},
	);
}
