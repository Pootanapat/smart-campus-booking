import { describe, expect, it } from 'vitest';
import { Booking, canCancel, conflict, today, validate } from './domain';
const booking: Booking = {
  id: 'one',
  roomId: '701',
  date: '2099-01-20',
  start: 540,
  end: 600,
  name: 'Tester',
  email: 'test@kmitl.ac.th',
  phone: '0812345678',
  department: 'Engineering',
  purpose: 'Planning',
  attendees: 10,
  notes: '',
  status: 'confirmed',
};
describe('กฎการจอง', () => {
  it('รับการจองถูกต้องในระบบที่เริ่มว่าง', () => expect(validate(booking, [])).toBe(''));
  it('ตรวจเวลาทับซ้อนและช่วงเวลาที่ครอบกัน', () => {
    expect(conflict([booking], { ...booking, start: 570, end: 630 })).toBe(true);
    expect(conflict([booking], { ...booking, start: 510, end: 660 })).toBe(true);
  });
  it('อนุญาตเวลาต่อกัน ห้องอื่น และวันอื่น', () => {
    expect(conflict([booking], { ...booking, start: 600, end: 660 })).toBe(false);
    expect(conflict([booking], { ...booking, roomId: '702' })).toBe(false);
    expect(conflict([booking], { ...booking, date: '2099-01-21' })).toBe(false);
  });
  it('ไม่นับรายการที่กำลังแก้ไขและรายการยกเลิกเป็นเวลาชน', () => {
    expect(conflict([booking], booking, 'one')).toBe(false);
    expect(conflict([{ ...booking, status: 'cancelled' }], booking)).toBe(false);
  });
  it('ปฏิเสธความจุ เวลา อีเมล และวันที่ในอดีตที่ผิดกฎ', () => {
    expect(validate({ ...booking, attendees: 101 }, [])).toContain('100');
    expect(validate({ ...booking, end: 540 }, [])).toContain('เวลา');
    expect(validate({ ...booking, start: 541 }, [])).toContain('เวลา');
    expect(validate({ ...booking, email: 'invalid' }, [])).toContain('อีเมล');
    expect(validate({ ...booking, date: '2000-01-01' }, [])).toContain('อนาคต');
  });
  it('บังคับเงื่อนไขเวลายกเลิก', () => {
    expect(canCancel(booking)).toBe(true);
    expect(canCancel({ ...booking, date: today(), start: 420 })).toBe(false);
  });
});
