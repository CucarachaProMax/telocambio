from django.contrib import admin

from .models import EtiquetaResena, Review


@admin.register(EtiquetaResena)
class EtiquetaResenaAdmin(admin.ModelAdmin):
    list_display = ("nombre",)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("autor", "receptor", "estrellas", "trade_request", "creado_en")
    list_filter = ("estrellas",)
    search_fields = ("autor__username", "receptor__username")
