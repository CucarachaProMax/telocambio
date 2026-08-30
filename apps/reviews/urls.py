from django.urls import path

from .views import ReviewCreateView, ReviewsDeUsuarioView

urlpatterns = [
    path("resenas/", ReviewCreateView.as_view()),
    path("usuarios/<str:username>/resenas/", ReviewsDeUsuarioView.as_view()),
]
