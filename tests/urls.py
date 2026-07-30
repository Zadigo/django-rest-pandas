from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("", include("tests.testapp.urls")),
    path("", include("tests.weather.urls")),
    path("admin", admin.site.urls),
]
