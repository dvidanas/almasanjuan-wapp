import { NextResponse } from "next/server";
import { updateServicio, deleteServicio, setServicioDestacado } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const servicioId = Number(id);
  const body = await req.json();

  updateServicio(servicioId, {
    ...(body.categoria !== undefined && { categoria: body.categoria }),
    ...(body.nombre !== undefined && { nombre: body.nombre.trim() }),
    ...(body.precio !== undefined && { precio: Number(body.precio) }),
    ...(body.duracion_min !== undefined && { duracion_min: Number(body.duracion_min) }),
    ...(body.es_promo !== undefined && { es_promo: Number(body.es_promo) }),
    ...(body.orden !== undefined && { orden: Number(body.orden) }),
    ...(body.activo !== undefined && { activo: Number(body.activo) }),
  });

  if (body.destacado !== undefined) {
    setServicioDestacado(servicioId, !!body.destacado);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteServicio(Number(id));
  return NextResponse.json({ ok: true });
}
