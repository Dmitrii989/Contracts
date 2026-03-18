import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseISODate(s: unknown): Date | null {
  if (!s || typeof s !== "string") return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseGender(v: unknown): "MALE" | "FEMALE" | null {
  if (v === "MALE" || v === "FEMALE") return v;
  return null;
}

export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
) {
  try {
    const params = await Promise.resolve(ctx.params);
    const id = String(params?.id ?? "").trim();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const item = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json(item, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Read tenant failed", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: { id: string } }
) {
  try {
    const params = await Promise.resolve(ctx.params);
    const id = String(params?.id ?? "").trim();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));

    const fio =
      typeof body?.fio === "string" ? body.fio.trim() : "";

    if (!fio) {
      return NextResponse.json({ error: "Missing fio" }, { status: 400 });
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        fio,
        gender: parseGender(body?.gender),
        birthDate: parseISODate(body?.birthDate),
        passportSeries:
          typeof body?.passportSeries === "string"
            ? body.passportSeries.trim() || null
            : null,
        passportNumber:
          typeof body?.passportNumber === "string"
            ? body.passportNumber.trim() || null
            : null,
        passportIssuedBy:
          typeof body?.passportIssuedBy === "string"
            ? body.passportIssuedBy.trim() || null
            : null,
        passportCode:
          typeof body?.passportCode === "string"
            ? body.passportCode.trim() || null
            : null,
        passportIssuedAt: parseISODate(body?.passportIssuedAt),
        regAddress:
          typeof body?.regAddress === "string"
            ? body.regAddress.trim() || null
            : null,
      },
    });

    return NextResponse.json(updated, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Update tenant failed", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}