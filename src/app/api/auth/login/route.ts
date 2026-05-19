import { NextResponse, type NextRequest } from "next/server";
import { createSessionCookie, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth";
import { clientConfig } from "@/lib/client.config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin } = body as { pin?: string };

    console.log("[login] PIN recibido:", JSON.stringify(pin));
    console.log("[login] PIN esperado:", JSON.stringify(clientConfig.dashboard.pinLogin));
    console.log("[login] Coinciden:", pin === clientConfig.dashboard.pinLogin);
    console.log("[login] AUTH_SECRET presente:", !!process.env.AUTH_SECRET);

    if (!pin || pin !== clientConfig.dashboard.pinLogin) {
      return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, createSessionCookie(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[login] error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
