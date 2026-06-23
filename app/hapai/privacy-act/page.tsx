"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Download, Printer } from "lucide-react";
import { useToolGate } from "@/lib/hapai/use-tool-gate";

const DATA_TYPES = [
  "Names and contact details",
  "Dates of birth",
  "Addresses",
  "Payment details",
  "Health information",
  "Children's information",
  "Staff records",
  "Customer messages",
  "Images or video",
  "Location data",
  "Website analytics",
  "Automated decision-making inputs",
] as const;

const SECTORS = ["Construction", "Hospitality", "Logistics", "Retail", "Education", "Creative services", "Healthcare adjacent", "Professional services", "Other"];

function htmlToMarkdown(html: string) {
  return html
    .replace(/<h1>(.*?)<\/h1>/g, "# $1\n")
    .replace(/<h2>(.*?)<\/h2>/g, "\n## $1\n")
    .replace(/<h3>(.*?)<\/h3>/g, "\n### $1\n")
    .replace(/<li>(.*?)<\/li>/g, "- $1\n")
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    .replace(/<span class="ipp-pill">(.*?)<\/span>/g, "$1")
    .replace(/<\/?ul>/g, "")
    .replace(/<p>(.*?)<\/p>/g, "$1\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function PrivacyActPage() {
  const squareCanvas = useRef<HTMLCanvasElement | null>(null);
  const linkedInCanvas = useRef<HTMLCanvasElement | null>(null);
  const [organisationName, setOrganisationName] = useState("");
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [otherData, setOtherData] = useState("");
  const [collectionSource, setCollectionSource] = useState("");
  const [sharedWith, setSharedWith] = useState("");
  const [storage, setStorage] = useState("");
  const [retention, setRetention] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const gate = useToolGate("privacy-act");

  async function generate() {
    setError("");
    setLoading(true);
    setHtml("");
    try {
      const response = await gate.fetch("/api/hapai/privacy-act", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organisationName, sector, description, dataTypes, otherData, collectionSource, sharedWith, storage, retention }),
      });
      if (!response) return; // gated — the email-capture modal is showing
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not generate the one-pager.");
      setHtml(data.html);
      window.setTimeout(() => drawShareCards(organisationName || "your organisation"), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate the one-pager.");
    } finally {
      setLoading(false);
    }
  }

  function drawCard(canvas: HTMLCanvasElement | null, width: number, height: number, org: string) {
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#FFF7EC");
    gradient.addColorStop(1, "#EFEAE1");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#C79B1F";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width * 0.11, height * 0.18);
    ctx.lineTo(width * 0.11, height * 0.82);
    ctx.stroke();
    ctx.fillStyle = "#3A3832";
    ctx.font = `${Math.round(width * 0.035)}px monospace`;
    ctx.letterSpacing = "8px";
    ctx.fillText("HAPAI · PRIVACY ACT 2020", width * 0.16, height * 0.2);
    ctx.fillStyle = "#103F35";
    ctx.font = `${Math.round(width * 0.075)}px Georgia, serif`;
    wrap(ctx, "Know which rules apply. Hand it to your team.", width * 0.16, height * 0.34, width * 0.68, Math.round(width * 0.083));
    ctx.fillStyle = "#5A5550";
    ctx.font = `${Math.round(width * 0.032)}px system-ui, sans-serif`;
    wrap(ctx, `Tailored for ${org}. Map your data flows to the 13 Information Privacy Principles.`, width * 0.16, height * 0.66, width * 0.68, Math.round(width * 0.045));
    ctx.fillStyle = "#23211F";
    ctx.font = `${Math.round(width * 0.03)}px Georgia, serif`;
    ctx.fillText("assembl.co.nz/hapai/privacy-act", width * 0.16, height * 0.86);
  }

  function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const test = `${line}${word} `;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        line = `${word} `;
        y += lineHeight;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, y);
  }

  function drawShareCards(org: string) {
    drawCard(squareCanvas.current, 1080, 1080, org);
    drawCard(linkedInCanvas.current, 1200, 627, org);
  }

  function downloadCanvas(canvas: HTMLCanvasElement | null, filename: string) {
    if (!canvas) return;
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = filename;
    anchor.click();
  }

  function copyMarkdown() {
    navigator.clipboard.writeText(htmlToMarkdown(html));
  }

  const instagramCaption = `Know which Privacy Act rules apply.\nMap your data flows to the 13 IPPs.\nIncludes IPP 3A from 1 May 2026.\nTry the free tool: assembl.co.nz/hapai/privacy-act\n\n#NZBusiness #PrivacyAct2020 #DataPrivacy #Aotearoa #SmallBusinessNZ`;
  const linkedInPost = `Most NZ businesses know the Privacy Act 2020 applies. Most are hazy on which Information Privacy Principles matter most for their actual data flows.\n\nassembl built a free HAPAI tool that turns a simple intake form into a one-page Privacy Act summary for your organisation, including the new IPP 3A effective from 1 May 2026.\n\nUse it here: https://www.assembl.co.nz/hapai/privacy-act`;

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 text-[#23211F] md:px-12 md:py-16">
      <div className="mx-auto max-w-[920px]">
        <Link href="/hapai" className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6661] hover:text-[#3A3832]">
          <ArrowLeft className="h-3.5 w-3.5" /> HAPAI library
        </Link>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#6B6661]">HAPAI · Privacy Act 2020 one-pager</p>
        <h1 className="mt-3 font-display text-[38px] font-normal leading-tight md:text-[52px]">Know which rules apply. Hand it to your team.</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#5A5550]">Generate a one-page Privacy Act 2020 summary for your organisation. Maps your data flows to the 13 Information Privacy Principles. Includes the new IPP 3A.</p>

        <section className="mt-8 rounded-[14px] border border-[rgba(35,33,31,0.08)] bg-white p-7">
          <h2 className="border-b border-[#3A3832]/20 pb-2 font-display text-2xl font-normal text-[#3A3832]">About your organisation</h2>
          <div className="mt-6 grid gap-5">
            <Field label="Organisation name"><input value={organisationName} onChange={(event) => setOrganisationName(event.target.value)} className="field-input" placeholder="e.g. Hāpai Workshops Ltd" /></Field>
            <Field label="Sector"><select value={sector} onChange={(event) => setSector(event.target.value)} className="field-input"><option value="">Choose one...</option>{SECTORS.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Brief description of what you do"><textarea value={description} onChange={(event) => setDescription(event.target.value)} className="field-input min-h-[100px]" placeholder="e.g. We run residential renovation projects across Auckland." /></Field>
            <Field label="What personal information do you collect?">
              <div className="grid gap-2 sm:grid-cols-2">
                {DATA_TYPES.map((item) => (
                  <label key={item} className="flex gap-2 rounded-[8px] p-2 text-sm hover:bg-[#F7F4EE]">
                    <input type="checkbox" checked={dataTypes.includes(item)} onChange={(event) => setDataTypes((value) => event.target.checked ? [...value, item] : value.filter((x) => x !== item))} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Other personal information"><input value={otherData} onChange={(event) => setOtherData(event.target.value)} className="field-input" /></Field>
            <Field label="Where does the information come from?"><textarea value={collectionSource} onChange={(event) => setCollectionSource(event.target.value)} className="field-input min-h-[80px]" placeholder="Directly from customers, staff, forms, subcontractors, partners..." /></Field>
            <Field label="Who do you share it with?"><textarea value={sharedWith} onChange={(event) => setSharedWith(event.target.value)} className="field-input min-h-[80px]" placeholder="Accountant, payroll, cloud software, offshore support..." /></Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Where is it stored?"><input value={storage} onChange={(event) => setStorage(event.target.value)} className="field-input" placeholder="Google Drive, Xero, CRM, paper files..." /></Field>
              <Field label="Retention period"><input value={retention} onChange={(event) => setRetention(event.target.value)} className="field-input" placeholder="e.g. 7 years, duration of project" /></Field>
            </div>
          </div>
          <button type="button" onClick={generate} disabled={loading} className="mt-6 rounded-full bg-[#23211F] px-6 py-3 text-sm font-medium text-white hover:bg-[#3A3832] disabled:bg-[#C8C2BC]">{loading ? "Generating..." : "Generate one-pager"}</button>
          <div className="mt-3">{gate.counter}</div>
          {gate.modal}
          {loading && <p className="mt-4 rounded-[10px] border border-[#C79B1F]/30 bg-[#FFF9EC] px-4 py-3 text-sm text-[#6B5A28]">Mapping your data flows to the Privacy Act 2020.</p>}
          {error && <p className="mt-4 rounded-[10px] border border-[#B42828]/25 bg-[#FCEDED] px-4 py-3 text-sm text-[#7A1F1F]">{error}</p>}
        </section>

        {html && (
          <>
            <section className="mt-8 rounded-[14px] border border-[rgba(35,33,31,0.08)] bg-white p-8 print:p-0">
              <div className="privacy-output" dangerouslySetInnerHTML={{ __html: html }} />
              <div className="mt-6 border-l-4 border-[#C79B1F] bg-[#F7F4EE] p-4 text-xs leading-relaxed text-[#5A5550]">
                This is general information, not legal advice. Use it as a practical starting point and get specialist advice for high-risk data flows or incidents.
              </div>
              <div className="mt-6 flex flex-wrap gap-3 print:hidden">
                <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-[#23211F] px-5 py-3 text-sm font-medium text-white hover:bg-[#3A3832]"><Printer className="h-4 w-4" /> Print / save PDF</button>
                <button type="button" onClick={copyMarkdown} className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.18)] px-5 py-3 text-sm text-[#5A5550] hover:text-[#23211F]"><Copy className="h-4 w-4" /> Copy markdown</button>
              </div>
            </section>

            <section className="mt-8 rounded-[14px] border border-[#3A3832]/20 bg-[#F7F4EE] p-7">
              <h2 className="font-display text-2xl font-normal text-[#3A3832]">Share this tool</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <ShareTile title="Instagram · 1080×1080" canvasRef={squareCanvas} onDownload={() => downloadCanvas(squareCanvas.current, "privacy-act-instagram.png")} />
                <ShareTile title="LinkedIn · 1200×627" canvasRef={linkedInCanvas} onDownload={() => downloadCanvas(linkedInCanvas.current, "privacy-act-linkedin.png")} />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <CaptionBox title="Instagram caption" text={instagramCaption} />
                <CaptionBox title="LinkedIn post" text={linkedInPost} />
              </div>
            </section>
          </>
        )}
      </div>
      <style jsx global>{`
        .field-input { width: 100%; border-radius: 8px; border: 1px solid rgba(35,33,31,0.12); background: #F7F4EE; padding: 10px 14px; outline: none; }
        .field-input:focus { border-color: #3A3832; background: white; }
        .privacy-output h1 { font-family: var(--font-display), Georgia, serif; font-size: 28px; font-weight: 400; color: #23211F; }
        .privacy-output h2 { margin-top: 24px; border-bottom: 1px solid rgba(58,56,50,0.18); padding-bottom: 6px; font-family: var(--font-display), Georgia, serif; font-size: 24px; font-weight: 400; color: #3A3832; }
        .privacy-output h3 { margin-top: 18px; font-weight: 600; color: #23211F; }
        .privacy-output p, .privacy-output li { margin-top: 8px; font-size: 14.5px; line-height: 1.65; color: #2A2825; }
        .privacy-output ul { margin-left: 22px; }
        .privacy-output .ipp-pill { display: inline-block; border-radius: 999px; background: rgba(58,56,50,0.10); padding: 2px 8px; font-family: var(--font-mono), monospace; font-size: 11px; color: #3A3832; }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label><span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">{label}</span>{children}</label>;
}

function ShareTile({ title, canvasRef, onDownload }: { title: string; canvasRef: React.RefObject<HTMLCanvasElement | null>; onDownload: () => void }) {
  return (
    <div className="rounded-[10px] border border-[rgba(35,33,31,0.08)] bg-white p-4 text-center">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B6661]">{title}</p>
      <canvas ref={canvasRef} className="w-full rounded-[6px] border border-[rgba(35,33,31,0.08)]" />
      <button type="button" onClick={onDownload} className="mt-3 inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.18)] px-4 py-2 text-sm text-[#5A5550] hover:text-[#23211F]"><Download className="h-4 w-4" /> Download PNG</button>
    </div>
  );
}

function CaptionBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[10px] border border-[rgba(35,33,31,0.08)] bg-white p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B6661]">{title}</p>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#2A2825]">{text}</p>
      <button type="button" onClick={() => navigator.clipboard.writeText(text)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#23211F] px-4 py-2 text-sm text-white hover:bg-[#3A3832]"><Copy className="h-4 w-4" /> Copy caption</button>
    </div>
  );
}
