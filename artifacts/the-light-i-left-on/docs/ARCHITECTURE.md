# THE LIGHT I LEFT ON — Complete Architecture

# TLILO-ARCH-000

THE LIGHT I LEFT ON · TLILO-001

Version: 0.1.0 · Status: IMPLEMENTATION DRAFT / NOT OWNER-FROZEN

Created: 2026-10-02T13:06:53Z

Foundation: TB-SUB-001 v1.0.0, unchanged. Reality ≠ Representation.

## Purpose and authority
Tommie Bellamy leaves one explorable artifact influenced by Brevard County. Its seven pre-authored states represent a twelve-calendar-month artistic progression. The artifact contains no live author messages, generative narration, inferred personal status, or automatic return claim.

The supplied concept authorizes implementation. It does not establish a canonical freeze of these new implementation decisions. Architecture version 0.1.0 remains reviewable. The target departure release is 1.0.0, established only by a completed release record.

## Scope
Includes entry, spherical exploration, empty chair, departing footprints, north portal, discovery plate, light-to-dawn progression, ambient sound, seal, manifest, review surface, deterministic state selection, release preparation, validation, recovery and successor procedure. Excludes commercial onboarding, world civic infrastructure, biographies, contact forms, profiles, social feeds, fundraising, AI-generated messages and monitoring the human.

Explore Brevard production requirements and demo canon are outside this artifact's authority. No existing world or substrate files are changed. Source is stored on a separate branch and under a new artifact directory because the connected GitHub tool cannot create a new repository.

## Source of truth
1. Owner instruction and canonical TB-SUB source within its scope.
2. Explicit owner decisions for this artifact.
3. Identified release configuration, assets, manifest and commit.
4. These subordinate design records.
5. Summaries and memory.

No diagram, field or label alone establishes enforcement or truth. The runtime implements temporal selection and release precondition checks; it does not implement the complete TB-SUB substrate, MIA execution, administrative immutability or human authentication.

## Current decisions and unresolved facts
| Item | Disposition | Basis |
|---|---|---|
| Title and concept | Authorized for execution | Current owner request and supplied conversation |
| Seven visual phases | Implemented draft | Supplied concept |
| Offsets 0,2,4,6,8,10,12 months | Implementation choice | Evenly spaces seven phases over calendar year |
| UTC anniversaries | Implementation choice | Avoids timezone-dependent phase boundaries |
| Actual departure timestamp | UNRECORDED | Owner has not supplied actual event |
| Finished NORTH destination | AWAITING_ASSET | No verified file/link retrieved |
| Return event | UNRECORDED | Never inferred from clock |
| Visual/mobile acceptance | OPEN | Requires review of concrete build |
| Public departure publication | OPEN | Working build published privately first |
| Independent timestamp anchor | OPEN | No external anchor fabricated |

## Change control
Draft edits preserve version history. A SEALED release is never overwritten by the release-preparation tool. After seal, alterations require an explicit successor, rationale, authority, linked predecessor, fresh hashes, validation and publication receipt. A maintenance correction does not become evidence of human return. Keep historical failures and limitations.



---

# TLILO-ARCH-001

THE LIGHT I LEFT ON · TLILO-001

Version: 0.1.0 · Status: IMPLEMENTATION DRAFT / NOT OWNER-FROZEN

Created: 2026-10-02T13:06:53Z

Foundation: TB-SUB-001 v1.0.0, unchanged. Reality ≠ Representation.

## Spatial design
One fixed observation point on a fictional lagoon-edge construction apron. Lagoon lies to the east; a low barrier landform and Atlantic horizon may be suggested beyond it. A causeway belongs to the southern view. Weathered concrete and reclamation occupy the west; incomplete structure and ordered materials occupy the east. These are artistic geography, not mapped Brevard facts.

North is the artwork's authored direction (yaw zero), not the visitor's geographic north or device compass. No location, orientation or motion permission is requested. The empty chair occupies foreground below the horizon, facing the north shelter. Footprints leave the chair. No likeness or person is shown in any phase.

## Entry and discovery
Black opening, Brevard County / October 2026, “I left the light on.” and ENTER. Entry reveals the image with no navigation bar or explanatory marketing. Dragging or keyboard rotation discovers NORTH near the shelter. Looking down discovers the plate: “YOU WERE NEVER SUPPOSED TO FOLLOW ME.” / “Find your north.” SEAL is always reachable after entry.

The NORTH hotspot is an exact overlay tied to panorama coordinates. A project QA task calibrates its final position against the generated shelter; model-generated visual north must not be assumed exact. The plate is an interface overlay projected into the scene, not evidence of a photographed physical object.

## Visual thesis
Poetic photographic realism; salt, concrete, black water, subdued green, one cold electrical light. A restrained serif opening and administrative seal. The initial view looks away from north so discovery involves movement. Generated assets are fictional images; no claims of documentary capture or engineering simulation.

## Language budget
Public language: title; Brevard County / October 2026; I left the light on; NORTH; SEAL; discovery plate; THE CYCLE IS COMPLETE in final phase. Seal technical disclosures and accessibility labels are separate functional language. No biographies, marketing or other outbound destinations.

## Light and motion
Artificial lamp persists through month ten. At DAWN the scene has sunrise from the east and lamp off. A visitor present when the final boundary is crossed sees a brief darkness then dawn, unless reduced motion is requested. A visitor entering later sees dawn directly; this avoids replaying a fake historical event. There is no countdown and no assertion that sunrise means human return.

## Sound
Optional locally synthesized wind texture and quiet electrical hum, activated only by a sound button. No autoplay, speech or AI runtime. The sound is artistic approximation, not recorded Brevard ambience. Muting is immediate. No third-party audio provider or recurring cost.



---

# TLILO-ARCH-002

THE LIGHT I LEFT ON · TLILO-001

Version: 0.1.0 · Status: IMPLEMENTATION DRAFT / NOT OWNER-FROZEN

Created: 2026-10-02T13:06:53Z

Foundation: TB-SUB-001 v1.0.0, unchanged. Reality ≠ Representation.

| ID | Requirement | Implementation / evidence | Release criterion |
|---|---|---|---|
| R01 | Preserve exactly three substrate primitives | 03 data model; canonical source unchanged | No fourth primitive introduced |
| R02 | No inferred personal activity | release.json realityStatus | UNKNOWN beyond records |
| R03 | Unrecorded departure cannot progress | state.js; automated test | Remains STATE-00 |
| R04 | Seven states across twelve months | release.json; boundary tests | Seven assets and offsets |
| R05 | Exact boundary behavior | anniversary; automated tests | New phase at boundary |
| R06 | Calendar month and leap handling | month-end tests | UTC clamp |
| R07 | Return separate from cycle | validateRelease; automated tests | returnEvent null |
| R08 | Chair empty in every phase | Asset review | Owner visual acceptance |
| R09 | Landmark continuity | Asset review | Shelter/coast/chair consistent |
| R10 | True full sphere 2:1 | viewer checks dimensions | Seam/poles visually acceptable |
| R11 | NORTH only outbound destination | app.js / NORTH config | Real verified film/artifact |
| R12 | Discoverable north | Projected hotspot; keyboard N | Mobile and keyboard review |
| R13 | Hidden plate | Projected overlay | Discoverable below |
| R14 | No countdown | Public index | No return date claim |
| R15 | Dawn, lamp off, new path | STATE-06 art | Visual acceptance |
| R16 | Seal reports actual status | app.js fields | Candidate not falsely sealed |
| R17 | Hash verification | manifest.mjs, verify.mjs, browser verifier | Byte checks PASS |
| R18 | Independent evidence ceiling | Seal copy; provenance spec | No hash-as-timestamp claim |
| R19 | No external runtime requests | Static local assets | No tracking/CDN dependencies |
| R20 | No personal data intake | No forms/cookies/analytics | Hosting caveat explicit |
| R21 | Touch and keyboard | viewer.js / dialog HTML | Device review |
| R22 | Reduced motion | CSS and dawn transition guard | No forced fade |
| R23 | WebGL fallback | app.js / fallback image | Image and actions accessible |
| R24 | Network/asset failure | Error status, no fabricated phase | Failure visible |
| R25 | Clock provenance | device clock label | Unverified basis retained |
| R26 | No admin editing from browser | No write endpoint | Static-only package |
| R27 | Review separate from sealed release | prepare-release removes review.html | No review controls sealed |
| R28 | Prevent overwrite of existing release | prepare-release output guard | Explicit successor required |
| R29 | Record authority and provenance | Owner release record | Owner report retained |
| R30 | Restore exact bytes | Manifest verify plus recovery runbook | Recovery receipt |
| R31 | Source and production distinct | Commit / deploy receipts | Exact build identified |
| R32 | No promise of permanent hosting | Operations limitations | No uptime guarantee |

Automated tests prove bounded local behavior with synthetic records. They are not external certification, production browser evidence, owner event confirmation or proof of all TB-SUB conformance.



---

# TLILO-ARCH-003

THE LIGHT I LEFT ON · TLILO-001

Version: 0.1.0 · Status: IMPLEMENTATION DRAFT / NOT OWNER-FROZEN

Created: 2026-10-02T13:06:53Z

Foundation: TB-SUB-001 v1.0.0, unchanged. Reality ≠ Representation.

## Entity
TLILO-001 identifies the artifact. Other entities: owner record, release version, panorama asset, NORTH artifact, manifest, source commit, hosting deployment, validation report, evidence anchor. A derived temporal phase is a represented state of the artifact; it is not another foundational primitive.

## Event
Design creation; owner visual acceptance; NORTH attachment and verification; owner-confirmed departure; release sealing; source commit; publication attempt; verified publication; receipt retention; maintenance incident; successor authorization; owner-confirmed return. Scheduled phase boundaries describe authored rendering behavior. Browser evaluation does not create a real-world event record.

## Relationship
OWNER authors ARTIFACT; RELEASE version-of ARTIFACT; RELEASE uses ASSET; MANIFEST describes RELEASE bytes; COMMIT contains source; DEPLOYMENT serves RELEASE; VALIDATION assesses identified baseline; ANCHOR retains manifest digest; SUCCESSOR supersedes RELEASE; NORTH link references NORTH artifact.

## Record envelope
Every authoritative project record should retain record ID/type/version, created/recorded timestamps, entity/event references, actor and authority scope, inputs/outputs, predecessor/successor references, source/provenance, status, uncertainty, evidence ceiling and reconstructable baseline. Occurred-at and recorded-at remain distinct.

## Authority
Only owner authorization may record departure, visual acceptance or return. Local administrator credentials grant capability to publish; they do not semantically establish those facts. The preparation tool validates record fields but cannot authenticate who entered them. Stronger authentication is outside this static artifact scope.

No generated scene establishes that construction, nature reclamation or sunrise actually occurred at a real location. No absence of updates proves absence from the internet. No stored return representation is created automatically.



---

# TLILO-ARCH-004

THE LIGHT I LEFT ON · TLILO-001

Version: 0.1.0 · Status: IMPLEMENTATION DRAFT / NOT OWNER-FROZEN

Created: 2026-10-02T13:06:53Z

Foundation: TB-SUB-001 v1.0.0, unchanged. Reality ≠ Representation.

## Schedule
| State | Name | Inclusive lower bound | Upper bound |
|---|---|---|---|
| STATE-00 | DEPARTURE | Departure | Month 2 |
| STATE-01 | TRACE | Month 2 | Month 4 |
| STATE-02 | WEATHERING | Month 4 | Month 6 |
| STATE-03 | RECLAMATION | Month 6 | Month 8 |
| STATE-04 | FOUNDATION | Month 8 | Month 10 |
| STATE-05 | RECONSTRUCTION | Month 10 | Month 12 |
| STATE-06 | DAWN | Month 12 | Unbounded |

Start is a recorded owner-confirmed actual departure timestamp in UTC. It is presently null. Months are UTC calendar anniversaries retaining time of day and clamping to the destination month's final day. They are not fixed 30-day periods. Offsets are an implementation draft choice, not retroactively declared owner canon.

## Function
validate(config) → evaluate(config, deviceTime) → select asset → project view → expose current represented state. Missing record returns STATE-00/UNSTARTED. Clock before departure returns STATE-00/BEFORE_DEPARTURE. Invalid clock is bounded. After twelve months DAWN persists indefinitely. Completion never changes returnEvent.

Evaluation runs on load, once per minute and on becoming visible. It skips intermediate phases if a visitor returns after a long absence. No scheduled external updates, automation, server cron or monthly author work. A hidden browser tab may pause timers; visible-page re-evaluation corrects its displayed phase.

## Clock ceiling
Device time is user-controlled and unverified. A visitor may see a different phase with a mis-set clock. Clock rollback may display an earlier phase; this is render recalculation, not rewritten history. There is no trusted global consensus clock. Adding one would introduce a dependency and require a separately authorized successor design.

Review.html deliberately exposes all phases for review. Production query parameters cannot override the phase. Once sealed, review.html is removed. Future asset bytes still remain technically discoverable in a static release; mystery is an artistic interface choice, not confidentiality.



---

# TLILO-ARCH-005

THE LIGHT I LEFT ON · TLILO-001

Version: 0.1.0 · Status: IMPLEMENTATION DRAFT / NOT OWNER-FROZEN

Created: 2026-10-02T13:06:53Z

Foundation: TB-SUB-001 v1.0.0, unchanged. Reality ≠ Representation.

## Asset set
Each phase is a separate generated raster texture derived from one base view. Preserve camera, horizon, topography, chair identity/position, shelter identity/position, causeway and north-bearing. Change only weathering, vegetation, trace visibility, ordered construction materials and light state. No humans or new occupied chair.

| Phase | Required changes |
|---|---|
| Departure | Fresh footprints, disturbed earth, lamp on |
| Trace | First plants in prints; lamp on |
| Weathering | Rain, salt, rust, debris; lamp on |
| Reclamation | Nature dominates, path fades; lamp on |
| Foundation | Survey stakes/lines, ordered stacks amid growth |
| Reconstruction | Steel, scaffold, visible unfinished routing |
| Dawn | Sunrise east, lamp off, old prints gone, new north path |

Preferred production resolution is 8192×4096 where genuinely available. Working built-in outputs may be lower resolution. Store observed dimensions and generation provenance; never call an upscaled file native 8K. Current viewer uploads textures supported by device MAX_TEXTURE_SIZE; output selection must account for mobile capability. A future high-resolution upgrade needs mobile derivatives.

## Visual acceptance protocol
Inspect each full panorama; compare matched shelter/chair/causeway locations; inspect left/right seam and zenith/nadir; compare every transition; assess chair count and occupancy; confirm Dawn lamp off; calibrate NORTH overlay. Review on actual iPhone 14 and desktop, including drag, portrait/landscape, pinch alternative controls, keyboard, dialogs, sound and loading.

Two-to-one dimensions alone do not prove valid spherical projection, seamless wrapping, pole quality, photorealism or stable geometry. Model edits may drift; retain uncertainty and request corrections only for observed defects. Formal acceptance remains OPEN until the owner reviews the concrete sequence. No generation is represented as documentary evidence.



---

# TLILO-ARCH-006

THE LIGHT I LEFT ON · TLILO-001

Version: 0.1.0 · Status: IMPLEMENTATION DRAFT / NOT OWNER-FROZEN

Created: 2026-10-02T13:06:53Z

Foundation: TB-SUB-001 v1.0.0, unchanged. Reality ≠ Representation.

## Meaning of seal
SEALED means the identified release was assembled under the project's freeze policy. It does not make a static host, Git branch, tag or Drive file technically impossible to alter. Administrative access remains a capability to mutate or delete. The release tool prevents local output overwrite, but administrators can bypass local tools.

## Release sequence
1. Finish and verify NORTH; prefer bundled media when size allows, otherwise retain the exact HTTPS destination and verification basis. External content may later change or disappear.
2. Owner accepts visual sequence and mobile interaction. Retain source record and actual times.
3. Owner supplies actual departure event. No invented timestamp; future travel plans are not departed status.
4. Prepare fresh releases/v1.0.0, removing review controls; validate it; generate SHA-256 manifest.
5. Commit this exact source/release and record actual commit SHA. A manifest cannot sensibly embed its own containing commit; retain that binding in an external receipt.
6. Publish exact prepared bytes. Retain returned deployment/version/time/audience, not a guessed URL.
7. Retain manifest digest and release ZIP in Drive plus Git source. Optionally obtain a signed tag/release and independent timestamp/archive evidence if supported.
8. Verify published release identity and retain receipt. Public access is a distinct disposition from private working-build publication.

## Hash design
Manifest lists paths, exact byte sizes and SHA-256 for all deployed files except manifest.json itself. Self-exclusion avoids a recursive hash. Candidate review files are hashed; sealed release excludes them. An external receipt hashes the manifest itself and records source/deployment identifiers.

## Evidence levels
| Evidence | Establishes | Does not establish |
|---|---|---|
| File hashes | Consistency with expected bytes | Creation time or authorship |
| Git commit | Identified source tree/history reference | Unalterable repository or absence of later work |
| Drive copy | Retained account-controlled bytes | Independent timestamp authority |
| Hosting receipt | Identified deployment/status from provider | Permanent uptime or no admin mutation |
| Signature | Association with a signing key | Human identity without verified key binding |
| Independent anchor | Digest existed no later than verified anchor evidence | Every later visitor saw those bytes |

No available mechanism proves Tommie was silent elsewhere online. The defensible narrower claim is that a particular future behavior was already encoded in the identified release. External timestamp/signature tasks remain OPEN; do not fabricate them.



---

# TLILO-ARCH-007

THE LIGHT I LEFT ON · TLILO-001

Version: 0.1.0 · Status: IMPLEMENTATION DRAFT / NOT OWNER-FROZEN

Created: 2026-10-02T13:06:53Z

Foundation: TB-SUB-001 v1.0.0, unchanged. Reality ≠ Representation.

## Boundaries
Static browser runtime, local image/media/code requests, no database, no server write endpoint, no AI credentials, no analytics scripts, no forms, no geolocation and no device compass. NORTH is the only configured outbound destination. Seal manifest download remains local.

Drive records and Git publication never contain keys, credentials, private memory, housemates, recovery details or unrelated architecture. Source sync tokens are session-only. Published GitHub source is public within the repository's existing visibility, so only this artifact's intended public material belongs there.

## Threats and controls
Clock tampering: exposed unverified basis. Modified manifest plus content: independent anchor required; local verification cannot solve it. Host compromise: compare against retained expected digest and deploy exact known bytes. External NORTH substitution: bundle where possible; otherwise retain destination identity and verification ceiling. Missing asset: display error, preserve prior scene when possible. Shader failure/context loss: flat source image and available discovery actions. Corrupt release config: reject and display failure. Unsafe NORTH URI: validation restricts to HTTPS or exact bundled path.

No untrusted fetched text is injected as HTML. Seal fields use textContent. Manifest verifier rejects unsafe paths and limits number of files. No browsing or downloaded instructions may authorize owner events or change governance.

## Accessibility
Canvas supports arrows, N for north, D for plate direction, plus/minus zoom; touch drag and wheel zoom; visible focus; semantic buttons; native dialogs and Escape behavior; readable seal text; reduced-motion handling; user-initiated audio and video; screen-reader labels for canvas and actions. Generated panorama itself has limited semantic detail, so full nonvisual equivalence is not asserted. Actual device/screen-reader review remains necessary; no WCAG certification claim.

Host infrastructure may retain logs under provider policy. “No app analytics” does not mean no provider logs. The application adds no tracking/cookies; account gate/hosting behavior is separate.



---

# TLILO-ARCH-008

THE LIGHT I LEFT ON · TLILO-001

Version: 0.1.0 · Status: IMPLEMENTATION DRAFT / NOT OWNER-FROZEN

Created: 2026-10-02T13:06:53Z

Foundation: TB-SUB-001 v1.0.0, unchanged. Reality ≠ Representation.

## Source and dependencies
Plain HTML/CSS/JavaScript and generated JPEG assets. Runtime has no npm packages, CDNs, database or ongoing AI calls. Build/check tooling uses Node 24 and Python for asset encoding; these are development dependencies, not visitor requirements. Sites owns private working-build hosting and its own source repository. GitHub retains a separate artifact branch/path for user-accessible source.

## Local commands
From the project directory:

```sh
node --test tests/*.test.mjs
node tools/manifest.mjs dist
node tools/verify.mjs dist
python3 -m http.server 8080 --directory dist
```

For Windows CMD with Node and Python installed:

```bat
cd /d C:\Users\goodf\Desktop\HSIE_WORK\the-light-i-left-on
node --test tests/state.test.mjs
node tools/manifest.mjs dist
node tools/verify.mjs dist
python -m http.server 8080 --directory dist
```

Preview locally at the server address printed by Python. Current working publication is private. Private sharing requires changing actual hosting access; sharing a URL does not itself grant public access.

## Owner release record
Copy evidence/OWNER_RELEASE_RECORD_TEMPLATE.json and fill facts only after the actual event/reviews. Then run:

```sh
node tools/prepare-release.mjs /absolute/path/to/owner-record.json
```

The tool validates fields but does not authenticate the author. It refuses a future departure and refuses overwriting an existing output. It creates a distinct prepared release directory; it does not silently publish or change the hosted candidate.

## Recovery
Retrieve exact committed source or retained ZIP; compare expected manifest digest with retained external receipt; run verify against recovered release; deploy without editing any bytes; retain new hosting receipt as recovery event. Same-content rehosting is an infrastructure event, not an artistic successor or return. When bytes must change, retain original and issue a successor with rationale. Backup presence alone is not proof of successful restoration.

No guarantee of twelve-month uptime or permanently free hosting. Static operation removes recurring application work; provider/account/domain availability still matters. Do not purchase or claim ownership of a custom domain implicitly.



---

# TLILO-ARCH-009

THE LIGHT I LEFT ON · TLILO-001

Version: 0.1.0 · Status: IMPLEMENTATION DRAFT / NOT OWNER-FROZEN

Created: 2026-10-02T13:06:53Z

Foundation: TB-SUB-001 v1.0.0, unchanged. Reality ≠ Representation.

| Gate | Condition | Current disposition |
|---|---|---|
| G1 Scope and architecture | Concept translated without altering TB-SUB | Implementation draft ready |
| G2 Runtime | Boundaries, uncertainty, return separation | Local synthetic tests PASS |
| G3 Assets | Seven scene files complete and continuous | Working assets; formal acceptance OPEN |
| G4 NORTH | Finished verified media/link | BLOCKED: awaiting asset |
| G5 Device acceptance | iPhone/desktop interaction review | OPEN |
| G6 Departure record | Actual owner-confirmed event | BLOCKED: unrecorded |
| G7 Seal/package | New version, hashes, no review controls | Tool built; departure release NOT sealed |
| G8 Public publication | Correct audience, exact release, receipt | Private candidate first |
| G9 External evidence | Retained digest + independent anchor where available | OPEN |

Local test fixture departure dates are synthetic. They must never be copied into authoritative departure records. PASS describes the tests that ran, not complete production qualification. Generated scenes are reviewed visually for working quality but owner acceptance is separate. Browser/display verification limitations remain explicit.

A privately hosted candidate is useful and reviewable despite release-blocking facts. It cannot truthfully be called v1.0.0 DEPARTURE SEALED. No milestone auto-promotes the architecture to canonical status.



---

# TLILO-ARCH-010

THE LIGHT I LEFT ON · TLILO-001

Version: 0.1.0 · Status: IMPLEMENTATION DRAFT / NOT OWNER-FROZEN

Created: 2026-10-02T13:06:53Z

Foundation: TB-SUB-001 v1.0.0, unchanged. Reality ≠ Representation.

Twelve months completion updates represented phase only. Chair remains empty. Return remains UNRECORDED.

A real return requires an explicit owner record identifying what happened, occurred-at, recorded-at, authority, scope, provenance and uncertainty. Returning to public communication, physical return to Brevard, and changing a website are different events; do not conflate them.

Only after the relevant real-world return is recorded may a new authorized artistic release represent occupancy. Preserve v1.0.0 and its evidence. A candidate v2.0.0 identifies predecessor, change rationale, actual return record, approved chair representation, new manifest, source commit, validation and publication receipt. No image-generation likeness of Tommie may be invented without controlling reference material and authorization.

A broken link repair, hosting migration, security fix or visual correction may require a successor without asserting return. Record why it changed. Keep the twelve-month behavioral specification available for reconstruction. No false claim of twelve months untouched after a content-changing successor.



---

# TLILO-ARCH-011

THE LIGHT I LEFT ON · TLILO-001

Version: 0.1.0 · Status: IMPLEMENTATION DRAFT / NOT OWNER-FROZEN

Created: 2026-10-02T13:06:53Z

Foundation: TB-SUB-001 v1.0.0, unchanged. Reality ≠ Representation.

## What exists
Seven phase schedule, spherical WebGL viewer, touch/keyboard controls, entry, projected NORTH portal and discovery plate, optional ambience, seal with in-browser hash verification, isolated review page, state tests, manifest generator, package verifier, non-overwriting departure-release preparer, architecture records and account storage.

## Facts still needed
The actual owner-confirmed departure timestamp; finished NORTH file or exact HTTPS destination; acceptance of the concrete visual sequence and device behavior. These are evidence inputs, not more architecture brainstorming. The build keeps them explicit rather than inventing them.

## Review in order
Open working artifact and enter. Rotate toward north; inspect lamp and chair. Look down at plate. Open SEAL and verify files. Open review.html to inspect all seven phases. Confirm Dawn remains empty and never says returned. Review on iPhone and desktop. Attach NORTH. Record actual departure when it occurs. Prepare, verify and publish the distinct final release.

## Operating cost
No recurring application service, AI inference, database or paid asset generation call is introduced by this code. No purchase was made. Hosting remains subject to provider availability and access policy; an external domain or hosting plan would be a separate owner decision.

## Authorship and epistemic ceiling
Tommie owns the concept and authority. This assistant implemented the draft. File checks and synthetic tests are local engineering evidence. Scene interpretation, generated geography and scheduled narrative remain representations. Administrative labels are not security enforcement, and this artifact is not a full TB-SUB or MIA implementation.

