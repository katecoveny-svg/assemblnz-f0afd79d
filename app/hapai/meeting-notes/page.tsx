"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarCheck, Camera, Copy, Download, FileCheck2, MailCheck, Mic, Square, Upload } from "lucide-react";
import { HapaiToolShell } from "@/components/hapai/HapaiToolShell";

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
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
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
  const hasInput = activeRaw.length >= 8 || Boolean(imageDataUrl);
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
        body: JSON.stringify({ raw: activeRaw, title, attendees, imageDataUrl }),
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

  function handleImageUpload(file?: File | null) {
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
      setError("");
    };
    reader.onerror = () => setError("Could not read that image. Try a clearer screenshot.");
    reader.readAsDataURL(file);
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
    <HapaiToolShell
      kicker="HAPAI · meeting recorder"
      title="Record once. Leave with action."
      description="A proper EA desk for the meeting: capture live speech or paste rough notes, then turn them into decisions, owners, follow-ups, next steps, and a fileable record."
      toolPath="/hapai/meeting-recorder"
      shareTitle="Meeting recorder by assembl"
      shareText="Record or paste rough meeting notes, then turn them into a draft record with decisions, owners, and next steps."
      posture="Draft meeting record only. Get consent before recording, and review before sharing or filing. The public version is not for private, employment, health, legal, or commercially sensitive meetings."
      highlights={[
        { title: "capture", body: "record live speech or paste rough notes", icon: <Mic className="h-5 w-5" aria-hidden /> },
        { title: "actions", body: "decisions, owners, next steps, and follow-ups", icon: <CalendarCheck className="h-5 w-5" aria-hidden /> },
        { title: "record", body: "copy or download a fileable draft", icon: <FileCheck2 className="h-5 w-5" aria-hidden /> },
      ]}
      aside={
        <>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#D9A85A]">what the private version becomes</p>
          <h2 className="mt-4 font-display text-4xl font-light leading-none text-[#FAF7F2]">
            The best EA in the room.
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-[#FAF7F2]/82">
            <li><strong className="text-[#FAF7F2]">Now:</strong> browser speech capture, transcript tidy-up, decisions, actions, owners, copy and download.</li>
            <li><strong className="text-[#FAF7F2]">Next:</strong> calendar holds, follow-up drafts, CRM notes, agenda prep, and reminders queued for named human approval.</li>
            <li><strong className="text-[#FAF7F2]">Rule:</strong> no email, invite, record, or external update is sent quietly.</li>
          </ul>
          <div className="mt-6 flex items-start gap-3 rounded-[8px] border border-[#FAF7F2]/18 bg-[#FAF7F2]/10 p-4 text-sm leading-relaxed">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#D9A85A]" aria-hidden />
            <p>Private setup turns the output into draft emails, calendar nudges, and follow-up notes for named approval.</p>
          </div>
        </>
      }
    >
        <section className="rounded-[8px] bg-white/86 p-5 md:p-7">
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

          <section className="mt-6 rounded-[18px] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.78),rgba(250,247,242,0.62))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_18px_48px_rgba(35,33,31,0.06)]">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#2B6B57]">
                  Photo, whiteboard, or agenda
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#5A5550]">
                  Add a whiteboard photo, agenda screenshot, sticky-note wall, or meeting-room board.
                  The recorder combines visible text with speech or pasted notes.
                </p>
              </div>
              <label className="inline-flex h-10 cursor-pointer items-center rounded-full border border-white/70 bg-white/58 px-4 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_12px_30px_rgba(35,33,31,0.06)] transition hover:-translate-y-0.5 hover:bg-white/78">
                <Upload className="mr-2 h-4 w-4 text-[#2B6B57]" aria-hidden />
                Add photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(event) => handleImageUpload(event.target.files?.[0])}
                />
              </label>
            </div>
            {imageDataUrl ? (
              <div className="mt-4 grid gap-3 rounded-[14px] border border-[rgba(35,33,31,0.10)] bg-white/64 p-3 md:grid-cols-[112px_1fr]">
                <Image
                  src={imageDataUrl}
                  alt={`Uploaded meeting image preview: ${imageName || "meeting photo"}`}
                  width={224}
                  height={224}
                  unoptimized
                  className="h-28 w-full rounded-[10px] object-cover md:w-28"
                />
                <div className="flex flex-col justify-center">
                  <p className="flex items-center text-sm font-medium text-[#23211F]">
                    <Camera className="mr-2 h-4 w-4 text-[#2B6B57]" aria-hidden />
                    {imageName || "Meeting photo ready"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#5A5550]">
                    This will be read alongside the transcript or rough notes.
                  </p>
                </div>
              </div>
            ) : null}
          </section>

          {mode === "record" ? (
            <div className="mt-6">
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={!supported}
                  aria-label={recording ? "Stop recording" : "Start recording"}
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition ${recording ? "bg-[#B42828]" : "bg-[#2B6B57] hover:bg-[#23211F]"} disabled:bg-[#C8C2BC]`}
                >
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
                  <p className="text-[#5A5550]">Live transcript will appear here once you start recording. Chrome works best.</p>
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
            <button type="button" onClick={polish} disabled={loading || !hasInput} className="rounded-full bg-[#23211F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2B6B57] disabled:bg-[#C8C2BC]">
              {loading ? "Structuring notes..." : "Turn into EA record"}
            </button>
            <button type="button" onClick={() => { setTranscript(""); setRawNotes(""); setInterim(""); setSeconds(0); setImageDataUrl(""); setImageName(""); setHtml(""); }} className="rounded-full border border-[rgba(35,33,31,0.18)] px-6 py-3 text-sm text-[#5A5550] hover:text-[#23211F]">
              Clear
            </button>
          </div>
          {loading && <p className="mt-4 rounded-[10px] border border-[#D4A853]/30 bg-[#FFF9EC] px-4 py-3 text-sm text-[#6B5A28]">Turning the rough record into decisions, owners, follow-ups, and clear next steps.</p>}
          {error && <p className="mt-4 rounded-[10px] border border-[#B42828]/25 bg-[#FCEDED] px-4 py-3 text-sm text-[#7A1F1F]">{error}</p>}
        </section>

        {html && (
          <section className="mt-5 rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-white p-8 shadow-[0_24px_90px_rgba(35,33,31,0.08)]">
            <div className="prose prose-neutral max-w-none [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:text-[#2B6B57]" dangerouslySetInnerHTML={{ __html: html }} />
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={copyOutput} className="inline-flex items-center gap-2 rounded-full bg-[#23211F] px-5 py-3 text-sm font-medium text-white hover:bg-[#2B6B57]"><Copy className="h-4 w-4" /> Copy markdown</button>
              <button type="button" onClick={downloadMarkdown} className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.18)] px-5 py-3 text-sm text-[#5A5550] hover:text-[#23211F]"><Download className="h-4 w-4" /> Download .md</button>
            </div>
          </section>
        )}
    </HapaiToolShell>
  );
}
