"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clientConfig } from "@/lib/client.config";

const PIN_LENGTH = 4;

function PinBubble({ filled, shake }: { filled: boolean; shake: boolean }) {
  return (
    <div
      className={`transition-all duration-200 ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: `2.5px solid ${filled ? "var(--color-wa-green)" : "var(--color-wa-sep)"}`,
        background: filled ? "var(--color-wa-green)" : "transparent",
        transition: "background 0.15s, border-color 0.15s, transform 0.15s",
        transform: filled ? "scale(1.08)" : "scale(1)",
      }}
    />
  );
}

function PinKey({ label, onClick }: { label: string; onClick: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onClick(); }}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        fontSize: 24,
        fontWeight: 600,
        color: "var(--color-wa-text-main)",
        background: pressed ? "var(--color-wa-sep)" : "var(--color-wa-input)",
        border: "1.5px solid var(--color-wa-sep)",
        cursor: "pointer",
        userSelect: "none",
        transition: "background 0.1s",
        touchAction: "manipulation",
      }}
    >
      {label}
    </button>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [checking, setChecking] = useState(false);

  async function validatePin(value: string) {
    if (checking) return;
    setChecking(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: value }),
    });
    if (res.ok) {
      setFadeOut(true);
      setTimeout(() => router.push(params.get("from") ?? "/"), 350);
    } else {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin("");
        setChecking(false);
      }, 450);
    }
  }

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      validatePin(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  function pressKey(digit: string) {
    if (pin.length < PIN_LENGTH && !checking) {
      setPin((p) => p + digit);
    }
  }

  function pressDelete() {
    if (!checking) setPin((p) => p.slice(0, -1));
  }

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["del", "0", ""],
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "var(--color-wa-bg-main)",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.35s",
      }}
    >
      <div className="flex flex-col items-center gap-8" style={{ maxWidth: 340, width: "100%" }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: 4 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--color-wa-green)",
              marginBottom: 14,
            }}
          >
            <span style={{ color: "var(--color-wa-green-text)", fontWeight: 700, fontSize: 22 }}>A</span>
          </div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "var(--color-wa-text-main)",
              margin: 0,
            }}
          >
            {clientConfig.dashboard.title}
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-wa-text-sec)", marginTop: 4 }}>
            Ingresá tu PIN
          </p>
        </div>

        {/* Burbujas */}
        <div style={{ display: "flex", gap: 16 }}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <PinBubble key={i} filled={i < pin.length} shake={shake} />
          ))}
        </div>

        {/* Teclado numérico */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {keys.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              {row.map((key, ki) => {
                if (key === "") return <div key={ki} style={{ width: 72, height: 72 }} />;
                if (key === "del")
                  return (
                    <button
                      key={ki}
                      type="button"
                      onClick={pressDelete}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        fontSize: 18,
                        color: "var(--color-wa-text-sec)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        touchAction: "manipulation",
                      }}
                    >
                      ⌫
                    </button>
                  );
                return <PinKey key={ki} label={key} onClick={() => pressKey(key)} />;
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ fontSize: 10, color: "var(--color-wa-text-sec)", opacity: 0.4, marginTop: 8 }}>
          {clientConfig.dashboard.footerText}
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--color-wa-bg-main)" }} />}>
      <LoginForm />
    </Suspense>
  );
}
