# WRB-001 — Phase 5 Mobile Regression Protocol

**Phase:** `WRB-001 / PHASE 5 — Mobile Regression Proof`  
**Status:** TEST PROTOCOL PREPARED / EXECUTION PENDING

## Required device evidence

Primary target:

- iPhone
- Safari
- public HTTPS origin
- physical device-orientation permission path

A desktop browser may be used for secondary checks, but it cannot substitute for iPhone motion evidence.

## Test matrix

Record PASS / FAIL / UNRESOLVED for each item:

1. Public HTTPS URL loads without developer tools or local server.
2. Entry overlay renders.
3. Touch mode can be selected.
4. Touch drag changes panorama view.
5. Motion permission prompt can be triggered on iPhone.
6. If permission is granted, physical phone movement changes panorama view.
7. Street → Lagoon Cuts exterior works.
8. Exterior → interior works.
9. Interior → exterior works.
10. Exterior → street works.
11. ABOUT opens structured public copy.
12. SERVICES opens structured service list.
13. BOOK activates the external demo route.
14. BOOK does not claim booking completion.
15. Scene/space label changes with navigation.
16. Escape/close behavior closes modal where applicable.
17. No visible navigation requires legacy `target_scene` data.
18. No regression blocks return to the starting Street location.

## Evidence capture

For each test run capture:

- device model
- OS version
- browser/version
- test URL
- tested commit/build ID
- local date/time
- each matrix result
- observed failure text
- screenshots or screen recording where useful

## Acceptance rule

Phase 5 may PASS only if all required predecessor behaviors intended to survive the migration pass on the target iPhone flow.

A structural code review does not substitute for physical motion testing.

## Claim ceiling

A passing Phase 5 test supports only the tested device/browser/build flow.

It does not establish production readiness, broad device compatibility, security certification, or scale.
