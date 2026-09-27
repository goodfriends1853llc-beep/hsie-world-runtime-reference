# WRB-001 — Phase 13 Static Deployment

**Status:** DEPLOYMENT CANDIDATE / VERIFICATION PENDING

## Purpose

Formalize the public static WRB-001 reference surface that was first exposed for Phase 5 mobile regression.

Public URL:

`https://goodfriends1853llc-beep.github.io/hsie-world-runtime-reference/`

## Deployment class

`STATIC_REFERENCE_ONLY`

The public surface consists of static HTML/CSS/JavaScript and repository-hosted static reference data.

GitHub Pages is not a MIA host and is not a World Runtime service.

## Semantic binding

The static deployment identifies the Phase-6 semantic state:

`snapshot:sha256:c0b8b8cf841c02112452a82ff256d9786f76a3f567a072ab4b4f37921d678991`

Content digest:

`sha256:c0b8b8cf841c02112452a82ff256d9786f76a3f567a072ab4b4f37921d678991`

## Boundaries

The deployment manifest explicitly records:

- `static_reference_only = true`
- `mia_service_hosted = false`
- `world_runtime_service_hosted = false`
- `local_runtime_hosted = false`
- `dynamic_write_api_hosted = false`
- `production_ready = false`

The Python MIA adapter/runtime proof code present in the public source repository is source text only. GitHub Pages does not execute it.

## Acceptance rule

Phase 13 may PASS only after:

1. static-source verification passes for the deployment commit;
2. the GitHub Pages deployment workflow completes successfully for the exact Phase-13 deployment state;
3. the public URL remains the declared Pages surface.

Independent human acceptance belongs to Phase 14.
