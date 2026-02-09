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

A certificate of advanced study recognizes completion of specialized
postgraduate-level coursework in a specific field or discipline. Typically
offered by universities and professional institutions, it represents focused
study beyond a bachelor's degree but is less extensive than a full master's
program. Often pursued by professionals seeking expertise in a specialized area
without committing to a full graduate degree.

- **ELMv3**: [Schema](certificate-of-advanced-study/elm/elm-cas-schema.json) | [Example](certificate-of-advanced-study/elm/elm-cas-example.json) | [Signed](certificate-of-advanced-study/elm/elm-cas-signed.jsonld)

### Certificate of Participation in Summer School

A certificate of participation in summer school documents successful completion
of intensive short-term academic programs typically held during summer breaks.
These programs often focus on specialized topics, research methods, or
interdisciplinary studies, and may include international students and faculty.
Commonly used in higher education to recognize engagement in supplementary
learning opportunities outside regular academic terms.

- **ELMv3**: [Schema](certificate-of-participation-in-summer-school/elm/elm-cps-schema.json) | [Example](certificate-of-participation-in-summer-school/elm/elm-cps-example.json) | [Signed](certificate-of-participation-in-summer-school/elm/elm-cps-signed.jsonld)

### Confirmation of Enrolment

A confirmation of enrolment is an official document verifying that a student is
currently registered in a specific educational program or institution. This
administrative credential is frequently required for visa applications,
scholarship eligibility, student discounts, loan applications, and insurance
purposes. It typically includes details such as enrollment status
(full-time/part-time), program of study, and expected completion date.

- **ELMv3**: [Schema](confirmation-of-enrolment/elm/elm-coe-schema.json) | [Example](confirmation-of-enrolment/elm/elm-coe-example.json) | [Signed](confirmation-of-enrolment/elm/elm-coe-signed.jsonld)

### Degree Certificate

A degree certificate is the formal academic credential awarded upon successful
completion of an undergraduate, graduate, or doctoral program. It represents the
highest level of educational achievement certification, documenting the
qualification level (bachelor's, master's, doctorate), field of study, honors or
distinctions, and conferring institution. Degree certificates are essential for
employment verification, further education applications, and professional
licensing.

- **ELMv3**: [Schema](degree-certificate/elm/elm-dc-schema.json) | [Example](degree-certificate/elm/elm-dc-example.json) | [Signed](degree-certificate/elm/elm-dc-signed.jsonld)

### Matriculation

A matriculation credential confirms formal admission and enrollment of a student
into an educational institution, marking their official entry into a degree
program or course of study. Historically significant in European higher
education systems, it establishes the student's membership in the academic
community and their right to pursue the specified qualification. This credential
is distinct from confirmation of enrollment as it represents the initial
acceptance and registration rather than ongoing status.

- **ELMv3**: [Schema](matriculation/elm/elm-matriculation-schema.json) | [Example](matriculation/elm/elm-matriculation-example.json) | [Signed](matriculation/elm/elm-matriculation-signed.jsonld)

### Microcredential

A microcredential certifies achievement of specific skills, competencies, or
learning outcomes in a focused subject area. These short-form credentials are
designed to be stackable, portable, and aligned with industry needs, making them
valuable for continuous professional development and career advancement.
Microcredentials typically require less time investment than traditional
qualifications while providing verifiable proof of targeted expertise in areas
such as digital skills, professional competencies, or specialized knowledge.

- **ELMv3**: [Schema](microcredential/elm/elm-mc-schema.json) | [Example](microcredential/elm/elm-mc-example.json) | [Signed](microcredential/elm/elm-mc-signed.jsonld)
- **Open Badges v3**: [Schema](microcredential/open-badge/open-badge-mc-schema.json) | [Example](microcredential/open-badge/open-badge-mc-example.json) | [Signed (JWT)](microcredential/open-badge/open-badge-mc-signed.jwt)

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

See [LICENSE](LICENSE) for details.
