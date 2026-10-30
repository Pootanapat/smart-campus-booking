import { isSameMonth, isSameWeek } from 'date-fns';
import type { Booking, Room } from '../types/booking';
import { today } from '../utils/dateTime';
import { conflict } from './bookingRules';
import { rooms } from './rooms';
export interface RoomFilters {
  query: string;
  capacity: number;
  equipment: readonly string[];
  available: boolean;
  range: readonly number[];
}
export const activeBookingsOn = (bookings: readonly Booking[], date: string) =>
  bookings.filter((b) => b.status !== 'cancelled' && b.date === date);
export function filterRooms(
  allRooms: readonly Room[],
  active: readonly Booking[],
  filters: RoomFilters,
): Room[] {
  return allRooms.filter(
    (room) =>
      `${room.id} ${room.name} ${room.english}`
        .toLowerCase()
        .includes(filters.query.toLowerCase()) &&
      room.capacity >= filters.capacity &&
      !filters.equipment.includes('Wi-Fi') &&
      (!filters.available ||
        !conflict(active, {
          roomId: room.id,
          date: active[0]?.date ?? '',
          start: filters.range[0],
          end: filters.range[1],
        })),
  );
}
export function selectBookings(
  bookings: readonly Booking[],
  group: string,
  now = new Date(),
): Booking[] {
  return bookings
    .filter((b) => {
      if (group === 'all') return true;
      if (group === 'today') return b.date === today(now);
      if (group === 'week') return isSameWeek(new Date(b.date), now, { weekStartsOn: 1 });
      if (group === 'month') return isSameMonth(new Date(b.date), now);
      return b.date < today(now);
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.start - b.start);
}
export function bookingStatistics(bookings: readonly Booking[]) {
  const live = bookings.filter((b) => b.status !== 'cancelled');
  const counts = rooms.map((room) => live.filter((b) => b.roomId === room.id).length);
  return {
    live,
    most: live.length ? rooms[counts.indexOf(Math.max(...counts))].name : '—',
    hours: live.reduce((total, b) => total + (b.end - b.start) / 60, 0),
    peakCounts: Array.from(
      { length: 10 },
      (_, i) => live.filter((b) => b.start < (i + 8) * 60 && b.end > (i + 7) * 60).length,
    ),
  };
}
