# Risk Register

ขอบเขต: prototype React/TypeScript + localStorage + static deployment; owner ระบุเป็นบทบาทที่ทีมต้องมอบหมายผู้รับผิดชอบจริง ไม่ใช่หลักฐาน contribution

Likelihood (L) และ Impact (I) ให้ 1–5; Score = L×I: 1–5 ต่ำ, 6–10 ปานกลาง, 11–15 สูง, 16–25 วิกฤต ค่าประเมินเป็น judgement จากลักษณะระบบ ยังไม่มีข้อมูลเหตุการณ์เชิงสถิติ ความเสี่ยงคงเหลือประเมินหลัง controls ที่มีจริงเท่านั้น

| Risk | Threat / ปัญหา                                       | L   | I   | ก่อนควบคุม | Mitigation ที่มีจริง                                                  | Owner role             | Residual L×I | สถานะ / งานที่ยังต้องทำ                                                 |
| ---- | ---------------------------------------------------- | --- | --- | ---------- | --------------------------------------------------------------------- | ---------------------- | ------------ | ----------------------------------------------------------------------- |
| R-01 | T-01 จองทับหรือข้าม cutoff ผ่าน app                  | 3   | 3   | 9          | rules/service gate, regression tests                                  | Booking lead           | 1×3 = 3      | mitigated ภายใน use cases; valid storage tampering แยก R-05             |
| R-02 | T-02 JSON ผิดรูป/ใหญ่/IDs ซ้ำ ทำ UI เสีย             | 3   | 3   | 9          | schema, byte/count limits, error และไม่ overwrite                     | Persistence lead       | 2×3 = 6      | partial; ไม่มี UI recovery/backup                                       |
| R-03 | T-03 Stored XSS จากหัวข้อประชุม                      | 3   | 5   | 15         | React text rendering, malicious text E2E, local CSP                   | Frontend/security lead | 1×5 = 5      | mitigated เฉพาะ rendering path ที่ทดสอบ; ไม่ใช้ raw HTML                |
| R-04 | T-04 ICS injection / filename อันตราย                | 3   | 3   | 9          | escaping, UTF-8 folding, safe filename, unit tests                    | Export lead            | 1×3 = 3      | mitigated serializer path                                               |
| R-05 | T-05 mock role ไม่มี trusted authorization           | 5   | 4   | 20         | ระบุว่าเป็น prototype; ไม่เปิดใช้กับข้อมูลจริงหลายคน                  | Backend/auth lead      | 5×4 = 20     | **open** ต้องมี server identity/ownership authorization                 |
| R-06 | T-06 PII อยู่ใน localStorage/shared profile          | 4   | 4   | 16         | ใช้ข้อมูลสมมติ, explicit export/reset, ไม่มี password/token           | Security/privacy lead  | 3×4 = 12     | **open** ต้องมี storage/retention/access-control สำหรับ production      |
| R-07 | T-07 dependency/workflow supply chain                | 3   | 5   | 15         | lockfile, audit, SHA-pinned actions, least privilege, review template | CI/CD lead             | 2×5 = 10     | partial; ต้องมี review/branch protection และ run จริง                   |
| R-08 | T-08 ไม่มี audit trail ที่เชื่อถือได้                | 4   | 3   | 12         | ไม่อ้างว่าข้อมูล browser เป็นหลักฐานผู้กระทำ                          | Backend/audit lead     | 4×3 = 12     | **open** ต้องมี server audit log                                        |
| R-09 | T-09 สอง tab/หลายเครื่องจองชนกัน                     | 4   | 3   | 12         | ตรวจ snapshot ล่าสุดก่อน save ภายใน synchronous flow                  | Backend/booking lead   | 4×3 = 12     | **open** ต้อง atomic database transaction; ไม่มี server ในปัจจุบัน      |
| R-10 | ภาษาและ scope ต่างจาก Python/QR/approval ที่ระบุเดิม | 4   | 5   | 20         | scope/gap matrix ชัดเจน, เตรียมคำอธิบาย TypeScript                    | PM                     | 4×5 = 20     | **open** ต้องยืนยันกับอาจารย์; ไม่ลดคะแนนความเสี่ยงด้วยเอกสารอย่างเดียว |
| R-11 | CI/CD ยังไม่รันหรือ Pages ยังไม่เปิด                 | 4   | 5   | 20         | workflow, local installer/test, deployment runbook                    | CI/CD lead             | 3×5 = 15     | pending remote evidence; ปรับสถานะเมื่อมี URL/run สำเร็จจริง            |
| R-12 | contribution/review ของทีมไม่ครบ                     | 4   | 4   | 16         | อ้างประวัติจริง, feature branching/PR template, เสนอ work packages    | PM/team                | 4×4 = 16     | **open** ต้องมีงานและ peer review จริง ไม่สร้างย้อนหลัง                 |

CSV สำหรับเปิดใน spreadsheet: [risk-register.csv](risk-register.csv)

## แนวทางติดตาม

ก่อนนำเสนอให้ owner แต่ละคนอัปเดตวันที่และ URL หลักฐานใน PR/review record ไม่เปลี่ยนรายการ open เป็น closed เพียงเพราะเขียนแผนไว้ การยอมรับ residual risk ของ prototype ต้องแยกจากการอนุญาตใช้กับข้อมูลจริง หากมีการเพิ่ม backend/QR/approval ให้ทบทวน DFD, misuse cases, requirements และ risk ใหม่
