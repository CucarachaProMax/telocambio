from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.trades.models import TradeRequest


class EtiquetaResena(models.Model):
    """Puntual, Serio, Buena comunicación, Item tal cual se describía..."""

    nombre = models.CharField(max_length=40, unique=True)

    class Meta:
        verbose_name_plural = "etiquetas de reseña"

    def __str__(self):
        return self.nombre


class Review(models.Model):
    trade_request = models.ForeignKey(
        TradeRequest, on_delete=models.CASCADE, related_name="resenas"
    )
    autor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="resenas_hechas"
    )
    receptor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resenas_recibidas",
    )
    estrellas = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    etiquetas = models.ManyToManyField(EtiquetaResena, blank=True)
    comentario = models.CharField(max_length=300, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        # una reseña por autor y por solicitud — nadie puede reseñar dos
        # veces el mismo intercambio
        unique_together = ("trade_request", "autor")

    def __str__(self):
        return f"{self.autor} → {self.receptor}: {self.estrellas}★"
