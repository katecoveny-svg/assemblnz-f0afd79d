"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Download, Mic, Square } from "lucide-react";

type RecognitionResult = {
  isFinal: boolean;
  [index: number]: { transcript: string };
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: RecognitionResult[] }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

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

export default function MeetingNotesPage() {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [mode, setMode] = useState<"record" | "paste">("record");
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [rawNotes, setRawNotes] = useState("");
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setSupported(false);
      return undefined;
    }
    const recognition = new Recognition();
    recognition.lang = "en-NZ";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      if (finalText) setTranscript((value) => `${value}${value ? " " : ""}${finalText.trim()}`);
      setInterim(interimText.trim());
    };
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  const activeRaw = mode === "record" ? `${transcript} ${interim}`.trim() : rawNotes.trim();
  const formattedTime = useMemo(() => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }, [seconds]);

  function toggleRecording() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (recording) recognition.stop();
    else {
      setSeconds((value) => value || 0);
      recognition.start();
      setRecording(true);
    }
  }

  async function polish() {
    setError("");
    setLoading(true);
    setHtml("");
    try {
      const response = await fetch("/api/hapai/polish-meeting-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw: activeRaw, title, attendees }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not polish the notes.");
      setHtml(data.html);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not polish the notes.");
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
    anchor.download = `${(title || "meeting-notes").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 text-[#23211F] md:px-12 md:py-16">
      <div className="mx-auto max-w-[920px]">
        <Link href="/hapai" className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6661] hover:text-[#2B6B57]">
          <ArrowLeft className="h-3.5 w-3.5" /> HAPAI library
        </Link>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#6B6661]">HAPAI · meeting recorder</p>
        <h1 className="mt-3 font-display text-[38px] font-normal leading-tight md:text-[52px]">Record the meeting. Leave with the record.</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#5A5550]">
          Record live or paste rough notes. Get a structured draft with summary, decisions, action items, discussion, and next steps.
        </p>
        <p className="mt-3 max-w-2xl rounded-[10px] border border-[rgba(212,168,83,0.34)] bg-white/60 px-4 py-3 text-sm leading-relaxed text-[#6B5A28]">
          Draft-only. Live recording uses your browser&apos;s speech recognition, and polishing sends the transcript for structuring. Do not record private, employment, health, legal, or commercially sensitive meetings without consent and the right private setup.
        </p>

        <section className="mt-8 rounded-[14px] border border-[rgba(35,33,31,0.08)] bg-white p-7">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Meeting title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] px-3 outline-none focus:border-[#2B6B57]" placeholder="e.g. Project stand-up" />
            </label>
            <label>
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Attendees</span>
              <input value={attendees} onChange={(event) => setAttendees(event.target.value)} className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] px-3 outline-none focus:border-[#2B6B57]" placeholder="Names, comma separated" />
            </label>
          </div>

          <div className="mt-6 flex border-b border-[rgba(35,33,31,0.12)]">
            {(["record", "paste"] as const).map((tab) => (
              <button key={tab} type="button" onClick={() => setMode(tab)} className={`-mb-px px-5 py-3 text-sm font-medium ${mode === tab ? "border-b-2 border-[#2B6B57] text-[#2B6B57]" : "text-[#6B6661]"}`}>
                {tab === "record" ? "Record live" : "Tidy raw notes"}
              </button>
            ))}
          </div>

          {mode === "record" ? (
            <div className="mt-6">
              <div className="flex items-center gap-5">
                <button type="button" onClick={toggleRecording} disabled={!supported} className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition ${recording ? "bg-[#B42828]" : "bg-[#2B6B57] hover:bg-[#23211F]"} disabled:bg-[#C8C2BC]`}>
                  {recording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </button>
                <div className="text-sm text-[#5A5550]">
                  <p><strong className="text-[#23211F]">{recording ? "Recording" : supported ? "Ready" : "Browser unsupported"}</strong></p>
                  <p className="font-mono text-[12px] tracking-[0.12em]">{formattedTime}</p>
                </div>
              </div>
              <div className="mt-5 min-h-[220px] rounded-[10px] border border-[rgba(35,33,31,0.08)] bg-[#F7F4EE] p-4 text-sm leading-relaxed">
                {transcript || interim ? (
                  <p>{transcript} <span className="text-[#8E867D]">{interim}</span></p>
                ) : (
                  <p className="italic text-[#9A938C]">Live transcript will appear here once you start recording. Chrome works best.</p>
                )}
              </div>
            </div>
          ) : (
            <label className="mt-6 block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Raw notes</span>
              <textarea value={rawNotes} onChange={(event) => setRawNotes(event.target.value)} className="min-h-[260px] w-full rounded-[10px] border border-[rgba(35,33,31,0.08)] bg-[#F7F4EE] p-4 leading-relaxed outline-none focus:border-[#2B6B57] focus:bg-white" placeholder="Paste rough notes, transcript fragments, decisions, names, and follow-ups." />
            </label>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={polish} disabled={loading || activeRaw.length < 8} className="rounded-full bg-[#23211F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2B6B57] disabled:bg-[#C8C2BC]">
              {loading ? "Structuring notes..." : "Turn into EA record"}
            </button>
            <button type="button" onClick={() => { setTranscript(""); setRawNotes(""); setInterim(""); setSeconds(0); setHtml(""); }} className="rounded-full border border-[rgba(35,33,31,0.18)] px-6 py-3 text-sm text-[#5A5550] hover:text-[#23211F]">
              Clear
            </button>
          </div>
          {loading && <p className="mt-4 rounded-[10px] border border-[#D4A853]/30 bg-[#FFF9EC] px-4 py-3 text-sm italic text-[#6B5A28]">The specialist is turning the rough record into decisions, owners, follow-ups, and calendar-ready next steps.</p>}
          {error && <p className="mt-4 rounded-[10px] border border-[#B42828]/25 bg-[#FCEDED] px-4 py-3 text-sm text-[#7A1F1F]">{error}</p>}
        </section>

        {html && (
          <section className="mt-8 rounded-[14px] border border-[rgba(35,33,31,0.08)] bg-white p-8">
            <div className="prose prose-neutral max-w-none [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:text-[#2B6B57]" dangerouslySetInnerHTML={{ __html: html }} />
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={copyOutput} className="inline-flex items-center gap-2 rounded-full bg-[#23211F] px-5 py-3 text-sm font-medium text-white hover:bg-[#2B6B57]"><Copy className="h-4 w-4" /> Copy markdown</button>
              <button type="button" onClick={downloadMarkdown} className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.18)] px-5 py-3 text-sm text-[#5A5550] hover:text-[#23211F]"><Download className="h-4 w-4" /> Download .md</button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
