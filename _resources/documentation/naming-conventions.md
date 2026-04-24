# Naming Conventions

This document defines the naming rules used across the repository. It applies to all contributors and ensures that credential types, versions, and files remain consistent and predictable.

All naming conventions MUST be followed. Violations may result in PR rejection.

## Core Entities

- Credential Type (`<credential-type>`)
  - MUST be lowercase
  - MUST use hyphens (-) to separate words
  - MUST be descriptive and stable (must not change once introduced)
  - MUST always be written in full (no abbreviations or initials)
- Version (`<version>`)
  - MUST follow sequential versioning within the credential type (e.g., `v1`, `v2`, `v3`)
  - MUST NOT modify or delete existing versions (only add new ones)
- Profile (`<profile>`)
  - MUST be lowercase
  - MUST use hyphens for multi-word identifiers where applicable
  - MAY use dot notation (.) when defined by external standards (e.g., `eudi.av`)
  - MUST be a stable identifier (must not change once introduced)
  - Examples include: `edc`, `open-badge`, `eaa`, `qeaa`, `pub-eaa`, `iso-18013-5`, `eudi.av`, `eudi.pid`
- Format (`<format>`)
  - MUST be lowercase
  - MUST use hyphens for multi-word identifiers where applicable
  - Examples include: `w3c-vc`, `sd-jwt-vc`, `mdoc`

## Files

### Example files

Example files are located in the `examples/` directory and MUST follow this naming pattern:

- `<profile>-<credential-type>-example.json`
- `<profile>-<credential-type>-signed.jsonld`
  
### Translation files

- MUST use ISO 639-1 language codes (2-letter) (e.g., `en.json`, `de.json`, `fr.json`)
- MUST NOT use extended locale formats (e.g., `en-US.json`, `pt-BR.json`)
- `en.json` MUST always exist and defines the canonical key set

### Schema files

- Primary schema MUST be named `schema.json`
