# KMITL Room Booking

Thai-first meeting room booking prototype, rebuilt from the supplied KMITL capture. React 18, TypeScript, Vite, Tailwind v4, Motion, Radix Dialog, Zustand, React Router, and date-fns.

## Run

```sh
npm install
npm run dev
```

All five rooms start with zero bookings. The optional demo button adds two bookings to the selected date. Clear data restores an empty schedule after confirmation. Bookings and the mock role persist locally. The tour appears on first visit and dark mode is saved separately.

## Architecture overview

- `src/main.tsx` mounts the framework providers; `src/App.tsx` coordinates pages and dialogs.
- `src/components/` contains focused timeline, booking form/list, statistics, navigation, and dialog components.
- `src/domain/` contains room data, extensible validation rules, cancellation policy, conflict detection, selectors, and booking factories.
- `src/services/` contains booking use cases, pure ICS serialization, browser downloads, and preference handling.
- `src/repositories/` contains booking repositories and storage adapters.
- `src/types/` defines shared models and small contracts; `src/utils/` holds date/time and class-name helpers.
- `src/state/` adapts successful service results to in-memory Zustand state. Persistence is owned by the repository, not state middleware.
- `src/compositionRoot.ts` wires concrete dependencies. Thin `domain.ts` and `store.ts` compatibility exports preserve original consumers.

See [Architecture and SOLID](docs/architecture-and-solid.md) for component/class responsibilities, Mermaid diagrams, actual code examples, design trade-offs, the rubric mapping, and an English/Thai presentation explanation.

## How SOLID is applied

| Principle | Concrete evidence                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------- |
| SRP       | UI, validation, use cases, persistence, calendar serialization, and downloads are separate                             |
| OCP       | `BookingRulesValidator` accepts additional ordered rule functions without changing its algorithm                       |
| LSP       | Memory/localStorage repositories and storage adapters pass shared behavioral contracts                                 |
| ISP       | Focused `BookingRepository`, `StorageAdapter`, `BookingValidator`, `CalendarExporter`, and `FileDownloader` interfaces |
| DIP       | `BookingService` receives repository/validator/clock/ID dependencies; the repository receives a storage interface      |

## Technology Stack and Rubric Compatibility

The implementation remains React and TypeScript. SOLID principles are language-independent object-oriented design principles; TypeScript interfaces, classes, modules, and constructor dependency injection provide the architectural equivalents used here. Python and PEP 8 requirements have **not** been fulfilled or claimed. PEP 8 is Python-specific; this code uses strict TypeScript, PascalCase/camelCase naming, modular responsibilities, and Prettier formatting instead. Common ESLint-style conventions are used, but ESLint is not installed. The documentation maps the architecture criteria to the actual TypeScript implementation; instructor approval of language-specific requirements is separate.

## Validation commands

```sh
npm run build
npm test
npx playwright install chromium  # first-time browser setup
npm run test:e2e
npm run format:check
```

`npm test` runs the original domain tests plus validation, service, repository/storage contract, persistence-failure, and calendar serialization tests. `npm run test:e2e` runs the existing workflow suite on desktop and mobile viewports. `npm run format` formats source, tests, documentation, and configuration.

## Booking and persistence behavior

The timeline supports pointer drag in either direction, click, and keyboard Enter. Use the booking dialog on touch devices if horizontal scrolling makes dragging inconvenient. Times are Thailand time (UTC+7); date captions use the Thai Buddhist calendar, while the native date input follows browser locale. Invalid calendar dates, past starts, invalid durations, overlaps, bad contact details, and excess capacity are rejected. Cancellation requires **more than 24 hours** before start and is enforced by the service as well as the UI.

Existing bookings retain the `kmitl-booking-v1` key and original saved envelope. Legacy role values are read as fallback; new role selections use `kmitl-role`. Corrupt/unsupported saved data is reported and preserved rather than silently reset. A failed booking write leaves in-memory booking state unchanged. Optional theme/tutorial/role preferences still work for the session if preference storage fails.

## Known prototype limitations

- Roles are mock identities, with a shared browser workspace rather than real user accounts. No backend, institutional login, authorization, email delivery, or server approval workflow exists.
- LocalStorage is specific to this browser/origin. No cross-device locking, cross-tab live updates, or atomic multi-client conflict protection exists. An API-backed version needs asynchronous interfaces and server transactions.
- Corrupt saved data requires manually repairing/removing its storage key after preserving needed data; it is not automatically overwritten.
- Wi-Fi is not confirmed in the provided equipment catalog; its filter yields no verified rooms.
- Date captions are Thai/Buddhist; the native picker and date grouping retain browser calendar behavior.
- Demo bookings intentionally bypass future-time rules for showcasing selected dates, but normal saves do not.
- Calendar export handles basic event fields, escaping, and UTC times; recurrence and invitation delivery remain future work. UTF-8 line folding and safe filenames are implemented.
- Room photos are copied from the user's saved HTML companion folder. PWA manifest/icon metadata exists; offline caching and service-worker installation remain future work.

## ชุดหลักฐานตามเกณฑ์อาจารย์ทั้งสองท่าน

เริ่มที่ [Rubric Coverage](docs/rubric-coverage.md) เพื่อดูส่วนที่ทำจริงและส่วนที่ยังต้องมีหลักฐาน/การยอมรับจากอาจารย์ โดยเฉพาะ **Python/PEP 8** ซึ่ง TypeScript ไม่ได้ทำให้ผ่านข้อกำหนดภาษานี้โดยอัตโนมัติ

- [Architecture / Class Diagram / SOLID](docs/architecture-and-solid.md)
- [Threat Model: DFD, Misuse Cases, Asset List, Security Requirements](docs/threat-model.md)
- [Risk Register](docs/risk-register.md) และ [CSV](docs/risk-register.csv)
- [Secure Coding และ Refactor พร้อม test references](docs/secure-coding.md)
- [Traceability Matrix](docs/traceability-matrix.md)
- [Git Collaboration และประวัติที่ตรวจพบจริง](docs/team-collaboration.md)
- [Automatic Installation / CI / CD / ผลติดตั้ง](docs/deployment-and-ci-cd.md)
- [เนื้อหาสไลด์ 16 หน้า / Live Demo / Q&A ภาษาไทย](docs/presentation-guide.md)

## Automatic deployment

```sh
npm run test:deployment
npm run deploy:local
npm run serve:deployment
# เปิดอีก terminal
npm run smoke:deployment
```

Local installed preview: `http://127.0.0.1:5190`; หลักฐาน smoke อยู่ใน `docs/evidence/local-deployment.json` ส่วน `.github/workflows/ci-cd.yml` เตรียม CI สำหรับทุก push/PR และ Pages CD หลัง main ผ่าน checks ต้องเปิด Pages source เป็น GitHub Actions และมี remote run/deployed URL จริงก่อนอ้างว่าติดตั้งสำเร็จบน GitHub

Security additions ได้แก่ runtime type/length limits, persisted schema/count/byte limits, stored-XSS regression, safe calendar escaping/UTF-8 folding, static response headers และ SHA-pinned/least-privilege Actions ดูข้อจำกัดเรื่อง mock role/PII/localStorage ใน Threat Model ก่อนใช้ข้อมูลจริง

## Verified public deployment

เว็บไซต์: [KMITL Room Booking](https://pootanapat.github.io/smart-campus-booking/)

PR [#3](https://github.com/Pootanapat/smart-campus-booking/pull/3) merge ตามการอนุญาตของเจ้าของงานแล้ว ผล CI, Pages build, deploy และ HTTPS/revision verification ผ่านจริงใน [Actions run 41059099454](https://github.com/Pootanapat/smart-campus-booking/actions/runs/41059099454) สำหรับ revision `6d753268cb1d93a5a64464b19acfcc07785fcdc2` ดู [artifact](docs/evidence/pages-deployment.json) และ [live desktop/mobile checks](docs/evidence/live-browser.json)

นี่เป็นหลักฐานของ revision ที่ระบุ ไม่ใช่การอ้างว่าการแก้เอกสารภายหลังอยู่ใน deployment เดิม ทุก deployment ใหม่ตรวจ revision และสร้าง artifact ของตนเอง ยังต้องยืนยัน Python/PEP 8 กับอาจารย์ และเก็บ feature contribution/peer review จริงของทีมเพิ่มเติม
