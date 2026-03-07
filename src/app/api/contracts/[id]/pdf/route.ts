export const runtime = "nodejs";

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import os from "os";
import { promisify } from "util";
import { execFile } from "child_process";

import { buildDocxBuffer } from "@/lib/contractsDocx";

const execFileAsync = promisify(execFile);

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  let tmpDir = "";
  try {
    const params = await Promise.resolve(ctx.params);
    const id = String(params?.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // 1) генерим DOCX ровно так же, как /docx
    const { docx, filenameBase } = await buildDocxBuffer(id);

    // 2) временная папка
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "contracts-"));
    const docxPath = path.join(tmpDir, `${filenameBase}.docx`);
    fs.writeFileSync(docxPath, docx);

    // 3) конвертация LibreOffice
    const soffice =
      process.env.LIBREOFFICE_PATH ||
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe";

    await execFileAsync(soffice, [
      "--headless",
      "--nologo",
      "--nolockcheck",
      "--nodefault",
      "--norestore",
      "--convert-to",
      "pdf",
      "--outdir",
      tmpDir,
      docxPath,
    ]);

    const pdfPath = path.join(tmpDir, `${filenameBase}.pdf`);
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { error: "PDF not generated", pdfPath, soffice },
        { status: 500 }
      );
    }

    const pdf = fs.readFileSync(pdfPath);

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          `${filenameBase}.pdf`
        )}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("PDF failed:", e);
    return NextResponse.json(
      { error: "PDF failed", details: e?.message ?? String(e) },
      { status: e?.status ?? 500 }
    );
  } finally {
    if (tmpDir) {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  }
}