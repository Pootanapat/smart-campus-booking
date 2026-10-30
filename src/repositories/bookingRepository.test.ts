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
// Shared behavioral contract proves that both implementations can replace the abstraction.
for (const [name, create] of [
  ['memory', () => new MemoryBookingRepository()],
  ['local-storage repository', () => new LocalStorageBookingRepository(new MemoryStorageAdapter())],
] as const) {
  describe(`${name} repository contract`, () => {
    it('starts empty, replaces snapshots, and returns detached data', () => {
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
    it('works with the same booking use cases', () => {
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
describe('storage adapter contract', () => {
  for (const [name, create] of [
    ['memory', () => new MemoryStorageAdapter()],
    [
      'browser wrapper',
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
    it(`${name} returns null and overwrites values`, () => {
      const storage = create();
      expect(storage.getItem('missing')).toBeNull();
      storage.setItem('k', 'one');
      storage.setItem('k', 'two');
      expect(storage.getItem('k')).toBe('two');
    });
  }
});
describe('local persistence and safe failure behavior', () => {
  it('reloads bookings across repository/store instances and keeps legacy role', () => {
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
  it('preserves malformed data and surfaces an error instead of overwriting it', () => {
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
  it('does not update UI state when persistence fails', () => {
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
  it('rejects invalid saved structures and unsupported versions', () => {
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
  it('tolerates unavailable optional preference storage', () => {
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
describe('booking service policy boundaries', () => {
  it('rejects cancellation at the cutoff without changing data', () => {
    const repo = new MemoryBookingRepository();
    repo.replaceAll([{ ...booking, date: '2030-01-02', start: 420 }]);
    expect(createService(repo).cancel('one').error).toContain('24');
    expect(repo.getAll()[0].status).toBe('confirmed');
  });
  it('rejects editing or cancelling a missing booking', () => {
    const service = createService(new MemoryBookingRepository());
    expect(service.save(booking, 'missing').error).not.toBe('');
    expect(service.cancel('missing').error).not.toBe('');
  });
  it('loads demo bookings once per room/date and clears explicitly', () => {
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
