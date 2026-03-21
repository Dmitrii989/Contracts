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

    const propertyId = String(body.propertyId || "").trim();

    const checkIn = new Date(String(body.checkIn) + "T00:00:00");
    const checkOut = new Date(String(body.checkOut) + "T00:00:00");
    const contractDate = body.contractDate
      ? new Date(String(body.contractDate) + "T00:00:00")
      : null;
    const actDate = body.actDate
      ? new Date(String(body.actDate) + "T00:00:00")
      : null;
    const invoiceDate = body.invoiceDate
      ? new Date(String(body.invoiceDate) + "T00:00:00")
      : null;

    const pricePerDayRub = Number(body.pricePerDayRub || 0);
    let priceRub = Number(body.priceRub || 0);

    const tenantId =
      type === "PERSON" && body.tenantId ? String(body.tenantId).trim() : null;

    const companyId =
      type === "COMPANY" && body.companyId ? String(body.companyId).trim() : null;

    if (!propertyId || !isValidDate(checkIn) || !isValidDate(checkOut)) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    if (contractDate && !isValidDate(contractDate)) {
      return NextResponse.json({ error: "Bad contractDate" }, { status: 400 });
    }

    if (actDate && !isValidDate(actDate)) {
      return NextResponse.json({ error: "Bad actDate" }, { status: 400 });
    }

    if (invoiceDate && !isValidDate(invoiceDate)) {
      return NextResponse.json({ error: "Bad invoiceDate" }, { status: 400 });
    }

    const days = daysBetween(checkIn, checkOut);

    if (days <= 0) {
      return NextResponse.json(
        { error: "checkOut must be later than checkIn" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(priceRub) || priceRub <= 0) {
      if (Number.isFinite(pricePerDayRub) && pricePerDayRub > 0) {
        priceRub = pricePerDayRub * days;
      }
    }

    if (!Number.isFinite(priceRub) || priceRub <= 0) {
      return NextResponse.json({ error: "Missing priceRub" }, { status: 400 });
    }

    // PERSON: снимок арендатора
    let tenantName: string | null = null;
    let tenantPassport: string | null = null;
    let tenantAddress: string | null = null;

    if (type === "PERSON") {
      tenantName = body.tenantName ?? null;
      tenantPassport = body.tenantPassport ?? null;
      tenantAddress = body.tenantAddress ?? null;

      if (!tenantId) {
        return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
      }

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

    // COMPANY / IP: снимок контрагента
    let company: Awaited<ReturnType<typeof prisma.company.findUnique>> = null;

    let companyKind =
      type === "COMPANY" && (body.companyKind === "COMPANY" || body.companyKind === "IP")
        ? body.companyKind
        : null;

    let companyName =
      type === "COMPANY" ? String(body.companyName || "").trim() : null;
    let companyShortName =
      type === "COMPANY" ? String(body.companyShortName || "").trim() || null : null;
    let companyInn =
      type === "COMPANY" ? String(body.companyInn || "").trim() || null : null;
    let companyKpp =
      type === "COMPANY" ? String(body.companyKpp || "").trim() || null : null;
    let companyOgrn =
      type === "COMPANY" ? String(body.companyOgrn || "").trim() || null : null;
    let companyAddress =
      type === "COMPANY" ? String(body.companyAddress || "").trim() || null : null;
    let companyPostalAddress =
      type === "COMPANY" ? String(body.companyPostalAddress || "").trim() || null : null;
    let companyEmail =
      type === "COMPANY" ? String(body.companyEmail || "").trim() || null : null;
    let companyPhone =
      type === "COMPANY" ? String(body.companyPhone || "").trim() || null : null;
    let companyBankName =
      type === "COMPANY" ? String(body.companyBankName || "").trim() || null : null;
    let companyBankBik =
      type === "COMPANY" ? String(body.companyBankBik || "").trim() || null : null;
    let companyBankAccount =
      type === "COMPANY" ? String(body.companyBankAccount || "").trim() || null : null;
    let companyCorrespondentAccount =
      type === "COMPANY"
        ? String(body.companyCorrespondentAccount || "").trim() || null
        : null;
    let companyDirectorName =
      type === "COMPANY" ? String(body.companyDirectorName || "").trim() || null : null;
    let companyDirectorPosition =
      type === "COMPANY"
        ? String(body.companyDirectorPosition || "").trim() || null
        : null;
        let companyDirectorPositionGenitive =
  type === "COMPANY"
    ? String(body.companyDirectorPositionGenitive || "").trim() || null
    : null;
    let companyGuestText =
  type === "COMPANY" ? String(body.companyGuestText || "").trim() || null : null;
    let companyDirectorGender =
      type === "COMPANY" &&
      (body.companyDirectorGender === "MALE" || body.companyDirectorGender === "FEMALE")
        ? body.companyDirectorGender
        : null;
        let companyDirectorNameGenitive =
  type === "COMPANY"
    ? String(body.companyDirectorNameGenitive || "").trim() || null
    : null;
    let companyBasis =
      type === "COMPANY" ? String(body.companyBasis || "").trim() || null : null;

    if (type === "COMPANY" && companyId) {
      company = await prisma.company.findUnique({
        where: { id: companyId },
      });
      if (type === "COMPANY" && !companyId) {
        return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
      }
      if (!company) {
        return NextResponse.json({ error: "Company not found" }, { status: 400 });
      }

      companyKind = company.kind ?? companyKind;

      companyName = companyName || company.name;
      companyShortName = companyShortName || company.shortName ?? null;
      companyInn = companyInn || company.inn ?? null;
      companyKpp = companyKpp || company.kpp ?? null;
      companyOgrn = companyOgrn || company.ogrn ?? null;
      companyAddress = companyAddress || company.address ?? null;
      companyPostalAddress = companyPostalAddress || company.postalAddress ?? null;
      companyEmail = companyEmail || company.email ?? null;
      companyPhone = companyPhone || company.phone ?? null;
      companyBankName = companyBankName || company.bankName ?? null;
      companyBankBik = companyBankBik || company.bankBik ?? null;
      companyBankAccount = companyBankAccount || company.bankAccount ?? null;
      companyCorrespondentAccount =
      companyCorrespondentAccount || company.correspondentAccount ?? null;

      companyDirectorName = companyDirectorName || company.directorName ?? null;
      companyDirectorPosition =
      companyDirectorPosition || company.directorPosition ?? null;
      companyDirectorPositionGenitive =
      companyDirectorPositionGenitive || company.directorPositionGenitive ?? null;
      companyDirectorGender =
      companyDirectorGender || company.directorGender ?? null;
      companyDirectorNameGenitive =
      companyDirectorNameGenitive || company.directorNameGenitive ?? null;
      companyBasis = companyBasis || company.basis ?? null;
    }

    if (type === "COMPANY") {
      if (!companyName) {
        return NextResponse.json({ error: "Missing companyName" }, { status: 400 });
      }

      if (!companyDirectorName) {
        return NextResponse.json(
          { error: "Missing companyDirectorName" },
          { status: 400 }
        );
      }

      if (companyKind === "IP") {
        companyKpp = null;
      }
    }
    const property = await prisma.property.findUnique({
  where: { id: propertyId },
});

if (!property) {
  return NextResponse.json({ error: "Property not found" }, { status: 400 });
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
          propertyId: property.id,
          propertyCode: property.code,
          propertyName: property.name ?? null,
          propertyAddress: property.address ?? null,
          checkIn,
          checkOut,
          contractDate,
          actDate,
          invoiceDate,

          pricePerDayRub: Number.isFinite(pricePerDayRub) ? Math.round(pricePerDayRub) : 0,
          priceRub: Math.round(priceRub),

          tenantId,
          tenantName,
          tenantPassport,
          tenantAddress,

          companyId,
          companyKind,
          companyName,
          companyShortName,
          companyInn,
          companyKpp,
          companyOgrn,
          companyAddress,
          companyPostalAddress,
          companyEmail,
          companyPhone,
          companyBankName,
          companyBankBik,
          companyBankAccount,
          companyCorrespondentAccount,
          companyDirectorName,
          companyDirectorPosition,
          companyDirectorPositionGenitive,
          companyDirectorGender,
          companyDirectorNameGenitive,
          companyBasis,
          companyGuestText,
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