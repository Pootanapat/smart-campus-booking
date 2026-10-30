import { addDays, format } from 'date-fns';
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  MapPin,
  Mic,
  Monitor,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { blank } from '../domain/bookingFactories';
import { conflict } from '../domain/bookingRules';
import { rooms } from '../domain/rooms';
import { activeBookingsOn, filterRooms } from '../domain/selectors';
import type { Booking, BookingDraft as Draft } from '../types/booking';
import { cn } from '../utils/cn';
import { slots, thaiDate, time, today } from '../utils/dateTime';

const equipmentLabels: Record<string, string> = {
  Projector: 'โปรเจกเตอร์',
  Computer: 'คอมพิวเตอร์',
  Microphone: 'ไมโครโฟน',
  'Wi-Fi': 'Wi-Fi',
};

export function TimelineView({
  bookings,
  date,
  setDate,
  open,
  notify,
}: {
  bookings: Booking[];
  date: string;
  setDate: (date: string) => void;
  open: (draft: Draft) => void;
  notify: (message: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [available, setAvailable] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [range, setRange] = useState([420, 1020]);
  const [drag, setDrag] = useState<{ roomId: string; start: number; end: number } | null>(null);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const active = activeBookingsOn(bookings, date);
  const filtered = filterRooms(rooms, active, { query, capacity, equipment, available, range });
  const changeDate = (amount: number) =>
    setDate(format(addDays(new Date(`${date}T12:00:00`), amount), 'yyyy-MM-dd'));
  const startMinutes =
    Number(
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit' }).format(now),
    ) *
      60 +
    Number(
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', minute: '2-digit' }).format(now),
    );
  return (
    <section id="timeline" className="schedule">
      <div className="section-title">
        <div>
          <h2>
            เลือกห้องประชุมของคุณ <span>{filtered.length} ห้อง</span>
          </h2>
          <p>คลิกหรือลากบนตารางเวลา เพื่อเลือกช่วงเวลาที่ต้องการจอง</p>
        </div>
        <div className="view-label">
          <CalendarDays size={16} /> ตารางเวลา
        </div>
      </div>
      <div className="toolbar">
        <div className="date-control">
          <button aria-label="วันก่อนหน้า" onClick={() => changeDate(-1)}>
            <ChevronLeft size={17} />
          </button>
          <label>
            <CalendarDays size={17} />
            <span>{thaiDate(date)}</span>
            <input
              aria-label="วันที่แสดงห้องประชุม"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <button aria-label="วันถัดไป" onClick={() => changeDate(1)}>
            <ChevronRight size={17} />
          </button>
        </div>
        <button className="subtle" onClick={() => setDate(today())}>
          วันนี้
        </button>
        <div className="search">
          <Search size={17} />
          <input
            aria-label="ค้นหาห้องประชุม"
            placeholder="ค้นหาชื่อห้อง หรือหมายเลขห้อง..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className={cn('subtle', filterOpen && 'selected')}
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <SlidersHorizontal size={16} /> ตัวกรอง{' '}
          {capacity || equipment.length || available ? '•' : ''}
        </button>
      </div>
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            className="filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div>
              <label>
                ความจุขั้นต่ำ {capacity} คน
                <input
                  aria-label="ความจุขั้นต่ำ"
                  type="range"
                  min="0"
                  max="100"
                  value={capacity}
                  onChange={(e) => setCapacity(+e.target.value)}
                />
              </label>
              <div className="quick">
                {[25, 35, 100].map((n, i) => (
                  <button key={n} onClick={() => setCapacity(n)}>
                    {['เล็ก', 'กลาง', 'ใหญ่'][i]}
                  </button>
                ))}
              </div>
            </div>
            <fieldset>
              <legend>อุปกรณ์</legend>
              {['Projector', 'Computer', 'Microphone', 'Wi-Fi'].map((e) => (
                <label key={e}>
                  <input
                    type="checkbox"
                    checked={equipment.includes(e)}
                    onChange={(v) =>
                      setEquipment(
                        v.target.checked ? [...equipment, e] : equipment.filter((x) => x !== e),
                      )
                    }
                  />
                  {equipmentLabels[e]}
                </label>
              ))}
              <small>Wi-Fi: ยังไม่มีข้อมูลยืนยันจากต้นฉบับ</small>
            </fieldset>
            <div>
              <label>
                เวลาเริ่ม
                <select
                  value={range[0]}
                  onChange={(e) =>
                    setRange([+e.target.value, Math.max(range[1], +e.target.value + 30)])
                  }
                >
                  {slots.slice(0, -1).map((n) => (
                    <option key={n} value={n}>
                      {time(n)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                เวลาสิ้นสุด
                <select value={range[1]} onChange={(e) => setRange([range[0], +e.target.value])}>
                  {slots
                    .filter((n) => n > range[0])
                    .map((n) => (
                      <option key={n} value={n}>
                        {time(n)}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                />{' '}
                ว่างในช่วงเวลาที่เลือก
              </label>
              <button
                className="text-button"
                onClick={() => {
                  const start = Math.max(420, Math.floor(startMinutes / 30) * 30);
                  setDate(today());
                  setRange([Math.min(start, 990), Math.min(start + 30, 1020)]);
                  setAvailable(true);
                }}
              >
                ว่างขณะนี้
              </button>
            </div>
            <button
              className="text-button"
              onClick={() => {
                setCapacity(0);
                setEquipment([]);
                setAvailable(false);
                setRange([420, 1020]);
                setSearch('');
              }}
            >
              ล้างตัวกรอง
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="chips">
        {capacity > 0 && (
          <button onClick={() => setCapacity(0)}>
            อย่างน้อย {capacity} คน <X size={12} />
          </button>
        )}
        {equipment.map((e) => (
          <button key={e} onClick={() => setEquipment(equipment.filter((x) => x !== e))}>
            {equipmentLabels[e]}
            <X size={12} />
          </button>
        ))}
        {available && (
          <button onClick={() => setAvailable(false)}>
            ห้องว่าง {time(range[0])}–{time(range[1])}
            <X size={12} />
          </button>
        )}
      </div>
      <div className="legend">
        <span className="legend-tip">
          <motion.span
            className="live-dot"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />{' '}
          อัปเดตจากข้อมูลในอุปกรณ์นี้
        </span>
        <span>
          <i className="dot green" />
          ว่าง
        </span>
        <span>
          <i className="dot rose" />
          จองแล้ว
        </span>
        <span>
          <i className="dot amber" />
          รออนุมัติ
        </span>
        <span>
          <i className="dot gray" />
          ผ่านไปแล้ว
        </span>
      </div>
      <div className="timeline-scroll">
        <div className="timeline">
          <div className="timeline-head">
            <div>
              ห้องประชุม <span>/ ตารางการใช้งาน</span>
            </div>
            <div className="hour-labels">
              {Array.from({ length: 11 }, (_, i) => (
                <span key={i}>{String(i + 7).padStart(2, '0')}:00</span>
              ))}
            </div>
          </div>
          {filtered.map((r, index) => (
            <motion.div
              className="room-row"
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="room-info">
                <img
                  src={`${import.meta.env.BASE_URL}${r.image.replace(/^\//, '')}`}
                  alt={`ห้องประชุม ${r.name}`}
                />
                <div>
                  <div className="room-name">
                    {r.name} <span>{r.id}</span>
                  </div>
                  <p>
                    <Users size={12} />
                    {r.capacity} ที่นั่ง <span>ชั้น 7</span>
                  </p>
                  <div className="equipment">
                    <Monitor size={12} />
                    <span>{r.projectors}</span>
                    <Mic size={12} />
                    <span className="room-available">พร้อมใช้งาน</span>
                  </div>
                </div>
              </div>
              <div className="room-track" onPointerCancel={() => setDrag(null)}>
                {slots.slice(0, -1).map((n, i) => {
                  const booked = active.find((b) => b.roomId === r.id && b.start <= n && b.end > n);
                  const past = date < today() || (date === today() && n + 30 <= startMinutes);
                  const selected =
                    drag?.roomId === r.id &&
                    n >= Math.min(drag.start, drag.end) &&
                    n <= Math.max(drag.start, drag.end);
                  return (
                    <button
                      key={n}
                      aria-label={`${r.name} ${time(n)} ${booked ? 'จองแล้ว' : 'คลิกเพื่อจอง'}`}
                      title={
                        booked
                          ? `${booked.purpose} ${time(booked.start)}–${time(booked.end)}`
                          : `${time(n)}–${time(n + 30)} คลิกเพื่อจอง`
                      }
                      className={cn(
                        'slot',
                        booked?.status === 'pending'
                          ? 'pending'
                          : booked
                            ? 'booked'
                            : past
                              ? 'past'
                              : 'free',
                        selected && 'drag-selected',
                        i % 2 === 0 && 'hour-start',
                      )}
                      onPointerDown={(e) => {
                        if (!booked && !past) {
                          e.preventDefault();
                          setDrag({ roomId: r.id, start: n, end: n });
                        }
                      }}
                      onPointerEnter={() => {
                        if (drag?.roomId === r.id) setDrag({ ...drag, end: n });
                      }}
                      onPointerUp={() => {
                        if (drag?.roomId === r.id) {
                          const start = Math.min(drag.start, drag.end),
                            end = Math.max(drag.start, drag.end) + 30;
                          if (!conflict(bookings, { roomId: r.id, date, start, end }))
                            open(blank(date, r.id, start, end));
                          else notify('ช่วงเวลาที่เลือกมีการจองแล้ว');
                          setDrag(null);
                        }
                      }}
                      onClick={(e) => {
                        if (e.detail === 0 && !booked && !past) open(blank(date, r.id, n, n + 30));
                      }}
                    >
                      {!booked && !past && <span className="slot-plus">+</span>}
                    </button>
                  );
                })}
                {active
                  .filter((b) => b.roomId === r.id)
                  .map((b) => (
                    <button
                      key={b.id}
                      className={cn('booking-block', b.status === 'pending' && 'pending-block')}
                      style={{
                        left: `${(b.start - 420) / 6}%`,
                        width: `${(b.end - b.start) / 6}%`,
                      }}
                      onClick={() => open(b)}
                      title={b.purpose}
                    >
                      {time(b.start)}–{time(b.end)}
                      <small>{b.purpose}</small>
                    </button>
                  ))}
                {date === today() && startMinutes >= 420 && startMinutes <= 1020 && (
                  <motion.div
                    className="now-line"
                    style={{ left: `${(startMinutes - 420) / 6}%` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
          {!filtered.length && (
            <div className="empty">ไม่พบห้องที่ตรงกับตัวกรอง ลองปรับเงื่อนไขการค้นหา</div>
          )}
          <div className="timeline-foot">
            <span>
              <MapPin size={13} /> ชั้น 7 อาคารสำนักงานอธิการบดี ·
              สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง
            </span>
            <span>เวลาประเทศไทย (GMT+7)</span>
          </div>
        </div>
      </div>
      <div className="schedule-note">
        <span>
          <HelpCircle size={15} /> เลือกช่วงเวลาครั้งละ 30 นาที · ยกเลิกได้ก่อนเริ่มประชุมอย่างน้อย
          24 ชั่วโมง
        </span>
        <span>
          ต้องการความช่วยเหลือ?{' '}
          <a href="tel:023298000">
            02-329-8000 ต่อ 2196 <ArrowUpRight size={12} />
          </a>
        </span>
      </div>
    </section>
  );
}
