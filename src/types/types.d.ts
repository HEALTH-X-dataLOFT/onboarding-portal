import '@gaia-x/json-web-signature-2020';

declare module '@gaia-x/json-web-signature-2020' {
	interface Proof {
		proofValue?: string;
	}
}
