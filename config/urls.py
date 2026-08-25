"""URL configuration กลางของโปรเจกต์ SpaceBook"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", TemplateView.as_view(template_name="home.html"), name="home"),
    path("accounts/", include("accounts.urls")),
    path("facilities/", include("facilities.urls")),
    path("bookings/", include("bookings.urls")),
]

# ให้เสิร์ฟไฟล์ media ตอนพัฒนา
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)