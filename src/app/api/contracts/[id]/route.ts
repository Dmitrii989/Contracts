export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const item = await prisma.contract.findUnique({
      where: { id },
      include: {
        tenant: true,
        property: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const result = {
      id: item.id,
      number: item.number,
      type: item.type,

      propertyCode: item.propertyCode,
      propertyAddress: item.property?.address ?? null,

      checkIn: item.checkIn,
      checkOut: item.checkOut,

      pricePerDayRub: (item as any).pricePerDayRub ?? null,
      priceRub: item.priceRub,

      tenantId: item.tenantId ?? null,
      tenantFio: item.tenant?.fio ?? item.tenantName ?? null,
      tenantPassport:
        item.tenant
          ? [item.tenant.passportSeries, item.tenant.passportNumber].filter(Boolean).join(" ") || null
          : item.tenantPassport ?? null,
      tenantBirthDate: item.tenant?.birthDate ?? null,
      tenantPassportIssuedBy: item.tenant?.passportIssuedBy ?? null,
      tenantPassportCode: item.tenant?.passportCode ?? null,
      tenantPassportIssuedAt: item.tenant?.passportIssuedAt ?? null,
      tenantAddress: item.tenant?.regAddress ?? item.tenantAddress ?? null,

      createdAt: item.createdAt,
    };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Read contract failed", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}