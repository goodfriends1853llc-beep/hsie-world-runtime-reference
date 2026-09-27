# WRB-001 — Phase 14 Independent Acceptance Protocol

**Artifact:** `WRB-001-PHASE-14-PROTOCOL-001`  
**Status:** **READY / EXTERNAL TESTER REQUIRED**

## Independence rule

The tester must be a human who did not build WRB-001 and who is not merely repeating the builder's or assistant's prior PASS statements.

The tester must record what they personally observe.

The builder may provide the URL, repository, frozen artifact, expected hashes, and instructions. The builder may not fill in the tester's results.

## Acceptance target

Public deployment:

`https://goodfriends1853llc-beep.github.io/hsie-world-runtime-reference/`

Exact deployed commit:

`5481662d40eba540584067c194bb022c4fd93d04`

Phase-13 closeout commit:

`cd01a2465f9d3cbd65d392918edbb30feb272ffc`

Semantic snapshot:

`snapshot:sha256:c0b8b8cf841c02112452a82ff256d9786f76a3f567a072ab4b4f37921d678991`

Frozen MIA artifact SHA-256:

`ac6fecd1458c8a6596ba5998ec63d461566196792d022b7d19db021b9d71405a`

## Lane A — Independent public experience

Use a device/browser not previously used by the builder for acceptance.

Record device, OS, browser, date/time, and URL.

The tester must personally verify:

1. public HTTPS URL loads;
2. Explore Brevard entry surface appears;
3. touch/pointer look works;
4. if testing on a compatible phone, motion permission and motion look work;
5. Street → Exterior;
6. Exterior → Interior;
7. Interior → Exterior;
8. Exterior → Street;
9. ABOUT displays business copy;
10. SERVICES displays Haircuts, Fades, Beard Trims, and Shaves;
11. BOOK reaches the external demo destination;
12. BOOK does not claim that a real appointment was completed;
13. no obvious broken asset or blocked return path prevents completion.

Lane A must be recorded as PASS, FAIL, or UNRESOLVED item-by-item.

## Lane B — Independent technical reproduction

This lane must be performed in a clean working directory or clean machine/VM.

### Public repository checks

Clone:

`goodfriends1853llc-beep/hsie-world-runtime-reference`

Checkout:

`cd01a2465f9d3cbd65d392918edbb30feb272ffc`

Run:

`npm run test:phase6`

`npm run test:phase7`

`npm run test:phase13`

Record exact stdout and exit codes.

### Frozen MIA custody

The owner must separately provide:

`MIA-RUNTIME-v1.0.0.zip`

The independent tester must calculate SHA-256 themselves.

Required exact result:

`ac6fecd1458c8a6596ba5998ec63d461566196792d022b7d19db021b9d71405a`

If it does not match, stop. Do not substitute GitHub `mia` HEAD.

Extract the ZIP into a clean directory.

From the extracted frozen runtime, run:

`python3 validate_release.py`

Record the result.

### Exact WRB-001 ↔ frozen-MIA checks

Set:

- `MIA_RUNTIME_HOME` = extracted frozen runtime directory
- `MIA_RUNTIME_ZIP` = exact frozen ZIP path

Then from the WRB-001 repository run:

`python tests/phase10/verify_port_with_frozen_mia.py`

`python tests/phase11/verify_activate_with_frozen_mia.py`

`python tests/phase12/verify_restart_with_frozen_mia.py`

The tester must record stdout, exit code, and any failure without editing the implementation to force a pass.

## Required evidence for full Phase 14 PASS

The independent tester must return:

- tester name or stable tester identifier;
- relationship to builder sufficient to establish independence;
- date/time;
- device/browser details for Lane A;
- Lane A itemized results;
- clean-environment description for Lane B;
- independently calculated frozen-MIA SHA-256;
- exact commands executed;
- stdout/stderr or captured result files;
- final tester statement: PASS, FAIL, or UNRESOLVED;
- tester signature/typed attestation that the results are their own observations.

Screenshots or screen recording are useful but do not replace the itemized record.

## Acceptance law

**Full Phase 14 PASS requires both Lane A and Lane B to pass.**

A Lane-A-only public experience PASS may be recorded as partial independent UX acceptance, but it is not full WRB-001 independent acceptance.

A failed or unresolved item remains part of history.

## Claim ceiling

Independent reproduction of these bounded tests would still not establish production security, distributed safety, live-provider validation, universal device compatibility, or field/business outcomes.
