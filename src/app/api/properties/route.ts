export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const properties = await prisma.property.findMany({
    orderBy: { code: "asc" },
    select: {
      id: true,
      code: true,
      address: true,
    },
  });

  return NextResponse.json(properties);
}