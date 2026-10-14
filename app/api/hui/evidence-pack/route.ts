import { SaxesParser } from "saxes";
import { sanitizeNotes } from "@/lib/hui/notes-safety";
import { NextResponse } from "next/server";
import { hashPack, type EvidencePack, type Section } from "@/lib/evidence/pack-spec";
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

/** Consume sanitized markup in document order, including headingless notes. */
function htmlToSections(html: string): Section[] {
  const sections: Section[] = [];
  let current: Section | undefined;
  let text = "";
  let heading = false;
  const createSection = (title: string) => {
    current = {
      id: `notes-${sections.length + 1}`,
      title: { en: title, mi: title },
      draftedBy: "unverified prepared draft",
      body: [],
    };
    sections.push(current);
  };
  const flush = () => {
    const value = text.replace(/\s+/g, " ").trim();
    text = "";
    if (!value) return;
    if (!current) createSection("Meeting notes");
    current!.body.push({ kind: "paragraph", text: value });
  };
  const parser = new SaxesParser({ fragment: true });
  parser.on("opentag", tag => {
    if (tag.name === "h2") { flush(); heading = true; }
    else if (!heading && ["p", "h3", "ul", "li"].includes(tag.name)) flush();
  });
  parser.on("text", value => { text += value; });
  parser.on("closetag", tag => {
    if (tag.name === "h2") {
      createSection(text.replace(/\s+/g, " ").trim() || "Section");
      text = "";
      heading = false;
    } else if (!heading && ["p", "h3", "ul", "li"].includes(tag.name)) flush();
  });
  parser.write(html).close();
  flush();
  return sections;
}

function safeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "hui-meeting";
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || typeof body.html !== 'string' || body.html.length > 80000 ||
      typeof body.templateId !== 'string' || (body.title !== undefined && typeof body.title !== 'string') ||
      (body.attendees !== undefined && typeof body.attendees !== 'string')) {
    return NextResponse.json({ error: 'Invalid or oversized meeting input.' }, { status: 400 });
  }
  const html = sanitizeNotes(String(body?.html ?? "").trim());
  const provenance = body?.provenance === "raw-notes-fallback" ? "raw-notes-fallback" : body?.provenance === "provider-draft" ? "provider-draft" : "unverified-draft";
  const author = provenance === "raw-notes-fallback" ? "user-supplied raw notes" : "unverified prepared draft";
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
  const recordSections = htmlToSections(html).map(section => ({ ...section, draftedBy: author }));

  if (!recordSections.some(section => section.body.length > 0)) {
    return NextResponse.json({ error: "Meeting notes contain no exportable content." }, { status: 400 });
  }

  const sections: Section[] = [
    {
      id: "tuapapa",
      title: { en: "Foundation", mi: "Tūāpapa" },
      draftedBy: author,
      body: [
        {
          kind: "callout",
          tone: "draft",
          text: `Source: ${provenance}. ${provenance === "raw-notes-fallback" ? "User-supplied raw notes; service unavailable. No decisions or actions inferred." : "Prepared draft; source and contents require review."} This record is not reviewed, signed or sealed.`,
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
      draftedBy: author,
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
    agentLoadout: [{ agent: author, sectionIds: sections.map((s) => s.id) }],
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
