export interface Room {
  id: string;
  name: string;
  english: string;
  capacity: number;
  projectors: number;
  image: string;
}
export interface Booking {
  id: string;
  roomId: string;
  date: string;
  start: number;
  end: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  purpose: string;
  attendees: number;
  notes: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}
export type BookingInput = Omit<Booking, 'id' | 'status'>;
export type BookingDraft = BookingInput & { id?: string };
export interface Clock {
  now(): Date;
}
