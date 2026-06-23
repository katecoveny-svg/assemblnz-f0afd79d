'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { PILOT_TOOLS, suggestTools, type PilotTool } from '@/lib/pilot/tool-registry';
import { resolveCompliance } from '@/lib/pilot/compliance';
import { emptyDraft, type PilotDraft, type ModelPreference, type PriceTier } from '@/lib/pilot/types';

// Local palette so the client bundle doesn't pull the whole agent registry.
const C = {
  canary: '#FFD42A',
  ink: '#3A3832',
  body: '#56544B',
  paper: '#FFFFFF',
  cream: '#FFF7EC',
  hairline: '#EFEADC',
  gold: '#C79B1F',
  muted: '#8A8678',
};

const MODEL_CHOICES: { id: ModelPreference; label: string; trade: string }[] = [
  { id: 'claude', label: 'Claude Sonnet', trade: 'Best for reasoning and careful drafting.' },
  { id: 'gpt', label: 'GPT-4o', trade: 'Fast, broad general knowledge.' },
  { id: 'gemini', label: 'Gemini Flash', trade: 'Lowest cost, quick replies.' },
  { id: 'llama', label: 'Llama 3.3', trade: 'Open weights — better for privacy.' },
];

const PRICE_CHOICES: { id: PriceTier; label: string }[] = [
  { id: 'free', label: 'Free' },
  { id: 'toro', label: '$9.99 / mo' },
  { id: 'business', label: '$199 / mo' },
];

const FREQUENCIES = [
  { id: 'one-off', label: 'One-off' },
  { id: 'daily', label: 'Daily' },
  { id: 'when-i-ask', label: 'When I ask' },
  { id: 'event-triggered', label: 'When something happens' },
] as const;

const INPUT_NEEDS = ['A document', 'An email', 'A photo', 'A date range', 'Raw text', 'Nothing'];
const ACCESS_OPTIONS = ['My calendar', 'My inbox', 'A Drive folder', 'A database', 'Nothing'];

const STEPS = [
  'Name',
  'Goal',
  'Inputs',
  'Tools',
  'Voice & safety',
  'Test drive',
  'Ship',
];

/** Pilot's spoken/written line for each step. */
const PILOT_LINES = [
  "I'm Pilot. I'll help you build your own agent, one step at a time — no code. First, what do you want to call it, and what should it do in one line?",
  'Good. Now the goal — what result should it produce, who reads it, and how often does it run?',
  "What does it need to start? And is there anything it should be able to look at — your calendar, your inbox, a folder?",
  "Here are the tools that fit. Keep the ones you want, drop the rest.",
  "I've written a first draft of its instructions, in plain assembl voice, with the right NZ rules built in. Read it, change anything, and pick a model.",
  "Let's take it for a test drive. Talk to it like you would for real. If it's too formal or misses something, tell me and I'll fix the instructions.",
  "Ready to ship. Save it to your own agents for free, or submit it for the marketplace. Either way it stays a draft until a human signs the Mana Receipt.",
];

export function PilotFlow({
  voiceConfigured,
  signedIn,
}: {
  voiceConfigured: boolean;
  signedIn: boolean;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PilotDraft>(emptyDraft());
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [promptModel, setPromptModel] = useState<string | null>(null);
  const [shipResult, setShipResult] = useState<
    | null
    | { ok: true; mode: string; receipt: { number?: number; chainHash?: string } | null; message: string }
    | { paywall: true; message: string }
  >(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const set = useCallback((patch: Partial<PilotDraft>) => setDraft((d) => ({ ...d, ...patch })), []);

  // ── Voice: speak Pilot's line ──────────────────────────────────────────
  const speak = useCallback(
    async (text: string) => {
      if (!voiceOn || !voiceConfigured) return;
      try {
        const res = await fetch('/api/voice/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (res.status !== 200) return; // 204 = not configured; fall back to text silently
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = url;
          await audioRef.current.play().catch(() => {});
        }
      } catch {
        /* speech is an enhancement; ignore failures */
      }
    },
    [voiceOn, voiceConfigured],
  );

  // Speak the step line whenever the step changes and voice is on.
  useEffect(() => {
    if (voiceOn) void speak(PILOT_LINES[step]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, voiceOn]);

  // ── Voice: listen (Web Speech API STT) → returns transcript ────────────
  const listen = useCallback((onResult: (text: string) => void) => {
    const SR =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new (SR as any)();
    rec.lang = 'en-NZ';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => {
      const text = e.results[0][0].transcript;
      onResult(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  }, []);

  const sttSupported =
    typeof window !== 'undefined' &&
    Boolean(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
    );

  // ── Step transitions ───────────────────────────────────────────────────
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Step 1 → fetch icon + te reo suggestions before moving on.
  async function leaveStep1() {
    setBusy(true);
    try {
      const res = await fetch('/api/pilot/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: draft.name, description: draft.description }),
      });
      if (res.ok) {
        const data = (await res.json()) as { icon: string; teReo: string; slug: string; category: string };
        set({
          icon: draft.icon === 'spark' ? data.icon : draft.icon,
          teReo: draft.teReo || data.teReo,
          slug: draft.slug || data.slug,
          category: data.category || draft.category,
        });
      }
    } finally {
      setBusy(false);
      next();
    }
  }

  // Entering step 4 → suggest tools from everything entered so far.
  function leaveStep3() {
    const text = [draft.name, draft.description, draft.goal.output, draft.goal.audience, ...draft.inputs.needs].join(' ');
    if (draft.tools.length === 0) set({ tools: suggestTools(text) });
    next();
  }

  // Entering step 5 → generate the system prompt.
  async function leaveStep4() {
    next(); // show step 5 immediately
    if (draft.systemPrompt) return; // already generated; let them re-gen manually
    await generatePrompt();
  }

  const generatePrompt = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/pilot/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          systemPrompt: string;
          compliance: string[];
          model: string | null;
        };
        set({ systemPrompt: data.systemPrompt, compliance: data.compliance });
        setPromptModel(data.model);
      }
    } finally {
      setBusy(false);
    }
  }, [draft, set]);

  const compliancePreview = useMemo(
    () =>
      resolveCompliance(
        draft.category,
        [draft.name, draft.description, draft.goal.output, draft.goal.audience].join(' '),
      ),
    [draft.category, draft.name, draft.description, draft.goal.output, draft.goal.audience],
  );

  // ── Ship ────────────────────────────────────────────────────────────────
  async function ship(mode: 'mine' | 'submit') {
    if (!signedIn) {
      window.location.href = `/login?redirectTo=${encodeURIComponent('/pilot')}`;
      return;
    }
    setBusy(true);
    setShipResult(null);
    try {
      const res = await fetch('/api/pilot/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft, mode }),
      });
      const data = await res.json();
      if (res.status === 402 && data.paywall) {
        setShipResult({ paywall: true, message: data.message });
      } else if (res.ok && data.ok) {
        setShipResult({
          ok: true,
          mode: data.mode,
          receipt: data.receipt ? { number: data.receipt.number, chainHash: data.receipt.chainHash } : null,
          message: data.message,
        });
      } else {
        setShipResult({ ok: true, mode, receipt: null, message: data.error ?? 'Something went wrong.' });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[260px_1fr] md:px-8">
      <audio ref={audioRef} className="hidden" />

      {/* ── Left rail: progress + voice toggle ── */}
      <aside className="md:sticky md:top-24 md:self-start">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${C.canary}55` }}
          >
            <AgentIcon name="pilot" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg leading-none" style={{ fontWeight: 900, color: C.ink }}>
              Pilot
            </p>
            <p className="mk-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>
              Kaiurungi · the agent maker
            </p>
          </div>
        </div>

        <ol className="mt-6 space-y-1">
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => i <= step && setStep(i)}
                  disabled={i > step}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition"
                  style={{
                    backgroundColor: active ? C.paper : 'transparent',
                    border: active ? `1px solid ${C.hairline}` : '1px solid transparent',
                    color: active ? C.ink : done ? C.body : C.muted,
                    fontWeight: active ? 700 : 400,
                    cursor: i <= step ? 'pointer' : 'default',
                  }}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]"
                    style={{
                      backgroundColor: done ? C.canary : active ? C.ink : C.hairline,
                      color: done ? C.ink : active ? C.canary : C.muted,
                      fontWeight: 700,
                    }}
                  >
                    {done ? <Check size={13} /> : i + 1}
                  </span>
                  {label}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setVoiceOn((v) => !v)}
            disabled={!voiceConfigured}
            title={voiceConfigured ? 'Toggle voice' : 'Voice not configured'}
            className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition disabled:opacity-40"
            style={{ borderColor: C.hairline, color: C.ink, backgroundColor: voiceOn ? `${C.canary}55` : C.paper }}
          >
            {voiceOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {voiceOn ? 'Voice on' : 'Voice off'}
          </button>
          <Link
            href="/agents/atlas/chat"
            className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition hover:bg-white"
            style={{ borderColor: C.hairline, color: C.body }}
          >
            <Sparkles size={15} /> Not sure what to build? Ask Atlas
          </Link>
        </div>
      </aside>

      {/* ── Main panel ── */}
      <section>
        {/* Pilot's line for this step */}
        <div
          className="mb-6 rounded-[22px] border p-5"
          style={{ borderColor: C.hairline, backgroundColor: C.paper }}
        >
          <p className="mk-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.gold }}>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
          <p className="mt-2 text-lg leading-relaxed" style={{ color: C.ink }}>
            {PILOT_LINES[step]}
          </p>
        </div>

        {step === 0 && <StepName draft={draft} set={set} listen={listen} listening={listening} sttSupported={sttSupported} />}
        {step === 1 && <StepGoal draft={draft} set={set} />}
        {step === 2 && <StepInputs draft={draft} set={set} />}
        {step === 3 && <StepTools draft={draft} set={set} />}
        {step === 4 && (
          <StepVoiceSafety
            draft={draft}
            set={set}
            busy={busy}
            promptModel={promptModel}
            compliance={compliancePreview}
            onRegenerate={generatePrompt}
          />
        )}
        {step === 5 && <StepTestDrive draft={draft} />}
        {step === 6 && (
          <StepShip
            draft={draft}
            set={set}
            busy={busy}
            signedIn={signedIn}
            result={shipResult}
            onShip={ship}
          />
        )}

        {/* Footer nav */}
        {step < 6 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition disabled:opacity-30"
              style={{ color: C.body }}
            >
              <ArrowLeft size={15} /> Back
            </button>
            <StepNextButton step={step} draft={draft} busy={busy} onNext={{ leaveStep1, leaveStep3, leaveStep4, next }} />
          </div>
        )}
      </section>
    </div>
  );
}

// ── Next button with per-step validation + transition ──────────────────────
function StepNextButton({
  step,
  draft,
  busy,
  onNext,
}: {
  step: number;
  draft: PilotDraft;
  busy: boolean;
  onNext: { leaveStep1: () => void; leaveStep3: () => void; leaveStep4: () => void; next: () => void };
}) {
  const canAdvance = (() => {
    if (step === 0) return draft.name.trim().length > 0 && draft.description.trim().length > 0;
    if (step === 1) return draft.goal.output.trim().length > 0;
    return true;
  })();

  function handle() {
    if (step === 0) return onNext.leaveStep1();
    if (step === 2) return onNext.leaveStep3();
    if (step === 3) return onNext.leaveStep4();
    return onNext.next();
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={!canAdvance || busy}
      className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition disabled:opacity-40"
      style={{ backgroundColor: C.canary, color: C.ink }}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : null}
      {step === 3 ? 'Write the instructions' : step === 4 ? 'Test drive' : 'Next'}
      {!busy && <ArrowRight size={15} />}
    </button>
  );
}

// ── Shared field components ─────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mk-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputStyle = {
  borderColor: C.hairline,
  color: C.ink,
  backgroundColor: C.paper,
};

// ── Step 1: Name + identity ─────────────────────────────────────────────────
function StepName({
  draft,
  set,
  listen,
  listening,
  sttSupported,
}: {
  draft: PilotDraft;
  set: (p: Partial<PilotDraft>) => void;
  listen: (cb: (t: string) => void) => void;
  listening: boolean;
  sttSupported: boolean;
}) {
  return (
    <div className="space-y-5">
      <Field label="What do you want to call it?">
        <div className="flex items-center gap-2">
          <input
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g. Lease Reader"
            className="w-full rounded-xl border px-4 py-3 text-base outline-none"
            style={inputStyle}
          />
          {sttSupported && (
            <button
              type="button"
              onClick={() => listen((t) => set({ name: t }))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
              style={{ borderColor: C.hairline, backgroundColor: listening ? `${C.canary}55` : C.paper }}
              title="Speak the name"
            >
              <Mic size={16} className={listening ? 'animate-pulse' : ''} />
            </button>
          )}
        </div>
      </Field>

      <Field label="One line — what does it do?">
        <div className="flex items-center gap-2">
          <input
            value={draft.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="e.g. Reads a tenancy agreement and flags the clauses that matter."
            className="w-full rounded-xl border px-4 py-3 text-base outline-none"
            style={inputStyle}
          />
          {sttSupported && (
            <button
              type="button"
              onClick={() => listen((t) => set({ description: t }))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
              style={{ borderColor: C.hairline, backgroundColor: listening ? `${C.canary}55` : C.paper }}
              title="Speak the description"
            >
              <Mic size={16} className={listening ? 'animate-pulse' : ''} />
            </button>
          )}
        </div>
      </Field>

      {/* identity preview (icon + te reo) */}
      {(draft.icon !== 'spark' || draft.teReo) && (
        <div className="flex items-center gap-3 rounded-xl border p-4" style={{ borderColor: C.hairline, backgroundColor: C.cream }}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${C.canary}55` }}>
            <AgentIcon name={draft.icon} className="h-6 w-6" />
          </span>
          <div className="text-sm" style={{ color: C.body }}>
            <p style={{ color: C.ink, fontWeight: 700 }}>
              {draft.name || 'Your agent'}{' '}
              {draft.teReo && (
                <span className="mk-mono text-[11px]" style={{ color: C.muted }}>
                  · {draft.teReo}
                </span>
              )}
            </p>
            <p className="text-xs">Suggested icon — change it any time.</p>
          </div>
          {draft.teReo && (
            <button
              type="button"
              onClick={() => set({ teReo: '' })}
              className="ml-auto mk-mono text-[10px] uppercase tracking-[0.16em] underline"
              style={{ color: C.muted }}
            >
              Drop te reo label
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Step 2: Goal ─────────────────────────────────────────────────────────────
function StepGoal({ draft, set }: { draft: PilotDraft; set: (p: Partial<PilotDraft>) => void }) {
  return (
    <div className="space-y-5">
      <Field label="What result does it produce?">
        <input
          value={draft.goal.output}
          onChange={(e) => set({ goal: { ...draft.goal, output: e.target.value } })}
          placeholder="a document, a summary, a calendar event, a calculation, a message…"
          className="w-full rounded-xl border px-4 py-3 text-base outline-none"
          style={inputStyle}
        />
      </Field>
      <Field label="Who reads it?">
        <div className="flex flex-wrap gap-2">
          {['Just me', 'My team', 'Customers', 'Regulators'].map((a) => (
            <Chip key={a} active={draft.goal.audience === a} onClick={() => set({ goal: { ...draft.goal, audience: a } })}>
              {a}
            </Chip>
          ))}
        </div>
      </Field>
      <Field label="How often does it run?">
        <div className="flex flex-wrap gap-2">
          {FREQUENCIES.map((f) => (
            <Chip
              key={f.id}
              active={draft.goal.frequency === f.id}
              onClick={() => set({ goal: { ...draft.goal, frequency: f.id } })}
            >
              {f.label}
            </Chip>
          ))}
        </div>
      </Field>
    </div>
  );
}

// ── Step 3: Inputs ───────────────────────────────────────────────────────────
function StepInputs({ draft, set }: { draft: PilotDraft; set: (p: Partial<PilotDraft>) => void }) {
  const toggle = (key: 'needs' | 'access', value: string) => {
    const cur = draft.inputs[key];
    const nextArr = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    set({ inputs: { ...draft.inputs, [key]: nextArr } });
  };
  return (
    <div className="space-y-5">
      <Field label="What does it need to start?">
        <div className="flex flex-wrap gap-2">
          {INPUT_NEEDS.map((n) => (
            <Chip key={n} active={draft.inputs.needs.includes(n)} onClick={() => toggle('needs', n)}>
              {n}
            </Chip>
          ))}
        </div>
      </Field>
      <Field label="Will it have access to anything?">
        <div className="flex flex-wrap gap-2">
          {ACCESS_OPTIONS.map((a) => (
            <Chip key={a} active={draft.inputs.access.includes(a)} onClick={() => toggle('access', a)}>
              {a}
            </Chip>
          ))}
        </div>
      </Field>
    </div>
  );
}

// ── Step 4: Tools ────────────────────────────────────────────────────────────
function StepTools({ draft, set }: { draft: PilotDraft; set: (p: Partial<PilotDraft>) => void }) {
  const groups = useMemo(() => {
    const byGroup: Record<string, PilotTool[]> = {};
    for (const t of PILOT_TOOLS) (byGroup[t.group] ??= []).push(t);
    return byGroup;
  }, []);

  const toggle = (id: string) => {
    set({ tools: draft.tools.includes(id) ? draft.tools.filter((t) => t !== id) : [...draft.tools, id] });
  };

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([group, tools]) => (
        <div key={group}>
          <p className="mk-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>
            {group}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {tools.map((t) => {
              const on = draft.tools.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggle(t.id)}
                  className="flex items-start gap-3 rounded-xl border p-3 text-left transition"
                  style={{
                    borderColor: on ? C.canary : C.hairline,
                    backgroundColor: on ? `${C.canary}22` : C.paper,
                  }}
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: on ? C.canary : C.hairline, color: C.ink }}
                  >
                    {on && <Check size={13} />}
                  </span>
                  <span>
                    <span className="block text-sm" style={{ color: C.ink, fontWeight: 700 }}>
                      {t.name}
                    </span>
                    <span className="block text-xs" style={{ color: C.body }}>
                      {t.blurb}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Step 5: Voice + safety ─────────────────────────────────────────────────
function StepVoiceSafety({
  draft,
  set,
  busy,
  promptModel,
  compliance,
  onRegenerate,
}: {
  draft: PilotDraft;
  set: (p: Partial<PilotDraft>) => void;
  busy: boolean;
  promptModel: string | null;
  compliance: { id: string; label: string; reason: string }[];
  onRegenerate: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Model picker */}
      <Field label="Which model should run it?">
        <div className="grid gap-2 sm:grid-cols-2">
          {MODEL_CHOICES.map((m) => {
            const on = draft.modelPreference === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => set({ modelPreference: m.id })}
                className="rounded-xl border p-3 text-left transition"
                style={{ borderColor: on ? C.canary : C.hairline, backgroundColor: on ? `${C.canary}22` : C.paper }}
              >
                <span className="block text-sm" style={{ color: C.ink, fontWeight: 700 }}>
                  {m.label}
                </span>
                <span className="block text-xs" style={{ color: C.body }}>
                  {m.trade}
                </span>
              </button>
            );
          })}
        </div>
      </Field>

      {/* Compliance auto-added */}
      {compliance.length > 0 && (
        <div className="rounded-xl border p-4" style={{ borderColor: C.hairline, backgroundColor: C.cream }}>
          <p className="mk-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: C.gold }}>
            NZ rules built in
          </p>
          <ul className="mt-2 space-y-1.5">
            {compliance.map((c) => (
              <li key={c.id} className="text-sm" style={{ color: C.body }}>
                <span style={{ color: C.ink, fontWeight: 700 }}>{c.label}</span> — {c.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* The generated prompt */}
      <Field label="The instructions (draft — edit anything)">
        <div className="relative">
          <textarea
            value={draft.systemPrompt}
            onChange={(e) => set({ systemPrompt: e.target.value })}
            rows={16}
            placeholder={busy ? 'Pilot is writing the instructions…' : 'Instructions will appear here.'}
            className="w-full rounded-xl border px-4 py-3 font-mono text-xs leading-relaxed outline-none"
            style={inputStyle}
          />
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(255,247,236,0.7)' }}>
              <Loader2 className="animate-spin" style={{ color: C.gold }} />
            </div>
          )}
        </div>
      </Field>

      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: C.muted }}>
          {promptModel ? `Written by ${promptModel}.` : ''} In assembl voice — sentence case, no slop, draft only.
        </p>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-bold disabled:opacity-40"
          style={{ borderColor: C.hairline, color: C.ink }}
        >
          <RefreshCw size={14} /> Rewrite
        </button>
      </div>
    </div>
  );
}

// ── Step 6: Test drive (sandbox chat) ───────────────────────────────────────
function StepTestDrive({ draft }: { draft: PilotDraft }) {
  const greeting: UIMessage = {
    id: 'greeting',
    role: 'assistant',
    parts: [{ type: 'text', text: `Hi — I'm ${draft.name || 'your draft agent'}. Try me out.` }],
  };

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/pilot/sandbox',
      body: { systemPrompt: draft.systemPrompt, modelPreference: draft.modelPreference },
    }),
    messages: [greeting],
  });

  const [input, setInput] = useState('');
  const busy = status === 'submitted' || status === 'streaming';
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  function textOf(m: UIMessage): string {
    return m.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('');
  }

  function submit() {
    const t = input.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput('');
  }

  return (
    <div className="flex flex-col rounded-[22px] border" style={{ borderColor: C.hairline, backgroundColor: C.cream, height: 460 }}>
      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const text = textOf(m);
          if (!text) return null;
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className="max-w-[85%] rounded-[18px] px-4 py-2.5 text-sm leading-relaxed"
              style={
                isUser
                  ? { alignSelf: 'flex-end', backgroundColor: C.canary, color: C.ink }
                  : { alignSelf: 'flex-start', backgroundColor: C.paper, color: C.body, border: `1px solid ${C.hairline}` }
              }
            >
              <p className="whitespace-pre-wrap">{text}</p>
            </div>
          );
        })}
        {busy && (
          <div className="self-start rounded-[18px] border px-4 py-2.5" style={{ borderColor: C.hairline, backgroundColor: C.paper }}>
            <Loader2 size={16} className="animate-spin" style={{ color: C.gold }} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 border-t p-3" style={{ borderColor: C.hairline }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={draft.systemPrompt ? 'Try an example…' : 'Write the instructions first (step 5).'}
          disabled={!draft.systemPrompt}
          className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none"
          style={inputStyle}
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl disabled:opacity-40"
          style={{ backgroundColor: C.canary, color: C.ink }}
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ── Step 7: Ship ─────────────────────────────────────────────────────────────
function StepShip({
  draft,
  set,
  busy,
  signedIn,
  result,
  onShip,
}: {
  draft: PilotDraft;
  set: (p: Partial<PilotDraft>) => void;
  busy: boolean;
  signedIn: boolean;
  result:
    | null
    | { ok: true; mode: string; receipt: { number?: number; chainHash?: string } | null; message: string }
    | { paywall: true; message: string };
  onShip: (mode: 'mine' | 'submit') => void;
}) {
  if (result && 'ok' in result) {
    return (
      <div className="rounded-[22px] border p-6 text-center" style={{ borderColor: C.canary, backgroundColor: `${C.canary}22` }}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: C.canary }}>
          <Check style={{ color: C.ink }} />
        </span>
        <p className="mt-3 text-lg" style={{ color: C.ink, fontWeight: 900 }}>
          {draft.name} is saved.
        </p>
        <p className="mt-1 text-sm" style={{ color: C.body }}>
          {result.message}
        </p>
        {result.receipt && (
          <p className="mk-mono mt-3 text-[10px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>
            Mana Receipt #{result.receipt.number} · {result.receipt.chainHash?.slice(0, 12)}…
          </p>
        )}
        <Link
          href="/agents/mine"
          className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
          style={{ backgroundColor: C.ink, color: C.canary }}
        >
          Go to My Agents <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="flex items-start gap-4 rounded-[22px] border p-5" style={{ borderColor: C.hairline, backgroundColor: C.paper }}>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${C.canary}55` }}>
          <AgentIcon name={draft.icon} className="h-7 w-7" />
        </span>
        <div className="flex-1">
          <p className="text-xl leading-tight" style={{ color: C.ink, fontWeight: 900 }}>
            {draft.name || 'Untitled agent'}{' '}
            {draft.teReo && <span className="mk-mono text-xs" style={{ color: C.muted }}>· {draft.teReo}</span>}
          </p>
          <p className="mt-1 text-sm" style={{ color: C.body }}>
            {draft.description}
          </p>
          <p className="mk-mono mt-2 text-[10px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>
            {draft.tools.length} tools · {MODEL_CHOICES.find((m) => m.id === draft.modelPreference)?.label} · {draft.compliance.length} NZ rules
          </p>
        </div>
      </div>

      {/* Price tier for submit */}
      <Field label="If you submit it to the marketplace, suggested price">
        <div className="flex flex-wrap gap-2">
          {PRICE_CHOICES.map((p) => (
            <Chip key={p.id} active={draft.priceTier === p.id} onClick={() => set({ priceTier: p.id })}>
              {p.label}
            </Chip>
          ))}
        </div>
      </Field>

      {result && 'paywall' in result && (
        <div className="rounded-xl border p-4 text-sm" style={{ borderColor: C.gold, backgroundColor: `${C.canary}22`, color: C.ink }}>
          {result.message}{' '}
          <Link href="/agents/pricing" className="underline" style={{ fontWeight: 700 }}>
            See Pilot pricing
          </Link>
        </div>
      )}

      {!signedIn && (
        <p className="text-sm" style={{ color: C.muted }}>
          You&apos;ll be asked to sign in to save your agent — the first one is free.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onShip('mine')}
          disabled={busy}
          className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold disabled:opacity-40"
          style={{ backgroundColor: C.canary, color: C.ink }}
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Save to My Agents (free)
        </button>
        <button
          type="button"
          onClick={() => onShip('submit')}
          disabled={busy}
          className="flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold disabled:opacity-40"
          style={{ borderColor: C.ink, color: C.ink }}
        >
          Submit for marketplace review
        </button>
      </div>
      <p className="text-xs" style={{ color: C.muted }}>
        Every agent stays a draft until a human signs the Mana Receipt. Submitting starts tikanga, brand and
        compliance review — it does not publish.
      </p>
    </div>
  );
}

// ── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-4 py-2 text-sm font-bold transition"
      style={{
        borderColor: active ? C.canary : C.hairline,
        backgroundColor: active ? C.canary : C.paper,
        color: C.ink,
      }}
    >
      {children}
    </button>
  );
}
