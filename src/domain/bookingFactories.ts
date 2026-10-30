import type { Booking, BookingDraft } from '../types/booking';
export const blank = (date: string, roomId = '701', start = 540, end = 600): BookingDraft => ({
  roomId,
  date,
  start,
  end,
  name: '',
  email: '',
  phone: '',
  department: '',
  purpose: '',
  attendees: 1,
  notes: '',
});
/** Explicit showcase fixtures; never loaded automatically or used for normal saves. */
export function createDemoBookings(
  date: string,
  existing: readonly Booking[],
  nextId: () => string,
): Booking[] {
  return ['702', '706']
    .filter(
      (roomId) =>
        !existing.some((b) => b.roomId === roomId && b.date === date && b.status !== 'cancelled'),
    )
    .map((roomId, index) => ({
      id: nextId(),
      roomId,
      date,
      start: index ? 780 : 810,
      end: index ? 990 : 960,
      name: 'ผู้ใช้งานตัวอย่าง',
      email: 'demo@kmitl.ac.th',
      phone: '023298000',
      department: 'สำนักงานอธิการบดี',
      purpose: index ? 'ประชุมวางแผนโครงการ' : 'ประชุมคณะทำงาน',
      attendees: 20,
      notes: 'ข้อมูลตัวอย่าง',
      status: index ? 'pending' : 'confirmed',
    }));
}
