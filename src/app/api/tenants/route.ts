import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseISODate(s: unknown): Date | null {
  if (!s || typeof s !== "string") return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET() {
  const items = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const fio =
      typeof body?.fio === "string" ? body.fio.trim() : "";

    if (!fio) {
      return NextResponse.json(
        { error: "Missing fio" },
        { status: 400 }
      );
    }

    const created = await prisma.tenant.create({
      data: {
        fio,
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

    return NextResponse.json(created, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Create tenant failed", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}