import { ArrowRight, Building2, CheckCircle2, Clock3 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';
import { Modal } from './Modal';
export function TutorialDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  return (
    <Modal title="ยินดีต้อนรับสู่ระบบจองห้องประชุม" open={open} onClose={onClose}>
      <div className="tutorial">
        <div className="tour-icon">
          {step === 0 ? (
            <Building2 size={38} />
          ) : step === 1 ? (
            <Clock3 size={38} />
          ) : (
            <CheckCircle2 size={38} />
          )}
        </div>
        <span className="eyebrow">เริ่มต้นง่าย ๆ · {step + 1} / 3</span>
        <h2>{['ค้นหาพื้นที่ที่ใช่', 'เลือกเวลาที่สะดวก', 'ยืนยัน แล้วพบกัน'][step]}</h2>
        <p>
          {
            [
              'เลือกจาก 5 ห้องประชุม หรือใช้ตัวกรองตามจำนวนผู้เข้าร่วมและอุปกรณ์',
              'คลิกหรือลากบนตารางเวลาเพื่อเลือกช่วงเวลา จองได้ครั้งละ 30 นาที',
              'กรอกข้อมูล ตรวจสอบสรุป และจัดการการจองผ่านเมนูการจองของฉัน',
            ][step]
          }
        </p>
        <div className="tour-dots">
          {[0, 1, 2].map((n) => (
            <i className={cn(step === n && 'active')} key={n} />
          ))}
        </div>
        <button className="primary" onClick={() => (step < 2 ? setStep(step + 1) : onClose())}>
          {step < 2 ? 'ถัดไป' : 'เริ่มใช้งาน'}
          <ArrowRight size={17} />
        </button>
      </div>
    </Modal>
  );
}
