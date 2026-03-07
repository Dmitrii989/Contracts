import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseISODate(s: unknown): Date | null {
  if (!s || typeof s !== "string") return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params?.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));

  const updated = await prisma.tenant.update({
    where: { id },
    data: {
      fio: typeof body?.fio === "string" ? body.fio : undefined,
      birthDate: body?.birthDate === "" ? null : parseISODate(body?.birthDate),
      passportSeries: body?.passportSeries === "" ? null : typeof body?.passportSeries === "string" ? body.passportSeries : undefined,
      passportNumber: body?.passportNumber === "" ? null : typeof body?.passportNumber === "string" ? body.passportNumber : undefined,
      passportIssuedBy: body?.passportIssuedBy === "" ? null : typeof body?.passportIssuedBy === "string" ? body.passportIssuedBy : undefined,
      passportCode: body?.passportCode === "" ? null : typeof body?.passportCode === "string" ? body.passportCode : undefined,
      passportIssuedAt: body?.passportIssuedAt === "" ? null : parseISODate(body?.passportIssuedAt),
      regAddress: body?.regAddress === "" ? null : typeof body?.regAddress === "string" ? body.regAddress : undefined,
      signInitials: body?.signInitials === "" ? null : typeof body?.signInitials === "string" ? body.signInitials : undefined,
      signSurname: body?.signSurname === "" ? null : typeof body?.signSurname === "string" ? body.signSurname : undefined,
    },
  });

  return NextResponse.json(updated);
}