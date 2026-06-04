"use client";

interface Props {
  conversationId: number;
  mode: "AI" | "HUMAN";
  onChange: (mode: "AI" | "HUMAN") => void;
}

export function ModeToggle({ conversationId, mode, onChange }: Props) {
  async function toggle() {
    const next = mode === "AI" ? "HUMAN" : "AI";
    const res = await fetch(`/api/mode/${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: next }),
    });
    if (res.ok) onChange(next);
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 active:scale-95 cursor-pointer ${
        mode === "AI"
          ? "bg-[var(--color-wa-green)] text-[var(--color-wa-green-text)] border-[var(--color-wa-green)] hover:bg-[var(--color-wa-green-dark)]"
          : "bg-[var(--color-status-follow-bg)] text-[var(--color-status-follow-text)] border-[var(--color-status-follow-border)] hover:bg-[var(--color-wa-hover)]"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          mode === "AI" ? "bg-[var(--color-wa-green-text)]" : "bg-[var(--color-status-follow-text)]"
        }`}
      />
      {mode === "AI" ? "IA Activa" : "Mano Humana"}
    </button>
  );
}
