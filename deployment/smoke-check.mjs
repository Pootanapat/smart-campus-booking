import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.argv[2] ?? 'http://127.0.0.1:5190';
const results = [];
async function check(path, inspect) {
  const response = await fetch(new URL(path, base));
  await inspect(response);
  results.push({ path, status: response.status });
}
await check('./', async (r) => {
  assert.equal(r.status, 200);
  const text = await r.text();
  assert.match(text, /<div id="root">/);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.match(r.headers.get('content-security-policy') ?? '', /object-src 'none'/);
  const script = text.match(/src="([^"]+\.js)"/);
  assert.ok(script);
  await check(script[1], async (asset) => {
    assert.equal(asset.status, 200);
    assert.match(asset.headers.get('content-type') ?? '', /javascript/);
  });
});
await check('/bookings', async (r) => assert.equal(r.status, 200));
await check('/rooms/701.jpg', async (r) => {
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type') ?? '', /image\/jpeg/);
});
await check('/.git/config', async (r) => assert.equal(r.status, 403));
await check('/%5c..%5cpackage.json', async (r) => assert.equal(r.status, 403));
await check('/missing.js', async (r) => assert.equal(r.status, 404));
await mkdir('docs/evidence', { recursive: true });
const evidence = {
  environment: 'local-static',
  checkedAt: new Date().toISOString(),
  baseUrl: base,
  checks: results,
  passed: true,
};
await writeFile('docs/evidence/local-deployment.json', JSON.stringify(evidence, null, 2) + '\n');
console.log(`Deployment smoke checks passed: ${results.length}`);
