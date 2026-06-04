"use client";
import { useEffect, useState, useCallback } from "react";
import { ConfigScreen } from "./ConfigScreen";

interface Status {
  status: string;
  missing?: string[];
  phone?: string;
  qr?: string | null;
  message?: string;
}

interface Props {
  children: (status: Status) => React.ReactNode;
}

export function ConnectionGate({ children }: Props) {
  const [status, setStatus] = useState<Status | null>(null);

  const fetchStatus = useCallback(() => {
    fetch("/api/connection/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() =>
        setStatus({ status: "error", message: "No se pudo verificar la conexión" })
      );
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Refrescar automáticamente mientras espera conexión o QR
  useEffect(() => {
    if (!status) return;
    const polling = ["qr_pending", "connecting", "starting", "closed"];
    if (polling.includes(status.status)) {
      const t = setInterval(fetchStatus, 3000);
      return () => clearInterval(t);
    }
  }, [status?.status, fetchStatus]);

  if (!status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Verificando configuración...</p>
      </div>
    );
  }

  if (status.status === "missing_config") {
    return (
      <ConfigScreen
        missing={status.missing ?? []}
        onContinue={() => setStatus({ status: "connecting" })}
      />
    );
  }

  if (status.status === "qr_pending") {
    return (
      <div className="min-h-screen bg-[var(--color-wa-bg,#f0f2f5)] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-5 max-w-sm w-full">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-semibold text-gray-800">Alma San Juan</span>
            <span className="text-sm text-gray-500">Conectar WhatsApp</span>
          </div>
          {status.qr ? (
            <img
              src={status.qr}
              alt="Código QR de WhatsApp"
              className="w-64 h-64 rounded-xl border border-gray-100"
            />
          ) : (
            <div className="w-64 h-64 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
              <p className="text-sm text-gray-400">Generando QR...</p>
            </div>
          )}
          <div className="text-center space-y-1">
            <p className="text-sm text-gray-600 font-medium">Escaneá con tu WhatsApp</p>
            <p className="text-xs text-gray-400">
              Abrí WhatsApp → Dispositivos vinculados → Vincular dispositivo
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Esperando escaneo...
          </div>
        </div>
      </div>
    );
  }

  if (status.status === "starting" || status.status === "connecting") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Conectando WhatsApp...</p>
        </div>
      </div>
    );
  }

  if (status.status === "closed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-4 max-w-xs w-full text-center">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-800">WhatsApp desconectado</p>
            <p className="text-sm text-gray-500 mt-1">Reconectando automáticamente...</p>
          </div>
          <button
            onClick={fetchStatus}
            className="text-sm text-green-600 hover:underline"
          >
            Verificar estado
          </button>
        </div>
      </div>
    );
  }

  return <>{children(status)}</>;
}
