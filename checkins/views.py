from io import BytesIO

import qrcode
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from .models import CheckIn, CheckInSession


def is_staff_user(user):
    return user.is_authenticated and user.is_staff_role


@login_required
@user_passes_test(is_staff_user)
@require_http_methods(["GET", "POST"])
def create_session(request):
    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        duration = request.POST.get("duration", "5").strip()
        try:
            duration_minutes = int(duration)
        except ValueError:
            duration_minutes = 5

        if title and 1 <= duration_minutes <= 120:
            session = CheckInSession.create(
                title=title,
                created_by=request.user,
                duration_minutes=duration_minutes,
            )
            return redirect("checkins:scan_checkin", token=session.token)

        return render(
            request,
            "checkins/create_session.html",
            {"error": "กรุณากรอกชื่อกิจกรรมและระยะเวลา 1-120 นาที"},
            status=400,
        )

    return render(request, "checkins/create_session.html")


@login_required
@require_http_methods(["GET", "POST"])
def scan_checkin(request, token):
    session = get_object_or_404(CheckInSession, token=token)
    existing_checkin = CheckIn.objects.filter(session=session, user=request.user).first()

    if request.method == "POST" and not existing_checkin:
        if not session.is_active or session.is_expired:
            return render(
                request,
                "checkins/scan_checkin.html",
                {"session": session, "error": "QR นี้หมดอายุแล้ว"},
                status=410,
            )
        CheckIn.objects.create(session=session, user=request.user)
        return redirect("checkins:scan_checkin", token=session.token)

    return render(
        request,
        "checkins/scan_checkin.html",
        {
            "session": session,
            "existing_checkin": existing_checkin,
            "qr_url": request.build_absolute_uri(
                reverse("checkins:qr_image", kwargs={"token": session.token})
            ),
        },
    )


@login_required
@require_http_methods(["GET"])
def qr_image(request, token):
    session = get_object_or_404(CheckInSession, token=token)
    if not session.is_active or session.is_expired:
        return HttpResponse("QR code expired", status=410)

    checkin_url = request.build_absolute_uri(
        reverse("checkins:scan_checkin", kwargs={"token": session.token})
    )
    image = qrcode.make(checkin_url)
    output = BytesIO()
    image.save(output, format="PNG")
    return HttpResponse(output.getvalue(), content_type="image/png")
