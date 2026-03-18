export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { buildDocxBuffer } from "@/lib/contractsDocx";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(ctx.params);

    const contract = await prisma.contract.findUnique({
      where: { id },
      select: { type: true, number: true },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const template =
      contract.type === "COMPANY"
        ? "invoice_company_template.docx"
        : "invoice_person_template.docx";

    const { docx } = await buildDocxBuffer(id, template);

    return new NextResponse(docx, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="invoice_${contract.number.replace("/", "-")}.docx"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Invoice generation failed", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}