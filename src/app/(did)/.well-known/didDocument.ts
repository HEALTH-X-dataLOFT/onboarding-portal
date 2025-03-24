import { createDidDocument } from '@gaia-x/did-web-generator';

export const didDocument = createDidDocument(
	process.env.PORTAL_BASE_URL,
	'x509Certificate.pem',
	process.env.PORTAL_CERT,
);
