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

| Standard                      | Version | Status      |
| ----------------------------- | ------- | ----------- |
| European Digital Credentials (EDC) | v3      | Available   |
| Open Badges (OB)              | v3      | Available   |
| ISO 18013-5 mDoc/mDL          | -       | Coming Soon |
| ETSI (Q)EAA (EUDI-compliant)  | -       | Coming Soon |

## Available Credentials

## Education Credentials
<table>
<tr>
<td width="50%" valign="top">

### [Certificate of Attendance](certificate-of-attendance)

A certificate of attendance verifies that an individual participated in a
specific learning activity, event, workshop, or training session. Unlike
achievement-based credentials, it confirms presence and engagement rather than
mastery of content. Commonly used for professional development tracking,
continuing education requirements, and participation in conferences, seminars,
or short courses.

- **EDC**: [Schema](certificate-of-attendance/edc/edc-coa-schema.json) |
   [Example](certificate-of-attendance/edc/edc-coa-example.json) | 
   [Signed](certificate-of-attendance/edc/edc-coa-signed.jsonld)

</td>

<td width="50%" valign="top">

### [Certificate of Advanced Study](/certificate-of-advanced-study)

A certificate of advanced study recognises completion of specialised
postgraduate-level coursework in a specific field or discipline. Typically
offered by universities and professional institutions, it represents focused
study beyond a bachelor's degree but is less extensive than a full master's
program. Often pursued by professionals seeking expertise in a specialised area
without committing to a full graduate degree.

- **EDC**: [Schema](/certificate-of-advanced-study/edc/edc-cas-schema.json) | 
  [Example](/certificate-of-advanced-study/edc/edc-cas-example.json) | 
  [Signed](/certificate-of-advanced-study/edc/edc-cas-signed.jsonld)

</td>
</tr>
</table>

<table>
<tr>
<td width="50%" valign="top">

### [Certificate of Participation in Summer School](/certificate-of-participation-in-summer-school)

A certificate of participation in summer school documents successful completion of 
intensive short-term programs typically held during summer breaks. These programs 
may be academic (specialised coursework, research methods), professional 
(skills development, industry training), or experiential (cultural exchange, 
youth participation initiatives). They often include interdisciplinary approaches 
and international participants, and are commonly used to recognise engagement in supplementary learning and development opportunities outside regular academic or professional contexts.

- **EDC**: [Schema](/certificate-of-participation-in-summer-school/edc/edc-cps-schema.json) | 
  [Example](/certificate-of-participation-in-summer-school/edc/edc-cps-example.json) | 
  [Signed](/certificate-of-participation-in-summer-school/edc/edc-cps-signed.jsonld)

</td>

<td width="50%" valign="top">
   
### [Confirmation of Enrolment](/confirmation-of-enrolment)

A confirmation of enrolment is an official document verifying that a student is
currently registered in a specific educational program or institution. This
administrative credential is frequently required for visa applications,
scholarship eligibility, student discounts, loan applications, and insurance
purposes. It typically includes details such as enrollment status
(full-time/part-time), program of study, and expected completion date.

- **EDC**: [Schema](/confirmation-of-enrolment/edc/edc-coe-schema.json) | 
  [Example](/confirmation-of-enrolment/edc/edc-coe-example.json) | 
  [Signed](/confirmation-of-enrolment/edc/edc-coe-signed.jsonld)
</td>
</tr>
</table>

<table>
<tr>
<td width="50%" valign="top">
   
### [Degree Certificate](/degree-certificate)

A degree certificate is the formal academic credential awarded upon successful
completion of an undergraduate, graduate, or doctoral program. It represents the
highest level of educational achievement certification, documenting the
qualification level (bachelor's, master's, doctorate), field of study, honours or
distinctions, and conferring institution. Degree certificates are essential for
employment verification, further education applications, and professional
licensing.

- **EDC**: [Schema](/degree-certificate/edc/edc-dc-schema.json) | 
  [Example](/degree-certificate/edc/edc-dc-example.json) | 
  [Signed](/degree-certificate/edc/edc-dc-signed.jsonld)
</td>

<td width="50%" valign="top">
   
### [Matriculation](/matriculation)

A matriculation credential confirms formal admission and enrollment of a student
into an educational institution, marking their official entry into a degree
program or course of study. Historically significant in European higher
education systems, it establishes the student's membership in the academic
community and their right to pursue the specified qualification. This credential
is distinct from confirmation of enrollment as it represents the initial
acceptance and registration rather than ongoing status.

- **EDC**: [Schema](/matriculation/edc/edc-matriculation-schema.json) | 
  [Example](/matriculation/edc/edc-matriculation-example.json) | 
  [Signed](/matriculation/edc/edc-matriculation-signed.jsonld)
</td>
</tr>
</table>


<table>
<tr>
<td width="50%" valign="top">
   
### [Microcredential](/microcredential)

A microcredential certifies achievement of specific, defined learning outcomes, skills, 
or competencies through a focused learning experience. Typically requiring 10-200 hours 
of effort, these credentials are designed to be stackable, portable, and digitally verifiable. 
Unlike participation-based certificates, microcredentials are competency-based and 
require demonstrated achievement through assessment. They provide flexible pathways 
for professional development, reskilling, and specialised expertise, responding quickly 
to emerging skill demands while being recognised within established quality assurance 
frameworks such as the European Qualifications Framework.

- **EDC**: [Schema](/microcredential/edc/edc-mc-schema.json) | 
  [Example](/microcredential/edc/edc-mc-example.json) | 
  [Signed](/microcredential/edc/edc-mc-signed.jsonld)
- **Open Badges**: [Schema](/microcredential/open-badge/open-badge-mc-schema.json) | 
  [Example](/microcredential/open-badge/open-badge-mc-example.json) | 
  [Signed (JWT)](/microcredential/open-badge/open-badge-mc-signed.jwt)
</td>
</tr>
</table>

## Personal Credentials (coming soon)

<table>
<tr>
<td width="33%" valign="top">
   
### Personal ID

</td>
<td width="33%" valign="top">
   
### Mobile Driving Licence (mDL)
</td>
<td width="33%" valign="top">
   
### Age Verification
</td>
</tr>
</table>



## Standards and Compliance

- **EDC**: European Digital Credentials, a serialization of the [European Learning Model (ELM)](https://europass.europa.eu/en/european-learning-model-stakeholders) ontology
- **Open Badges 3.0**: Compliant with [IMS Global Open Badges specification](https://www.imsglobal.org/spec/ob/v3p0/)

## Roadmap

- [ ] Velocert API integration examples
- [ ] ISO 18013-5 mDoc/mDL credentials
- [ ] ETSI-compliant (Q)EAA credentials for EUDI Wallet
- [ ] Validation tools and libraries

## How to Use This Repository

For presentation purposes, see [Presentation Use-Cases](_resources/documentation/presentation-use-case.md). This guide explains how to access translations for end-user consent screens, including titles and descriptors, and how to use the JSON files in the `_generated` folder to present credentials in a user-friendly way. It also describes how to retrieve credential schemas to verify received credentials for compliance with their schema.

For issuance purposes, see [Issuance Use-Cases](_resources/documentation/issuance-use-case.md). This guide shows how to obtain valid, interoperable schemas for supported credential types, access human-readable titles and descriptors for credentials and their fields, and use simplified input-fields structures for a more developer-friendly API when issuing credentials.

## Repository Structure

This repository is organized to separate credential definitions, generated data, and shared resources, making it easy to understand the role of each part of the project.

```text
/
├── _generated/
├── _resources/
├── <credential-type>/ 
├── <credential-type>/ 
├── ... (additional credential type folders)
└── README.md
```
The `_generated` folder contains JSON data from all credential types and user consent definitions, including input fields and claims with translations. The `credentials.json` file contains the aggregated data from all credential types, and the `credential-types.json` file lists all available credential types.

The `_resources` folder contains shared assets and documentation, including user consent group definitions, translations, and icons used across credential types.

Each `<credential-type>/` folder contains the full set of assets for that credential, including EDC schemas, examples, signed credentials, input fields, translations, user consent mappings, and a README describing the credential.

The root `README.md` provides an overview of the repository.

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
3. Implement the required folder structure and files as described in the [Credential Type Folder Structure](_resources/documentation/credential-type-folder-structure.md) documentation.
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

Before submitting your pull request, please review the [Credential Type Folder Structure](_resources/documentation/credential-type-folder-structure.md) to ensure that your credential implementation follows the required structure and naming conventions.

## License

See [LICENSE](/LICENSE) for details.
