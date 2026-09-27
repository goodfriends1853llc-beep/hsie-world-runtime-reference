import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { canonicalize } from '../publisher/canonical-json.mjs';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readNdjson(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, 'utf8');
  if (!text.trim()) return [];
  return text.trimEnd().split('\n').map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`Corrupt NDJSON at ${filePath} line ${index + 1}: ${error.message}`);
    }
  });
}

function appendNdjson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, JSON.stringify(value) + '\n', 'utf8');
}

export function sha256Canonical(value) {
  return 'sha256:' + crypto.createHash('sha256').update(canonicalize(value), 'utf8').digest('hex');
}

export class LocalJournal {
  constructor(stateDir) {
    this.stateDir = path.resolve(stateDir);
    this.requestsPath = path.join(this.stateDir, 'requests.ndjson');
    this.eventsPath = path.join(this.stateDir, 'events.ndjson');
  }

  requests() {
    return readNdjson(this.requestsPath);
  }

  events() {
    return readNdjson(this.eventsPath);
  }

  requestById(requestId) {
    return this.requests().find((request) => request.request_id === requestId) || null;
  }

  eventByRequestId(requestId) {
    return this.events().find((event) => event.request_ref === requestId) || null;
  }

  appendRequest(request) {
    appendNdjson(this.requestsPath, request);
  }

  appendEvent(event) {
    appendNdjson(this.eventsPath, event);
  }
}
