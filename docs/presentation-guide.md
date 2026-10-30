# เนื้อหานำเสนอ SDD2 และ Live Demo Script

ใช้เป็นต้นฉบับจัดสไลด์ 16 หน้าโดยประมาณ เน้นเปิดหลักฐานประกอบ ไม่อ่านโค้ดทุกบรรทัด เวลาแต่ละช่วงเป็นข้อเสนอให้ทีมปรับตามเวลาที่อาจารย์กำหนด

## Slide 1 — ชื่อโครงงาน / ทีม / ขอบเขตปัจจุบัน

**KMITL Room Booking — ระบบจองห้องประชุม**

React/TypeScript browser prototype สำหรับ 5 ห้อง ชั้น 7 อาคารสำนักงานอธิการบดี ใส่ชื่อ/รหัสสมาชิกทั้ง 6 คนตามรายชื่อจริงและแบ่งผู้พูดเอง ไม่ใช้ Git author list แทนรายชื่อทีม

## Slide 2 — บทนำ ความเป็นมาและความสำคัญ

การเลือกห้อง/เวลาโดยไม่มีภาพรวมทำให้ตรวจช่วงว่างและจำนวนที่นั่งยาก ระบบจึงแสดงหลายห้องบน timeline เดียวและตรวจข้อจำกัดก่อนบันทึก นี่คือโจทย์ที่โครงงานมุ่งแก้ ไม่ได้อ้างว่าระบบ KMITL เดิมมี incident หรือข้อบกพร่องที่ยังไม่มีข้อมูลยืนยัน

## Slide 3 — วัตถุประสงค์และ Scope & Capabilities

- ค้นหา 5 ห้องตามชื่อ/หมายเลข/ความจุ/อุปกรณ์ และดูตารางวันเดียวกัน
- จอง/แก้ไข/ยกเลิก พร้อม validation และ cutoff
- เก็บข้อมูลใน browser, export ICS, สถิติ และ responsive/dark mode
- นอกขอบเขตที่เสร็จ: institutional auth, trusted approval, QR check-in, backend/database, real multi-user protection

เปิด FR-01–FR-09 ใน [Traceability](traceability-matrix.md)

## Slide 4 — Layered Architecture / Component Diagram

นำ diagram จาก [Architecture](architecture-and-solid.md) อธิบาย presentation → application → domain/contracts → infrastructure และ composition root

พูดจุดสำคัญ: React แสดงผล, `BookingService` ประสาน use case, validator ตรวจ policy, repository จัดเก็บ, store เป็น state view แยกจาก localStorage

## Slide 5 — Class Diagram และ Responsibilities

เปิด class/interface diagram จริง: BookingService → BookingRepository/BookingValidator/Clock; repository → StorageAdapter; CalendarExporter แยก FileDownloader

ยกตัวอย่างว่าการเปลี่ยน persistence ไม่ต้องแก้ form ถ้ายังคง synchronous contract ส่วน remote API ต้องเปลี่ยน async contract อย่างชัดเจน ไม่กล่าวว่าเปลี่ยนได้ทันทีทุก backend

## Slide 6 — SOLID / Cohesion / Coupling พร้อมโค้ด 2 จุด

1. constructor injection ของ BookingService: SRP/DIP/ISP และ dependency จาก interface
2. ordered BookingRule list: เพิ่ม policy ได้โดยไม่แก้ validator loop (OCP); ใช้ shared repository tests อธิบาย LSP

High Cohesion: module รวมหน้าที่เดียวกัน Low Coupling: UI/use cases ไม่เรียก localStorage โดยตรง

แจ้งชัด: TypeScript ไม่ใช่ Python/PEP 8 ต้องยืนยันการยอมรับกับอาจารย์ การอธิบาย SOLID เทียบภาษาไม่ใช่การผ่านเงื่อนไขภาษาโดยอัตโนมัติ

## Slide 7 — Git Collaboration

เปิด `git log --graph --oneline --all` และ PR/review URL จริง ใช้ [ประวัติและ workflow](team-collaboration.md)

แสดง feature branch → PR → peer review → CI → merge → CD ประวัติเดิมที่มีหลาย author ส่วนใหญ่เป็น README จึงต้องแสดง feature contribution จริงเพิ่ม ไม่อ้างชื่อใน README ว่าทำโค้ดแล้ว

## Slide 8 — Threat Modeling ด้วย DFD / Trust Boundaries

เปิด Context และ Level-1 DFD จาก [Threat Model](threat-model.md)

ชี้ F1 input, F4 untrusted JSON, F7 export, F9–F12 CI/hosting และอธิบายว่า browser code/localStorage ไม่ใช่ trusted authorization boundary

## Slide 9 — Asset List / Misuse Case / STRIDE

Assets: booking data, PII, source/artifact, deployment permissions

Misuse ที่สาธิตได้: malicious meeting title, invalid/oversized JSON, overlap/cutoff และ ICS injection ชี้ว่า role spoofing/valid JSON tampering ยังเป็น open risk

## Slide 10 — Security Requirements / Risk Register

ใช้ SR-01 ถึง SR-11 จาก threat model และเปิด [Risk Register](risk-register.md)

ตัวอย่าง: R-03 stored XSS มี React text rendering + test ลด likelihood แต่ R-05 mock authorization ยัง residual 20 เพราะยังไม่มี backend ไม่ปรับ risk เป็น low เพียงเพราะมี warning

## Slide 11 — Secure Coding และ Refactor

เปิด [Secure Coding](secure-coding.md), `security/bookingBoundary.ts`, `BookingRulesValidator` และ calendar serializer

แสดงหลักการ runtime validation, untrusted stored data, safe text rendering, output escaping, fail-safe write และ least privilege ใน workflow พร้อมชี้ test ที่ตรวจจริง

## Slide 12 — Traceability Matrix

ยกเส้นทาง FR-03 → T-01 → R-01 → SR-01 → BookingService/validator → overlap/edit test

อีกตัวอย่าง T-04 → SR-04 → IcsCalendarExporter → security unit test แสดงวิธีตรวจกลับว่าทุก control มี implementation/evidence อะไร และอะไรยัง planned

## Slide 13 — CI: ตรวจอะไรและเกิดเมื่อใด

เปิด workflow และ Actions run จริง: `npm ci`, formatting, audit, unit/security, deployment test, build, browser desktop/mobile บน artifact

กดดู log/failed example ที่เกิดขึ้นจริงได้ ถ้ายังไม่มี run ให้ระบุว่า workflow prepared และห้ามใช้ local console แทน remote run

## Slide 14 — CD และผลติดตั้ง (เกณฑ์ 40%)

แสดง main CI pass → Pages artifact → OIDC deploy → HTTPS/revision check

หลักฐาน: run URL, commit SHA, deployed URL, `/deployment.json`, artifact `production-deployment-evidence` แล้วเปิดเว็บที่ติดตั้งจริง ถ้ามีเฉพาะ local installation ต้องพูดว่าเป็น local ไม่ใช่ GitHub CD

## Slide 15 — Live Demo: Main Use Cases และ Edge Cases

| ลำดับ | ทำอะไร                                                        | ผลที่ต้องเห็น / Traceability                                                  |
| ----- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1     | เปิด installed URL ใช้ข้อมูลสมมติ ล้างข้อมูลหลัง confirmation | 5 ห้อง ไม่มี booking, FR-06                                                   |
| 2     | ค้นหา “701” หรือ Bunnag แล้วเลือก capacity 100                | เหลือบุนนาค FR-01                                                             |
| 3     | เลือกวันอนาคต ลาก 09:00 ถึง 10:00                             | form เป็น 09:00–10:30 เพราะรวม half-hour ช่องสุดท้าย FR-02                    |
| 4     | กรอกข้อมูลสมมติ review/confirm และ reload                     | ยังเห็นรายการเดิม FR-03/FR-05                                                 |
| 5     | จองห้องเดียวกันเวลา overlap หรือแก้ไปชนอีก booking            | error ไม่มีการเพิ่มรายการซ้ำ SR-01                                            |
| 6     | ทดสอบ email/phone ผิด หรือ attendees เกิน capacity            | ไม่ผ่าน validation; เปิด unit test invalid-date ที่ browser picker ป้อนยากได้ |
| 7     | เปิด My bookings แก้หัวข้อ ทำสำเนาไปวันถัดไป และ export ICS   | edit/save/duplicate/download ทำงาน FR-07                                      |
| 8     | ยกเลิกรายการที่เริ่มหลัง 24h; เปิด exact cutoff test ประกอบ   | cancellation success; ตรง/ต่ำกว่า 24h ไม่ผ่าน service SR-05                   |
| 9     | โชว์หัวข้อ `<img ...>` ผ่าน security E2E                      | เป็นข้อความ ไม่มี executable image SR-03                                      |
| 10    | เปิด dark mode/mobile และสถิติ                                | layout ใช้งานได้/สถิติตรง FR-08                                               |

Failure demo ของ storage ควรใช้ browser profile ทดสอบแยกเพื่อไม่ทำลายข้อมูลที่กำลังนำเสนอ แล้วเปิด test corrupt/quota ซึ่งยืนยันว่าไม่มี silent overwrite

## Slide 16 — สรุป อุปสรรคและ Refactoring Opportunities

อุปสรรค: เดิม main.tsx รับหลายหน้าที่, validation ถูกเชื่อมกับ UI, persistence/export ทดสอบยาก แก้โดยแยก layer/contracts และ dependency injection

สิ่งที่ได้: browser prototype กับ business/security regression tests และ automatic deployment configuration/local installation evidence

สิ่งที่ต้องต่อ: server authentication/authorization, atomic database transactions, audit log, PII retention, QR/approval ตาม scope ที่ทีมตกลง และหลักฐาน review/contribution จริง

## Q&A ที่ควรซ้อม

**ทำไม TypeScript แทน Python?**

เป็น React browser app ที่พัฒนาอยู่แล้ว จึงคง stack และใช้ TypeScript interfaces/classes/modules เพื่อแสดง SOLID อย่างเป็นรูปธรรม ไม่อ้าง Python/PEP 8 และต้องขอให้อาจารย์ยอมรับการใช้ภาษานี้ตามเกณฑ์

**ใช้ function components แล้วแสดง OOP อย่างไร?**

UI ใช้ function ตาม React ส่วน domain/application/infrastructure แสดง abstraction และ object composition ผ่าน service/validator/repository/adapter classes ไม่จำเป็นต้องบังคับให้ทุก UI เป็น class

**TypeScript interface พิสูจน์ LSP ได้เลยไหม?**

ไม่ได้ทั้งหมด compiler ตรวจรูปแบบ แต่ behavioral contract tests ของ memory/localStorage repository ตรวจ snapshot/replacement/service behavior เพิ่ม

**ทำไม validation ไม่ถือว่าป้องกันผู้ใช้โกงได้?**

เพราะผู้ใช้ควบคุม browser และแก้ valid JSON/JavaScript ได้ จึงลด input errors และบาง malformed-data attacks แต่ trusted authorization/atomic rules ต้องอยู่ server

**CI ต่างจาก CD ตรงไหน?**

CI ตรวจ integration ด้วย quality/security/build/test gates ส่วน CD นำ artifact จาก revision ที่ผ่านไปติดตั้งอัตโนมัติบน host และตรวจผล installed revision จริง ไฟล์ YAML อย่างเดียวไม่ใช่หลักฐานว่ารันสำเร็จ

**มีอะไรยังไม่ครบเกณฑ์?**

ภาษา Python/PEP 8 หากเป็นข้อบังคับ, real team feature/review evidence และ remote CI/CD ถ้ายังไม่ได้รัน รวมถึงความสามารถ backend/QR/approval ที่อยู่นอก scope ปัจจุบัน ต้องตอบตามสถานะจริง ไม่ยืนยันคะแนนล่วงหน้า
