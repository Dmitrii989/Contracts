export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { buildDocxBuffer } from "@/lib/contractsDocx";
import { prisma } from "@/lib/prisma";

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
        ? "act_company_template.docx"
        : "act_person_template.docx";

    const { docx } = await buildDocxBuffer(id, template);

    const fileName = `Акт_${contract.number.replace("/", "-")}.docx`;

    return new NextResponse(docx, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          fileName
        )}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Act generation failed", details: String(e?.message ?? e) },
      { status: e?.status ?? 500 }
    );
  }
}