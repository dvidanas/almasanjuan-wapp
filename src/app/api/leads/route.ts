import { NextResponse } from "next/server";
import { listLeads } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const leads = listLeads();
  return NextResponse.json(leads);
}
