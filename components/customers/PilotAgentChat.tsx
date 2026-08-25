'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { motion, useReducedMotion } from 'framer-motion';
import { AssemblingLoader } from '@assembl/canvas';
import { AgentMarkdown } from '@/components/marketplace/AgentMarkdown';
import { ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';
import { loadChatHistory, saveChatHistory, type StoredChatMessage } from '@/lib/pwa/chat-store';

/**
 * PilotAgentChat — the live agent panel inside a customer pilot workspace.
 *
 * Real streaming chat against the pilot's own API route; the agent answers
 * through real tools (domain engines + pgvector knowledge retrieval), and the
 * sources those tools cite are surfaced under each reply together with a
 * provenance score. No canned responses anywhere.
 *
 * Layer rules (AI-OS positioning): the panel itself is assembl OS chrome;
 * the customer's accent colour appears in exactly one place — the send
 * button / active states.
 */

type Citation = { title: string; ref?: string; url?: string; tier?: 'A' | 'B' | 'C' };

/** Pull the text out of a UIMessage's parts. */
function messageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

/** Collect citations from every completed tool call in a message. */
function messageCitations(message: UIMessage): Citation[] {
  const out: Citation[] = [];
  for (const part of message.parts) {
    if (!part.type.startsWith('tool-') && part.type !== 'dynamic-tool') continue;
    const p = part as unknown as { state?: string; output?: { citations?: Citation[] } };
    if (p.state === 'output-available' && Array.isArray(p.output?.citations)) {
      out.push(...p.output.citations);
    }
  }
  // De-dup by title+ref.
  const seen = new Set<string>();
  return out.filter((c) => {
    const k = `${c.title}|${c.ref ?? ''}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Provenance score — an honest, deterministic heuristic over the reply's
 * actual citation trail: base 0.5, +0.12 per distinct source (cap 3), +0.05
 * if any Tier A (statute / tariff reference) source is present. Shown with
 * its source count so it can't be mistaken for a model-confidence claim.
 */
function provenanceScore(citations: Citation[]): number | null {
  if (citations.length === 0) return null;
  const tierABoost = citations.some((c) => c.tier === 'A') ? 0.05 : 0;
  return Math.min(0.95, 0.5 + Math.min(citations.length, 3) * 0.12 + tierABoost);
}

const TIER_LABEL: Record<string, string> = {
  A: 'tier a · primary source',
  B: 'tier b · knowledge base',
  C: 'tier c · workspace demo data',
};

// ── voice — browser-native, no keys ─────────────────────────────────────────
// Speech-in via the Web Speech API (feature-detected; the mic button simply
// doesn't render where it's unsupported) and speech-out via speechSynthesis.
// Replies are only spoken after the visitor has used their voice first.

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Markdown → plain speakable text (headings, emphasis, links, code). */
function speakable(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const clean = speakable(text);
  if (!clean) return;
  const utterance = new SpeechSynthesisUtterance(clean.slice(0, 800));
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => v.lang === 'en-NZ') ??
    voices.find((v) => v.lang === 'en-AU') ??
    voices.find((v) => v.lang === 'en-GB');
  if (preferred) utterance.voice = preferred;
  utterance.rate = 1.02;
  window.speechSynthesis.speak(utterance);
}

export function PilotAgentChat({
  apiPath,
  agentName,
  composerPlaceholder,
  greeting,
  tryMe,
  accent,
  draftNote,
}: {
  apiPath: string;
  agentName: string;
  /** Composer placeholder override — English-led tenants pass a phrase that
   *  reads naturally (default: `Ask ${agentName} anything about the workspace…`). */
  composerPlaceholder?: string;
  greeting: string;
  tryMe: string[];
  /** The customer accent colour — used on the send button only. */
  accent: string;
  draftNote?: string;
}) {
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const initialMessages = useMemo<UIMessage[]>(
    () => [
      {
        id: 'greeting',
        role: 'assistant',
        parts: [{ type: 'text', text: greeting }],
      } as UIMessage,
    ],
    [greeting],
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: apiPath }),
    messages: initialMessages,
  });

  const busy = status === 'submitted' || status === 'streaming';

  // ── PWA offline shell ────────────────────────────────────────────────────
  // Track connectivity for the offline banner, restore the last 20 messages
  // (text-only) from IndexedDB so the installed app shows recent history
  // offline, and snapshot completed turns back into the store.
  const offline = useSyncExternalStore(
    (onChange) => {
      window.addEventListener('online', onChange);
      window.addEventListener('offline', onChange);
      return () => {
        window.removeEventListener('online', onChange);
        window.removeEventListener('offline', onChange);
      };
    },
    () => !navigator.onLine,
    () => false,
  );
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    void loadChatHistory(apiPath).then((stored) => {
      if (stored.length === 0) return;
      setMessages((current) => {
        // Only hydrate a fresh shell (greeting alone) — never clobber a
        // conversation already underway.
        if (current.length > 1) return current;
        const restored = stored.map(
          (s) =>
            ({
              id: `restored-${s.id}`,
              role: s.role,
              parts: [{ type: 'text', text: s.text }],
            }) as UIMessage,
        );
        return [...current, ...restored];
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath]);

  useEffect(() => {
    if (status !== 'ready') return;
    const snapshot: StoredChatMessage[] = messages
      .filter((m) => m.id !== 'greeting' && (m.role === 'user' || m.role === 'assistant'))
      .map((m) => ({ id: m.id, role: m.role as 'user' | 'assistant', text: messageText(m) }))
      .filter((m) => m.text.trim().length > 0);
    if (snapshot.length > 0) void saveChatHistory(apiPath, snapshot);
  }, [messages, status, apiPath]);

  const reduce = useReducedMotion();

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // never talk over a new question
    }
    sendMessage({ text: trimmed });
    setInput('');
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  // ── voice in/out ─────────────────────────────────────────────────────────
  // Support never changes at runtime; the server snapshot is false so SSR
  // renders no mic and the client fills it in without a hydration mismatch.
  const micSupported = useSyncExternalStore(
    () => () => {},
    () => getSpeechRecognition() !== null,
    () => false,
  );
  const [listening, setListening] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const spokenIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Recognition = getSpeechRecognition();
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = 'en-NZ';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result?.[0]?.transcript ?? '';
      setInput(transcript);
      if (result?.isFinal && transcript.trim()) {
        setVoiceReplies(true); // spoke to it → it speaks back
        send(transcript);
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  // Speak each completed assistant reply exactly once, only when enabled.
  useEffect(() => {
    if (!voiceReplies || status !== 'ready') return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant' || last.id === 'greeting') return;
    if (spokenIdsRef.current.has(last.id)) return;
    spokenIdsRef.current.add(last.id);
    speak(messageText(last));
  }, [messages, status, voiceReplies]);

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-black/10 bg-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl"
      style={{ boxShadow: `0 20px 50px rgba(0,0,0,0.08), 0 0 0 1px ${accent}22` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-70"
        style={{
          background: `radial-gradient(ellipse at 20% 0%, ${accent}33 0%, transparent 60%)`,
        }}
      />
      <div className="relative flex items-center gap-2 border-b border-black/5 px-4 py-3.5">
        <span className="relative inline-flex h-2.5 w-2.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 motion-reduce:animate-none"
            style={{ backgroundColor: accent }}
          />
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
        </span>
        <span className="text-sm font-semibold tracking-tight">{agentName}</span>
        <button
          type="button"
          onClick={() => {
            setVoiceReplies((v) => {
              if (v && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              return !v;
            });
          }}
          aria-pressed={voiceReplies}
          title={voiceReplies ? 'Spoken replies on — tap to mute' : 'Tap to have replies spoken aloud'}
          className="ml-auto rounded-full border border-black/10 px-2 py-0.5 text-[12px] uppercase transition-colors hover:bg-black/[0.04]"
          style={{
            letterSpacing: '0.16em',
            color: voiceReplies ? '#fff' : 'rgba(31, 29, 26, 0.62)',
            background: voiceReplies ? accent : 'transparent',
          }}
        >
          {voiceReplies ? '🔊 voice on' : '🔇 voice'}
        </button>
        <span
          className="rounded-full px-2 py-0.5 text-[12px] uppercase"
          style={{ letterSpacing: '0.16em', color: 'rgba(31, 29, 26, 0.62)', background: `${accent}14` }}
        >
          live · draft-only
        </span>
      </div>

      {offline ? (
        <div
          className="border-b border-black/5 px-4 py-2 text-[12px] uppercase"
          style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY, backgroundColor: '#F7F5EE' }}
          role="status"
        >
          offline — showing your recent messages · replies resume when you reconnect
        </div>
      ) : null}

      <div ref={listRef} className="relative flex-1 space-y-4 overflow-y-auto px-4 py-4" style={{ minHeight: 340, maxHeight: 520 }}>
        {messages.map((m, idx) => {
          const text = messageText(m);
          const citations = m.role === 'assistant' ? messageCitations(m) : [];
          const score = provenanceScore(citations);
          const bubble = (
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white shadow-md'
                    : 'max-w-[92%] rounded-2xl rounded-bl-md border border-black/5 bg-white/95 px-4 py-3 text-sm shadow-sm'
                }
                style={
                  m.role === 'user'
                    ? { background: `linear-gradient(135deg, ${accent}, #1a1a1a)` }
                    : undefined
                }
              >
                {m.role === 'assistant' ? (
                  <>
                    {text ? <AgentMarkdown text={text} /> : (
                      <AssemblingLoader size={22} style={{ padding: '2px 4px' }} />
                    )}
                    {citations.length > 0 && (
                      <div className="mt-3 border-t border-black/5 pt-2">
                        <div
                          className="mb-1.5 text-[12px] uppercase"
                          style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}
                        >
                          sources
                          {score !== null && (
                            <span className="ml-2" title="Provenance: deterministic score over this reply's real citation trail (source count + tier), not a model-confidence claim.">
                              · provenance {(score * 100).toFixed(0)}% · {citations.length} source{citations.length === 1 ? '' : 's'}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {citations.map((c, i) => (
                            <a
                              key={i}
                              href={c.url ?? undefined}
                              target={c.url ? '_blank' : undefined}
                              rel="noreferrer"
                              title={`${TIER_LABEL[c.tier ?? 'B']}${c.ref ? ` — ${c.ref}` : ''}`}
                              className={`rounded-full border border-black/10 px-2 py-0.5 text-[12px] transition-colors ${c.url ? 'hover:bg-black/5' : 'cursor-default'}`}
                              style={{ color: '#3E3C36' }}
                            >
                              {c.tier ? `${c.tier} · ` : ''}
                              {c.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  text
                )}
              </div>
          );
          if (reduce) {
            return (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                {bubble}
              </div>
            );
          }
          return (
            <motion.div
              key={m.id}
              className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, delay: Math.min(idx * 0.02, 0.2) }}
            >
              {bubble}
            </motion.div>
          );
        })}
        {status === 'submitted' ? (
          <div className="flex justify-start">
            <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-black/5 bg-white px-4 py-3 text-sm shadow-sm">
              <AssemblingLoader size={22} style={{ padding: '2px 4px' }} />
            </div>
          </div>
        ) : null}
        {error ? (
          <p className="text-xs text-red-700">
            The agent hit a snag: {error.message}. Try again — nothing was lost.
          </p>
        ) : null}
      </div>

      <div className="relative border-t border-black/5 bg-white/70 px-4 pb-4 pt-3 backdrop-blur-md">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {tryMe.map((t) => (
            <motion.button
              key={t}
              type="button"
              onClick={() => send(t)}
              disabled={busy}
              whileHover={reduce ? undefined : { y: -2, scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-left text-[12px] leading-[1.4] shadow-sm transition-colors hover:bg-black/[0.03] disabled:opacity-50"
            >
              {t}
            </motion.button>
          ))}
        </div>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={2}
            placeholder={composerPlaceholder ?? `Ask ${agentName} anything about the workspace…`}
            className="flex-1 resize-none rounded-2xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-transparent focus:shadow-[0_0_0_3px_var(--focus-ring)]"
            style={{ ['--focus-ring' as string]: `${accent}44` }}
          />
          {micSupported ? (
            <motion.button
              type="button"
              onClick={toggleMic}
              disabled={busy || offline}
              aria-pressed={listening}
              aria-label={listening ? 'Stop listening' : 'Speak your question'}
              title={listening ? 'Listening — tap to stop' : 'Speak your question'}
              whileHover={reduce ? undefined : { scale: 1.04 }}
              whileTap={reduce ? undefined : { scale: 0.96 }}
              className="rounded-2xl border border-black/10 px-3 py-2.5 text-sm shadow-sm disabled:opacity-50"
              style={
                listening
                  ? { backgroundColor: accent, color: '#fff' }
                  : { backgroundColor: '#fff' }
              }
            >
              {listening ? '● listening' : '🎙'}
            </motion.button>
          ) : null}
          <motion.button
            type="submit"
            disabled={busy || offline || !input.trim()}
            whileHover={reduce ? undefined : { scale: 1.04 }}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50"
            style={{ backgroundColor: accent }}
          >
            {busy ? '…' : 'send'}
          </motion.button>
        </form>
        {draftNote ? (
          <p className="mt-2 text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
            {draftNote}
          </p>
        ) : null}
      </div>
    </div>
  );
}
