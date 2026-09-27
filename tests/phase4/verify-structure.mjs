import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const manifest = json('data/migrated/manifest.json');
const world = json('data/migrated/' + manifest.world);
const places = manifest.places.map((p) => json('data/migrated/' + p));
const businesses = manifest.businesses.map((p) => json('data/migrated/' + p));
const representations = manifest.representations.map((p) => json('data/migrated/' + p));
const topology = manifest.topology.map((p) => json('data/migrated/' + p));

assert(world.root_place_refs.length === 1, 'World must have one root Place in Slice 001.');
assert(places.length === 2, 'Expected exactly two migrated Places.');
assert(businesses.length === 1, 'Expected exactly one migrated Business.');
assert(representations.length === 3, 'Expected exactly three Representations.');
assert(topology.length === 4, 'Expected exactly four Topology connections.');

const connectionIds = new Set(topology.map((x) => x.connection_id));
const business = businesses[0];
const externalIds = new Set(business.external_actions.map((x) => x.action_id));

for (const representation of representations) {
  assert(Boolean(representation.presentation), representation.representation_id + ' missing presentation.');
  assert(Boolean(representation.presentation.initial_view), representation.representation_id + ' missing initial_view.');
  for (const anchor of representation.presentation.interaction_anchors) {
    if (anchor.interaction_kind === 'MOVE') {
      assert(anchor.target_type === 'TOPOLOGY_CONNECTION', anchor.anchor_id + ' MOVE target_type mismatch.');
      assert(connectionIds.has(anchor.target_ref), anchor.anchor_id + ' references missing Topology connection.');
    }
    if (anchor.interaction_kind === 'BOOK') {
      assert(anchor.target_type === 'BUSINESS_EXTERNAL_ACTION', anchor.anchor_id + ' BOOK target_type mismatch.');
      assert(externalIds.has(anchor.target_ref), anchor.anchor_id + ' references missing external action.');
    }
  }
}

assert(Boolean(business.public_profile?.about_body), 'Business ABOUT body missing.');
assert(Boolean(business.public_profile?.services_title), 'Business Services title missing.');
assert(business.external_actions[0]?.environment_class === 'DEMO', 'BOOK demo classification not preserved.');

const srcDir = path.join(root, 'client/src');
for (const filename of fs.readdirSync(srcDir).filter((x) => x.endsWith('.js'))) {
  const text = fs.readFileSync(path.join(srcDir, filename), 'utf8');
  if (filename !== 'pannellum-adapter.js') {
    assert(!text.includes('.loadScene('), filename + ' contains direct viewer scene transition.');
    assert(!text.includes('pannellum.viewer('), filename + ' instantiates Pannellum outside renderer adapter.');
  }
}

assert(read('client/src/pannellum-adapter.js').includes('.loadScene('), 'Renderer adapter does not own scene transition.');

if (failures.length) {
  console.error('WRB-001 Phase 4 structural verification FAILED');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('WRB-001 Phase 4 structural verification PASS');
console.log('World→Place→Space→Topology→Representation→Renderer separation is structurally present.');
console.log('This does not establish browser/mobile behavioral acceptance.');
