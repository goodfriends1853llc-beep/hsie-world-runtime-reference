# WRB-001 — Phase 10 MiaExecutionPort

**Status:** IMPLEMENTED / VALIDATION PENDING

## Purpose

Provide a bounded compatibility boundary between WRB-001 and the exact frozen MIA Runtime v1.0.0 implementation.

The port does **not** modify frozen MIA.

## Input contract

The port accepts the canonical governed-request fields required by the frozen MIA contract representation, including:

- request identity;
- runtime identity;
- caller;
- actor;
- subject;
- purpose;
- scope;
- requested effect;
- evidence references;
- authority references;
- consent references;
- requested capabilities;
- policy context;
- provider request;
- event/submission time;
- trace identity.

## Compatibility enforcement

Before calling frozen v1.0.0, the port:

1. requires `caller_id`;
2. requires request `runtime_id == MIA-RUNTIME-v1`;
3. verifies the connected MIA health surface reports the same runtime ID;
4. requires exactly one authority reference;
5. requires exactly one requested capability;
6. requires exactly one consent reference for subject-scoped operations;
7. rejects caller-supplied nonempty policy context because v1.0.0 would not consume it;
8. rejects explicit requested-provider selection because v1.0.0 binds provider through capability registration;
9. blocks `ACTIVATE_BUSINESS_PLACE` in Phase 10.

Only after these checks does it add the v1.0.0 singular compatibility aliases:

- `capability_id`
- `authority_id`
- `consent_id`

The canonical plural fields remain in the same request object so the frozen runtime persists them in its ExecutionRequest record.

## Receipt boundary

The port returns:

`mia_receipt_ref`

and:

`mia_proof_ref`

when supplied by frozen MIA.

It does not create a World Runtime receipt.

`MIA RECEIPT REF ≠ WORLD RUNTIME RECEIPT`

## Phase boundary

Phase 10 does not implement or execute `ACTIVATE_BUSINESS_PLACE`.

Operation-specific capability/registry integration remains Phase 11.
