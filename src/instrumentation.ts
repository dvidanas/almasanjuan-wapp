export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startBackupScheduler } = await import("./lib/scheduler");
    const { startBaileys } = await import("./lib/baileys/client");

    startBackupScheduler();

    // Dar 2 segundos para que Next.js termine de inicializar antes de conectar Baileys
    setTimeout(() => {
      startBaileys().catch((err) =>
        console.error("[instrumentation] error al iniciar Baileys:", err)
      );
    }, 2000);
  }
}
