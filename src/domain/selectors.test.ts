import { describe, expect, it } from 'vitest';
import { activeBookingsOn, bookingStatistics, filterRooms, selectBookings } from './selectors';
import { rooms } from './rooms';
import type { Booking } from '../types/booking';
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
const filters = { query: '', capacity: 0, equipment: [], available: false, range: [540, 600] };
describe('room availability and dashboard selectors', () => {
  it('searches Thai, English and room numbers', () => {
    for (const query of ['บุนนาค', 'BUNNAG', '701'])
      expect(filterRooms(rooms, [], { ...filters, query }).map((r) => r.id)).toEqual(['701']);
  });
  it('filters capacity and unverified Wi-Fi equipment', () => {
    expect(filterRooms(rooms, [], { ...filters, capacity: 100 })).toHaveLength(1);
    expect(filterRooms(rooms, [], { ...filters, equipment: ['Wi-Fi'] })).toEqual([]);
  });
  it('omits cancelled bookings and other dates from availability', () => {
    expect(
      activeBookingsOn(
        [
          booking,
          { ...booking, id: 'cancelled', status: 'cancelled' },
          { ...booking, id: 'other-date', date: '2030-01-04' },
        ],
        '2030-01-03',
      ),
    ).toEqual([booking]);
  });
  it('filters occupied rooms and allows adjacent slots', () => {
    expect(
      filterRooms(rooms, [booking], { ...filters, available: true }).map((r) => r.id),
    ).not.toContain('701');
    expect(
      filterRooms(rooms, [booking], { ...filters, available: true, range: [600, 630] }),
    ).toHaveLength(5);
  });
  it('excludes cancelled bookings from metrics', () => {
    const result = bookingStatistics([
      booking,
      { ...booking, id: 'cancelled', status: 'cancelled' },
    ]);
    expect(result.live).toHaveLength(1);
    expect(result.hours).toBe(1);
    expect(result.most).toBe('บุนนาค');
    expect(result.peakCounts[2]).toBe(1);
    expect(result.peakCounts[3]).toBe(0);
  });
  it('groups by date without mutating the repository snapshot', () => {
    const bookings = [booking, { ...booking, id: 'past', date: '2029-12-31' }];
    expect(selectBookings(bookings, 'today', new Date('2030-01-03T12:00:00+07:00'))).toEqual([
      booking,
    ]);
    expect(selectBookings(bookings, 'past', new Date('2030-01-03T12:00:00+07:00'))[0].id).toBe(
      'past',
    );
    expect(bookings[0].id).toBe('one');
  });
});
