import type { Clock } from '../types/booking';
export const systemClock: Clock = { now: () => new Date() };
export const today = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
export const time = (minutes: number) =>
  `${Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
export const slots = Array.from({ length: 21 }, (_, i) => 420 + i * 30);
export const thaiDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
export const bookingTimestamp = (date: string, minutes: number) =>
  new Date(`${date}T${time(minutes)}:00+07:00`).getTime();
export function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}
