import React from 'react';
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="empty">
          <h1>เกิดข้อผิดพลาด</h1>
          <p>ข้อมูลในเบราว์เซอร์ยังคงอยู่ กรุณาลองโหลดหน้าอีกครั้ง</p>
          <button onClick={() => window.location.reload()}>ลองอีกครั้ง</button>
        </div>
      );
    return this.props.children;
  }
}
