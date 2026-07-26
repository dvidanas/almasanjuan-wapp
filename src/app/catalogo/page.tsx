"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { TopNav, BottomNav } from "@/components/TopNav";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Servicio {
  id: number;
  categoria: "mujer" | "hombre" | "unisex";
  nombre: string;
  precio: number;
  duracion_min: number;
  es_promo: number;
  destacado: number;
  orden: number;
  activo: number;
}

type Selection = { kind: "new"; categoria: Servicio["categoria"] } | { kind: "edit"; item: Servicio } | null;

const CATEGORIAS: { key: Servicio["categoria"]; label: string }[] = [
  { key: "mujer", label: "Mujer" },
  { key: "hombre", label: "Hombre" },
  { key: "unisex", label: "Unisex" },
];

const INPUT =
  "w-full bg-[var(--color-wa-bg-main)] border border-[var(--color-wa-sep)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-wa-text-main)] outline-none focus:border-[var(--color-wa-green)] focus:ring-2 focus:ring-[var(--color-wa-green)]/20 transition-colors";

const BTN_PRIMARY =
  "px-5 py-2.5 bg-[var(--color-wa-green)] text-[var(--color-wa-green-text)] text-sm font-semibold rounded-xl hover:bg-[var(--color-wa-green-dark)] active:scale-95 disabled:opacity-50 transition-all duration-150";

const BTN_GHOST =
  "px-4 py-2 text-sm text-[var(--color-wa-text-sec)] hover:text-[var(--color-wa-text-main)] transition-colors";

function formatPrecio(n: number): string {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

// ── Form ──────────────────────────────────────────────────────────────────────

const EMPTY_FORM = { categoria: "mujer" as Servicio["categoria"], nombre: "", precio: "", duracion_min: 30, orden: 0, es_promo: true };

function ServicioForm({
  initial,
  defaultCategoria,
  onSave,
  onCancel,
}: {
  initial?: Servicio;
  defaultCategoria?: Servicio["categoria"];
  onSave: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(
    initial
      ? { categoria: initial.categoria, nombre: initial.nombre, precio: String(initial.precio), duracion_min: initial.duracion_min, orden: initial.orden, es_promo: !!initial.es_promo }
      : { ...EMPTY_FORM, categoria: defaultCategoria ?? "mujer" }
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.nombre.trim() || !form.precio) return;
    setSaving(true);
    const payload = {
      categoria: form.categoria,
      nombre: form.nombre.trim(),
      precio: Number(form.precio),
      duracion_min: Number(form.duracion_min) || 30,
      orden: Number(form.orden) || 0,
      es_promo: form.es_promo ? 1 : 0,
    };
    if (initial) {
      await fetch(`/api/servicios/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-[var(--color-wa-text-main)]">
        {initial ? "Editar servicio" : "Nuevo servicio"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--color-wa-text-main)] mb-1">Categoría *</label>
          <select
            value={form.categoria}
            onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value as Servicio["categoria"] }))}
            className={INPUT}
          >
            {CATEGORIAS.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-wa-text-main)] mb-1">Precio *</label>
          <input
            type="number"
            min={0}
            step={100}
            value={form.precio}
            onChange={(e) => setForm((p) => ({ ...p, precio: e.target.value }))}
            className={INPUT}
            placeholder="Ej: 18500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[var(--color-wa-text-main)] mb-1">Nombre *</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
            className={INPUT}
            placeholder="Ej: Rostro completo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-wa-text-main)] mb-1">Duración (min)</label>
          <input
            type="number"
            min={5}
            step={5}
            value={form.duracion_min}
            onChange={(e) => setForm((p) => ({ ...p, duracion_min: Number(e.target.value) }))}
            className={INPUT}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-wa-text-main)] mb-1">
            Orden manual <span className="text-xs font-normal text-[var(--color-wa-text-sec)]">(0 = automático por precio)</span>
          </label>
          <input
            type="number"
            value={form.orden}
            onChange={(e) => setForm((p) => ({ ...p, orden: Number(e.target.value) }))}
            className={INPUT}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-[var(--color-wa-text-main)] cursor-pointer">
        <input
          type="checkbox"
          checked={form.es_promo}
          onChange={(e) => setForm((p) => ({ ...p, es_promo: e.target.checked }))}
          className="w-4 h-4 accent-[var(--color-wa-green)]"
        />
        Es promoción
      </label>
      <div className="flex gap-2">
        <button onClick={save} disabled={saving || !form.nombre.trim() || !form.precio} className={BTN_PRIMARY}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button onClick={onCancel} className={BTN_GHOST}>Cancelar</button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CatalogoPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selection, setSelection] = useState<Selection>(null);
  const [deleteTarget, setDeleteTarget] = useState<Servicio | null>(null);

  const load = useCallback(() =>
    fetch("/api/servicios").then((r) => r.json()).then(setServicios), []);

  useEffect(() => { load(); }, [load]);

  const grouped = useMemo(() => {
    const map: Record<string, Servicio[]> = { mujer: [], hombre: [], unisex: [] };
    for (const s of servicios) map[s.categoria]?.push(s);
    return map;
  }, [servicios]);

  const toggleActive = async (s: Servicio) => {
    await fetch(`/api/servicios/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: s.activo ? 0 : 1 }),
    });
    load();
  };

  const toggleDestacado = async (s: Servicio) => {
    await fetch(`/api/servicios/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destacado: !s.destacado }),
    });
    load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/servicios/${deleteTarget.id}`, { method: "DELETE" });
    if (selection?.kind === "edit" && selection.item.id === deleteTarget.id) setSelection(null);
    setDeleteTarget(null);
    load();
  };

  return (
    <div className="flex flex-col h-dvh bg-[var(--color-wa-bg-main)]">
      <TopNav />

      <div className="flex-1 flex min-h-0 md:p-3 md:gap-3 overflow-hidden">
        {/* Left sidebar */}
        <aside
          className="w-full md:w-[380px] flex-shrink-0 flex flex-col bg-[var(--color-wa-panel-l)] md:rounded-2xl overflow-hidden border-r md:border border-[var(--color-wa-sep)]"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex-1 overflow-y-auto pb-4">
            {CATEGORIAS.map((cat) => {
              const items = grouped[cat.key] ?? [];
              if (items.length === 0 && cat.key === "unisex") return null;
              return (
                <div key={cat.key}>
                  <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-wa-text-sec)]">
                      {cat.label} ({items.length})
                    </span>
                    <button
                      onClick={() => setSelection({ kind: "new", categoria: cat.key })}
                      className="text-xs font-semibold text-[var(--color-wa-green)] hover:underline"
                    >
                      + Agregar
                    </button>
                  </div>
                  <ul className="px-2 pb-2 flex flex-col gap-1">
                    {items.length === 0 && (
                      <li className="px-3 py-2 text-sm text-[var(--color-wa-text-sec)]">Sin servicios aún.</li>
                    )}
                    {items.map((s) => (
                      <li key={s.id}>
                        <div
                          onClick={() => setSelection({ kind: "edit", item: s })}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                            selection?.kind === "edit" && selection.item.id === s.id
                              ? "bg-[var(--color-wa-green)]/10"
                              : "hover:bg-[var(--color-wa-hover)]"
                          } ${!s.activo ? "opacity-50" : ""}`}
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.activo ? "bg-[var(--color-wa-green)]" : "bg-[var(--color-wa-sep)]"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-wa-text-main)] truncate flex items-center gap-1.5">
                              {s.nombre}
                              {!!s.destacado && (
                                <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.364 1.118l1.287 3.958c.3.922-.755 1.688-1.538 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.062 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
                                </svg>
                              )}
                            </p>
                            <p className="text-xs text-[var(--color-wa-text-sec)] truncate">
                              {formatPrecio(s.precio)} · {s.duracion_min} min
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => toggleDestacado(s)}
                              className={`p-1 rounded hover:bg-[var(--color-wa-hover)] ${s.destacado ? "text-amber-400" : "text-[var(--color-wa-text-sec)]"}`}
                              title={s.destacado ? "Quitar destacado" : "Marcar como destacado"}
                            >
                              <svg className="w-3.5 h-3.5" fill={s.destacado ? "currentColor" : "none"} viewBox="0 0 20 20" stroke="currentColor" strokeWidth={s.destacado ? 0 : 1.5}>
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.364 1.118l1.287 3.958c.3.922-.755 1.688-1.538 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.062 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => toggleActive(s)}
                              className="p-1 rounded hover:bg-[var(--color-wa-hover)] text-[var(--color-wa-text-sec)]"
                              title={s.activo ? "Desactivar" : "Activar"}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {s.activo
                                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                }
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(s)}
                              className="p-1 rounded hover:bg-[var(--color-wa-hover)] text-red-500"
                              title="Eliminar"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right panel */}
        <main
          className={`flex-1 min-w-0 bg-[var(--color-wa-panel-l)] md:rounded-2xl overflow-hidden ${!selection ? "hidden md:flex" : "flex"} flex-col`}
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="px-6 md:px-8 py-3 flex items-center justify-between border-b border-[var(--color-wa-sep)] flex-shrink-0">
            <h2 className="text-base font-semibold text-[var(--color-wa-text-main)]">Catálogo de servicios</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {!selection && (
              <div className="flex-1 flex items-center justify-center h-full text-[var(--color-wa-text-sec)] text-sm">
                Seleccioná un servicio para editar, o creá uno nuevo desde una categoría.
              </div>
            )}
            {selection?.kind === "new" && (
              <ServicioForm
                defaultCategoria={selection.categoria}
                onSave={() => { load(); setSelection(null); }}
                onCancel={() => setSelection(null)}
              />
            )}
            {selection?.kind === "edit" && (
              <ServicioForm
                initial={selection.item}
                onSave={() => { load(); setSelection(null); }}
                onCancel={() => setSelection(null)}
              />
            )}
          </div>
        </main>
      </div>

      <BottomNav />

      {deleteTarget && (
        <ConfirmDialog
          message={`¿Eliminar el servicio "${deleteTarget.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
