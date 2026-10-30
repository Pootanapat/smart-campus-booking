import type { Booking, BookingInput } from '../types/booking';
import { rooms } from '../domain/rooms';
import { isValidDate } from '../utils/dateTime';
export const MAX_BOOKINGS = 1000;
export const MAX_STORAGE_BYTES = 2 * 1024 * 1024;
const textLimits = {
  roomId: 10,
  date: 10,
  name: 200,
  email: 200,
  phone: 20,
  department: 200,
  purpose: 200,
  notes: 1000,
} as const;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
/** ตรวจข้อมูลจริงที่ขอบเขตการรับเข้า รวมถึงการเรียกที่ไม่ได้ผ่านแบบฟอร์ม React */
export function isBookingInput(value: unknown): value is BookingInput {
  if (!isRecord(value)) return false;
  return (
    Object.entries(textLimits).every(
      ([key, max]) =>
        typeof value[key] === 'string' &&
        (value[key] as string).length <= max &&
        !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value[key] as string),
    ) &&
    ['start', 'end', 'attendees'].every(
      (key) => typeof value[key] === 'number' && Number.isFinite(value[key]),
    )
  );
}
/** ข้อมูลที่จัดเก็บมีวันที่ในอดีตได้ แต่ตรวจนโยบายเวลาอนาคตเมื่อบันทึกการจอง */
export function isStoredBooking(value: unknown): value is Booking {
  if (!isBookingInput(value) || !isRecord(value)) return false;
  const b = value as unknown as Booking;
  return (
    typeof b.id === 'string' &&
    /^[A-Za-z0-9_-]{1,100}$/.test(b.id) &&
    rooms.some(
      (room) => room.id === b.roomId && b.attendees >= 1 && b.attendees <= room.capacity,
    ) &&
    isValidDate(b.date) &&
    Number.isInteger(b.attendees) &&
    Number.isInteger(b.start) &&
    Number.isInteger(b.end) &&
    b.start >= 420 &&
    b.end <= 1020 &&
    b.start < b.end &&
    b.start % 30 === 0 &&
    b.end % 30 === 0 &&
    ['confirmed', 'pending', 'cancelled'].includes(b.status)
  );
}
export function assertBookingCollection(value: unknown): asserts value is Booking[] {
  if (!Array.isArray(value) || value.length > MAX_BOOKINGS || !value.every(isStoredBooking))
    throw new Error('รูปแบบรายการจองที่บันทึกไว้ไม่ถูกต้อง');
  if (new Set(value.map((b) => b.id)).size !== value.length) throw new Error('พบรหัสรายการจองซ้ำ');
}
