interface Props {
  missing: string[];
  onContinue?: () => void;
}

const ENV_DESCRIPTIONS: Record<string, string> = {
  YCLOUD_API_KEY: "API Key de YCloud",
  YCLOUD_PHONE_NUMBER: "Número de WhatsApp en formato E.164 (ej: +5491155555555)",
  GEMINI_API_KEY: "API Key de Google Gemini (AI Studio)",
};

export function ConfigScreen({ missing, onContinue }: Props) {
  const allRequired = ["YCLOUD_API_KEY", "YCLOUD_PHONE_NUMBER", "GEMINI_API_KEY"];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full" style={{ maxWidth: 480 }}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-full bg-amber-100 flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600"
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
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug">
                  Configuración incompleta
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-snug mt-0.5">
                  Faltan variables de entorno para iniciar el sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6 sm:py-6 space-y-5">

            {/* Estado de variables */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2.5">
                Variables de entorno
              </h3>
              <ul className="space-y-2">
                {allRequired.map((key) => {
                  const ok = !missing.includes(key);
                  return (
                    <li
                      key={key}
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50"
                    >
                      <span className={`mt-0.5 flex-shrink-0 text-sm font-bold ${ok ? "text-emerald-500" : "text-red-500"}`}>
                        {ok ? "✓" : "✗"}
                      </span>
                      <div className="min-w-0">
                        <code className="text-xs sm:text-sm font-mono font-medium text-gray-800 break-all">
                          {key}
                        </code>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {ENV_DESCRIPTIONS[key]}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* URL Webhook */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                URL del Webhook
              </h3>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <code className="text-xs sm:text-sm text-gray-700 break-all leading-relaxed">
                  https://TU_DOMINIO/api/webhook
                </code>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Reemplazá TU_DOMINIO por el dominio asignado en EasyPanel.
              </p>
            </div>

            {/* Pasos */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2.5">
                Pasos para configurar
              </h3>
              <ol className="space-y-2">
                {[
                  "Crear cuenta en ycloud.com",
                  "Registrar número de WhatsApp Business.",
                  "Settings → API Keys → copiar YCLOUD_API_KEY.",
                  "Copiar número como YCLOUD_PHONE_NUMBER (E.164 con +).",
                  "YCloud → Webhooks → pegar la URL del webhook de arriba.",
                  "Suscribir al evento whatsapp.inbound_message.received.",
                  "Obtener GEMINI_API_KEY desde aistudio.google.com",
                  "Configurar las variables en EasyPanel → Environment → reiniciar.",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Botón continuar */}
          {onContinue && (
            <div className="px-4 pb-5 sm:px-6 sm:pb-6">
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  Podés usar el dashboard sin WhatsApp conectado. Los mensajes no se enviarán hasta completar la configuración.
                </p>
                <button
                  onClick={onContinue}
                  className="w-full mt-1 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 transition-colors"
                >
                  Continuar al dashboard →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
