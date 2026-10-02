# FIND YOUR NORTH — concept freeze 1.0.0

Owner authorization: conversation of 2026-10-02, “let’s freeze that. I like that idea.” This freezes the accepted interaction below. It does not seal the departure artifact, record a departure or return, or alter TB-SUB-001 v1.0.0.

NORTH opens a reflection instead of requiring the NORTH film. Opening: “You found where I was going. Where are you going?” The visitor chooses what they want more of (Peace, Stability, Connection, Freedom, Purpose, or their own words), what pulls them away (Fear, Other people’s expectations, An old habit, Too many directions, I don’t know yet, or their own words), then one concrete next action and intended timing.

The saveable MY NORTH card repeats their choices without AI interpretation, diagnosis or inferred personality. Closing: “North is a direction. You still get to choose the next step.” They can return to the light. Answers exist only in page memory, with explicit local save/copy actions. They are never automatically submitted to the community wall.

The film is no longer a release dependency. The accepted destination is `north.html`. Changes to this concept require a named successor; ordinary defect repairs may preserve this version.

## Separately authorized addition: community wall 0.1.0

THE WALL is a separate circular shelter with a 360 viewing surface, optional phone motion, drag/keyboard controls, and an accessible list alternative. Visitors may explicitly publish a plain-text note of 3–240 characters, optionally categorized by direction. Eight real notes appear around each room page; More notes advances through the collection. No fabricated visitor notes are seeded.

Notes are anonymous to other visitors. Persistent shared data lives in the Site database. A random deletion capability stays in the posting browser; the server stores only its hash. Reporting hides a note locally, and three distinct daily network-source hashes hide it globally. This is a basic abuse control, not human moderation or proof of distinct people. Shared networks can share a rate limit. Basic link/contact/markup filtering is not a guarantee that personal information or harmful content cannot be posted. Hosting infrastructure can retain ordinary request logs; this is not a claim of untraceability.

Visitor contributions remain explicitly separate from Tommie’s authored work and the departure seal. File manifests cover the shipped wall code and backdrop, never mutable note records. Existing private access remains unchanged. Notes are shared among visitors who have access to this Site; opening access later is a separate audience decision.

## Implementation and operations

Source assets are now in `public/`; `npm run build` emits the Worker in `dist/server/index.js`. D1 schema is `db/schema.ts`; generated SQL is in `drizzle/`. The logical binding is DB, and WALL_HASH_SECRET is a runtime secret. Do not commit it. Generate schema changes with `npm run db:generate`; do not issue schema changes at request time. `npm run serve` previews only static UI, not the wall API.

Run `node tools/manifest.mjs public`, `npm test`, `npm run verify`, and `npm run build`. The final departure release still requires an actual owner-recorded departure and accepted review. Use `north.html` as its destination. Build a prepared release using `node tools/build-worker.mjs releases/v1.0.0`; community records remain outside the seal.

This addendum supersedes earlier film requirements and static-only/no-form implementation statements only within this scope. Earlier architecture documents are retained as historical decisions.
