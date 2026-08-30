from django.contrib import admin

from .models import Categoria, Etiqueta, Item, ItemFoto, Subcategoria


class SubcategoriaInline(admin.TabularInline):
    model = Subcategoria
    extra = 1


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nombre",)
    inlines = [SubcategoriaInline]


@admin.register(Etiqueta)
class EtiquetaAdmin(admin.ModelAdmin):
    list_display = ("nombre",)


class ItemFotoInline(admin.TabularInline):
    model = ItemFoto
    extra = 1


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("nombre", "dueno", "subcategoria", "estado", "creado_en")
    list_filter = ("estado", "subcategoria__categoria", "etiquetas")
    search_fields = ("nombre", "descripcion", "dueno__username")
    inlines = [ItemFotoInline]
