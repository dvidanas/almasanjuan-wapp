import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, todayAR } from "@/lib/db";
import { clientConfig } from "@/lib/client.config";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const date = searchParams.get("date") ?? todayAR();
  const apptConfig = (clientConfig as Record<string, unknown>).appointments as
    | { defaultDuration: number }
    | undefined;
  const duration = Number(searchParams.get("duration") ?? apptConfig?.defaultDuration ?? 30);

  const slots = getAvailableSlots(date, duration);
  return NextResponse.json({ date, duration, slots });
}
