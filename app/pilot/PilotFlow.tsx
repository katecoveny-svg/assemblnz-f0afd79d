'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, ArrowLeft, Check, Loader2, Mic, Volume2, VolumeX, Sparkles,
  Map, Shield, AlertTriangle, Plus,
} from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import {
  DOMAINS, RESULT_TYPES, KNOWLEDGE_BY_KIND, KNOWLEDGE_KIND_LABEL,
  TOOLS_BY_CATEGORY, TOOL_CATEGORY_LABEL, type ToolCategory,
} from '@/lib/pilot/catalogues';
import { buildPack, agentTypeLabel } from '@/lib/pilot/pack-builder';
import {
  emptyDraft, BRAINS, PACK_ITEM_LABELS,
  type PilotDraft, type ModelPreference, type PriceTier, type AgentType,
  type AgentTone, type WorkflowMap, type AgentPack, type TestCase,
} from '@/lib/pilot/types';
import type { KnowledgeKind } from '@/lib/pilot/types';

const C = {
  canary: '#FFD42A', ink: '#3A3832', body: '#56544B', paper: '#FFFFFF',
  cream: '#FFF7EC', hairline: '#EFEADC', gold: '#C79B1F', muted: '#8A8678',
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

const TONES: { id: AgentTone; label: string }[] = [
  { id: 'warm', label: 'Warm' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'formal', label: 'Formal' },
  { id: 'specialist', label: 'Specialist' },
];

const STEPS = [
  'Goal', 'Workflow', 'Agent type', 'User', 'Knowledge', 'Tools', 'Guardrails',
  'Draft pack', 'System prompt', 'Test cases', 'Test drive', 'Launch plan', 'Ship',
];

const PILOT_LINES = [
  "I'm Pilot. Let's build your agent. First — what should we call it, what does it do, and what kind of work is it for?",
  'How is this done today? Walk me through it — what kicks it off, what goes in, the steps, who is involved.',
  "What shape should it be? Most things work best as an assistant or a set workflow. Full autonomy only when the risk is low or approval is built in.",
  'Who uses it? Their role, how often, and whether they can approve things.',
  'What should it know? Pick the sources it can draw on.',
  'What can it touch? Reading is safe; actions need care. Pick the tools it needs.',
  "What must it never do, and where should it stop and ask a human?",
  "Here's the full pack — 19 items, grouped by the six brains every assembl agent has. Read it over.",
  "This is its system prompt, from the canonical template with your NZ rules built in. Edit anything.",
  "I've written six tests — happy path, messy input, out of scope, risky action, tool failure, quality. Add your own if you like.",
  "Let's take it for a test drive. Run the tests, or just talk to it. Tell me what to fix.",
  "Here's a one-week launch plan so you can roll it out safely.",
  "Ready to ship. Save it to your own agents, or submit it for the marketplace. It stays a draft until a human signs the Mana Receipt.",
];

// Action banked when advancing FROM each step (null = no points action here).
const STEP_ACTIONS: (string | null)[] = [
  'pilot-step-goal', 'pilot-step-workflow', 'pilot-step-agent-type', 'pilot-step-user',
  'pilot-step-knowledge', 'pilot-step-tools', 'pilot-step-guardrails', 'pilot-step-pack',
  'pilot-step-system-prompt', null, 'pilot-tested', 'pilot-launch-plan', null,
];

export function PilotFlow({ voiceConfigured, signedIn }: { voiceConfigured: boolean; signedIn: boolean }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PilotDraft>(emptyDraft());
  const [points, setPoints] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shipResult, setShipResult] = useState<
    | null
    | { ok: true; mode: string; pointsAwarded: number; receipt: { number?: number; chainHash?: string } | null; message: string }
    | { paywall: true; message: string }
  >(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const set = useCallback((patch: Partial<PilotDraft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const setSpec = useCallback(
    (patch: Partial<PilotDraft['spec']>) => setDraft((d) => ({ ...d, spec: { ...d.spec, ...patch } })),
    [],
  );

  // ── Voice ───────────────────────────────────────────────────────────────
  const speak = useCallback(async (text: string) => {
    if (!voiceOn || !voiceConfigured) return;
    try {
      const res = await fetch('/api/voice/tts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      });
      if (res.status !== 200) return;
      const url = URL.createObjectURL(await res.blob());
      if (audioRef.current) { audioRef.current.src = url; await audioRef.current.play().catch(() => {}); }
    } catch { /* speech is an enhancement */ }
  }, [voiceOn, voiceConfigured]);

  useEffect(() => { if (voiceOn) void speak(PILOT_LINES[step]); /* eslint-disable-next-line */ }, [step, voiceOn]);

  const sttSupported = typeof window !== 'undefined' && Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
  );
  const listen = useCallback((onResult: (t: string) => void) => {
    const SR = (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new (SR as any)();
    rec.lang = 'en-NZ'; rec.interimResults = false; rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => onResult(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  }, []);

  // ── Points: persist draft + emit to the shared game layer ────────────────
  const ensureDraft = useCallback(async (): Promise<string | null> => {
    if (!signedIn) return null;
    if (draft.id) return draft.id;
    try {
      const res = await fetch('/api/pilot/draft', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draft }),
      });
      if (!res.ok) return null;
      const { draft: stored } = await res.json();
      set({ id: stored.id });
      return stored.id as string;
    } catch { return null; }
  }, [signedIn, draft, set]);

  const bankAction = useCallback(async (action: string | null) => {
    if (!action || !signedIn) return;
    const id = await ensureDraft();
    try {
      const res = await fetch('/api/game/award', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, meta: id ? { draft: id } : {} }),
      });
      const data = await res.json();
      if (data.signedIn && data.awarded > 0) {
        setPoints(data.points ?? 0);
        setFlash(data.awarded);
        setTimeout(() => setFlash(null), 1800);
      }
    } catch { /* gamification never blocks the flow */ }
  }, [signedIn, ensureDraft]);

  // ── Step transitions ──────────────────────────────────────────────────────
  const generatePack = useCallback(() => {
    setDraft((d) => ({ ...d, pack: buildPack(d) }));
  }, []);

  const advance = useCallback(async () => {
    const action = STEP_ACTIONS[step];
    // Entering the pack step → generate it first.
    if (step === 6) generatePack();
    void bankAction(action);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, [step, bankAction, generatePack]);

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canAdvance = (() => {
    if (step === 0) return draft.name.trim().length > 0 && draft.spec.domain !== '' && draft.spec.resultType !== '';
    if (step === 1) return draft.spec.workflow.trigger.trim().length > 0 || draft.spec.workflow.steps.trim().length > 0;
    return true;
  })();

  // ── Ship ──────────────────────────────────────────────────────────────────
  async function ship(mode: 'mine' | 'submit') {
    if (!signedIn) { window.location.href = `/login?redirectTo=${encodeURIComponent('/pilot')}`; return; }
    setBusy(true); setShipResult(null);
    try {
      // Make sure the latest pack is on the draft.
      const withPack = { ...draft, pack: draft.pack ?? buildPack(draft) };
      const res = await fetch('/api/pilot/ship', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draft: withPack, mode }),
      });
      const data = await res.json();
      if (res.status === 402 && data.paywall) {
        setShipResult({ paywall: true, message: data.message });
      } else if (res.ok && data.ok) {
        if (data.pointsAwarded) { setPoints((p) => p + data.pointsAwarded); setFlash(data.pointsAwarded); setTimeout(() => setFlash(null), 2200); }
        setShipResult({ ok: true, mode: data.mode, pointsAwarded: data.pointsAwarded ?? 0,
          receipt: data.receipt ? { number: data.receipt.number, chainHash: data.receipt.chainHash } : null, message: data.message });
      } else {
        setShipResult({ ok: true, mode, pointsAwarded: 0, receipt: null, message: data.error ?? 'Something went wrong.' });
      }
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[260px_1fr] md:px-8">
      <audio ref={audioRef} className="hidden" />

      {/* ── Left rail ── */}
      <aside className="md:sticky md:top-24 md:self-start">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${C.canary}55` }}>
            <AgentIcon name="pilot" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg leading-none" style={{ fontWeight: 900, color: C.ink }}>Pilot</p>
            <p className="mk-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>Kaiurungi · agent maker</p>
          </div>
        </div>

        {/* Points pill */}
        <div className="relative mt-4 flex items-center justify-between rounded-full border px-3 py-2"
             style={{ borderColor: C.hairline, backgroundColor: C.paper }}>
          <span className="mk-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>Points</span>
          <span className="text-sm" style={{ fontWeight: 900, color: C.ink }}>{points}</span>
          {flash !== null && (
            <span className="absolute -right-1 -top-3 rounded-full px-2 py-0.5 text-[11px]"
                  style={{ backgroundColor: C.canary, color: C.ink, fontWeight: 900 }}>+{flash}</span>
          )}
        </div>

        <ol className="mt-4 space-y-0.5">
          {STEPS.map((label, i) => {
            const done = i < step, active = i === step;
            return (
              <li key={label}>
                <button type="button" onClick={() => i <= step && setStep(i)} disabled={i > step}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition"
                  style={{ backgroundColor: active ? C.paper : 'transparent', border: active ? `1px solid ${C.hairline}` : '1px solid transparent',
                    color: active ? C.ink : done ? C.body : C.muted, fontWeight: active ? 700 : 400, cursor: i <= step ? 'pointer' : 'default' }}>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]"
                    style={{ backgroundColor: done ? C.canary : active ? C.ink : C.hairline, color: done ? C.ink : active ? C.canary : C.muted, fontWeight: 700 }}>
                    {done ? <Check size={11} /> : i + 1}
                  </span>
                  {label}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex flex-col gap-2">
          <button type="button" onClick={() => setVoiceOn((v) => !v)} disabled={!voiceConfigured}
            title={voiceConfigured ? 'Toggle voice' : 'Voice not configured'}
            className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition disabled:opacity-40"
            style={{ borderColor: C.hairline, color: C.ink, backgroundColor: voiceOn ? `${C.canary}55` : C.paper }}>
            {voiceOn ? <Volume2 size={15} /> : <VolumeX size={15} />} {voiceOn ? 'Voice on' : 'Voice off'}
          </button>
          <Link href="/journey" className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition hover:bg-white"
            style={{ borderColor: C.hairline, color: C.body }}>
            <Map size={15} /> Your journey
          </Link>
          <Link href="/agents/atlas/chat" className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition hover:bg-white"
            style={{ borderColor: C.hairline, color: C.body }}>
            <Sparkles size={15} /> Not sure? Ask Atlas
          </Link>
        </div>
      </aside>

      {/* ── Main panel ── */}
      <section>
        <div className="mb-6 rounded-[22px] border p-5" style={{ borderColor: C.hairline, backgroundColor: C.paper }}>
          <p className="mk-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.gold }}>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
          <p className="mt-2 text-lg leading-relaxed" style={{ color: C.ink }}>{PILOT_LINES[step]}</p>
        </div>

        {step === 0 && <StepGoal draft={draft} set={set} setSpec={setSpec} listen={listen} listening={listening} sttSupported={sttSupported} />}
        {step === 1 && <StepWorkflow draft={draft} setSpec={setSpec} />}
        {step === 2 && <StepAgentType draft={draft} setSpec={setSpec} />}
        {step === 3 && <StepUser draft={draft} setSpec={setSpec} />}
        {step === 4 && <StepKnowledge draft={draft} setSpec={setSpec} />}
        {step === 5 && <StepTools draft={draft} setSpec={setSpec} />}
        {step === 6 && <StepGuardrails draft={draft} setSpec={setSpec} />}
        {step === 7 && <StepPack draft={draft} />}
        {step === 8 && <StepSystemPrompt draft={draft} set={set} />}
        {step === 9 && <StepTestCases draft={draft} set={set} />}
        {step === 10 && <StepTestDrive draft={draft} />}
        {step === 11 && <StepLaunch draft={draft} />}
        {step === 12 && <StepShip draft={draft} set={set} busy={busy} signedIn={signedIn} result={shipResult} onShip={ship} />}

        {step < 12 && (
          <div className="mt-8 flex items-center justify-between">
            <button type="button" onClick={back} disabled={step === 0}
              className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition disabled:opacity-30" style={{ color: C.body }}>
              <ArrowLeft size={15} /> Back
            </button>
            <button type="button" onClick={advance} disabled={!canAdvance}
              className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition disabled:opacity-40"
              style={{ backgroundColor: C.canary, color: C.ink }}>
              {step === 6 ? 'Draft the pack' : step === 11 ? 'Ship it' : 'Next'} <ArrowRight size={15} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

// ── Shared bits ───────────────────────────────────────────────────────────
const inputStyle = { borderColor: C.hairline, color: C.ink, backgroundColor: C.paper };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mk-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full border px-4 py-2 text-sm font-bold transition"
      style={{ borderColor: active ? C.canary : C.hairline, backgroundColor: active ? C.canary : C.paper, color: C.ink }}>
      {children}
    </button>
  );
}

function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [text, setText] = useState('');
  const add = () => { const t = text.trim(); if (t) { onChange([...values, t]); setText(''); } };
  return (
    <div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder} className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none" style={inputStyle} />
        <button type="button" onClick={add} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: C.canary, color: C.ink }}>
          <Plus size={16} />
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v, i) => (
            <span key={i} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs" style={{ backgroundColor: C.cream, color: C.ink, border: `1px solid ${C.hairline}` }}>
              {v}
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} style={{ color: C.muted }}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 1: Goal (name + identity + domain + result + tone) ─────────────────
function StepGoal({ draft, set, setSpec, listen, listening, sttSupported }: {
  draft: PilotDraft; set: (p: Partial<PilotDraft>) => void; setSpec: (p: Partial<PilotDraft['spec']>) => void;
  listen: (cb: (t: string) => void) => void; listening: boolean; sttSupported: boolean;
}) {
  return (
    <div className="space-y-5">
      <Field label="What do you want to call it?">
        <div className="flex items-center gap-2">
          <input value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Lease Reader"
            className="w-full rounded-xl border px-4 py-3 text-base outline-none" style={inputStyle} />
          {sttSupported && (
            <button type="button" onClick={() => listen((t) => set({ name: t }))} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
              style={{ borderColor: C.hairline, backgroundColor: listening ? `${C.canary}55` : C.paper }} title="Speak the name">
              <Mic size={16} className={listening ? 'animate-pulse' : ''} />
            </button>
          )}
        </div>
      </Field>
      <Field label="One line — what does it do?">
        <input value={draft.description} onChange={(e) => set({ description: e.target.value })}
          placeholder="e.g. Reads a tenancy agreement and flags the clauses that matter."
          className="w-full rounded-xl border px-4 py-3 text-base outline-none" style={inputStyle} />
      </Field>
      <Field label="What kind of work is it for?">
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((d) => <Chip key={d.id} active={draft.spec.domain === d.id} onClick={() => setSpec({ domain: d.id })}>{d.label}</Chip>)}
        </div>
      </Field>
      <Field label="What result does it produce?">
        <div className="flex flex-wrap gap-2">
          {RESULT_TYPES.map((r) => <Chip key={r.id} active={draft.spec.resultType === r.id} onClick={() => setSpec({ resultType: r.id })}>{r.label}</Chip>)}
        </div>
      </Field>
      <Field label="Tone">
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => <Chip key={t.id} active={draft.spec.tone === t.id} onClick={() => setSpec({ tone: t.id })}>{t.label}</Chip>)}
        </div>
      </Field>
    </div>
  );
}

// ── Step 2: Workflow map ────────────────────────────────────────────────────
function StepWorkflow({ draft, setSpec }: { draft: PilotDraft; setSpec: (p: Partial<PilotDraft['spec']>) => void }) {
  const w = draft.spec.workflow;
  const upd = (patch: Partial<WorkflowMap>) => setSpec({ workflow: { ...w, ...patch } });
  const rows: { key: keyof WorkflowMap; label: string; ph: string }[] = [
    { key: 'trigger', label: 'What starts it?', ph: 'e.g. a new tenancy agreement lands in my inbox' },
    { key: 'inputs', label: 'What goes in?', ph: 'e.g. the signed PDF' },
    { key: 'steps', label: 'The steps today', ph: 'e.g. read it, find the rent + bond + termination clauses…' },
    { key: 'decisions', label: 'Decisions made', ph: 'e.g. is the bond more than 4 weeks rent?' },
    { key: 'peopleInvolved', label: 'People involved', ph: 'e.g. me, sometimes the property manager' },
    { key: 'output', label: 'What comes out?', ph: 'e.g. a short summary of the risky clauses' },
    { key: 'approvalNeeded', label: 'Approval needed?', ph: 'e.g. nothing is sent without me checking' },
    { key: 'risks', label: 'Risks', ph: 'e.g. missing an unfair clause' },
  ];
  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <Field key={r.key} label={r.label}>
          <textarea value={w[r.key]} onChange={(e) => upd({ [r.key]: e.target.value } as Partial<WorkflowMap>)} rows={2}
            placeholder={r.ph} className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none" style={inputStyle} />
        </Field>
      ))}
    </div>
  );
}

// ── Step 3: Agent type (coach toward the safe default) ──────────────────────
function StepAgentType({ draft, setSpec }: { draft: PilotDraft; setSpec: (p: Partial<PilotDraft['spec']>) => void }) {
  const types: AgentType[] = ['assistant', 'workflow', 'agent'];
  return (
    <div className="space-y-3">
      {types.map((t) => {
        const on = draft.spec.agentType === t;
        const autonomous = t === 'agent';
        return (
          <button key={t} type="button" onClick={() => setSpec({ agentType: t })}
            className="block w-full rounded-2xl border p-4 text-left transition"
            style={{ borderColor: on ? C.canary : C.hairline, backgroundColor: on ? `${C.canary}22` : C.paper }}>
            <span className="flex items-center justify-between">
              <span className="text-sm" style={{ color: C.ink, fontWeight: 700 }}>{agentTypeLabel(t)}</span>
              {t !== 'agent' && <span className="mk-mono text-[9px] uppercase tracking-[0.14em] rounded-full px-2 py-0.5" style={{ backgroundColor: C.cream, color: C.gold }}>recommended</span>}
            </span>
            {autonomous && on && (
              <span className="mt-2 flex items-start gap-2 rounded-xl p-2.5 text-xs" style={{ backgroundColor: `${C.canary}22`, color: C.ink }}>
                <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: C.gold }} />
                Full autonomy is riskier. Only choose this if the task is low-risk, or approval is built in (you set that next). Most agents are safer as an assistant or workflow.
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Step 4: User ────────────────────────────────────────────────────────────
function StepUser({ draft, setSpec }: { draft: PilotDraft; setSpec: (p: Partial<PilotDraft['spec']>) => void }) {
  const u = draft.spec.user;
  const upd = (patch: Partial<typeof u>) => setSpec({ user: { ...u, ...patch } });
  return (
    <div className="space-y-5">
      <Field label="Who uses it?"><input value={u.who} onChange={(e) => upd({ who: e.target.value })} placeholder="e.g. me, or my property team" className="w-full rounded-xl border px-4 py-3 text-base outline-none" style={inputStyle} /></Field>
      <Field label="Their role"><input value={u.role} onChange={(e) => upd({ role: e.target.value })} placeholder="e.g. property manager" className="w-full rounded-xl border px-4 py-3 text-base outline-none" style={inputStyle} /></Field>
      <Field label="Technical level">
        <div className="flex flex-wrap gap-2">{(['beginner', 'intermediate', 'advanced'] as const).map((v) => <Chip key={v} active={u.technicalLevel === v} onClick={() => upd({ technicalLevel: v })}>{v}</Chip>)}</div>
      </Field>
      <Field label="How often?">
        <div className="flex flex-wrap gap-2">{(['one-off', 'daily', 'weekly', 'when-needed'] as const).map((v) => <Chip key={v} active={u.frequency === v} onClick={() => upd({ frequency: v })}>{v.replace('-', ' ')}</Chip>)}</div>
      </Field>
      <Field label="Can they approve actions?">
        <div className="flex flex-wrap gap-2">{(['none', 'own-work', 'team', 'full'] as const).map((v) => <Chip key={v} active={u.approvalAuthority === v} onClick={() => upd({ approvalAuthority: v })}>{v.replace('-', ' ')}</Chip>)}</div>
      </Field>
    </div>
  );
}

// ── Step 5: Knowledge sources ───────────────────────────────────────────────
function StepKnowledge({ draft, setSpec }: { draft: PilotDraft; setSpec: (p: Partial<PilotDraft['spec']>) => void }) {
  const toggle = (id: string) => setSpec({ knowledge: draft.spec.knowledge.includes(id) ? draft.spec.knowledge.filter((k) => k !== id) : [...draft.spec.knowledge, id] });
  const kinds: KnowledgeKind[] = ['static', 'live', 'user-provided', 'system'];
  return (
    <div className="space-y-6">
      {kinds.map((kind) => (
        <div key={kind}>
          <p className="mk-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>{KNOWLEDGE_KIND_LABEL[kind]}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {KNOWLEDGE_BY_KIND[kind].map((s) => <Chip key={s.id} active={draft.spec.knowledge.includes(s.id)} onClick={() => toggle(s.id)}>{s.label}</Chip>)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Step 6: Tools by category ───────────────────────────────────────────────
function StepTools({ draft, setSpec }: { draft: PilotDraft; setSpec: (p: Partial<PilotDraft['spec']>) => void }) {
  const toggle = (id: string) => setSpec({ tools: draft.spec.tools.includes(id) ? draft.spec.tools.filter((t) => t !== id) : [...draft.spec.tools, id] });
  const cats: ToolCategory[] = ['read', 'action', 'automation', 'knowledge', 'approval'];
  return (
    <div className="space-y-5">
      {cats.map((cat) => (
        <div key={cat}>
          <p className="mk-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: cat === 'action' || cat === 'automation' ? C.gold : C.muted }}>{TOOL_CATEGORY_LABEL[cat]}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TOOLS_BY_CATEGORY[cat].map((t) => <Chip key={t.id} active={draft.spec.tools.includes(t.id)} onClick={() => toggle(t.id)}>{t.label}</Chip>)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Step 7: Guardrails ──────────────────────────────────────────────────────
function StepGuardrails({ draft, setSpec }: { draft: PilotDraft; setSpec: (p: Partial<PilotDraft['spec']>) => void }) {
  const g = draft.spec.guardrails;
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-xl border p-4" style={{ borderColor: C.hairline, backgroundColor: C.cream }}>
        <Shield size={16} className="mt-0.5 shrink-0" style={{ color: C.gold }} />
        <p className="text-sm" style={{ color: C.body }}>
          Every agent gets a safety floor automatically — it will never send, delete, buy or publish without approval, and never invent facts. Add anything specific to your work.
        </p>
      </div>
      <Field label="What must it never do?">
        <TagInput values={g.neverDo} onChange={(v) => setSpec({ guardrails: { ...g, neverDo: v } })} placeholder="e.g. never quote a price without checking the rate card" />
      </Field>
      <Field label="Where must it stop and ask a human?">
        <TagInput values={g.approvalPoints} onChange={(v) => setSpec({ guardrails: { ...g, approvalPoints: v } })} placeholder="e.g. before emailing a tenant" />
      </Field>
    </div>
  );
}

// ── Step 8: Draft pack (6 brains) ───────────────────────────────────────────
function StepPack({ draft }: { draft: PilotDraft }) {
  const pack = draft.pack;
  if (!pack) return <p className="text-sm" style={{ color: C.muted }}>Generating the pack…</p>;
  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: C.body }}>All 19 items, under the six brains every assembl agent is built from.</p>
      {BRAINS.map((brain) => (
        <div key={brain.id} className="rounded-[20px] border p-4" style={{ borderColor: C.hairline, backgroundColor: C.paper }}>
          <p className="text-sm" style={{ color: C.ink, fontWeight: 900 }}>{brain.label}</p>
          <p className="mk-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: C.muted }}>{brain.blurb}</p>
          <div className="mt-3 space-y-2">
            {brain.items.map((key) => <PackRow key={key} label={PACK_ITEM_LABELS[key]} value={pack[key]} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function PackRow({ label, value }: { label: string; value: unknown }) {
  let text = '';
  if (Array.isArray(value)) text = value.length ? `${value.length} item${value.length > 1 ? 's' : ''}` : 'TBD';
  else if (typeof value === 'string') text = value.trim() ? value.slice(0, 90) : 'TBD';
  else text = value ? 'set' : 'TBD';
  const tbd = text === 'TBD';
  return (
    <div className="flex items-start gap-2 text-sm">
      <Check size={14} className="mt-0.5 shrink-0" style={{ color: tbd ? C.hairline : C.canary }} />
      <span style={{ color: C.muted, minWidth: 130 }} className="mk-mono text-[10px] uppercase tracking-[0.12em]">{label}</span>
      <span style={{ color: tbd ? C.muted : C.body }}>{text}</span>
    </div>
  );
}

// ── Step 9: System prompt ───────────────────────────────────────────────────
function StepSystemPrompt({ draft, set }: { draft: PilotDraft; set: (p: Partial<PilotDraft>) => void }) {
  const pack = draft.pack;
  if (!pack) return null;
  const setPrompt = (sp: string) => set({ pack: { ...pack, systemPrompt: sp } });
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {MODEL_CHOICES.map((m) => {
          const on = draft.modelPreference === m.id;
          return (
            <button key={m.id} type="button" onClick={() => set({ modelPreference: m.id })} className="rounded-xl border p-3 text-left transition"
              style={{ borderColor: on ? C.canary : C.hairline, backgroundColor: on ? `${C.canary}22` : C.paper }}>
              <span className="block text-sm" style={{ color: C.ink, fontWeight: 700 }}>{m.label}</span>
              <span className="block text-xs" style={{ color: C.body }}>{m.trade}</span>
            </button>
          );
        })}
      </div>
      <Field label="System prompt (canonical template + your NZ rules — edit anything)">
        <textarea value={pack.systemPrompt} onChange={(e) => setPrompt(e.target.value)} rows={18}
          className="w-full rounded-xl border px-4 py-3 font-mono text-xs leading-relaxed outline-none" style={inputStyle} />
      </Field>
      <p className="text-xs" style={{ color: C.muted }}>In assembl voice — sentence case, no slop, draft only. Compliance for your category is built in.</p>
    </div>
  );
}

// ── Step 10: Test cases ─────────────────────────────────────────────────────
function StepTestCases({ draft, set }: { draft: PilotDraft; set: (p: Partial<PilotDraft>) => void }) {
  const pack = draft.pack;
  if (!pack) return null;
  const addOwn = (prompt: string) => set({ pack: { ...pack, testCases: [...pack.testCases, { type: 'happy-path', title: 'Your test', prompt, expected: 'You define what good looks like.' }] } });
  return (
    <div className="space-y-3">
      {pack.testCases.map((t: TestCase, i: number) => (
        <div key={i} className="rounded-2xl border p-4" style={{ borderColor: C.hairline, backgroundColor: C.paper }}>
          <p className="mk-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: C.gold }}>{t.title}</p>
          <p className="mt-1.5 text-sm" style={{ color: C.ink }}><strong>Try:</strong> {t.prompt}</p>
          <p className="mt-1 text-sm" style={{ color: C.body }}><strong>Expect:</strong> {t.expected}</p>
        </div>
      ))}
      <Field label="Add your own test">
        <TagInput values={[]} onChange={(v) => v[0] && addOwn(v[0])} placeholder="Type a test prompt and press enter" />
      </Field>
    </div>
  );
}

// ── Step 11: Test drive (sandbox) ───────────────────────────────────────────
function StepTestDrive({ draft }: { draft: PilotDraft }) {
  const systemPrompt = draft.pack?.systemPrompt ?? '';
  const greeting: UIMessage = { id: 'greeting', role: 'assistant', parts: [{ type: 'text', text: `Hi — I'm ${draft.name || 'your draft agent'}. Try me out, or run one of the tests.` }] };
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/pilot/sandbox', body: { systemPrompt, modelPreference: draft.modelPreference } }),
    messages: [greeting],
  });
  const [input, setInput] = useState('');
  const busy = status === 'submitted' || status === 'streaming';
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, busy]);
  const textOf = (m: UIMessage) => m.parts.filter((p): p is { type: 'text'; text: string } => p.type === 'text').map((p) => p.text).join('');
  const submit = (t: string) => { const v = t.trim(); if (!v || busy) return; sendMessage({ text: v }); setInput(''); };
  return (
    <div className="space-y-3">
      {draft.pack && (
        <div className="flex flex-wrap gap-2">
          {draft.pack.testCases.slice(0, 6).map((t, i) => (
            <button key={i} type="button" onClick={() => submit(t.prompt)} disabled={busy}
              className="rounded-full border px-3 py-1.5 text-xs font-bold" style={{ borderColor: C.hairline, color: C.ink, backgroundColor: C.paper }}>
              {t.title}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col rounded-[22px] border" style={{ borderColor: C.hairline, backgroundColor: C.cream, height: 420 }}>
        <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {messages.map((m) => {
            const text = textOf(m); if (!text) return null;
            const isUser = m.role === 'user';
            return (
              <div key={m.id} className="max-w-[85%] rounded-[18px] px-4 py-2.5 text-sm leading-relaxed"
                style={isUser ? { alignSelf: 'flex-end', backgroundColor: C.canary, color: C.ink } : { alignSelf: 'flex-start', backgroundColor: C.paper, color: C.body, border: `1px solid ${C.hairline}` }}>
                <p className="whitespace-pre-wrap">{text}</p>
              </div>
            );
          })}
          {busy && <div className="self-start rounded-[18px] border px-4 py-2.5" style={{ borderColor: C.hairline, backgroundColor: C.paper }}><Loader2 size={16} className="animate-spin" style={{ color: C.gold }} /></div>}
        </div>
        <div className="flex items-center gap-2 border-t p-3" style={{ borderColor: C.hairline }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(input); } }} rows={1}
            placeholder={systemPrompt ? 'Try an example…' : 'Draft the pack first.'} disabled={!systemPrompt}
            className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none" style={inputStyle} />
          <button type="button" onClick={() => submit(input)} disabled={busy || !input.trim()} className="flex h-10 w-10 items-center justify-center rounded-xl disabled:opacity-40" style={{ backgroundColor: C.canary, color: C.ink }}>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 12: Launch plan ────────────────────────────────────────────────────
function StepLaunch({ draft }: { draft: PilotDraft }) {
  const plan = draft.pack?.launchPlan ?? [];
  return (
    <div className="space-y-3">
      {plan.map((item, i) => (
        <div key={i} className="flex items-start gap-3 rounded-2xl border p-4" style={{ borderColor: C.hairline, backgroundColor: C.paper }}>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]" style={{ backgroundColor: C.canary, color: C.ink, fontWeight: 700 }}>{i + 1}</span>
          <p className="text-sm" style={{ color: C.body }}>{item}</p>
        </div>
      ))}
    </div>
  );
}

// ── Step 13: Ship ───────────────────────────────────────────────────────────
function StepShip({ draft, set, busy, signedIn, result, onShip }: {
  draft: PilotDraft; set: (p: Partial<PilotDraft>) => void; busy: boolean; signedIn: boolean;
  result: null | { ok: true; mode: string; pointsAwarded: number; receipt: { number?: number; chainHash?: string } | null; message: string } | { paywall: true; message: string };
  onShip: (mode: 'mine' | 'submit') => void;
}) {
  if (result && 'ok' in result) {
    return (
      <div className="rounded-[22px] border p-6 text-center" style={{ borderColor: C.canary, backgroundColor: `${C.canary}22` }}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: C.canary }}><Check style={{ color: C.ink }} /></span>
        <p className="mt-3 text-lg" style={{ color: C.ink, fontWeight: 900 }}>{draft.name} is saved.</p>
        <p className="mt-1 text-sm" style={{ color: C.body }}>{result.message}</p>
        {result.pointsAwarded > 0 && <p className="mt-2 text-sm" style={{ color: C.gold, fontWeight: 700 }}>+{result.pointsAwarded} points</p>}
        {result.receipt && <p className="mk-mono mt-2 text-[10px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>Mana Receipt #{result.receipt.number} · {result.receipt.chainHash?.slice(0, 12)}…</p>}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/agents/mine" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold" style={{ backgroundColor: C.ink, color: C.canary }}>My Agents <ArrowRight size={15} /></Link>
          <Link href="/journey" className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold" style={{ borderColor: C.ink, color: C.ink }}><Map size={15} /> Your journey</Link>
        </div>
      </div>
    );
  }
  const pack = draft.pack;
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4 rounded-[22px] border p-5" style={{ borderColor: C.hairline, backgroundColor: C.paper }}>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${C.canary}55` }}><AgentIcon name={draft.icon} className="h-7 w-7" /></span>
        <div className="flex-1">
          <p className="text-xl leading-tight" style={{ color: C.ink, fontWeight: 900 }}>{draft.name || 'Untitled agent'}{draft.teReo && <span className="mk-mono text-xs" style={{ color: C.muted }}> · {draft.teReo}</span>}</p>
          <p className="mt-1 text-sm" style={{ color: C.body }}>{draft.description}</p>
          <p className="mk-mono mt-2 text-[10px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>
            19-item pack · {draft.spec.tools.length} tools · {pack?.testCases.length ?? 6} tests · {MODEL_CHOICES.find((m) => m.id === draft.modelPreference)?.label}
          </p>
        </div>
      </div>
      <Field label="If you submit it to the marketplace, suggested price">
        <div className="flex flex-wrap gap-2">{PRICE_CHOICES.map((p) => <Chip key={p.id} active={draft.priceTier === p.id} onClick={() => set({ priceTier: p.id })}>{p.label}</Chip>)}</div>
      </Field>
      {result && 'paywall' in result && (
        <div className="rounded-xl border p-4 text-sm" style={{ borderColor: C.gold, backgroundColor: `${C.canary}22`, color: C.ink }}>
          {result.message} <Link href="/agents/pricing" className="underline" style={{ fontWeight: 700 }}>See Pilot pricing</Link>
        </div>
      )}
      {!signedIn && <p className="text-sm" style={{ color: C.muted }}>You&apos;ll be asked to sign in to save your agent — the first one is free, and you earn points for building it.</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => onShip('mine')} disabled={busy} className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold disabled:opacity-40" style={{ backgroundColor: C.canary, color: C.ink }}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save to My Agents (free)
        </button>
        <button type="button" onClick={() => onShip('submit')} disabled={busy} className="flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold disabled:opacity-40" style={{ borderColor: C.ink, color: C.ink }}>
          Submit for marketplace review
        </button>
      </div>
      <p className="text-xs" style={{ color: C.muted }}>Every agent stays a draft until a human signs the Mana Receipt over the whole pack. Submitting starts tikanga, brand and compliance review — it does not publish.</p>
    </div>
  );
}
