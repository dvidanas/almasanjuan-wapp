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

  const excludeIdStr = searchParams.get("excludeAppointmentId");
  const excludeId = excludeIdStr ? Number(excludeIdStr) : undefined;

  const slots = getAvailableSlots(date, duration, excludeId && !isNaN(excludeId) ? excludeId : undefined);
  return NextResponse.json({ date, duration, slots });
}
