from rest_framework import serializers

from apps.items.models import Item

from .models import TradeRequest


class TradeRequestSerializer(serializers.ModelSerializer):
    from_user = serializers.ReadOnlyField(source="from_user.username")
    to_user = serializers.ReadOnlyField(source="to_user.username")

    class Meta:
        model = TradeRequest
        fields = [
            "id",
            "from_user",
            "to_user",
            "items_ofrecidos",
            "items_pedidos",
            "estado",
            "creado_en",
            "aceptado_en",
            "realizado_en",
        ]
        read_only_fields = ["estado", "aceptado_en", "realizado_en"]

    def validate(self, data):
        request_user = self.context["request"].user
        ofrecidos = data.get("items_ofrecidos", [])
        pedidos = data.get("items_pedidos", [])

        if not ofrecidos or not pedidos:
            raise serializers.ValidationError(
                "Tienes que ofrecer al menos un item y pedir al menos uno."
            )

        if any(item.dueno_id != request_user.id for item in ofrecidos):
            raise serializers.ValidationError(
                "Solo puedes ofrecer items que sean tuyos."
            )

        duenos_pedidos = {item.dueno_id for item in pedidos}
        if len(duenos_pedidos) != 1:
            raise serializers.ValidationError(
                "Los items pedidos deben pertenecer todos al mismo usuario."
            )

        (to_user_id,) = duenos_pedidos
        if to_user_id == request_user.id:
            raise serializers.ValidationError("No puedes enviarte una solicitud a ti mismo.")

        no_disponibles = [i for i in ofrecidos + pedidos if i.estado != Item.Estado.DISPONIBLE]
        if no_disponibles:
            raise serializers.ValidationError(
                "Alguno de los items ya no está disponible para intercambiar."
            )

        data["to_user_id"] = to_user_id
        return data
