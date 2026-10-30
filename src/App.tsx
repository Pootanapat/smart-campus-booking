import {
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  Plus,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BookingDialog } from './components/BookingDialog';
import { BookingsView } from './components/BookingsView';
import { Header } from './components/Header';
import { InsightsView } from './components/InsightsView';
import { Modal } from './components/Modal';
import { RoomOverview } from './components/RoomOverview';
import { Sidebar } from './components/Sidebar';
import { SuccessDialog } from './components/SuccessDialog';
import { TimelineView } from './components/TimelineView';
import { TutorialDialog } from './components/TutorialDialog';
import { calendarExporter, fileDownloader, preferences, useStore } from './compositionRoot';
import { blank } from './domain/bookingFactories';
import { activeBookingsOn, bookingStatistics } from './domain/selectors';
import type { Booking, BookingDraft as Draft } from './types/booking';
import { today } from './utils/dateTime';

export function App() {
  const { bookings, role, setRole, save, validate, cancel, clear, demo, storageError } = useStore();
  const page = useLocation().pathname;
  const [date, setDate] = useState(today());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState('');
  const [dark, setDark] = useState(preferences.get('kmitl-dark') === 'true');
  const [tutorial, setTutorial] = useState(!preferences.get('kmitl-tour'));
  const [confirmClear, setConfirmClear] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    preferences.set('kmitl-dark', String(dark));
  }, [dark]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  const active = activeBookingsOn(bookings, date);
  const { live } = bookingStatistics(bookings);
  const open = (value: Draft) => setDraft(value);
  const notify = (message: string) => setToast(message);
  const closeTutorial = () => {
    setTutorial(false);
    preferences.set('kmitl-tour', '1');
  };
  const exportCalendar = (booking: Booking) => {
    try {
      fileDownloader.download(calendarExporter.export(booking));
    } catch {
      notify('ไม่สามารถส่งออกปฏิทินได้ กรุณาลองอีกครั้ง');
    }
  };
  return (
    <div className="app">
      <motion.div
        aria-hidden="true"
        className="ambient ambient-purple"
        animate={{ x: [0, 35, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
      />
      <motion.div
        aria-hidden="true"
        className="ambient ambient-gold"
        animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 22, repeat: Infinity }}
      />
      <Sidebar
        bookingCount={live.length}
        role={role}
        setRole={setRole}
        onTutorial={() => setTutorial(true)}
      />
      <div className="shell">
        <Header
          page={page}
          dark={dark}
          onToggleTheme={() => setDark(!dark)}
          onTutorial={() => setTutorial(true)}
        />{' '}
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span /> KMITL MEETING SPACES
              </div>
              <h1>
                {page === '/bookings'
                  ? 'การจองของฉัน'
                  : page === '/insights'
                    ? 'ทุกการประชุม ในมุมมองเดียว'
                    : 'พื้นที่ดี ๆ สำหรับทุกไอเดีย'}
              </h1>
              <p>
                {page === '/'
                  ? 'ค้นหาห้องที่ใช่ เลือกเวลาที่สะดวก แล้วเริ่มต้นการประชุมครั้งต่อไปของคุณ'
                  : 'จัดการการจองและติดตามการใช้งานห้องประชุมของคุณ'}
              </p>
            </div>
            <button className="primary" onClick={() => open(blank(date))}>
              <Plus size={18} /> จองห้องประชุม
            </button>
          </div>
          {storageError && (
            <p role="alert" className="error">
              {storageError}
            </p>
          )}
          {page === '/' ? (
            <>
              <RoomOverview active={active} date={date} />
              <TimelineView
                bookings={bookings}
                date={date}
                setDate={setDate}
                open={open}
                notify={notify}
              />
            </>
          ) : page === '/bookings' ? (
            <BookingsView
              bookings={bookings}
              date={date}
              open={open}
              notify={notify}
              onExport={exportCalendar}
              onCancel={setCancelId}
            />
          ) : (
            <InsightsView bookings={bookings} />
          )}
          <section className="support-strip">
            <div className="support-icon">
              <Building2 size={22} />
            </div>
            <div>
              <strong>ห้องพร้อม อุปกรณ์พร้อม คุณก็พร้อม</strong>
              <p>LCD Projector · คอมพิวเตอร์ · ชุดไมโครโฟนประชุม พร้อมให้บริการทุกห้อง</p>
            </div>
            <span>
              <span className="live-dot" /> 5 SPACES, ENDLESS POSSIBILITIES
            </span>
          </section>
          <div className="demo-controls">
            <span>พื้นที่ทดลองใช้งาน · ข้อมูลบันทึกเฉพาะเบราว์เซอร์นี้ · บทบาทจำลอง</span>
            <button
              onClick={() => {
                const issue = demo(date);
                notify(issue || 'โหลดข้อมูลตัวอย่างสำหรับวันที่เลือกแล้ว');
              }}
            >
              📦 โหลดข้อมูลตัวอย่าง
            </button>
            <button onClick={() => setConfirmClear(true)}>ล้างข้อมูลทั้งหมด</button>
          </div>
          <footer>
            <span>
              <b>KMITL</b> ROOM BOOKING<span className="footer-divider">|</span>
              สำนักงานบริหารงานทั่วไปและกิจการพิเศษ
            </span>
            <span>สงวนลิขสิทธิ์ © 2569 สำนักงานบริหารข้อมูลดิจิทัล</span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav">
        <NavLink to="/" end>
          <LayoutDashboard size={20} />
          ห้องประชุม
        </NavLink>
        <NavLink to="/bookings">
          <CalendarDays size={20} />
          การจองของฉัน
        </NavLink>
        <NavLink to="/insights">
          <BookOpen size={20} />
          สถิติ
        </NavLink>
      </nav>
      {draft && (
        <BookingDialog
          initialDraft={draft}
          bookings={bookings}
          role={role}
          save={save}
          validate={validate}
          onClose={() => setDraft(null)}
          onSaved={() => {
            setDraft(null);
            setSuccess(true);
            notify('บันทึกการจองเรียบร้อยแล้ว');
          }}
        />
      )}
      <SuccessDialog open={success} onClose={() => setSuccess(false)} />
      <TutorialDialog key={String(tutorial)} open={tutorial} onClose={closeTutorial} />
      <Modal
        title={confirmClear ? 'ล้างข้อมูลทั้งหมด?' : 'ยกเลิกการจอง?'}
        open={confirmClear || !!cancelId}
        onClose={() => {
          setConfirmClear(false);
          setCancelId(null);
        }}
      >
        <div className="form-body">
          <p>
            {confirmClear
              ? 'การจองทั้งหมดในเบราว์เซอร์นี้จะถูกลบ และทุกห้องจะกลับมาว่าง'
              : 'รายการนี้จะถูกยกเลิก และช่วงเวลาจะเปิดให้จองอีกครั้ง'}
          </p>
        </div>
        <div className="form-footer">
          <button
            className="subtle"
            onClick={() => {
              setConfirmClear(false);
              setCancelId(null);
            }}
          >
            กลับ
          </button>
          <button
            className="primary danger"
            onClick={() => {
              const issue = confirmClear ? clear() : cancelId ? cancel(cancelId) : '';
              setConfirmClear(false);
              setCancelId(null);
              notify(issue || 'ดำเนินการเรียบร้อยแล้ว');
            }}
          >
            ยืนยัน
          </button>
        </div>
      </Modal>{' '}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
          >
            <CheckCircle2 size={19} />
            {toast}
            <button aria-label="ปิดแจ้งเตือน" onClick={() => setToast('')}>
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
