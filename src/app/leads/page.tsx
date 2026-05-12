"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Lead {
  id: number;
  conversation_id: number;
  phone: string;
  name: string | null;
  business: string | null;
  problem: string | null;
  status: "nuevo" | "seguimiento" | "cerrado" | "descartado";
  notes: string | null;
  created_at: number;
  conv_phone: string;
  conv_name: string | null;
}

const STATUS_STYLES: Record<Lead["status"], string> = {
  nuevo: "bg-blue-100 text-blue-700",
  seguimiento: "bg-yellow-100 text-yellow-700",
  cerrado: "bg-emerald-100 text-emerald-700",
  descartado: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<Lead["status"], string> = {
  nuevo: "Nuevo",
  seguimiento: "Seguimiento",
  cerrado: "Cerrado",
  descartado: "Descartado",
};

function timeStr(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) setLeads(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 5000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  async function changeStatus(id: number, status: Lead["status"]) {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function saveNotes(id: number) {
    const notes = editingNotes[id] ?? "";
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)));
    setEditingNotes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function deleteLead(id: number) {
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setConfirmDelete(null);
  }

  const newCount = leads.filter((l) => l.status === "nuevo").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ← Dashboard
          </Link>
          <h1 className="text-sm font-semibold text-gray-900">Leads</h1>
          {newCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
              {newCount} nuevo{newCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">{leads.length} total</p>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-gray-400">Cargando leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Sin leads todavía</p>
            <p className="text-xs text-gray-400 mt-1">
              Se capturan automáticamente cuando un contacto comparte su teléfono
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono lead</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Negocio</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    {/* Contacto */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {lead.conv_name ?? `+${lead.conv_phone}`}
                      </p>
                      <p className="text-xs text-gray-400">+{lead.conv_phone}</p>
                    </td>

                    {/* Teléfono capturado */}
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                      {lead.phone}
                    </td>

                    {/* Negocio */}
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px] truncate">
                      {lead.business ?? <span className="text-gray-300">—</span>}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => changeStatus(lead.id, e.target.value as Lead["status"])}
                        className={`text-xs font-semibold px-2 py-1 rounded border-0 cursor-pointer ${STATUS_STYLES[lead.status]}`}
                      >
                        {(Object.keys(STATUS_LABELS) as Lead["status"][]).map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>

                    {/* Notas */}
                    <td className="px-4 py-3 min-w-[200px]">
                      {lead.id in editingNotes ? (
                        <div className="flex gap-1">
                          <input
                            autoFocus
                            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            value={editingNotes[lead.id]}
                            onChange={(e) =>
                              setEditingNotes((prev) => ({ ...prev, [lead.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveNotes(lead.id);
                              if (e.key === "Escape")
                                setEditingNotes((prev) => {
                                  const next = { ...prev };
                                  delete next[lead.id];
                                  return next;
                                });
                            }}
                          />
                          <button
                            onClick={() => saveNotes(lead.id)}
                            className="text-xs px-2 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setEditingNotes((prev) => ({ ...prev, [lead.id]: lead.notes ?? "" }))
                          }
                          className="text-xs text-gray-500 hover:text-gray-800 text-left w-full truncate"
                        >
                          {lead.notes || <span className="text-gray-300 italic">Agregar nota...</span>}
                        </button>
                      )}
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {timeStr(lead.created_at)}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      {confirmDelete === lead.id ? (
                        <div className="flex gap-1 items-center">
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs px-2 py-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(lead.id)}
                          className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                          title="Eliminar lead"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
