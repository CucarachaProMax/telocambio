from django.core.management.base import BaseCommand

from apps.items.models import Categoria, Etiqueta, Subcategoria
from apps.reviews.models import EtiquetaResena

CATEGORIAS = {
    "Cartas": ["Pokémon", "Fútbol", "Otro TCG"],
    "Figuras": ["One Piece", "Naruto", "Labubu", "Otro"],
    "Coches (miniatura)": ["BMW", "Toyota", "Mercedes", "Otro"],
    "Peluches": ["Sanrio", "Disney", "Otro"],
    "Otro": ["Otro"],
}

ETIQUETAS_ITEM = ["Nuevo", "Usado", "Con caja/sellado", "Daño leve"]

ETIQUETAS_RESENA = ["Puntual", "Serio", "Buena comunicación", "Item tal cual se describía"]


class Command(BaseCommand):
    help = "Crea las categorías, subcategorías y etiquetas base para poder probar la app en local."

    def handle(self, *args, **options):
        for categoria_nombre, subcategorias in CATEGORIAS.items():
            categoria, creada = Categoria.objects.get_or_create(nombre=categoria_nombre)
            if creada:
                self.stdout.write(f"✓ Categoría creada: {categoria_nombre}")
            for sub_nombre in subcategorias:
                _, creada = Subcategoria.objects.get_or_create(categoria=categoria, nombre=sub_nombre)
                if creada:
                    self.stdout.write(f"  ↳ Subcategoría creada: {sub_nombre}")

        for nombre in ETIQUETAS_ITEM:
            _, creada = Etiqueta.objects.get_or_create(nombre=nombre)
            if creada:
                self.stdout.write(f"✓ Etiqueta creada: {nombre}")

        for nombre in ETIQUETAS_RESENA:
            _, creada = EtiquetaResena.objects.get_or_create(nombre=nombre)
            if creada:
                self.stdout.write(f"✓ Etiqueta de reseña creada: {nombre}")

        self.stdout.write(self.style.SUCCESS("Datos base listos."))
