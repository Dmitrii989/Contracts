export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        company: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const result = {
      id: item.id,
      number: item.number,
      type: item.type,

      propertyId: item.propertyId ?? null,
      propertyCode: item.propertyCode,
      propertyName: item.propertyName ?? item.property?.name ?? null,
      propertyAddress: item.propertyAddress ?? item.property?.address ?? null,

      checkIn: item.checkIn,
      checkOut: item.checkOut,
      contractDate: item.contractDate,
      actDate: item.actDate,
      invoiceDate: item.invoiceDate,

      pricePerDayRub: item.pricePerDayRub ?? null,
      priceRub: item.priceRub,

      tenantId: item.tenantId ?? null,
      tenantFio: item.tenant?.fio ?? item.tenantName ?? null,
      tenantPassport: item.tenant
        ? [item.tenant.passportSeries, item.tenant.passportNumber]
            .filter(Boolean)
            .join(" ") || null
        : item.tenantPassport ?? null,
      tenantBirthDate: item.tenant?.birthDate ?? null,
      tenantPassportIssuedBy: item.tenant?.passportIssuedBy ?? null,
      tenantPassportCode: item.tenant?.passportCode ?? null,
      tenantPassportIssuedAt: item.tenant?.passportIssuedAt ?? null,
      tenantAddress: item.tenant?.regAddress ?? item.tenantAddress ?? null,

      companyId: item.companyId ?? null,
      companyKind: item.companyKind ?? item.company?.kind ?? null,
      companyName: item.companyName ?? item.company?.name ?? null,
      companyShortName: item.companyShortName ?? item.company?.shortName ?? null,
      companyInn: item.companyInn ?? item.company?.inn ?? null,
      companyKpp: item.companyKpp ?? item.company?.kpp ?? null,
      companyOgrn: item.companyOgrn ?? item.company?.ogrn ?? null,
      companyAddress: item.companyAddress ?? item.company?.address ?? null,
      companyPostalAddress:
        item.companyPostalAddress ?? item.company?.postalAddress ?? null,
      companyEmail: item.companyEmail ?? item.company?.email ?? null,
      companyPhone: item.companyPhone ?? item.company?.phone ?? null,
      companyBankName: item.companyBankName ?? item.company?.bankName ?? null,
      companyBankBik: item.companyBankBik ?? item.company?.bankBik ?? null,
      companyBankAccount:
        item.companyBankAccount ?? item.company?.bankAccount ?? null,
      companyCorrespondentAccount:
        item.companyCorrespondentAccount ??
        item.company?.correspondentAccount ??
        null,
      companyDirectorName:
        item.companyDirectorName ?? item.company?.directorName ?? null,
      companyDirectorPosition:
        item.companyDirectorPosition ?? item.company?.directorPosition ?? null,
      companyDirectorPositionGenitive:
        item.companyDirectorPositionGenitive ??
        item.company?.directorPositionGenitive ??
        null,
      companyDirectorGender:
        item.companyDirectorGender ?? item.company?.directorGender ?? null,
      companyDirectorNameGenitive:
        item.companyDirectorNameGenitive ??
        item.company?.directorNameGenitive ??
        null,
      companyBasis: item.companyBasis ?? item.company?.basis ?? null,
      companyGuestText: item.companyGuestText ?? null,

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

export async function PUT(
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

    const existing = await prisma.contract.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

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

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 400 });
    }

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

    let companyKind =
      type === "COMPANY" &&
      (body.companyKind === "COMPANY" || body.companyKind === "IP")
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
      type === "COMPANY"
        ? String(body.companyPostalAddress || "").trim() || null
        : null;
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
      type === "COMPANY"
        ? String(body.companyDirectorName || "").trim() || null
        : null;
    let companyDirectorPosition =
      type === "COMPANY"
        ? String(body.companyDirectorPosition || "").trim() || null
        : null;
    let companyDirectorPositionGenitive =
      type === "COMPANY"
        ? String(body.companyDirectorPositionGenitive || "").trim() || null
        : null;
    let companyGuestText =
      type === "COMPANY"
        ? String(body.companyGuestText || "").trim() || null
        : null;
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
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

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
      if (type === "COMPANY" && !companyId) {
        return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
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

    const updated = await prisma.contract.update({
      where: { id },
      data: {
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

        pricePerDayRub: Number.isFinite(pricePerDayRub)
          ? Math.round(pricePerDayRub)
          : 0,
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

    return NextResponse.json(updated, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Update failed", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}