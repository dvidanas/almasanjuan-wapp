"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { TopNav, BottomNav } from "@/components/TopNav";
import { ConversationList } from "@/components/ConversationList";
import { ConversationPanel } from "@/components/ConversationPanel";
import { PullToRefresh } from "@/components/PullToRefresh";

type ChatFilter = "todos" | "leads" | "sinleer" | "bot";
const CHAT_FILTERS: { key: ChatFilter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "leads", label: "Leads" },
  { key: "sinleer", label: "Sin leer" },
  { key: "bot", label: "Bot activo" },
];

interface Conversation {
  id: number;
  phone: string;
  name: string | null;
  mode: "AI" | "HUMAN";
  has_lead: number;
  last_message_at: number | null;
  created_at: number;
}

interface WAStatus {
  status: string;
  phone?: string | null;
  qr?: string | null;
}

// ── Modal de conexión WhatsApp ─────────────────────────────────────────────
function WhatsAppModal({ onClose }: { onClose: () => void }) {
  const [waStatus, setWaStatus] = useState<WAStatus>({ status: "loading" });

  const fetchStatus = useCallback(() => {
    fetch("/api/connection/status")
      .then((r) => r.json())
      .then((d) => setWaStatus(d))
      .catch(() => setWaStatus({ status: "error" }));
  }, []);

  useEffect(() => {
    fetchStatus();
    const t = setInterval(fetchStatus, 3000);
    return () => clearInterval(t);
  }, [fetchStatus]);

  // Si se conectó, cerrar el modal automáticamente
  useEffect(() => {
    if (waStatus.status === "connected") {
      const t = setTimeout(onClose, 1500);
      return () => clearTimeout(t);
    }
  }, [waStatus.status, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-800">WhatsApp</p>
            <p className="text-xs text-gray-400">Alma San Juan</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center gap-4">
          {waStatus.status === "loading" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Verificando estado...</p>
            </div>
          )}

          {waStatus.status === "connected" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-800">Conectado</p>
                {waStatus.phone && (
                  <p className="text-sm text-gray-500">+{waStatus.phone}</p>
                )}
              </div>
            </div>
          )}

          {waStatus.status === "qr_pending" && (
            <>
              {waStatus.qr ? (
                <img
                  src={waStatus.qr}
                  alt="QR de WhatsApp"
                  className="w-56 h-56 rounded-xl border border-gray-100"
                />
              ) : (
                <div className="w-56 h-56 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-gray-700">Escaneá con WhatsApp</p>
                <p className="text-xs text-gray-400">Dispositivos vinculados → Vincular dispositivo</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Esperando escaneo...
              </div>
            </>
          )}

          {(waStatus.status === "connecting" || waStatus.status === "starting") && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Conectando...</p>
            </div>
          )}

          {(waStatus.status === "closed" || waStatus.status === "error") && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-700">Sin conexión</p>
                <p className="text-xs text-gray-400 mt-1">Reconectando automáticamente...</p>
              </div>
              <button
                onClick={fetchStatus}
                className="text-sm text-green-600 hover:underline"
              >
                Verificar ahora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard principal ────────────────────────────────────────────────────
function Dashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatFilter, setChatFilter] = useState<ChatFilter>("todos");
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const id = searchParams.get("id");
    return id ? parseInt(id, 10) : null;
  });
  const [mobileView, setMobileView] = useState<"list" | "conversation">(() =>
    searchParams.get("id") ? "conversation" : "list"
  );
  const [showWAModal, setShowWAModal] = useState(false);
  const [waStatus, setWaStatus] = useState<WAStatus>({ status: "starting" });

  const prevConversations = useRef<Conversation[]>([]);

  // Polling status liviano para el dot del header
  useEffect(() => {
    const fetchStatus = () => {
      fetch("/api/connection/status")
        .then((r) => r.json())
        .then(setWaStatus)
        .catch(() => {});
    };
    fetchStatus();
    const t = setInterval(fetchStatus, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const playAlertSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch {}
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data: Conversation[] = await res.json();
        if (prevConversations.current.length > 0) {
          for (const conv of data) {
            const prev = prevConversations.current.find((p) => p.id === conv.id);
            if (prev) {
              if (prev.mode === "AI" && conv.mode === "HUMAN") {
                playAlertSound();
                if ("Notification" in window && Notification.permission === "granted") {
                  new Notification("Asistencia Requerida", {
                    body: `La IA ha derivado a un humano en el chat con ${conv.name ?? "+" + conv.phone}`,
                    icon: "/favicon.ico",
                  });
                }
              } else if (conv.mode === "HUMAN" && conv.last_message_at !== prev.last_message_at && conv.last_message_at) {
                playAlertSound();
                if ("Notification" in window && Notification.permission === "granted" && document.visibilityState !== "visible") {
                  new Notification("Nuevo Mensaje", {
                    body: `Nuevo mensaje de ${conv.name ?? "+" + conv.phone}`,
                    icon: "/favicon.ico",
                  });
                }
              }
            }
          }
        }
        prevConversations.current = data;
        setConversations(data);
      }
    } catch {}
  }, [playAlertSound]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 2000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const filteredConversations = useMemo(() => {
    switch (chatFilter) {
      case "leads": return conversations.filter((c) => c.has_lead === 1);
      case "sinleer": return conversations.filter((c) => c.last_message_at !== null && c.last_message_at > Date.now() / 1000 - 3600);
      case "bot": return conversations.filter((c) => c.mode === "AI");
      default: return conversations;
    }
  }, [conversations, chatFilter]);

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;

  function handleSelect(id: number) { setSelectedId(id); setMobileView("conversation"); }
  function handleBack() { setMobileView("list"); }
  function handleModeChange(id: number, mode: "AI" | "HUMAN") {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, mode } : c)));
  }
  function handleDelete(id: number) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) { setSelectedId(null); setMobileView("list"); }
  }

  const isConnected = waStatus.status === "connected";
  const dotColor = isConnected ? "bg-green-500" : waStatus.status === "qr_pending" ? "bg-amber-400 animate-pulse" : "bg-red-400";

  return (
    <div className="flex flex-col h-dvh bg-[var(--color-wa-bg-main)]">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <PullToRefresh onRefresh={fetchConversations} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden md:p-3 md:gap-3">

            {/* Lista de conversaciones */}
            <aside className={`
              ${mobileView === "conversation" ? "hidden" : "flex"} md:flex
              w-full md:w-[350px] md:flex-shrink-0
              bg-white dark:bg-[var(--color-wa-panel-l)] flex-col
              md:rounded-2xl md:shadow-[0_1px_4px_rgba(0,0,0,0.08)] md:overflow-hidden
            `}>
              <div className="relative px-4 py-3 border-b border-[var(--color-wa-sep)] flex items-center justify-between flex-shrink-0">
                <h2 className="text-base font-semibold text-[var(--color-wa-text-main)]">Mensajes</h2>
                {isConnected && waStatus.phone && (
                  <span className="text-sm font-medium text-[var(--color-wa-text-sec)] absolute left-1/2 -translate-x-1/2">
                    +{waStatus.phone}
                  </span>
                )}
                {/* Botón de estado WA → abre modal */}
                <button
                  onClick={() => setShowWAModal(true)}
                  title={isConnected ? "WhatsApp conectado" : "Ver estado de WhatsApp"}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[var(--color-wa-hover)] transition-colors"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                  {!isConnected && (
                    <span className="text-xs text-[var(--color-wa-text-sec)]">
                      {waStatus.status === "qr_pending" ? "Escanear QR" : "Desconectado"}
                    </span>
                  )}
                </button>
              </div>

              <div className="p-2 border-b border-[var(--color-wa-sep)] flex-shrink-0">
                <div className="bg-[var(--color-wa-bg-main)] rounded-lg px-3 py-1.5 flex items-center gap-3">
                  <svg className="w-5 h-5 text-[var(--color-wa-text-sec)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input type="text" placeholder="Buscar o iniciar un nuevo chat" className="bg-transparent border-none outline-none text-sm w-full text-[var(--color-wa-text-main)] placeholder-[var(--color-wa-text-sec)]" />
                </div>
              </div>

              {/* Filtros */}
              <div className="px-3 py-2 flex gap-1.5 border-b border-[var(--color-wa-sep)] flex-shrink-0 overflow-x-auto scrollbar-hide">
                {CHAT_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setChatFilter(f.key)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      chatFilter === f.key
                        ? "bg-[var(--color-wa-green)] text-[var(--color-wa-green-text)]"
                        : "bg-[var(--color-wa-bg-main)] text-[var(--color-wa-text-sec)] hover:bg-[var(--color-wa-hover)]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto">
                <ConversationList
                  conversations={filteredConversations}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                />
              </div>
            </aside>

            {/* Panel de conversación */}
            <main className={`
              ${mobileView === "list" ? "hidden" : "flex"} md:flex
              flex-1 bg-white dark:bg-[var(--color-wa-panel-r)] flex-col
              md:rounded-2xl md:shadow-[0_1px_4px_rgba(0,0,0,0.08)] md:overflow-hidden
            `}>
              {selectedConversation ? (
                <ConversationPanel
                  key={selectedConversation.id}
                  conversation={selectedConversation}
                  onModeChange={handleModeChange}
                  onDelete={handleDelete}
                  onBack={handleBack}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 bg-gradient-to-b from-transparent to-[var(--color-wa-hover)]/30">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 mb-8 rounded-full bg-gradient-to-br from-white to-[var(--bg-main)] dark:from-[var(--bg-panel-l)] dark:to-[var(--bg-main)] border border-[var(--color-wa-sep)]/60 flex items-center justify-center shadow-lg">
                    <span className="absolute inset-0 rounded-full bg-[var(--color-wa-green)]/5 animate-ping opacity-60" style={{ animationDuration: "4s" }} />
                    <svg className="w-16 h-16 md:w-20 md:h-20 text-[var(--color-wa-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                      <ellipse cx="12" cy="11" rx="6" ry="4.5" />
                      <path strokeLinecap="round" d="M7 14c-1.5 1-2.5 2.5-2 4 1 .5 2.5 0 4-1" />
                      <path strokeLinecap="round" d="M17 14c1.5 1 2.5 2.5 2 4-1 .5-2.5 0-4-1" />
                      <path strokeLinecap="round" d="M9 9.5C9.5 8 11 7 12 7s2.5 1 3 2.5" />
                    </svg>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-wa-text-main)] mb-3">
                    Alma San Juan
                  </h1>
                  <p className="text-sm font-medium text-[var(--color-wa-text-sec)] max-w-sm mb-6">
                    Giuli está gestionando las consultas de depilación láser.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-wa-sep)] bg-[var(--color-wa-panel-l)] shadow-sm text-xs font-semibold text-[var(--color-wa-text-sec)]">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                    {isConnected ? "WhatsApp conectado" : "WhatsApp desconectado"}
                  </div>
                </div>
              )}
            </main>

          </div>
        </PullToRefresh>
      </div>
      <BottomNav />

      {showWAModal && <WhatsAppModal onClose={() => setShowWAModal(false)} />}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <Dashboard />
    </Suspense>
  );
}
