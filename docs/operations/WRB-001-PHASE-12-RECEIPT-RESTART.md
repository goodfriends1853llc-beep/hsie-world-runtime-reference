# WRB-001 — Phase 12 Receipt / Restart Proof

**Status:** IMPLEMENTED / VALIDATION PENDING

## Purpose

Prove that the combined WRB-001 + frozen-MIA local activation path remains reconstructable after process restart while preserving receipt-class separation.

## World Runtime receipt

Phase 12 introduces a World-owned receipt with the normalized N-003 minimum:

- receipt_id
- receipt_class
- issuer_system
- request_ref
- execution_ref
- verification_state
- issued_at
- payload_ref
- integrity_ref
- verification_scope
- verified_by

The receipt also records evidence references to the MIA execution, MIA receipt, MIA proof, activation-state digest, and semantic snapshot.

Receipt class:

`WORLD_RUNTIME_RECEIPT`

Issuer:

`WRB-001-WORLD-RUNTIME`

Receipt ID namespace:

`world-receipt:...`

## Issuance gate

A World Runtime receipt may be issued only after:

- MIA receipt verification PASS;
- MIA proof verification PASS;
- activation-state readback verification PASS.

## Restart proof

The Phase 12 integration proof must:

1. execute `ACTIVATE_BUSINESS_PLACE`;
2. verify MIA receipt/proof;
3. issue and verify a World Runtime receipt;
4. close the MIA runtime;
5. restart from the same SQLite DB and derived registry;
6. re-register the same World-owned capability for the new process;
7. verify the original MIA receipt;
8. verify the original MIA proof;
9. replay the original MIA execution;
10. verify MIA store integrity;
11. confirm activation-state bytes/digest are unchanged;
12. reopen and verify the original World Runtime receipt;
13. confirm the provider recognizes the existing activation as unchanged.

## Hard distinction

`WORLD RUNTIME RECEIPT ≠ MIA EXECUTION RECEIPT`

The World receipt references the MIA receipt. It does not rename or replace it.

## Claim ceiling

This is a graceful local restart proof. It is not crash-atomicity, distributed recovery, failover, independent reproduction, or production durability certification.
