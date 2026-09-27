# WRB-001 — Phase 6 Deterministic Publisher

**Status:** IMPLEMENTED / VALIDATION PENDING

## Pipeline

`source → contract validation → cross-record integrity → normalized semantic payload → canonical ordered JSON → SHA-256 content digest → snapshot/bootstrap metadata`

## Determinism rule

`content_digest` is calculated only from the canonical semantic payload.

The following are explicitly outside that digest:

- `generated_at`
- publisher run time
- Git commit used as execution provenance

Therefore:

> Same semantic source → same canonical semantic JSON → same content digest → same snapshot ID.

Changing semantic content must change the digest.

## Output

The publisher writes:

- `data/published/world.snapshot.json`
- `data/published/bootstrap.json`
- `data/published/semantic.canonical.json`

## Bootstrap minimum

The bootstrap records:

- world reference
- entry Place reference
- entry Space reference
- entry Representation reference
- snapshot ID
- content digest
- published content schema version

## Boundary

A deterministic snapshot is not a production deployment and is not a MIA receipt.

`WORLD SNAPSHOT ≠ WORLD RUNTIME RECEIPT ≠ MIA EXECUTION RECEIPT`
