'use client';

/**
 * AgentWorkingHero — the flagship agentic surface: a mock "your AI agent is
 * working" card (step tracker + ETA + progress) with the Dash slot beneath it
 * (mono sponsored line + reward chip + the dachshund loader). The progress
 * advances, then resolves to a mint "you earned" pay-moment, then loops.
 *
 * Fully gated on prefers-reduced-motion (holds a static mid-task pose).
 * See docs/dash-components-brief.md.
 */
import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { DashDog } from './DashDog';

interface AgentWorkingHeroProps {
  task?: string;
  totalSteps?: number;
  etaMinutes?: number;
  sponsoredLine?: string;
  rewardText?: string;
}

export function AgentWorkingHero({
  task = 'Researching NZ suppliers',
  totalSteps = 6,
  etaMinutes = 4,
  sponsoredLine = 'Air New Zealand Business — fly the main centres for less.',
  rewardText = '+$0.04 → your KiwiSaver',
}: AgentWorkingHeroProps) {
  const [step, setStep] = useState(4);
  const [done, setDone] = useState(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedRef.current) {
      setStep(4);
      setDone(false);
      return;
    }
    let s = 1;
    setStep(1);
    setDone(false);
    const tick = setInterval(() => {
      s += 1;
      if (s > totalSteps) {
        setDone(true);
        // brief pause on the pay-moment, then restart
        setTimeout(() => {
          s = 1;
          setStep(1);
          setDone(false);
        }, 2200);
        return;
      }
      setStep(s);
    }, 1100);
    return () => clearInterval(tick);
  }, [totalSteps]);

  const pct = done ? 100 : Math.round((step / totalSteps) * 100);

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '3px solid var(--accent)',
        borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--shadow-md)',
        padding: 'clamp(20px, 4vw, 30px)',
        maxWidth: 460,
      }}
    >
      {/* agent card header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span
          style={{
            fontFamily: 'var(--ff-mono)',
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          {done ? 'agent finished' : 'agent working'}
        </span>
        <span
          style={{
            fontFamily: 'var(--ff-mono)',
            fontSize: 12,
            color: done ? 'var(--muted)' : 'var(--fg)',
          }}
        >
          {done ? 'done' : `ETA ~${etaMinutes} min`}
        </span>
      </div>

      <h3 className="serif" style={{ fontSize: 22, fontWeight: 600, margin: '8px 0 14px' }}>
        {task}
        {!done && <span aria-hidden>…</span>}
      </h3>

      {/* step + progress */}
      <div
        style={{
          fontFamily: 'var(--ff-mono)',
          fontSize: 13,
          marginBottom: 8,
          color: 'var(--fg)',
        }}
      >
        {done ? `step ${totalSteps} of ${totalSteps}` : `step ${step} of ${totalSteps}`}
      </div>
      <div
        style={{
          height: 12,
          borderRadius: 999,
          background: 'var(--surface-2)',
          border: '2px solid var(--accent)',
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Agent progress"
      >
        <span
          style={{
            display: 'block',
            height: '100%',
            width: `${pct}%`,
            background: done ? 'var(--mint)' : 'var(--hivis)',
            transition: 'width 0.6s var(--ease), background 0.3s var(--ease)',
          }}
        />
      </div>

      {/* dash-rule divider */}
      <hr className="dash-rule" aria-hidden style={{ margin: '20px 0' }} />

      {/* the Dash slot */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 92, flex: 'none' }}>
          <DashDog title="Dash loader" />
        </div>
        <div style={{ minWidth: 0 }}>
          {done ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  background: 'var(--mint)',
                  flex: 'none',
                }}
              >
                <Check size={16} color="var(--accent)" aria-hidden />
              </span>
              <span style={{ fontWeight: 800 }}>You earned {rewardText.replace(/^\+/, '')}</span>
            </div>
          ) : (
            <>
              <span
                style={{
                  fontFamily: 'var(--ff-mono)',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}
              >
                Sponsored
              </span>
              <p
                style={{
                  fontFamily: 'var(--ff-mono)',
                  fontSize: 13.5,
                  lineHeight: 1.45,
                  margin: '2px 0 8px',
                  color: 'var(--fg)',
                }}
              >
                {sponsoredLine}
              </p>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 12.5,
                  fontWeight: 800,
                  padding: '5px 11px',
                  borderRadius: 999,
                  background: 'var(--surface-2)',
                  border: '2px solid var(--accent)',
                }}
              >
                {rewardText}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
