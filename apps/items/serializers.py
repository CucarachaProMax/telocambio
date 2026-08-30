from rest_framework import serializers

from .models import Categoria, Etiqueta, Item, ItemFoto, Subcategoria


class SubcategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategoria
        fields = ["id", "nombre"]


class CategoriaSerializer(serializers.ModelSerializer):
    subcategorias = SubcategoriaSerializer(many=True, read_only=True)

    class Meta:
        model = Categoria
        fields = ["id", "nombre", "subcategorias"]


class EtiquetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etiqueta
        fields = ["id", "nombre"]


class ItemFotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemFoto
        fields = ["id", "imagen", "orden"]


class ItemSerializer(serializers.ModelSerializer):
    dueno = serializers.ReadOnlyField(source="dueno.username")
    subcategoria_nombre = serializers.ReadOnlyField(source="subcategoria.nombre")
    categoria_nombre = serializers.ReadOnlyField(source="subcategoria.categoria.nombre")
    ciudad_efectiva = serializers.ReadOnlyField()
    fotos = ItemFotoSerializer(many=True, read_only=True)
    # nunca se exponen latitud/longitud reales; solo la distancia ya
    # calculada respecto al punto de búsqueda del usuario, si lo dio
    distancia_km = serializers.SerializerMethodField()

    def get_distancia_km(self, obj):
        return self.context.get("distancias", {}).get(obj.id)

    class Meta:
        model = Item
        fields = [
            "id",
            "dueno",
            "subcategoria",
            "subcategoria_nombre",
            "categoria_nombre",
            "nombre",
            "descripcion",
            "etiquetas",
            "ciudad",
            "ciudad_efectiva",
            "distancia_km",
            "latitud",
            "longitud",
            "estado",
            "fotos",
            "creado_en",
        ]
        read_only_fields = ["estado"]  # el estado lo cambia la lógica de trades, no el dueño a mano
        extra_kwargs = {
            "latitud": {"write_only": True},
            "longitud": {"write_only": True},
        }
