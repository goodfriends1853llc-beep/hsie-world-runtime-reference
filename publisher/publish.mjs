import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { canonicalize } from './canonical-json.mjs';
import { assertSchemaValid } from './schema-validator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const CONTRACT_PATHS = {
  world: 'contracts/world/world.schema.json',
  place: 'contracts/place/place.schema.json',
  business: 'contracts/business/business.schema.json',
  representation: 'contracts/representation/representation.schema.json',
  topology: 'contracts/topology/topology.schema.json'
};

const MANIFEST_PATH = 'data/migrated/manifest.json';
const OUTPUT_DIR = 'data/published';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  const target = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function uniqueBy(items, keyFn, label) {
  const seen = new Set();
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) throw new Error(`Duplicate ${label}: ${key}`);
    seen.add(key);
  }
}

function by(field) {
  return (a, b) => String(a[field]).localeCompare(String(b[field]));
}

export function loadSourceBundle() {
  const manifest = readJson(MANIFEST_PATH);
  const loadMany = (paths) => paths.map((relativePath) => readJson(path.join('data/migrated', relativePath)));

  return {
    manifest,
    world: readJson(path.join('data/migrated', manifest.world)),
    places: loadMany(manifest.places),
    businesses: loadMany(manifest.businesses),
    representations: loadMany(manifest.representations),
    topology: loadMany(manifest.topology)
  };
}

export function loadContractSchemas() {
  return Object.fromEntries(
    Object.entries(CONTRACT_PATHS).map(([name, relativePath]) => [name, readJson(relativePath)])
  );
}

export function validateContracts(bundle, schemas = loadContractSchemas()) {
  assertSchemaValid(schemas.world, bundle.world, 'World');

  for (const place of bundle.places) {
    assertSchemaValid(schemas.place, place, `Place ${place.place_id}`);
  }
  for (const business of bundle.businesses) {
    assertSchemaValid(schemas.business, business, `Business ${business.business_id}`);
  }
  for (const representation of bundle.representations) {
    assertSchemaValid(schemas.representation, representation, `Representation ${representation.representation_id}`);
  }
  for (const connection of bundle.topology) {
    assertSchemaValid(schemas.topology, connection, `Topology ${connection.connection_id}`);
  }
}

export function validateCrossRecordIntegrity(bundle) {
  uniqueBy(bundle.places, (x) => x.place_id, 'Place ID');
  uniqueBy(bundle.businesses, (x) => x.business_id, 'Business ID');
  uniqueBy(bundle.representations, (x) => x.representation_id, 'Representation ID');
  uniqueBy(bundle.topology, (x) => x.connection_id, 'Topology connection ID');

  const places = new Map(bundle.places.map((x) => [x.place_id, x]));
  const representations = new Map(bundle.representations.map((x) => [x.representation_id, x]));
  const topology = new Map(bundle.topology.map((x) => [x.connection_id, x]));

  for (const placeRef of bundle.world.root_place_refs) {
    if (!places.has(placeRef)) throw new Error(`World root Place does not exist: ${placeRef}`);
  }

  function assertSpace(placeRef, spaceRef, label) {
    if (spaceRef == null) return;
    const place = places.get(placeRef);
    if (!place) throw new Error(`${label} Place does not exist: ${placeRef}`);
    if (!place.spaces.some((space) => space.space_id === spaceRef)) {
      throw new Error(`${label} Space does not exist: ${placeRef} / ${spaceRef}`);
    }
  }

  for (const place of bundle.places) {
    for (const representationRef of place.representation_refs) {
      if (!representations.has(representationRef)) {
        throw new Error(`Place references missing Representation: ${place.place_id} → ${representationRef}`);
      }
    }

    for (const space of place.spaces) {
      for (const representationRef of space.representation_refs) {
        const representation = representations.get(representationRef);
        if (!representation) throw new Error(`Space references missing Representation: ${representationRef}`);
        if (representation.place_ref !== place.place_id || representation.space_ref !== space.space_id) {
          throw new Error(`Space / Representation mismatch: ${place.place_id} / ${space.space_id} → ${representationRef}`);
        }
      }
    }
  }

  for (const business of bundle.businesses) {
    for (const placeRef of business.world_place_refs) {
      if (!places.has(placeRef)) throw new Error(`Business references missing Place: ${business.business_id} → ${placeRef}`);
    }

    const actionIds = new Set(business.external_actions.map((action) => action.action_id));
    for (const service of business.services) {
      if (service.booking_action_ref && !actionIds.has(service.booking_action_ref)) {
        throw new Error(`Service references missing Business external action: ${service.service_id} → ${service.booking_action_ref}`);
      }
    }
  }

  for (const representation of bundle.representations) {
    if (!places.has(representation.place_ref)) {
      throw new Error(`Representation references missing Place: ${representation.representation_id} → ${representation.place_ref}`);
    }
    assertSpace(representation.place_ref, representation.space_ref, 'Representation');

    for (const anchor of representation.presentation?.interaction_anchors || []) {
      if (anchor.interaction_kind === 'MOVE') {
        if (anchor.target_type !== 'TOPOLOGY_CONNECTION') {
          throw new Error(`MOVE anchor target type is not TOPOLOGY_CONNECTION: ${anchor.anchor_id}`);
        }
        if (!topology.has(anchor.target_ref)) {
          throw new Error(`MOVE anchor references missing Topology connection: ${anchor.anchor_id} → ${anchor.target_ref}`);
        }
      }

      if (anchor.interaction_kind === 'BOOK') {
        const actionExists = bundle.businesses.some((business) =>
          business.external_actions.some((action) => action.action_id === anchor.target_ref)
        );
        if (!actionExists) throw new Error(`BOOK anchor references missing external action: ${anchor.anchor_id} → ${anchor.target_ref}`);
      }

      if (anchor.interaction_kind === 'ABOUT' || anchor.interaction_kind === 'SERVICES') {
        const business = bundle.businesses.find((candidate) => candidate.world_place_refs.includes(representation.place_ref));
        if (!business) throw new Error(`${anchor.interaction_kind} anchor has no Business for Place ${representation.place_ref}`);
      }
    }
  }

  for (const connection of bundle.topology) {
    if (!places.has(connection.source_place_ref)) throw new Error(`Topology source Place missing: ${connection.connection_id}`);
    if (!places.has(connection.target_place_ref)) throw new Error(`Topology target Place missing: ${connection.connection_id}`);
    assertSpace(connection.source_place_ref, connection.source_space_ref, 'Topology source');
    assertSpace(connection.target_place_ref, connection.target_space_ref, 'Topology target');
  }
}

export function buildSemanticPayload(bundle) {
  return {
    schema_version: 'hsie-world-publish/0.1',
    world: clone(bundle.world),
    places: clone(bundle.places).sort(by('place_id')),
    businesses: clone(bundle.businesses).sort(by('business_id')),
    representations: clone(bundle.representations).sort(by('representation_id')),
    topology: clone(bundle.topology).sort(by('connection_id'))
  };
}

export function digestSemanticPayload(payload) {
  const canonical = canonicalize(payload);
  const hex = crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
  return {
    canonical,
    content_digest: `sha256:${hex}`,
    snapshot_id: `snapshot:sha256:${hex}`
  };
}

export function resolveEntry(bundle) {
  const entryPlaceRef = bundle.world.root_place_refs[0];
  if (!entryPlaceRef) throw new Error('World has no root Place.');

  const entryRepresentation = bundle.representations.find(
    (representation) => representation.place_ref === entryPlaceRef && representation.space_ref == null
  );

  if (!entryRepresentation) throw new Error(`No root Representation for entry Place: ${entryPlaceRef}`);

  return {
    entry_place_ref: entryPlaceRef,
    entry_space_ref: null,
    entry_representation_ref: entryRepresentation.representation_id
  };
}

export function buildPublishArtifacts(bundle, options = {}) {
  validateContracts(bundle, options.schemas);
  validateCrossRecordIntegrity(bundle);

  const content = buildSemanticPayload(bundle);
  const digest = digestSemanticPayload(content);
  const entry = resolveEntry(bundle);

  const generatedAt = options.generatedAt || new Date().toISOString();
  const sourceCommit = options.sourceCommit || process.env.WRB_SOURCE_COMMIT || null;

  const snapshot = {
    snapshot_schema: 'hsie-world-snapshot/0.1',
    snapshot_id: digest.snapshot_id,
    content_digest: digest.content_digest,
    generated_at: generatedAt,
    generator: {
      id: 'wrb001-deterministic-publisher',
      version: '0.1.0'
    },
    source: {
      repository: 'goodfriends1853llc-beep/hsie-world-runtime-reference',
      source_commit: sourceCommit
    },
    content
  };

  const bootstrap = {
    bootstrap_schema: 'hsie-world-bootstrap/0.1',
    world_ref: bundle.world.world_id,
    ...entry,
    snapshot_id: digest.snapshot_id,
    content_digest: digest.content_digest,
    content_schema_version: content.schema_version
  };

  return {
    snapshot,
    bootstrap,
    canonical_semantic_json: digest.canonical
  };
}

export function publish(options = {}) {
  const bundle = loadSourceBundle();
  const artifacts = buildPublishArtifacts(bundle, options);

  writeJson(path.join(OUTPUT_DIR, 'world.snapshot.json'), artifacts.snapshot);
  writeJson(path.join(OUTPUT_DIR, 'bootstrap.json'), artifacts.bootstrap);
  fs.writeFileSync(path.join(ROOT, OUTPUT_DIR, 'semantic.canonical.json'), artifacts.canonical_semantic_json + '\n');

  return artifacts;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const artifacts = publish();
  console.log(JSON.stringify({
    snapshot_id: artifacts.snapshot.snapshot_id,
    content_digest: artifacts.snapshot.content_digest,
    generated_at: artifacts.snapshot.generated_at
  }, null, 2));
}
