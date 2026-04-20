# Verifiable Credential Profiles

A verifiable credential (VC) profile is a practical specification that defines how credentials are structured, secured, and exchanged within a specific ecosystem or use case. It defines constraints, extensions, and implementation guidelines to ensure consistency. It does not redefine the core VC data model; instead, it specifies the required options and parameters to ensure interoperability.

## Why Use Profiles?

Verifiable credentials are intentionally flexible, allowing multiple ways to represent, secure, and exchange data. While this flexibility is useful, it can also lead to incompatible implementations.

Profiles solve this by defining a consistent way to use the VC data model for a specific use case. They narrow down the available options by specifying required formats, parameters, and processes, so different systems can work together reliably. Without a profile, two systems might both follow the W3C Verifiable Credentials standard but still fail to interoperate.

Different ecosystems and use cases require different credential representations:

- Interoperability – Profiles like edc or open-badge align with specific ecosystems.
- Privacy – Formats like sd-jwt-vc support selective disclosure of claims.
- Device & transport constraints:
  - JSON works well for web and APIs
  - CBOR is better suited for mobile wallets, offline use, and NFC
- Multiple environments – Some profiles (e.g., eaa, qeaa) support multiple VC formats, allowing the same credential to be used across systems.

## Profile Overview

The table below shows which data models are supported by each profile.

- W3C VC – A standard JSON/JSON-LD format for verifiable credentials that represents claims about an entity and includes cryptographic proofs for authentication and integrity.
- SD-JWT VC – A JWT-based verifiable credential format that supports selective disclosure, letting holders reveal only specific claims while keeping others private.
- mDoc – A CBOR-based mobile document format defined by ISO/IEC 18013-5, designed for secure and privacy-preserving exchange of digital identity and credentials on mobile devices.

| Profile                                                               | W3C VC | SD-JWT VC | mDoc |
|-----------------------------------------------------------------------|--------|-----------|------|
| [edc](#edc-european-digital-credential-for-learning)                  | x      |           |      |
| [open-badge](#open-badge)                                             | x      |           |      |
| [eaa](#eaa-electronic-attestation-of-attributes)                      | x      | x         | x    |
| [qeaa](#qeaa-qualified-electronic-attestation-of-attributes)          | x      | x         | x    |
| [pub-eaa](#pub-eaa-public-body-electronic-attestation-of-attributes)  | x      | x         | x    |
| [iso-18013-5](#iso-18013-5)                                           |        |           | x    |
| [eudi.av](#eudiav-eu-age-verification)                                |        |           | x    |
| [eudi.pid](#eudipid-person-identification-data)                       |        | x         | x    |

## Supported Profiles

### EDC (European Digital Credential for Learning)

The European Digital Credential for Learning (EDC) is a verifiable, digitally signed credential used to represent learning achievements across formal and non-formal contexts. It supports multiple credential types (e.g., diplomas, certificates, micro-credentials), is multilingual and includes built-in verification to ensure authenticity and trust. EDCs are designed for easy sharing and interoperability across education and employment systems.

### Open Badge

Open Badges is a verifiable, digitally signed credential used to represent achievements, skills, and learning outcomes as digital badges. It supports a variety of recognition types, including course completions, certifications, and skill assertions, and includes metadata to describe the issuer, recipient, and evidence. Open Badges are designed for portability and interoperability, allowing recipients to securely share and verify their achievements across platforms and systems.

### EAA (Electronic Attestation of Attributes)

EAA is a verifiable credential profile representing one or more verified attributes about a person, such as age, permissions, qualifications, or other claims. Non-qualified EAAs are issued by standard service providers and do not offer the same legal assurance as QEAA credentials, but they are useful for cases where high-level trust is not required, including education, digital payments, and commercial services. EAA credentials include metadata and cryptographic proofs to ensure the attributes are valid and can be securely shared and verified across digital systems.

### QEAA (Qualified Electronic Attestation of Attributes)

QEAA is a high-assurance verifiable credential profile representing verified attributes about a person, issued exclusively by Qualified Trust Service Providers (QTSPs). QEAA credentials offer the highest level of trust and legal assurance in the EU, often used together with Personal Identification Data (e.g., name, date of birth) and cross-checked against authoritative sources such as government databases. Providers are continuously monitored and audited to ensure security and compliance, making QEAA ideal for use cases that require strong confidence in digital identity verification.

### PuB-EAA (Public Body Electronic Attestation of Attributes)

PuB‑EAA is a verifiable credential profile representing verified attributes issued on behalf of public authorities, based on official registries or government databases. These credentials hold legal equivalence to traditional paper documents and are suitable for public services such as birth certificates, driver’s licences, or professional qualifications. PuB‑EAA credentials are signed using certificates from Qualified Trust Service Providers, ensuring legal compliance and secure verification across digital systems.

### ISO 18013-5

ISO/IEC 18013‑5 is a verifiable credential–friendly international standard that defines how mobile driver’s licences (mDLs) and related identity credentials should be structured, secured, and exchanged on digital devices. It specifies data formats, security mechanisms, and communication protocols to ensure credentials can be authenticated and verified reliably while protecting user privacy. Designed for portability and interoperability across jurisdictions and systems, ISO/IEC 18013‑5 enables secure issuance, sharing, and verification of proof such as age or identity using a mobile device.

#### EUDI.AV (EU Age Verification)

EUDI.AV is a verifiable credential profile designed for standardized digital age verification across online services. It defines how age‑related claims should be structured, secured, and exchanged so that users can prove they meet specific age requirements (e.g., “over 18”) without disclosing additional personal data. Built on open standards and aligned with the evolving European digital identity ecosystem, EUDI.AV enables secure issuance, sharing, and verification of age attestations in a privacy‑preserving and interoperable way across different platforms and jurisdictions.

#### EUDI.PID (Person Identification Data)

EUDI.PID is a verifiable credential profile that represents core person identification attributes, such as full name, date of birth, nationality, and other identity details. It enables secure, digitally signed identification of a user for online services and compliance with EU digital identity requirements. EUDI.PID credentials are designed for interoperability and trusted exchange, allowing service providers to verify a user’s identity in a consistent and privacy‑preserving way across member states and platforms.
