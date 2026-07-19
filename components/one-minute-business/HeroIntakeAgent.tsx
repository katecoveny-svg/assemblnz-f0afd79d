'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import styles from './one-minute-business.module.css';

/**
 * The homepage front-door agent. Replaces the decorative motion-profile
 * vortex with a real, working specialist: it answers the visitor's biggest
 * pain point (via /api/home-intake), then invites them to make it theirs —
 * name it and give it a look. Draft-only, lead-captured, on-brand.
 */

type Phase = 'ready' | 'thinking' | 'answered' | 'named';

// Client-safe display fields. The system prompts that actually drive the
// answer live server-side only (lib/home-intake/specialists.ts).
const DISPLAY: Record<string, { agentName: string; role: string; suggestion: string }> = {
  customs: { agentName: 'Pīkau', role: 'customs & logistics specialist', suggestion: 'Every shipment, I chase missing supplier docs by email before I can classify anything.' },
  architect: { agentName: 'the practice agent', role: 'architecture studio assistant', suggestion: 'Turning vague first enquiries into a proper brief eats hours every week.' },
  builder: { agentName: 'the build agent', role: 'residential construction assistant', suggestion: 'Every Friday I lose an evening writing the site update for clients.' },
  plumber: { agentName: 'the jobs agent', role: 'trades coordination assistant', suggestion: 'Prepping tomorrow’s jobs — parts, access, history — takes forever the night before.' },
  'dog-trainer': { agentName: 'the training agent', role: 'canine practice assistant', suggestion: 'Writing up a first training plan from my enquiry notes takes ages per client.' },
  service: { agentName: 'your assembl agent', role: 'specialist service assistant', suggestion: 'The same admin job comes back every week and eats time I don’t have.' },
};

const LOOKS: Array<{ id: string; label: string; from: string; to: string }> = [
  { id: 'sea', label: 'Sea glass', from: '#86aaa3', to: '#2d3d3a' },
  { id: 'brass', label: 'Brass', from: '#d8c184', to: '#8a6a2f' },
  { id: 'ink', label: 'Ink', from: '#5a6b76', to: '#182226' },
  { id: 'coral', label: 'Coral', from: '#e0a58c', to: '#7d3f2f' },
];

function display(segment: string) {
  return DISPLAY[segment] ?? DISPLAY.service;
}

export function HeroIntakeAgent({ segment, seedPrompt }: { segment: string; seedPrompt?: string }) {
  const info = display(segment);
  const [phase, setPhase] = useState<Phase>('ready');
  const [pain, setPain] = useState('');
  const [answer, setAnswer] = useState('');
  const [agentName, setAgentName] = useState(info.agentName);
  const [role, setRole] = useState(info.role);
  const [name, setName] = useState('');
  const [look, setLook] = useState(LOOKS[0]);
  const [saved, setSaved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset to the ready state whenever the visitor switches segment.
  useEffect(() => {
    setPhase('ready');
    setPain('');
    setAnswer('');
    setAgentName(info.agentName);
    setRole(info.role);
    setName('');
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment]);

  useEffect(() => {
    if ((phase === 'answered' || phase === 'thinking') && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [phase, answer]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (trimmed.length < 3) return;
    setPain(trimmed);
    setPhase('thinking');
    setAnswer('');
    try {
      const res = await fetch('/api/home-intake', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ segment, painPoint: trimmed }),
      });
      const data = await res.json();
      if (data?.answer) {
        setAgentName(data.agentName ?? info.agentName);
        setRole(data.role ?? info.role);
        setAnswer(data.answer);
        setPhase('answered');
      } else {
        setAnswer(data?.error ?? 'Our chat is taking a short break. Email hello@assembl.co.nz.');
        setPhase('answered');
      }
    } catch {
      setAnswer('Our chat is taking a short break. Email hello@assembl.co.nz.');
      setPhase('answered');
    }
  }

  function restart() {
    setPhase('ready');
    setPain('');
    setAnswer('');
    setName('');
    setSaved(false);
  }

  const shownName = name.trim() || agentName;
  const initial = shownName.replace(/^the /i, '').trim().charAt(0).toUpperCase() || 'A';

  return (
    <div className={styles.agentPanel}>
      <div className={styles.agentTopline}>
        <span>live agent · draft only</span>
        <span>{segment.replace('-', ' ')}</span>
      </div>

      <div className={styles.agentBody} ref={scrollRef}>
        {/* Agent identity */}
        <div className={styles.agentHead}>
          <span className={styles.agentMark} style={{ background: `linear-gradient(150deg, ${look.from}, ${look.to})` }} aria-hidden>
            {initial}
          </span>
          <div>
            <strong>{shownName}</strong>
            <em>{role}</em>
          </div>
        </div>

        {phase === 'ready' ? (
          <div className={styles.agentIntro}>
            <p>Tell me the job that eats your week. I’ll prepare a real first step — a draft you’d approve, not send.</p>
            <button type="button" className={styles.agentSuggest} onClick={() => ask(seedPrompt?.trim() || info.suggestion)}>
              <Sparkles aria-hidden /> {seedPrompt?.trim() ? 'Use what I typed' : info.suggestion}
            </button>
          </div>
        ) : null}

        {phase !== 'ready' ? (
          <div className={styles.agentBubbleUser}>{pain}</div>
        ) : null}

        {phase === 'thinking' ? (
          <div className={styles.agentBubbleThinking}><Loader2 aria-hidden className={styles.spin} /> preparing a first step…</div>
        ) : null}

        {answer ? (
          <div className={styles.agentBubbleAgent}>
            {answer.split('\n').filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}
            <span className={styles.agentProvenance}><Check aria-hidden /> draft · you approve before anything happens</span>
          </div>
        ) : null}

        {phase === 'named' ? (
          <div className={styles.agentCard} style={{ borderColor: look.to }}>
            <span className={styles.agentCardMark} style={{ background: `linear-gradient(150deg, ${look.from}, ${look.to})` }} aria-hidden>{initial}</span>
            <strong>{shownName}</strong>
            <em>{role}</em>
            <span className={styles.agentCardBrand}>made with assembl</span>
          </div>
        ) : null}
      </div>

      {/* Footer actions per phase */}
      {phase === 'ready' ? (
        <form
          className={styles.agentInputRow}
          onSubmit={(e) => { e.preventDefault(); ask(pain); }}
        >
          <input
            value={pain}
            onChange={(e) => setPain(e.target.value)}
            placeholder="My biggest time-sink is…"
            aria-label="Your biggest pain point"
          />
          <button type="submit" disabled={pain.trim().length < 3} aria-label="Ask the agent">
            <ArrowRight aria-hidden />
          </button>
        </form>
      ) : null}

      {phase === 'answered' ? (
        <div className={styles.agentAfter}>
          <button type="button" className={styles.agentPrimary} onClick={() => setPhase('named')}>
            make it yours <ArrowRight aria-hidden />
          </button>
          <button type="button" className={styles.agentGhost} onClick={restart}><RotateCcw aria-hidden /> ask again</button>
        </div>
      ) : null}

      {phase === 'named' ? (
        <div className={styles.agentNameStep}>
          <label>
            <span>name your agent</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={agentName} maxLength={28} />
          </label>
          <div className={styles.agentLooks} role="group" aria-label="Pick a look">
            {LOOKS.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={look.id === l.id}
                aria-label={l.label}
                onClick={() => setLook(l)}
                style={{ background: `linear-gradient(150deg, ${l.from}, ${l.to})` }}
              />
            ))}
          </div>
          <div className={styles.agentAfter}>
            <Link href="/studio/build" className={styles.agentPrimary}>build it for real <ArrowRight aria-hidden /></Link>
            <button type="button" className={styles.agentGhost} onClick={restart}><RotateCcw aria-hidden /> start over</button>
          </div>
          {saved ? null : <small className={styles.agentFoot}>No sign-up. Nothing is published without you.</small>}
        </div>
      ) : null}
    </div>
  );
}
