import { NextResponse } from "next/server";
import { listServicios, createServicio } from "@/lib/db";

export const dynamic = "force-dynamic";

const CATEGORIAS = ["mujer", "hombre", "unisex"];

export async function GET() {
  try {
    return NextResponse.json(listServicios(true));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.nombre?.trim()) return NextResponse.json({ error: "nombre required" }, { status: 400 });
  if (!CATEGORIAS.includes(body.categoria)) return NextResponse.json({ error: "categoria inválida" }, { status: 400 });
  if (!Number.isFinite(Number(body.precio))) return NextResponse.json({ error: "precio inválido" }, { status: 400 });
  const id = createServicio({
    categoria: body.categoria,
    nombre: body.nombre.trim(),
    precio: Number(body.precio),
    duracion_min: Number(body.duracion_min) || 30,
    es_promo: body.es_promo !== undefined ? Number(body.es_promo) : 1,
    destacado: body.destacado ? 1 : 0,
    orden: Number(body.orden) || 0,
    activo: 1,
  });
  return NextResponse.json({ id });
}
