import { ArrowRight, Building2, CalendarDays, Check, CheckCircle2, Clock3 } from 'lucide-react';
import { rooms } from '../domain/rooms';
import type { Booking } from '../types/booking';
import { thaiDate } from '../utils/dateTime';
import { Stat } from './Stat';
export function RoomOverview({ active, date }: { active: Booking[]; date: string }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-tag">
            <span /> พร้อมสำหรับทุกไอเดียใหม่ของคุณ
          </span>
          <h2>
            ทุกการประชุมที่ดี
            <br />
            เริ่มต้นจาก<span>พื้นที่ที่ใช่</span>
          </h2>
          <p>
            5 ห้องประชุม พร้อมอุปกรณ์ครบครัน
            <br />ณ ชั้น 7 อาคารสำนักงานอธิการบดี
          </p>
          <button
            onClick={() =>
              document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            ค้นหาห้องประชุม <ArrowRight size={17} />
          </button>
        </div>
        <div className="hero-art">
          <div className="art-orbit" />
          <div className="art-room">
            <div className="art-window" />
            <div className="art-screen">
              <span />
              <span />
              <span />
            </div>
            <div className="art-table" />
            <i className="chair c1" />
            <i className="chair c2" />
            <i className="chair c3" />
            <i className="chair c4" />
            <i className="chair c5" />
            <i className="chair c6" />
            <div className="art-plant">✦</div>
          </div>
          <div className="art-label">
            <span>
              <Check size={15} />
            </span>{' '}
            พร้อมสำหรับการประชุมครั้งต่อไป
          </div>
          <span className="art-spark">✧</span>
        </div>
        <div className="hero-corner">ประชุม เชื่อมต่อ สร้างสรรค์</div>
      </section>
      <section className="stats">
        <Stat
          icon={<Building2 />}
          value="5"
          label="ห้องประชุมทั้งหมด"
          note="ชั้น 7 อาคารสำนักงานอธิการบดี"
        />
        <Stat
          icon={<CheckCircle2 />}
          value={String(rooms.filter((r) => !active.some((b) => b.roomId === r.id)).length)}
          label="ห้องว่างตลอดวัน"
          note="พร้อมสำหรับการประชุมของคุณ"
          green
        />
        <Stat
          icon={<CalendarDays />}
          value={String(active.length)}
          label="รายการจองวันนี้ที่เลือก"
          note={thaiDate(date)}
        />
        <Stat
          icon={<Clock3 />}
          value="07:00 – 17:00"
          label="เวลาเปิดให้บริการ"
          note="จองได้ครั้งละ 30 นาทีขึ้นไป"
          gold
        />
      </section>
    </>
  );
}
