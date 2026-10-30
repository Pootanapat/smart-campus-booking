# ตรวจเกณฑ์การประเมิน SDD2: สถานะและหลักฐาน

เอกสารนี้อิงระบบ React/TypeScript ที่ทำงานอยู่จริง แยก **ทำแล้วและทดสอบในเครื่อง**, **เตรียม configuration แล้ว**, และ **ยังต้องมีหลักฐานจากทีม/แพลตฟอร์ม** ไม่ใช้สถานะเอกสารแทนผลการทำงานจริง

## อ.ไพบูลย์

| เกณฑ์                                | น้ำหนัก | สิ่งที่เตรียม / หลักฐาน                                                                                                                | สถานะและข้อจำกัด                                                                                                             |
| ------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| สถาปัตยกรรมระบบและการออกแบบเชิงวัตถุ | 30%     | [Architecture/SOLID](architecture-and-solid.md), component/class/data-flow diagrams, constructor injection, repository contract tests  | โครงสร้างและหลักฐาน TypeScript มีแล้ว แต่ข้อกำหนด **SOLID ใน Python** ยังไม่ตรงภาษา ต้องให้อาจารย์ยอมรับ TypeScript ก่อน     |
| คุณภาพโค้ดและการพัฒนาโปรแกรม         | 20%     | strict TypeScript, Prettier, ขณะทำงาน การตรวจสอบข้อมูล, exception handling, modular code, [การเขียนโค้ดอย่างปลอดภัย](secure-coding.md) | ทดสอบได้ใน TypeScript; **ไม่ใช่ Python และไม่ผ่าน PEP 8 โดยการเทียบชื่อเฉย ๆ**                                               |
| Git และการทำงานร่วมกัน               | 15%     | [Workflow/ประวัติจริง](team-collaboration.md), feature branch, PR template, CI                                                         | พบประวัติจริง 5 author ใน repository เดิม ส่วนใหญ่เป็น README; ต้องมี feature contribution และ review จริงของสมาชิกเพิ่มเติม |
| การสาธิตและความสมบูรณ์ของระบบ        | 20%     | [Demo script](presentation-guide.md), unit/เบราว์เซอร์/deployment checks                                                               | ขอบเขตจองห้องใช้งานได้; authentication/approval/QR จริงยังไม่ได้ทำและไม่นับว่าเสร็จ                                          |
| การนำเสนอและการตอบคำถาม              | 15%     | [เนื้อหานำเสนอและคำถาม](presentation-guide.md), design decisions และ trade-offs                                                        | มีแนวพูด/หลักฐานให้ซ้อม ทีมต้องเข้าใจและตอบด้วยตนเอง                                                                         |

## อ.สุระชัย

| เกณฑ์                                       | น้ำหนัก | สิ่งที่เตรียม / หลักฐาน                                                                                                                                                  | สถานะและข้อจำกัด                                                                                                                                                                                                                                                       |
| ------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| การวิเคราะห์ภัยคุกคาม                       | 20%     | [แบบจำลองภัยคุกคาม](threat-model.md): DFD, trust boundaries, misuse cases, **รายการทรัพย์สิน** (ตีความคำว่า Asses List), STRIDE, security requirements                   | วิเคราะห์ตามระบบ localStorage จริง แยกภัยที่ควบคุมได้กับช่องว่างที่ยังแก้ไม่ได้                                                                                                                                                                                        |
| ทะเบียนความเสี่ยง                           | 10%     | [ทะเบียนความเสี่ยง](risk-register.md), [CSV](risk-register.csv)                                                                                                          | มี likelihood/impact/score/ผู้รับผิดชอบ role/mitigation/คงเหลือ/status; เป็นการประเมินเชิงคุณภาพของทีม ไม่ใช่สถิติเหตุการณ์                                                                                                                                            |
| การเขียนโค้ดอย่างปลอดภัยและการปรับโครงสร้าง | 20%     | [การเขียนโค้ดอย่างปลอดภัย](secure-coding.md), `src/security/`, rule/service/repository separation, regression/security tests                                             | มีโค้ดและชื่อ test อ้างอิงได้; เบราว์เซอร์ การตรวจสอบข้อมูล ไม่ใช่ การตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์                                                                                                                                                                        |
| ตารางตรวจสอบย้อนกลับ                        | 10%     | [Traceability](traceability-matrix.md): FR/SR → threat/risk → code → test → evidence                                                                                     | รายการที่ยังไม่ทำแสดงเป็น อยู่ในแผนและยังไม่ดำเนินการ ไม่อ้างว่ามี บริการหลังบ้าน                                                                                                                                                                                      |
| การติดตั้งอัตโนมัติ: CI + CD และผลติดตั้ง   | 40%     | [Deployment](deployment-and-ci-cd.md), `.github/workflows/ci-cd.yml`, static installer/เซิร์ฟเวอร์, provenance, [ผล ในเครื่อง smoke](evidence/ในเครื่อง-deployment.json) | ในเครื่อง installation และ ระยะไกล CI/CD ผ่านจริงแล้ว: [run 41059099454](https://github.com/Pootanapat/smart-campus-booking/actions/runs/41059099454), [เว็บไซต์](https://pootanapat.github.io/smart-campus-booking/), [artifact JSON](evidence/pages-deployment.json) |

## ขอบเขตที่ใช้ประเมิน

**ทำจริง:** 5 ห้อง, ค้นหา/กรอง, availability timeline, จอง/แก้ไข/ยกเลิก (>24 ชั่วโมง), ตรวจ overlap/adjacent/capacity/date/contact, demo/reset, persistence, การส่งออกปฏิทิน, statistics, dark mode, responsive UI, error handling และ automated checks

**ยังไม่ได้ทำ:** institutional login, เซิร์ฟเวอร์-side role/ownership authorization, approval workflow จริง, QR check-in/out, database, audit trail ที่ป้องกันการแก้ไข, multi-user atomic transactions

README เดิมบน repository กล่าวถึง Python/Django/FastAPI, approval และ QR แต่เป็นแผนเดิม ไม่ใช่หลักฐานว่าระบบปัจจุบันมีความสามารถเหล่านั้น การนำเสนอควรใช้ขอบเขตปัจจุบันและบอก roadmap อย่างชัดเจน

## ก่อนวันนำเสนอ

1. ยืนยันกับ อ.ไพบูลย์เรื่องการใช้ TypeScript แทน Python; ถ้าบังคับ Python ต้องปรับแผนโครงงานร่วมกันก่อน ไม่แก้ด้วยเอกสารอ้างเทียบ
2. ให้สมาชิกทำงานจริงบน feature branches และเปิด PR ให้เพื่อน review; เก็บ URL จริง ไม่สร้าง commit ย้อนหลังหรือเปลี่ยน author เพื่อเพิ่มคะแนน
3. GitHub Pages เปิดใช้งานและ CI/CD สำเร็จแล้ว ให้เปิด run URL, commit SHA, สภาพแวดล้อมเผยแพร่จริง URL และ artifact ที่บันทึกไว้ และยืนยัน revision ล่าสุดก่อนนำเสนอ
4. ซ้อม demo ตาม FR/SR และเปิด code/test ในจุดที่ตรง matrix; ใช้ข้อมูลสมมติเท่านั้น
5. บันทึกคำอธิบายความเสี่ยงคงเหลือ โดยเฉพาะ localStorage และ บทบาทจำลอง เพื่อไม่ให้สื่อว่าพร้อมใช้จริงกับข้อมูลบุคคล

## ผลยืนยันจริงหลังการอนุมัติ Deploy (30 ตุลาคม 2569)

PR [#3](https://github.com/Pootanapat/smart-campus-booking/pull/3) merge แล้วตามการอนุญาตของเจ้าของงาน ไม่ได้อ้างว่าเป็น technical peer review ของสมาชิกทีม

- URL ที่ติดตั้ง: https://pootanapat.github.io/smart-campus-booking/
- CI / Pages build / deploy / post-install verification: [run 41059099454](https://github.com/Pootanapat/smart-campus-booking/actions/runs/41059099454) สำเร็จทุก job
- Revision ของหลักฐานชุดนี้: `6d753268cb1d93a5a64464b19acfcc07785fcdc2`
- [Deployment JSON ที่ดาวน์โหลดจาก artifact ของ Actions จริง](evidence/pages-deployment.json)
- [ผล เบราว์เซอร์ verification บน public URL จริง](evidence/live-เบราว์เซอร์.json), [ภาพ desktop](evidence/live-desktop.png), [ภาพ mobile](evidence/live-mobile.png)

หลักฐานนี้อ้าง revision/run ที่ระบุ ไม่อ้างว่าเอกสารที่แก้ภายหลังถูก deploy ใน run เดิม เงื่อนไขภาษา Python/PEP 8 และงาน feature/peer review ของสมาชิกยังคงต้องจัดการตามตาราง ไม่ได้ปิดด้วยผล deploy
