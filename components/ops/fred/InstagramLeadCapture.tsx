'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Lead } from '@/lib/customers/auckland-dog-trainer/demo-data';

/**
 * Instagram DM → CRM lead — the visual proof that a raw social message becomes
 * a structured lead without Sam touching a keyboard.
 *
 * Left: the DM as it lands in Instagram. Right: the intake agent reading it,
 * extracting the dog profile, scoring risk, matching a programme, and filing
 * the lead. The captured lead is handed up to LeadsTab so it appears at the
 * top of the real triage list.
 */

const NAVY = '#1B2A4A';
const PINK = '#D4A5B0';
const PINK_DEEP = '#B87A8A';
const BLUSH = '#F7EEF1';
const CREAM = '#FFFCFB';
const MUTED = '#6B7389';

const glass: CSSProperties = {
  borderRadius: 16,
  border: `1px solid ${NAVY}14`,
  background: CREAM,
  boxShadow: '0 10px 28px rgba(27,42,74,0.06)',
};

const eyebrow: CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: MUTED,
  fontFamily: 'var(--font-brand-mono), ui-monospace, monospace',
};

const display = 'var(--font-brand-display), Georgia, serif';

/** The example DM — a realistic enquiry as it lands in the inbox. */
export const IG_DM = {
  handle: 'jess.and.milo',
  when: 'Instagram · 2 min ago',
  messages: [
    'Hi Sam! A friend from the dog park gave me your name.',
    'My 18-month-old spoodle Milo has started lunging and barking at other dogs on walks around Grey Lynn — it’s getting worse and I cross the street to avoid everyone now 😔',
    'Do you do 1:1 sessions? What do you charge? We’re free most mornings.',
  ],
} as const;

/** The structured lead the agent files — every field traceable to the DM. */
export const IG_LEAD: Lead = {
  id: 'lead-ig-milo',
  owner: 'Jess',
  dog: 'Milo',
  breed: 'Spoodle',
  age: '18 months',
  suburb: 'Grey Lynn',
  issues: ['Leash reactivity', 'Lunging + barking at dogs'],
  triage:
    'Reactivity pattern escalating (owner now avoiding other dogs). Referred by word of mouth. Morning availability. No bite history mentioned — confirm at intake.',
  recommended: 'reactivity',
  urgency: 'soon',
  riskLevel: 'medium',
  source: 'Instagram DM · @jess.and.milo',
  receivedAt: 'just now',
  draftReply:
    'Kia ora Jess — thanks for reaching out, and Milo sounds like a classic case of leash frustration that we can absolutely turn around. My Reactivity Rewired programme is built for exactly this. First step is a 1:1 assessment walk (mornings work great) so I can see what sets him off and where his threshold is. Here’s the link to book a time…',
  explainerVideo: 'Why dogs lunge on lead — threshold explained (2m 40s)',
};

const STEPS = [
  { k: 'read', label: 'Read DM', body: '3 messages · @jess.and.milo' },
  { k: 'extract', label: 'Extract profile', body: 'Milo · Spoodle · 18mo · Grey Lynn' },
  { k: 'risk', label: 'Risk & urgency', body: 'medium risk · soon — escalating pattern' },
  { k: 'match', label: 'Match programme', body: 'Reactivity Rewired (1:1, mornings)' },
  { k: 'draft', label: 'Draft Sam’s reply', body: 'assessment walk + booking link' },
  { k: 'file', label: 'File in CRM', body: 'Lead + dog profile created ✓' },
] as const;

function DmBubble({ text, delay }: { text: string; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.p
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        margin: 0,
        maxWidth: '88%',
        padding: '10px 13px',
        borderRadius: '18px 18px 18px 5px',
        background: '#EFEFEF',
        color: '#111',
        fontSize: 13.5,
        lineHeight: 1.45,
      }}
    >
      {text}
    </motion.p>
  );
}

export function InstagramLeadCapture({ onCaptured }: { onCaptured: (lead: Lead) => void }) {
  const reduce = useReducedMotion();
  const [running, setRunning] = useState(false);
  const [stepsDone, setStepsDone] = useState(0);
  const done = stepsDone >= STEPS.length;

  useEffect(() => {
    if (!running || done) return;
    const t = setTimeout(() => {
      const next = stepsDone + 1;
      setStepsDone(next);
      if (next >= STEPS.length) onCaptured(IG_LEAD);
    }, reduce ? 60 : 620);
    return () => clearTimeout(t);
  }, [running, stepsDone, done, onCaptured, reduce]);

  return (
    <section style={{ ...glass, padding: 18, borderColor: `${PINK}88`, background: `linear-gradient(180deg, ${BLUSH}, ${CREAM})` }}>
      <p style={{ ...eyebrow, color: PINK_DEEP }}>instagram dm → crm lead · live wire</p>
      <h2 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 22, color: NAVY }}>
        A DM lands. A lead files itself.
      </h2>
      <p style={{ margin: '8px 0 0', fontSize: 13.5, color: MUTED, lineHeight: 1.5, maxWidth: 560 }}>
        Real example: an enquiry arrives in Instagram. The intake agent reads it, builds the dog
        profile, scores urgency, matches the programme, drafts Sam&apos;s reply — and the lead
        appears in triage below. Draft-only: nothing sends without Sam&apos;s yes.
      </p>

      <div
        style={{
          marginTop: 14,
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          alignItems: 'start',
        }}
      >
        {/* ── the DM as Instagram shows it ── */}
        <div
          style={{
            borderRadius: 18,
            border: '1px solid #DBDBDB',
            background: '#fff',
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: '1px solid #EFEFEF' }}>
            <span
              aria-hidden
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                padding: 2,
                background: 'linear-gradient(45deg, #F9CE34, #EE2A7B, #6228D7)',
                display: 'inline-flex',
              }}
            >
              <span
                style={{
                  flex: 1,
                  borderRadius: '50%',
                  background: BLUSH,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: NAVY,
                }}
              >
                J
              </span>
            </span>
            <div>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#111' }}>{IG_DM.handle}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#8E8E8E' }}>{IG_DM.when}</p>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8E8E8E' }}>
              direct
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14 }}>
            {IG_DM.messages.map((m, i) => (
              <DmBubble key={m.slice(0, 16)} text={m} delay={0.15 + i * 0.25} />
            ))}
          </div>
        </div>

        {/* ── the intake agent doing the work ── */}
        <div style={{ ...glass, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <p style={{ ...eyebrow, color: PINK_DEEP, margin: 0 }}>intake agent</p>
            <button
              type="button"
              disabled={running && !done}
              onClick={() => {
                setStepsDone(0);
                setRunning(true);
              }}
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '9px 14px',
                borderRadius: 999,
                border: 'none',
                cursor: running && !done ? 'default' : 'pointer',
                background: NAVY,
                color: '#fff',
                opacity: running && !done ? 0.65 : 1,
              }}
            >
              {done ? 'Replay capture' : running ? 'Capturing…' : 'Capture to CRM →'}
            </button>
          </div>

          <ol style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STEPS.map((s, i) => {
              const state = !running ? 'idle' : i < stepsDone ? 'done' : i === stepsDone ? 'active' : 'idle';
              return (
                <motion.li
                  key={s.k}
                  animate={{ opacity: state === 'idle' && running ? 0.45 : 1 }}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'baseline',
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: state === 'done' ? `${PINK}22` : state === 'active' ? `${NAVY}0d` : 'transparent',
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      fontSize: 12,
                      width: 16,
                      color: state === 'done' ? PINK_DEEP : MUTED,
                      fontWeight: 700,
                    }}
                  >
                    {state === 'done' ? '✓' : state === 'active' ? '…' : i + 1}
                  </span>
                  <span style={{ fontSize: 13, color: NAVY, fontWeight: 600, minWidth: 118 }}>{s.label}</span>
                  <span style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.4 }}>{s.body}</span>
                </motion.li>
              );
            })}
          </ol>

          <AnimatePresence>
            {done ? (
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  margin: '12px 0 0',
                  fontSize: 12.5,
                  color: NAVY,
                  lineHeight: 1.5,
                  padding: 10,
                  borderRadius: 10,
                  background: `${PINK}22`,
                }}
              >
                Lead filed — <strong>Milo · Spoodle · Grey Lynn</strong> is now first in triage
                below, with Sam&apos;s draft reply attached.
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
