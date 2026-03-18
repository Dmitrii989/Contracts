export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.contract.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tenant: true,
      property: true,
      company: true,
    },
  });

  const result = items.map((c) => ({
    id: c.id,
    number: c.number,
    type: c.type,

    propertyCode: c.propertyCode,
    propertyAddress: c.property?.address ?? null,

    checkIn: c.checkIn,
    checkOut: c.checkOut,

    pricePerDayRub: c.pricePerDayRub ?? null,
    priceRub: c.priceRub,

    tenantId: c.tenantId ?? null,
    tenantFio: c.tenant?.fio ?? c.tenantName ?? null,

    companyName: c.companyName ?? c.company?.name ?? null,

    createdAt: c.createdAt,
  }));

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}