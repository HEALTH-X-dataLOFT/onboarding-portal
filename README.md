# Health-X Portal

This is a portal to onboard dataspace participants and administrate entries in the federated catalog. Further documentation can be found [here](./docs/technical_docs.md).

## Local Setup

Run the docker compose setup from the federated catalog repo. Create a user in Keycloak for the realm `gaia-x` with the client role `Ro-MU-CA`.

Additionally create a `.env.local` file in the root directory of this repository with the following structure:

```bash
NEXT_PUBLIC_FEDERATED_CATALOG_URL="http://localhost:8081"
NEXTAUTH_URL="http://localhost:3000"

KEYCLOAK_ID=federated-catalogue
KEYCLOAK_SECRET=**********
KEYCLOAK_ISSUER=http://key-server:8080
KEYCLOAK_REALM=gaia-x
NEXTAUTH_SECRET=someSecret # replace

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/portal"

NOTARY_URLS="[{"url": "https://registrationnumber.notary.lab.gaia-x.eu/v1-staging/registrationNumberVC","issuer": "did:web:registration.lab.gaia-x.eu:v1-staging","label": "Gaia-X Staging Notary"}]"
COMPLIANCE_URLS=["https://compliance.lab.gaia-x.eu/v1-staging/api/credential-offers"]

PORTAL_BASE_URL="https://portal.my-url.com" # replace
PORTAL_CERT="-----BEGIN CERTIFICATE-----
... # replace
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
... # replace
-----END CERTIFICATE-----"
PORTAL_KEY="-----BEGIN RSA PRIVATE KEY-----
... # replace
-----END RSA PRIVATE KEY-----"
LETS_ENCRYPT_ROOT_CERTIFICATE="-----BEGIN CERTIFICATE-----
... # replace
-----END CERTIFICATE-----"
```

> [!NOTE]
> To be able to onboard participants locally, `PORTAL_KEY` needs to be the key of the DID corresponding to the `PORTAL_BASE_URL`. Also in a local dev setup only self-hosted DIDs are supported.

Before starting the development server, some additional code has to be generated. Run this once initially and after the `fc_openapi.yaml` or prisma schema changes:

```bash
npm run codegen
```

Additionally, the database needs to be initialized:

```bash
npm run migrate dev
```

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## About

The portal is a [Next.js](https://nextjs.org/docs) application using the [App Router](https://nextjs.org/docs/app/getting-started/project-structure).

To generate API typings and hook [Kubb](https://kubb.dev/) is utilized.

[Prisma](https://www.prisma.io/) is used as ORM.

## Deployment

The application is deployed by a [docker image](https://nextjs.org/docs/app/building-your-application/deploying#docker-image).
