"""โมเดล User ของระบบ SpaceBook"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """User ของระบบ พร้อมบทบาท (role) สำหรับตัดสิทธิ์แต่ละเมนู"""

    class Role(models.TextChoices):
        STUDENT = "student", "นักศึกษา"
        STAFF = "staff", "เจ้าหน้าที่"
        ADMIN = "admin", "ผู้ดูแลระบบ"

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_staff_role(self):
        """เจ้าหน้าที่หรือแอดมิน (ใช้ตรวจสิทธิ์ตอนอนุมัติการจอง)"""
        return self.role in (self.Role.STAFF, self.Role.ADMIN)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"