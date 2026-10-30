import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kmitl-tour', '1'));
  await page.goto('/');
});
test('starts empty, filters rooms, and loads/clears demo data', async ({ page }) => {
  await expect(page.locator('.room-row')).toHaveCount(5);
  await expect(page.locator('.booking-block')).toHaveCount(0);
  await page.getByLabel('ค้นหาห้องประชุม', { exact: true }).fill('Bunnag');
  await expect(page.locator('.room-row')).toHaveCount(1);
  await page.getByLabel('ค้นหาห้องประชุม', { exact: true }).fill('');
  await page.getByRole('button', { name: '📦 โหลดข้อมูลตัวอย่าง' }).click();
  await expect(page.locator('.booking-block')).toHaveCount(2);
  await page.reload();
  await expect(page.locator('.booking-block')).toHaveCount(2);
  await page.getByRole('button', { name: 'ล้างข้อมูลทั้งหมด', exact: true }).click();
  await page.getByRole('button', { name: 'ยืนยัน', exact: true }).click();
  await expect(page.locator('.booking-block')).toHaveCount(0);
});
test('creates a booking, persists it, exports, edits and cancels', async ({ page }) => {
  await page.getByRole('button', { name: 'จองห้องประชุม', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('input[type=date]').fill('2099-01-20');
  await dialog.getByLabel('ชื่อผู้จอง').fill('Test Student');
  await dialog.getByLabel('อีเมล').fill('test@kmitl.ac.th');
  await dialog.getByLabel('โทรศัพท์').fill('0812345678');
  await dialog.getByLabel('หน่วยงาน').fill('Engineering');
  await dialog.getByLabel('หัวข้อการประชุม').fill('Team planning');
  await dialog.getByRole('button', { name: 'ตรวจสอบการจอง' }).click();
  await dialog.getByRole('button', { name: 'ยืนยันการจอง' }).click();
  await page.getByRole('button', { name: 'เรียบร้อย' }).click();
  await page.goto('/bookings');
  await expect(page.getByRole('heading', { name: 'Team planning' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Team planning' })).toBeVisible();
  const dl = page.waitForEvent('download');
  await page.getByTitle('ส่งออกปฏิทิน').click();
  expect((await dl).suggestedFilename()).toMatch(/\.ics$/);
  await page.getByTitle('แก้ไข', { exact: true }).click();
  await page.getByLabel('หัวข้อการประชุม').fill('Updated planning');
  await page.getByRole('button', { name: 'ตรวจสอบการจอง' }).click();
  await page.getByRole('button', { name: 'ยืนยันการจอง' }).click();
  await page.getByRole('button', { name: 'เรียบร้อย' }).click();
  await expect(page.getByRole('heading', { name: 'Updated planning' })).toBeVisible();
  await page.getByTitle('ยกเลิก', { exact: true }).click();
  await page.getByRole('button', { name: 'ยืนยัน', exact: true }).click();
  await expect(page.locator('.booking-status')).toHaveText('ยกเลิกแล้ว');
});
test('supports keyboard booking and has no page overflow', async ({ page }) => {
  await page.getByLabel('วันที่แสดงห้องประชุม').fill('2099-01-20');
  const slot = page.getByRole('button', { name: 'บุนนาค 09:00 คลิกเพื่อจอง', exact: true });
  await slot.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: `test-results/${test.info().project.name}.png`, fullPage: true });
});
test('drag selects half-hours, filters capacity, and toggles dark mode', async ({ page }) => {
  await page.getByLabel('วันที่แสดงห้องประชุม').fill('2099-01-20');
  await page
    .getByRole('button', { name: 'บุนนาค 10:00 คลิกเพื่อจอง', exact: true })
    .scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'บุนนาค 09:00 คลิกเพื่อจอง', exact: true }).hover();
  const a = await page
    .getByRole('button', { name: 'บุนนาค 09:00 คลิกเพื่อจอง', exact: true })
    .boundingBox();
  const b = await page
    .getByRole('button', { name: 'บุนนาค 10:00 คลิกเพื่อจอง', exact: true })
    .boundingBox();
  if (!a || !b) throw new Error('Missing timeline slots');

  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByRole('combobox', { name: 'เวลาเริ่ม', exact: true })).toHaveValue('540');
  await expect(page.getByRole('combobox', { name: 'เวลาสิ้นสุด', exact: true })).toHaveValue('630');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '📦 โหลดข้อมูลตัวอย่าง' }).click();
  await page.locator('.booking-block').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'ตัวกรอง', exact: false }).click();
  await page.getByLabel('ความจุขั้นต่ำ').fill('100');
  await expect(page.locator('.room-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'เปลี่ยนธีม' }).click();
  await expect(page.locator('html')).toHaveClass('dark');
});

test('SR-03 renders hostile booking text without creating executable markup', async ({ page }) => {
  const hostile = '<img src=x onerror="window.__xss=1">';
  await page.evaluate(
    (purpose) =>
      localStorage.setItem(
        'kmitl-booking-v1',
        JSON.stringify({
          version: 0,
          state: {
            bookings: [
              {
                id: 'xss-test',
                roomId: '701',
                date: '2099-01-20',
                start: 540,
                end: 600,
                name: 'Tester',
                email: 'test@kmitl.ac.th',
                phone: '0812345678',
                department: 'Engineering',
                purpose,
                attendees: 10,
                notes: '',
                status: 'confirmed',
              },
            ],
          },
        }),
      ),
    hostile,
  );
  await page.goto('/bookings');
  await expect(page.getByRole('heading', { name: hostile, exact: true })).toBeVisible();
  await expect(page.locator('.booking-card img')).toHaveCount(0);
  expect(await page.evaluate(() => '__xss' in window)).toBe(false);
});
