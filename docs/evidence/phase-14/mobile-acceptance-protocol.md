# WRB-001 — Phase 14 Independent Mobile Experience Acceptance

**Artifact:** `WRB-001-PHASE-14-MOBILE-PROTOCOL-001`  
**Status:** **ACTIVE / EXTERNAL TESTER INVITED**

## What the tester gets

Only this public link:

`https://goodfriends1853llc-beep.github.io/hsie-world-runtime-reference/`

No GitHub access, runtime package, source code, or architecture files are required.

## What the tester does

On their own phone:

1. Open the link.
2. Confirm the 360 scene appears.
3. Drag with a finger and confirm the view moves.
4. If the phone supports it, enable motion look and confirm physical phone movement changes the view.
5. Move between the available scenes.
6. Move back and confirm they do not get stuck on a blank or broken scene.

## What the tester reports

A plain-language report is sufficient.

Example:

> Opened it on my phone. The 360 loaded, I could drag around, motion worked, I moved between the scenes and came back without anything breaking.

If something fails, the tester should say exactly what failed.

## Acceptance rule

All six required checks must be supported by the tester's own report for Phase 14 to PASS.

If motion is genuinely unsupported by the tester's device/browser, record that item as `NOT_SUPPORTED` rather than fabricating a PASS. The remaining mobile interaction checks must still work.

## Privacy / IP boundary

The tester is not asked to inspect:

- GitHub;
- MIA;
- World Runtime implementation;
- contracts;
- governance code;
- internal evidence;
- private architecture.

## Claim ceiling

A Phase-14 PASS means only:

> An external person who did not build WRB-001 successfully used the deployed 360 spatial experience on another phone within the recorded test scope.
