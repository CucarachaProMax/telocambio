from django.contrib import admin

from .models import TradeRequest


@admin.register(TradeRequest)
class TradeRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "from_user", "to_user", "estado", "creado_en")
    list_filter = ("estado",)
    search_fields = ("from_user__username", "to_user__username")
    filter_horizontal = ("items_ofrecidos", "items_pedidos")
