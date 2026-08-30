from django.conf import settings
from django.db import models

from apps.trades.models import TradeRequest


class Chat(models.Model):
    """Se crea automáticamente al enviar una TradeRequest, sin importar
    si luego se acepta o rechaza."""

    trade_request = models.OneToOneField(
        TradeRequest, on_delete=models.CASCADE, related_name="chat"
    )
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat de solicitud #{self.trade_request_id}"


class Mensaje(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="mensajes")
    autor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    contenido = models.TextField(max_length=2000)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["creado_en"]


class MensajeSistema(models.Model):
    """Para eventos automáticos visibles en el chat, ej. 'Intercambio
    aceptado por ambos', sin que sean mensajes de un usuario real."""

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="eventos")
    texto = models.CharField(max_length=200)
    creado_en = models.DateTimeField(auto_now_add=True)
