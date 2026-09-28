import fs from 'node:fs';

const fail = [];
const assert = (condition, message) => { if (!condition) fail.push(message); };

const expectedSnapshot = 'snapshot:sha256:24337e36ec4b9be3eb22cf450e6b0fc2d99c70ba0254dc72251d98a89e956752';
const deployment = JSON.parse(fs.readFileSync('deployment.json', 'utf8'));
const build = JSON.parse(fs.readFileSync('client/build.json', 'utf8'));
const root = fs.readFileSync('index.html', 'utf8');
const client = fs.readFileSync('client/index.html', 'utf8');
const adapter = fs.readFileSync('client/src/pannellum-adapter.js', 'utf8');
const migratedManifest = JSON.parse(fs.readFileSync('data/migrated/manifest.json', 'utf8'));

assert(deployment.deployment_id === 'WRB-001-STATIC-DEPLOYMENT-001', 'deployment id mismatch');
assert(deployment.deployment_class === 'STATIC_REFERENCE_ONLY', 'deployment class mismatch');
assert(deployment.status === 'DEPLOYED_PUBLIC_PILOT', 'deployment status mismatch');
assert(deployment.public_url === 'https://goodfriends1853llc-beep.github.io/hsie-world-runtime-reference/', 'public URL mismatch');
assert(deployment.semantic_state.snapshot_id === expectedSnapshot, 'snapshot mismatch');
assert(deployment.semantic_state.content_digest === expectedSnapshot.replace('snapshot:', ''), 'content digest mismatch');

for (const key of ['mia_service_hosted','world_runtime_service_hosted','local_runtime_hosted','dynamic_write_api_hosted','production_ready']) {
  assert(deployment.boundaries[key] === false, key + ' must be false');
}
assert(deployment.boundaries.static_reference_only === true, 'static_reference_only must be true');

assert(build.phase === 15, 'client build phase mismatch');
assert(build.status === 'DEPLOYED_PUBLIC_PILOT', 'client build status mismatch');
assert(build.semantic_snapshot_id === expectedSnapshot, 'client build semantic snapshot mismatch');
assert(build.boundaries.mia_service_hosted === false, 'client build must not claim MIA hosting');
assert(build.boundaries.world_runtime_service_hosted === false, 'client build must not claim World Runtime hosting');

assert(root.includes('url=./client/'), 'root entry does not redirect to client');
assert(client.includes('./src/app.js'), 'client entry does not load reference application');
assert(client.includes('ONE SPACE COAST. TWO WORLDS.'), 'crossover entry copy missing');
assert(adapter.includes("setAttribute('aria-label', args.label)"), 'hotspot accessibility label missing');
assert(adapter.includes("icon.textContent = iconForAnchor(args.anchor)"), 'icon-only hotspot rendering missing');
assert(fs.existsSync('.nojekyll'), '.nojekyll missing');

for (const path of [
  'assets/360/explore-brevard-crossover-portal-360-8k.webp',
  'assets/360/explore-brevard-post-apocalyptic-crossroads-360-8k.webp',
  'data/migrated/places/crossover-portal.json',
  'data/migrated/places/post-apocalyptic-crossroads.json',
  'data/migrated/representations/crossover-portal.json',
  'data/migrated/representations/post-apocalyptic-crossroads.json',
  'data/migrated/topology/lagoon-nights-to-crossover-portal.json',
  'data/migrated/topology/crossover-portal-to-post-apocalyptic-crossroads.json',
  'data/migrated/topology/post-apocalyptic-crossroads-to-crossover-portal.json',
  'data/migrated/topology/crossover-portal-to-lagoon-nights.json'
]) {
  assert(fs.existsSync(path), path + ' missing');
}

for (const rel of [
  'places/crossover-portal.json',
  'places/post-apocalyptic-crossroads.json'
]) assert(migratedManifest.places.includes(rel), rel + ' missing from manifest');

for (const rel of [
  'representations/crossover-portal.json',
  'representations/post-apocalyptic-crossroads.json'
]) assert(migratedManifest.representations.includes(rel), rel + ' missing from manifest');

for (const rel of [
  'topology/lagoon-nights-to-crossover-portal.json',
  'topology/crossover-portal-to-lagoon-nights.json',
  'topology/crossover-portal-to-post-apocalyptic-crossroads.json',
  'topology/post-apocalyptic-crossroads-to-crossover-portal.json'
]) assert(migratedManifest.topology.includes(rel), rel + ' missing from manifest');

if (fail.length) {
  console.error('WRB-001 Phase 13 static deployment source verification FAILED');
  for (const item of fail) console.error('- ' + item);
  process.exit(1);
}

console.log(JSON.stringify({
  result: 'PASS',
  deployment_id: deployment.deployment_id,
  public_url: deployment.public_url,
  snapshot_id: deployment.semantic_state.snapshot_id,
  public_flow: deployment.public_flow,
  boundaries: deployment.boundaries
}, null, 2));
