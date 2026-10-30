import type { StorageAdapter } from '../types/contracts';
/** การเข้าถึงเบราว์เซอร์อยู่ที่ชั้นโครงสร้างพื้นฐาน และเรียกผู้จัดหาเมื่อจำเป็นเท่านั้น */
export class BrowserStorageAdapter implements StorageAdapter {
  constructor(
    private readonly storage: () => Pick<Storage, 'getItem' | 'setItem'> = () =>
      window.localStorage,
  ) {}
  getItem(key: string): string | null {
    return this.storage().getItem(key);
  }
  setItem(key: string, value: string): void {
    this.storage().setItem(key, value);
  }
}
export class MemoryStorageAdapter implements StorageAdapter {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}
