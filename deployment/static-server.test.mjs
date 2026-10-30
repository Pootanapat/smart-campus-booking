import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { createStaticServer } from './static-server.mjs';
test('ระบบติดตั้งให้บริการเส้นทาง SPA พร้อม headers ความปลอดภัยและปฏิเสธเส้นทางส่วนตัว', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'kmitl-static-'));
  await writeFile(join(directory, 'index.html'), '<div id="root"></div>');
  const server = createStaticServer(directory);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const path of ['/', '/bookings']) {
      const r = await fetch(base + path);
      assert.equal(r.status, 200);
      assert.equal(r.headers.get('x-frame-options'), 'DENY');
      assert.match(r.headers.get('content-security-policy'), /frame-ancestors 'none'/);
    }
    assert.equal((await fetch(base + '/.git/config')).status, 403);
    assert.equal((await fetch(base + '/%5c..%5cpackage.json')).status, 403);
    assert.equal((await fetch(base + '/%00')).status, 403);
    assert.equal((await fetch(base + '/missing.js')).status, 404);
    assert.equal((await fetch(base + '/', { method: 'POST' })).status, 405);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  }
});
