import assert from 'node:assert/strict';
import { loadSourceBundle, loadContractSchemas, validateContracts, validateCrossRecordIntegrity, buildSemanticPayload, digestSemanticPayload, buildPublishArtifacts } from '../../publisher/publish.mjs';

const source = loadSourceBundle();
const schemas = loadContractSchemas();

validateContracts(source, schemas);
validateCrossRecordIntegrity(source);

const payloadA = buildSemanticPayload(source);
const digestA = digestSemanticPayload(payloadA);

const reordered = structuredClone(source);
reordered.places.reverse();
reordered.businesses.reverse();
reordered.representations.reverse();
reordered.topology.reverse();

const payloadB = buildSemanticPayload(reordered);
const digestB = digestSemanticPayload(payloadB);

assert.equal(digestA.content_digest, digestB.content_digest, 'Top-level source ordering changed content digest.');
assert.equal(digestA.snapshot_id, digestB.snapshot_id, 'Top-level source ordering changed snapshot ID.');
assert.equal(digestA.canonical, digestB.canonical, 'Canonical semantic JSON changed after top-level reordering.');

const artifactsEarly = buildPublishArtifacts(source, {
  schemas,
  generatedAt: '2026-09-27T00:00:00.000Z',
  sourceCommit: 'commit-a'
});
const artifactsLate = buildPublishArtifacts(source, {
  schemas,
  generatedAt: '2026-09-28T00:00:00.000Z',
  sourceCommit: 'commit-b'
});

assert.equal(artifactsEarly.snapshot.content_digest, artifactsLate.snapshot.content_digest, 'Volatile metadata changed content digest.');
assert.equal(artifactsEarly.snapshot.snapshot_id, artifactsLate.snapshot.snapshot_id, 'Volatile metadata changed snapshot ID.');
assert.equal(JSON.stringify(artifactsEarly.bootstrap), JSON.stringify(artifactsLate.bootstrap), 'Bootstrap changed when only volatile metadata changed.');
assert.notEqual(artifactsEarly.snapshot.generated_at, artifactsLate.snapshot.generated_at, 'Test did not vary generated_at.');

const mutated = structuredClone(source);
mutated.businesses[0].display_name = mutated.businesses[0].display_name + ' changed';
const mutatedDigest = digestSemanticPayload(buildSemanticPayload(mutated));
assert.notEqual(digestA.content_digest, mutatedDigest.content_digest, 'Semantic content mutation did not change digest.');

assert.equal(artifactsEarly.bootstrap.world_ref, source.world.world_id);
assert.equal(artifactsEarly.bootstrap.entry_place_ref, source.world.root_place_refs[0]);
assert.ok(artifactsEarly.bootstrap.entry_representation_ref);
assert.ok(artifactsEarly.snapshot.snapshot_id.startsWith('snapshot:sha256:'));
assert.ok(artifactsEarly.snapshot.content_digest.startsWith('sha256:'));

console.log(JSON.stringify({
  result: 'PASS',
  checks: {
    schema_validation: true,
    cross_record_integrity: true,
    canonical_order_independence: true,
    volatile_metadata_excluded_from_digest: true,
    semantic_mutation_changes_digest: true,
    bootstrap_resolves_entry: true
  },
  snapshot_id: digestA.snapshot_id,
  content_digest: digestA.content_digest
}, null, 2));
