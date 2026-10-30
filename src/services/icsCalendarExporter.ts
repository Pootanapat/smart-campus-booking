import type { Booking, Clock } from '../types/booking';
import type { CalendarExporter } from '../types/contracts';
import { bookingTimestamp, systemClock } from '../utils/dateTime';
const escapeText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
// RFC 5545: continuation lines start with one space; never split a UTF-8 character.
const foldLine = (line: string): string => {
  const encoder = new TextEncoder();
  let width = 0;
  let result = '';
  for (const character of line) {
    const bytes = encoder.encode(character).length;
    if (width + bytes > 75) {
      result += '\r\n ';
      width = 1;
    }
    result += character;
    width += bytes;
  }
  return result;
};
const utcStamp = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
/** Serializes calendar data only; it never initiates a browser download. */
export class IcsCalendarExporter implements CalendarExporter {
  constructor(private readonly clock: Clock = systemClock) {}
  export(booking: Booking): ReturnType<CalendarExporter['export']> {
    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KMITL//Room Booking//TH',
      'BEGIN:VEVENT',
      `UID:${escapeText(booking.id)}@booking.kmitl.local`,
      `DTSTAMP:${utcStamp(this.clock.now())}`,
      `DTSTART:${utcStamp(new Date(bookingTimestamp(booking.date, booking.start)))}`,
      `DTEND:${utcStamp(new Date(bookingTimestamp(booking.date, booking.end)))}`,
      `SUMMARY:${escapeText(booking.purpose)}`,
      `LOCATION:KMITL Room ${escapeText(booking.roomId)}`,
      `DESCRIPTION:${escapeText(booking.notes)}`,
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ]
      .map(foldLine)
      .join('\r\n');
    return {
      filename: `kmitl-${booking.id.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 100)}.ics`,
      content,
      mimeType: 'text/calendar;charset=utf-8',
    };
  }
}
