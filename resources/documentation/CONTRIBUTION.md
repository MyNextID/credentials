# Contribution Guidelines

Welcome to the repository! We appreciate contributions that help improve and maintain the credential type system. Please follow the guidelines below to ensure your changes are consistent, clear, and easy to review.

## How to Contribute

Before opening a pull request (PR), please review the following guidelines. They help keep contributions consistent and easy to review. Refer to the [Naming Conventions](./naming-conventions.md) for all naming-related rules.

### Steps to contribute

1. **Fork the repository**: Create a personal fork of the repository to make your changes.
2. **Clone your fork**: Clone the forked repository to your local machine using: `git clone <your-fork-url>`
3. **Make your changes**: Edit the necessary files and follow the structure and guidelines.
4. **Push your changes**: Once your changes are ready, push them to your fork: `git push origin <branch-name>`
5. **Create a pull request (PR)**: Open a PR against the main repository:
   - If your work is still in progress, mark the PR as a **draft** and request feedback.
   - If your work is complete, submit the PR for review.
   - Ensure your PR description clearly explains the changes and references any relevant issues or discussions.
6. **Review and address feedback**: Make adjustments as requested by reviewers.

>Always keep your fork up to date with the main repository to avoid conflicts.

>For larger changes, feel free to open a draft PR early to get feedback on your approach before finishing your work.
  
## PR Requirements

Before submitting a PR, ensure all of the following requirements are met:

### General

- Changes follow the defined folder structure (see [Credential Type Folder Structure](./credential-type-structure.md)).
- All files defined in the structure must be present unless explicitly marked as optional.
- Do not delete or modify existing versions unless fixing a confirmed bug or critical issue.

### Validation

All contributions must pass automated validation checks enforced by CI. Contributors are encouraged to validate changes locally when possible.

- All JSON files must be syntactically valid.
- All schema definitions must be valid and pass schema validation.
- All example files must conform to their corresponding schema definitions.
- Schema validation must pass for all defined inputs and mapped structures.

Any violations will result in CI failure and may lead to PR rejection.

### New Credential Types

When adding a new credential type, ensure the following structure and files are created according to the repository specification:

- Create a new `<credential-type>/` directory following the [Naming Conventions](./naming-conventions.md).
- Include at least one version folder (e.g. `v1`).
- Implement the required folder structure within each version (e.g. `input-fields/`, `translations/`, `<profile>/`, `user-consent`, etc.).
- Update the main repository documentation [README.md](../../README.md) to include the new credential type, including:
  - Its placement in the appropriate section (e.g. [Education Credentials](../../README.md#education-credentials) or [Personal Credentials](../../README.md#personal-credentials))
  - Links to its schema and example files (if available)
- Ensure the [supported standards table](../../README.md#supported-standards) in the main documentation is updated to reflect the new credential type and its capabilities. Contributors are expected to include this update in their PR. Maintainers will review and adjust if needed.

### New Versions

When adding a new version of an existing credential type:

- Create a new `<version>/` folder (e.g. `v2`).
- Do not modify or remove previous versions.
- Ensure the new version is fully self-contained and follows the defined folder structure.

The version `README.md` must:

- Clearly describe the main changes compared to the previous version

If the new version introduces a new profile or changes supported capabilities, the main repository documentation [README.md](../../README.md) must also be updated (including the [supported standards table](../../README.md#supported-standards) and relevant sections/links).
Contributors are expected to include these updates in their PR. Maintainers will review and adjust if needed.

### Profiles / Formats

Each profile contains one or more format directories. Each format directory must include the following files:

- `schema.json`
- `input-fields-to-credential-map.json`
- `examples/` (including valid example files and documentation where applicable)
- `README.md`

These files are mandatory and are validated automatically. Missing or invalid files will result in CI failure and PR rejection.

Additional requirements:

- All examples must be valid and conform to the defined schema.
- The `examples/` folder must include representative and correctly structured sample outputs.

If a new profile is introduced:

- the main repository documentation [README.md](../../README.md) MUST be updated (relevant links/sections).
- This includes updates to the [supported standards table](../../README.md#supported-standards).

### Translations

Translations are used across multiple parts of the system, including credential versions, user consent resources, and input fields. All translation sets MUST follow the same rules.

The following rules apply to every translations directory in the repository (e.g., `<credential-type><version>/translations/`, `<credential-type><version>/input-fields/translations/` or `resources/user-consent/translations`):

- `en.json` MUST always be present and serves as the source of truth for all translation keys.
- All other language files must contain the same keys as en.json.
- Translation keys must remain consistent across all languages.

The `en.json` file:

- Defines the canonical set of keys.
- MUST NOT be modified unless fixing a confirmed bug or inconsistency.

### User Consent

User consent is defined through a strict mapping between input fields and predefined consent groups:

- All input fields defined for a credential must be mapped in `<credential-type><version>/user-consent/user-consent-map.json`.
- Each mapped value must reference an existing consent group defined in `resources/user-consent/consent-groups.json`.
- Only consent groups defined in `resources/user-consent/consent-groups.json` are allowed.

## PR Checklist

Before submitting your PR, confirm:

### Structure & Naming

- [ ] Structure follows specification
- [ ] Naming conventions are respected ([Naming Conventions](./naming-conventions.md))

### Validation Summary

- [ ] JSON files are syntactically valid
- [ ] Schemas are valid (validated via CI)
- [ ] Examples conform to schema
- [ ] Translations are complete and consistent
- [ ] User consent mappings are complete

### Documentation

- [ ] Relevant documentation is updated (README, schemas, tables, or other affected docs)
- [ ] All links are correct and working

## Commit Messages

Commit messages must be clear, concise, and follow the conventional commit format:

### Format

```bash
<type>: <subject>
<body>
```

### Rules

- Type is required (feat, fix, docs, update, etc.).
- Subject must be imperative and concise (≤72 characters).
- Body is optional and used for additional context.

### Examples

- `feat: add new credential type for certificate-of-attendance`
- `fix: correct schema validation issue`
- `docs: update README instructions`
- `update: adjust example files to match schema`

## Issue Reporting Guidelines

Please follow the dedicated guidelines:
[Issue Reporting Guidelines](./issue-reporting.md)

## Thank You for Your Contribution

We appreciate your contributions to this repository. Following these guidelines will make the process smoother and help keep the repository consistent and high-quality. If you have questions, please reach out to the maintainers.
