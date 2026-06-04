interface Props {
  missing: string[];
  onContinue?: () => void;
}

const ENV_DESCRIPTIONS: Record<string, string> = {
  GEMINI_API_KEY: "API Key de Google Gemini (AI Studio)",
};

export function ConfigScreen({ missing, onContinue }: Props) {
  const allRequired = ["GEMINI_API_KEY"];

  return (
    <div className="min-h-screen bg-[var(--color-wa-bg-main)] text-[var(--color-wa-text-main)] flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-[var(--color-wa-panel-l)] rounded-2xl shadow-md border border-[var(--color-wa-sep)] overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--color-status-follow-bg)] border-b border-[var(--color-status-follow-border)] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-status-follow-border)]/45 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[var(--color-status-follow-text)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-[var(--color-status-follow-text)]">
                  Configuración incompleta
                </h2>
                <p className="text-xs text-[var(--color-wa-text-sec)] mt-0.5">
                  Faltan variables de entorno para iniciar el sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Estado de variables */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-wa-text-main)] mb-3">
                Variables de entorno requeridas
              </h3>
              <ul className="space-y-2">
                {allRequired.map((key) => {
                  const ok = !missing.includes(key);
                  return (
                    <li
                      key={key}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-wa-bg-main)] border border-[var(--color-wa-sep)]/60"
                    >
                      <span
                        className={`mt-0.5 flex-shrink-0 text-sm font-bold ${
                          ok ? "text-[var(--color-status-closed-text)]" : "text-[var(--color-temp-hot-text)]"
                        }`}
                      >
                        {ok ? "✓" : "✗"}
                      </span>
                      <div>
                        <code className="text-sm font-mono font-medium text-[var(--color-wa-text-main)]">
                          {key}
                        </code>
                        <p className="text-xs text-[var(--color-wa-text-sec)] mt-0.5">
                          {ENV_DESCRIPTIONS[key] ?? key}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Pasos */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-wa-text-main)] mb-3">
                Pasos para configurar
              </h3>
              <ol className="space-y-2 text-sm text-[var(--color-wa-text-sec)]">
                {[
                  "Obtener GEMINI_API_KEY desde aistudio.google.com.",
                  "Configurar las variables en EasyPanel → Environment.",
                  "Reiniciar el servicio.",
                  "Al iniciar, el sistema mostrará un código QR para vincular WhatsApp.",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-wa-sep)] text-[var(--color-wa-text-sec)] text-xs flex items-center justify-center font-semibold">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Acción */}
            <div className="pt-4 border-t border-[var(--color-wa-sep)]">
              {onContinue ? (
                <button
                  onClick={onContinue}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[var(--color-wa-green)] text-[var(--color-wa-green-text)] text-sm font-semibold hover:bg-[var(--color-wa-green-dark)] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Continuar de todas formas
                </button>
              ) : (
                <a
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[var(--color-wa-green)] text-[var(--color-wa-green-text)] text-sm font-semibold hover:bg-[var(--color-wa-green-dark)] active:scale-[0.98] transition-all text-center"
                >
                  Ir al dashboard
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
