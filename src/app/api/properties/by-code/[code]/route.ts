export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, code: true, address: true },
  });

  return NextResponse.json(items);
}