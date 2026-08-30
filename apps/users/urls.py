from django.urls import path

from .views import CsrfView, LoginView, LogoutView, MeView, RegistroView, UserPublicoView

urlpatterns = [
    path("csrf/", CsrfView.as_view()),
    path("registro/", RegistroView.as_view()),
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("yo/", MeView.as_view()),
    path("usuarios/<str:username>/", UserPublicoView.as_view()),
]
