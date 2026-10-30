import { assertBookingCollection, MAX_STORAGE_BYTES } from '../security/bookingBoundary';
import type { Booking } from '../types/booking';
import type { BookingRepository, StorageAdapter } from '../types/contracts';
export const BOOKING_STORAGE_KEY = 'kmitl-booking-v1';
/** รักษาโครงข้อมูล Zustand เดิมและเขตข้อมูลเพิ่มเติมเพื่อคงความเข้ากันได้ */
export class LocalStorageBookingRepository implements BookingRepository {
  constructor(private readonly storage: StorageAdapter) {}
  private readEnvelope(): { state: Record<string, unknown>; version: number } {
    const raw = this.storage.getItem(BOOKING_STORAGE_KEY);
    if (raw === null) return { state: { bookings: [] }, version: 0 };
    if (new TextEncoder().encode(raw).length > MAX_STORAGE_BYTES)
      throw new Error('ข้อมูลที่บันทึกไว้เกินขนาดกำหนด');
    const value: unknown = JSON.parse(raw);
    if (
      !value ||
      typeof value !== 'object' ||
      !('state' in value) ||
      !value.state ||
      typeof value.state !== 'object'
    ) {
      throw new Error('ข้อมูลการจองที่บันทึกไว้ไม่ถูกต้อง');
    }
    const envelope = value as { state: Record<string, unknown>; version?: number };
    if (envelope.version !== undefined && envelope.version !== 0)
      throw new Error('ไม่รองรับเวอร์ชันข้อมูลการจองนี้');
    assertBookingCollection(envelope.state.bookings);
    return { state: envelope.state, version: 0 };
  }
  getAll(): Booking[] {
    return this.readEnvelope().state.bookings as Booking[];
  }
  replaceAll(bookings: readonly Booking[]): void {
    assertBookingCollection(bookings);
    const envelope = this.readEnvelope();
    const serialized = JSON.stringify({ ...envelope, state: { ...envelope.state, bookings } });
    if (new TextEncoder().encode(serialized).length > MAX_STORAGE_BYTES)
      throw new Error('ข้อมูลที่บันทึกไว้เกินขนาดกำหนด');
    this.storage.setItem(BOOKING_STORAGE_KEY, serialized);
  }
}
/** ตัวจัดเก็บอีกแบบสำหรับตรวจว่ารักษาสัญญาและใช้แทน repository ได้ */
export class MemoryBookingRepository implements BookingRepository {
  private bookings: Booking[] = [];
  getAll(): Booking[] {
    return this.bookings.map((booking) => ({ ...booking }));
  }
  replaceAll(bookings: readonly Booking[]): void {
    assertBookingCollection(bookings);
    this.bookings = bookings.map((booking) => ({ ...booking }));
  }
}
