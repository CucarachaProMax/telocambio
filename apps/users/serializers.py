from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "ciudad", "latitud", "longitud"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserPublicoSerializer(serializers.ModelSerializer):
    """Perfil visible por otros usuarios: nunca incluye latitud/longitud,
    solo el nombre de ciudad ya redondeado a nivel de texto."""

    valoracion_media = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ["id", "username", "ciudad", "foto", "valoracion_media"]


class MeSerializer(serializers.ModelSerializer):
    """Para /yo/: a diferencia del perfil público, aquí sí incluimos
    tus propias coordenadas — las necesitas para poder pre-rellenar el
    mapa al subir un item con tu ubicación."""

    valoracion_media = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "ciudad", "latitud", "longitud", "foto", "valoracion_media"]
