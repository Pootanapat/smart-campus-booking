import { Building2, CalendarDays, Clock3 } from 'lucide-react';
import { motion } from 'motion/react';
import { bookingStatistics } from '../domain/selectors';
import type { Booking } from '../types/booking';
import { Stat } from './Stat';
export function InsightsView({ bookings }: { bookings: Booking[] }) {
  const { live, most, hours, peakCounts } = bookingStatistics(bookings);
  return (
    <>
      <section className="stats">
        <Stat
          icon={<CalendarDays />}
          value={String(live.length)}
          label="การจองทั้งหมด"
          note="ไม่รวมรายการยกเลิก"
        />
        <Stat
          icon={<Building2 />}
          value={most}
          label="ห้องที่ใช้บ่อยที่สุด"
          note="จากข้อมูลการจองของคุณ"
        />
        <Stat
          icon={<Clock3 />}
          value={`${hours}`}
          label="ชั่วโมงการประชุม"
          note="รวมทุกห้องประชุม"
        />
      </section>
      <section className="chart-panel">
        <h2>ช่วงเวลาที่มีการใช้งาน</h2>
        <p>จำนวนรายการจองที่ครอบคลุมแต่ละชั่วโมง</p>
        <div className="chart">
          {Array.from({ length: 10 }, (_, i) => {
            const count = peakCounts[i];
            return (
              <div key={i}>
                <span>{count}</span>
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  className="bar"
                  style={{ height: Math.max(3, (count / Math.max(1, live.length)) * 170) }}
                />
                <small>{i + 7}:00</small>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
