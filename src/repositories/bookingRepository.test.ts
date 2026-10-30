import { describe, expect, it } from 'vitest';
import type { Booking, Clock } from '../types/booking';
import type { BookingRepository, StorageAdapter } from '../types/contracts';
import { BookingRulesValidator, defaultBookingRules } from '../domain/bookingRules';
import {
  BOOKING_STORAGE_KEY,
  LocalStorageBookingRepository,
  MemoryBookingRepository,
} from './bookingRepository';
import { BrowserStorageAdapter, MemoryStorageAdapter } from './storageAdapters';
import { BookingService } from '../services/bookingService';
import { PreferencesService } from '../services/preferencesService';
import { createBookingStore } from '../state/createBookingStore';
const clock: Clock = { now: () => new Date('2030-01-01T00:00:00Z') };
const booking: Booking = {
  id: 'one',
  roomId: '701',
  date: '2030-01-03',
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
const createService = (repository: BookingRepository) => {
  let sequence = 0;
  return new BookingService(
    repository,
    new BookingRulesValidator(defaultBookingRules, clock),
    clock,
    () => (++sequence === 1 ? 'generated' : `generated-${sequence}`),
  );
};
// ใช้สัญญาพฤติกรรมร่วมกันเพื่อยืนยันว่าทั้งสองแบบใช้แทนสัญญานามธรรมได้
for (const [name, create] of [
  ['หน่วยความจำ', () => new MemoryBookingRepository()],
  ['localStorage', () => new LocalStorageBookingRepository(new MemoryStorageAdapter())],
] as const) {
  describe(`สัญญา repository แบบ ${name}`, () => {
    it('เริ่มว่าง แทนที่สำเนา และคืนข้อมูลที่แยกจากต้นฉบับ', () => {
      const repo = create();
      expect(repo.getAll()).toEqual([]);
      repo.replaceAll([booking]);
      const snapshot = repo.getAll();
      snapshot[0].purpose = 'Changed externally';
      snapshot.push({ ...booking, id: 'other' });
      expect(repo.getAll()).toEqual([booking]);
      repo.replaceAll([]);
      expect(repo.getAll()).toEqual([]);
    });
    it('ใช้งานกับกรณีจองชุดเดียวกันได้', () => {
      const service = createService(create());
      expect(service.save(booking).error).toBe('');
      expect(service.list()[0].id).toBe('generated');
      expect(service.save(booking).error).toContain('จองแล้ว');
      expect(service.save({ ...booking, purpose: 'Edited' }, 'generated').error).toBe('');
      expect(service.list()).toHaveLength(1);
      expect(service.list()[0].purpose).toBe('Edited');
      expect(service.cancel('generated').error).toBe('');
      expect(service.list()[0].status).toBe('cancelled');
      expect(service.save(booking).error).toBe('');
    });
  });
}
describe('สัญญาตัวเชื่อมต่อพื้นที่จัดเก็บ', () => {
  for (const [name, create] of [
    ['หน่วยความจำ', () => new MemoryStorageAdapter()],
    [
      'ตัวเชื่อมต่อเบราว์เซอร์',
      () => {
        const data = new Map<string, string>();
        return new BrowserStorageAdapter(() => ({
          getItem: (key) => data.get(key) ?? null,
          setItem: (key, value) => {
            data.set(key, value);
          },
        }));
      },
    ],
  ] as const) {
    it(`${name} คืน null เมื่อไม่มีค่าและเขียนทับค่าได้`, () => {
      const storage = create();
      expect(storage.getItem('missing')).toBeNull();
      storage.setItem('k', 'one');
      storage.setItem('k', 'two');
      expect(storage.getItem('k')).toBe('two');
    });
  }
});
describe('การจัดเก็บในเครื่องและพฤติกรรมเมื่อล้มเหลว', () => {
  it('โหลดรายการข้ามวัตถุ repository และสถานะพร้อมรักษาบทบาทเดิม', () => {
    const storage = new MemoryStorageAdapter();
    storage.setItem(
      BOOKING_STORAGE_KEY,
      JSON.stringify({ version: 0, state: { bookings: [booking], role: 'staff' } }),
    );
    const repo = new LocalStorageBookingRepository(storage);
    const prefs = new PreferencesService(storage);
    const store = createBookingStore(createService(repo), prefs);
    expect(store.getState().bookings).toEqual([booking]);
    expect(store.getState().role).toBe('staff');
    expect(store.getState().save({ ...booking, purpose: 'Saved edit' }, 'one')).toBe('');
    store.getState().setRole('admin');
    const reloaded = createBookingStore(
      createService(new LocalStorageBookingRepository(storage)),
      new PreferencesService(storage),
    );
    expect(reloaded.getState().bookings[0].purpose).toBe('Saved edit');
    expect(reloaded.getState().role).toBe('admin');
    expect(JSON.parse(storage.getItem(BOOKING_STORAGE_KEY)!).state.role).toBe('staff');
  });
  it('รักษาข้อมูลผิดรูปและแจ้งข้อผิดพลาดโดยไม่เขียนทับ', () => {
    const storage = new MemoryStorageAdapter();
    storage.setItem(BOOKING_STORAGE_KEY, 'broken JSON');
    const store = createBookingStore(
      createService(new LocalStorageBookingRepository(storage)),
      new PreferencesService(storage),
    );
    expect(store.getState().storageError).not.toBe('');
    expect(store.getState().save(booking)).not.toBe('');
    expect(storage.getItem(BOOKING_STORAGE_KEY)).toBe('broken JSON');
  });
  it('ไม่ปรับสถานะหน้าจอเมื่อบันทึกไม่สำเร็จ', () => {
    const storage: StorageAdapter = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    const store = createBookingStore(
      createService(new LocalStorageBookingRepository(storage)),
      new PreferencesService(storage),
    );
    expect(store.getState().save(booking)).not.toBe('');
    expect(store.getState().bookings).toEqual([]);
    expect(store.getState().storageError).not.toBe('');
  });
  it('ปฏิเสธโครงข้อมูลผิดและเวอร์ชันที่ไม่รองรับ', () => {
    for (const content of [
      { state: { bookings: [{}] } },
      { state: { bookings: [] }, version: 99 },
      { state: null },
      [],
    ]) {
      const storage = new MemoryStorageAdapter();
      storage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(content));
      expect(() => new LocalStorageBookingRepository(storage).getAll()).toThrow();
    }
  });
  it('รองรับพื้นที่ค่ากำหนดที่ไม่พร้อมใช้งาน', () => {
    const storage: StorageAdapter = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    const prefs = new PreferencesService(storage);
    expect(prefs.getRole()).toBe('student');
    expect(prefs.get('theme')).toBeNull();
    expect(() => prefs.set('theme', 'dark')).not.toThrow();
  });
});
describe('ขอบเขตนโยบายในบริการจอง', () => {
  it('ปฏิเสธยกเลิกตรงจุดตัดโดยไม่เปลี่ยนข้อมูล', () => {
    const repo = new MemoryBookingRepository();
    repo.replaceAll([{ ...booking, date: '2030-01-02', start: 420 }]);
    expect(createService(repo).cancel('one').error).toContain('24');
    expect(repo.getAll()[0].status).toBe('confirmed');
  });
  it('ปฏิเสธแก้ไขหรือยกเลิกรายการที่ไม่มี', () => {
    const service = createService(new MemoryBookingRepository());
    expect(service.save(booking, 'missing').error).not.toBe('');
    expect(service.cancel('missing').error).not.toBe('');
  });
  it('โหลดตัวอย่างครั้งเดียวต่อห้องและวัน และล้างเมื่อสั่ง', () => {
    let id = 0;
    const service = new BookingService(
      new MemoryBookingRepository(),
      new BookingRulesValidator(defaultBookingRules, clock),
      clock,
      () => String(++id),
    );
    expect(service.list()).toEqual([]);
    expect(service.demo('invalid').error).not.toBe('');
    service.demo('2030-01-03');
    service.demo('2030-01-03');
    expect(service.list()).toHaveLength(2);
    expect(service.clear().error).toBe('');
    expect(service.list()).toEqual([]);
  });
});
