'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Mic,
  MicOff,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PALETTE } from '@/lib/marketplace/agents';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { recommendForAnswers, whyFits } from '@/lib/atlas/readiness';
import {
  QUESTIONS,
  TOTAL_QUESTIONS,
  archetypeForAnswers,
  bandForAnswers,
  decodeAnswers,
  encodeAnswers,
  isComplete,
  pilotBrief,
  privacyNotes,
  sectorNotes,
  summaryFor,
  type Archetype,
  type ReadinessAnswers,
  type ReadinessOption,
} from '@/lib/atlas/readiness';
// jsPDF is heavy (~200KB) and only needed on the "Save as PDF" click — lazy-load it.

const D = 'var(--font-display), Georgia, serif';
const B = 'var(--font-body), sans-serif';
const M = 'var(--font-mono), monospace';

type Phase = 'welcome' | 'quiz' | 'report';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Minimal Web Speech recogniser shape (no DOM lib types). */
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

const ORDINALS = ['one', 'two', 'three', 'four', 'five', 'six'];

/** Match a spoken phrase to one of the question's options (ordinal or keyword). */
function matchSpokenOption(transcript: string, options: ReadinessOption[]): string | null {
  const t = transcript.toLowerCase();
  for (let i = 0; i < options.length; i += 1) {
    if (t.includes(`number ${i + 1}`) || (ORDINALS[i] && new RegExp(`\\b${ORDINALS[i]}\\b`).test(t))) {
      return options[i].value;
    }
  }
  for (const o of options) {
    const words = o.label
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    if (words.some((w) => t.includes(w))) return o.value;
  }
  return null;
}

export function ReadinessDiagnostic() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ReadinessAnswers>({});
  const [shared, setShared] = useState(false);

  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);

  // Lead — captured at Q0 (soft signup) when given, else at the report.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [captured, setCaptured] = useState(false);
  const [leadStatus, setLeadStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const awardedRef = useRef(false);
  const spokenRef = useRef<number>(-1);

  // ── Shared-link hydration: ?r=<code> jumps straight to the report ─────────
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('r');
    const decoded = decodeAnswers(code);
    if (decoded && isComplete(decoded)) {
      // Rendering a shared report — display only, no points awarded.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers(decoded);
      setShared(true);
      setPhase('report');
    }
  }, []);

  // ── Voice toggle persistence (shared key with /atlas) ─────────────────────
  useEffect(() => {
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

  // ── Speak helper (ElevenLabs proxy; silent when not configured) ───────────
  const speak = useCallback(
    async (text: string) => {
      if (!voiceOn || !text.trim()) return;
      try {
        const res = await fetch('/api/atlas/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) return; // 503 = voice not configured; stay silent
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = url;
          await audioRef.current.play().catch(() => {});
        }
      } catch {
        /* leave it text-only */
      }
    },
    [voiceOn],
  );

  // Read each question aloud when voice is on.
  useEffect(() => {
    if (phase !== 'quiz' || !voiceOn) return;
    if (spokenRef.current === index) return;
    spokenRef.current = index;
    const q = QUESTIONS[index];
    const optionList = q.options.map((o, i) => `${ORDINALS[i] ?? i + 1}. ${o.label}`).join('. ');
    void speak(`${q.prompt}. Your options: ${optionList}.`);
  }, [phase, index, voiceOn, speak]);

  // ── Web Speech (STT) ──────────────────────────────────────────────────────
  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSttSupported(true);
    const rec = new (Ctor as new () => SpeechRecognitionLike)();
    rec.lang = 'en-NZ';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
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

  const current = QUESTIONS[index];

  const choose = useCallback(
    (value: string) => {
      const q = QUESTIONS[index];
      setAnswers((prev) => ({ ...prev, [q.id]: value }));
      // Advance after a beat so the selection is visible.
      window.setTimeout(() => {
        if (index + 1 < TOTAL_QUESTIONS) {
          setIndex((i) => Math.min(TOTAL_QUESTIONS - 1, i + 1));
        } else {
          setPhase('report');
        }
      }, 240);
    },
    [index],
  );

  // Wire STT results to the *current* question via a ref-fresh handler.
  useEffect(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      const match = matchSpokenOption(transcript, QUESTIONS[index].options);
      if (match) choose(match);
    };
  }, [index, choose]);

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

  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // ── Q0 soft signup — capture the lead before the quiz, list it from the start
  const captureSignup = useCallback(async (): Promise<boolean> => {
    if (!EMAIL_RE.test(email)) {
      setLeadStatus('error');
      return false;
    }
    setCaptured(true);
    setLeadStatus('idle');
    // Fire-and-forget: subscribe to the atlas-readiness list immediately so the
    // lead lands even if they abandon mid-quiz.
    void fetch('/api/atlas/readiness-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, stage: 'signup', consent: true }),
    }).catch(() => {});
    return true;
  }, [email, name]);

  const startWithEmail = useCallback(async () => {
    const ok = await captureSignup();
    if (ok) setPhase('quiz');
  }, [captureSignup]);

  const skipSignup = useCallback(() => setPhase('quiz'), []);

  // ── Send ──────────────────────────────────────────────────────────────────
  const band = useMemo(() => bandForAnswers(answers), [answers]);
  const archetype = useMemo(() => archetypeForAnswers(answers), [answers]);
  const picks = useMemo(() => (phase === 'report' ? recommendForAnswers(answers, 3) : []), [answers, phase]);
  const reasons = useMemo(() => picks.map((p) => whyFits(p, answers)), [picks, answers]);
  const privacy = useMemo(() => privacyNotes(answers), [answers]);
  const sector = useMemo(() => sectorNotes(answers), [answers]);
  const summary = useMemo(() => summaryFor(answers), [answers]);
  // A Pilot brief shows when the situation points at building (ready-to-scale)
  // or skill has reached Builder.
  const firstBuild =
    archetype.primaryCta === 'pilot' || band.key === 'builder' ? pilotBrief(answers) : null;

  // Award points + speak the verdict once, when the report first lands (not on a shared view).
  useEffect(() => {
    if (phase !== 'report' || shared || awardedRef.current || !isComplete(answers)) return;
    awardedRef.current = true;

    // Stash the summary so /atlas can pick the conversation up where the quiz left off.
    try {
      sessionStorage.setItem('atlas-readiness-summary', summary);
    } catch {
      /* private mode — handoff just starts fresh */
    }

    void (async () => {
      try {
        const res = await fetch('/api/game/award', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'readiness-complete' }),
        });
        const data = await res.json();
        if (data.signedIn && data.awarded > 0) {
          setToast(`First step · +${data.awarded}`);
          window.setTimeout(() => setToast(null), 4000);
        }
      } catch {
        /* gamification is best-effort */
      }
    })();

    void speak(`You're ${archetype.label}. ${archetype.tagline}`);
  }, [phase, shared, answers, archetype, summary, speak]);

  const savePdf = useCallback(async () => {
    const { downloadReadinessReport } = await import('@/lib/atlas/readiness-pdf');
    downloadReadinessReport({ archetype, band, summary, picks, reasons, privacy, sector, firstBuild });
  }, [archetype, band, summary, picks, reasons, privacy, sector, firstBuild]);

  const share = useCallback(async () => {
    const url = `${window.location.origin}/atlas/readiness?r=${encodeAnswers(answers)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      const nav = navigator as Navigator & { share?: (d: { url: string }) => Promise<void> };
      if (nav.share) await nav.share({ url }).catch(() => {});
    }
  }, [answers]);

  const submitLead = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!EMAIL_RE.test(email)) {
        setLeadStatus('error');
        return;
      }
      setLeadStatus('saving');
      try {
        const res = await fetch('/api/atlas/readiness-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name,
            stage: 'report',
            archetype: archetype.label,
            band: band.label,
            role: answers.role ?? '',
            timeLoss: answers['time-loss'] ?? '',
            consent: true,
          }),
        });
        setLeadStatus(res.ok ? 'saved' : 'error');
      } catch {
        setLeadStatus('error');
      }
    },
    [email, name, archetype, band, answers],
  );

  const restart = useCallback(() => {
    setAnswers({});
    setIndex(0);
    setShared(false);
    setCaptured(false);
    awardedRef.current = false;
    spokenRef.current = -1;
    setPhase('welcome');
    window.history.replaceState(null, '', '/atlas/readiness');
  }, []);

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: PALETTE.paper, color: PALETTE.ink }}>
      <audio ref={audioRef} hidden />

      {/* Chrome */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: PALETTE.hairline, backgroundColor: 'rgba(255,255,255,0.85)' }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Link href="/atlas" className="flex items-end gap-2" aria-label="Atlas">
            <span style={{ fontFamily: D, fontWeight: 600, fontSize: 24, letterSpacing: '-0.01em', lineHeight: 1, color: PALETTE.ink }}>
              assembl
            </span>
            <span style={{ width: 18, height: 5, borderRadius: 4, background: PALETTE.canary, marginBottom: 5 }} />
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleVoice}
              aria-pressed={voiceOn}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition"
              style={{
                fontFamily: B,
                backgroundColor: voiceOn ? PALETTE.canary : PALETTE.paper,
                color: PALETTE.ink,
                border: `1px solid ${voiceOn ? PALETTE.canary : PALETTE.hairline}`,
              }}
            >
              {voiceOn ? <Volume2 size={14} aria-hidden /> : <VolumeX size={14} aria-hidden />}
              Voice {voiceOn ? 'on' : 'off'}
            </button>
            <Link href="/atlas" className="hidden text-sm font-bold hover:opacity-70 sm:inline" style={{ fontFamily: B, color: PALETTE.body }}>
              Atlas
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        {phase === 'welcome' ? (
          <WelcomeScreen
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            leadError={leadStatus === 'error'}
            onStartWithEmail={startWithEmail}
            onSkip={skipSignup}
          />
        ) : phase === 'quiz' ? (
          <QuizScreen
            question={current}
            index={index}
            selected={answers[current.id]}
            onChoose={choose}
            onBack={back}
            sttSupported={sttSupported}
            listening={listening}
            onToggleListening={toggleListening}
            voiceOn={voiceOn}
          />
        ) : (
          <ReportScreen
            archetype={archetype}
            band={band}
            summary={summary}
            picks={picks}
            reasons={reasons}
            privacy={privacy}
            sector={sector}
            firstBuild={firstBuild}
            shared={shared}
            captured={captured}
            email={email}
            setEmail={setEmail}
            leadStatus={leadStatus}
            onSubmitLead={submitLead}
            onSavePdf={savePdf}
            onShare={share}
            copied={copied}
            onRestart={restart}
          />
        )}
      </main>

      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-bold shadow-lg"
          style={{ backgroundColor: PALETTE.ink, color: PALETTE.cream, fontFamily: B }}
          role="status"
        >
          <Sparkles size={15} style={{ color: PALETTE.canary, display: 'inline', verticalAlign: '-2px' }} aria-hidden /> {toast}
        </div>
      ) : null}
    </div>
  );
}

// ── Welcome + soft signup (Q0) ───────────────────────────────────────────────
function WelcomeScreen({
  name,
  setName,
  email,
  setEmail,
  leadError,
  onStartWithEmail,
  onSkip,
}: {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  leadError: boolean;
  onStartWithEmail: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <p className="text-[11px] font-bold uppercase" style={{ fontFamily: M, letterSpacing: '0.2em', color: PALETTE.gold }}>
        Start here · free · 5 minutes
      </p>
      <h1 className="mt-3 text-5xl md:text-6xl" style={{ fontFamily: D, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 0.98 }}>
        Where are you with AI?
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed" style={{ fontFamily: B, color: PALETTE.body }}>
        Ten plain questions. At the end, Atlas reads your readiness, points you to the agents that fit your work, and
        flags the NZ rules you need to keep in mind.
      </p>

      {/* Soft signup */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onStartWithEmail();
        }}
        className="mx-auto mt-7 flex max-w-md flex-col gap-2.5 rounded-[20px] border p-5 text-left"
        style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.cream }}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name"
          autoComplete="given-name"
          className="rounded-full border bg-white px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: PALETTE.hairline, color: PALETTE.ink, fontFamily: B }}
          aria-label="First name"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@work.co.nz"
          autoComplete="email"
          className="rounded-full border bg-white px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: leadError ? '#c2603f' : PALETTE.hairline, color: PALETTE.ink, fontFamily: B }}
          aria-label="Your email"
        />
        <button
          type="submit"
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-bold transition hover:brightness-95"
          style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink, fontFamily: B }}
        >
          Start the check <ArrowRight size={17} aria-hidden />
        </button>
        <p className="mt-1 text-center text-[11px] leading-relaxed" style={{ fontFamily: M, color: PALETTE.muted }}>
          {leadError ? 'Pop in a valid email, or skip below.' : 'We’ll save your progress and send you the report.'}
          {' '}No spam · unsubscribe any time · your data lives in Sydney.
        </p>
      </form>

      <div className="mt-5 flex flex-col items-center gap-2">
        <button type="button" onClick={onSkip} className="text-sm font-bold hover:opacity-70" style={{ fontFamily: B, color: PALETTE.body }}>
          Skip for now — just take the check →
        </button>
        <Link href="/atlas" className="text-sm font-bold hover:opacity-70" style={{ fontFamily: B, color: PALETTE.muted }}>
          Or talk it through with Atlas instead →
        </Link>
      </div>
    </div>
  );
}

// ── Quiz ─────────────────────────────────────────────────────────────────────
function QuizScreen({
  question,
  index,
  selected,
  onChoose,
  onBack,
  sttSupported,
  listening,
  onToggleListening,
  voiceOn,
}: {
  question: (typeof QUESTIONS)[number];
  index: number;
  selected: string | undefined;
  onChoose: (v: string) => void;
  onBack: () => void;
  sttSupported: boolean;
  listening: boolean;
  onToggleListening: () => void;
  voiceOn: boolean;
}) {
  return (
    <div className="mx-auto max-w-xl">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase" style={{ fontFamily: M, letterSpacing: '0.18em', color: PALETTE.muted }}>
          Question {index + 1} of {TOTAL_QUESTIONS}
        </span>
        {index > 0 ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-bold hover:opacity-70"
            style={{ fontFamily: B, color: PALETTE.body }}
          >
            <ArrowLeft size={13} aria-hidden /> Back
          </button>
        ) : null}
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {QUESTIONS.map((q, i) => (
          <span
            key={q.id}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: i <= index ? PALETTE.canary : PALETTE.hairline }}
          />
        ))}
      </div>

      {/* Question */}
      <p className="mt-9 text-[11px] font-bold uppercase" style={{ fontFamily: M, letterSpacing: '0.2em', color: PALETTE.gold }}>
        {question.eyebrow}
      </p>
      <h2 className="mt-2 text-3xl md:text-4xl" style={{ fontFamily: D, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
        {question.prompt}
      </h2>

      {/* Options */}
      <div className="mt-6 flex flex-col gap-3">
        {question.options.map((o, i) => {
          const isSel = selected === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChoose(o.value)}
              aria-pressed={isSel}
              className="group flex items-center gap-3 rounded-[18px] border px-5 py-4 text-left transition hover:-translate-y-0.5"
              style={{
                fontFamily: B,
                backgroundColor: isSel ? PALETTE.canary : PALETTE.cream,
                borderColor: isSel ? PALETTE.canary : PALETTE.hairline,
                color: PALETTE.ink,
              }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  fontFamily: M,
                  backgroundColor: isSel ? PALETTE.ink : PALETTE.paper,
                  color: isSel ? PALETTE.cream : PALETTE.muted,
                  border: `1px solid ${isSel ? PALETTE.ink : PALETTE.hairline}`,
                }}
              >
                {isSel ? <Check size={14} aria-hidden /> : String.fromCharCode(65 + i)}
              </span>
              <span className="min-w-0">
                <span className="block text-base font-bold leading-snug">{o.label}</span>
                {o.hint ? (
                  <span className="mt-0.5 block text-[11px]" style={{ fontFamily: M, color: isSel ? PALETTE.ink : PALETTE.muted }}>
                    {o.hint}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {/* Voice answer */}
      {sttSupported ? (
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleListening}
            aria-pressed={listening}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition"
            style={{
              fontFamily: B,
              backgroundColor: listening ? PALETTE.ink : PALETTE.paper,
              color: listening ? PALETTE.cream : PALETTE.ink,
              border: `1px solid ${listening ? PALETTE.ink : PALETTE.hairline}`,
            }}
          >
            {listening ? <MicOff size={15} aria-hidden /> : <Mic size={15} aria-hidden />}
            {listening ? 'Listening… say your answer' : 'Answer by voice'}
          </button>
          {voiceOn ? (
            <span className="text-[11px]" style={{ fontFamily: M, color: PALETTE.muted }}>
              Atlas reads each question aloud.
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ── Report ───────────────────────────────────────────────────────────────────
function ReportScreen({
  archetype,
  band,
  summary,
  picks,
  reasons,
  privacy,
  sector,
  firstBuild,
  shared,
  captured,
  email,
  setEmail,
  leadStatus,
  onSubmitLead,
  onSavePdf,
  onShare,
  copied,
  onRestart,
}: {
  archetype: Archetype;
  band: ReturnType<typeof bandForAnswers>;
  summary: string;
  picks: ReturnType<typeof recommendForAnswers>;
  reasons: string[];
  privacy: ReturnType<typeof privacyNotes>;
  sector: ReturnType<typeof sectorNotes>;
  firstBuild: string | null;
  shared: boolean;
  captured: boolean;
  email: string;
  setEmail: (v: string) => void;
  leadStatus: 'idle' | 'saving' | 'saved' | 'error';
  onSubmitLead: (e: React.FormEvent) => void;
  onSavePdf: () => void;
  onShare: () => void;
  copied: boolean;
  onRestart: () => void;
}) {
  const bandIndex = ['beginner', 'familiar', 'fluent', 'builder'].indexOf(band.key);
  const notes = [...privacy, ...sector];

  // Action buttons, ordered so the archetype's primary CTA leads (canary).
  const talkBtn = (
    <Link
      key="atlas"
      href="/atlas"
      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition"
      style={
        archetype.primaryCta === 'atlas'
          ? { backgroundColor: PALETTE.canary, color: PALETTE.ink, fontFamily: B }
          : { border: `1px solid ${PALETTE.hairline}`, color: PALETTE.ink, fontFamily: B }
      }
    >
      Talk it through with Atlas <ArrowRight size={15} aria-hidden />
    </Link>
  );

  return (
    <div className="mx-auto max-w-2xl">
      {/* Archetype header (primary axis) */}
      <p className="text-[11px] font-bold uppercase" style={{ fontFamily: M, letterSpacing: '0.2em', color: PALETTE.gold }}>
        Your situation
      </p>
      <div className="mt-2 flex flex-wrap items-baseline gap-3">
        <h1 className="text-4xl md:text-5xl" style={{ fontFamily: D, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {archetype.label}
        </h1>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase"
          style={{ fontFamily: M, letterSpacing: '0.08em', backgroundColor: PALETTE.cream, color: PALETTE.body, border: `1px solid ${PALETTE.hairline}` }}
          title={band.blurb}
        >
          AI skill · {band.label}
        </span>
      </div>
      <p className="mt-2 text-lg" style={{ fontFamily: D, fontStyle: 'italic', color: PALETTE.gold }}>
        {archetype.tagline}
      </p>
      {/* Skill ladder (secondary axis) */}
      <div className="mt-4 flex gap-1.5" aria-hidden>
        {['beginner', 'familiar', 'fluent', 'builder'].map((k, i) => (
          <span key={k} className="h-1 flex-1 rounded-full" style={{ backgroundColor: i <= bandIndex ? PALETTE.canary : PALETTE.hairline }} />
        ))}
      </div>
      <p className="mt-5 text-lg leading-relaxed" style={{ fontFamily: B, color: PALETTE.body }}>
        {archetype.blurb}
      </p>
      <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: B, color: PALETTE.muted }}>
        {summary}
      </p>

      {/* Recommendations */}
      <h2 className="mt-10 text-2xl" style={{ fontFamily: D, fontWeight: 600, letterSpacing: '-0.01em' }}>
        Three agents that fit you
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed" style={{ fontFamily: B, color: PALETTE.body }}>
        {archetype.recsIntro}
      </p>
      <div className="mt-4 flex flex-col gap-3">
        {picks.map((rec, i) => (
          <Link
            key={rec.slug}
            href={`/agents/${rec.slug}`}
            className="group flex items-start gap-4 rounded-[18px] border p-4 transition hover:-translate-y-0.5"
            style={{
              borderColor: i === 0 && archetype.key === 'too-busy' ? PALETTE.canary : PALETTE.hairline,
              backgroundColor: PALETTE.cream,
            }}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: PALETTE.paper }}>
              <AgentIcon name={rec.icon} className="h-6 w-6" tone={rec.tile} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className="text-lg font-bold" style={{ fontFamily: B, color: PALETTE.ink }}>
                  {rec.name}
                </span>
                {rec.teReo ? (
                  <span className="text-[10px]" style={{ fontFamily: M, color: PALETTE.muted }}>
                    {rec.teReo}
                  </span>
                ) : null}
                <span className="ml-auto text-[11px] font-bold" style={{ fontFamily: M, color: PALETTE.gold }}>
                  {rec.price}
                </span>
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed" style={{ fontFamily: B, color: PALETTE.body }}>
                {reasons[i]}
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* Privacy & compliance (framed by the archetype) */}
      {notes.length > 0 ? (
        <div className="mt-8 rounded-[18px] border p-5" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.paper }}>
          <p className="text-[11px] font-bold uppercase" style={{ fontFamily: M, letterSpacing: '0.18em', color: PALETTE.gold }}>
            Before you start — the NZ rules
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: B, color: PALETTE.body }}>
            {archetype.complianceLede}
          </p>
          <div className="mt-3 flex flex-col gap-4">
            {notes.map((n) => (
              <div key={n.act}>
                <p className="text-sm font-bold" style={{ fontFamily: B, color: PALETTE.ink }}>
                  {n.act}
                </p>
                <p className="mt-1 text-sm leading-relaxed" style={{ fontFamily: B, color: PALETTE.body }}>
                  {n.why}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Your first move (framed by the archetype) */}
      <div
        className="mt-8 rounded-[18px] border p-5"
        style={{ borderColor: archetype.primaryCta === 'pilot' ? PALETTE.canary : PALETTE.hairline, backgroundColor: PALETTE.cream }}
      >
        <p className="text-[11px] font-bold uppercase" style={{ fontFamily: M, letterSpacing: '0.18em', color: PALETTE.gold }}>
          {firstBuild ? 'Your suggested first build' : 'Your first move'}
        </p>
        <p className="mt-2 text-base leading-relaxed" style={{ fontFamily: B, color: PALETTE.body }}>
          {archetype.firstMove}
        </p>
        {firstBuild ? (
          <p className="mt-3 text-base leading-relaxed" style={{ fontFamily: D, fontStyle: 'italic', color: PALETTE.ink }}>
            “{firstBuild}”
          </p>
        ) : null}
        {archetype.primaryCta === 'pilot' ? (
          <Link
            href="/pilot"
            prefetch={false}
            className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:brightness-95"
            style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink, fontFamily: B }}
          >
            <Sparkles size={15} aria-hidden /> Build it with Pilot
          </Link>
        ) : archetype.primaryCta === 'browse' ? (
          <Link
            href="/agents"
            className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:brightness-95"
            style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink, fontFamily: B }}
          >
            Browse the shelf <ArrowRight size={15} aria-hidden />
          </Link>
        ) : null}
      </div>

      {/* Actions */}
      <div className="mt-9 flex flex-wrap items-center gap-3">
        {archetype.primaryCta === 'atlas' ? talkBtn : null}
        <button
          type="button"
          onClick={onSavePdf}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition hover:brightness-95"
          style={{ backgroundColor: PALETTE.ink, color: PALETTE.cream, fontFamily: B }}
        >
          <Download size={15} aria-hidden /> Save as PDF
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition hover:bg-[color:#FFF7EC]"
          style={{ borderColor: PALETTE.hairline, color: PALETTE.ink, fontFamily: B }}
        >
          {copied ? <Check size={15} aria-hidden /> : <Share2 size={15} aria-hidden />}
          {copied ? 'Link copied' : 'Share with my team'}
        </button>
        {archetype.primaryCta !== 'atlas' ? talkBtn : null}
      </div>

      {/* Lead capture — only when not captured at Q0 and not a shared view */}
      {!shared && !captured ? (
        <div className="mt-8 rounded-[18px] border p-5" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.cream }}>
          {leadStatus === 'saved' ? (
            <p className="text-sm font-bold" style={{ fontFamily: B, color: PALETTE.ink }}>
              <Check size={15} style={{ display: 'inline', verticalAlign: '-2px', color: PALETTE.gold }} aria-hidden /> Saved. We’ll send a
              follow-up in a week — no spam, unsubscribe any time.
            </p>
          ) : (
            <>
              <p className="text-base font-bold" style={{ fontFamily: B, color: PALETTE.ink }}>
                Want this report saved and a follow-up in a week?
              </p>
              <form onSubmit={onSubmitLead} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@work.co.nz"
                  className="flex-1 rounded-full border bg-white px-4 py-2.5 text-sm outline-none"
                  style={{ borderColor: PALETTE.hairline, color: PALETTE.ink, fontFamily: B }}
                  aria-label="Your email"
                />
                <button
                  type="submit"
                  disabled={leadStatus === 'saving'}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-50"
                  style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink, fontFamily: B }}
                >
                  {leadStatus === 'saving' ? 'Saving…' : 'Save my report'}
                </button>
              </form>
              {leadStatus === 'error' ? (
                <p className="mt-2 text-[11px]" style={{ fontFamily: M, color: '#7a2a1a' }}>
                  That didn’t go through — check the email and try again.
                </p>
              ) : (
                <p className="mt-2 text-[11px]" style={{ fontFamily: M, color: PALETTE.muted }}>
                  One email, a week from now. Your data lives in Sydney.
                </p>
              )}
            </>
          )}
        </div>
      ) : !shared && captured ? (
        <div className="mt-8 rounded-[18px] border p-4" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.cream }}>
          <p className="text-sm font-bold" style={{ fontFamily: B, color: PALETTE.ink }}>
            <Check size={15} style={{ display: 'inline', verticalAlign: '-2px', color: PALETTE.gold }} aria-hidden /> We’ve got your email — your
            report and a follow-up will land in a week. Save the PDF above for now.
          </p>
        </div>
      ) : null}

      <div className="mt-8 text-center">
        <button type="button" onClick={onRestart} className="text-sm font-bold hover:opacity-70" style={{ fontFamily: B, color: PALETTE.body }}>
          {shared ? 'Take the check yourself →' : 'Start over'}
        </button>
      </div>
    </div>
  );
}
