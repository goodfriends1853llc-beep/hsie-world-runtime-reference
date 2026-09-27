# Contract validation evidence

Phase 2 uses JSON Schema Draft 2020-12.

The committed positive and negative fixtures are evidence vectors for the seven contracts.

For Phase 2 acceptance, the schemas were checked with `python-jsonschema 4.26.0` using `Draft202012Validator.check_schema`, and each valid fixture was accepted while each corresponding fixture missing `schema_version` was rejected.

The intended TypeScript runtime validator remains JSON Schema + Ajv. Runtime integration is not part of Phase 2.
