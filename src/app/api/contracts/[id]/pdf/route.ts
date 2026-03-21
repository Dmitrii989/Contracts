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

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { docx, filenameBase } = await buildDocxBuffer(id);

    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "contracts-"));

    const docxPath = path.join(tmpDir, `${filenameBase}.docx`);
    const pdfPath = path.join(tmpDir, `${filenameBase}.pdf`);

    fs.writeFileSync(docxPath, docx);

    const soffice =
      process.env.LIBREOFFICE_PATH ||
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe";

    const { stdout, stderr } = await execFileAsync(soffice, [
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

    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        {
          error: "PDF not generated",
          pdfPath,
          soffice,
          stdout,
          stderr,
        },
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

    const message =
      e?.code === "ENOENT"
        ? "LibreOffice not found. Check LIBREOFFICE_PATH."
        : e?.message ?? String(e);

    return NextResponse.json(
      { error: "PDF failed", details: message },
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