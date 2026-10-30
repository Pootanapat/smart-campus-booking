import {
  ArrowUpRight,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
export function Sidebar({
  bookingCount,
  role,
  setRole,
  onTutorial,
}: {
  bookingCount: number;
  role: string;
  setRole: (role: string) => void;
  onTutorial: () => void;
}) {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand">
        <span className="brand-symbol">
          K<span>•</span>
        </span>
        <span>
          KMITL<b>ระบบจองห้องประชุม</b>
        </span>
      </NavLink>
      <div className="workspace">
        <span className="workspace-icon">
          <Building2 size={19} />
        </span>
        <div>
          สำนักงานอธิการบดี<small>พื้นที่ทำงานของคุณ</small>
        </div>
        <span className="workspace-dot" />
      </div>
      <p className="nav-label">พื้นที่ทำงาน</p>
      <nav>
        <NavLink to="/" end>
          <LayoutDashboard size={19} />
          ภาพรวมห้องประชุม
        </NavLink>
        <NavLink to="/bookings">
          <CalendarDays size={19} />
          การจองของฉัน<span className="nav-count">{bookingCount}</span>
        </NavLink>
        <NavLink to="/insights">
          <BookOpen size={19} />
          สถิติการใช้งาน
        </NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card">
          <span className="help-icon">
            <HelpCircle size={23} />
          </span>
          <strong>เริ่มต้นจองห้องประชุม</strong>
          <p>
            ไม่พลาดทุกขั้นตอนการจอง
            <br />
            ดูคำแนะนำการใช้งานได้ที่นี่
          </p>
          <button onClick={onTutorial}>
            คู่มือการใช้งาน <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="profile">
          <span className="avatar">
            <GraduationCap size={21} />
          </span>
          <div>
            <strong>ผู้ใช้งาน KMITL</strong>
            <select aria-label="บทบาทจำลอง" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">นักศึกษา</option>
              <option value="staff">บุคลากร</option>
              <option value="admin">ผู้ดูแลระบบ</option>
            </select>
          </div>
          <span className="online" />
        </div>
      </div>
    </aside>
  );
}
