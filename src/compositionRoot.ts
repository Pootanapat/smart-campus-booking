import { BookingRulesValidator } from './domain/bookingRules';
import { LocalStorageBookingRepository } from './repositories/bookingRepository';
import { BrowserStorageAdapter } from './repositories/storageAdapters';
import { BookingService } from './services/bookingService';
import { BrowserFileDownloader } from './services/browserFileDownloader';
import { IcsCalendarExporter } from './services/icsCalendarExporter';
import { PreferencesService } from './services/preferencesService';
import { createBookingStore } from './state/createBookingStore';
import { systemClock } from './utils/dateTime';
/** Composition root: the only place wiring production concrete dependencies. */
const storage = new BrowserStorageAdapter();
const repository = new LocalStorageBookingRepository(storage);
const validator = new BookingRulesValidator();
export const preferences = new PreferencesService(storage);
const service = new BookingService(repository, validator, systemClock, () => crypto.randomUUID());
export const useStore = createBookingStore(service, preferences);
export const calendarExporter = new IcsCalendarExporter();
export const fileDownloader = new BrowserFileDownloader();
