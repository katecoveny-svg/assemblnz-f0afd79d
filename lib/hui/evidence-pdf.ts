/**
 * Self-contained PDF renderer for a Hui evidence pack.
 *
 * Pure string/Buffer PDF writing — no jspdf, no native deps — so the evidence
 * pack download always works on any deployment. Adapted from the public-chat
 * evidence-pack fallback renderer (app/api/public-evidence-pack/route.ts) and
 * narrowed to the Hui workflow pack.
 */

import type { EvidencePack } from "@/lib/evidence/pack-spec";

function pdfSafeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

function escapePdfText(value: string) {
  return pdfSafeText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(value: string, maxLength = 92) {
  const words = pdfSafeText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function formatNzDate(iso: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Pacific/Auckland",
  }).format(new Date(iso));
}

function drawLine(text: string, x: number, y: number, size = 9.5, font = "F1") {
  return `BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET\n`;
}

export function renderHuiEvidencePdf(pack: EvidencePack): Buffer {
  const pages: string[][] = [[]];
  const push = (line = "") => {
    const current = pages[pages.length - 1];
    if (current.length >= 40) pages.push([]);
    pages[pages.length - 1].push(line);
  };

  push("assembl evidence pack");
  push("DRAFT — review before filing");
  push("");
  push(`Title: ${pack.title.en}`);
  push(`Subject: ${pack.subject.label}`);
  push(`Kete: ${pack.kete}`);
  push(`Generated: ${formatNzDate(pack.issuedAt)}`);
  push("");

  for (const section of pack.sections) {
    push(`${section.title.en.toUpperCase()}`);
    for (const block of section.body) {
      if (block.kind === "paragraph" || block.kind === "callout" || block.kind === "pullQuote") {
        for (const line of wrap(block.text)) push(line);
      } else if (block.kind === "list") {
        for (const item of block.items) {
          for (const [i, line] of wrap(item, 88).entries()) push(i === 0 ? `- ${line}` : `  ${line}`);
        }
      } else if (block.kind === "table") {
        push(block.columns.join(" | "));
        for (const row of block.rows) for (const line of wrap(row.join(" | "), 88)) push(line);
      } else if (block.kind === "signature") {
        push(`Signed by: ${block.signedBy}  (${block.signedAt})`);
      }
      push("");
    }
  }

  push("MANA RECEIPT — verification backbone");
  push("SHA-256 content hash:");
  for (const line of wrap(pack.hashChain.thisHash || "-", 64)) push(line);
  if (pack.hashChain.verifierUrl) push(`Verify: ${pack.hashChain.verifierUrl}`);

  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  add("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = add("PAGES_PLACEHOLDER");
  const fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const boldId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const monoId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");
  const pageIds: number[] = [];

  for (const [pageIndex, lines] of pages.entries()) {
    let y = 792;
    let content = "";
    content += "0.980 0.969 0.949 rg 0 0 595 842 re f\n"; // paper
    content += "0.169 0.420 0.341 rg 54 760 3 48 re f\n"; // pounamu spine
    content += drawLine(`page ${pageIndex + 1}`, 520, 30, 8, "F3");
    for (const [lineIndex, line] of lines.entries()) {
      const isTitle = pageIndex === 0 && lineIndex === 0;
      const isSub = pageIndex === 0 && lineIndex === 1;
      const isHeading = /^[A-Z][A-Z .—-]+$/.test(line) && line.length < 60;
      const font = isTitle || isSub || isHeading || line.endsWith(":") ? "F2" : "F1";
      const size = isTitle ? 20 : isSub ? 12 : 9.5;
      content += drawLine(line, 70, y, size, font);
      y -= isTitle ? 26 : isSub ? 20 : 14;
    }
    const contentId = add(`<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}endstream`);
    const pageId = add(
      [
        "<< /Type /Page",
        `/Parent ${pagesId} 0 R`,
        "/MediaBox [0 0 595 842]",
        `/Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldId} 0 R /F3 ${monoId} 0 R >> >>`,
        `/Contents ${contentId} 0 R`,
        ">>",
      ].join(" "),
    );
    pageIds.push(pageId);
  }

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const [index, body] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}
