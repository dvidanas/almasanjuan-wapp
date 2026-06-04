import { NextResponse } from "next/server";
import { getBaileysStatus } from "@/lib/baileys/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const required = ["GEMINI_API_KEY"];
  const missing = required.filter((k) => !process.env[k]);

  if (missing.length > 0) {
    return NextResponse.json(
      { status: "missing_config", missing },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const { status, qr, phone } = getBaileysStatus();

  if (status === "open") {
    return NextResponse.json(
      { status: "connected", phone },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  if (status === "qr_pending") {
    return NextResponse.json(
      { status: "qr_pending", qr },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    { status },
    { headers: { "Cache-Control": "no-store" } }
  );
}
