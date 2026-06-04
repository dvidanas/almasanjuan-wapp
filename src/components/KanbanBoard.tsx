"use client";
import { useState } from "react";

interface Lead {
  id: number;
  phone: string;
  name: string | null;
  business: string | null;
  problem: string | null;
  status: "nuevo" | "seguimiento" | "cerrado" | "descartado";
  summary: string | null;
  created_at: number;
  conv_phone: string;
  conv_name: string | null;
}

interface KanbanBoardProps {
  leads: Lead[];
  onSelectLead: (id: number) => void;
  onStatusChange: (id: number, status: Lead["status"]) => void;
}

const COLUMNS: { id: Lead["status"]; label: string; color: string }[] = [
  { id: "nuevo", label: "Nuevo", color: "border-[var(--color-status-new-text)]" },
  { id: "seguimiento", label: "Seguimiento", color: "border-[var(--color-status-follow-text)]" },
  { id: "cerrado", label: "Cerrado", color: "border-[var(--color-status-closed-text)]" },
  { id: "descartado", label: "Descartado", color: "border-[var(--color-status-inactive-text)]" },
];

interface SummaryData {
  resumen: string;
  interes: string;
  temperatura: "frio" | "tibio" | "caliente";
  siguiente_paso: string;
}

function parseSummary(s: string | null | undefined): SummaryData | null {
  if (!s) return null;
  try { return JSON.parse(s) as SummaryData; } catch { return null; }
}

function tempBadgeStyle(temp: string): string {
  if (temp === "caliente") return "bg-[var(--color-temp-hot-bg)] text-[var(--color-temp-hot-text)] border border-[var(--color-temp-hot-border)]";
  if (temp === "tibio") return "bg-[var(--color-temp-warm-bg)] text-[var(--color-temp-warm-text)] border border-[var(--color-temp-warm-border)]";
  return "bg-[var(--color-temp-cold-bg)] text-[var(--color-temp-cold-text)] border border-[var(--color-temp-cold-border)]";
}

function tempEmoji(temp: string): string {
  if (temp === "caliente") return "🔥";
  if (temp === "tibio") return "🌡️";
  return "❄️";
}

function displayName(lead: Lead): string {
  return lead.conv_name ?? lead.name ?? `+${lead.conv_phone}`;
}

export function KanbanBoard({ leads, onSelectLead, onStatusChange }: KanbanBoardProps) {
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);

  const handleDragStart = (id: number) => {
    setDraggedLeadId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: Lead["status"]) => {
    if (draggedLeadId !== null) {
      onStatusChange(draggedLeadId, status);
      setDraggedLeadId(null);
    }
  };

  return (
    <div className="flex-1 flex gap-4 overflow-x-auto pb-4 h-full">
      {COLUMNS.map((col) => {
        const columnLeads = leads.filter((l) => l.status === col.id);
        
        return (
          <div
            key={col.id}
            className="flex flex-col w-80 flex-shrink-0 bg-white dark:bg-[var(--color-wa-panel-l)] rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.08)] overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(col.id)}
          >
            <div className={`px-4 py-3 bg-[var(--color-wa-header)] border-b-2 ${col.color}`}>
              <h3 className="font-semibold text-[var(--color-wa-text-main)] flex items-center justify-between">
                {col.label}
                <span className="text-xs bg-[var(--color-wa-bg-main)] text-[var(--color-wa-text-sec)] px-2 py-0.5 rounded-full border border-[var(--color-wa-sep)]">
                  {columnLeads.length}
                </span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[var(--color-wa-bg-main)]/30">
              {columnLeads.map((lead) => {
                const name = displayName(lead);
                const sm = parseSummary(lead.summary);
                return (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    onClick={() => onSelectLead(lead.id)}
                    className="bg-[var(--color-wa-panel-l)] p-4 rounded-xl border border-[var(--color-wa-sep)] shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative"
                  >
                    <h4 className="font-semibold text-[var(--color-wa-text-main)] text-sm mb-1 line-clamp-1">{name}</h4>
                    <p className="text-xs text-[var(--color-wa-text-sec)] line-clamp-2">
                      {lead.business || lead.problem || `Sin detalles adicionales`}
                    </p>
                    <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[10px] text-[var(--color-wa-text-sec)] font-medium bg-[var(--color-wa-bg-main)] px-1.5 py-0.5 rounded">
                        {new Date(lead.created_at * 1000).toLocaleDateString()}
                      </span>
                      {sm && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tempBadgeStyle(sm.temperatura)}`}>
                          {tempEmoji(sm.temperatura)} {sm.temperatura}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
