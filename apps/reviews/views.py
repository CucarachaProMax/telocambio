from rest_framework import generics, permissions

from .models import Review
from .serializers import ReviewSerializer


class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)


class ReviewsDeUsuarioView(generics.ListAPIView):
    """Para pintar el apartado de reseñas en el perfil de un usuario."""

    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Review.objects.filter(receptor__username=self.kwargs["username"]).select_related(
            "autor", "receptor", "trade_request"
        )
