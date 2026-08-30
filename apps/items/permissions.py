from rest_framework.permissions import SAFE_METHODS, BasePermission


class EsDuenoOSoloLectura(BasePermission):
    """Cualquiera autenticado puede ver; solo el dueño puede
    editar/borrar. Evita el típico bug de IDOR de 'cambio la URL y
    edito el item de otro'."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.dueno_id == request.user.id
