import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      orderBy: [{ isActive: "desc" }, { code: "asc" }],
    });

    return NextResponse.json(properties);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Не удалось получить список объектов.",
        details: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const code = String(body.code ?? "")
      .trim()
      .toUpperCase();
    const name = body.name ? String(body.name).trim() : null;
    const address = body.address ? String(body.address).trim() : null;
    const description = body.description ? String(body.description).trim() : null;
    const isActive = body.isActive === undefined ? true : Boolean(body.isActive);

    if (!code) {
      return NextResponse.json(
        { error: "Поле code обязательно." },
        { status: 400 }
      );
    }

    const existing = await prisma.property.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Объект с таким кодом уже существует." },
        { status: 400 }
      );
    }

    const created = await prisma.property.create({
      data: {
        code,
        name,
        address,
        description,
        isActive,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Не удалось создать объект.",
        details: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}