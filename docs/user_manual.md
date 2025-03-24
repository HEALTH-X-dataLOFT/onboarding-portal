# Onboarding

## Prerequisites

### Certificate

You need a certificate in `.pem` format. Note that the `.pem` file has to include the whole certificate chain.

:warning: For Let's Encrypt certificates :warning: you might have to manually add the root certificate, e.g.

```
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
-----END CERTIFICATE-----
```

### Private Key

You need the private key corresponding to the certificate in PKCS#1 format, e.g.

```
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

## Registration

Fill in the form at the `/register` page.

### Legal Registration Number

The API to generate a Legal Registration Number VC is sometimes not available. If you have a LRN-VC already you can check the `Provide Legal Registration Number VC` toggle and directly upload a LRN-VC, e.g. a JSON file with the following content:

```json
{
	"@context": [
		"https://www.w3.org/2018/credentials/v1",
		"https://w3id.org/security/suites/jws-2020/v1"
	],
	"type": ["VerifiableCredential"],
	"id": "urn:uuid:abc123",
	"issuer": "did:web:registration.lab.gaia-x.eu:v1-staging",
	"issuanceDate": "2025-02-03T15:17:43.790Z",
	"credentialSubject": {
		"@context": "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
		"type": "gx:legalRegistrationNumber",
		"id": "urn:uuid:abc123",
		"gx:vatID": "DE123456789",
		"gx:vatID-countryCode": "DE"
	},
	"evidence": [
		{
			"gx:evidenceURL": "http://ec.europa.eu/taxation_customs/vies/services/checkVatService",
			"gx:executionDate": "2025-02-03T15:17:43.790Z",
			"gx:evidenceOf": "gx:vatID"
		}
	],
	"proof": {
		// ...
	}
}
```

### Submitting

Click the `Submit` Button and afterwards click on the blue link (at some later point in time this link would be sent to your email address)

#### Trouble-shooting

1. `User for this email already exists`: Ask the federator to remove the user that is already present
2. `Invalid VatID: "The following APIs are not reachable :gx:vatID"`: [Provide the LRN VC yourself](#Legal-Registration-Number) or try again later

## Onboarding

If you want to host your DID yourself, you can check the `Self host certificate` toggle and provide your verificationMethod. For most people we recommend to just let the portal host the DID for you:

Provide your certificate as `.pem` file (with the whole certificate chain) and your private key as described in prerequisites. Note that the private key will never leave your system and is only used to sign documents in your browser environment.

For the compliance endpoint choose `https://compliance.arlabdevelopments.com/v1-staging/api/credential-offers`.

Click `Submit` and accept downloading files. You will receive a `provider.json`, containing a VP with your provider VC, termsAndConditionsVC and legalRegistrationNumberVC and a `compliance.json` containing your Compliance VC. Save these files locally.

# Login

You will receive your login credentials from the federator after your onboarding request was validated.

# Providing Self Descriptions

Once you are logged in to the portal, you can provide additional information by adding self descriptions.

Navigate to `Self Descriptions` in the left sidebar and click the `Provide` button.

To provide your connector endpoint:

- Pass in the private key from your certificate
- Select the template `Connector Endpoint`
- Provide the endpoint to your connector. E.g. when your version is accessible at `http://example.com/.well-known/dspace-version` provide `example.com` as url

Click `Save` to add the information to the federated catalog.
