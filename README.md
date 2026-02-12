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
- **API integration guides** for issuing credentials via VeloCert (coming soon)

## Supported Standards

| Standard                      | Version | Status      |
| ----------------------------- | ------- | ----------- |
| European Learning Model (ELM) | v3      | Available   |
| Open Badges (OB)              | v3      | Available   |
| ISO 18013-5 mDoc/mDL          | -       | Coming Soon |
| ETSI (Q)EAA (EUDI-compliant)  | -       | Coming Soon |

## Available Credentials

### Certificate of Attendance

A certificate of attendance verifies that an individual participated in a
specific learning activity, event, workshop, or training session. Unlike
achievement-based credentials, it confirms presence and engagement rather than
mastery of content. Commonly used for professional development tracking,
continuing education requirements, and participation in conferences, seminars,
or short courses.

- **ELMv3**: [Schema](https://github.com/MyNextID/credentials/blob/feat/readme/certificate-of-attendance/elm/elm-coa-schema.json) | [Example](https://github.com/MyNextID/credentials/blob/feat/readme/certificate-of-attendance/elm/elm-coa-example.json) | [Signed](https://github.com/MyNextID/credentials/blob/feat/readme/certificate-of-attendance/elm/elm-coa-signed.jsonld) | [Details](./certificate-of-attendance/README.md)

### Certificate of Advanced Study

A certificate of advanced study recognises completion of specialised
postgraduate-level coursework in a specific field or discipline. Typically
offered by universities and professional institutions, it represents focused
study beyond a bachelor's degree but is less extensive than a full master's
program. Often pursued by professionals seeking expertise in a specialised area
without committing to a full graduate degree.

- **ELMv3**: [Schema](https://github.com/MyNextID/credentials/blob/feat/readme/certificate-of-advanced-study/elm/elm-cas-schema.json) | [Example](https://github.com/MyNextID/credentials/blob/feat/readme/certificate-of-advanced-study/elm/elm-cas-example.json) | [Signed](https://github.com/MyNextID/credentials/blob/feat/readme/certificate-of-advanced-study/elm/elm-cas-signed.jsonld)

### Certificate of Participation in Summer School

A certificate of participation in summer school documents successful completion of 
intensive short-term programs typically held during summer breaks. These programs 
may be academic (specialised coursework, research methods), professional 
(skills development, industry training), or experiential (cultural exchange, 
youth participation initiatives). They often include interdisciplinary approaches 
and international participants, and are commonly used to recognise engagement in supplementary learning and development opportunities outside regular academic or professional contexts.

- **ELMv3**: [Schema](https://github.com/MyNextID/credentials/blob/feat/readme/certificate-of-participation-in-summer-school/elm/elm-cps-schema.json) | [Example](https://github.com/MyNextID/credentials/blob/feat/readme/certificate-of-participation-in-summer-school/elm/elm-cps-example.json) | [Signed](https://github.com/MyNextID/credentials/blob/feat/readme/certificate-of-participation-in-summer-school/elm/elm-cps-signed.jsonld)

### Confirmation of Enrolment

A confirmation of enrolment is an official document verifying that a student is
currently registered in a specific educational program or institution. This
administrative credential is frequently required for visa applications,
scholarship eligibility, student discounts, loan applications, and insurance
purposes. It typically includes details such as enrollment status
(full-time/part-time), program of study, and expected completion date.

- **ELMv3**: [Schema](https://github.com/MyNextID/credentials/blob/feat/readme/confirmation-of-enrolment/elm/elm-coe-schema.json) | [Example](https://github.com/MyNextID/credentials/blob/feat/readme/confirmation-of-enrolment/elm/elm-coe-example.json) | [Signed](https://github.com/MyNextID/credentials/blob/feat/readme/confirmation-of-enrolment/elm/elm-coe-signed.jsonld)

### Degree Certificate

A degree certificate is the formal academic credential awarded upon successful
completion of an undergraduate, graduate, or doctoral program. It represents the
highest level of educational achievement certification, documenting the
qualification level (bachelor's, master's, doctorate), field of study, honours or
distinctions, and conferring institution. Degree certificates are essential for
employment verification, further education applications, and professional
licensing.

- **ELMv3**: [Schema](https://github.com/MyNextID/credentials/blob/feat/readme/degree-certificate/elm/elm-dc-schema.json) | [Example](https://github.com/MyNextID/credentials/blob/feat/readme/degree-certificate/elm/elm-dc-example.json) | [Signed](https://github.com/MyNextID/credentials/blob/feat/readme/degree-certificate/elm/elm-dc-signed.jsonld)

### Matriculation

A matriculation credential confirms formal admission and enrollment of a student
into an educational institution, marking their official entry into a degree
program or course of study. Historically significant in European higher
education systems, it establishes the student's membership in the academic
community and their right to pursue the specified qualification. This credential
is distinct from confirmation of enrollment as it represents the initial
acceptance and registration rather than ongoing status.

- **ELMv3**: [Schema](https://github.com/MyNextID/credentials/blob/feat/readme/matriculation/elm/elm-matriculation-schema.json) | [Example](https://github.com/MyNextID/credentials/blob/feat/readme/matriculation/elm/elm-matriculation-example.json) | [Signed](https://github.com/MyNextID/credentials/blob/feat/readme/matriculation/elm/elm-matriculation-signed.jsonld)

### [Microcredential](/microcredential)

A microcredential certifies achievement of specific, defined learning outcomes, skills, 
or competencies through a focused learning experience. Typically requiring 10-200 hours 
of effort, these credentials are designed to be stackable, portable, and digitally verifiable. 
Unlike participation-based certificates, microcredentials are competency-based and 
require demonstrated achievement through assessment. They provide flexible pathways 
for professional development, reskilling, and specialised expertise, responding quickly 
to emerging skill demands while being recognised within established quality assurance 
frameworks such as the European Qualifications Framework.

- **ELMv3**: [Schema](https://github.com/MyNextID/credentials/blob/feat/readme/microcredential/elm/elm-mc-schema.json) | [Example](https://github.com/MyNextID/credentials/blob/feat/readme/microcredential/elm/elm-mc-example.json) | [Signed](https://github.com/MyNextID/credentials/blob/feat/readme/microcredential/elm/elm-mc-signed.jsonld)
- **Open Badges v3**: [Schema](https://github.com/MyNextID/credentials/blob/feat/readme/microcredential/open-badge/open-badge-mc-schema.json) | [Example](https://github.com/MyNextID/credentials/blob/feat/readme/microcredential/open-badge/open-badge-mc-example.json) | [Signed (JWT)](https://github.com/MyNextID/credentials/blob/feat/readme/microcredential/open-badge/open-badge-mc-signed.jwt)

## Standards and Compliance

- **ELM v3**: Aligned with European Commission's [European Learning Model specification](https://europass.europa.eu/en/european-learning-model-stakeholders)
- **Open Badges 3.0**: Compliant with [IMS Global Open Badges specification](https://www.imsglobal.org/spec/ob/v3p0/)

## Roadmap

- [ ] VeloCert API integration examples
- [ ] ISO 18013-5 mDoc/mDL credentials
- [ ] ETSI-compliant (Q)EAA credentials for EUDI Wallet
- [ ] Validation tools and libraries

## Contributing

We welcome contributions! Here's how you can help:

### Report Issues

Found a bug or have a suggestion? [Open an issue](https://github.com/mynextid/credential-repository/issues/new) with:

- Clear description of the problem or proposal
- Relevant credential type and standard
- Expected vs actual behavior (for bugs)

### Submit Credentials

To add a new credential type:

1. Fork the repository
2. Create a new directory following the naming convention
3. Add schema, example, and signed files
4. Update this README with links to your credential
5. Submit a pull request

## License

See [LICENSE](https://github.com/MyNextID/credentials/blob/feat/readme/LICENSE) for details.
