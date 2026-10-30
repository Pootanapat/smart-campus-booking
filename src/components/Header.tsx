import { ChevronRight, HelpCircle, Moon, Sun } from 'lucide-react';
export function Header({
  page,
  dark,
  onToggleTheme,
  onTutorial,
}: {
  page: string;
  dark: boolean;
  onToggleTheme: () => void;
  onTutorial: () => void;
}) {
  return (
    <header className="topbar">
      <span>
        ระบบจองห้องประชุม <ChevronRight size={13} />{' '}
        <b>
          {page === '/bookings'
            ? 'การจองของฉัน'
            : page === '/insights'
              ? 'สถิติการใช้งาน'
              : 'ภาพรวมห้องประชุม'}
        </b>
      </span>
      <div>
        <span className="campus">
          <span />
          วิทยาเขตลาดกระบัง
        </span>
        <button className="icon-button" aria-label="เปลี่ยนธีม" onClick={onToggleTheme}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="icon-button" aria-label="คู่มือ" onClick={onTutorial}>
          <HelpCircle size={19} />
        </button>
        <span className="top-avatar">K</span>
      </div>
    </header>
  );
}
