export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.company.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(items, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Read companies failed", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const kind =
      body.kind === "IP" || body.kind === "COMPANY"
        ? body.kind
        : "COMPANY";

    const name = String(body.name || "").trim();
    const shortName = String(body.shortName || "").trim() || null;
    const inn = String(body.inn || "").trim() || null;
    const kpp =
      kind === "COMPANY" ? String(body.kpp || "").trim() || null : null;
    const ogrn = String(body.ogrn || "").trim() || null;
    const address = String(body.address || "").trim() || null;
    const postalAddress = String(body.postalAddress || "").trim() || null;
    const email = String(body.email || "").trim() || null;
    const phone = String(body.phone || "").trim() || null;

    const bankName = String(body.bankName || "").trim() || null;
    const bankBik = String(body.bankBik || "").trim() || null;
    const bankAccount = String(body.bankAccount || "").trim() || null;
    const correspondentAccount =
      String(body.correspondentAccount || "").trim() || null;

    const directorName = String(body.directorName || "").trim() || null;
        const directorPosition =
      String(body.directorPosition || "").trim() || null;
      const directorPositionGenitive =
  String(body.directorPositionGenitive || "").trim() || null;
    const directorGender =
      body.directorGender === "MALE" || body.directorGender === "FEMALE"
        ? body.directorGender
        : null;
        const directorNameGenitive =
  String(body.directorNameGenitive || "").trim() || null;

    let basis = String(body.basis || "").trim() || null;

    if (kind === "IP" && !basis) {
      basis =
        "государственной регистрации в качестве индивидуального предпринимателя";
    }

    if (kind === "COMPANY" && !basis) {
      basis = "Устава";
    }

    if (!name) {
      return NextResponse.json(
        { error: kind === "IP" ? "Missing IP name" : "Missing company name" },
        { status: 400 }
      );
    }

    const created = await prisma.company.create({
      data: {
        kind,
        name,
        shortName,
        inn,
        kpp,
        ogrn,
        address,
        postalAddress,
        email,
        phone,
        bankName,
        bankBik,
        bankAccount,
        correspondentAccount,
        directorName,
        directorPosition,
        directorPositionGenitive,
        directorGender,
        directorNameGenitive,
        basis,
      },
    });

    return NextResponse.json(created, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Create company failed", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}