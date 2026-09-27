# WRB-001 — Phase 11 ACTIVATE_BUSINESS_PLACE

**Status:** IMPLEMENTED / VALIDATION PENDING

## Operation

`ACTIVATE_BUSINESS_PLACE`

This phase introduces one bounded local reference capability:

`world.business.activation`

Provider:

`wrb001.business.activation.local`

Determinism class:

`DETERMINISTIC`

Side-effect class:

`WRITE`

## Frozen MIA boundary

The frozen MIA source package is not modified.

Phase 11 supplies:

1. an external derived runtime registry with the additional governed capability;
2. a World-owned capability provider registered through the frozen runtime's existing `CapabilityGateway.register` extension point;
3. a Phase-11 port policy permitting this specific non-human business-subject operation to run with `requires_consent=false` while still requiring scoped authority.

The derived registry is separate from the frozen registry file.

## Preconditions enforced by the capability

Before writing activation state, the provider verifies:

- the requested Phase-6 semantic snapshot identity matches current migrated source;
- Business exists;
- Business is `CANDIDATE`;
- Place exists;
- Place is `ACTIVE`;
- Place is `PUBLIC`;
- Business references the target Place;
- Business provenance contains source system/schema/commit;
- target Place has Representation references;
- every referenced Representation exists;
- each Representation targets the expected Place;
- each Representation has an integrity digest.

## Effect

The provider writes a local reference activation state record keyed by Business + Place.

The write is atomic and immediately read back.

The provider returns `verification_state = VERIFIED` only if the readback equals the intended activation record.

This is a bounded local file effect for WRB-001 proof. It is not a production business registry.

## Consent boundary

The MIA subject is a non-human Business entity created for the proof.

The operation uses `requires_consent=false` only because the Phase-11 port is explicitly configured to permit that named operation without human-consent semantics.

Authority is still mandatory and scoped to the Business subject.

This exception is operation-scoped, not a general consent bypass.

## Receipt boundary

Successful execution may produce a genuine frozen-MIA receipt/proof reference.

No World Runtime receipt is created in Phase 11.

`MIA EXECUTION RECEIPT ≠ WORLD RUNTIME RECEIPT`
