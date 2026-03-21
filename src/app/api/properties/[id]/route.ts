import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;

  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    return NextResponse.json({ error: "Объект не найден." }, { status: 404 });
  }

  return NextResponse.json(property);
}

export async function PUT(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const data: any = {};

    if (body.code !== undefined) {
      const code = String(body.code).trim();
      if (!code) {
        return NextResponse.json(
          { error: "Поле code обязательно." },
          { status: 400 }
        );
      }
      data.code = code;
    }

    if (body.name !== undefined) {
      data.name = body.name ? String(body.name).trim() : null;
    }

    if (body.address !== undefined) {
      data.address = body.address ? String(body.address).trim() : null;
    }

    if (body.description !== undefined) {
      data.description = body.description
        ? String(body.description).trim()
        : null;
    }

    if (body.isActive !== undefined) {
      data.isActive = Boolean(body.isActive);
    }

    const updated = await prisma.property.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Не удалось сохранить объект.",
        details: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await prisma.property.update({
      where: { id },
      data: {
        isActive:
          body.isActive === undefined ? undefined : Boolean(body.isActive),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Не удалось обновить объект.",
        details: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}