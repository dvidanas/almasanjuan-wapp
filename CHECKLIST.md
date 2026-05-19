# CHECKLIST — Verificación Alma San Juan Bot

## Pre-deploy

- [ ] `GEMINI_API_KEY` configurado en EasyPanel
- [ ] `YCLOUD_API_KEY` y `YCLOUD_PHONE_ID` configurados (pendiente número)
- [ ] `AUTH_SECRET` configurado en EasyPanel
- [ ] Volumen persistente `/app/data` creado en EasyPanel
- [ ] Registro DNS `A almasanjuanbot → 92.113.38.251` propagado

## Post-deploy

### 1. Login con PIN
- [ ] Abrir `https://almasanjuanbot.feer.com.ar`
- [ ] Verificar que redirige a `/login`
- [ ] Ver 4 burbujas vacías y teclado numérico en pantalla
- [ ] Ingresar PIN incorrecto → shake animation + burbujas se limpian
- [ ] Ingresar PIN **1588** → fade out + entra al dashboard

### 2. Dashboard carga correctamente
- [ ] Título "Alma San Juan" visible en header
- [ ] Sección de Conversaciones disponible
- [ ] Sección de Leads disponible
- [ ] Sección de Turnos visible (modo manual, sin booking por bot)

### 3. Webhook funciona
- [ ] `GET https://almasanjuanbot.feer.com.ar/api/webhook` devuelve algo (o 405)
- [ ] Configurar webhook en YCloud apuntando a `https://almasanjuanbot.feer.com.ar/api/webhook`
- [ ] Enviar mensaje de prueba al número de WhatsApp

### 4. Giuli responde correctamente
- [ ] Primer mensaje → Giuli responde: "¡Hola! Qué bueno que nos escribas, soy Giuli de Alma San Juan ✨ Contame, ¿qué zonas te gustaría depilarte?"
- [ ] Responder con zonas → Giuli pregunta por método de depilación
- [ ] Responder "rasuradora" → cotización directa
- [ ] Responder "cera" → mensaje de espera de 20 días
- [ ] Preguntar por masajes → Giuli rechaza y redirige a depilación láser
- [ ] Confirmar interés → mensaje de cierre de lead exacto
- [ ] Verificar que aparece nuevo lead en el dashboard

### 5. Sistema de leads
- [ ] Lead aparece en sección Leads después del cierre
- [ ] Datos del lead son correctos (teléfono, estado "nuevo")
- [ ] Cambiar estado de lead a "seguimiento" funciona

### 6. Turnos (modo manual)
- [ ] Sección Turnos muestra calendario
- [ ] Se pueden crear turnos manualmente
- [ ] El bot **no** ofrece turnos automáticamente (botBooking: false)

---

## Pendientes manuales

- [ ] **YCloud**: conseguir número + API key + configurar webhook
- [ ] **EasyPanel**: crear el proyecto siguiendo el README
- [ ] **DNS**: agregar registro A en proveedor de feer.com.ar
- [ ] **GEMINI_API_KEY**: confirmar si usar la misma de Feer o crear nueva
