"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileCheck2,
  Mic,
  Square,
  Trash2,
  Upload,
} from "lucide-react";
import { HUI_TEMPLATES, DEFAULT_HUI_TEMPLATE_ID } from "@/lib/hui/templates";

type CaptureMode = "record" | "upload" | "paste";

const FREE_RUN_KEY = "hui_free_run_used";
const UNLOCKED_KEY = "hui_unlocked";

export default function HuiStudio() {
  const [consent, setConsent] = useState(false);
  const [templateId, setTemplateId] = useState(DEFAULT_HUI_TEMPLATE_ID);
  const [mode, setMode] = useState<CaptureMode>("paste");
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState("");
  const [transcript, setTranscript] = useState("");

  const [transcribeConfigured, setTranscribeConfigured] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const [loading, setLoading] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [error, setError] = useState("");
  const [html, setHtml] = useState("");
  const [downloading, setDownloading] = useState(false);

  const [unlocked, setUnlocked] = useState(false);
  const [freeRunUsed, setFreeRunUsed] = useState(false);
  const [gateEmail, setGateEmail] = useState("");
  const [showGate, setShowGate] = useState(false);

  const template = useMemo(
    () => HUI_TEMPLATES.find((t) => t.id === templateId) ?? HUI_TEMPLATES[0],
    [templateId],
  );

  useEffect(() => {
    fetch("/api/hui/transcribe")
      .then((r) => r.json())
      .then((d) => setTranscribeConfigured(Boolean(d?.configured)))
      .catch(() => setTranscribeConfigured(false));
    try {
      setUnlocked(localStorage.getItem(UNLOCKED_KEY) === "true");
      setFreeRunUsed(localStorage.getItem(FREE_RUN_KEY) === "true");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = window.setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [seconds]);

  async function transcribeBlob(blob: Blob) {
    setBusyLabel("Transcribing audio…");
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("audio", blob, "meeting.webm");
      form.append("language", "en-NZ");
      const res = await fetch("/api/hui/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Transcription unavailable.");
      setTranscript((prev) => `${prev}${prev ? "\n" : ""}${data.transcript}`.trim());
      setMode("paste");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription unavailable.");
    } finally {
      setLoading(false);
      setBusyLabel("");
    }
  }

  async function toggleRecording() {
    if (recording) {
      mediaRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        void transcribeBlob(blob);
      };
      mediaRef.current = recorder;
      setSeconds(0);
      recorder.start();
      setRecording(true);
    } catch {
      setError("Microphone access was blocked. Allow it, or upload a file / paste a transcript.");
    }
  }

  function handleAudioUpload(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("audio/") && !/\.(mp3|m4a|wav|mp4|webm|ogg)$/i.test(file.name)) {
      setError("Upload an audio file (MP3, M4A, WAV, MP4).");
      return;
    }
    void transcribeBlob(file);
  }

  async function generate() {
    if (!consent) {
      setError("Confirm everyone in the meeting was told it is being recorded before you continue.");
      return;
    }
    if (transcript.trim().length < 12) {
      setError("Add a transcript, recording, or pasted notes first.");
      return;
    }
    if (freeRunUsed && !unlocked) {
      setShowGate(true);
      return;
    }
    setError("");
    setLoading(true);
    setBusyLabel("Structuring the meeting record…");
    setHtml("");
    try {
      const res = await fetch("/api/hui/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, templateId, title, attendees }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate the record.");
      setHtml(data.html);
      try {
        localStorage.setItem(FREE_RUN_KEY, "true");
      } catch {
        /* ignore */
      }
      setFreeRunUsed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate the record.");
    } finally {
      setLoading(false);
      setBusyLabel("");
    }
  }

  async function unlockWithEmail() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(gateEmail)) {
      setError("Enter a valid email to keep going.");
      return;
    }
    try {
      const res = await fetch("/api/hui/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: gateEmail, source: "hui-landing" }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Could not unlock.");
      }
      try {
        localStorage.setItem(UNLOCKED_KEY, "true");
      } catch {
        /* ignore */
      }
      setUnlocked(true);
      setShowGate(false);
      setError("");
      void generate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unlock.");
    }
  }

  async function downloadEvidencePack() {
    setDownloading(true);
    setError("");
    try {
      const res = await fetch("/api/hui/evidence-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, templateId, title, attendees }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Could not build the evidence pack.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assembl-evidence-pack-${(title || "hui-meeting").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build the evidence pack.");
    } finally {
      setDownloading(false);
    }
  }

  function deleteEverything() {
    setTitle("");
    setAttendees("");
    setTranscript("");
    setHtml("");
    setError("");
    setSeconds(0);
    chunksRef.current = [];
  }

  const recordDisabled = transcribeConfigured === false;

  return (
    <div className="rounded-[14px] border border-[rgba(35,33,31,0.10)] bg-white/90 p-5 shadow-[0_24px_90px_rgba(35,33,31,0.08)] md:p-8">
      {/* Consent gate */}
      <div className="rounded-[10px] border border-[#313c42]/25 bg-[#f3f5f3] p-4">
        <label className="flex items-start gap-3 text-sm leading-relaxed text-[#313c42]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#313c42]"
          />
          <span>
            <strong>Recording consent.</strong> I confirm everyone in this meeting has been told it is being
            recorded, in line with the Privacy Act 2020 (IPP 3 &amp; 3A). Hui transcribes audio and then
            discards it — we never store your recording. Your transcript and notes stay in this browser until
            you clear them.
          </span>
        </label>
      </div>

      {/* Template picker */}
      <div className="mt-6">
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">Meeting output</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {HUI_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplateId(t.id)}
              className={`rounded-[10px] border p-4 text-left transition ${
                t.id === templateId
                  ? "border-[#313c42] bg-[#f3f5f3] shadow-[0_8px_24px_rgba(58,56,50,0.10)]"
                  : "border-[rgba(35,33,31,0.12)] bg-white hover:border-[#313c42]/50"
              }`}
            >
              <p className="text-sm font-medium text-[#313c42]">{t.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#5A5550]">{t.blurb}</p>
              <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.14em] text-[#313c42]">{t.framework}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Title + attendees */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">Meeting title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Friday site toolbox talk"
            className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#f7f9f8] px-3 outline-none focus:border-[#313c42]"
          />
        </label>
        <label>
          <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">Attendees</span>
          <input
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder="Names, comma separated"
            className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#f7f9f8] px-3 outline-none focus:border-[#313c42]"
          />
        </label>
      </div>

      {/* Capture mode tabs */}
      <div className="mt-6 flex border-b border-[rgba(35,33,31,0.12)]">
        {(["paste", "upload", "record"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={`-mb-px px-4 py-3 text-sm font-medium ${
              mode === tab ? "border-b-2 border-[#313c42] text-[#313c42]" : "text-[#6B6661]"
            }`}
          >
            {tab === "paste" ? "Paste transcript" : tab === "upload" ? "Upload audio" : "Record"}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {mode === "paste" && (
          <label className="block">
            <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">
              Transcript or rough notes
            </span>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[220px] w-full rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-[#f7f9f8] p-4 leading-relaxed outline-none focus:border-[#313c42] focus:bg-white"
              placeholder="Paste a meeting transcript, or rough notes: decisions, names, follow-ups, times."
            />
          </label>
        )}

        {mode === "upload" && (
          <div className="rounded-[10px] border border-dashed border-[#313c42]/40 bg-[#f7f9f8] p-6 text-center">
            {recordDisabled ? (
              <p className="text-sm leading-relaxed text-[#5A5550]">
                Audio transcription is coming online shortly. For now, paste a transcript and Hui will structure
                it into the same evidence pack.
              </p>
            ) : (
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#313c42] px-5 py-3 text-sm font-medium text-white hover:bg-[#313c42]">
                <Upload className="h-4 w-4" /> Choose audio file
                <input
                  type="file"
                  accept="audio/*,.mp3,.m4a,.wav,.mp4"
                  className="sr-only"
                  onChange={(e) => handleAudioUpload(e.target.files?.[0])}
                />
              </label>
            )}
            <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.14em] text-[#6B6661]">MP3 · M4A · WAV · MP4 · up to 40MB</p>
          </div>
        )}

        {mode === "record" && (
          <div className="rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-[#f7f9f8] p-6">
            {recordDisabled ? (
              <p className="text-sm leading-relaxed text-[#5A5550]">
                In-browser recording with transcription is coming online shortly. For now, paste a transcript
                and Hui will structure it into the same evidence pack.
              </p>
            ) : (
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={toggleRecording}
                  aria-label={recording ? "Stop recording" : "Start recording"}
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition ${
                    recording ? "bg-[#B42828]" : "bg-[#313c42] hover:bg-[#313c42]"
                  }`}
                >
                  {recording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </button>
                <div className="text-sm text-[#5A5550]">
                  <p>
                    <strong className="text-[#313c42]">{recording ? "Recording…" : "Ready"}</strong>
                  </p>
                  <p className="font-mono text-[12px] tracking-[0.12em]">{formattedTime}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={generate}
          disabled={loading || !consent}
          className="rounded-full bg-[#313c42] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#313c42] disabled:cursor-not-allowed disabled:bg-[#C8C2BC]"
        >
          {loading ? busyLabel || "Working…" : "Generate meeting record"}
        </button>
        <button
          type="button"
          onClick={deleteEverything}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.18)] px-5 py-3 text-sm text-[#5A5550] hover:text-[#B42828]"
        >
          <Trash2 className="h-4 w-4" /> Delete everything
        </button>
        {!unlocked && (
          <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-[#6B6661]">
            {freeRunUsed ? "Free run used — add your email to keep going" : "1 free run, no sign-up"}
          </span>
        )}
      </div>

      {loading && busyLabel && (
        <p className="mt-4 rounded-[10px] border border-[#b8964f]/30 bg-[#f7f9f8] px-4 py-3 text-sm text-[#6B5A28]">{busyLabel}</p>
      )}
      {error && (
        <p className="mt-4 rounded-[10px] border border-[#B42828]/25 bg-[#FCEDED] px-4 py-3 text-sm text-[#7A1F1F]">{error}</p>
      )}

      {/* Email gate */}
      {showGate && !unlocked && (
        <div className="mt-5 rounded-[10px] border border-[#313c42]/30 bg-[#f3f5f3] p-5">
          <p className="text-sm font-medium text-[#313c42]">Add your email to keep using Hui</p>
          <p className="mt-1 text-sm leading-relaxed text-[#5A5550]">
            Your first run is on us. Drop an email to keep generating records and evidence packs.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              type="email"
              value={gateEmail}
              onChange={(e) => setGateEmail(e.target.value)}
              placeholder="you@organisation.co.nz"
              className="h-11 flex-1 rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white px-3 outline-none focus:border-[#313c42]"
            />
            <button
              type="button"
              onClick={unlockWithEmail}
              className="rounded-full bg-[#313c42] px-6 py-3 text-sm font-medium text-white hover:bg-[#313c42]"
            >
              Open Hui
            </button>
          </div>
        </div>
      )}

      {/* Output */}
      {html && (
        <section className="mt-6 rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-white p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f5f3] px-3 py-1 font-mono text-[12px] uppercase tracking-[0.16em] text-[#313c42]">
              <CheckCircle2 className="h-3.5 w-3.5" /> {template.label}
            </span>
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#6B6661]">{template.framework}</span>
          </div>
          <div
            className="prose prose-neutral max-w-none [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:text-[#313c42] [&_h2:first-child]:mt-0"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div className="mt-6 flex flex-wrap gap-3 border-t border-[rgba(35,33,31,0.08)] pt-6">
            <button
              type="button"
              onClick={downloadEvidencePack}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-full bg-[#313c42] px-5 py-3 text-sm font-medium text-white hover:bg-[#313c42] disabled:bg-[#C8C2BC]"
            >
              <Download className="h-4 w-4" /> {downloading ? "Building evidence pack…" : "Download evidence pack (PDF)"}
            </button>
            <span className="inline-flex items-center gap-2 text-xs leading-relaxed text-[#6B6661]">
              <FileCheck2 className="h-4 w-4 text-[#313c42]" />
              Draft record. Each pack carries a Mana Receipt hash — verifiable once a named reviewer seals it.
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
