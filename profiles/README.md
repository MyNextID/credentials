# Profiles

Files shared by every credential type of a profile and format. The [CEL mapping](../specifications/cel-mapping.md) runner reads them from `profiles/<profile>/<format>/`.

```text
profiles/<profile>/<format>/
  ├── base-map.json                 CEL map applied before the type's own map
  ├── examples/issuance-meta.json   default `meta` for testing
  ├── linked-data.json              optional: JSON-LD contexts, and SHACL shapes, to validate against
  ├── rulebook.json                 optional: EUDI rulebook elements or claims (generated)
  ├── contexts/                     vendored JSON-LD contexts
  └── shacl/                        vendored SHACL shapes
```

## edc/w3c-vc

Europass Digital Credentials (European Learning Model, ELM 3). Validation runs offline against vendored copies:

| File | Source | License |
|---|---|---|
| `contexts/edc-ap.jsonld` | `http://data.europa.eu/snb/model/context/edc-ap`, the context EDCs reference (release 20230928-0) | CC BY 4.0 |
| `contexts/credentials-v1.jsonld` | `https://www.w3.org/2018/credentials/v1` | W3C Software and Document License |
| `shacl/EDC-generic-full.ttl` | [European-Learning-Model](https://github.com/european-commission-empl/European-Learning-Model) `rdf/ap/edc/`, commit `9d7c5d2` | CC BY 4.0 |
| `shacl/EDC-generic-no-cv.ttl` | same, imported by `EDC-generic-full.ttl` | CC BY 4.0 |

`EDC-generic-full` is the shape set named in every EDC's `credentialSchema`.

## open-badge/w3c-vc

Open Badges 3.0. Each format folder's JSON Schema is the official 1EdTech `ob_v3p0_achievementcredential_schema.json`. The credential is also expanded as JSON-LD with vendored contexts, so fields the contexts don't define are reported; there are no SHACL shapes.

| File | Source | License |
|---|---|---|
| `contexts/credentials-v2.jsonld` | `https://www.w3.org/ns/credentials/v2` | W3C Software and Document License |
| `contexts/ob-context-3.0.3.jsonld` | `https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json` | 1EdTech |

## eudi.pid/mdoc, eudi.pid/sd-jwt-vc, eudi.av/mdoc

`rulebook.json` is generated from the EUDI rulebooks by `npm run build-rulebooks`. See [EUDI rulebooks](../specifications/cel-mapping.md#eudi-rulebooks).

## eaa/sd-jwt-vc

Electronic Attestations of Attributes as SD-JWT VC. The base map only sets `iss` from `meta.issuer`. Each format folder's JSON Schema is checked, and its `type-metadata.json` must have the same `vct` and describe every claim. The issuer adds `iat`, `nbf`, `exp`, `cnf` and `status` and the selective-disclosure encoding when it signs.
