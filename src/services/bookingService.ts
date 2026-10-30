import { createDemoBookings } from '../domain/bookingFactories';
import { canCancel } from '../domain/bookingRules';
import type { Booking, BookingInput, Clock } from '../types/booking';
import type { BookingRepository, BookingValidator } from '../types/contracts';
import { isValidDate } from '../utils/dateTime';
export type BookingResult =
  { bookings: Booking[]; error: '' } | { error: string; bookings?: never };
/** กรณีใช้งานอ้างอิงสัญญา ไม่ผูกกับ React, Zustand, localStorage หรือ DOM API */
export class BookingService {
  constructor(
    private readonly repository: BookingRepository,
    private readonly validator: BookingValidator,
    private readonly clock: Clock,
    private readonly nextId: () => string,
  ) {}
  list(): Booking[] {
    return this.repository.getAll();
  }
  validate(input: BookingInput, editingId?: string): string {
    try {
      return this.validator.validate(input, this.list(), editingId);
    } catch {
      return 'ไม่สามารถอ่านข้อมูลการจองได้ กรุณาตรวจสอบพื้นที่จัดเก็บ';
    }
  }
  private update(change: (bookings: Booking[]) => BookingResult): BookingResult {
    try {
      const result = change(this.list());
      if (result.bookings) this.repository.replaceAll(result.bookings);
      return result;
    } catch {
      return { error: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบพื้นที่จัดเก็บ แล้วลองอีกครั้ง' };
    }
  }
  save(input: BookingInput, editingId?: string): BookingResult {
    return this.update((bookings) => {
      if (editingId && !bookings.some((b) => b.id === editingId))
        return { error: 'ไม่พบรายการจองที่ต้องการแก้ไข' };
      const error = this.validator.validate(input, bookings, editingId);
      if (error) return { error };
      // เลือกเขตข้อมูลโดเมนโดยตรง เพราะข้อมูลร่างอาจมี id หรือข้อมูลเฉพาะหน้าจอปะปน
      const {
        roomId,
        date,
        start,
        end,
        name,
        email,
        phone,
        department,
        purpose,
        attendees,
        notes,
      } = input;
      const saved: Booking = {
        roomId,
        date,
        start,
        end,
        name,
        email,
        phone,
        department,
        purpose,
        attendees,
        notes,
        id: editingId ?? this.nextId(),
        status: 'confirmed',
      };
      return { bookings: [...bookings.filter((b) => b.id !== editingId), saved], error: '' };
    });
  }
  cancel(id: string): BookingResult {
    return this.update((bookings) => {
      const booking = bookings.find((b) => b.id === id);
      if (!booking) return { error: 'ไม่พบรายการจอง' };
      if (!canCancel(booking, this.clock.now()))
        return { error: 'ยกเลิกได้ก่อนเริ่มประชุมมากกว่า 24 ชั่วโมงเท่านั้น' };
      return {
        bookings: bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)),
        error: '',
      };
    });
  }
  clear(): BookingResult {
    return this.update(() => ({ bookings: [], error: '' }));
  }
  demo(date: string): BookingResult {
    if (!isValidDate(date)) return { error: 'กรุณาเลือกวันที่ที่ถูกต้อง' };
    return this.update((bookings) => ({
      bookings: [...bookings, ...createDemoBookings(date, bookings, this.nextId)],
      error: '',
    }));
  }
}
