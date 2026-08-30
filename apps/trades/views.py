from django.core.exceptions import PermissionDenied
from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.chat.models import Chat, MensajeSistema

from .models import TradeRequest
from .serializers import TradeRequestSerializer


class TradeRequestViewSet(viewsets.ModelViewSet):
    serializer_class = TradeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head"]  # no put/patch/delete: todo pasa por acciones

    def get_queryset(self):
        user = self.request.user
        return (
            TradeRequest.objects.filter(Q(from_user=user) | Q(to_user=user))
            .select_related("from_user", "to_user")
            .prefetch_related("items_ofrecidos", "items_pedidos")
        )

    def perform_create(self, serializer):
        trade = serializer.save(from_user=self.request.user, to_user_id=serializer.validated_data["to_user_id"])
        # el chat se crea sí o sí al enviar la solicitud, aceptes o no
        Chat.objects.create(trade_request=trade)

    def _get_trade_o_404(self, pk):
        from django.shortcuts import get_object_or_404

        return get_object_or_404(self.get_queryset(), pk=pk)

    @action(detail=True, methods=["post"])
    def rechazar(self, request, pk=None):
        """Solo el receptor. No cierra el chat, solo cambia el estado
        visible — pueden seguir hablando."""
        trade = self._get_trade_o_404(pk)
        if request.user != trade.to_user:
            return Response({"detail": "Solo el receptor puede rechazarla."}, status=403)

        trade.estado = TradeRequest.Estado.RECHAZADA
        trade.save(update_fields=["estado"])
        MensajeSistema.objects.create(
            chat=trade.chat, texto=f"{trade.to_user.username} ha rechazado la solicitud"
        )
        return Response(self.get_serializer(trade).data)

    @action(detail=True, methods=["post"], url_path="aceptar-intercambio")
    def aceptar_intercambio(self, request, pk=None):
        """Cualquiera de los dos, una vez de acuerdo en el chat."""
        trade = self._get_trade_o_404(pk)
        if request.user not in (trade.from_user, trade.to_user):
            return Response({"detail": "No participas en esta solicitud."}, status=403)

        trade.marcar_en_proceso()
        MensajeSistema.objects.create(
            chat=trade.chat, texto="Intercambio aceptado por ambos — ahora está en proceso"
        )
        return Response(self.get_serializer(trade).data)

    @action(detail=True, methods=["post"])
    def realizado(self, request, pk=None):
        """Solo to_user puede cerrarlo. El frontend debe abrir el
        formulario de reseña (obligatorio para to_user) justo después
        de recibir una respuesta 200 aquí."""
        trade = self._get_trade_o_404(pk)
        try:
            trade.marcar_realizado(por_usuario=request.user)
        except PermissionDenied as exc:
            return Response({"detail": str(exc)}, status=403)

        return Response(
            {
                "trade": self.get_serializer(trade).data,
                "resena_obligatoria": True,
                "resena_url": f"/api/resenas/?trade_request={trade.id}",
            }
        )
