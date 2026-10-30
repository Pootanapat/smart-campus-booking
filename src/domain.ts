/** Compatibility entry point for existing domain consumers; no browser infrastructure. */
export { canCancel, conflict } from './domain/bookingRules';
export { rooms } from './domain/rooms';
export type { Booking, BookingDraft, BookingInput, Room } from './types/booking';
export { slots, thaiDate, time, today } from './utils/dateTime';
import { BookingRulesValidator } from './domain/bookingRules';
import type { Booking, BookingInput } from './types/booking';
const validator = new BookingRulesValidator();
export const validate = (input: BookingInput, bookings: readonly Booking[], id?: string) =>
  validator.validate(input, bookings, id);
