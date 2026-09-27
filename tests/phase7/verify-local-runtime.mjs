import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { WorldLocalRuntime } from '../../runtime/local-runtime.mjs';
import { validateJsonSchema } from '../../publisher/schema-validator.mjs';

const requestSchema = JSON.parse(fs.readFileSync('contracts/request/request.schema.json', 'utf8'));
const eventSchema = JSON.parse(fs.readFileSync('contracts/event/event.schema.json', 'utf8'));
const request = JSON.parse(fs.readFileSync('runtime/examples/resolve-world-entry.request.json', 'utf8'));

const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wrb001-phase7-'));
const fixedTime = '2026-09-27T18:00:00.000Z';
const runtime = new WorldLocalRuntime({
  stateDir,
  clock: () => fixedTime,
  sourceCommit: process.env.GITHUB_SHA || 'local-phase7-test'
});

assert.deepEqual(validateJsonSchema(requestSchema, request), [], 'Request fixture failed Request schema.');

const first = runtime.handle(request);
assert.equal(first.replayed, false);
assert.equal(first.event.event_type, 'WORLD_ENTRY_RESOLVED');
assert.equal(first.event.request_ref, request.request_id);
assert.equal(first.event.correlation_id, request.correlation_id);
assert.equal(first.event.payload.runtime_class, 'LOCAL_REFERENCE_ONLY');
assert.equal(first.event.payload.operation, 'RESOLVE_WORLD_ENTRY');
assert.equal(first.event.payload.entry_place_ref, 'place:brevard-demo-street');
assert.equal(first.event.payload.entry_space_ref, null);
assert.equal(first.event.payload.entry_representation_ref, 'representation:street-001-360-v1');
assert.equal(
  first.event.payload.content_digest,
  'sha256:c0b8b8cf841c02112452a82ff256d9786f76a3f567a072ab4b4f37921d678991'
);
assert.equal(runtime.verifyEventIntegrity(first.event), true);
assert.deepEqual(validateJsonSchema(eventSchema, first.event), [], 'Emitted event failed Event schema.');

const requestLinesAfterFirst = fs.readFileSync(path.join(stateDir, 'requests.ndjson'), 'utf8').trim().split('\n');
const eventLinesAfterFirst = fs.readFileSync(path.join(stateDir, 'events.ndjson'), 'utf8').trim().split('\n');
assert.equal(requestLinesAfterFirst.length, 1, 'Expected one persisted Request.');
assert.equal(eventLinesAfterFirst.length, 1, 'Expected one persisted Event.');

const replay = runtime.handle(request);
assert.equal(replay.replayed, true, 'Identical Request retry should replay persisted result.');
assert.equal(replay.event.event_id, first.event.event_id, 'Replay returned a different Event.');
assert.equal(fs.readFileSync(path.join(stateDir, 'requests.ndjson'), 'utf8').trim().split('\n').length, 1);
assert.equal(fs.readFileSync(path.join(stateDir, 'events.ndjson'), 'utf8').trim().split('\n').length, 1);

const conflict = structuredClone(request);
conflict.purpose = 'Different request body using an already-persisted request ID.';
assert.throws(() => runtime.handle(conflict), /Request ID conflict/);

const governed = structuredClone(request);
governed.request_id = 'request:phase7:unauthorized-governed-operation';
governed.operation = 'ACTIVATE_BUSINESS_PLACE';
assert.throws(() => runtime.handle(governed), /not authorized in Phase 7/);

const unsupported = structuredClone(request);
unsupported.request_id = 'request:phase7:unsupported-operation';
unsupported.operation = 'UNSUPPORTED_TEST_OPERATION';
assert.throws(() => runtime.handle(unsupported), /Unsupported Phase 7 local operation/);

assert.notDeepEqual(
  validateJsonSchema(requestSchema, first.event),
  [],
  'Event unexpectedly validates as Request.'
);
assert.notDeepEqual(
  validateJsonSchema(eventSchema, request),
  [],
  'Request unexpectedly validates as Event.'
);

assert.equal(fs.existsSync(path.join(stateDir, 'receipts.ndjson')), false, 'Phase 7 must not create receipt storage.');

const evidenceDir = process.env.WRB_PHASE7_EVIDENCE_DIR;
if (evidenceDir) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.copyFileSync(path.join(stateDir, 'requests.ndjson'), path.join(evidenceDir, 'requests.ndjson'));
  fs.copyFileSync(path.join(stateDir, 'events.ndjson'), path.join(evidenceDir, 'events.ndjson'));
  fs.writeFileSync(path.join(evidenceDir, 'result.json'), JSON.stringify({
    result: 'PASS',
    request_id: request.request_id,
    event_id: first.event.event_id,
    event_integrity_digest: first.event.integrity_digest,
    snapshot_id: first.event.payload.snapshot_id,
    content_digest: first.event.payload.content_digest,
    checks: {
      request_schema_validation: true,
      local_runtime_handler: true,
      request_persisted: true,
      event_schema_validation: true,
      event_persisted: true,
      event_links_request: true,
      event_integrity_verified: true,
      identical_request_replay_no_duplicate: true,
      conflicting_request_id_rejected: true,
      activate_business_place_rejected: true,
      request_event_separation: true,
      no_receipt_created: true
    }
  }, null, 2) + '\n');
}

console.log(JSON.stringify({
  result: 'PASS',
  request_id: request.request_id,
  event_id: first.event.event_id,
  event_integrity_digest: first.event.integrity_digest,
  snapshot_id: first.event.payload.snapshot_id,
  content_digest: first.event.payload.content_digest,
  persisted_requests: 1,
  persisted_events: 1,
  replayed_without_duplicate: true,
  governed_operation_rejected: true,
  receipt_created: false
}, null, 2));
