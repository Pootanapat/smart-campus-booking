import { BOOKING_STORAGE_KEY } from '../repositories/bookingRepository';
import type { StorageAdapter } from '../types/contracts';
/** Optional display preferences must not prevent use when browser storage is disabled. */
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
      /* Preference remains in memory for this session. */
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
