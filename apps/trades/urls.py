from rest_framework.routers import DefaultRouter

from .views import TradeRequestViewSet

router = DefaultRouter()
router.register("solicitudes", TradeRequestViewSet, basename="solicitud")

urlpatterns = router.urls
