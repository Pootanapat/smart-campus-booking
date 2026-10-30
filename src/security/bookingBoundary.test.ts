import { describe, expect, it } from 'vitest';
import { BookingRulesValidator } from '../domain/bookingRules';
import {
  BOOKING_STORAGE_KEY,
  LocalStorageBookingRepository,
  MemoryBookingRepository,
} from '../repositories/bookingRepository';
import { MemoryStorageAdapter } from '../repositories/storageAdapters';
import type { Booking, BookingInput } from '../types/booking';
import { IcsCalendarExporter } from '../services/icsCalendarExporter';
const booking: Booking = {
  id: 'one',
  roomId: '701',
  date: '2099-01-03',
  start: 540,
  end: 600,
  name: 'Tester',
  email: 'test@kmitl.ac.th',
  phone: '0812345678',
  department: 'Engineering',
  purpose: 'Planning',
  attendees: 10,
  notes: '',
  status: 'confirmed',
};
describe('ขอบเขตความเชื่อถือของข้อมูล', () => {
  it.each([
    null,
    {},
    [],
    { ...booking, name: 123 },
    { ...booking, start: NaN },
    { ...booking, purpose: 'x'.repeat(201) },
    { ...booking, notes: 'x'.repeat(1001) },
    { ...booking, name: 'bad\u0000text' },
  ])('SR-01 ปฏิเสธข้อมูลผิดรูปหรือเกินขอบเขต %#', (value) => {
    expect(new BookingRulesValidator().validate(value as BookingInput, [])).not.toBe('');
  });
  it.each([
    { ...booking, roomId: '999' },
    { ...booking, id: '../escape' },
    { ...booking, date: '2099-02-30' },
    { ...booking, attendees: 101 },
    { ...booking, status: 'admin' },
    { ...booking, start: 539 },
  ])('SR-02 ปฏิเสธข้อมูลจัดเก็บที่ถูกดัดแปลงผิดรูป %#', (value) => {
    const storage = new MemoryStorageAdapter();
    const raw = JSON.stringify({ version: 0, state: { bookings: [value] } });
    storage.setItem(BOOKING_STORAGE_KEY, raw);
    expect(() => new LocalStorageBookingRepository(storage).getAll()).toThrow();
    expect(storage.getItem(BOOKING_STORAGE_KEY)).toBe(raw);
  });
  for (const [name, create] of [
    ['หน่วยความจำ', () => new MemoryBookingRepository()],
    ['local', () => new LocalStorageBookingRepository(new MemoryStorageAdapter())],
  ] as const) {
    it(`SR-02 ${name} ปฏิเสธ ID ซ้ำและจำนวนรายการเกินขอบเขต`, () => {
      const repo = create();
      expect(() => repo.replaceAll([booking, booking])).toThrow();
      expect(() =>
        repo.replaceAll(Array.from({ length: 1001 }, (_, i) => ({ ...booking, id: String(i) }))),
      ).toThrow();
      expect(repo.getAll()).toEqual([]);
    });
  }
  it('SR-02 ปฏิเสธ JSON ใหญ่เกินก่อนอ่านโดยไม่เขียนทับ', () => {
    const storage = new MemoryStorageAdapter();
    const raw = ' '.repeat(2 * 1024 * 1024 + 1);
    storage.setItem(BOOKING_STORAGE_KEY, raw);
    expect(() => new LocalStorageBookingRepository(storage).getAll()).toThrow('ขนาด');
    expect(storage.getItem(BOOKING_STORAGE_KEY)).toBe(raw);
  });
  it('SR-04 ไม่เปิดให้แทรกเหตุการณ์เพิ่มหรือชื่อไฟล์อันตราย', () => {
    const file = new IcsCalendarExporter().export({
      ...booking,
      id: '../escape',
      purpose: 'Meeting\r\nBEGIN:VEVENT\r\nSUMMARY:Injected',
    });
    expect(file.filename).not.toMatch(/[\\/]/);
    expect(file.content.match(/\r\nBEGIN:VEVENT\r\n/g)).toHaveLength(1);
    expect(file.content).toContain('Meeting\\nBEGIN:VEVENT\\nSUMMARY:Injected');
  });
  it('SR-04 ตัดบรรทัดปฏิทินภาษาไทยตามขอบเขตไบต์ UTF-8', () => {
    const file = new IcsCalendarExporter().export({ ...booking, purpose: 'ประชุม'.repeat(30) });
    for (const line of file.content.split('\r\n'))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(file.content.replace(/\r\n /g, '')).toContain(`SUMMARY:${'ประชุม'.repeat(30)}`);
  });
});
