export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { buildDocxBuffer } from "@/lib/contractsDocx";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await Promise.resolve(ctx.params);
    const id = String(params?.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { docx, filenameBase } = await buildDocxBuffer(id);

    return new NextResponse(docx, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          `${filenameBase}.docx`
        )}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    // docxtemplater MultiError (если будет)
    const details =
      e?.properties?.errors?.map((er: any) => ({
        message: er.properties?.explanation || er.message,
        tag: er.properties?.id || er.properties?.xtag,
        context: er.properties?.context,
      })) ?? e?.message;

    console.error("DOCX failed:", e);
    console.error("DOCX details:", details);

    return NextResponse.json(
      { error: "DOCX failed", details },
      { status: e?.status ?? 500 }
    );
  }
}