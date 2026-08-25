"use client";

import { useState } from "react";
import { Download, FileText, Loader2, Share2, Sparkles } from "lucide-react";
import { HapaiToolShell } from "@/components/hapai/HapaiToolShell";
import { useToolGate } from "@/lib/hapai/use-tool-gate";
import {
  BRIEF_FIELD_SETS,
  BRIEF_TYPES,
  type Brief,
  type BriefType,
} from "@/lib/hapai/brief-fields";

const labelClass = "font-mono text-[12px] uppercase tracking-[0.16em] text-[#68766f]";

function wrap(text: string, max: number): string[] {
  const words = String(text || "").replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function slug(value: string) {
  return (
    String(value || "brief")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "brief"
  );
}

async function briefToPdfBlob(brief: Brief): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  doc.setTitle(`${brief.title} · brief generator`);
  doc.setAuthor("assembl");
  doc.setCreator("assembl brief generator");
  const page = doc.addPage([595.28, 841.89]);
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);
  const C = {
    paper: rgb(0.98, 0.969, 0.949),
    ink: rgb(0.137, 0.129, 0.121),
    soft: rgb(0.361, 0.345, 0.322),
    pounamu: rgb(0.169, 0.42, 0.341),
    gold: rgb(0.831, 0.659, 0.325),
  };
  const margin = 56;
  let y = 841.89 - margin;
  page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: C.paper });
  page.drawText("assembl · hapai · brief generator", { x: margin, y, size: 8, font: mono, color: C.pounamu });
  y -= 38;
  page.drawText(brief.title.slice(0, 72), { x: margin, y, size: 30, font: serif, color: C.ink });
  y -= 20;
  page.drawText(brief.eyebrow.toUpperCase().slice(0, 80), { x: margin, y, size: 8, font: mono, color: C.soft });
  y -= 24;
  page.drawLine({ start: { x: margin, y }, end: { x: 595.28 - margin, y }, thickness: 1, color: C.gold });
  y -= 24;
  for (const section of brief.sections) {
    if (y < 132) break;
    page.drawText(section.heading.toUpperCase().slice(0, 56), { x: margin, y, size: 8, font: sansBold, color: C.pounamu });
    y -= 13;
    for (const line of wrap(section.body, 96).slice(0, 4)) {
      if (y < 118) break;
      page.drawText(line, { x: margin, y, size: 10.5, font: sans, color: C.ink });
      y -= 14;
    }
    y -= 8;
  }
  page.drawLine({ start: { x: margin, y: 94 }, end: { x: 595.28 - margin, y: 94 }, thickness: 1, color: C.gold });
  page.drawText(brief.signature.slice(0, 100), { x: margin, y: 72, size: 9, font: sans, color: C.soft });
  page.drawText("draft brief · a named person signs it off", { x: margin, y: 54, size: 7.5, font: mono, color: C.soft });
  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes).buffer], { type: "application/pdf" });
}

export function BriefGeneratorTool() {
  const [briefType, setBriefType] = useState<BriefType>("creative");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const gate = useToolGate("brief-generator");

  const fieldSet = BRIEF_FIELD_SETS[briefType];
  const filledCount = fieldSet.filter(([id]) => (fields[id] ?? "").trim()).length;
  const canGenerate = filledCount >= 4 && !loading;

  function setField(id: string, value: string) {
    setFields((current) => ({ ...current, [id]: value }));
  }

  function switchType(type: BriefType) {
    setBriefType(type);
    setFields({});
    setError("");
  }

  async function generateBrief() {
    setError("");
    setLoading(true);
    try {
      const payload: Record<string, string> = {};
      for (const [id] of fieldSet) payload[id] = (fields[id] ?? "").trim();
      const response = await gate.fetch("/api/hapai/brief-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: briefType, fields: payload }),
      });
      if (!response) return; // gated — the email-capture modal is showing
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not generate the brief just now.");
      if (!data.brief?.sections?.length) throw new Error("No brief returned. Add a little more detail.");
      setBrief(data.brief as Brief);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate the brief just now.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!brief || downloading) return;
    setDownloading(true);
    try {
      const blob = await briefToPdfBlob(brief);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slug(brief.title)}-brief.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build the PDF just now.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <HapaiToolShell
      kicker="hapai · record"
      title="Brief generator."
      description="Turn a loose project idea into a clean draft brief with scope, audience, constraints, and next steps."
      toolPath="/hapai/brief-generator"
      shareTitle="Brief generator. — assembl"
      shareText="Turn a loose project idea into a clean draft brief with scope, audience, constraints, and next steps."
      posture="Draft brief only. The owner signs off scope, budget, claims, and deadlines."
      highlights={[
        {
          title: "share",
          body: "copy the link, email it, or embed it",
          icon: <Share2 className="h-5 w-5" aria-hidden />,
        },
        {
          title: "draft",
          body: "create the draft, then review before publishing",
          icon: <Sparkles className="h-5 w-5" aria-hidden />,
        },
        {
          title: "one page",
          body: "the brief lands on a single A4 you can download as PDF",
          icon: <FileText className="h-5 w-5" aria-hidden />,
        },
      ]}
    >
      <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/70 p-5">
          <p className={labelClass}>Brief type</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {BRIEF_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={briefType === type}
                onClick={() => switchType(type)}
                className={`min-h-[40px] rounded-[10px] border px-3.5 text-sm capitalize transition ${
                  briefType === type
                    ? "border-[#313c42] bg-[#313c42] text-white"
                    : "border-[rgba(35,33,31,0.14)] bg-white text-[#313c42] hover:bg-[#f3f5f3]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4">
            {fieldSet.map(([id, label, helper]) => (
              <label key={`${briefType}-${id}`} className="block">
                <span className={labelClass}>
                  {label} <span className="normal-case tracking-normal">· {helper}</span>
                </span>
                <textarea
                  className="mt-1.5 min-h-[56px] w-full resize-y rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#3f7373]"
                  value={fields[id] ?? ""}
                  onChange={(event) => setField(id, event.target.value)}
                  placeholder={helper}
                />
              </label>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={!canGenerate}
              onClick={() => void generateBrief()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#313c42] px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden />
              )}
              Generate brief
            </button>
            <button
              type="button"
              disabled={!brief || downloading}
              onClick={() => void downloadPdf()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[rgba(35,33,31,0.14)] bg-white px-5 text-sm text-[#313c42] transition hover:bg-[#f3f5f3] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Download className="h-4 w-4" aria-hidden />
              )}
              Download PDF
            </button>
            <span className="flex items-center">{gate.counter}</span>
          </div>
          {error ? <p className="mt-3 text-xs text-[#9A3412]">{error}</p> : null}
          <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.16em] text-[#68766f]">
            Fill at least four fields · draft only
          </p>
        </div>

        <div className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/78 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-2xl font-light text-[#313c42]">Preview</h2>
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#68766f]">
              {loading ? "generating…" : brief ? `${briefType} brief · ready for PDF` : "waiting for brief context"}
            </p>
          </div>
          {!brief ? (
            <p className="mt-4 text-sm leading-relaxed text-[#5A5550]">
              Pick a brief type, fill in at least four fields, and a one-page draft brief lands here
              ready to check and download.
            </p>
          ) : (
            <article className="mt-4 rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white p-5">
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#3f7373]">
                {brief.eyebrow}
              </p>
              <h3 className="mt-2 font-display text-3xl font-light leading-tight text-[#313c42]">
                {brief.title}
              </h3>
              <div className="mt-4 grid gap-4 border-t border-[#b8964f]/40 pt-4">
                {brief.sections.map((section) => (
                  <div key={section.heading}>
                    <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[#3f7373]">
                      {section.heading}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#313c42]">{section.body}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 border-t border-[#b8964f]/40 pt-3 text-xs text-[#68766f]">
                {brief.signature}
              </p>
            </article>
          )}
        </div>
      </div>
      {gate.modal}
    </HapaiToolShell>
  );
}
