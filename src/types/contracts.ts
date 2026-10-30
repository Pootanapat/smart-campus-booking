import type { Booking, BookingInput, Clock } from '../types/booking';

/** Synchronous prototype contract: reads are snapshots; failed writes throw. */
export interface BookingRepository {
  getAll(): Booking[];
  replaceAll(bookings: readonly Booking[]): void;
}
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export interface BookingValidator {
  validate(input: BookingInput, bookings: readonly Booking[], editingId?: string): string;
}
export interface CalendarFile {
  filename: string;
  content: string;
  mimeType: string;
}
export interface CalendarExporter {
  export(booking: Booking): CalendarFile;
}
export interface FileDownloader {
  download(file: CalendarFile): void;
}
export type { Clock };
