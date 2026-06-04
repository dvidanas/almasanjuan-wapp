import type { WAMessage } from "@whiskeysockets/baileys";
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
  getNextAvailableSlots,
  getAvailableSlots,
  createAppointment,
  hasAppointmentForSlot,
  type AvailableSlot,
} from "@/lib/db";
import { getChatCompletion, getRawCompletion, type ChatMessage } from "@/lib/gemini";
import { sendTextMessage } from "./client";
import { clientConfig } from "@/lib/client.config";

const INTENT_KEYWORDS = [
  "presupuesto", "precio", "cuánto", "cuanto", "contratar", "contrataría",
  "quiero", "necesito", "me interesa", "interesado", "interesada",
  "cotizar", "cotización", "consulta", "información", "info",
  "servicio", "servicios", "página web", "pagina web", "bot", "sistema",
  "reunión", "reunion", "hablar", "llamar",
];

const NOT_A_NAME = [
  "gracias", "ok", "si", "no", "dale", "bueno", "listo",
  "perfecto", "genial", "bien", "claro", "obvio", "nada",
  "hola", "chau", "adios", "jaja", "jeje", "oka", "okey",
  "entendido", "de nada", "por favor", "porfa", "este",
  "ese", "eso", "acá", "ahi", "ahí", "ya", "igual",
  "después", "despues", "ahora", "luego", "mañana",
];

const NAME_ASK_KEYWORDS = [
  "nombre", "llamás", "llamas", "identificarte", "cómo te", "como te",
];

const pendingResponses = new Map<number, ReturnType<typeof setTimeout>>();

function hasLeadIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return INTENT_KEYWORDS.some((kw) => lower.includes(kw));
}

function isEngagedMessage(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (NOT_A_NAME.includes(t)) return false;
  const wordCount = t.split(/\s+/).filter(Boolean).length;
  return wordCount >= 2 || t.length > 20;
}

function isRealName(name: string | null): boolean {
  if (!name) return false;
  return !/^\+?[\d\s\-()+]+$/.test(name);
}

function looksLikeName(text: string, lastBotMessage: string | null): boolean {
  if (!lastBotMessage) return false;
  const lastLower = lastBotMessage.toLowerCase();
  if (!NAME_ASK_KEYWORDS.some((kw) => lastLower.includes(kw))) return false;
  const t = text.trim();
  if (t.length < 2 || t.length > 40) return false;
  if (/[0-9]/.test(t)) return false;
  if (/[?!]/.test(t)) return false;
  if (NOT_A_NAME.includes(t.toLowerCase())) return false;
  if (hasLeadIntent(t)) return false;
  return true;
}

function extractText(msg: WAMessage): string | null {
  const m = msg.message;
  if (!m) return null;
  return (
    m.conversation ??
    m.extendedTextMessage?.text ??
    m.imageMessage?.caption ??
    m.videoMessage?.caption ??
    null
  );
}

function extractPhone(jid: string): string {
  // "549264XXXXXXXX@s.whatsapp.net" → "549264XXXXXXXX"
  return jid.split("@")[0];
}

async function sendDebouncedReply(convoId: number, phone: string): Promise<void> {
  pendingResponses.delete(convoId);

  const fresh = getConversationById(convoId);
  if (!fresh || fresh.mode !== "AI") {
    console.log(`[handler] modo ${fresh?.mode ?? "?"} — sin respuesta automática`);
    return;
  }

  const history = getRecentHistory(convoId, 20);
  const chatHistory: ChatMessage[] = history.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
  }));

  const apptCfg = clientConfig.appointments;
  const botBookingEnabled =
    apptCfg?.enabled &&
    (clientConfig as { botBooking?: boolean }).botBooking !== false &&
    (clientConfig as { botBooking?: boolean }).botBooking === true;

  let availabilityNote = "";
  let offeredSlots: Array<AvailableSlot & { date: string }> = [];

  if (botBookingEnabled) {
    offeredSlots = getNextAvailableSlots(3, clientConfig.appointmentDuration ?? 30);
    if (offeredSlots.length > 0) {
      const slotList = offeredSlots
        .slice(0, 6)
        .map((s) => {
          const d = new Date(s.date + "T12:00:00");
          const dayName = d.toLocaleDateString("es-AR", { weekday: "long" });
          const [, month, day] = s.date.split("-");
          return `${dayName} ${day}/${month} a las ${s.time_start}`;
        })
        .join(", ");
      availabilityNote =
        ` DISPONIBILIDAD ACTUAL PARA TURNOS: ${slotList}. ` +
        "Si el usuario quiere un turno, podés ofrecerle estos horarios.";
    }
  }

  const t0 = Date.now();
  let rawReply: string;
  try {
    rawReply = await getChatCompletion(chatHistory, availabilityNote || undefined);
  } catch (err) {
    console.error(`[handler] error Gemini para +${phone}:`, err);
    return;
  }
  console.log(`[handler] LLM en ${Date.now() - t0}ms`);

  if (!rawReply) {
    console.warn("[handler] Gemini devolvió respuesta vacía");
    return;
  }

  const reply = rawReply.replace(/\n+/g, " ").trim();
  const messageId = insertMessage(convoId, "assistant", reply, null);

  try {
    const { wa_message_id } = await sendTextMessage(phone, reply);
    updateMessageWaId(messageId, wa_message_id);
    console.log(`[handler] → enviado a +${phone}`);
  } catch (err) {
    console.error(`[handler] error al enviar a +${phone}:`, err);
  }

  if (botBookingEnabled && offeredSlots.length > 0) {
    tryBookAppointmentFromChat(
      convoId, phone, history, offeredSlots, clientConfig.appointmentDuration ?? 30
    ).catch((err) => console.error("[appt] error:", err));
  }
}

async function tryBookAppointmentFromChat(
  convoId: number,
  phone: string,
  history: { role: string; content: string }[],
  offeredSlots: Array<AvailableSlot & { date: string }>,
  defaultDuration: number
): Promise<void> {
  const lastUserMsg = [...history].reverse().find((m) => m.role === "user");
  if (!lastUserMsg) return;

  const slotList = offeredSlots.slice(0, 8).map((s) => `${s.date} ${s.time_start}`).join(", ");
  const conversation = history
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Usuario" : "Bot"}: ${m.content}`)
    .join("\n");

  const prompt = `Sos un extractor de datos. Analizá esta conversación y determiná si el ÚLTIMO mensaje del usuario confirma o elige un turno específico de la lista.

Turnos disponibles ofrecidos: ${slotList}

Conversación:
${conversation}

Si el usuario eligió o confirmó un turno concreto de la lista, respondé ÚNICAMENTE con este JSON (sin markdown):
{"date":"YYYY-MM-DD","time_start":"HH:MM"}

Si NO eligió ninguno todavía, respondé ÚNICAMENTE con:
null`;

  let raw: string;
  try {
    raw = await getRawCompletion(prompt);
  } catch { return; }

  const clean = raw.trim().replace(/```json|```/g, "").trim();
  if (clean === "null" || !clean.startsWith("{")) return;

  let parsed: { date?: string; time_start?: string };
  try { parsed = JSON.parse(clean); } catch { return; }

  const { date, time_start } = parsed;
  if (!date || !time_start) return;

  const stillAvailable = getAvailableSlots(date, defaultDuration).some(
    (s) => s.time_start === time_start
  );
  if (!stillAvailable) return;

  if (hasAppointmentForSlot(convoId, date, time_start)) return;

  const lead = getLeadByConversationId(convoId);
  const validSlot = offeredSlots.find((s) => s.date === date && s.time_start === time_start);
  if (!validSlot) return;

  const id = createAppointment({
    resource_id: validSlot.resource_id,
    conversation_id: convoId,
    date,
    time_start,
    duration_minutes: defaultDuration,
    source: "bot",
    contact_name: lead?.name ?? null,
    contact_phone: phone,
  });

  console.log(`[appt] turno creado id=${id} para +${phone} → ${date} ${time_start}`);
}

export async function handleBaileysMessage(msg: WAMessage): Promise<void> {
  const jid = msg.key.remoteJid;
  if (!jid || jid.endsWith("@g.us")) return; // ignorar grupos

  const waId = msg.key.id!;
  const text = extractText(msg);
  const phone = extractPhone(jid);
  const senderName = (msg as { pushName?: string }).pushName ?? null;

  if (!text?.trim()) {
    console.log(`[handler] mensaje sin texto (tipo no soportado) de +${phone}, ignorando`);
    return;
  }

  if (wasMessageProcessed(waId)) {
    console.log(`[handler] duplicado ${waId}, ignorando`);
    return;
  }
  markMessageProcessed(waId);

  console.log(`[handler] ← de +${phone}: "${text.slice(0, 60)}"`);

  const convo = getOrCreateConversation(phone, senderName);
  insertMessage(convo.id, "user", text, waId);

  const history = getRecentHistory(convo.id, 20);
  const lastBotMessage =
    [...history].reverse().find((m) => m.role === "assistant")?.content ?? null;

  if (!convo.has_lead && hasLeadIntent(text)) {
    const existingLead = getLeadByConversationId(convo.id);
    if (!existingLead) {
      createLead(convo.id, convo.phone, convo.name);
      setConversationHasLead(convo.id, 1);
      console.log(`[lead] capturado por intención de +${phone}`);
    }
  }

  if (convo.has_lead && looksLikeName(text, lastBotMessage)) {
    const lead = getLeadByConversationId(convo.id);
    if (lead && !isRealName(lead.name)) {
      updateLead(lead.id, { name: text.trim() });
      console.log(`[lead] nombre actualizado → ${text.trim()}`);
    }
  }

  const fresh = getConversationById(convo.id);
  if (!fresh || fresh.mode !== "AI") {
    console.log(`[handler] modo ${fresh?.mode ?? "?"} — sin respuesta automática`);
    return;
  }

  const existing = pendingResponses.get(convo.id);
  if (existing) {
    clearTimeout(existing);
    console.log(`[handler] timer reiniciado para +${phone}`);
  }

  const hasPriorBotMessage = history.some((m) => m.role === "assistant");
  const delay = hasPriorBotMessage
    ? (clientConfig.responseDelayMs ?? 8000)
    : Math.min(clientConfig.responseDelayMs ?? 8000, 2000);

  pendingResponses.set(
    convo.id,
    setTimeout(() => {
      sendDebouncedReply(convo.id, phone).catch((err) =>
        console.error(`[handler] error en sendDebouncedReply para +${phone}:`, err)
      );
    }, delay)
  );

  console.log(`[handler] respuesta programada en ${delay}ms para +${phone}`);
}
