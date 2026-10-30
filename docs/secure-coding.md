# Secure Coding และ Refactoring Evidence

## จุดที่ปรับจริงและหลักการ

| จุด                               | เหตุผล / หลักการ                                                                          | Implementation                                                         | หลักฐานทดสอบ                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Runtime boundary                  | TypeScript types ถูกลบตอน runtime จึงต้องตรวจข้อมูลจริง ไม่พึ่ง form attributes           | `src/security/bookingBoundary.ts`, rule แรกใน `domain/bookingRules.ts` | `bookingBoundary.test.ts`: SR-01 malformed/unbounded input          |
| Persisted data is untrusted       | localStorage แก้ได้ ต้อง allowlist room/status, date/time, IDs และตรวจขนาดก่อน JSON.parse | `repositories/bookingRepository.ts` + boundary assertions              | SR-02 tampered records / duplicate IDs / oversized JSON             |
| Output encoding / safe rendering  | ข้อมูลหัวข้อเป็นข้อความ ไม่ใส่ `dangerouslySetInnerHTML` หรือ `innerHTML`                 | `components/BookingsView.tsx`, `BookingDialog.tsx`, `TimelineView.tsx` | `tests/booking.spec.ts`: SR-03 hostile text ไม่สร้าง element/script |
| Export injection defense          | ป้องกัน CRLF สร้าง property/event ใหม่ และชื่อไฟล์มี path separators                      | `services/icsCalendarExporter.ts`                                      | SR-04 event injection / filename / UTF-8 folding tests              |
| Business policy enforcement       | ห้ามใช้ disabled button เป็นจุดตรวจเดียว; revalidate ตอน save/cancel                      | `BookingService.save/cancel`, `BookingRulesValidator`, `canCancel`     | overlap, self-edit vs other ID, >24h/exact cutoff tests             |
| Fail safely / data integrity      | write ไม่สำเร็จต้องไม่แจ้งจองสำเร็จ; JSON เสียต้องไม่ถูกทับเงียบ ๆ                        | `BookingService.update`, `state/createBookingStore.ts`                 | repository tests: corrupted data / quota failure                    |
| Defense in depth                  | static server ให้ CSP, nosniff, frame denial และปฏิเสธ dot/private paths                  | `deployment/static-server.mjs`                                         | `npm run test:deployment`, local smoke JSON                         |
| Least privilege / reproducibility | pinned action SHAs, `npm ci`, audit, read-only CI, deploy เฉพาะ main หลังผ่าน tests       | `.github/workflows/ci-cd.yml`, lockfile                                | workflow execution ต้องอ้าง run URL จริงหลัง Push                   |

## ขอบเขต input ที่บังคับจริง

- ข้อความหลักไม่เกิน 200 ตัวอักษร; notes ไม่เกิน 1000; phone ไม่เกิน 20; ปฏิเสธ control characters ที่ไม่ใช่ whitespace ที่อนุญาต
- ต้องเป็นชนิดข้อมูลถูกต้องและตัวเลข finite; กฎถัดไปตรวจ integer, ช่วงเวลา 07:00–17:00, half-hour, capacity, date/contact
- persisted bookings ไม่เกิน 1000 รายการและ JSON ไม่เกิน 2 MiB (UTF-8 bytes); ตรวจ duplicate IDs, enum, date ที่มีจริง และ room ที่มีใน catalog
- ไม่ reject ข้อความเพียงเพราะมี `<` หรือ `>`: ข้อความอิสระแสดงผ่าน React text rendering; input validation กับ output encoding เป็นคนละหน้าที่
- มี schema validation ทั้ง MemoryBookingRepository และ LocalStorageBookingRepository เพื่อคง LSP ตาม contract เดียวกัน

## ตัวอย่างโค้ด 1: ตรวจที่ trust boundary

```typescript
// src/domain/bookingRules.ts — เป็นกฎแรกใน pipeline
(input) => (isBookingInput(input) ? '' : 'ข้อมูลการจองไม่ถูกต้องหรือยาวเกินกำหนด');
```

`isBookingInput` รับ `unknown` และตรวจ runtime type/length/control characters ก่อนกฎอื่นเรียก `.trim()` หรือใช้ field มี security test ส่ง null/object ที่ชนิดผิดเข้ามาตรง ๆ จึงไม่อาศัยเฉพาะ React form

## ตัวอย่างโค้ด 2: แยกความรับผิดชอบและบังคับ cutoff ใน service

```typescript
// src/services/bookingService.ts
const booking = bookings.find((b) => b.id === id);
if (!booking) return { error: 'ไม่พบรายการจอง' };
if (!canCancel(booking, this.clock.now()))
  return { error: 'ยกเลิกได้ก่อนเริ่มประชุมมากกว่า 24 ชั่วโมงเท่านั้น' };
```

UI มีหน้าที่สื่อสารกับผู้ใช้ ส่วน service บังคับ business policy ก่อน repository เขียนข้อมูล การเปลี่ยน clock/repository ใน tests ทำได้โดยไม่แก้ UI แสดง SRP/DIP และ High Cohesion/Low Coupling

## Refactoring ที่ทำแล้ว

1. `main.tsx` เหลือ framework bootstrapping; presentation ย้ายเป็น component ที่มีหน้าที่ชัดเจน
2. validation และ selectors แยกจาก JSX; `BookingRulesValidator` เพิ่ม policy ผ่าน function list ได้ (OCP)
3. Zustand เป็น in-memory state adapter; persistence อยู่ใน repository ที่รับ `StorageAdapter`
4. ใช้ constructor injection สำหรับ service/repository/validator/clock และมี contract tests ของสอง repository (LSP/ISP/DIP)
5. serialization ICS แยกจาก DOM download จึงทดสอบ injection/UTF-8 โดยไม่ต้องเปิด browser
6. เพิ่ม `security/` สำหรับ shared runtime boundary ที่ domain rules และ repository ใช้ร่วมกัน

## สิ่งที่ห้ามสรุปเกินหลักฐาน

- Client-side checks ไม่ใช่ authorization: เจ้าของ browser สามารถแก้ valid JSON หรือ JavaScript ได้
- ไม่มี password/token จริง; ไม่มีการอ้าง encryption at rest, trusted audit, server sessions หรือ CSRF middleware ที่ไม่ได้มีอยู่
- local response headers ทดสอบกับ Node static server; GitHub Pages ไม่ส่ง headers ชุดนี้ตามไฟล์ Node โดยอัตโนมัติ
- audit ที่ผ่านหมายถึงไม่พบ advisory ตาม registry/ระดับที่ใช้ ณ เวลารัน ไม่ใช่รับรองว่า dependency ไม่มีช่องโหว่ทั้งหมด

หลักการอ้างอิง: [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [OWASP HTML5 Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
