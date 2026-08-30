from django.conf import settings
from django.db import models

from apps.items.models import Item


class TradeRequest(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        RECHAZADA = "rechazada", "Rechazada"  # no cierra el chat
        EN_PROCESO = "en_proceso", "En proceso"
        REALIZADO = "realizado", "Intercambio realizado"

    # quien envía la solicitud
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="solicitudes_enviadas",
    )
    # quien tiene el/los item(s) deseado(s) — el único que puede marcar
    # "realizado", porque es quien recibe lo que originó la solicitud
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="solicitudes_recibidas",
    )

    items_ofrecidos = models.ManyToManyField(
        Item, related_name="ofrecido_en", blank=False
    )
    items_pedidos = models.ManyToManyField(
        Item, related_name="pedido_en", blank=False
    )

    estado = models.CharField(
        max_length=20, choices=Estado.choices, default=Estado.PENDIENTE
    )

    creado_en = models.DateTimeField(auto_now_add=True)
    aceptado_en = models.DateTimeField(null=True, blank=True)
    realizado_en = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-creado_en"]

    def __str__(self):
        return f"{self.from_user} → {self.to_user} ({self.estado})"

    def marcar_en_proceso(self):
        from django.utils import timezone

        self.estado = self.Estado.EN_PROCESO
        self.aceptado_en = timezone.now()
        self.save(update_fields=["estado", "aceptado_en"])
        for item in list(self.items_ofrecidos.all()) + list(self.items_pedidos.all()):
            item.estado = Item.Estado.EN_NEGOCIACION
            item.save(update_fields=["estado"])

    def marcar_realizado(self, por_usuario):
        """Solo to_user puede cerrar el intercambio. La vista debe
        forzar aquí mismo el flujo de reseña obligatoria."""
        from django.core.exceptions import PermissionDenied
        from django.utils import timezone

        if por_usuario != self.to_user:
            raise PermissionDenied("Solo el receptor de la solicitud puede cerrarla")

        self.estado = self.Estado.REALIZADO
        self.realizado_en = timezone.now()
        self.save(update_fields=["estado", "realizado_en"])
        for item in list(self.items_ofrecidos.all()) + list(self.items_pedidos.all()):
            item.estado = Item.Estado.INTERCAMBIADO
            item.save(update_fields=["estado"])
