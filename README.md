# Alma San Juan — Bot WhatsApp

Bot de WhatsApp para **Alma San Juan** (depilación láser). Asistente virtual **Giuli** responde con Gemini. Dashboard de gestión con login por PIN.

> **Base:** fork de agente-whatsapp (Feer). El repo original de Feer en GitHub **no fue modificado**.

---

## Deploy en EasyPanel

### Datos del proyecto

| Campo | Valor |
|---|---|
| Nombre del proyecto | `alma-whatsapp` |
| Puerto | `3001` (Feer usa 3000) |
| Dominio | `almasanjuanbot.feer.com.ar` |
| SSL | Let's Encrypt automático |
| Build | Nixpacks (detecta automáticamente) |
| Volumen persistente | `/app/data` |

### Variables de entorno en EasyPanel

```
GEMINI_API_KEY=         ← misma key que Feer o una nueva
YCLOUD_API_KEY=         ← pendiente número YCloud
YCLOUD_PHONE_ID=        ← pendiente número YCloud
AUTH_SECRET=7a7734e65543cdd06de86117726625e75a04fae8f4795097f80d5ae44dcd4a33
NODE_ENV=production
PORT=3001
```

> `SKIP_SIGNATURE_CHECK` **no** va en producción — solo en desarrollo local.

### Pasos de deploy

1. En EasyPanel → **New App** → **Git Repository**
2. Apuntar al repositorio local (o subir a GitHub privado primero)
3. Configurar las variables de entorno de arriba
4. Agregar volumen: Source `/app/data` → Target `/app/data`
5. Asignar dominio `almasanjuanbot.feer.com.ar` → SSL automático
6. Deployar
7. Una vez online, configurar webhook en YCloud:
   - URL: `https://almasanjuanbot.feer.com.ar/api/webhook`
   - Método: POST

---

## DNS

Agregar en el panel de dominios de **feer.com.ar**:

| Tipo | Nombre | Valor | TTL |
|---|---|---|---|
| A | `almasanjuanbot` | `92.113.38.251` | 300 |

---

## Login

- URL: `https://almasanjuanbot.feer.com.ar/login`
- PIN: **1588**
- Teclado numérico visual en pantalla (funciona en mobile)

---

## Variables de entorno — referencia

| Variable | Descripción |
|---|---|
| `AUTH_SECRET` | Secreto para firmar cookies de sesión (ya generado) |
| `GEMINI_API_KEY` | API Key de Google AI Studio |
| `GEMINI_MODEL` | Modelo Gemini (default: `gemini-2.0-flash`) |
| `YCLOUD_API_KEY` | API Key de YCloud |
| `YCLOUD_PHONE_ID` | ID del número de teléfono en YCloud |
| `PORT` | Puerto del servidor (3001 para este cliente) |
| `NODE_ENV` | `production` |

---

## Desarrollo local

```bash
npm install
# Editar .env con tus credenciales
npm run dev
```

En otra terminal (para recibir webhooks):

```bash
ngrok http 3001
# Copiar URL HTTPS → configurar en YCloud → Webhooks
```

---

## Estructura del proyecto

```
src/
├── middleware.ts              # Protección de rutas (auth)
├── app/
│   ├── page.tsx               # Dashboard principal
│   ├── layout.tsx
│   ├── login/page.tsx         # Login con PIN en burbujas
│   └── api/
│       ├── auth/              # Login (PIN) y logout
│       ├── webhook/           # Recibe mensajes de YCloud
│       ├── conversations/     # CRUD de conversaciones
│       ├── messages/          # Mensajes por conversación
│       ├── leads/             # Gestión de leads
│       ├── appointments/      # Turnos (modo manual)
│       └── mode/              # Cambio AI ↔ HUMAN
├── components/                # UI del dashboard
└── lib/
    ├── client.config.ts       # Configuración Alma San Juan
    ├── system-prompt.ts       # Prompt de Giuli (dinámico)
    ├── db.ts                  # SQLite + helpers
    ├── auth.ts                # Cookie firmada
    ├── gemini.ts              # Cliente Gemini
    └── ycloud/
        ├── client.ts
        ├── verify.ts
        └── handler.ts
data/
└── messages.db                # SQLite (volumen persistente en producción)
```

---

## Troubleshooting

| Síntoma | Causa | Solución |
|---|---|---|
| Login devuelve 401 | PIN incorrecto | Verificar `dashboard.pinLogin` en `client.config.ts` |
| Webhook devuelve 401 | Firma YCloud incorrecta | Agregar `SKIP_SIGNATURE_CHECK=true` en desarrollo |
| Gemini no responde | `GEMINI_API_KEY` vacío | Configurar en EasyPanel |
| Bot no envía mensajes | `YCLOUD_API_KEY` o `YCLOUD_PHONE_ID` incorrectos | Verificar en YCloud dashboard |
