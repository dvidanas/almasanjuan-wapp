import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { createSessionCookie, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth";
import { clientConfig } from "@/lib/client.config";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pin } = body as { pin?: string };

  const validPin = clientConfig.dashboard.pinLogin;

  const pinBuf = Buffer.from(pin ?? "");
  const validBuf = Buffer.from(validPin);
  const match =
    pinBuf.length === validBuf.length && crypto.timingSafeEqual(pinBuf, validBuf);

  if (!match) {
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
}
