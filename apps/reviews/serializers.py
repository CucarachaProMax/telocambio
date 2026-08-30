from rest_framework import serializers

from apps.trades.models import TradeRequest

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    autor = serializers.ReadOnlyField(source="autor.username")
    receptor = serializers.ReadOnlyField(source="receptor.username")

    class Meta:
        model = Review
        fields = ["id", "trade_request", "autor", "receptor", "estrellas", "etiquetas", "comentario", "creado_en"]

    def validate(self, data):
        request_user = self.context["request"].user
        trade = data["trade_request"]

        if trade.estado != TradeRequest.Estado.REALIZADO:
            raise serializers.ValidationError("Solo se puede reseñar un intercambio ya realizado.")

        if request_user not in (trade.from_user, trade.to_user):
            raise serializers.ValidationError("No participaste en este intercambio.")

        if Review.objects.filter(trade_request=trade, autor=request_user).exists():
            raise serializers.ValidationError("Ya has dejado una reseña para este intercambio.")

        data["receptor"] = trade.to_user if request_user == trade.from_user else trade.from_user
        return data
