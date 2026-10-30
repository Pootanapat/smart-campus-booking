import { describe, expect, it } from 'vitest';
import { Booking, canCancel, conflict, today, validate } from './domain';
const booking: Booking = {
  id: 'one',
  roomId: '701',
  date: '2099-01-20',
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
describe('booking rules', () => {
  it('allows a valid booking into an empty system', () => expect(validate(booking, [])).toBe(''));
  it('detects overlap and contained intervals', () => {
    expect(conflict([booking], { ...booking, start: 570, end: 630 })).toBe(true);
    expect(conflict([booking], { ...booking, start: 510, end: 660 })).toBe(true);
  });
  it('allows adjacent slots, other rooms and dates', () => {
    expect(conflict([booking], { ...booking, start: 600, end: 660 })).toBe(false);
    expect(conflict([booking], { ...booking, roomId: '702' })).toBe(false);
    expect(conflict([booking], { ...booking, date: '2099-01-21' })).toBe(false);
  });
  it('ignores the edited booking and cancelled bookings', () => {
    expect(conflict([booking], booking, 'one')).toBe(false);
    expect(conflict([{ ...booking, status: 'cancelled' }], booking)).toBe(false);
  });
  it('rejects capacity, invalid times, email and past dates', () => {
    expect(validate({ ...booking, attendees: 101 }, [])).toContain('100');
    expect(validate({ ...booking, end: 540 }, [])).toContain('เวลา');
    expect(validate({ ...booking, start: 541 }, [])).toContain('เวลา');
    expect(validate({ ...booking, email: 'invalid' }, [])).toContain('อีเมล');
    expect(validate({ ...booking, date: '2000-01-01' }, [])).toContain('อนาคต');
  });
  it('enforces cancellation cutoff', () => {
    expect(canCancel(booking)).toBe(true);
    expect(canCancel({ ...booking, date: today(), start: 420 })).toBe(false);
  });
});
