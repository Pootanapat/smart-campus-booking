import { describe, expect, it } from 'vitest';
import type { Booking, BookingInput, Clock } from '../types/booking';
import { BookingRulesValidator, canCancel, defaultBookingRules } from './bookingRules';
const clock: Clock = { now: () => new Date('2030-01-01T00:00:00Z') };
const input: BookingInput = {
  roomId: '701',
  date: '2030-01-03',
  start: 540,
  end: 600,
  name: 'Test Student',
  email: 'test@kmitl.ac.th',
  phone: '0812345678',
  department: 'Engineering',
  purpose: 'Planning',
  attendees: 10,
  notes: '',
};
const booking: Booking = { ...input, id: 'one', status: 'confirmed' };
const validator = new BookingRulesValidator(defaultBookingRules, clock);
describe('extensible booking validation', () => {
  it('accepts valid input and exactly the room capacity', () => {
    expect(validator.validate(input, [])).toBe('');
    expect(validator.validate({ ...input, attendees: 100 }, [])).toBe('');
  });
  it.each(['', 'not-a-date', '2030-02-30', '2030-13-01', '2030-1-03', '2029-01-01'])(
    'rejects invalid or past date %s',
    (date) => expect(validator.validate({ ...input, date }, [])).toContain('วัน'),
  );
  it.each(['invalid', 'test@', '@kmitl.ac.th', 'test user@kmitl.ac.th'])(
    'rejects invalid email %s',
    (email) => expect(validator.validate({ ...input, email }, [])).toContain('อีเมล'),
  );
  it.each(['abc', '123', '---------', '() () () ()', '0812345678abc'])(
    'rejects invalid phone %s',
    (phone) => expect(validator.validate({ ...input, phone }, [])).toContain('โทรศัพท์'),
  );
  it.each([0, -1, 101, 1.5])('rejects invalid capacity %s', (attendees) =>
    expect(validator.validate({ ...input, attendees }, [])).toContain('จำนวน'),
  );
  it.each([
    [540, 540],
    [600, 540],
    [419, 600],
    [540, 1021],
    [541, 600],
    [NaN, 600],
    [540, Infinity],
  ])('rejects invalid time %s–%s', (start, end) =>
    expect(validator.validate({ ...input, start, end }, [])).not.toBe(''),
  );
  it('rejects a start earlier than the injected clock', () =>
    expect(
      new BookingRulesValidator(defaultBookingRules, {
        now: () => new Date('2030-01-01T01:00:00Z'),
      }).validate({ ...input, date: '2030-01-01', start: 420, end: 450 }, []),
    ).toContain('อนาคต'));
  it('rejects overlapping bookings', () =>
    expect(validator.validate({ ...input, start: 570, end: 630 }, [booking])).toContain('จองแล้ว'));
  it('allows an adjacent booking', () =>
    expect(validator.validate({ ...input, start: 600, end: 630 }, [booking])).toBe(''));
  it('ignores a cancelled booking', () =>
    expect(validator.validate(input, [{ ...booking, status: 'cancelled' }])).toBe(''));
  it('allows editing itself and checks other bookings', () => {
    expect(validator.validate(input, [booking], 'one')).toBe('');
    expect(validator.validate(input, [booking, { ...booking, id: 'other' }], 'one')).toContain(
      'จองแล้ว',
    );
  });
  it('adds a rule without editing the validator algorithm', () => {
    const extended = new BookingRulesValidator(
      [...defaultBookingRules, (b) => (b.notes.includes('restricted') ? 'Restricted request' : '')],
      clock,
    );
    expect(extended.validate({ ...input, notes: 'restricted' }, [])).toBe('Restricted request');
    expect(validator.validate({ ...input, notes: 'restricted' }, [])).toBe('');
  });
  it('enforces the exact cancellation boundary and ignores cancelled records', () => {
    const start = new Date('2030-01-03T09:00:00+07:00').getTime();
    expect(canCancel(booking, new Date(start - 86400001))).toBe(true);
    expect(canCancel(booking, new Date(start - 86400000))).toBe(false);
    expect(canCancel(booking, new Date(start - 86399999))).toBe(false);
    expect(canCancel({ ...booking, status: 'cancelled' }, new Date(start - 90000000))).toBe(false);
  });
});
