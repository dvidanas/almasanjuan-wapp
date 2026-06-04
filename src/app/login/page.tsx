"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const KEYS = ["1","2","3","4","5","6","7","8","9","←","0","✓"];
const PIN_LENGTH = 4;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(value: string) {
    setLoading(true);
    setError(false);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: value }),
    });
    if (res.ok) {
      router.push(params.get("from") ?? "/");
    } else {
      setError(true);
      setLoading(false);
      setTimeout(() => {
        setPin("");
        setError(false);
      }, 600);
    }
  }

  function handleKey(key: string) {
    if (loading) return;
    if (key === "←") {
      setPin((p) => p.slice(0, -1));
      setError(false);
      return;
    }
    if (key === "✓") {
      if (pin.length === PIN_LENGTH) submit(pin);
      return;
    }
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + key;
    setPin(next);
    if (next.length === PIN_LENGTH) submit(next);
  }

  const canSubmit = pin.length === PIN_LENGTH && !loading;

  return (
    <div style={{
      minHeight: "100dvh",
      background: "radial-gradient(circle at 50% 0%, var(--bg-panel-l) 0%, var(--bg-main) 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "2.5rem",
      padding: "1.5rem",
      fontFamily: "var(--font-sans), system-ui, -apple-system, sans-serif",
      color: "var(--text-main)",
      position: "relative"
    }}>

      {/* Brand */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <svg width="220" height="80" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "0.5rem" }}>
          {/* ALMA (Charcoal Slate / var(--text-main)) */}
          <text x="25" y="44" fontFamily="Georgia, serif" fontSize="28" fontWeight="normal" fill="var(--text-main)" letterSpacing="0.05em">ALMa</text>
          
          {/* The V with Hair Strand */}
          <path d="M102 24 C104 36, 107 50, 111 50 C116 50, 122 33, 127 16" stroke="var(--wa-green)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Hair strand: coming out from the top-right of the V, loops elegantly */}
          <path d="M127 16 C129 6, 134 0, 137 5 C140 9, 136 19, 129 25" stroke="var(--text-main)" strokeWidth="1.25" strokeLinecap="round" />
          
          {/* San Juan (Plum / var(--wa-green)) */}
          <text x="138" y="44" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="500" fill="var(--wa-green)" letterSpacing="0.02em">San Juan</text>
          
          {/* DEPILACIÓN DEFINITIVA LÁSER */}
          <text x="110" y="66" textAnchor="middle" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="7" fontWeight="600" fill="var(--text-sec)" letterSpacing="0.28em">DEPILACIÓN DEFINITIVA LÁSER</text>
        </svg>
        <p style={{
          color: "var(--text-sec)",
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          margin: 0,
          fontWeight: 600
        }}>
          Ingresá tu código
        </p>
      </div>

      {/* PIN bubbles (Elasticized) */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", height: "3rem" }}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => {
          const isActive = pin.length > i;
          return (
            <div
              key={i}
              style={{
                width: isActive ? "3rem" : "1.25rem",
                height: "1.25rem",
                borderRadius: "1rem",
                border: `1.5px solid ${error ? "#ef4444" : isActive ? "var(--wa-green)" : "var(--color-sep)"}`,
                background: error ? "#ef4444" : isActive ? "var(--wa-green)" : "transparent",
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: isActive && !error ? "0 4px 12px rgba(168,133,68,0.15)" : "none",
              }}
            />
          );
        })}
      </div>

      {/* Keypad */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "0.75rem",
        width: "16rem",
      }}>
        {KEYS.map((key) => {
          const isConfirm = key === "✓";
          const isBack = key === "←";
          const isNumber = !isConfirm && !isBack;

          return (
            <button
              key={key}
              onClick={() => handleKey(key)}
              disabled={loading || (isConfirm && !canSubmit)}
              style={{
                height: "4rem",
                borderRadius: "1.25rem",
                fontSize: isNumber ? "1.5rem" : "1.25rem",
                fontWeight: isNumber ? 500 : 400,
                cursor: loading ? "default" : "pointer",
                transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                border: "1px solid var(--color-sep)",
                background: isConfirm
                  ? canSubmit ? "var(--wa-green)" : "var(--bg-hover)"
                  : "var(--bg-input)",
                color: isConfirm
                  ? canSubmit ? "var(--wa-green-text)" : "var(--text-sec)"
                  : "var(--text-main)",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                boxShadow: isNumber ? "var(--shadow-card)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {key === "✓" && loading ? (
                <span style={{
                  display: "inline-block",
                  width: "1.25rem",
                  height: "1.25rem",
                  border: "2px solid rgba(255,255,255,0.1)",
                  borderTop: `2px solid ${canSubmit ? "var(--wa-green-text)" : "var(--text-main)"}`,
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
              ) : key}
            </button>
          );
        })}
      </div>

      {error && (
        <p style={{ 
          color: "#ef4444", 
          fontSize: "0.85rem", 
          letterSpacing: "0.05em", 
          position: "absolute", 
          bottom: "5rem",
          animation: "shake 0.4s ease-in-out" 
        }}>
          PIN incorrecto
        </p>
      )}

      <p style={{ fontSize: "11px", color: "var(--text-sec)", opacity: 0.6, position: "absolute", bottom: "1.5rem", letterSpacing: "0.05em" }}>
        DESARROLLADO POR{" "}
        <a href="https://www.feer.com.ar" target="_blank" rel="noopener noreferrer"
          style={{ color: "var(--wa-green)", textDecoration: "none", fontWeight: 600 }}>
          FEER
        </a>
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        button:not(:disabled):active { 
          transform: scale(0.95);
          background: var(--bg-hover) !important;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#f0f0f3" }} />}>
      <LoginForm />
    </Suspense>
  );
}
