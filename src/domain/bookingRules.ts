import { isBookingInput } from '../security/bookingBoundary';
import type { Booking, BookingInput, Clock } from '../types/booking';
import type { BookingValidator } from '../types/contracts';
import { bookingTimestamp, isValidDate, systemClock, today } from '../utils/dateTime';
import { rooms } from './rooms';

export function conflict(
  bookings: readonly Booking[],
  input: Pick<BookingInput, 'roomId' | 'date' | 'start' | 'end'>,
  editingId?: string,
): boolean {
  return bookings.some(
    (booking) =>
      booking.id !== editingId &&
      booking.status !== 'cancelled' &&
      booking.roomId === input.roomId &&
      booking.date === input.date &&
      booking.start < input.end &&
      booking.end > input.start,
  );
}
export function canCancel(booking: Booking, now = new Date()): boolean {
  return (
    booking.status !== 'cancelled' &&
    bookingTimestamp(booking.date, booking.start) - now.getTime() > 86_400_000
  );
}
export interface ValidationContext {
  bookings: readonly Booking[];
  editingId?: string;
  now: Date;
}
export type BookingRule = (input: BookingInput, context: ValidationContext) => string;
export const defaultBookingRules: readonly BookingRule[] = [
  (input) => (isBookingInput(input) ? '' : 'ข้อมูลการจองไม่ถูกต้องหรือยาวเกินกำหนด'),
  (input) => (rooms.some((room) => room.id === input.roomId) ? '' : 'กรุณาเลือกห้องประชุม'),
  (input, { now }) =>
    !isValidDate(input.date) ||
    input.date < today(now) ||
    bookingTimestamp(input.date, input.start) < now.getTime()
      ? 'กรุณาเลือกวันและเวลาในอนาคตที่ถูกต้อง'
      : '',
  (input) =>
    !Number.isInteger(input.start) ||
    !Number.isInteger(input.end) ||
    input.start < 420 ||
    input.end > 1020 ||
    input.start >= input.end ||
    input.start % 30 !== 0 ||
    input.end % 30 !== 0
      ? 'เลือกเวลา 07:00–17:00 อย่างน้อย 30 นาที'
      : '',
  (input) =>
    !input.name.trim() || !input.department.trim() || !input.purpose.trim()
      ? 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ'
      : '',
  (input) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) ? '' : 'รูปแบบอีเมลไม่ถูกต้อง'),
  (input) =>
    /^[+\d ()-]{9,20}$/.test(input.phone) && input.phone.replace(/\D/g, '').length >= 9
      ? ''
      : 'กรุณาตรวจสอบหมายเลขโทรศัพท์',
  (input) => {
    const capacity = rooms.find((room) => room.id === input.roomId)?.capacity ?? 0;
    return Number.isInteger(input.attendees) && input.attendees >= 1 && input.attendees <= capacity
      ? ''
      : `จำนวนผู้เข้าร่วมต้องอยู่ระหว่าง 1–${capacity} คน`;
  },
  (input, context) =>
    conflict(context.bookings, input, context.editingId)
      ? 'ช่วงเวลานี้มีการจองแล้ว กรุณาเลือกเวลาอื่น'
      : '',
];
/** New policy functions can be injected without changing the validation algorithm. */
export class BookingRulesValidator implements BookingValidator {
  constructor(
    private readonly rules: readonly BookingRule[] = defaultBookingRules,
    private readonly clock: Clock = systemClock,
  ) {}
  validate(input: BookingInput, bookings: readonly Booking[], editingId?: string): string {
    const context: ValidationContext = { bookings, editingId, now: this.clock.now() };
    for (const rule of this.rules) {
      const error = rule(input, context);
      if (error) return error;
    }
    return '';
  }
}
