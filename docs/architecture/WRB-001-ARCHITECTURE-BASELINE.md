# WRB-001 Architecture Baseline

**Implementation event:** `WRB-001`  
**Architecture source:** `Master Integration Candidate v0.9 — Pass 9 + N-001 / N-002 / N-003`  
**Canonical status:** `CANDIDATE / NOT YET CANONICAL`

This file identifies the architecture candidate against which WRB-001 is engineered. It does not freeze or canonize Pass 9.

## Normalized implementation rules

1. The initial contract set contains exactly seven top-level contracts:
   - World
   - Place
   - Business
   - Representation
   - Topology
   - Request
   - Event
2. `Space` remains a subordinate structure inside `Place` for Slice 001.
3. The first governed operation identifier is `ACTIVATE_BUSINESS_PLACE`.
4. `WORLD_RUNTIME_RECEIPT ≠ MIA_EXECUTION_RECEIPT`.
5. MIA integration must target the exact frozen runtime artifact, not repository HEAD.
6. MIA adapter work remains locked behind Phase 5 and frozen-artifact verification.
7. The predecessor POC remains separate evidence and must not be destructively rewritten.

## Engineering change control

If implementation discovers an architecture defect:

`IMPLEMENTATION FINDING → architecture impact?`

- **NO** → engineering correction.
- **YES** → architecture issue record; affected work pauses pending review.

Implementation convenience must not silently redefine architecture.
