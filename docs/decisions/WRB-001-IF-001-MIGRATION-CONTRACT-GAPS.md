# WRB-001-IF-001 — Phase 3 Migration Contract Gaps

**Status:** OPEN IMPLEMENTATION FINDING  
**Discovered in:** WRB-001 Phase 3  
**Architecture expansion:** NOT REQUESTED  
**Phase 4:** BLOCKED UNTIL CRITICAL GAPS ARE NORMALIZED

## Finding

The Phase 2 contracts can represent the predecessor's core World, Place, Space, Business, Representation identity, Topology, Services, and external BOOK route.

They cannot completely represent the predecessor behavior needed for Phase 4 reconstruction.

The exhaustive migration source map covers **110 leaf fields**:

- MIGRATED: 47
- DERIVED: 12
- DEPRECATED: 5
- UNRESOLVED: 46

Nothing has been silently dropped. The original `world.json` is also preserved under `data/source/BREVARD-COM-DEMO-001/world.json`.

## Critical gaps

### 1. Representation presentation metadata

The current Representation contract cannot encode:

- `coverage`
- `aspect_ratio`
- initial `pitch`
- initial `yaw`
- initial `hfov`
- `north_offset`

These are required to reproduce the accepted Pannellum view behavior accurately.

### 2. Interaction-anchor metadata

The current contracts cannot encode the renderer-neutral presentation of a hotspot/interaction:

- legacy interaction ID for ABOUT/SERVICES
- label
- pitch
- yaw
- reference from a visible interaction anchor to a Topology connection or external/content action

Topology correctly owns movement semantics, but it does not own hotspot placement.

### 3. Structured public business copy

The Business contract currently has no place for:

- predecessor business purpose
- ABOUT body
- service-group display title

Phase 4 must not recover those by silently reading the legacy file as if it were canonical Business state.

## Noncritical unresolved items

- `Melbourne District` has no registered District Entity/reference in Slice 001.
- the predecessor BOOK `demo: true` flag has no field in External Action.

These can remain unresolved without blocking the three-scene reconstruction if their limitations are disclosed.

## Candidate normalization path

The cleanest correction appears to preserve the **seven top-level contracts** while extending existing contracts rather than inventing an eighth civilization domain:

1. Representation receives optional presentation metadata for initial view, coverage/aspect ratio, and interaction anchors.
2. Interaction anchors reference existing Topology connection IDs or Business external/content targets; the anchor does not become authority.
3. Business receives a structured public-profile/about container.
4. District remains nullable until a real District reference exists.
5. Demo/test classification for an external action is represented explicitly or retained as provenance.

This would be a reference-contract normalization, not Pass 10.

No such schema change has been made by this commit.

## Control result

Phase 3 has produced a valid partial migration and exhaustive source map, but **Phase 4 is not authorized yet** because behaviorally critical predecessor data remains unresolved.
