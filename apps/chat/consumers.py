import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import Chat, Mensaje


class ChatConsumer(AsyncWebsocketConsumer):
    """Autentica igual que la API y, en cada conexión y cada mensaje,
    comprueba que el usuario realmente participa en esa solicitud —
    para no dejar que cualquiera se conecte a un chat solo sabiendo
    el ID (mismo problema de IDOR que en la API REST)."""

    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        user = self.scope["user"]

        if not user.is_authenticated or not await self._pertenece_al_chat(user):
            await self.close(code=4403)
            return

        self.group_name = f"chat_{self.chat_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        user = self.scope["user"]
        data = json.loads(text_data)
        contenido = (data.get("contenido") or "").strip()[:2000]
        if not contenido:
            return

        mensaje = await self._guardar_mensaje(user, contenido)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",
                "autor": user.username,
                "contenido": mensaje.contenido,
                "creado_en": mensaje.creado_en.isoformat(),
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def _pertenece_al_chat(self, user):
        return Chat.objects.filter(
            id=self.chat_id, trade_request__from_user=user
        ).exists() or Chat.objects.filter(
            id=self.chat_id, trade_request__to_user=user
        ).exists()

    @database_sync_to_async
    def _guardar_mensaje(self, user, contenido):
        chat = Chat.objects.get(id=self.chat_id)
        return Mensaje.objects.create(chat=chat, autor=user, contenido=contenido)
