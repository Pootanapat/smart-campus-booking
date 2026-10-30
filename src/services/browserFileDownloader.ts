import type { CalendarFile, FileDownloader } from '../types/contracts';
export class BrowserFileDownloader implements FileDownloader {
  download(file: CalendarFile): void {
    const url = URL.createObjectURL(new Blob([file.content], { type: file.mimeType }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
