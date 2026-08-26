# 🏫 SpaceBook – Smart Campus Booking & QR Check-in

ระบบจองห้อง/อุปกรณ์ภายในมหาวิทยาลัย พร้อมระบบอนุมัติ
และ Check-in ด้วย QR Code
(โปรเจกต์วิชา Software Design and Development 2 – KMITL)

## ✨ Features
- เข้าสู่ระบบแยกบทบาท (นักศึกษา / เจ้าหน้าที่ / แอดมิน)
- จัดการข้อมูลห้องและอุปกรณ์
- ค้นหาและตรวจสอบตารางว่าง
- สร้างคำขอจอง + ระบบป้องกันการจองซ้ำ
- อนุมัติ / ปฏิเสธคำขอจอง
- QR Code สำหรับ Check-in / Check-out
- Dashboard สรุปสถิติการใช้งาน

## 🛠 Tech Stack
- Python 3.11+
- Django / FastAPI
- SQLite / PostgreSQL
- Bootstrap 5
- qrcode, pytest

## 👥 Team Members
| ชื่อ | หน้าที่ |
| --- | --- |
| Pootanapat | PM + Booking Logic |
| Chaonai | Auth + User |
| Napat | Facility Management |
| ... | Booking + Approval |
| Teekathat | QR + Check-in |
| Nattaphop| Dashboard + Testing |

## 🚀 Getting Started
pip install -r requirements.txt
python manage.py runserver
