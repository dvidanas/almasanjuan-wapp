import {
  wasMessageProcessed,
  markMessageProcessed,
  getOrCreateConversation,
  getConversationById,
  insertMessage,
  updateMessageWaId,
  getRecentHistory,
  createLead,
  updateLead,
  setConversationHasLead,
  getLeadByConversationId,
} from "@/lib/db";
import { getChatCompletion, type ChatMessage } from "@/lib/gemini";
import { sendTextMessage } from "./client";

const INTENT_KEYWORDS = [
  "presupuesto", "precio", "cuánto", "cuanto", "contratar", "contrataría",
  "quiero", "necesito", "me interesa", "interesado", "interesada",
  "cotizar", "cotización", "consulta", "información", "info",
  "servicio", "servicios", "página web", "pagina web", "bot", "sistema",
  "reunión", "reunion", "hablar", "llamar",
];

function hasLeadIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return INTENT_KEYWORDS.some((kw) => lower.includes(kw));
}

function looksLikeName(text: string): boolean {
  const t = text.trim();
  return (
    t.length > 0 &&
    t.length < 40 &&
    !t.includes("?") &&
    !hasLeadIntent(t)
  );
}

export async function processWebhookPayload(payload: unknown): Promise<void> {
  const p = payload as Record<string, unknown>;
  const type = p?.type;

  if (type === "whatsapp.message.updated") {
    console.log("[webhook] status update, ignorando");
    return;
  }

  if (type === "whatsapp.inbound_message.received") {
    const msg = p?.whatsappInboundMessage as Record<string, unknown> | undefined;
    if (msg) await handleIncomingMessage(msg);
    return;
  }

  console.log(`[webhook] evento no manejado: ${type}`);
}

async function handleIncomingMessage(
  msg: Record<string, unknown>
): Promise<void> {
  // 1. Solo mensajes de texto
  if (msg.type !== "text") {
    console.log(`[wh] tipo no soportado: ${msg.type}, ignorando`);
    return;
  }

  const waId = msg.id as string;
  const text = (msg.text as Record<string, string>)?.body;
  const rawPhone = msg.from as string;
  const senderName = (msg.senderName as string) ?? null;

  if (!waId || !text || !rawPhone) {
    console.warn("[wh] mensaje incompleto, ignorando", msg);
    return;
  }

  // 2. Deduplicación
  if (wasMessageProcessed(waId)) {
    console.log(`[wh] duplicado ${waId}, ignorando`);
    return;
  }

  // 3. Marcar procesado ANTES de continuar
  markMessageProcessed(waId);

  // 4. Normalizar teléfono (sin '+')
  const phone = rawPhone.startsWith("+") ? rawPhone.slice(1) : rawPhone;

  console.log(`[wh] ← de +${phone}: "${text.slice(0, 60)}"`);

  // 5. Conversación
  const convo = getOrCreateConversation(phone, senderName);

  // 6. Guardar mensaje del usuario
  insertMessage(convo.id, "user", text, waId);

  // 7. Captura de lead por intención real
  if (!convo.has_lead && hasLeadIntent(text)) {
    const existingLead = getLeadByConversationId(convo.id);
    if (!existingLead) {
      createLead(convo.id, convo.phone, convo.name);
      setConversationHasLead(convo.id, 1);
      console.log(`[lead] capturado por intención de +${phone} (${convo.name ?? "sin nombre"})`);
    }
  }

  // 8. Si ya hay lead y el mensaje parece un nombre, actualizar
  if (convo.has_lead && looksLikeName(text)) {
    const lead = getLeadByConversationId(convo.id);
    if (lead) {
      updateLead(lead.id, { name: text.trim() });
      console.log(`[lead] nombre actualizado → ${text.trim()}`);
    }
  }

  // 9. Re-leer modo (puede haber cambiado)
  const fresh = getConversationById(convo.id);
  if (!fresh || fresh.mode !== "AI") {
    console.log(`[wh] modo ${fresh?.mode ?? "?"} — sin respuesta automática`);
    return;
  }

  // 10. Construir historial y llamar a Gemini
  const history = getRecentHistory(convo.id, 20);
  const chatHistory: ChatMessage[] = history.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
  }));

  const t0 = Date.now();
  const rawReply = await getChatCompletion(chatHistory);
  console.log(`[wh] LLM en ${Date.now() - t0}ms`);

  if (!rawReply) {
    console.warn("[wh] Gemini devolvió respuesta vacía");
    return;
  }

  // Eliminar saltos de línea para respuesta de párrafo único
  const reply = rawReply.replace(/\n+/g, " ").trim();

  // 11. Guardar respuesta del asistente
  const messageId = insertMessage(convo.id, "assistant", reply, null);

  // 12. Enviar por WhatsApp y actualizar wa_message_id
  try {
    const { wa_message_id } = await sendTextMessage(phone, reply);
    updateMessageWaId(messageId, wa_message_id);
    console.log(`[wh] → enviado a +${phone}`);
  } catch (err) {
    console.error(`[wh] error al enviar a +${phone}:`, err);
  }
}
