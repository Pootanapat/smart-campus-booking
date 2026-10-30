import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = new URL(process.env.DEPLOYMENT_URL);
assert.equal(base.protocol, 'https:');
assert.ok(base.hostname.endsWith('.github.io'), 'ต้องใช้ URL ของ GitHub Pages');
console.log('กำลังตรวจหน้าเว็บไซต์ผ่าน HTTPS');
const response = await fetch(base, { signal: AbortSignal.timeout(30000) });
assert.equal(response.status, 200);
const html = await response.text();
assert.match(html, /<div id="root">/);
const script = html.match(/src="([^"]+\.js)"/);
assert.ok(script);
console.log('กำลังตรวจไฟล์ JavaScript ที่ติดตั้ง');
const asset = await fetch(new URL(script[1], base), { signal: AbortSignal.timeout(30000) });
assert.equal(asset.status, 200);
// อ่านเนื้อหาให้ครบเพื่อคืนการเชื่อมต่อ HTTP แทนการปล่อย response ค้างไว้
await asset.arrayBuffer();
console.log('กำลังตรวจข้อมูลรุ่นที่ติดตั้ง');
const releaseResponse = await fetch(new URL('deployment.json', base), {
  signal: AbortSignal.timeout(30000),
});
assert.equal(releaseResponse.status, 200);
const release = await releaseResponse.json();
assert.equal(release.revision, process.env.GITHUB_SHA);
const evidence = {
  environment: 'github-pages',
  url: base.href,
  revision: release.revision,
  runId: process.env.GITHUB_RUN_ID,
  checkedAt: new Date().toISOString(),
  status: response.status,
  passed: true,
};
await mkdir('docs/evidence', { recursive: true });
await writeFile('docs/evidence/pages-deployment.json', JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
