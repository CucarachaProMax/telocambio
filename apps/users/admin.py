from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Datos de la plataforma", {"fields": ("ciudad", "foto")}),
    )
    list_display = ("username", "email", "ciudad", "is_staff")
