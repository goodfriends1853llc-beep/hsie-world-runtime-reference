# HSIE World Runtime Reference

**Identifier:** WRB-001  
**Status:** REFERENCE IMPLEMENTATION — ENGINEERING CANDIDATE  
**Production status:** NOT PRODUCTION

## Current cursor

- Phase 0 — PASS
- Phase 1 — PASS
- Phase 2 — PASS
- Phase 3 — PASS
- Phase 4 — IMPLEMENTED / VALIDATION PENDING
- Phase 5 — NOT STARTED

Architecture expansion remains on HOLD. Pass 10 remains unauthorized. MIA integration remains locked behind Phase 5.

## Phase 4 reconstruction

The client reconstruction now follows:

`World → Place → Space → Topology → Representation → Renderer Adapter → Pannellum`

Pannellum is isolated behind `client/src/pannellum-adapter.js`. Semantic movement is resolved through Topology before any visual scene transition.

The predecessor remains `BREVARD-COM-DEMO-001` at commit `29326120dffa33a94a9489ed41874ce9d5163328`.
