import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


class CheckInSession(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    title = models.CharField(max_length=200)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="checkin_sessions",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    @classmethod
    def create(cls, *, title, created_by, duration_minutes=5):
        return cls.objects.create(
            title=title,
            created_by=created_by,
            expires_at=timezone.now() + timedelta(minutes=duration_minutes),
        )

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at

    def __str__(self):
        return self.title


class CheckIn(models.Model):
    session = models.ForeignKey(
        CheckInSession,
        on_delete=models.CASCADE,
        related_name="check_ins",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="check_ins",
    )
    checked_in_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("session", "user"),
                name="unique_checkin_per_session_user",
            )
        ]
        ordering = ("-checked_in_at",)

    def __str__(self):
        return f"{self.user} - {self.session}"
