'use client';

/**
 * Public chat with a shared community agent (/a/[slug]).
 *
 * Mirrors the saved-Pilot chat (app/agents/mine/[id]/MyAgentChat.tsx): the
 * system prompt never travels through here — /api/a/[slug]/chat resolves it
 * server-side from the shared row.
 *
 * Gating: a thin custom fetch on the transport watches for the 402 the gate
 * returns. On capture:true the shared CaptureModal opens (surface
 * 'agent:<slug>'); the blocked message is restored into the input so the
 * visitor can resend once their email lifts the limit. (useToolGate is not
 * used here — it hardcodes the 'hapai:' surface and can't replay streams.)
 */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight, CalendarPlus, ImagePlus, Loader2, Mic, Volume2, VolumeX, X } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { CaptureModal } from '@/components/gating/CaptureModal';
import { buildIcs, extractIcsEvents, type IcsEvent } from '@/lib/community/ics';

// Meeting capture (record / upload audio) only exists for chief-of-staff
// agents — dynamic import so other agents never load the recorder code.
const MeetingCapture = dynamic(
  () => import('./MeetingCapture').then((m) => m.MeetingCapture),
  { ssr: false },
);

const INK = '#313c42';
const MUTED = '#68766f';
const TEAL = '#3f7373';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_PHOTOS = 2;

interface PendingPhoto {
  url: string; // data URL
  mediaType: string;
}

// ---------------------------------------------------------------------------
// Voice in/out — mirrors the Genome Desk (components/living-site/GenomeDesk.tsx):
// SpeechRecognition (webkit-prefixed where needed) for quick voice input into
// the message field, speechSynthesis for spoken replies. Both feature-detected;
// unsupported browsers simply never see the controls. Distinct from the
// chief-of-staff meeting recorder (MediaRecorder → server transcription).
// ---------------------------------------------------------------------------

type Recognition = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function recognitionConstructor(): (new () => Recognition) | null {
  if (typeof window === 'undefined') return null;
  const speechWindow = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function cancelSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/** Speak a completed reply — markdown and emoji stripped, en-NZ voice first. */
function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const clean = text
    .replace(/[#*_>`~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return;
  const utterance = new SpeechSynthesisUtterance(clean.slice(0, 900));
  const voices = window.speechSynthesis.getVoices();
  utterance.voice =
    voices.find((voice) => voice.lang === 'en-NZ') ??
    voices.find((voice) => voice.lang === 'en-AU') ??
    voices.find((voice) => voice.lang.startsWith('en')) ??
    null;
  utterance.rate = 1.02;
  window.speechSynthesis.speak(utterance);
}

/** Download validated calendar events as a hand-rolled .ics file. */
function downloadIcs(events: IcsEvent[]) {
  const blob = new Blob([buildIcs(events)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'family-week.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function CommunityAgentChat({
  slug,
  name,
  templateId,
}: {
  slug: string;
  name: string;
  /** Community template the agent grew from — gates per-template UI. */
  templateId?: string | null;
}) {
  const [input, setInput] = useState('');
  const [captureOpen, setCaptureOpen] = useState(false);
  const [gateNote, setGateNote] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const lastSent = useRef('');
  const lastPhotos = useRef<PendingPhoto[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const micBase = useRef('');
  const lastSpokenId = useRef<string | null>(null);
  const micSupported = useSyncExternalStore(
    () => () => {},
    () => recognitionConstructor() !== null,
    () => false,
  );
  const voiceSupported = useSyncExternalStore(
    () => () => {},
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
    () => false,
  );

  // One stable transport; its fetch reads state via setters and a ref, so it
  // stays current without re-creating the chat.
  const [transport] = useState(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: `/api/a/${slug}/chat`,
        fetch: (async (info: RequestInfo | URL, init?: RequestInit) => {
          const res = await fetch(info, init);
          if (res.status === 402) {
            const data = (await res
              .clone()
              .json()
              .catch(() => null)) as { capture?: boolean; message?: string } | null;
            if (data?.capture) {
              setCaptureOpen(true);
            } else if (data?.message) {
              setGateNote(data.message);
            }
            // Put the blocked message (and its photos) back so one click resends it.
            setInput((v) => v || lastSent.current);
            setPhotos((p) => (p.length ? p : lastPhotos.current));
          }
          return res;
        }) as typeof fetch,
      }),
  );

  const greeting: UIMessage = {
    id: 'greeting',
    role: 'assistant',
    parts: [{ type: 'text', text: `Hi — I’m ${name}. Tell me the job in front of you and I’ll prepare a draft.` }],
  };
  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: [greeting],
  });
  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const textOf = (m: UIMessage) =>
    m.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('');

  const imagesOf = (m: UIMessage) =>
    m.parts.filter(
      (p): p is { type: 'file'; mediaType: string; url: string } =>
        p.type === 'file' &&
        typeof p.url === 'string' &&
        p.url.startsWith('data:image/'),
    );

  // Spoken replies: once a reply COMPLETES (never token-by-token), read it out
  // — ics-events blocks stripped along with markdown/emoji inside speak().
  useEffect(() => {
    if (!voiceReplies || status !== 'ready') return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant' || last.id === 'greeting') return;
    if (lastSpokenId.current === last.id) return;
    lastSpokenId.current = last.id;
    speak(extractIcsEvents(textOf(last)).text);
  }, [voiceReplies, status, messages]);

  // Unmount: stop any speech and any open recognition session.
  useEffect(() => {
    return () => {
      cancelSpeech();
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const RecognitionConstructor = recognitionConstructor();
    if (!RecognitionConstructor) return;
    cancelSpeech();
    const next = new RecognitionConstructor();
    next.lang = 'en-NZ';
    next.interimResults = true;
    micBase.current = input.trim();
    next.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result?.[0]?.transcript ?? '';
      // Interim results land straight in the input field; the visitor sends.
      setInput(micBase.current ? `${micBase.current} ${transcript}` : transcript);
    };
    next.onend = () => setListening(false);
    next.onerror = () => setListening(false);
    recognitionRef.current = next;
    setListening(true);
    next.start();
  };

  const toggleVoiceReplies = () => {
    cancelSpeech();
    // Only replies that complete from now on are spoken — never the history.
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    lastSpokenId.current = lastAssistant?.id ?? null;
    setVoiceReplies((v) => !v);
  };

  const addPhoto = (file: File | undefined) => {
    setPhotoNote(null);
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return;
    if (file.size > MAX_PHOTO_BYTES) {
      // approved line, shared with the fridge-to-list tool
      setPhotoNote('Please upload an image under 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : '';
      if (!url.startsWith('data:image/')) return;
      setPhotos((p) => (p.length >= MAX_PHOTOS ? p : [...p, { url, mediaType: file.type }]));
    };
    reader.readAsDataURL(file);
  };

  const submit = (t: string) => {
    const v = t.trim();
    if ((!v && photos.length === 0) || busy) return;
    // New input interrupts any spoken reply and any open mic session.
    cancelSpeech();
    if (listening) recognitionRef.current?.stop();
    lastSent.current = v;
    lastPhotos.current = photos;
    setGateNote(null);
    setPhotoNote(null);
    sendMessage({
      text: v,
      files: photos.map((p) => ({ type: 'file' as const, mediaType: p.mediaType, url: p.url })),
    });
    setInput('');
    setPhotos([]);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 440,
          borderRadius: 22,
          border: `1px solid ${HAIRLINE}`,
          background: '#fbfaf6',
          overflow: 'hidden',
        }}
      >
        <div
          ref={scrollRef}
          style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: 18 }}
        >
          {messages.map((m) => {
            const isUser = m.role === 'user';
            // Assistant replies may carry a fenced ics-events block (family
            // admin calendar contract) — never shown raw; it becomes the
            // save-to-calendar action instead.
            const { text, events } = isUser
              ? { text: textOf(m), events: [] as IcsEvent[] }
              : extractIcsEvents(textOf(m));
            const images = imagesOf(m);
            if (!text && images.length === 0 && events.length === 0) return null;
            return (
              <div
                key={m.id}
                style={{
                  maxWidth: '85%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  padding: '10px 16px',
                  borderRadius: 18,
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  ...(isUser
                    ? { background: TEAL, color: '#fff' }
                    : { background: '#fff', color: INK, border: `1px solid ${HAIRLINE}` }),
                }}
              >
                {images.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: text ? 8 : 0 }}>
                    {images.map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={img.url}
                        alt="Photo attached"
                        style={{ maxWidth: 140, maxHeight: 140, borderRadius: 10, display: 'block', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                )}
                {text}
                {events.length > 0 && (
                  <div style={{ marginTop: text ? 10 : 0 }}>
                    <button
                      type="button"
                      onClick={() => downloadIcs(events)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 999,
                        border: `1px solid ${HAIRLINE}`,
                        background: '#fbfaf6',
                        color: INK,
                        fontSize: 13,
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      <CalendarPlus size={14} />
                      Save to calendar (.ics)
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {busy && (
            <div
              style={{
                alignSelf: 'flex-start',
                padding: '10px 16px',
                borderRadius: 18,
                border: `1px solid ${HAIRLINE}`,
                background: '#fff',
              }}
            >
              <Loader2 size={16} style={{ color: '#b8964f', animation: 'spin 1s linear infinite' }} />
            </div>
          )}
          {gateNote && (
            <p style={{ alignSelf: 'flex-start', margin: 0, color: MUTED, fontSize: 13 }}>{gateNote}</p>
          )}
          {error && !gateNote && !captureOpen && (
            <p style={{ alignSelf: 'flex-start', margin: 0, color: '#8a4b3c', fontSize: 13 }}>
              Something went wrong — try that again.
            </p>
          )}
        </div>
        {(photos.length > 0 || photoNote) && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px 0',
              borderTop: `1px solid ${HAIRLINE}`,
            }}
          >
            {photos.map((p, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt="Photo attached"
                  style={{
                    width: 52,
                    height: 52,
                    objectFit: 'cover',
                    borderRadius: 10,
                    border: `1px solid ${HAIRLINE}`,
                    display: 'block',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove photo"
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    display: 'flex',
                    width: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 999,
                    border: `1px solid ${HAIRLINE}`,
                    background: '#fff',
                    color: INK,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            {photoNote && (
              <p role="alert" style={{ margin: 0, color: '#8a4b3c', fontSize: 12 }}>
                {photoNote}
              </p>
            )}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            padding: 14,
            borderTop: photos.length > 0 || photoNote ? 'none' : `1px solid ${HAIRLINE}`,
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              addPhoto(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy || photos.length >= MAX_PHOTOS}
            // approved by Kate 2026-07-17
            aria-label="Add a photo"
            title="Add a photo"
            style={{
              display: 'flex',
              width: 42,
              height: 42,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              border: `1px solid ${HAIRLINE}`,
              background: '#fff',
              color: MUTED,
              cursor: busy || photos.length >= MAX_PHOTOS ? 'default' : 'pointer',
              opacity: busy || photos.length >= MAX_PHOTOS ? 0.4 : 1,
            }}
          >
            <ImagePlus size={18} />
          </button>
          {micSupported && (
            <button
              type="button"
              onClick={toggleMic}
              disabled={busy}
              aria-pressed={listening}
              aria-label={listening ? 'Stop listening' : 'Ask with your voice'}
              title={listening ? 'Stop listening' : 'Ask with your voice'}
              style={{
                display: 'flex',
                width: 42,
                height: 42,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
                border: listening ? 'none' : `1px solid ${HAIRLINE}`,
                background: listening ? '#B42828' : '#fff',
                color: listening ? '#fff' : MUTED,
                cursor: busy ? 'default' : 'pointer',
                opacity: busy ? 0.4 : 1,
              }}
            >
              <Mic size={18} aria-hidden />
            </button>
          )}
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoiceReplies}
              aria-pressed={voiceReplies}
              aria-label={voiceReplies ? 'voice replies on' : 'voice replies off'}
              title={voiceReplies ? 'voice replies on' : 'voice replies off'}
              style={{
                display: 'flex',
                width: 42,
                height: 42,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
                border: `1px solid ${HAIRLINE}`,
                background: '#fff',
                color: voiceReplies ? TEAL : MUTED,
                cursor: 'pointer',
              }}
            >
              {voiceReplies ? <Volume2 size={18} aria-hidden /> : <VolumeX size={18} aria-hidden />}
            </button>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            rows={1}
            placeholder="Type a message…"
            style={{
              flex: 1,
              resize: 'none',
              padding: '10px 14px',
              borderRadius: 14,
              border: `1px solid ${HAIRLINE}`,
              background: '#fff',
              color: INK,
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => submit(input)}
            disabled={busy || (!input.trim() && photos.length === 0)}
            aria-label="Send"
            style={{
              display: 'flex',
              width: 42,
              height: 42,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              border: 'none',
              background: INK,
              color: '#fff',
              cursor: busy || (!input.trim() && photos.length === 0) ? 'default' : 'pointer',
              opacity: busy || (!input.trim() && photos.length === 0) ? 0.4 : 1,
            }}
          >
            <ArrowRight size={18} />
          </button>
        </div>
        {templateId === 'chief-of-staff' && (
          <MeetingCapture
            disabled={busy}
            onTranscript={(t) => {
              const transcript = t.trim();
              if (!transcript) return;
              // Plain transcript into the input — the visitor checks it, then
              // sends it for the write-up.
              setInput((v) => (v ? `${v}\n${transcript}` : transcript));
            }}
          />
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <CaptureModal
        open={captureOpen}
        // Capture surface is capped at 64 chars server-side; stateless `l~…`
        // slugs are long opaque payloads, so trim for lead attribution.
        surface={`agent:${slug.slice(0, 56)}`}
        onClose={() => setCaptureOpen(false)}
        onUnlocked={() => setCaptureOpen(false)}
      />
    </div>
  );
}
