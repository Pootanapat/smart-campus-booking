import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Modal } from './Modal';
export function SuccessDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal title="จองห้องประชุมสำเร็จ" open={open} onClose={() => onClose()}>
      <div className="success">
        <motion.div className="success-circle" initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <motion.svg width="42" height="42" viewBox="0 0 40 40">
            <motion.path
              d="M8 21L17 30L33 11"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
          </motion.svg>
        </motion.div>
        {Array.from({ length: 16 }, (_, i) => (
          <motion.i
            className="confetti"
            key={i}
            style={{ background: ['#6b21a8', '#d97706', '#10b981'][i % 3] }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: Math.cos(i) * 150, y: Math.sin(i) * 110, rotate: 180, opacity: 0 }}
            transition={{ duration: 1.4 }}
          />
        ))}
        <h2>พร้อมสำหรับการประชุมครั้งต่อไป</h2>
        <p>ดูรายละเอียดและจัดการได้ที่ “การจองของฉัน”</p>
        <button className="primary" onClick={() => onClose()}>
          เรียบร้อย <Check size={17} />
        </button>
      </div>
    </Modal>
  );
}
