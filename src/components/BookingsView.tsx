import { addDays, format } from 'date-fns';
import { CalendarDays, Copy, Download, Pencil, Plus, Share2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { blank } from '../domain/bookingFactories';
import { canCancel } from '../domain/bookingRules';
import { rooms } from '../domain/rooms';
import { selectBookings } from '../domain/selectors';
import type { Booking, BookingDraft as Draft } from '../types/booking';
import { cn } from '../utils/cn';
import { thaiDate, time } from '../utils/dateTime';
export function BookingsView({
  bookings,
  date,
  open,
  notify,
  onExport,
  onCancel,
}: {
  bookings: Booking[];
  date: string;
  open: (draft: Draft) => void;
  notify: (message: string) => void;
  onExport: (booking: Booking) => void;
  onCancel: (id: string) => void;
}) {
  const [group, setGroup] = useState('all');
  const filteredBookings = selectBookings(bookings, group);
  const setCancelId = onCancel;
  return (
    <>
      <div className="booking-tabs">
        {[
          ['all', 'ทั้งหมด'],
          ['today', 'วันนี้'],
          ['week', 'สัปดาห์นี้'],
          ['month', 'เดือนนี้'],
          ['past', 'ที่ผ่านมา'],
        ].map(([v, l]) => (
          <button className={cn(group === v && 'selected')} key={v} onClick={() => setGroup(v)}>
            {l}
          </button>
        ))}
      </div>
      <div className="booking-list">
        {filteredBookings.map((b, i) => {
          const r = rooms.find((r) => r.id === b.roomId)!;
          const completed =
            b.status !== 'cancelled' &&
            new Date(`${b.date}T${time(b.end)}:00+07:00`).getTime() < Date.now();
          return (
            <motion.article
              className={cn('booking-card', b.status)}
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div>
                <span className="booking-status">
                  {b.status === 'cancelled'
                    ? 'ยกเลิกแล้ว'
                    : completed
                      ? 'เสร็จสิ้น'
                      : b.status === 'pending'
                        ? 'รออนุมัติ'
                        : 'ยืนยันแล้ว'}
                </span>
                <h2>{b.purpose}</h2>
                <p>
                  ห้อง {r.name} {r.id} · {thaiDate(b.date)} · {time(b.start)}–{time(b.end)}
                </p>
                <small>
                  {b.name} · {b.department} · {b.attendees} คน
                </small>
              </div>
              <div className="booking-actions">
                <button title="ส่งออกปฏิทิน" onClick={() => onExport(b)}>
                  <Download size={17} /> .ics
                </button>
                <button
                  title="ทำสำเนา"
                  onClick={() =>
                    open({
                      ...b,
                      id: undefined,
                      date: format(addDays(new Date(`${b.date}T12:00:00`), 1), 'yyyy-MM-dd'),
                    })
                  }
                >
                  <Copy size={17} />
                </button>
                <button
                  title="แชร์"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        `${b.purpose} · ห้อง ${r.name} · ${thaiDate(b.date)} ${time(b.start)}–${time(b.end)}`,
                      );
                      notify('คัดลอกรายละเอียดสำหรับแชร์แล้ว');
                    } catch {
                      notify('ไม่สามารถเข้าถึงคลิปบอร์ดได้');
                    }
                  }}
                >
                  <Share2 size={17} />
                </button>
                {b.status !== 'cancelled' && !completed && (
                  <>
                    <button title="แก้ไข" onClick={() => open(b)}>
                      <Pencil size={17} />
                    </button>
                    <button
                      title={canCancel(b) ? 'ยกเลิก' : 'ยกเลิกได้ก่อน 24 ชั่วโมง'}
                      disabled={!canCancel(b)}
                      onClick={() => setCancelId(b.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </>
                )}
              </div>
            </motion.article>
          );
        })}
        {!filteredBookings.length && (
          <div className="empty big-empty">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <CalendarDays size={42} />
            </motion.div>
            <h2>ยังไม่มีรายการจอง</h2>
            <p>การประชุมครั้งถัดไป เริ่มต้นได้ที่นี่</p>
            <button className="primary" onClick={() => open(blank(date))}>
              <Plus size={17} /> จองห้องประชุมแรกของคุณ
            </button>
          </div>
        )}
      </div>
    </>
  );
}
