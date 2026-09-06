from datetime import timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from accounts.models import User

from .models import CheckIn, CheckInSession


class CheckInFlowTests(TestCase):
    def setUp(self):
        self.staff = User.objects.create_user(
            username="staff",
            password="password",
            role=User.Role.STAFF,
        )
        self.student = User.objects.create_user(
            username="student",
            password="password",
            role=User.Role.STUDENT,
        )
        self.session = CheckInSession.create(
            title="Lecture 1",
            created_by=self.staff,
        )

    def test_staff_can_create_a_session(self):
        self.client.force_login(self.staff)
        response = self.client.post(
            reverse("checkins:create_session"),
            {"title": "Lecture 2", "duration": "10"},
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(CheckInSession.objects.count(), 2)

    def test_student_can_check_in_only_once(self):
        self.client.force_login(self.student)
        url = reverse("checkins:scan_checkin", kwargs={"token": self.session.token})

        response = self.client.post(url)
        self.assertRedirects(response, url)
        self.assertEqual(CheckIn.objects.count(), 1)

        self.client.post(url)
        self.assertEqual(CheckIn.objects.count(), 1)

    def test_expired_session_cannot_accept_check_in(self):
        self.session.expires_at = timezone.now() - timedelta(minutes=1)
        self.session.save(update_fields=["expires_at"])
        self.client.force_login(self.student)

        response = self.client.post(
            reverse("checkins:scan_checkin", kwargs={"token": self.session.token})
        )
        self.assertEqual(response.status_code, 410)
        self.assertEqual(CheckIn.objects.count(), 0)
