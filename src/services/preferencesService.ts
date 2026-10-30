import { BOOKING_STORAGE_KEY } from '../repositories/bookingRepository';
import type { StorageAdapter } from '../types/contracts';
/** ค่ากำหนดหน้าจอที่ไม่จำเป็นต้องไม่ขัดขวางการใช้งานเมื่อปิดพื้นที่จัดเก็บ */
export class PreferencesService {
  constructor(private readonly storage: StorageAdapter) {}
  get(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch {
      return null;
    }
  }
  set(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch {
      /* ค่ากำหนดยังคงอยู่ในหน่วยความจำระหว่างรอบการใช้งานนี้ */
    }
  }
  getRole(): string {
    const role = this.get('kmitl-role');
    if (role) return role;
    try {
      const legacy = JSON.parse(this.get(BOOKING_STORAGE_KEY) ?? '{}') as {
        state?: { role?: string };
      };
      return legacy.state?.role ?? 'student';
    } catch {
      return 'student';
    }
  }
}
