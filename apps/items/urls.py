from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CategoriaListView, EtiquetaListView, ItemViewSet

router = DefaultRouter()
router.register("items", ItemViewSet, basename="item")

urlpatterns = [
    path("categorias/", CategoriaListView.as_view()),
    path("etiquetas/", EtiquetaListView.as_view()),
] + router.urls
