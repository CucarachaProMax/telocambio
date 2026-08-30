from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Usuario personalizado. Guardamos coordenadas, pero SIEMPRE
    redondeadas a ~1km de precisión — suficiente para buscar cerca sin
    poder reconstruir la dirección exacta de nadie. `ciudad` es el
    texto legible que se le muestra a la gente."""

    ciudad = models.CharField(max_length=100, blank=True)
    latitud = models.FloatField(null=True, blank=True)
    longitud = models.FloatField(null=True, blank=True)
    foto = models.ImageField(upload_to="perfiles/", blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.latitud is not None:
            self.latitud = round(self.latitud, 2)
        if self.longitud is not None:
            self.longitud = round(self.longitud, 2)
        super().save(*args, **kwargs)

    @property
    def valoracion_media(self):
        from apps.reviews.models import Review

        resenas = Review.objects.filter(receptor=self)
        if not resenas.exists():
            return None
        return round(sum(r.estrellas for r in resenas) / resenas.count(), 1)
