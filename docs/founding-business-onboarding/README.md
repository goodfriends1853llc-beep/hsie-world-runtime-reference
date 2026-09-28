# Explore Brevard — Founding Business Onboarding Pipeline

**Record ID:** EB-FB-PIPELINE-001  
**Version:** v1.0.0  
**Status:** OPERATIONAL PILOT  
**Baseline:** \`3bc59b9d5e6cba981947f15d04a154856db46dfd\`  
**Baseline branch:** \`explore-brevard-pilot-baseline-2026-09-27\`

## Purpose

Create one repeatable process for every founding business so no business is handled from memory, DMs, or improvised steps.

**Pipeline**

INTEREST → INTAKE → BUSINESS RECORD → ASSETS → BUILD BRIEF → PLACEMENT → REVIEW → APPROVAL → PUBLISH → RECEIPT

## Foundational distinctions

- Reality ≠ Representation.
- Business Entity ≠ Business Image.
- Place ≠ Panorama.
- Hotspot ≠ Painted Graphic.
- Commercial Action ≠ Visual Representation of Action.
- Declared workflow ≠ enforced workflow.
- Approval represented in a record ≠ legal authority unless the evidence actually supports it.
- Current state is a projection over history. Do not erase prior events to make the record look cleaner.

## 1. INTEREST

Trigger: a business asks to join, replies to a post, messages Tommie, or is invited.

Action:
1. Send the standard founding-business message from \`message-templates.md\`.
2. Give the business the public intake URL:
   \`https://goodfriends1853llc-beep.github.io/hsie-world-runtime-reference/tommie/founding-intake.html\`
3. Create an internal onboarding record only when there is enough information to identify the business without guessing.

State: \`INTAKE_SENT\`

## 2. INTAKE

The public form collects:
- contact name and role;
- business name and category;
- email / phone;
- location or service area;
- website / primary public link;
- plain-language business description;
- primary visitor action and destination;
- optional secondary actions;
- environment direction;
- visual notes / exclusions;
- available asset types;
- optional asset-folder link;
- submitter authority acknowledgment;
- asset authorization acknowledgment;
- representation acknowledgment;
- pre-publication approval acknowledgment;
- scope acknowledgment.

State after receipt: \`INTAKE_RECEIVED\`

Receipt is not acceptance.

## 3. BUSINESS RECORD

Create one Business Entity record. Stable identity belongs to the business; build history belongs to Events.

Minimum business fields:
- internal business ID;
- public business name;
- category;
- owner / authorized contact;
- contact channels;
- real-world location or service area when supplied;
- public links;
- authority evidence references;
- intake event reference;
- status projection;
- event history.

Do not collapse:
- business identity;
- representation;
- place;
- panorama;
- commercial actions;
- authorization evidence.

## 4. ASSETS

Required before build can be marked \`READY_FOR_BRIEF\`:

**Minimum**
- business name exactly as it should appear;
- approved public description;
- primary customer action + working destination;
- at least one usable identity asset: logo, sign, storefront, product/service photo, or owner-approved visual reference;
- explicit statement of what must not be used.

**Strongly preferred**
- transparent logo;
- exterior and interior photos;
- brand colors / fonts;
- product or service photos;
- owner/team photos only when intentionally part of the representation;
- menu, service list, price list, booking link, directions link, call/text number;
- examples of the atmosphere the owner wants.

If assets are missing: \`ASSETS_PENDING\`.

## 5. BUILD BRIEF

Use \`build-brief.template.json\`.

The brief converts intake into a bounded build instruction. It must define:
- business entity reference;
- intended Place;
- intended representation type;
- environment direction;
- primary and secondary actions;
- visual asset provenance;
- must-use / must-not-use constraints;
- owner-visible claims;
- interaction count;
- review target;
- acceptance criteria.

The brief is a representation of agreed scope. It is not proof the work has been executed.

State: \`BRIEF_READY\`

## 6. PLACEMENT

Choose one:

1. **Existing Explore Brevard placement** — business lives inside an existing public-world environment.
2. **Business-inspired custom environment** — atmosphere is designed around the business.
3. **Real-world-inspired environment** — uses the real location as reference without claiming photogrammetric identity unless that is actually produced.
4. **Story / imaginative environment** — explicitly representational or narrative.
5. **Recommendation required** — Tommie determines a direction and sends the brief for approval.

Every MOVE remains topology-based. Never use a raw panorama file as a Place.

## 7. REVIEW

Send the owner a private/public preview link or screenshots/video sufficient to review:
- business name;
- environment;
- logo / imagery;
- claims;
- hotspot actions;
- destinations;
- phone numbers / links;
- overall visual direction.

State: \`OWNER_REVIEW\`

If changes are requested: append a \`REVISION_REQUESTED\` Event. Do not overwrite the prior review event.

## 8. APPROVAL

Capture explicit approval.

Minimum approval record:
- approver name;
- authority basis;
- representation/build version;
- timestamp;
- approval channel;
- exact scope approved;
- unresolved exceptions, if any.

State: \`APPROVED_FOR_PUBLICATION\`

Approval of one version does not automatically approve later material changes.

## 9. PUBLISH

Use \`publishing-checklist.md\`.

Required before publication:
- approved build version;
- working assets;
- icon-only hotspots;
- valid topology;
- working actions;
- mobile load;
- return path where applicable;
- claim boundaries intact;
- no unapproved personal/customer data;
- deterministic/world tests updated when semantic world data changes.

State sequence:
\`PUBLISH_QUEUED\` → \`PUBLISHING\` → \`LIVE\`

## 10. RECEIPT

After verified publication:
- record public URL / entry path;
- commit SHA;
- representation ID;
- Place ID;
- published action destinations;
- publication timestamp;
- verification evidence;
- known limitations.

Send the standard “you’re live” message.

State: \`RECEIPTED\`

## Alternate / stop states

- \`PAUSED\`
- \`WITHDRAWN\`
- \`DECLINED\`
- \`ASSETS_PENDING\`
- \`REVISION_REQUESTED\`
- \`PUBLISH_BLOCKED\`

These are not failures by default. They describe the current represented state and preserve why movement stopped.

## Public form

\`/tommie/founding-intake.html\`

Current delivery:
FormSubmit → \`TommieBellamy.media@gmail.com\`

**Activation boundary:** FormSubmit may require one-time destination-email activation. Do not claim normal delivery is verified until the activation and a real intake receipt are confirmed.
