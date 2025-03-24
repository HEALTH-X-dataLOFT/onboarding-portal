const defaultValue = JSON.stringify(
	[
		{
			'@context': [
				'https://www.w3.org/2018/credentials/v1',
				'https://w3id.org/security/suites/jws-2020/v1',
				'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#',
			],
			type: ['VerifiableCredential'],
			id: '{{uuid(0)}}',
			issuer: '{{issuer}}',
			credentialSubject: {
				type: 'gx:ServiceOffering',
				'gx:providedBy': {
					id: '{{provider}}',
				},
				'gx:policy': '',
				'gx:termsAndConditions': {
					'gx:URL': 'http://termsandconds.com',
					'gx:hash': 'd8402a23de560f5ab34b22d1a142feb9e13b3143',
				},
				'gx:dataAccountExport': {
					'gx:requestType': 'API',
					'gx:accessType': 'digital',
					'gx:formatType': 'application/json',
				},
				id: '{{uuid(1)}}',
			},
		},
	],
	null,
	4,
);

export const templates = {
	'Connector Endpoint': {
		template: `[
	{
		"@context": [
			"https://www.w3.org/2018/credentials/v1",
			"https://w3id.org/security/suites/jws-2020/v1",
			"https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
		],
		"type": ["VerifiableCredential"],
		"id": "{{uuid(0)}}",
		"issuer": "{{issuer}}",
		"credentialSubject": [
			{
				"@type": "gx:ServiceOffering",
				"id": "{{uuid(1)}}",
				"gx:providedBy": {
					"id": "{{provider}}"
				},
				"gx:dataProtectionRegime": ["GDPR2016"],
				"gx:termsAndConditions": {
					"id": "https://lab.gaia-x.eu/soterms.json",
					"@type": "gx:SOTermsAndConditions",
					"gx:URL": "https://creativecommons.org/licenses/by/4.0/",
					"gx:hash": "2edd334433cb3ff9c2904b194653d714cf42398e6af750fb44c65679a9fce6cc"
				},
				"gx:policy": "It is not allowed to store personal information.",
				"gx:dataAccountExport": {
					"gx:requestType": "API",
					"gx:accessType": "digital",
					"gx:formatType": "application/json"
				},
				"gx:aggregationOf": [
					{
						"id": "{{uuid(SoftwareResource)}}"
					}
				]
			},
			{
				"@type": "gx:SoftwareResource",
				"id": "{{uuid(SoftwareResource)}}",
				"gx:policy": "default: allow",
				"gx:license": "EPL-2.0",
				"gx:copyrightOwnedBy": "original owner"
			},
			{
				"@type": "gx:InstantiatedVirtualResource",
				"id": "{{uuid(2)}}",
				"gx:instanceOf": {
					"id": "{{uuid(SoftwareResource)}}"
				},
				"gx:hostedOn": {
					"id": "{{uuid(SoftwareResource)}}"
				},
				"gx:maintainedBy": {
					"id": "{{provider}}"
				},
				"gx:serviceAccessPoint": [
					{
						"id": "{{uuid(id-connector)}}"
					}
				]
			},
			{
				"@type": "gx:ServiceAccessPoint",
				"id": "{{uuid(id-connector)}}",
				"gx:name": "ids",
				"gx:host": "{{url}}",
				"gx:port": "443",
				"gx:protocol": "https"
			}
		]
	}
]`,
		input: {
			url: {
				label: 'Url',
				type: 'string',
				placeholder: 'replace.me.example.com',
				default: '',
			},
		},
	},
	'Custom Service Offering VC': {
		template: `{{vp}}`,
		input: {
			vp: {
				type: 'vc',
				placeholder: '',
				default: defaultValue,
			},
		},
	},
} as const;
