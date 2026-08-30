from django.db.models import Q
from rest_framework import generics, permissions, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Categoria, Etiqueta, Item
from .permissions import EsDuenoOSoloLectura
from .serializers import CategoriaSerializer, EtiquetaSerializer, ItemSerializer
from .utils import distancia_km


class CategoriaListView(generics.ListAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.AllowAny]


class EtiquetaListView(generics.ListAPIView):
    queryset = Etiqueta.objects.all()
    serializer_class = EtiquetaSerializer
    permission_classes = [permissions.AllowAny]


class ItemViewSet(viewsets.ModelViewSet):
    """
    Filtros por query params:
      ?categoria=<id>        (nivel 1)
      ?subcategoria=<id>     (nivel 2)
      ?etiquetas=<id>,<id>
      ?q=<texto libre en nombre/descripción>
      ?disponible=1          (por defecto, solo muestra disponibles)
      ?lat=<float>&lng=<float>&radio_km=<float>   (búsqueda por cercanía)
    """

    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, EsDuenoOSoloLectura]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = Item.objects.select_related("subcategoria__categoria", "dueno").prefetch_related(
            "etiquetas", "fotos"
        )
        params = self.request.query_params

        if params.get("disponible", "1") == "1":
            qs = qs.filter(estado=Item.Estado.DISPONIBLE)

        if categoria_id := params.get("categoria"):
            qs = qs.filter(subcategoria__categoria_id=categoria_id)

        if subcategoria_id := params.get("subcategoria"):
            qs = qs.filter(subcategoria_id=subcategoria_id)

        if etiquetas := params.get("etiquetas"):
            ids = [i for i in etiquetas.split(",") if i]
            qs = qs.filter(etiquetas__id__in=ids).distinct()

        if texto := params.get("q"):
            qs = qs.filter(Q(nombre__icontains=texto) | Q(descripcion__icontains=texto))

        if dueno := params.get("dueno"):
            qs = qs.filter(dueno__username=dueno)

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        radio_km = request.query_params.get("radio_km")

        distancias = {}
        if lat and lng:
            lat, lng = float(lat), float(lng)
            radio_km = float(radio_km) if radio_km else 25.0
            items_en_radio = []
            for item in queryset:
                item_lat, item_lng = item.ubicacion_efectiva()
                d = distancia_km(lat, lng, item_lat, item_lng)
                if d is not None and d <= radio_km:
                    distancias[item.id] = d
                    items_en_radio.append(item)
            items_en_radio.sort(key=lambda i: distancias[i.id])
            queryset = items_en_radio
        else:
            queryset = list(queryset)

        serializer = self.get_serializer(
            queryset, many=True, context={**self.get_serializer_context(), "distancias": distancias}
        )
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(dueno=self.request.user)
