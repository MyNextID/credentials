# Credential Repository

Welcome to a curated collection of standardized schemas, examples, and
documentation for verifiable credentials. Built to simplify credential issuance
and promote interoperability across learning and credentialing platforms.

## Why This Repository?

Finding well-documented, production-ready credential schemas and data models is
challenging. This repository provides:

- **Human-readable descriptions** of each credential type
- **JSON schemas** for validation and implementation
- **Real-world examples** in both unsigned and signed formats
- **API integration guides** for issuing credentials via Velocert (coming soon)
- **Translations** of credential fields, which provide human-readable titles in other languages
- **User-consent scopes** which provide human-readable titles and descriptions for end-user, to undestand what they are presenting

## Supported Standards

This table shows which verifiable credential profiles support each credential type.

| Credential Type                               | [edc](/_resources/documentation/profiles.md#edc-european-digital-credential-for-learning)   | [open-badge](/_resources/documentation/profiles.md#open-badge)  | [eaa](/_resources/documentation/profiles.md#eaa-electronic-attestation-of-attributes)   | [qeaa](/_resources/documentation/profiles.md#qeaa-qualified-electronic-attestation-of-attributes)  | [pub-eaa](/_resources/documentation/profiles.md#pub-eaa-public-body-electronic-attestation-of-attributes) | [iso-18013-5](/_resources/documentation/profiles.md#iso-18013-5)  | [eudi.av](/_resources/documentation/profiles.md#eudiav-eu-age-verification) | [eudi.pid](/_resources/documentation/profiles.md#eudipid-person-identification-data) |
|-----------------------------------------------|-----|------------|-----|------|---------|-------------|---------|----------|
| [age-verification](/age-verification)                         |     |            | 🟨 | 🟨 | 🟨 |     | ✅ |     |
| [certificate-of-advanced-study](/certificate-of-advanced-study/)                  | ✅  |            | 🟨 | 🟨 | 🟨 |     |     |     |
| [certificate-of-attendance](/certificate-of-attendance/)                       | ✅  |            | 🟨 | 🟨 | 🟨 |     |     |     |
| [certificate-of-participation-in-summer-school](/certificate-of-participation-in-summer-school/) | ✅  |            | 🟨 | 🟨 | 🟨 |     |     |     |
| [confirmation-of-enrolment](/confirmation-of-enrolment/)                       | ✅  |            | 🟨 | 🟨 | 🟨 |     |     |     |
| [degree-certificate](/degree-certificate/)                              | ✅  |            | 🟨 | 🟨 | 🟨 |     |     |     |
| [matriculation](/matriculation/)                                   | ✅  |            | 🟨 | 🟨 | 🟨 |     |     |     |
| [microcredential](/microcredential/)                                 | ✅  | ✅         | 🟨 | 🟨 | 🟨 |     |     |     |
| [mobile-drivers-licence](/mobile-drivers-licence/)                           |     |            | 🟨 | 🟨 | 🟨 | ✅  |     |     |
| [personal-id](/personal-id/)                                     |     |            | 🟨 | 🟨 | 🟨 | ✅  |     | ✅  |
| [student-id](/student-id/)                                      | ✅  |            | 🟨 | 🟨 | 🟨 |     |     |     |

**Legend:**  

- ✅ Already implemented in this repository
- 🟨 Supported in the ecosystem but not yet in this repository

## Education Credentials

### [Certificate of Attendance](certificate-of-attendance)

A certificate of attendance verifies that an individual participated in a
specific learning activity, event, workshop, or training session. Unlike
achievement-based credentials, it confirms presence and engagement rather than
mastery of content. Commonly used for professional development tracking,
continuing education requirements, and participation in conferences, seminars,
or short courses.

- **EDC**: [Schema](certificate-of-attendance/v1/edc/schema.json) |
   [Example](certificate-of-attendance/v1/edc/examples/edc-coa-example.json) | 
   [Signed](certificate-of-attendance/v1/edc/examples/edc-coa-signed.jsonld)

### [Certificate of Advanced Study](/certificate-of-advanced-study)

A certificate of advanced study recognises completion of specialised
postgraduate-level coursework in a specific field or discipline. Typically
offered by universities and professional institutions, it represents focused
study beyond a bachelor's degree but is less extensive than a full master's
program. Often pursued by professionals seeking expertise in a specialised area
without committing to a full graduate degree.

- **EDC**: [Schema](/certificate-of-advanced-study/v1/edc/schema.json) | 
  [Example](/certificate-of-advanced-study/v1/edc/examples/edc-cas-example.json) | 
  [Signed](/certificate-of-advanced-study/v1/edc/examples/edc-cas-signed.jsonld)

### [Certificate of Participation in Summer School](/certificate-of-participation-in-summer-school)

A certificate of participation in summer school documents successful completion of 
intensive short-term programs typically held during summer breaks. These programs 
may be academic (specialised coursework, research methods), professional 
(skills development, industry training), or experiential (cultural exchange, 
youth participation initiatives). They often include interdisciplinary approaches 
and international participants, and are commonly used to recognise engagement in supplementary learning and development opportunities outside regular academic or professional contexts.

- **EDC**: [Schema](/certificate-of-participation-in-summer-school/v1/edc/schema.json) | 
  [Example](/certificate-of-participation-in-summer-school/v1/edc/examples/edc-cps-example.json) | 
  [Signed](/certificate-of-participation-in-summer-school/v1/edc/examples/edc-cps-signed.jsonld)

### [Confirmation of Enrolment](/confirmation-of-enrolment)

A confirmation of enrolment is an official document verifying that a student is
currently registered in a specific educational program or institution. This
administrative credential is frequently required for visa applications,
scholarship eligibility, student discounts, loan applications, and insurance
purposes. It typically includes details such as enrollment status
(full-time/part-time), program of study, and expected completion date.

- **EDC**: [Schema](/confirmation-of-enrolment/v1/edc/schema.json) | 
  [Example](/confirmation-of-enrolment/v1/edc/examples/edc-coe-example.json) | 
  [Signed](/confirmation-of-enrolment/v1/edc/examples/edc-coe-signed.jsonld)

### [Degree Certificate](/degree-certificate)

A degree certificate is the formal academic credential awarded upon successful
completion of an undergraduate, graduate, or doctoral program. It represents the
highest level of educational achievement certification, documenting the
qualification level (bachelor's, master's, doctorate), field of study, honours or
distinctions, and conferring institution. Degree certificates are essential for
employment verification, further education applications, and professional
licensing.

- **EDC**: [Schema](/degree-certificate/v1/edc/schema.json) | 
  [Example](/degree-certificate/v1/edc/examples/edc-dc-example.json) | 
  [Signed](/degree-certificate/v1/edc/examples/edc-dc-signed.jsonld)

### [Matriculation](/matriculation)

A matriculation credential confirms formal admission and enrollment of a student
into an educational institution, marking their official entry into a degree
program or course of study. Historically significant in European higher
education systems, it establishes the student's membership in the academic
community and their right to pursue the specified qualification. This credential
is distinct from confirmation of enrollment as it represents the initial
acceptance and registration rather than ongoing status.

- **EDC**: [Schema](/matriculation/v1/edc/schema.json) | 
  [Example](/matriculation/v1/edc/examples/edc-mat-example.json) | 
  [Signed](/matriculation/v1/edc/examples/edc-mat-signed.jsonld)

### [Microcredential](/microcredential)

A microcredential certifies achievement of specific, defined learning outcomes, skills, 
or competencies through a focused learning experience. Typically requiring 10-200 hours 
of effort, these credentials are designed to be stackable, portable, and digitally verifiable. 
Unlike participation-based certificates, microcredentials are competency-based and 
require demonstrated achievement through assessment. They provide flexible pathways 
for professional development, reskilling, and specialised expertise, responding quickly 
to emerging skill demands while being recognised within established quality assurance 
frameworks such as the European Qualifications Framework.

- **EDC**: [Schema](/microcredential/v1/edc/schema.json) | 
  [Example](/microcredential/v1/edc/examples/edc-mc-example.json) | 
  [Signed](/microcredential/v1/edc/examples/edc-mc-signed.jsonld)
- **Open Badges**: [Schema](/microcredential/v1/open-badge/schema.json) | 
  [Example](/microcredential/v1/open-badge/examples/open-badge-mc-example.json) | 
  [Signed (JWT)](/microcredential/v1/open-badge/examples/open-badge-mc-signed.jwt)

## Personal Credentials

### [Age Verification Credential](/age-verification)

An age verification credential enables an individual to demonstrate that they meet a specific age threshold – for example, being 18 or over – without disclosing their full identity or exact date of birth.

It is implemented as a verifiable credential and relies on privacy-preserving mechanisms such as selective disclosure and zero-knowledge proofs (ZKPs) to confirm eligibility while minimising personal data exposure. This makes it suitable for accessing age-restricted services – online platforms, retail, gambling, alcohol – where only the age check is relevant and broader identity disclosure would be disproportionate.

- **ISO-18013-5**: [Schema](/age-verification/v1/iso-18013-5/mdoc/schema.json)
  
### [Mobile Driving Licence](/mobile-driving-licence)

A mobile driving licence (mDL) is a digital representation of a physical driving licence, securely stored and presented via a mobile device. It is standardised under ISO/IEC 18013-5 (proximity presentation) and ISO/IEC 18013-7 (online presentation), and is issued by the relevant national or regional licensing authority.

An mDL enables holders to prove both their driving entitlements and their identity in a wide range of scenarios — from roadside checks and car rental to age verification and online authentication.

- **ISO-18013-5**: [Schema](/mobile-driving-licence/v1/iso-18013-5/mdoc/schema.json)

### [Person Identification Data](/personal-id)

Person Identification Data (PID) is a structured set of personal attributes that uniquely identifies an individual within the European Digital Identity (EUDI) framework. It is issued by a Member State and constitutes the authoritative identity dataset from which other credentials and attestations can be derived and verified.

PID supports secure authentication and identification across public and private services, and serves as the foundational reference layer of the EUDI Wallet ecosystem. It is designed to be interoperable across Member States, enabling cross-border identity verification while complying with applicable data protection obligations under EU law.

- **ISO-18013-5**: [Schema](/personal-id/v2/iso-18013-5/mdoc/schema.json)
  
### [Student ID](/student-id)

A student ID credential confirms an individual's current enrollment or affiliation with an educational institution. It is issued as a verifiable credential within a digital identity system and typically attests to attributes such as the holder's name, institution, programme, enrolment status, and validity period.

It is commonly used to access campus services, academic resources, libraries, and student discounts – both on-site and online. As a verifiable credential, it supports selective disclosure, allowing students to share only the relevant attributes for a given context (for instance, confirming student status without revealing their home institution).


- **ISO-18013-5**: [Schema](/student-id/v1/edc/w3c-vc/schema.json)
  
## Standards and Compliance

- **EDC**: European Digital Credentials, a serialization of the [European Learning Model (ELM)](https://europass.europa.eu/en/european-learning-model-stakeholders) ontology
- **Open Badges 3.0**: Compliant with [IMS Global Open Badges specification](https://www.imsglobal.org/spec/ob/v3p0/)

## Roadmap

- [ ] Velocert API integration examples
- [ ] ISO 18013-5 mDoc/mDL credentials
- [ ] ETSI-compliant (Q)EAA credentials for EUDI Wallet
- [ ] Validation tools and libraries

## Contributing

We welcome contributions! Here's how you can help:

### Report Issues

Found a bug or have a suggestion? [Open an issue](https://github.com/MyNextID/credentials/issues/new) with:

- A clear description of the problem or proposal
- The relevant credential type and standard
- Expected vs. actual behavior (for bugs)
- Any additional context or examples that may help reproduce the issue

### Submit Credentials

To add a new credential type, please follow these steps:

1. Fork the repository
2. Create a new credential type directory following the established naming conventions.
3. Implement the required folder structure and files as described in the [credential-type-structure](_resources/documentation/credential-type-structure.md) documentation.
4. Add all required assets, including:
   - EDC schema
   - Example credential
   - Signed credential example
   - Input field definitions and mappings
   - Translations
   - User consent mappings

5. Add the required README files and ensure they follow the structure of existing credential documentation.
6. Validate your files to ensure schemas and examples are consistent.
7. Submit a **Pull Request** with a clear description of the credential and its intended use.

Before submitting your pull request, please review the [credential-type-structure](_resources/documentation/credential-type-structure.md) to ensure that your credential implementation follows the required structure and naming conventions.

## License

See [LICENSE](/LICENSE) for details.
