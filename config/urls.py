from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.users.urls")),
    path("api/", include("apps.items.urls")),
    path("api/", include("apps.trades.urls")),
    path("api/", include("apps.reviews.urls")),
]
