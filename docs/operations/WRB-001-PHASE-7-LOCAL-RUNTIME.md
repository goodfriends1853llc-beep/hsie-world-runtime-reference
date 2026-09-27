# WRB-001 — Phase 7 Local Runtime / Request / Event

**Status:** IMPLEMENTED / VALIDATION PENDING

## Purpose

Prove a local reference runtime path:

`Request → validation → local handler → Event → persistence`

without representing that path as MIA execution.

## Allowed Phase 7 operation

`RESOLVE_WORLD_ENTRY`

This is a read-only local reference query used only to prove the Request/Event runtime spine.

It is **not** the first governed business operation.

The first governed operation remains:

`ACTIVATE_BUSINESS_PLACE`

and Phase 7 explicitly rejects it.

## Persistence

Phase 7 uses separate local append-only NDJSON journals:

- `requests.ndjson`
- `events.ndjson`

This is a narrow reference persistence mechanism for the Phase 7 proof. It is not a production datastore and does not redefine any broader architecture storage choice.

## Retry behavior

The local runtime treats `request_id` as the retry identity for this reference proof:

- identical body + same request ID → return persisted Event without appending duplicates;
- different body + same request ID → reject as conflict.

This behavior is local-runtime engineering, not a new canonical identity law.

## Event integrity

The Event receives a SHA-256 integrity digest over its canonical representation with `integrity_digest = null` during digest calculation.

This is an integrity check, not a signature, notarization, MIA proof, or security certification.

## Hard boundaries

`REQUEST ≠ EVENT`

`LOCAL RUNTIME EVENT ≠ WORLD RUNTIME RECEIPT`

`LOCAL RUNTIME EVENT ≠ MIA EXECUTION RECEIPT`

No receipt is created in Phase 7.

No MIA adapter is called.

No `ACTIVATE_BUSINESS_PLACE` execution is permitted.
