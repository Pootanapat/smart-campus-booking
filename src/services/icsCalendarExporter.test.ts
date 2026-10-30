import { describe, expect, it } from 'vitest';
import { IcsCalendarExporter } from './icsCalendarExporter';
import type { Booking } from '../types/booking';
const booking: Booking = {
  id: 'one',
  roomId: '701',
  date: '2030-01-03',
  start: 540,
  end: 600,
  name: 'Tester',
  email: 'test@kmitl.ac.th',
  phone: '0812345678',
  department: 'Engineering',
  purpose: 'Planning, meeting; test',
  attendees: 10,
  notes: 'line one\r\nline two\\end',
  status: 'confirmed',
};
describe('การสร้างข้อมูล ICS โดยไม่ใช้ API เบราว์เซอร์', () => {
  it('ส่งออกเวลาไทยเป็น UTC พร้อมข้อมูลกำกับที่แน่นอน', () => {
    const file = new IcsCalendarExporter({ now: () => new Date('2030-01-01T00:00:00Z') }).export(
      booking,
    );
    expect(file.filename).toBe('kmitl-one.ics');
    expect(file.mimeType).toContain('text/calendar');
    expect(file.content).toContain('DTSTART:20300103T020000Z');
    expect(file.content).toContain('DTEND:20300103T030000Z');
    expect(file.content).toContain('DTSTAMP:20300101T000000Z');
    expect(file.content).toContain('SUMMARY:Planning\\, meeting\\; test');
    expect(file.content).toContain('DESCRIPTION:line one\\nline two\\\\end');
    expect(file.content.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
});
