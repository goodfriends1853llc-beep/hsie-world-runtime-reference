import crypto from 'node:crypto';
import { canonicalize } from '../publisher/canonical-json.mjs';
import { buildPublishArtifacts, loadSourceBundle } from '../publisher/publish.mjs';
import { assertSchemaValid } from '../publisher/schema-validator.mjs';
import { LocalJournal, sha256Canonical } from './local-journal.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function eventIntegrity(eventWithoutDigest) {
  return 'sha256:' + crypto.createHash('sha256')
    .update(canonicalize(eventWithoutDigest), 'utf8')
    .digest('hex');
}

function eventIdForRequest(request) {
  const hex = crypto.createHash('sha256')
    .update(canonicalize({
      request_id: request.request_id,
      operation: request.operation,
      target_ref: request.target_ref,
      correlation_id: request.correlation_id
    }), 'utf8')
    .digest('hex');
  return `event:local:${hex.slice(0, 32)}`;
}

export class WorldLocalRuntime {
  constructor({ stateDir, clock = () => new Date().toISOString(), sourceCommit = null } = {}) {
    if (!stateDir) throw new Error('stateDir is required for the local runtime.');
    this.clock = clock;
    this.sourceCommit = sourceCommit;
    this.journal = new LocalJournal(stateDir);
    this.requestSchema = readJson('contracts/request/request.schema.json');
    this.eventSchema = readJson('contracts/event/event.schema.json');
  }

  validateRequest(request) {
    assertSchemaValid(this.requestSchema, request, `Request ${request?.request_id || '<unknown>'}`);

    if (request.status !== 'PROPOSED') {
      throw new Error('Phase 7 local runtime accepts only PROPOSED requests.');
    }

    if (request.operation === 'ACTIVATE_BUSINESS_PLACE') {
      throw new Error('ACTIVATE_BUSINESS_PLACE is intentionally not authorized in Phase 7.');
    }

    if (request.operation !== 'RESOLVE_WORLD_ENTRY') {
      throw new Error(`Unsupported Phase 7 local operation: ${request.operation}`);
    }

    if (request.target_domain !== 'WORLD') {
      throw new Error('RESOLVE_WORLD_ENTRY must target WORLD.');
    }
  }

  verifyPersistedRequest(existing, incoming) {
    const existingDigest = sha256Canonical(existing);
    const incomingDigest = sha256Canonical(incoming);
    if (existingDigest !== incomingDigest) {
      throw new Error(`Request ID conflict: ${incoming.request_id} already exists with different content.`);
    }
  }

  buildWorldEntryEvent(request) {
    const artifacts = buildPublishArtifacts(loadSourceBundle(), {
      generatedAt: this.clock(),
      sourceCommit: this.sourceCommit
    });

    if (request.target_ref !== artifacts.bootstrap.world_ref) {
      throw new Error(`Request target does not match published World: ${request.target_ref}`);
    }

    const now = this.clock();
    const baseEvent = {
      schema_version: 'hsie-world-reference/0.1',
      event_id: eventIdForRequest(request),
      event_type: 'WORLD_ENTRY_RESOLVED',
      source_domain: 'WORLD_RUNTIME',
      actor_ref: request.actor_ref,
      subject_ref: artifacts.bootstrap.world_ref,
      request_ref: request.request_id,
      correlation_id: request.correlation_id,
      causation_id: request.request_id,
      occurred_at: now,
      recorded_at: now,
      payload: {
        runtime_class: 'LOCAL_REFERENCE_ONLY',
        operation: request.operation,
        snapshot_id: artifacts.snapshot.snapshot_id,
        content_digest: artifacts.snapshot.content_digest,
        entry_place_ref: artifacts.bootstrap.entry_place_ref,
        entry_space_ref: artifacts.bootstrap.entry_space_ref,
        entry_representation_ref: artifacts.bootstrap.entry_representation_ref
      },
      integrity_digest: null
    };

    const digestInput = { ...baseEvent, integrity_digest: null };
    const event = { ...baseEvent, integrity_digest: eventIntegrity(digestInput) };
    assertSchemaValid(this.eventSchema, event, `Event ${event.event_id}`);
    return event;
  }

  handle(request) {
    this.validateRequest(request);

    const existingRequest = this.journal.requestById(request.request_id);
    if (existingRequest) {
      this.verifyPersistedRequest(existingRequest, request);
      const existingEvent = this.journal.eventByRequestId(request.request_id);
      if (!existingEvent) {
        throw new Error(`Persisted request has no corresponding event: ${request.request_id}`);
      }
      assertSchemaValid(this.eventSchema, existingEvent, `Persisted Event ${existingEvent.event_id}`);
      return { request: existingRequest, event: existingEvent, replayed: true };
    }

    const event = this.buildWorldEntryEvent(request);

    this.journal.appendRequest(request);
    this.journal.appendEvent(event);

    return { request, event, replayed: false };
  }

  verifyEventIntegrity(event) {
    const expected = eventIntegrity({ ...event, integrity_digest: null });
    return expected === event.integrity_digest;
  }
}
