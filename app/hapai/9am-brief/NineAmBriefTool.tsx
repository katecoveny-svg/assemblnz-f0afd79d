"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Download, Sparkles } from "lucide-react";
import { ShareableToolActions } from "@/components/hapai/ShareableToolActions";

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
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateBrief() {
    setError("");
    setHtml("");
    setLoading(true);
    try {
      const response = await fetch("/api/hapai/9am-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ today, meetings, followUps, worries, notes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not draft the brief.");
      setHtml(data.html);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draft the brief.");
    } finally {
      setLoading(false);
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

  const hasInput = `${today}${meetings}${followUps}${worries}${notes}`.trim().length >= 12;

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 text-[#23211F] md:px-12 md:py-16">
      <div className="mx-auto max-w-[1040px]">
        <Link href="/hapai" className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6661] hover:text-[#2B6B57]">
          <ArrowLeft className="h-3.5 w-3.5" /> HAPAI library
        </Link>
        <div className="grid gap-8 lg:grid-cols-[0.92fr_0.58fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#2B6B57]">HAPAI · 9am brief</p>
            <h1 className="mt-3 font-display text-[44px] font-normal italic leading-[0.95] md:text-[68px]">
              What matters today.
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#5A5550]">
              Paste the loose morning signals: meetings, reminders, follow-ups, worries, and scraps. The 9am Brief turns them into priorities, calendar risks, and review-ready actions.
            </p>
            <p className="mt-4 max-w-2xl rounded-[10px] border border-[rgba(212,168,83,0.34)] bg-white/60 px-4 py-3 text-sm leading-relaxed text-[#6B5A28]">
              Draft-only. This public tool does not send messages, change calendars, file records, or make commitments. Use it to decide what to review first.
            </p>
          </div>
          <div className="rounded-[14px] border border-[rgba(35,33,31,0.10)] bg-white/62 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">shareable tool</p>
            <p className="mt-3 text-sm leading-relaxed text-[#5A5550]">
              Send the link to another founder, EA, operator, or team lead. The value is the brief they can copy into their own day.
            </p>
            <div className="mt-5">
              <ShareableToolActions
                title="The 9am Brief by assembl"
                text="Paste the day’s loose signals and leave with priorities, follow-ups, and review-ready actions."
                path="/hapai/9am-brief"
              />
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-5 lg:grid-cols-[0.92fr_0.58fr]">
          <div className="rounded-[14px] border border-[rgba(35,33,31,0.08)] bg-white p-7">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">What today feels like</span>
                <input
                  value={today}
                  onChange={(event) => setToday(event.target.value)}
                  className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] px-3 outline-none focus:border-[#2B6B57]"
                  placeholder="e.g. Busy founder day. Need to close loose loops before travel."
                />
              </label>
              <Field label="Meetings and deadlines" value={meetings} onChange={setMeetings} placeholder="10am Nick, 2pm supplier call, invoice due Friday..." />
              <Field label="Follow-ups" value={followUps} onChange={setFollowUps} placeholder="Dad Pīkau link, Nick one-pager, Praveen dealership email..." />
              <Field label="Risks or worries" value={worries} onChange={setWorries} placeholder="Anything likely to slip, block, confuse, or need a decision." />
              <Field label="Loose notes" value={notes} onChange={setNotes} placeholder="Paste messy notes, reminders, inbox scraps, Slack snippets, or half-thoughts." />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generateBrief}
                disabled={loading || !hasInput}
                className="inline-flex rounded-full bg-[#23211F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2B6B57] disabled:bg-[#C8C2BC]"
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                {loading ? "Drafting brief..." : "Draft my 9am Brief"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setToday("");
                  setMeetings("");
                  setFollowUps("");
                  setWorries("");
                  setNotes("");
                  setHtml("");
                }}
                className="rounded-full border border-[rgba(35,33,31,0.18)] px-6 py-3 text-sm text-[#5A5550] hover:text-[#23211F]"
              >
                Clear
              </button>
            </div>
            {loading ? (
              <p className="mt-4 rounded-[10px] border border-[#D4A853]/30 bg-[#FFF9EC] px-4 py-3 text-sm italic text-[#6B5A28]">
                The specialist is turning the day into priorities, follow-ups, and review-ready next steps.
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-[10px] border border-[#B42828]/25 bg-[#FCEDED] px-4 py-3 text-sm text-[#7A1F1F]">{error}</p>
            ) : null}
          </div>

          <aside className="rounded-[14px] border border-[rgba(35,33,31,0.08)] bg-white/64 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2B6B57]">what it can become</p>
            <h2 className="mt-3 font-display text-4xl font-light italic leading-none">A proper action desk.</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#5A5550]">
              <li>Connect calendar, email, and CRM in a private Industry Pack setup.</li>
              <li>Draft follow-up emails and agenda notes for named human review.</li>
              <li>Flag calendar prep gaps before the meeting starts.</li>
              <li>Show what changed overnight from live regulatory and business feeds.</li>
            </ul>
          </aside>
        </section>

        {html ? (
          <section className="mt-8 rounded-[14px] border border-[rgba(35,33,31,0.08)] bg-white p-8">
            <div className="prose prose-neutral max-w-none [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:text-[#2B6B57]" dangerouslySetInnerHTML={{ __html: html }} />
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={copyOutput} className="inline-flex items-center gap-2 rounded-full bg-[#23211F] px-5 py-3 text-sm font-medium text-white hover:bg-[#2B6B57]">
                <Copy className="h-4 w-4" /> Copy markdown
              </button>
              <button type="button" onClick={downloadMarkdown} className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.18)] px-5 py-3 text-sm text-[#5A5550] hover:text-[#23211F]">
                <Download className="h-4 w-4" /> Download .md
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
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
        className="min-h-[170px] w-full rounded-[10px] border border-[rgba(35,33,31,0.08)] bg-[#F7F4EE] p-4 text-sm leading-relaxed outline-none focus:border-[#2B6B57] focus:bg-white"
        placeholder={placeholder}
      />
    </label>
  );
}
