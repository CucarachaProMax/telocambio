# Plataforma de intercambio de coleccionables

Estructura base del proyecto (Django + DRF + Channels).

## Apps

- `apps.users` — usuario personalizado, con ciudad aproximada para ubicación
- `apps.items` — categorías (2 niveles), etiquetas y items subidos
- `apps.trades` — solicitudes de intercambio y su estado
- `apps.chat` — chat en tiempo real ligado a cada solicitud (WebSockets)
- `apps.reviews` — reseñas al cerrar un intercambio

## Cómo arrancar en local

```bash
cp .env.example .env
docker compose up -d          # levanta Postgres + Redis
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_datos   # crea categorías/subcategorías/etiquetas base
python manage.py createsuperuser
python manage.py runserver
```

## Notas de diseño (por qué está montado así)

- **Categoría / Subcategoría**: dos niveles nada más, editables desde el
  admin de Django. Todo lo más específico (modelo, color, edición) va en
  el nombre/descripción libre del item — no como campo estructurado.
- **Etiquetas de item**: catálogo fijo y pequeño (Nuevo, Usado, Con
  caja/sellado, Daño leve), modelado como tabla para poder gestionarlo
  desde el admin sin tocar código.
- **TradeRequest**: guarda tanto los items ofrecidos como los pedidos
  como relaciones M2M, para soportar solicitudes con varios items.
- **Solo el receptor de la solicitud (`to_user`) puede marcar el
  intercambio como `realizado`** — es quien tiene el item que originó
  la solicitud. Rechazar (`estado='rechazada'`) no borra ni bloquea el
  chat, solo cambia el estado visible.
- **Review**: vinculada al `TradeRequest`, no directamente a los
  usuarios, para poder mostrar siempre "reseña por el intercambio de X".
  Es obligatoria para `to_user` al marcar como realizado (se aplica en
  la vista, no en el modelo) y opcional para `from_user`.
- **Ubicación**: solo ciudad (texto), nunca coordenadas exactas ni
  dirección — se guarda a nivel de usuario y el item hereda esa ciudad
  salvo que se indique otra.
