from django.contrib import admin

from .models import CheckIn, CheckInSession


@admin.register(CheckInSession)
class CheckInSessionAdmin(admin.ModelAdmin):
    list_display = ("title", "created_by", "created_at", "expires_at", "is_active")
    list_filter = ("is_active", "created_at")
    search_fields = ("title", "created_by__username")
    readonly_fields = ("token", "created_at")


@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):
    list_display = ("session", "user", "checked_in_at")
    list_filter = ("checked_in_at",)
    search_fields = ("session__title", "user__username")
    readonly_fields = ("session", "user", "checked_in_at")
