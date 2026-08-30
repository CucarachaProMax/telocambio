from django.conf import settings
from django.db import models


class Categoria(models.Model):
    """Nivel 1: superficial a propósito (Cartas, Figuras, Coches...).
    Editable desde el admin, sin tocar código."""

    nombre = models.CharField(max_length=60, unique=True)

    class Meta:
        verbose_name_plural = "categorías"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Subcategoria(models.Model):
    """Nivel 2: marca/franquicia dentro de una categoría (BMW, Pokémon,
    One Piece...). Nunca bajamos a modelo/color/edición específicos —
    eso va en el nombre libre del item."""

    categoria = models.ForeignKey(
        Categoria, on_delete=models.CASCADE, related_name="subcategorias"
    )
    nombre = models.CharField(max_length=60)

    class Meta:
        verbose_name_plural = "subcategorías"
        unique_together = ("categoria", "nombre")
        ordering = ["categoria", "nombre"]

    def __str__(self):
        return f"{self.categoria} · {self.nombre}"


class Etiqueta(models.Model):
    """Catálogo fijo y pequeño a propósito: Nuevo, Usado, Con caja/sellado,
    Daño leve. Sin etiquetas subjetivas tipo 'raro'."""

    nombre = models.CharField(max_length=40, unique=True)

    class Meta:
        verbose_name_plural = "etiquetas"

    def __str__(self):
        return self.nombre


class Item(models.Model):
    class Estado(models.TextChoices):
        DISPONIBLE = "disponible", "Disponible"
        EN_NEGOCIACION = "en_negociacion", "En negociación"
        INTERCAMBIADO = "intercambiado", "Intercambiado"

    dueno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="items"
    )
    subcategoria = models.ForeignKey(Subcategoria, on_delete=models.PROTECT)
    nombre = models.CharField(max_length=120)
    descripcion = models.TextField(blank=True)
    etiquetas = models.ManyToManyField(Etiqueta, blank=True)
    ciudad = models.CharField(
        max_length=100,
        blank=True,
        help_text="Si se deja vacío, hereda la ciudad del dueño",
    )
    latitud = models.FloatField(null=True, blank=True)
    longitud = models.FloatField(null=True, blank=True)
    estado = models.CharField(
        max_length=20, choices=Estado.choices, default=Estado.DISPONIBLE
    )
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-creado_en"]

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
        if self.latitud is not None:
            self.latitud = round(self.latitud, 2)
        if self.longitud is not None:
            self.longitud = round(self.longitud, 2)
        super().save(*args, **kwargs)

    def ciudad_efectiva(self):
        return self.ciudad or self.dueno.ciudad

    def ubicacion_efectiva(self):
        if self.latitud is not None and self.longitud is not None:
            return self.latitud, self.longitud
        return self.dueno.latitud, self.dueno.longitud


class ItemFoto(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="fotos")
    imagen = models.ImageField(upload_to="items/")
    orden = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["orden"]
