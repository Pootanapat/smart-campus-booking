from django.urls import path

from . import views

app_name = "checkins"

urlpatterns = [
    path("create/", views.create_session, name="create_session"),
    path("<uuid:token>/", views.scan_checkin, name="scan_checkin"),
    path("<uuid:token>/qr.png", views.qr_image, name="qr_image"),
]
