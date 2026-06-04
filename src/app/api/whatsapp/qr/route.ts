import { NextResponse } from "next/server";
import { getBaileysStatus } from "@/lib/baileys/client";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET() {
  const { status, qr, phone } = getBaileysStatus();

  let qrDataUrl: string | null = null;
  if (qr) {
    try {
      qrDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
    } catch {
      // si falla la generación devolvemos el string raw
    }
  }

  return NextResponse.json(
    { status, qr: qrDataUrl ?? qr, phone },
    { headers: { "Cache-Control": "no-store" } }
  );
}
