# 🏫 SpaceBook – Smart Campus Booking & QR Check-in

ระบบจองห้อง/อุปกรณ์ภายในมหาวิทยาลัย พร้อมระบบอนุมัติ
และเช็กอินด้วย QR Code
(โปรเจกต์วิชา SDD2 — สจล.)

## การติดตั้งและรันโปรเจกต์

1. สร้าง virtual environment แล้ว activate
   - Git Bash: `source venv/Scripts/activate`
   - cmd: `venv\Scripts\activate`
2. `pip install -r requirements.txt`
3. (ไม่บังคับ) ก๊อป `.env.example` เป็น `.env`
4. `python manage.py makemigrations accounts`
5. `python manage.py migrate`
6. `python manage.py runserver`

## สมาชิกในกลุ่ม

| ชื่อ | รหัส | หน้าที่ |
| --- | --- | --- |
| Pootanapat | 68030231 | PM + Booking Logic |
| ... | ... | Auth + User |
| ... | ... | Facility |
| ... | ... | Booking + Approval |
| ... | ... | QR + Check-in |
| ... | ... | Dashboard + Testing |

## Tech Stack

- Python + Django
- SQLite
- Bootstrap 5
- qrcode

ดูกฎการทำงานร่วมกันที่ `CONTRIBUTING.md`