import * as forge from 'node-forge';

export function pkcs1to8(pem: string) {
	if (pem.startsWith('-----BEGIN PRIVATE KEY-----\n')) {
		// already in pkcs8 format
		return pem;
	}
	const pkcs1PrivateKey = forge.pki.privateKeyFromPem(pem);
	const asn1PrivateKey = forge.pki.privateKeyToAsn1(pkcs1PrivateKey);
	const pkcs8PrivateKey = forge.pki.wrapRsaPrivateKey(asn1PrivateKey);
	const derBytes = forge.asn1.toDer(pkcs8PrivateKey).getBytes();
	const pkcs8Pem = forge.util.encode64(derBytes);
	return `-----BEGIN PRIVATE KEY-----\n${pkcs8Pem
		.match(/.{1,64}/g)!
		.join('\n')}\n-----END PRIVATE KEY-----`;
}

function pemToArrayBuffer(pem: string) {
	const b64 = pem.replace(/(-----(BEGIN|END) (RSA )?PRIVATE KEY-----|\n)/g, '');
	const binary = atob(b64);
	const len = binary.length;
	const buffer = new ArrayBuffer(len);
	const view = new Uint8Array(buffer);
	for (let i = 0; i < len; i++) {
		view[i] = binary.charCodeAt(i);
	}
	return buffer;
}

export async function importPrivateKey(pem: string) {
	const arrayBuffer = pemToArrayBuffer(pem);
	try {
		const key = await crypto.subtle.importKey(
			'pkcs8',
			arrayBuffer,
			{
				name: 'RSASSA-PKCS1-v1_5',
				hash: 'SHA-256',
			},
			true,
			['sign'],
		);
		return key;
	} catch (err) {
		console.error('Error importing key:', err);
		throw err;
	}
}
