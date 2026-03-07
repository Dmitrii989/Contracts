export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function isValidDate(d: Date) {
  return !Number.isNaN(d.getTime());
}

function daysBetween(checkIn: Date, checkOut: Date) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const type = body.type as "PERSON" | "COMPANY";
    if (type !== "PERSON" && type !== "COMPANY") {
  return NextResponse.json({ error: "Bad type" }, { status: 400 });
}
    const propertyCode = String(body.propertyCode || "").trim();

    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);

    const pricePerDayRub = Number(body.pricePerDayRub || 0);
    let priceRub = Number(body.priceRub || 0);

    const tenantId = body.tenantId ? String(body.tenantId).trim() : null;

    if (!type || !propertyCode || !isValidDate(checkIn) || !isValidDate(checkOut)) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const days = daysBetween(checkIn, checkOut);

    if (days <= 0) {
      return NextResponse.json(
        { error: "checkOut must be later than checkIn" },
        { status: 400 }
      );
    }

    // Надёжно: если итоговая сумма не пришла, считаем её сами
    if (!Number.isFinite(priceRub) || priceRub <= 0) {
      if (Number.isFinite(pricePerDayRub) && pricePerDayRub > 0) {
        priceRub = pricePerDayRub * days;
      }
    }

    if (!Number.isFinite(priceRub) || priceRub <= 0) {
      return NextResponse.json({ error: "Missing priceRub" }, { status: 400 });
    }

    // Снимок арендатора в Contract + связь по tenantId
    let tenantName: string | null = body.tenantName ?? null;
    let tenantPassport: string | null = body.tenantPassport ?? null;
    let tenantAddress: string | null = body.tenantAddress ?? null;

    if (tenantId) {
      const t = await prisma.tenant.findUnique({ where: { id: tenantId } });
      if (!t) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 400 });
      }

      const passport = [t.passportSeries, t.passportNumber]
        .filter(Boolean)
        .join(" ")
        .trim();

      tenantName = t.fio || tenantName;
      tenantPassport = passport || tenantPassport;
      tenantAddress = t.regAddress || tenantAddress;
    }

    const year = checkIn.getFullYear();

    const created = await prisma.$transaction(async (tx) => {
      const counter = await tx.contractCounter.upsert({
        where: { year },
        update: { last: { increment: 1 } },
        create: { year, last: 1 },
      });

      const seq = counter.last;
      const number = `${seq}/${year}`;

      const contract = await tx.contract.create({
        data: {
          number,
          year,
          seq,
          type,
          propertyCode,
          checkIn,
          checkOut,

          pricePerDayRub: Number.isFinite(pricePerDayRub) ? Math.round(pricePerDayRub) : 0,
          priceRub,

          tenantId,
          tenantName,
          tenantPassport,
          tenantAddress,
        },
      });

      return contract;
    });

    return NextResponse.json(created, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Create failed", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}