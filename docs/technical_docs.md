# Health-X Portal

The Health-X Portal provides an UI to interact the Federated Catalog with some additional features like hosting DIDs and holding compliance VCs for self descriptions.

The Portal/Federated Catalog enable management of participants, service offerings and users in the dataspace.

## Participants

### Participant onboarding

To participate in a dataspace a Participant has to go through the following onboarding process:

```mermaid
sequenceDiagram
    actor P as Participant
    actor F as Federator
    Participant Portal
    Participant PDB as Portal-Database
    Participant Notary
    Participant COMP as Compliance
    Participant KEY as Keycloak
    Participant FC as Federated Catalog

    P->>Portal: VAT-ID and Participant information
    Portal->>Notary: VAT-ID
    Notary->>Portal: LRN VC
    Portal->>PDB: save request and LRN VC
    Portal->>P: LRN VC and unsigned Participant and unsigned TermsAndCond VC
    P->>P: sign unsigned VCs with private key
    P->>Portal: send VCs and certificate pem
    Portal->>PDB: host certificate as did:web
    Note right of Portal: Required for compliance call
    Portal->> COMP: validate VCs
    COMP->>Portal: Compliance VC
    Portal->>PDB: save ParticipantVCs and ComplianceVC
    Portal->>P: Compliance VC and Participant VP
    Note right of P: Waiting for approval from federator

    F->>Portal: Query Onboarding requests
    Portal->>F: Onboarding requrests
    F->>Portal: approve Request
    Portal->>Portal: sign ParticipantVP with Portal key
    Note right of Portal: The Participant VP is signed by the Portal because of <br> previous requirements. This can be changed in the future.
    Portal->>FC: post ParticipantVP
    Portal->>KEY: create Participant Admin User
    Portal->>PDB: delete request
    Portal->>F: Success
```

### Update Participant

```mermaid
sequenceDiagram
    actor P as Participant
    Participant Portal
    Participant PDB as Portal-Database
    Participant COMP as Compliance
    Participant KEY as Keycloak
    Participant FC as Federated Catalog

    P->>KEY: login
    KEY->>P: access token + refresh token
    P->>Portal: request Participant VP
    Portal->>P: return Participant VP
    P->>P: edit Participant VP
    P->>P: sign updated Participant VP with private key
    P->>Portal: post updated Participant VP
    Portal->>PDB: query Participant VCs
    PDB->>Portal: return VCs
    Portal->>Portal: combine Participant VCs with updated Participant VC into VP
    Portal->>COMP: post combined VP
    COMP->>Portal: return Compliance VC
    Portal->>FC: update Participant
    Portal->>PDB: update Compliance VC for Participant
    Portal->>P: Success
```

## Service Offerings

### Add Service Offering

```mermaid
sequenceDiagram
    actor P as Participant
    Participant Portal
    Participant PDB as Portal-Database
    Participant COMP as Compliance
    Participant KEY as Keycloak
    Participant FC as Federated Catalog

    P->>KEY: login
    KEY->>P: access token + refresh token
    P->>P: create Service Offering
    P->>P: sign Service Offering with private key
    P->>Portal: post VP
    Portal->>PDB: query Participant VCs
    PDB->>Portal: return VCs
    Portal->>COMP: post VCs with Service Offering VC
    COMP->>Portal: return Compliance VC
    Portal->>FC: post VP
    Portal->>PDB: save Compliance VC for SD
    Portal->>P: Success
```

### Update Service Offering

```mermaid
sequenceDiagram
    actor P as Participant
    Participant Portal
    Participant PDB as Portal-Database
    Participant COMP as Compliance
    Participant KEY as Keycloak
    Participant FC as Federated Catalog

    P->>KEY: login
    KEY->>P: access token + refresh token
    P->>Portal: request Service Offering
    Portal->>P: return Service Offering
    P->>P: edit Service Offering
    P->>P: sign updated Service Offering with private key
    P->>Portal: post updated VP
    Portal->>PDB: query Participant VCs
    PDB->>Portal: return Participant VCs
    Portal->>Portal: combine Participant VCs with Service Offering VC into VP
    Portal->>COMP: post combined VP
    COMP->>Portal: return Compliance VC
    Portal->>FC: verify updated VP
    Portal->>FC: fetch original VP
    FC->>Portal: hold original VP in memory for potential rollback
    Portal->>FC: post updated VP
    Portal->>PDB: save Compliance VC for updated VP
    Portal->>PDB: delete Compliance VC for original VP
    Portal->>P: Success
```

## Users

The portal provides a UI that directly reflects the user API of the Federated Catalog.

Each user is assigned to a role granting them specific access e.g. a user created via the onboarding process is a participant administrator. Further documentation can be found in the [Federated Catalog documentation](https://gaia-x.gitlab.io/data-infrastructure-federation-services/cat/architecture-document/architecture/catalogue-architecture.html#_authorization).
