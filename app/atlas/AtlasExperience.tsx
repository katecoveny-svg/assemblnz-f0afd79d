'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import {
  ArrowUp,
  Download,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PALETTE, type PublicMarketplaceAgent } from '@/lib/marketplace/agents';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { recommendAgents, type AgentMatch } from '@/lib/atlas/recommend';
import { downloadRoadmap } from '@/lib/atlas/roadmap-pdf';

/** Pilot — the agent maker — is built in a parallel session. Until it ships its
 *  route may 404; the secondary link to the shelf always works. */
const PILOT_HREF = '/pilot';

const LEVELS = ['beginner', 'familiar', 'fluent', 'builder', 'sensei', 'kaitiaki'] as const;
type Level = (typeof LEVELS)[number];

type Profile = {
  signedIn: boolean;
  level: Level;
  points: number;
  badges: { id: string; label?: string }[];
};

/** Minimal shape of the Web Speech API recogniser we use (no DOM lib types). */
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
};

/** Honest, specific things AI will not do — baked into the roadmap. */
const AI_LIMITS = [
  'Make the call when being wrong is expensive. It drafts; you decide.',
  'Know a live fact without a source. Always check anything it states as current.',
  'Carry accountability. Your name goes on the work, so a person signs it off.',
];

function messageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

/** Light client-side flags so the roadmap can note Privacy Act + tikanga. */
function detectFlags(text: string): { privacy: boolean; tikanga: boolean } {
  const t = text.toLowerCase();
  const privacy = /\b(client|clients|customer|customers|patient|patients|staff|tamariki|personal|private|medical|health record)\b/.test(t);
  const tikanga = /\b(māori|maori|whānau|whanau|iwi|hapū|hapu|marae|tikanga|taonga|kaupapa)\b/.test(t);
  return { privacy, tikanga };
}

export function AtlasExperience({ agent }: { agent: PublicMarketplaceAgent }) {
  const greeting: UIMessage = {
    id: 'greeting',
    role: 'assistant',
    parts: [{ type: 'text', text: agent.greeting }],
  };

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/atlas/chat' }),
    messages: [greeting],
  });

  const [input, setInput] = useState('');
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [profile, setProfile] = useState<Profile>({ signedIn: false, level: 'beginner', points: 0, badges: [] });
  const [badgeToast, setBadgeToast] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const spokenRef = useRef<Set<string>>(new Set());
  const awardedRef = useRef(false);
  const diagnosticAwardedRef = useRef(false);

  const busy = status === 'submitted' || status === 'streaming';

  // ── Live recommendations (always works, no model key needed) ───────────
  const userText = useMemo(
    () =>
      messages
        .filter((m) => m.role === 'user')
        .map(messageText)
        .join('  '),
    [messages],
  );
  const recommendations: AgentMatch[] = useMemo(
    () => (userText.trim() ? recommendAgents(userText, 3) : []),
    [userText],
  );
  const flags = useMemo(() => detectFlags(userText), [userText]);

  // ── Profile (points + level + badges) ──────────────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/game/state');
      if (!res.ok) return;
      const s = await res.json();
      setProfile({
        signedIn: !!s.signedIn,
        level: (s.level ?? 'beginner') as Level,
        points: s.points ?? 0,
        badges: Array.isArray(s.badges) ? s.badges : [],
      });
    } catch {
      /* keep the default beginner profile */
    }
  }, []);
  useEffect(() => {
    // Mount-time sync from an external system (the profile API). setProfile runs
    // inside the async fetch, not synchronously — safe here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile();
  }, [loadProfile]);

  // ── Voice toggle persistence ───────────────────────────────────────────
  useEffect(() => {
    // localStorage is unavailable during SSR, so this read must happen on mount,
    // not in a useState initializer (it would mismatch on hydration).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoiceOn(localStorage.getItem('atlas-voice') === 'on');
  }, []);
  const toggleVoice = useCallback(() => {
    setVoiceOn((on) => {
      const next = !on;
      localStorage.setItem('atlas-voice', next ? 'on' : 'off');
      if (!next && audioRef.current) audioRef.current.pause();
      return next;
    });
  }, []);

  // ── Speak the latest finished assistant message ────────────────────────
  useEffect(() => {
    if (!voiceOn || busy) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant' || last.id === 'greeting') return;
    if (spokenRef.current.has(last.id)) return;
    const text = messageText(last).trim();
    if (!text) return;
    spokenRef.current.add(last.id);

    let cancelled = false;
    let url: string | null = null;
    (async () => {
      try {
        const res = await fetch('/api/atlas/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (!res.ok || cancelled) return; // 503 = voice not configured; stay silent
        const blob = await res.blob();
        url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = url;
          await audioRef.current.play().catch(() => {});
        }
      } catch {
        /* leave it text-only */
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [messages, voiceOn, busy]);

  // ── Web Speech API (STT) ───────────────────────────────────────────────
  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    // Feature detection on mount — Web Speech availability is an external fact.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSttSupported(true);
    const rec = new (Ctor as new () => SpeechRecognitionLike)();
    rec.lang = 'en-NZ';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }, [listening]);

  // ── Send ───────────────────────────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      sendMessage({ text: trimmed });
      setInput('');

      // Points (no-op when signed out). First message → first-conversation;
      // once the diagnostic has real depth (3+ turns) → diagnostic-complete.
      const userTurns = messages.filter((m) => m.role === 'user').length + 1;
      const award = async (action: string, toast: string) => {
        try {
          const res = await fetch('/api/game/award', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
          });
          const data = await res.json();
          if (data.signedIn && data.awarded > 0) {
            setBadgeToast(`${toast} · +${data.awarded}`);
            setTimeout(() => setBadgeToast(null), 4000);
            void loadProfile();
          }
        } catch {
          /* gamification is best-effort */
        }
      };
      if (!awardedRef.current) {
        awardedRef.current = true;
        void award('first-conversation', 'First step');
      }
      if (userTurns >= 3 && !diagnosticAwardedRef.current) {
        diagnosticAwardedRef.current = true;
        void award('diagnostic-complete', 'Week mapped');
      }
    },
    [busy, sendMessage, loadProfile, messages],
  );

  const saveRoadmap = useCallback(() => {
    const summary =
      userText.trim().length > 0
        ? userText.trim().slice(0, 600)
        : 'We have not mapped your week yet — tell Atlas what fills most of your days first.';
    downloadRoadmap({
      summary,
      picks: recommendations,
      limits: AI_LIMITS,
      privacyFlag: flags.privacy,
      tikangaFlag: flags.tikanga,
    });
  }, [userText, recommendations, flags]);

  const last = messages[messages.length - 1];
  const waitingForText = busy && (!last || last.role !== 'assistant' || messageText(last).length === 0);
  const canSaveRoadmap = recommendations.length > 0 || userText.trim().length > 40;

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: PALETTE.cream, color: PALETTE.ink }}>
      <audio ref={audioRef} hidden />

      {/* Chrome */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: PALETTE.hairline, backgroundColor: 'rgba(255,247,236,0.82)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
          <Link href="/agents" className="flex items-end gap-2" aria-label="assembl agents">
            <span
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontWeight: 600,
                fontSize: 26,
                letterSpacing: '-0.01em',
                lineHeight: 1,
                color: PALETTE.ink,
              }}
            >
              assembl
            </span>
            <span style={{ width: 20, height: 6, borderRadius: 4, background: PALETTE.canary, marginBottom: 5 }} />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/journey" aria-label="Your journey">
              <LevelPill level={profile.level} points={profile.points} badgeCount={profile.badges.length} />
            </Link>
            <Link
              href="/agents"
              className="hidden text-sm font-bold hover:opacity-70 sm:inline"
              style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.body }}
            >
              All agents
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 py-8 md:px-8 lg:grid-cols-[1.5fr_1fr]">
        {/* ── Conversation column ─────────────────────────────────────── */}
        <section className="flex flex-col">
          {/* Hero */}
          <div className="mb-6">
            <p
              className="text-[11px] font-bold uppercase"
              style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.2em', color: PALETTE.gold }}
            >
              Start here · free
            </p>
            <h1
              className="mt-2 flex items-baseline gap-3"
              style={{ fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 0.95 }}
            >
              <span className="text-5xl md:text-6xl">Atlas</span>
            </h1>
            <p
              className="mt-3 max-w-xl text-lg leading-relaxed"
              style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.body }}
            >
              The free AI coach. Tell me about your week and I will point you to the agents that fit — and tell
              you straight where AI will not help. I will not sell you anything.
            </p>

            {/* Voice controls */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleVoice}
                aria-pressed={voiceOn}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition"
                style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  backgroundColor: voiceOn ? PALETTE.canary : PALETTE.paper,
                  color: PALETTE.ink,
                  border: `1px solid ${voiceOn ? PALETTE.canary : PALETTE.hairline}`,
                }}
              >
                {voiceOn ? <Volume2 size={16} aria-hidden /> : <VolumeX size={16} aria-hidden />}
                Voice {voiceOn ? 'on' : 'off'}
              </button>
              {sttSupported ? (
                <button
                  type="button"
                  onClick={toggleListening}
                  aria-pressed={listening}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition"
                  style={{
                    fontFamily: 'var(--font-body), sans-serif',
                    backgroundColor: listening ? PALETTE.ink : PALETTE.paper,
                    color: listening ? PALETTE.cream : PALETTE.ink,
                    border: `1px solid ${listening ? PALETTE.ink : PALETTE.hairline}`,
                  }}
                >
                  {listening ? <MicOff size={16} aria-hidden /> : <Mic size={16} aria-hidden />}
                  {listening ? 'Listening…' : 'Speak'}
                </button>
              ) : null}
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex max-h-[52vh] min-h-[280px] flex-1 flex-col gap-3 overflow-y-auto rounded-[22px] border p-4"
            style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.paper }}
          >
            {messages.map((m) => {
              const text = messageText(m);
              if (!text) return null;
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className="max-w-[88%] rounded-[18px] px-4 py-3 text-sm leading-relaxed"
                  style={
                    isUser
                      ? { alignSelf: 'flex-end', backgroundColor: PALETTE.canary, color: PALETTE.ink, fontFamily: 'var(--font-body), sans-serif' }
                      : { alignSelf: 'flex-start', backgroundColor: PALETTE.cream, color: PALETTE.body, border: `1px solid ${PALETTE.hairline}`, fontFamily: 'var(--font-body), sans-serif' }
                  }
                >
                  <p className="whitespace-pre-wrap">{text}</p>
                </div>
              );
            })}

            {waitingForText ? (
              <div
                className="self-start rounded-[18px] border px-4 py-3 text-sm"
                style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.cream, color: PALETTE.muted, fontFamily: 'var(--font-body), sans-serif' }}
              >
                Atlas is thinking…
              </div>
            ) : null}

            {error ? (
              <div
                className="self-start rounded-[18px] border px-4 py-3 text-sm"
                style={{ borderColor: 'rgba(180,60,40,0.3)', backgroundColor: 'rgba(180,60,40,0.06)', color: '#7a2a1a', fontFamily: 'var(--font-body), sans-serif' }}
              >
                The coach could not reply just now. The shelf suggestions on the right still work — they do not
                need a connection.
              </div>
            ) : null}

            {/* Starters on the fresh state */}
            {messages.length <= 1 && !busy ? (
              <div className="mt-1 flex flex-col gap-2">
                {agent.starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="self-start rounded-full border px-4 py-2 text-left text-sm font-bold transition hover:bg-[color:#FFF7EC]"
                    style={{ borderColor: PALETTE.hairline, color: PALETTE.ink, fontFamily: 'var(--font-body), sans-serif' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="mt-3 flex items-end gap-2"
          >
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
              placeholder="Tell Atlas about your week…"
              className="max-h-40 flex-1 resize-none rounded-[18px] border bg-white px-4 py-3 text-sm outline-none"
              style={{ borderColor: PALETTE.hairline, color: PALETTE.ink, fontFamily: 'var(--font-body), sans-serif' }}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition disabled:opacity-40"
              style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
            >
              <ArrowUp size={18} aria-hidden />
            </button>
          </form>
          <p className="mt-2 text-[11px]" style={{ fontFamily: 'var(--font-mono), monospace', color: PALETTE.muted }}>
            Free, no message cap. A coach, not advice. Your data lives in Sydney.
          </p>
        </section>

        {/* ── Map column: recommendations + roadmap + handoff ─────────── */}
        <aside className="flex flex-col gap-4">
          <RecommendationRail recommendations={recommendations} />

          {/* Roadmap */}
          <div className="rounded-[22px] border p-5" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.paper }}>
            <p className="text-[11px] font-bold uppercase" style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.18em', color: PALETTE.gold }}>
              Your roadmap
            </p>
            <p className="mt-2 text-sm" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.body }}>
              A one-page plan you can save or share: here is where AI can help you this month.
            </p>
            <button
              type="button"
              onClick={saveRoadmap}
              disabled={!canSaveRoadmap}
              className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-40"
              style={{ backgroundColor: PALETTE.ink, color: PALETTE.cream, fontFamily: 'var(--font-body), sans-serif' }}
            >
              <Download size={15} aria-hidden /> Save my roadmap
            </button>
            {!canSaveRoadmap ? (
              <p className="mt-2 text-[11px]" style={{ fontFamily: 'var(--font-mono), monospace', color: PALETTE.muted }}>
                Tell Atlas a little about your week to unlock it.
              </p>
            ) : null}
          </div>

          {/* Pilot handoff */}
          <div className="rounded-[22px] border p-5" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.cream }}>
            <p className="text-[11px] font-bold uppercase" style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.18em', color: PALETTE.gold }}>
              Nothing fits?
            </p>
            <h3 className="mt-2 text-2xl" style={{ fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' }}>
              Build your own with Pilot
            </h3>
            <p className="mt-1 text-sm" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.body }}>
              If nothing on the shelf is close enough, Pilot walks you through making your own agent — step by step.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link
                href={PILOT_HREF}
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:brightness-95"
                style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink, fontFamily: 'var(--font-body), sans-serif' }}
              >
                <Sparkles size={15} aria-hidden /> Meet Pilot
              </Link>
              <Link href="/agents" className="text-sm font-bold hover:opacity-70" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.body }}>
                Browse the shelf
              </Link>
            </div>
          </div>

          {/* Badges */}
          {profile.badges.length > 0 ? (
            <div className="rounded-[22px] border p-5" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.paper }}>
              <p className="text-[11px] font-bold uppercase" style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.18em', color: PALETTE.gold }}>
                Your badges
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.badges.map((b) => (
                  <span
                    key={b.id}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
                    style={{ backgroundColor: PALETTE.cream, color: PALETTE.ink, border: `1px solid ${PALETTE.hairline}`, fontFamily: 'var(--font-body), sans-serif' }}
                  >
                    <Sparkles size={13} style={{ color: PALETTE.gold }} aria-hidden /> {b.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </main>

      {/* Badge toast */}
      {badgeToast ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-bold shadow-lg"
          style={{ backgroundColor: PALETTE.ink, color: PALETTE.cream, fontFamily: 'var(--font-body), sans-serif' }}
          role="status"
        >
          <Sparkles size={15} style={{ color: PALETTE.canary, display: 'inline', verticalAlign: '-2px' }} aria-hidden /> {badgeToast}
        </div>
      ) : null}
    </div>
  );
}

function LevelPill({ level, points, badgeCount }: { level: Level; points: number; badgeCount: number }) {
  const idx = LEVELS.indexOf(level);
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition hover:brightness-95"
      style={{ backgroundColor: PALETTE.paper, color: PALETTE.ink, border: `1px solid ${PALETTE.hairline}`, fontFamily: 'var(--font-body), sans-serif' }}
      title={`AI literacy: ${level} · ${points} points · view your journey`}
    >
      <span className="flex gap-0.5" aria-hidden>
        {LEVELS.map((_, i) => (
          <span
            key={i}
            style={{ width: 5, height: 5, borderRadius: 99, backgroundColor: i <= idx ? PALETTE.canary : PALETTE.hairline }}
          />
        ))}
      </span>
      <span className="capitalize">{level}</span>
      {points > 0 ? <span style={{ color: PALETTE.gold }}>· {points.toLocaleString('en-NZ')}</span> : null}
      {badgeCount > 0 ? <span style={{ color: PALETTE.muted }}>· {badgeCount}★</span> : null}
    </span>
  );
}

function RecommendationRail({ recommendations }: { recommendations: AgentMatch[] }) {
  return (
    <div className="rounded-[22px] border p-5" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.paper }}>
      <p className="text-[11px] font-bold uppercase" style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.18em', color: PALETTE.gold }}>
        Agents that might fit
      </p>
      {recommendations.length === 0 ? (
        <p className="mt-2 text-sm" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.muted }}>
          As you describe your week, the agents that fit will show up here — best first.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {recommendations.map((rec) => (
            <Link
              key={rec.slug}
              href={`/agents/${rec.slug}`}
              className="group flex items-start gap-3 rounded-[16px] border p-3 transition hover:-translate-y-0.5"
              style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.cream }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: PALETTE.paper }}>
                <AgentIcon name={rec.icon} className="h-6 w-6" tone={rec.tile} />
              </span>
              <span className="min-w-0">
                <span className="flex items-baseline gap-2">
                  <span className="text-base font-bold" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.ink }}>
                    {rec.name}
                  </span>
                  <span className="ml-auto text-[11px] font-bold" style={{ fontFamily: 'var(--font-mono), monospace', color: PALETTE.gold }}>
                    {rec.price}
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.body }}>
                  {rec.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
