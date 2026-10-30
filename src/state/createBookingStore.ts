import { create } from 'zustand';
import { BookingService, type BookingResult } from '../services/bookingService';
import { PreferencesService } from '../services/preferencesService';
import type { Booking, BookingInput } from '../types/booking';
export interface BookingState {
  bookings: Booking[];
  role: string;
  storageError: string;
  validate: (input: BookingInput, id?: string) => string;
  save: (input: BookingInput, id?: string) => string;
  cancel: (id: string) => string;
  clear: () => string;
  demo: (date: string) => string;
  setRole: (role: string) => void;
}
/** Zustand is an in-memory view of use-case results, with no persistence middleware. */
export function createBookingStore(service: BookingService, preferences: PreferencesService) {
  let initialBookings: Booking[] = [];
  let storageError = '';
  try {
    initialBookings = service.list();
  } catch {
    storageError =
      'ไม่สามารถอ่านข้อมูลที่บันทึกไว้ ข้อมูลเดิมยังไม่ถูกลบ กรุณาตรวจสอบพื้นที่จัดเก็บ';
  }
  return create<BookingState>()((set) => {
    const apply = (result: BookingResult): string => {
      if (result.bookings) set({ bookings: result.bookings, storageError: '' });
      else if (result.error) set({ storageError: result.error });
      return result.error;
    };
    return {
      bookings: initialBookings,
      role: preferences.getRole(),
      storageError,
      validate: (input, id) => service.validate(input, id),
      save: (input, id) => apply(service.save(input, id)),
      cancel: (id) => apply(service.cancel(id)),
      clear: () => apply(service.clear()),
      demo: (date) => apply(service.demo(date)),
      setRole: (role) => {
        preferences.set('kmitl-role', role);
        set({ role });
      },
    };
  });
}
