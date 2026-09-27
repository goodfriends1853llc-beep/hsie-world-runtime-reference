import fs from 'node:fs';

const fail = [];
const assert = (condition, message) => { if (!condition) fail.push(message); };

const deployment = JSON.parse(fs.readFileSync('deployment.json', 'utf8'));
const build = JSON.parse(fs.readFileSync('client/build.json', 'utf8'));
const root = fs.readFileSync('index.html', 'utf8');
const client = fs.readFileSync('client/index.html', 'utf8');

assert(deployment.deployment_id === 'WRB-001-STATIC-DEPLOYMENT-001', 'deployment id mismatch');
assert(deployment.deployment_class === 'STATIC_REFERENCE_ONLY', 'deployment class mismatch');
assert(deployment.public_url === 'https://goodfriends1853llc-beep.github.io/hsie-world-runtime-reference/', 'public URL mismatch');
assert(deployment.semantic_state.snapshot_id === 'snapshot:sha256:6aa357c482dee7186c691b9bc3a2a8b474dc6d72a65a3c3f2a5cc8d3eff2dc95', 'snapshot mismatch');
assert(deployment.semantic_state.content_digest === 'sha256:6aa357c482dee7186c691b9bc3a2a8b474dc6d72a65a3c3f2a5cc8d3eff2dc95', 'content digest mismatch');

for (const key of ['mia_service_hosted','world_runtime_service_hosted','local_runtime_hosted','dynamic_write_api_hosted','production_ready']) {
  assert(deployment.boundaries[key] === false, key + ' must be false');
}
assert(deployment.boundaries.static_reference_only === true, 'static_reference_only must be true');

assert(build.phase === 13, 'client build phase mismatch');
assert(build.status === 'STATIC_REFERENCE_DEPLOYMENT_CANDIDATE', 'client build status mismatch');
assert(build.boundaries.mia_service_hosted === false, 'client build must not claim MIA hosting');
assert(build.boundaries.world_runtime_service_hosted === false, 'client build must not claim World Runtime hosting');

assert(root.includes('url=./client/'), 'root entry does not redirect to client');
assert(client.includes('./src/app.js'), 'client entry does not load reference application');
assert(fs.existsSync('.nojekyll'), '.nojekyll missing');
assert(fs.existsSync('data/migrated/manifest.json'), 'migrated static manifest missing');

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
  boundaries: deployment.boundaries
}, null, 2));
