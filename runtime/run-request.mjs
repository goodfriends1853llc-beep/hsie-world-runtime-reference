import fs from 'node:fs';
import path from 'node:path';
import { WorldLocalRuntime } from './local-runtime.mjs';

const [requestPath, stateDir = '.wrb001-local-runtime'] = process.argv.slice(2);

if (!requestPath) {
  console.error('Usage: node runtime/run-request.mjs <request.json> [state-dir]');
  process.exit(2);
}

const request = JSON.parse(fs.readFileSync(path.resolve(requestPath), 'utf8'));
const runtime = new WorldLocalRuntime({
  stateDir,
  sourceCommit: process.env.WRB_SOURCE_COMMIT || null
});

const result = runtime.handle(request);
console.log(JSON.stringify({
  request_id: result.request.request_id,
  event_id: result.event.event_id,
  event_type: result.event.event_type,
  replayed: result.replayed,
  integrity_verified: runtime.verifyEventIntegrity(result.event),
  payload: result.event.payload
}, null, 2));
