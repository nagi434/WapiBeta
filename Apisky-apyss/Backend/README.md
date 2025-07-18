# Apisky Backend

Este backend está construido con Node.js y Express. Provee endpoints para:
- Obtener el QR de WhatsApp Web y verificar el estado de la sesión
- Enviar mensajes y listar contactos de WhatsApp

## Instalación

1. Instala las dependencias:
   ```sh
   npm install
   ```
2. Crea un archivo `.env` con tus credenciales (ver ejemplo más abajo).
3. Inicia el servidor:
   ```sh
   node index.js
   ```

## Endpoints principales
- `GET /api/wa-qr` — Obtener el código QR para iniciar sesión
- `GET /api/wa-status` — Verificar si el cliente está listo
- `POST /api/send-wa` — Enviar mensaje de WhatsApp
- `GET /api/wa-contacts` — Obtener contactos de WhatsApp

## Ejemplo de archivo `.env`
```
# Puerto opcional para el servidor
PORT=3001
```

## Notas
- Personaliza los endpoints según tus necesidades.
- Este backend es solo un punto de partida.
