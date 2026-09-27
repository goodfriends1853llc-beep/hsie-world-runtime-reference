# WRB-001-IF-002 — Frozen MIA v1.0.0 Integration Surface Findings

**Status:** OPEN / PHASE-10-COMPATIBILITY-BOUNDARY IDENTIFIED  
**Architecture impact:** NO CURRENT ARCHITECTURE CHANGE REQUIRED  
**Frozen MIA modified:** NO

## A. Caller / Actor mismatch

The frozen runtime contract distinguishes Caller from Actor and lists `caller_id` in the minimum ExecutionRequest.

The frozen v1.0.0 implementation does not independently require or resolve `caller_id`.

A fresh probe without `caller_id` completed successfully.

**Phase 10 consequence:** the World-side port must require and preserve caller identity before invoking the frozen v1.0.0 facade.

## B. Runtime identity mismatch handling

The contract requires runtime identity to resolve.

The frozen implementation replaces the supplied `runtime_id` with its own runtime identity.

A fresh probe submitted `WRONG-RUNTIME-ID`; the persisted request contained `MIA-RUNTIME-v1` and execution completed.

**Phase 10 consequence:** the port must reject a runtime identity mismatch before calling MIA.

## C. Plural contract vs singular implementation

The contract describes:

- `requested_capabilities[]`
- `authority_refs[]`
- `consent_refs[]`

The v1.0.0 implementation consumes:

- `capability_id`
- `authority_id`
- `consent_id`

**Phase 10 consequence:** no silent flattening. The port must enforce current cardinality and map only:

- exactly one requested capability;
- exactly one authority reference;
- zero or one consent reference.

## D. ACTIVATE_BUSINESS_PLACE is not present

Default frozen registry capabilities:

- `local.core`
- `model.sim.a`
- `model.sim.b`

Default provider operations:

- `local.core`: `echo`, `accept_claim`, `state_patch`
- simulated model providers: `analyze`

Fresh probes established:

1. `ACTIVATE_BUSINESS_PLACE` through `local.core` → **FAILED**: unsupported local operation.
2. `ACTIVATE_BUSINESS_PLACE` through an unregistered capability → **DENIED** by registry preflight.

Both failure paths produced MIA receipts that verified successfully.

## Extension points actually present

The frozen runtime exposes:

`CapabilityGateway.register(contract, provider)`

and accepts a `registry_path` when constructing `MIARuntime`.

Capability registration is not exposed through the consumer-facing `MIAAPI` facade.

No extension has been implemented in Phase 9.

## Disposition

These findings do not require an architecture rewrite.

They require a bounded compatibility port in Phase 10 and an explicitly governed capability/registry integration strategy before Phase 11 may execute `ACTIVATE_BUSINESS_PLACE`.

The frozen v1.0.0 artifact remains unchanged.
