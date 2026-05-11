// generate-evidence-pack
// ---------------------------------------------------------------------------
// Renders an EvidencePack (lib/evidence/pack-spec.ts canonical form) to PDF
// via pdf-lib. Replaces the previous kete-specific renderer.
//
// Request shapes:
//   POST /generate-evidence-pack { packId: string }
//     — looks the pack up in evidence_packs and renders it.
//
//   POST /generate-evidence-pack { pack: EvidencePack }
//     — renders the supplied pack directly. Used by the fixture artefact
//       script and the public verifier.
//
// Response: application/pdf body. CORS-enabled.
//
// The renderer honours the seven invariants of voyage-evidence-craft.md §2.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  PDFFont,
  PDFPage,
  RGB,
} from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Pearl palette — mirrors voyage-evidence-craft.md §3.1
const C = {
  paper: rgb(0.980, 0.969, 0.949),        // #FAF7F2
  ink: rgb(0.137, 0.129, 0.121),          // #23211F
  inkSecondary: rgb(0.361, 0.345, 0.322), // #5C5852
  inkTertiary: rgb(0.557, 0.541, 0.510),  // #8E8A82
  pounamu: rgb(0.169, 0.420, 0.341),      // #2B6B57
  softGold: rgb(0.851, 0.737, 0.478),     // #D9BC7A
  draftRed: rgb(0.639, 0.231, 0.173),     // #A33B2C
};

// A4 in points
const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 56;

// Types mirror lib/evidence/pack-spec.ts
interface BilingualText { en: string; mi: string; }
interface PackSubject { kind: string; ref: string; label: string; }
interface Reviewer { name: string; role: string; email: string; }
interface AgentSection { agent: string; sectionIds: string[]; }
interface Citation { n: number; ref: string; context: string; url?: string; }

type Block =
  | { kind: "paragraph"; text: string; cites?: number[] }
  | { kind: "list"; items: string[]; cites?: number[] }
  | { kind: "pullQuote"; text: string; attributedTo?: string }
  | { kind: "callout"; tone: "pounamu" | "draft" | "sealed"; text: string }
  | { kind: "table"; columns: string[]; rows: string[][]; caption?: string }
  | { kind: "signature"; signedBy: string; signedAt: string };

interface Section {
  id: string;
  title: BilingualText;
  body: Block[];
  draftedBy: string;
}

interface EvidencePack {
  id: string;
  tenantId: string;
  kete: string;
  kind: "posture" | "workflow" | "verifier";
  title: BilingualText;
  subject: PackSubject;
  issuedAt: string;
  status: "draft" | "sealed";
  reviewer: Reviewer | null;
  agentLoadout: AgentSection[];
  sections: Section[];
  citations: Citation[];
  hashChain: {
    prevHash: string;
    thisHash: string;
    sealedAt: string | null;
    verifierUrl: string;
  };
}

interface RenderContext {
  doc: PDFDocument;
  pack: EvidencePack;
  fonts: {
    sans: PDFFont;
    sansBold: PDFFont;
    serif: PDFFont;
    serifLight: PDFFont;
    mono: PDFFont;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const body = await req.json().catch(() => ({}));
    let pack: EvidencePack | null = null;

    if (body.pack) {
      pack = body.pack as EvidencePack;
    } else if (body.packId) {
      const supa = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { data, error } = await supa
        .from("evidence_packs")
        .select("*")
        .eq("id", body.packId)
        .maybeSingle();
      if (error) throw error;
      pack = data as EvidencePack | null;
    }

    if (!pack) {
      return jsonErr("pack or packId required", 400);
    }

    const pdf = await renderPack(pack);
    return new Response(pdf, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pack.id}.pdf"`,
        "Cache-Control": pack.status === "sealed" ? "public, max-age=86400" : "no-store",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return jsonErr(msg, 500);
  }
});

function jsonErr(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Renderer
// ─────────────────────────────────────────────────────────────────────────────

async function renderPack(pack: EvidencePack): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${pack.title.en} · assembl evidence pack`);
  doc.setAuthor("assembl");
  doc.setSubject(pack.subject.label);
  doc.setProducer("assembl evidence-pack renderer");
  doc.setCreator("assembl");
  doc.setCreationDate(new Date(pack.issuedAt));

  const fonts = {
    sans: await doc.embedFont(StandardFonts.Helvetica),
    sansBold: await doc.embedFont(StandardFonts.HelveticaBold),
    serif: await doc.embedFont(StandardFonts.TimesRoman),
    serifLight: await doc.embedFont(StandardFonts.TimesRoman),
    mono: await doc.embedFont(StandardFonts.Courier),
  };
  const ctx: RenderContext = { doc, pack, fonts };

  renderCover(ctx);
  const bodySections = pack.sections.filter((s) => s.id !== "pou-taunaki");
  bodySections.forEach((s, i) => renderSection(ctx, s, i));
  if (pack.citations.length > 0) renderCitations(ctx);
  renderClosing(ctx);
  return await doc.save();
}

function renderCover(ctx: RenderContext) {
  const page = ctx.doc.addPage([A4.w, A4.h]);
  const { fonts, pack } = ctx;

  drawPaper(page);
  drawWatermarkIfDraft(page, pack, fonts);

  page.drawText("assembl", {
    x: MARGIN, y: A4.h - MARGIN - 30, size: 36, font: fonts.serif, color: C.ink,
  });
  const keteLine = `${keteDisplay(pack.kete)} · ${keteEnglish(pack.kete)} · evidence pack`.toUpperCase();
  page.drawText(keteLine, {
    x: MARGIN, y: A4.h - MARGIN - 50, size: 7.5, font: fonts.mono,
    color: C.inkSecondary, characterSpacing: 1.5,
  });

  const titleY = A4.h * 0.55;
  page.drawText(pack.title.mi, { x: MARGIN, y: titleY, size: 34, font: fonts.serifLight, color: C.ink });
  page.drawText(pack.title.en, { x: MARGIN, y: titleY - 38, size: 24, font: fonts.serif, color: C.inkSecondary });
  page.drawText(pack.subject.label.toUpperCase(), {
    x: MARGIN, y: titleY - 75, size: 8.5, font: fonts.mono,
    color: C.inkSecondary, characterSpacing: 1.2,
  });

  const footY = MARGIN + 80;
  page.drawText(`ISSUED · ${formatNzst(pack.issuedAt).toUpperCase()}`, {
    x: MARGIN, y: footY, size: 7.5, font: fonts.mono, color: C.inkSecondary, characterSpacing: 1.2,
  });
  if (pack.reviewer) {
    page.drawText(pack.reviewer.name, {
      x: MARGIN, y: footY - 18, size: 13, font: fonts.serif, color: C.ink,
    });
    page.drawText(` · ${pack.reviewer.role}`, {
      x: MARGIN + fonts.serif.widthOfTextAtSize(pack.reviewer.name, 13),
      y: footY - 18, size: 11, font: fonts.sans, color: C.inkTertiary,
    });
  }
  drawSeal(page, A4.w - MARGIN - 14, footY - 6, pack.status === "sealed");

  const hashLine =
    pack.status === "sealed" && pack.hashChain.sealedAt
      ? `hash · ${shortHash(pack.hashChain.thisHash)} · prev ${shortHash(pack.hashChain.prevHash)} · sealed ${formatNzst(pack.hashChain.sealedAt)}`
      : "draft · not sealed · verifier inactive";
  page.drawText(hashLine, {
    x: MARGIN, y: MARGIN - 18, size: 7, font: fonts.mono, color: C.inkTertiary, characterSpacing: 0.6,
  });
}

function renderSection(ctx: RenderContext, section: Section, index: number) {
  const page = ctx.doc.addPage([A4.w, A4.h]);
  drawPaper(page);
  drawWatermarkIfDraft(page, ctx.pack, ctx.fonts, 0.07);

  const headerY = A4.h - MARGIN - 20;
  page.drawText(String(index + 1).padStart(2, "0"), {
    x: MARGIN - 30, y: headerY - 4, size: 8, font: ctx.fonts.mono, color: C.inkTertiary, characterSpacing: 0.6,
  });
  page.drawText(section.title.mi, { x: MARGIN, y: headerY, size: 26, font: ctx.fonts.serifLight, color: C.ink });
  page.drawText(section.title.en, { x: MARGIN, y: headerY - 22, size: 16, font: ctx.fonts.serif, color: C.inkSecondary });
  page.drawRectangle({
    x: MARGIN, y: headerY - 35, width: A4.w - 2 * MARGIN, height: 0.6,
    color: C.softGold, opacity: 0.45,
  });

  let y = headerY - 60;
  const minY = MARGIN + 60;
  for (const block of section.body) {
    if (y < minY) break;
    y = drawBlock(page, ctx, block, y);
    y -= 12;
  }

  page.drawText(`DRAFTED BY · ${section.draftedBy.toUpperCase()}`, {
    x: MARGIN, y: MARGIN + 30, size: 6.5, font: ctx.fonts.mono, color: C.inkTertiary, characterSpacing: 1,
  });
  drawPageFoot(page, ctx);
}

function drawBlock(page: PDFPage, ctx: RenderContext, block: Block, startY: number): number {
  const width = A4.w - 2 * MARGIN;
  let y = startY;

  switch (block.kind) {
    case "paragraph": {
      y = drawWrappedText(page, ctx.fonts.sans, block.text, MARGIN, y, width, 10.5, 16, C.ink);
      if (block.cites?.length) {
        page.drawText(`[${block.cites.join(", ")}]`, {
          x: MARGIN + 4, y, size: 8, font: ctx.fonts.mono, color: C.pounamu,
        });
        y -= 6;
      }
      return y;
    }
    case "list": {
      for (const item of block.items) {
        page.drawCircle({ x: MARGIN + 4, y: y - 5, size: 1.5, color: C.pounamu });
        y = drawWrappedText(page, ctx.fonts.sans, item, MARGIN + 14, y, width - 14, 10.5, 16, C.ink);
        y -= 4;
      }
      if (block.cites?.length) {
        page.drawText(`[${block.cites.join(", ")}]`, {
          x: MARGIN + 14, y, size: 8, font: ctx.fonts.mono, color: C.pounamu,
        });
        y -= 6;
      }
      return y;
    }
    case "pullQuote": {
      page.drawRectangle({
        x: MARGIN + 4, y: y - 60, width: 1.5, height: 60, color: C.pounamu,
      });
      y = drawWrappedText(page, ctx.fonts.serifLight, `"${block.text}"`, MARGIN + 18, y, width - 18, 14, 20, C.ink);
      if (block.attributedTo) {
        y -= 4;
        page.drawText(`— ${block.attributedTo.toUpperCase()}`, {
          x: MARGIN + 18, y, size: 7.5, font: ctx.fonts.mono, color: C.inkSecondary, characterSpacing: 1,
        });
        y -= 14;
      }
      return y;
    }
    case "callout": {
      const palette = {
        pounamu: { bg: { r: 0.169, g: 0.420, b: 0.341, a: 0.06 }, border: C.pounamu },
        draft: { bg: { r: 0.639, g: 0.231, b: 0.173, a: 0.06 }, border: C.draftRed },
        sealed: { bg: { r: 0.851, g: 0.737, b: 0.478, a: 0.10 }, border: C.softGold },
      }[block.tone];
      const lines = wrapText(ctx.fonts.sans, block.text, width - 28, 10);
      const boxH = lines.length * 14 + 22;
      page.drawRectangle({
        x: MARGIN, y: y - boxH, width, height: boxH,
        color: rgb(palette.bg.r, palette.bg.g, palette.bg.b),
        opacity: palette.bg.a,
        borderColor: palette.border, borderWidth: 0.6, borderOpacity: 0.5,
      });
      let ly = y - 16;
      for (const line of lines) {
        page.drawText(line, { x: MARGIN + 14, y: ly, size: 10, font: ctx.fonts.sans, color: C.ink });
        ly -= 14;
      }
      return y - boxH - 4;
    }
    case "table": {
      const cols = block.columns.length;
      const colW = width / cols;
      for (let i = 0; i < cols; i++) {
        page.drawText(block.columns[i].toUpperCase(), {
          x: MARGIN + i * colW + 4, y: y - 12, size: 7, font: ctx.fonts.mono,
          color: C.inkSecondary, characterSpacing: 1,
        });
      }
      page.drawRectangle({
        x: MARGIN, y: y - 17, width, height: 0.6, color: C.ink, opacity: 0.2,
      });
      y -= 22;
      for (const row of block.rows) {
        let rowH = 14;
        for (let i = 0; i < cols; i++) {
          const lines = wrapText(ctx.fonts.sans, row[i] ?? "", colW - 8, 9.5);
          rowH = Math.max(rowH, lines.length * 12 + 6);
          let ly = y - 10;
          for (const line of lines) {
            page.drawText(line, { x: MARGIN + i * colW + 4, y: ly, size: 9.5, font: ctx.fonts.sans, color: C.ink });
            ly -= 12;
          }
        }
        y -= rowH;
        page.drawRectangle({
          x: MARGIN, y: y + 4, width, height: 0.4, color: C.ink, opacity: 0.08,
        });
      }
      if (block.caption) {
        y -= 8;
        page.drawText(block.caption.toUpperCase(), {
          x: MARGIN, y, size: 6.5, font: ctx.fonts.mono, color: C.inkTertiary, characterSpacing: 0.8,
        });
        y -= 8;
      }
      return y;
    }
    case "signature": {
      page.drawRectangle({
        x: MARGIN, y: y - 4, width, height: 0.6, color: C.ink, opacity: 0.15,
      });
      y -= 24;
      page.drawText(block.signedBy, { x: MARGIN, y, size: 14, font: ctx.fonts.serif, color: C.ink });
      y -= 14;
      page.drawText(`SIGNED · ${block.signedAt.toUpperCase()}`, {
        x: MARGIN, y, size: 7, font: ctx.fonts.mono, color: C.inkTertiary, characterSpacing: 1,
      });
      return y - 8;
    }
  }
}

function renderCitations(ctx: RenderContext) {
  const page = ctx.doc.addPage([A4.w, A4.h]);
  drawPaper(page);
  drawWatermarkIfDraft(page, ctx.pack, ctx.fonts, 0.07);

  const headerY = A4.h - MARGIN - 20;
  page.drawText("Pou taunaki", { x: MARGIN, y: headerY, size: 26, font: ctx.fonts.serifLight, color: C.ink });
  page.drawText("Citations", { x: MARGIN, y: headerY - 22, size: 16, font: ctx.fonts.serif, color: C.inkSecondary });
  page.drawRectangle({
    x: MARGIN, y: headerY - 35, width: A4.w - 2 * MARGIN, height: 0.6,
    color: C.softGold, opacity: 0.45,
  });

  let y = headerY - 60;
  for (const c of ctx.pack.citations) {
    if (y < MARGIN + 80) break;
    page.drawText(String(c.n).padStart(2, "0"), {
      x: MARGIN, y: y - 2, size: 9, font: ctx.fonts.mono, color: C.pounamu, characterSpacing: 0.6,
    });
    page.drawText(c.ref, { x: MARGIN + 24, y, size: 12, font: ctx.fonts.serif, color: C.ink });
    y -= 16;
    y = drawWrappedText(page, ctx.fonts.sans, c.context, MARGIN + 24, y, A4.w - 2 * MARGIN - 24, 9.5, 14, C.inkSecondary);
    if (c.url) {
      y -= 2;
      page.drawText(c.url, { x: MARGIN + 24, y, size: 7, font: ctx.fonts.mono, color: C.inkTertiary });
      y -= 12;
    }
    y -= 8;
  }
  drawPageFoot(page, ctx);
}

function renderClosing(ctx: RenderContext) {
  const page = ctx.doc.addPage([A4.w, A4.h]);
  drawPaper(page);
  drawWatermarkIfDraft(page, ctx.pack, ctx.fonts, 0.07);

  page.drawText("WHAKAMUTUNGA · AUDIT STATEMENT", {
    x: MARGIN, y: A4.h - MARGIN - 10, size: 8, font: ctx.fonts.mono,
    color: C.inkSecondary, characterSpacing: 1.5,
  });
  page.drawRectangle({
    x: MARGIN, y: A4.h - MARGIN - 22, width: A4.w - 2 * MARGIN, height: 0.6,
    color: C.softGold, opacity: 0.45,
  });

  let y = A4.h - MARGIN - 60;

  page.drawText("REVIEWED AND APPROVED BY", {
    x: MARGIN, y, size: 7.5, font: ctx.fonts.mono, color: C.inkTertiary, characterSpacing: 1.2,
  });
  y -= 18;
  if (ctx.pack.reviewer) {
    page.drawText(ctx.pack.reviewer.name, { x: MARGIN, y, size: 20, font: ctx.fonts.serif, color: C.ink });
    y -= 18;
    page.drawText(`${ctx.pack.reviewer.role} · ${ctx.pack.reviewer.email}`, {
      x: MARGIN, y, size: 11, font: ctx.fonts.sans, color: C.inkSecondary,
    });
    y -= 28;
  } else {
    page.drawText("Not yet reviewed — pack remains in Draft.", {
      x: MARGIN, y, size: 14, font: ctx.fonts.serif, color: C.draftRed,
    });
    y -= 28;
  }

  page.drawText("DRAFTED BY", {
    x: MARGIN, y, size: 7.5, font: ctx.fonts.mono, color: C.inkTertiary, characterSpacing: 1.2,
  });
  y -= 16;
  for (const a of ctx.pack.agentLoadout) {
    page.drawText(a.agent, {
      x: MARGIN, y, size: 9.5, font: ctx.fonts.mono, color: C.pounamu, characterSpacing: 0.4,
    });
    page.drawText(`§${a.sectionIds.join(", §")}`, {
      x: MARGIN + 120, y, size: 10, font: ctx.fonts.sans, color: C.inkSecondary,
    });
    y -= 14;
  }
  y -= 18;

  const sealed = ctx.pack.status === "sealed";
  const blockColor = sealed
    ? { r: 0.169, g: 0.420, b: 0.341, a: 0.05 }
    : { r: 0.639, g: 0.231, b: 0.173, a: 0.05 };
  const borderColor = sealed ? C.pounamu : C.draftRed;
  const blockH = 170;
  page.drawRectangle({
    x: MARGIN, y: y - blockH, width: A4.w - 2 * MARGIN, height: blockH,
    color: rgb(blockColor.r, blockColor.g, blockColor.b), opacity: blockColor.a,
    borderColor, borderWidth: 0.6, borderOpacity: 0.5,
  });
  let by = y - 22;
  page.drawText("MŌKIHI · HASH CHAIN PROOF", {
    x: MARGIN + 14, y: by, size: 7.5, font: ctx.fonts.mono,
    color: borderColor, characterSpacing: 1.5,
  });
  by -= 18;

  const kv = (label: string, value: string) => {
    page.drawText(label.toUpperCase(), {
      x: MARGIN + 14, y: by, size: 6.5, font: ctx.fonts.mono,
      color: C.inkTertiary, characterSpacing: 1,
    });
    page.drawText(value, { x: MARGIN + 100, y: by, size: 8.5, font: ctx.fonts.mono, color: C.ink });
    by -= 14;
  };
  kv("status", sealed ? "sealed" : "draft · not sealed");
  kv("hash", ctx.pack.hashChain.thisHash || "—");
  kv("prev", ctx.pack.hashChain.prevHash || "—");
  kv("sealed at", formatNzst(ctx.pack.hashChain.sealedAt));
  kv("verifier", ctx.pack.hashChain.verifierUrl || "—");

  by -= 6;
  drawWrappedText(
    page, ctx.fonts.sans,
    "The hash above is computed from the canonical JSON form of this pack and chained from the previous sealed pack for this tenant. Any external party can confirm integrity at the verifier URL. A pack that fails verification is not an Assembl pack.",
    MARGIN + 14, by, A4.w - 2 * MARGIN - 28, 8.5, 12, C.inkSecondary,
  );
  drawPageFoot(page, ctx);
}

function drawPaper(page: PDFPage) {
  page.drawRectangle({ x: 0, y: 0, width: A4.w, height: A4.h, color: C.paper });
}

function drawWatermarkIfDraft(
  page: PDFPage, pack: EvidencePack, fonts: RenderContext["fonts"], opacity = 0.20,
) {
  if (pack.status !== "draft") return;
  page.drawText("DRAFT", {
    x: A4.w / 2 - 220, y: A4.h / 2 - 100, size: 200, font: fonts.serifLight,
    color: C.draftRed, opacity, rotate: { type: "degrees", angle: -22 },
  });
}

function drawSeal(page: PDFPage, cx: number, cy: number, sealed: boolean) {
  const fill = sealed ? C.softGold : rgb(0.769, 0.733, 0.659);
  page.drawRectangle({ x: cx - 1.2, y: cy - 12, width: 2.4, height: 24, color: fill });
  page.drawRectangle({ x: cx - 12, y: cy - 1.2, width: 24, height: 2.4, color: fill });
  page.drawCircle({ x: cx, y: cy, size: 0.8, color: C.paper });
  if (sealed) {
    page.drawCircle({
      x: cx, y: cy, size: 13,
      borderColor: C.pounamu, borderWidth: 0.4, borderOpacity: 0.7,
    });
  }
}

function drawPageFoot(page: PDFPage, ctx: RenderContext) {
  const { pack, fonts } = ctx;
  page.drawText("assembl", {
    x: MARGIN, y: MARGIN - 18, size: 7, font: fonts.mono,
    color: C.inkTertiary, characterSpacing: 0.6,
  });
  const right =
    pack.status === "sealed"
      ? `hash · ${shortHash(pack.hashChain.thisHash)} · sealed ${formatNzst(pack.hashChain.sealedAt)}`
      : "draft · unsealed";
  const w = fonts.mono.widthOfTextAtSize(right, 7);
  page.drawText(right, {
    x: A4.w - MARGIN - w, y: MARGIN - 18, size: 7, font: fonts.mono,
    color: C.inkTertiary, characterSpacing: 0.6,
  });
}

function wrapText(font: PDFFont, text: string, maxWidth: number, size: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const probe = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(probe, size) > maxWidth) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = probe;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrappedText(
  page: PDFPage, font: PDFFont, text: string,
  x: number, startY: number, maxWidth: number, size: number, leading: number, color: RGB,
): number {
  const lines = wrapText(font, text, maxWidth, size);
  let y = startY;
  for (const line of lines) {
    page.drawText(line, { x, y, size, font, color });
    y -= leading;
  }
  return y;
}

function shortHash(hash: string | null | undefined): string {
  if (!hash) return "—";
  if (hash.length < 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

function formatNzst(iso: string | null | undefined): string {
  if (!iso) return "—";
  return (
    new Intl.DateTimeFormat("en-NZ", {
      timeZone: "Pacific/Auckland",
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date(iso)) + " NZST"
  );
}

function keteDisplay(slug: string): string {
  const map: Record<string, string> = {
    waihanga: "Waihanga", manaaki: "Manaaki", pikau: "Pīkau",
    arataki: "Arataki", auaha: "Auaha", hoko: "Hoko",
    ako: "Ako", toro: "Tōro",
  };
  return map[slug] ?? slug;
}

function keteEnglish(slug: string): string {
  const map: Record<string, string> = {
    waihanga: "Construction", manaaki: "Hospitality", pikau: "Freight & Customs",
    arataki: "Automotive & Fleet", auaha: "Creative", hoko: "Retail",
    ako: "Early Childhood", toro: "Family",
  };
  return map[slug] ?? "";
}
