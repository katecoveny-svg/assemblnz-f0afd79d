import { NextResponse } from "next/server";
import { hashPack, type Block, type EvidencePack, type Section } from "@/lib/evidence/pack-spec";
import { getHuiTemplate } from "@/lib/hui/templates";
import { renderHuiEvidencePdf } from "@/lib/hui/evidence-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/hui/evidence-pack
 * Build a downloadable evidence pack (PDF) from a Hui meeting record.
 *
 * The pack is hashed with SHA-256 over its canonical JSON — that hash is the
 * Mana Receipt backbone, the thing a reviewer can later verify. The pack ships
 * as a draft: a named human reviews and seals it before it is relied on.
 */

function stripTags(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Parse the structured-notes HTML (h2 + p + ul/li) into evidence-pack blocks. */
function htmlToSections(html: string): Section[] {
  const sections: Section[] = [];
  const parts = html.split(/<h2>/i).slice(1);
  for (const part of parts) {
    const headingMatch = part.match(/^(.*?)<\/h2>/i);
    const heading = headingMatch ? stripTags(headingMatch[1]) : "Section";
    const rest = part.replace(/^.*?<\/h2>/i, "");
    const body: Block[] = [];

    const paragraphs = rest.match(/<p>([\s\S]*?)<\/p>/gi) ?? [];
    for (const p of paragraphs) {
      const text = stripTags(p);
      if (text) body.push({ kind: "paragraph", text });
    }

    const items = (rest.match(/<li>([\s\S]*?)<\/li>/gi) ?? []).map(stripTags).filter(Boolean);
    if (items.length) body.push({ kind: "list", items });

    if (body.length === 0) body.push({ kind: "paragraph", text: "None recorded." });

    sections.push({
      id: heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "section",
      title: { en: heading, mi: heading },
      draftedBy: "hui meeting agent",
      body,
    });
  }
  return sections;
}

function safeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "hui-meeting";
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const html = String(body?.html ?? "").trim();
  const templateId = String(body?.templateId ?? "").trim();
  const title = String(body?.title ?? "").trim().slice(0, 160) || "Untitled meeting";
  const attendees = String(body?.attendees ?? "").trim().slice(0, 400);

  const template = getHuiTemplate(templateId);
  if (!template) {
    return NextResponse.json({ error: "Unknown meeting template." }, { status: 400 });
  }
  if (html.length < 12) {
    return NextResponse.json({ error: "Generate the meeting record before downloading the evidence pack." }, { status: 400 });
  }

  const issuedAt = new Date().toISOString();
  const recordSections = htmlToSections(html);

  const sections: Section[] = [
    {
      id: "tuapapa",
      title: { en: "Foundation", mi: "Tūāpapa" },
      draftedBy: "hui meeting agent",
      body: [
        {
          kind: "callout",
          tone: "draft",
          text: "Draft evidence pack. This record was drafted by the hui meeting agent and is not yet reviewed, signed, or sealed. A named human must review it before it is filed or relied on.",
        },
        {
          kind: "paragraph",
          text: `Meeting: ${title}. Output: ${template.label}. Framework: ${template.framework}.${attendees ? ` Attendees: ${attendees}.` : ""}`,
        },
      ],
    },
    ...recordSections,
    {
      id: "whakapono",
      title: { en: "Attestation", mi: "Whakapono" },
      draftedBy: "hui meeting agent",
      body: [
        {
          kind: "paragraph",
          text: "Reviewed by: ____________________   Role: ____________________   Date: ____________",
        },
        {
          kind: "callout",
          tone: "pounamu",
          text: "Once a named reviewer signs and seals this pack, the evidence pack becomes a verifiable record — its Mana Receipt hash can be checked against the published verifier.",
        },
      ],
    },
  ];

  const pack: EvidencePack = {
    id: `hui-${safeName(title)}-${issuedAt.slice(0, 10)}`,
    tenantId: "hui:public",
    kete: template.kete,
    kind: "workflow",
    title: { en: `${title} — meeting evidence pack`, mi: `${title} — kōpaki taunaki hui` },
    subject: { kind: "meeting", ref: safeName(title), label: `${template.label} · ${title}` },
    issuedAt,
    status: "draft",
    reviewer: null,
    agentLoadout: [{ agent: `hui-${template.kete}`, sectionIds: sections.map((s) => s.id) }],
    sections,
    citations: [],
    hashChain: { prevHash: "", thisHash: "", sealedAt: null, verifierUrl: "" },
  };

  pack.hashChain.thisHash = await hashPack(pack);
  pack.hashChain.verifierUrl = `https://www.assembl.co.nz/evidence/verify/${pack.hashChain.thisHash}`;

  const pdf = renderHuiEvidencePdf(pack);
  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="assembl-evidence-pack-${safeName(title)}.pdf"`,
      "Cache-Control": "no-store",
      "X-Assembl-Mana-Hash": pack.hashChain.thisHash.slice(0, 32),
    },
  });
}
