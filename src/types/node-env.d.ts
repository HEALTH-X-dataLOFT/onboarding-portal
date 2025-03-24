declare namespace NodeJS {
	export interface ProcessEnv {
		NEXT_PUBLIC_FEDERATED_CATALOG_URL: string;
		NEXTAUTH_URL: string;
		NEXTAUTH_SECRET: string;

		KEYCLOAK_ID: string;
		KEYCLOAK_SECRET: string;
		KEYCLOAK_ISSUER: string;
		KEYCLOAK_REALM: string;

		DATABASE_URL: string;

		PORTAL_BASE_URL: string;
		PORTAL_CERT: string;
		PORTAL_KEY: string;
		LETS_ENCRYPT_ROOT_CERTIFICATE: string;

		NOTARY_URLS: string;
		COMPLIANCE_URLS: string;
	}
}
