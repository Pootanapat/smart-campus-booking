import { ArrowRight, Clock3 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { conflict } from '../domain/bookingRules';
import { rooms } from '../domain/rooms';
import type { Booking, BookingDraft as Draft } from '../types/booking';
import { slots, thaiDate, time, today } from '../utils/dateTime';
import { Modal } from './Modal';
const roleLabels: Record<string, string> = {
  student: 'นักศึกษา',
  staff: 'บุคลากร',
  admin: 'ผู้ดูแลระบบ',
};

export function BookingDialog({
  initialDraft,
  bookings,
  role,
  save,
  validate,
  onClose,
  onSaved,
}: {
  initialDraft: Draft;
  bookings: Booking[];
  role: string;
  save: (draft: Draft, id?: string) => string;
  validate: (draft: Draft, id?: string) => string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [error, setError] = useState('');
  const [review, setReview] = useState(false);
  const submit = () => {
    const issue = save(draft, draft.id);
    if (issue) {
      setError(issue);
      setReview(false);
      return;
    }
    onSaved();
  };
  return (
    <Modal title={draft?.id ? 'แก้ไขการจอง' : 'จองห้องประชุม'} open={!!draft} onClose={onClose}>
      {draft && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (review) submit();
            else {
              const issue = validate(draft, draft.id);
              if (issue) {
                setError(issue);
                return;
              }
              setError('');
              setReview(true);
            }
          }}
        >
          <div className="form-body">
            {review ? (
              <div className="review">
                <span className="eyebrow">สรุปรายละเอียดการจอง</span>
                <h2>{draft.purpose}</h2>
                <p>
                  ห้อง {rooms.find((r) => r.id === draft.roomId)?.name} ({draft.roomId})
                </p>
                <p>
                  {thaiDate(draft.date)} · {time(draft.start)}–{time(draft.end)}
                </p>
                <p>
                  {draft.name} · {draft.department}
                </p>
                <p>
                  {draft.email} · {draft.phone}
                </p>
                <p>
                  {draft.attendees} คน · {draft.notes || 'ไม่มีคำขอเพิ่มเติม'}
                </p>
                <small>
                  บทบาทจำลอง: {roleLabels[role] ?? 'ผู้ใช้งานจำลอง'} · บันทึกการจองในอุปกรณ์นี้
                </small>
              </div>
            ) : (
              <>
                <p className="form-intro">เลือกพื้นที่และเวลาสำหรับการประชุมของคุณ</p>
                <div className="form-grid">
                  <label className="full">
                    ห้องประชุม
                    <select
                      value={draft.roomId}
                      onChange={(e) => setDraft({ ...draft, roomId: e.target.value })}
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.id} {r.name} · {r.capacity} ที่นั่ง · โปรเจกเตอร์ {r.projectors} จอ /
                          คอมพิวเตอร์ / ไมค์
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="full">
                    วันที่ · {thaiDate(draft.date)}
                    <input
                      required
                      type="date"
                      min={today()}
                      value={draft.date}
                      onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                    />
                  </label>
                  <label>
                    เวลาเริ่ม
                    <select
                      value={draft.start}
                      onChange={(e) => setDraft({ ...draft, start: +e.target.value })}
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
                    <select
                      value={draft.end}
                      onChange={(e) => setDraft({ ...draft, end: +e.target.value })}
                    >
                      {slots.slice(1).map((n) => (
                        <option key={n} value={n}>
                          {time(n)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="duration full">
                    <Clock3 size={14} /> ระยะเวลา {(draft.end - draft.start) / 60} ชั่วโมง
                  </p>
                  {conflict(bookings, draft, draft.id) && (
                    <p className="error full" role="alert">
                      ช่วงเวลานี้มีการจองแล้ว
                    </p>
                  )}
                  {(['name', 'email', 'phone', 'department', 'purpose'] as const).map((key, i) => (
                    <label key={key} className={key === 'purpose' ? 'full' : ''}>
                      {['ชื่อผู้จอง', 'อีเมล', 'โทรศัพท์', 'หน่วยงาน / คณะ', 'หัวข้อการประชุม'][i]}{' '}
                      *
                      <input
                        required
                        type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                        autoComplete={
                          key === 'name'
                            ? 'name'
                            : key === 'email'
                              ? 'email'
                              : key === 'phone'
                                ? 'tel'
                                : 'off'
                        }
                        value={draft[key]}
                        maxLength={200}
                        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      />
                    </label>
                  ))}
                  <label>
                    ผู้เข้าร่วม (คน) *
                    <input
                      type="number"
                      min="1"
                      max={rooms.find((r) => r.id === draft.roomId)?.capacity}
                      required
                      value={draft.attendees}
                      onChange={(e) => setDraft({ ...draft, attendees: +e.target.value })}
                    />
                  </label>
                  <label className="full">
                    คำขอเพิ่มเติม
                    <textarea
                      value={draft.notes}
                      maxLength={1000}
                      onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                    />
                  </label>
                </div>
              </>
            )}
            {error && (
              <motion.p
                initial={{ x: -5 }}
                animate={{ x: [-5, 5, -3, 0] }}
                className="error"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </div>
          <div className="form-footer">
            <button
              type="button"
              className="subtle"
              onClick={() => (review ? setReview(false) : onClose())}
            >
              {review ? 'ย้อนกลับ' : 'ยกเลิก'}
            </button>
            <button className="primary" type="submit">
              {review ? 'ยืนยันการจอง' : 'ตรวจสอบการจอง'} <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
