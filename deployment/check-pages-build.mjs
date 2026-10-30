import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import { createStaticServer } from './static-server.mjs';
const basePath = '/smart-campus-booking/';
const server = createStaticServer('dist', basePath);
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const url = `http://127.0.0.1:${server.address().port}${basePath}`;
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => localStorage.setItem('kmitl-tour', '1'));
  await page.goto(url);
  await expect(page.locator('.room-row')).toHaveCount(5);
  for (const img of await page.locator('.room-info img').all())
    await expect
      .poll(() => img.evaluate((image) => image.complete && image.naturalWidth > 0))
      .toBe(true);
  await page
    .getByRole('link', { name: /การจองของฉัน/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/smart-campus-booking\/#\/bookings$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'การจองของฉัน', exact: true })).toBeVisible();
  await page.locator('.brand').click();
  await expect(page.locator('.room-row')).toHaveCount(5);
  assert.ok(new URL(page.url()).pathname === basePath);
  const evidence = {
    environment: 'local-pages-build',
    checkedAt: new Date().toISOString(),
    basePath,
    checks: [
      'แสดงห้องประชุม 5 ห้อง',
      'รูปทั้ง 5 ห้องโหลดผ่านเส้นทางฐานของ repository',
      'เปลี่ยนหน้าผ่าน hash',
      'โหลดหน้ารายการจองซ้ำ',
      'กดตราระบบกลับหน้าหลัก',
    ],
    passed: true,
    note: 'ตรวจรูปแบบการสร้างสำหรับ Pages ในเครื่องเท่านั้น ไม่ใช่การติดตั้งระยะไกล',
  };
  await mkdir('docs/evidence', { recursive: true });
  await writeFile('docs/evidence/pages-build-local.json', JSON.stringify(evidence, null, 2) + '\n');
  console.log('การตรวจเส้นทางย่อยและ hash ของ Pages ผ่าน 5 จุด');
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
