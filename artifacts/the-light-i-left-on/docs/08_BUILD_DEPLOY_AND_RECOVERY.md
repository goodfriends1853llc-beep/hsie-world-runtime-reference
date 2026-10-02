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

