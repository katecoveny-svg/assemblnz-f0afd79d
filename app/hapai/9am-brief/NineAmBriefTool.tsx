"use client";

import { useState } from "react";
import { DashAgentLoader } from "@/components/dash/DashAgentLoader";
import {
  CalendarCheck,
  Camera,
  CloudSun,
  Copy,
  Download,
  ListChecks,
  Mic,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { HapaiToolShell } from "@/components/hapai/HapaiToolShell";
import { useToolGate } from "@/lib/hapai/use-tool-gate";
import { useDashAd } from "@/components/site/dash/useDashAd";

const proofCards = [
  { icon: Camera, title: "reads a photo", body: "a school notice, timetable, or inbox screenshot" },
  { icon: CloudSun, title: "flags the gaps", body: "what's missing or about to slip" },
  { icon: ListChecks, title: "your next list", body: "what to do, who to chase, what to pack" },
] as const;

function htmlToMarkdown(html: string) {
  return html
    .replace(/<h2>(.*?)<\/h2>/g, "\n## $1\n")
    .replace(/<li>(.*?)<\/li>/g, "- $1\n")
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    .replace(/<\/?ul>/g, "")
    .replace(/<p>(.*?)<\/p>/g, "$1\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function NineAmBriefTool() {
  const [today, setToday] = useState("");
  const [meetings, setMeetings] = useState("");
  const [followUps, setFollowUps] = useState("");
  const [worries, setWorries] = useState("");
  const [notes, setNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const gate = useToolGate("dawn");
  // Assembling: one quiet sponsored line while the brief drafts. Coarse
  // context only (the tool name) — never the user's day. Fail-open.
  const { ad: dashAd, request: requestDashAd, clear: clearDashAd, click: clickDashAd } =
    useDashAd("spinner");

  async function generateBrief() {
    setError("");
    setHtml("");
    setLoading(true);
    void requestDashAd({ tool: "dawn" });
    try {
      const response = await gate.fetch("/api/hapai/dawn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ today, meetings, followUps, worries, notes, imageDataUrl }),
      });
      if (!response) return; // gated — the email-capture modal is showing
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not draft the brief.");
      setHtml(data.html);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draft the brief.");
    } finally {
      setLoading(false);
      clearDashAd();
    }
  }

  function copyOutput() {
    navigator.clipboard.writeText(htmlToMarkdown(html));
  }

  function downloadMarkdown() {
    const blob = new Blob([htmlToMarkdown(html)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "9am-brief.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadEvidencePack() {
    const stamped = new Date().toLocaleString("en-NZ", {
      timeZone: "Pacific/Auckland",
      dateStyle: "full",
      timeStyle: "short",
    });
    // A self-contained, print-ready evidence pack — open it and "Save as PDF"
    // for a receipt you can keep, forward, or file. No external assets.
    const doc = `<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>The Dawn — evidence pack</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; background: #ffffff; color: #313c42; font: 16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 48px 40px; }
  .mark { font-weight: 600; letter-spacing: -0.01em; color: #313c42; font-size: 20px; }
  .eyebrow { font: 600 11px/1 ui-monospace,monospace; letter-spacing: 0.22em; text-transform: uppercase; color: #313c42; }
  h1 { font-size: 30px; font-weight: 600; letter-spacing: -0.02em; margin: 10px 0 4px; color: #313c42; }
  .meta { color: #6B6661; font-size: 13px; margin-bottom: 28px; }
  .rule { border: 0; border-top: 1px solid rgba(35,33,31,0.12); margin: 24px 0; }
  .brief h2 { font-size: 18px; color: #313c42; margin: 22px 0 8px; }
  .brief ul { margin: 0 0 12px; padding-left: 20px; }
  .brief p { margin: 0 0 12px; }
  .foot { margin-top: 32px; padding: 16px 18px; background: #313c42; color: #ffffff; border-radius: 10px; font-size: 13px; line-height: 1.5; }
  .foot b { color: #b8964f; }
  @media print { body { background: #fff; } .wrap { padding: 0; } }
</style></head>
<body><div class="wrap">
  <div class="mark">assembl</div>
  <p class="eyebrow" style="margin-top:18px">SPARK · evidence pack</p>
  <h1>The Dawn</h1>
  <p class="meta">Drafted ${stamped} · Pacific/Auckland</p>
  <hr class="rule"/>
  <div class="brief">${html}</div>
  <div class="foot"><b>Draft operating brief.</b> It does not send messages, change calendars, or make commitments. A named person checks it before anyone acts on it. Made with assembl — assembl.co.nz/hapai/dawn</div>
</div></body></html>`;
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "9am-brief-evidence-pack.html";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleImageUpload(file: File | null) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Upload a photo or screenshot image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Please upload an image under 8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result ?? ""));
      setImageName(file.name);
    };
    reader.onerror = () => setError("Could not read that image. Try a smaller screenshot.");
    reader.readAsDataURL(file);
  }

  function loadFounderSample() {
    setToday("Busy operator day. Need to close loose loops before travel and keep the important people warm.");
    setMeetings("10am supplier check-in\n1pm internal build review\n4pm pilot follow-up window");
    setFollowUps("Send the supplier the updated price list\nSend the new customer the welcome note\nConfirm the contractor has the one-pager");
    setWorries("SPARK tools need to look more credible before sharing\nMeeting recorder needs to feel like a proper assistant, not a form");
    setNotes("Turn scattered screenshots, emails, and whiteboard notes into one calm list. Keep everything draft-only.");
  }

  function loadSchoolSample() {
    setToday("School and sport admin before the day gets away. Child can photo a timetable or say what is coming up.");
    setMeetings("Tuesday: netball training after school\nThursday: cross-country trial\nFriday: spelling test and library day");
    setFollowUps("Ask coach whether boots or trainers are needed\nCheck if permission slip is signed\nRemind child to pack library book");
    setWorries("Rain forecast might change sports gear\nUniform and PE kit often get forgotten");
    setNotes("Make a kid-friendly bring list, parent checks, and tomorrow reminder. In the connected version, check weather and calendar before breakfast.");
  }

  const hasInput = `${today}${meetings}${followUps}${worries}${notes}${imageDataUrl ? "image" : ""}`.trim().length >= 12;

  return (
    <HapaiToolShell
      kicker="SPARK · 9am brief"
      title="The whole morning, sorted before the kettle boils."
      description="Photograph the school notice or the sports draw, or paste the morning’s inbox chaos. You get back a five-line brief — what matters today, what to pack, who to chase. So nobody leaves without their rugby boots."
      toolPath="/hapai/dawn"
      shareTitle="The Dawn by assembl"
      shareText="Turns the school notice, the sports draw, and tomorrow’s weather into a five-line morning brief. So you stop forgetting the rugby boots."
      posture="Draft operating brief only. It does not send messages, change calendars, or make commitments."
      highlights={proofCards.map(({ icon: Icon, title, body }) => ({
        title,
        body,
        icon: <Icon className="h-5 w-5" aria-hidden />,
      }))}
      aside={
        <>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#b8964f]">free vs connected</p>
          <p className="mt-3 font-display text-4xl font-light leading-none text-[#ffffff]">
            The connected version reads your day for you.
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-relaxed text-[#ffffff]/82">
            <li className="flex gap-3"><CalendarCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Connect your calendar, inbox, and the school portal. It reads them. You don’t have to.</li>
            <li className="flex gap-3"><Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> The free version only drafts — nothing gets sent without you.</li>
            <li className="flex gap-3"><Mic className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Talk into it like a voice note. Live voice is coming.</li>
          </ul>
        </>
      }
    >
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.55fr]">
          <div className="rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-white/84 p-5 shadow-[0_22px_80px_rgba(35,33,31,0.08)] md:p-7">
            <div className="mb-5 flex flex-wrap gap-3">
              <button type="button" onClick={loadFounderSample} className="rounded-full border border-[rgba(58,56,50,0.24)] bg-[#ffffff] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#313c42] hover:bg-white">
                Load founder day
              </button>
              <button type="button" onClick={loadSchoolSample} className="rounded-full border border-[rgba(58,56,50,0.24)] bg-[#ffffff] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#313c42] hover:bg-white">
                Load school bag brief
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Upload a timetable, note, or screenshot</span>
                <div className="relative overflow-hidden rounded-[10px] border border-dashed border-[rgba(58,56,50,0.32)] bg-[#f7f9f8] p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(event.target.files?.[0] ?? null)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Upload an image for the Dawn"
                  />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#313c42] text-[#ffffff]">
                        <Upload className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <p className="font-medium text-[#313c42]">
                          {imageName || "Drop in a school notice, sports draw, whiteboard, or inbox screenshot."}
                        </p>
                        <p className="mt-1 text-sm text-[#6B6661]">
                          It reads the visible text and turns it into actions. If the image is unclear, it won’t guess.
                        </p>
                      </div>
                    </div>
                    {imageDataUrl ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          setImageDataUrl("");
                          setImageName("");
                        }}
                        className="relative z-10 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[rgba(35,33,31,0.16)] bg-white px-4 text-sm text-[#5A5550]"
                      >
                        <X className="h-4 w-4" aria-hidden />
                        Remove
                      </button>
                    ) : null}
                  </div>
                  {imageDataUrl ? (
                    <div className="mt-4 overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageDataUrl} alt="" className="max-h-[260px] w-full object-contain" />
                    </div>
                  ) : null}
                </div>
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">What today feels like</span>
                <input
                  value={today}
                  onChange={(event) => setToday(event.target.value)}
                  className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#f7f9f8] px-3 outline-none focus:border-[#313c42]"
                  placeholder="e.g. Busy founder day. Need to close loose loops before travel."
                />
              </label>
              <Field label="Meetings and deadlines" value={meetings} onChange={setMeetings} placeholder="10am Nick, 2pm supplier call, invoice due Friday..." />
              <Field label="Follow-ups" value={followUps} onChange={setFollowUps} placeholder="supplier price list, customer welcome note, contractor one-pager..." />
              <Field label="Risks or worries" value={worries} onChange={setWorries} placeholder="Anything likely to slip, block, confuse, or need a decision." />
              <Field label="Loose notes" value={notes} onChange={setNotes} placeholder="Paste messy notes, reminders, inbox scraps, Slack snippets, or half-thoughts." />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generateBrief}
                disabled={loading || !hasInput}
                className="inline-flex rounded-full bg-[#313c42] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#313c42] disabled:bg-[#C8C2BC]"
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                {loading ? "Drafting brief..." : "Draft my Dawn"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setToday("");
                  setMeetings("");
                  setFollowUps("");
                  setWorries("");
                  setNotes("");
                  setImageDataUrl("");
                  setImageName("");
                  setHtml("");
                }}
                className="rounded-full border border-[rgba(35,33,31,0.18)] px-6 py-3 text-sm text-[#5A5550] hover:text-[#313c42]"
              >
                Clear
              </button>
              <span className="flex items-center">{gate.counter}</span>
            </div>
            {loading ? <DashAgentLoader label="Dawn" /> : null}
            {loading ? (
              <p className="mt-4 rounded-[10px] border border-[#b8964f]/30 bg-[#f7f9f8] px-4 py-3 text-sm text-[#6B5A28]">
                Turning your day into a clear list: what matters, who to chase, what’s next.
                {dashAd ? (
                  <>
                    {" "}
                    <span aria-hidden>·</span>{" "}
                    <button
                      type="button"
                      onClick={() => clickDashAd(dashAd.impressionId)}
                      title="Sponsored — Assembling"
                      className="underline decoration-dotted underline-offset-2"
                      style={{ color: "#B08423" }}
                    >
                      {dashAd.text}
                    </button>
                  </>
                ) : null}
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-[10px] border border-[#B42828]/25 bg-[#FCEDED] px-4 py-3 text-sm text-[#7A1F1F]">{error}</p>
            ) : null}
          </div>

          <aside className="rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-white/64 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#313c42]">who it's for</p>
            <h2 className="mt-3 font-display text-4xl font-light leading-none">One tool, every kind of morning.</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#5A5550]">
              <li><strong>For founders:</strong> screenshots, inbox scraps, and loose follow-ups become a calm action queue.</li>
              <li><strong>For kids:</strong> a timetable photo can become a pack list, parent checks, and tomorrow reminders.</li>
              <li><strong>For sport:</strong> the connected version checks weather ahead of games and flags gear changes.</li>
              <li><strong>For teams:</strong> calendar, email, and CRM actions stay draft-only until a named person approves.</li>
            </ul>
          </aside>
        </div>

        {html ? (
          <section className="mt-8 rounded-[14px] border border-[rgba(35,33,31,0.08)] bg-white p-8">
            <div className="prose prose-neutral max-w-none [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:text-[#313c42]" dangerouslySetInnerHTML={{ __html: html }} />
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={downloadEvidencePack} className="inline-flex items-center gap-2 rounded-full bg-[#313c42] px-5 py-3 text-sm font-medium text-white hover:bg-[#313c42]">
                <Download className="h-4 w-4" /> Download evidence pack
              </button>
              <button type="button" onClick={copyOutput} className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.18)] px-5 py-3 text-sm text-[#5A5550] hover:text-[#313c42]">
                <Copy className="h-4 w-4" /> Copy to clipboard
              </button>
              <button type="button" onClick={downloadMarkdown} className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.18)] px-5 py-3 text-sm text-[#5A5550] hover:text-[#313c42]">
                <Download className="h-4 w-4" /> Download .md
              </button>
            </div>
          </section>
        ) : null}
        {gate.modal}
    </HapaiToolShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[170px] w-full rounded-[10px] border border-[rgba(35,33,31,0.08)] bg-[#f7f9f8] p-4 text-sm leading-relaxed outline-none focus:border-[#313c42] focus:bg-white"
        placeholder={placeholder}
      />
    </label>
  );
}
