# เนื้อหานำเสนอ SDD2 และ บทสาธิตการใช้งานจริง

ใช้เป็นต้นฉบับจัดสไลด์ 16 หน้าโดยประมาณ เน้นเปิดหลักฐานประกอบ ไม่อ่านโค้ดทุกบรรทัด เวลาแต่ละช่วงเป็นข้อเสนอให้ทีมปรับตามเวลาที่อาจารย์กำหนด

## สไลด์ 1 — ชื่อโครงงาน / ทีม / ขอบเขตปัจจุบัน

**KMITL Room Booking — ระบบจองห้องประชุม**

React/TypeScript เบราว์เซอร์ ต้นแบบ สำหรับ 5 ห้อง ชั้น 7 อาคารสำนักงานอธิการบดี ใส่ชื่อ/รหัสสมาชิกทั้ง 6 คนตามรายชื่อจริงและแบ่งผู้พูดเอง ไม่ใช้ Git author list แทนรายชื่อทีม

## สไลด์ 2 — บทนำ ความเป็นมาและความสำคัญ

การเลือกห้อง/เวลาโดยไม่มีภาพรวมทำให้ตรวจช่วงว่างและจำนวนที่นั่งยาก ระบบจึงแสดงหลายห้องบน timeline เดียวและตรวจข้อจำกัดก่อนบันทึก นี่คือโจทย์ที่โครงงานมุ่งแก้ ไม่ได้อ้างว่าระบบ KMITL เดิมมี เหตุการณ์ผิดปกติ หรือข้อบกพร่องที่ยังไม่มีข้อมูลยืนยัน

## สไลด์ 3 — วัตถุประสงค์และ ขอบเขตและความสามารถ

- ค้นหา 5 ห้องตามชื่อ/หมายเลข/ความจุ/อุปกรณ์ และดูตารางวันเดียวกัน
- จอง/แก้ไข/ยกเลิก พร้อม การตรวจสอบข้อมูล และ จุดตัดเวลายกเลิก
- เก็บข้อมูลใน เบราว์เซอร์, export ICS, สถิติ และ responsive/dark mode
- นอกขอบเขตที่เสร็จ: institutional auth, trusted approval, QR check-in, บริการหลังบ้าน/database, real multi-user protection

เปิด FR-01–FR-09 ใน [Traceability](traceability-matrix.md)

## สไลด์ 4 — สถาปัตยกรรมแบ่งชั้นและแผนภาพส่วนประกอบ

นำ diagram จาก [Architecture](architecture-and-solid.md) อธิบาย presentation → application → domain/contracts → infrastructure และ composition root

พูดจุดสำคัญ: React แสดงผล, `BookingService` ประสาน use case, validator ตรวจ policy, repository จัดเก็บ, store เป็น state view แยกจาก localStorage

## สไลด์ 5 — แผนภาพคลาสและหน้าที่

เปิด class/interface diagram จริง: BookingService → BookingRepository/BookingValidator/Clock; repository → StorageAdapter; CalendarExporter แยก FileDownloader

ยกตัวอย่างว่าการเปลี่ยน persistence ไม่ต้องแก้ form ถ้ายังคง synchronous contract ส่วน ระยะไกล API ต้องเปลี่ยน async contract อย่างชัดเจน ไม่กล่าวว่าเปลี่ยนได้ทันทีทุก บริการหลังบ้าน

## สไลด์ 6 — SOLID ความเป็นเอกภาพของหน้าที่ และการพึ่งพากัน พร้อมโค้ด 2 จุด

1. constructor injection ของ BookingService: SRP/DIP/ISP และ dependency จาก interface
2. ordered BookingRule list: เพิ่ม policy ได้โดยไม่แก้ validator loop (OCP); ใช้ shared repository tests อธิบาย LSP

High Cohesion: module รวมหน้าที่เดียวกัน Low Coupling: UI/use cases ไม่เรียก localStorage โดยตรง

แจ้งชัด: TypeScript ไม่ใช่ Python/PEP 8 ต้องยืนยันการยอมรับกับอาจารย์ การอธิบาย SOLID เทียบภาษาไม่ใช่การผ่านเงื่อนไขภาษาโดยอัตโนมัติ

## สไลด์ 7 — การทำงานร่วมกันผ่าน Git

เปิด `git log --graph --oneline --all` และ PR/review URL จริง ใช้ [ประวัติและ workflow](team-collaboration.md)

แสดง feature branch → PR → peer review → CI → merge → CD ประวัติเดิมที่มีหลาย author ส่วนใหญ่เป็น README จึงต้องแสดง feature contribution จริงเพิ่ม ไม่อ้างชื่อใน README ว่าทำโค้ดแล้ว

## สไลด์ 8 — แบบจำลองภัยคุกคามด้วย DFD และขอบเขตความเชื่อถือ

เปิด Context และ Level-1 DFD จาก [แบบจำลองภัยคุกคาม](threat-model.md)

ชี้ F1 input, F4 untrusted JSON, F7 export, F9–F12 CI/hosting และอธิบายว่า เบราว์เซอร์ code/localStorage ไม่ใช่ trusted authorization boundary

## สไลด์ 9 — รายการทรัพย์สิน กรณีใช้งานผิดวัตถุประสงค์ และ STRIDE

Assets: booking data, PII, source/artifact, สิทธิ์ติดตั้งs

Misuse ที่สาธิตได้: malicious meeting title, invalid/oversized JSON, overlap/จุดตัดเวลายกเลิก และ ICS injection ชี้ว่า role spoofing/valid JSON tampering ยังเป็น open risk

## สไลด์ 10 — ข้อกำหนดความปลอดภัยและทะเบียนความเสี่ยง

ใช้ SR-01 ถึง SR-11 จาก threat model และเปิด [ทะเบียนความเสี่ยง](risk-register.md)

ตัวอย่าง: R-03 stored XSS มี React text การแสดงผล + test ลด likelihood แต่ R-05 mock authorization ยัง คงเหลือ 20 เพราะยังไม่มี บริการหลังบ้าน ไม่ปรับ risk เป็น low เพียงเพราะมี warning

## สไลด์ 11 — การเขียนโค้ดอย่างปลอดภัยและการปรับโครงสร้าง

เปิด [การเขียนโค้ดอย่างปลอดภัย](secure-coding.md), `security/bookingBoundary.ts`, `BookingRulesValidator` และ ตัวสร้างข้อมูลไฟล์ปฏิทิน

แสดงหลักการ ขณะทำงาน การตรวจสอบข้อมูล, untrusted stored data, safe text การแสดงผล, output escaping, fail-safe write และ least privilege ใน workflow พร้อมชี้ test ที่ตรวจจริง

## สไลด์ 12 — ตารางตรวจสอบย้อนกลับ

ยกเส้นทาง FR-03 → T-01 → R-01 → SR-01 → BookingService/validator → overlap/edit test

อีกตัวอย่าง T-04 → SR-04 → IcsCalendarExporter → security unit test แสดงวิธีตรวจกลับว่าทุก control มี implementation/evidence อะไร และอะไรยัง planned

## สไลด์ 13 — CI: ตรวจอะไรและเกิดเมื่อใด

เปิด workflow และ Actions run จริง: `npm ci`, formatting, audit, unit/security, deployment test, build, เบราว์เซอร์ desktop/mobile บน artifact

กดดู log/failed example ที่เกิดขึ้นจริงได้ ถ้ายังไม่มี run ให้ระบุว่า workflow prepared และห้ามใช้ ในเครื่อง console แทน ระยะไกล run

## สไลด์ 14 — CD และผลติดตั้ง (เกณฑ์ 40%)

แสดง main CI pass → Pages artifact → OIDC deploy → HTTPS/revision check

หลักฐาน: run URL, commit SHA, deployed URL, `/deployment.json`, artifact `production-deployment-evidence` แล้วเปิดเว็บที่ติดตั้งจริง ถ้ามีเฉพาะ ในเครื่อง installation ต้องพูดว่าเป็น ในเครื่อง ไม่ใช่ GitHub CD

## สไลด์ 15 — สาธิตกรณีใช้งานหลักและกรณีขอบเขต

| ลำดับ | ทำอะไร                                                                | ผลที่ต้องเห็น / Traceability                                                            |
| ----- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1     | เปิด URL ที่ติดตั้ง ใช้ข้อมูลสมมติ ล้างข้อมูลหลัง confirmation        | 5 ห้อง ไม่มี booking, FR-06                                                             |
| 2     | ค้นหา “701” หรือ Bunnag แล้วเลือก capacity 100                        | เหลือบุนนาค FR-01                                                                       |
| 3     | เลือกวันอนาคต ลาก 09:00 ถึง 10:00                                     | form เป็น 09:00–10:30 เพราะรวม half-hour ช่องสุดท้าย FR-02                              |
| 4     | กรอกข้อมูลสมมติ review/confirm และ reload                             | ยังเห็นรายการเดิม FR-03/FR-05                                                           |
| 5     | จองห้องเดียวกันเวลา overlap หรือแก้ไปชนอีก booking                    | error ไม่มีการเพิ่มรายการซ้ำ SR-01                                                      |
| 6     | ทดสอบ email/phone ผิด หรือ attendees เกิน capacity                    | ไม่ผ่าน การตรวจสอบข้อมูล; เปิด unit test invalid-date ที่ เบราว์เซอร์ picker ป้อนยากได้ |
| 7     | เปิด My bookings แก้หัวข้อ ทำสำเนาไปวันถัดไป และ export ICS           | edit/save/duplicate/download ทำงาน FR-07                                                |
| 8     | ยกเลิกรายการที่เริ่มหลัง 24h; เปิด exact จุดตัดเวลายกเลิก test ประกอบ | cancellation success; ตรง/ต่ำกว่า 24h ไม่ผ่าน service SR-05                             |
| 9     | โชว์หัวข้อ `<img ...>` ผ่าน security E2E                              | เป็นข้อความ ไม่มี executable image SR-03                                                |
| 10    | เปิด dark mode/mobile และสถิติ                                        | layout ใช้งานได้/สถิติตรง FR-08                                                         |

Failure demo ของ storage ควรใช้ เบราว์เซอร์ profile ทดสอบแยกเพื่อไม่ทำลายข้อมูลที่กำลังนำเสนอ แล้วเปิด test corrupt/quota ซึ่งยืนยันว่าไม่มี silent overwrite

## สไลด์ 16 — สรุป อุปสรรคและ โอกาสปรับโครงสร้างต่อยอด

อุปสรรค: เดิม main.tsx รับหลายหน้าที่, การตรวจสอบข้อมูล ถูกเชื่อมกับ UI, persistence/export ทดสอบยาก แก้โดยแยก layer/contracts และ dependency injection

สิ่งที่ได้: เบราว์เซอร์ ต้นแบบ กับ business/security regression tests และ automatic deployment configuration/ในเครื่อง installation evidence

สิ่งที่ต้องต่อ: เซิร์ฟเวอร์ authentication/authorization, atomic database transactions, audit log, PII retention, QR/approval ตาม ขอบเขต ที่ทีมตกลง และหลักฐาน review/contribution จริง

## คำถามและคำตอบที่ควรซ้อม

**ทำไม TypeScript แทน Python?**

เป็น React เบราว์เซอร์ app ที่พัฒนาอยู่แล้ว จึงคง stack และใช้ TypeScript interfaces/classes/modules เพื่อแสดง SOLID อย่างเป็นรูปธรรม ไม่อ้าง Python/PEP 8 และต้องขอให้อาจารย์ยอมรับการใช้ภาษานี้ตามเกณฑ์

**ใช้ function components แล้วแสดง OOP อย่างไร?**

UI ใช้ function ตาม React ส่วน domain/application/infrastructure แสดง abstraction และ object composition ผ่าน service/validator/repository/adapter classes ไม่จำเป็นต้องบังคับให้ทุก UI เป็น class

**TypeScript interface พิสูจน์ LSP ได้เลยไหม?**

ไม่ได้ทั้งหมด compiler ตรวจรูปแบบ แต่ behavioral contract tests ของ memory/localStorage repository ตรวจ snapshot/replacement/service behavior เพิ่ม

**ทำไม การตรวจสอบข้อมูล ไม่ถือว่าป้องกันผู้ใช้โกงได้?**

เพราะผู้ใช้ควบคุม เบราว์เซอร์ และแก้ valid JSON/JavaScript ได้ จึงลด input errors และบาง malformed-data attacks แต่ trusted authorization/atomic rules ต้องอยู่ เซิร์ฟเวอร์

**CI ต่างจาก CD ตรงไหน?**

CI ตรวจ integration ด้วย quality/security/build/test gates ส่วน CD นำ artifact จาก revision ที่ผ่านไปติดตั้งอัตโนมัติบน host และตรวจผล installed revision จริง ไฟล์ YAML อย่างเดียวไม่ใช่หลักฐานว่ารันสำเร็จ

**มีอะไรยังไม่ครบเกณฑ์?**

ภาษา Python/PEP 8 หากเป็นข้อบังคับ, real team feature/review evidence และ ระยะไกล CI/CD ถ้ายังไม่ได้รัน รวมถึงความสามารถ บริการหลังบ้าน/QR/approval ที่อยู่นอก ขอบเขต ปัจจุบัน ต้องตอบตามสถานะจริง ไม่ยืนยันคะแนนล่วงหน้า
