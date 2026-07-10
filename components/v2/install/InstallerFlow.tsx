'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { palette } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import styles from '@/components/v2/home/home.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;
const display = "var(--font-display), 'Cormorant Garamond', Georgia, serif";

/**
 * The installer — the brief's flow, end to end:
 * choose an industry → answer ten questions → the system generates →
 * review what appeared → step inside. Demo: generation is simulated and
 * lands on Fred's Living Site; only the dog-training template is built.
 */

const INDUSTRIES: Array<{ id: string; name: string; blurb: string; ready: boolean }> = [
  { id: 'dog-training', name: 'dog training', blurb: 'programmes, reactive-dog triage, session notes', ready: true },
  { id: 'hospitality', name: 'café & hospitality', blurb: 'menus, rosters, food-safety records', ready: false },
  { id: 'trades', name: 'trades & construction', blurb: 'quotes, variations, consent trails', ready: false },
  { id: 'health', name: 'physio & allied health', blurb: 'bookings, ACC notes, recall reminders', ready: false },
  { id: 'beauty', name: 'salon & beauty', blurb: 'bookings, rebooking nudges, retail', ready: false },
  { id: 'tutoring', name: 'tutoring & education', blurb: 'timetables, invoicing, progress reports', ready: false },
];

const QUESTIONS: Array<{ id: string; q: string; sample: string }> = [
  { id: 'q1', q: 'what is your business called?', sample: 'Auckland Dog Trainer · Learn To Talk Dog' },
  { id: 'q2', q: 'who is behind it?', sample: 'Fred — method lead. Hiring a second trainer.' },
  { id: 'q3', q: 'where do you work?', sample: 'Greater Auckland · in-home + Western Springs field' },
  { id: 'q4', q: 'what do you sell, roughly priced?', sample: 'Private $299 · Recall $1,750 · Reactivity $2,200 · Board & Train $4,500' },
  { id: 'q5', q: 'what question do customers ask you every week?', sample: '“What is a threshold?” and “Is a muzzle a punishment?”' },
  { id: 'q6', q: 'what must never happen?', sample: 'Bite-history dogs going straight to group work' },
  { id: 'q7', q: 'how do bookings work?', sample: '75-minute sessions, Thu/Fri field days, deposit to confirm' },
  { id: 'q8', q: 'what proof do you have?', sample: '23 testimonials — latest: “a reliable house dog in 4 weeks”' },
  { id: 'q9', q: 'what voice should it use?', sample: 'Warm, plain-spoken, method-first — never shouty' },
  { id: 'q10', q: 'what should never send without you?', sample: 'Everything. Client emails, bookings, posts — all wait for my yes.' },
];

const GENERATION: Array<{ label: string; detail: string }> = [
  { label: 'business genome', detail: 'your ten answers become 14 facts — one source of truth' },
  { label: 'website', detail: 'hero, services, pricing, faqs, testimonials, book' },
  { label: 'crm', detail: 'dog + owner profiles, stages, next actions' },
  { label: 'knowledge base', detail: 'your answers, your policies, your method' },
  { label: 'calendar & bookings', detail: '75-min sessions, field days, deposits' },
  { label: 'voice & chat agent', detail: 'answers only from the genome' },
  { label: 'automations', detail: 'enquiry replies, homework emails — draft-only' },
  { label: 'morning brief', detail: 'one improvement a day, waiting for your yes' },
];

type Step = 'industry' | 'questions' | 'generating' | 'ready';

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ['industry', 'questions', 'generating', 'ready'];
  const labels = ['choose', 'answer', 'generate', 'go live'];
  const idx = order.indexOf(step);
  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
      {order.map((s, i) => (
        <span
          key={s}
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: i <= idx ? palette.ink : palette.silverDeep,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: i < idx ? palette.accentGold : i === idx ? palette.ink : palette.silver,
              display: 'inline-block',
            }}
          />
          {labels[i]}
        </span>
      ))}
    </div>
  );
}

export function InstallerFlow() {
  const reduced = useReducedMotion();
  const [step, setStep] = React.useState<Step>('industry');
  const [industry, setIndustry] = React.useState<string | null>(null);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [genCount, setGenCount] = React.useState(0);

  const answered = QUESTIONS.filter((q) => (answers[q.id] ?? '').trim().length > 0).length;

  React.useEffect(() => {
    if (step !== 'generating') return;
    setGenCount(0);
    const tick = window.setInterval(() => {
      setGenCount((n) => {
        if (n >= GENERATION.length) {
          window.clearInterval(tick);
          window.setTimeout(() => setStep('ready'), reduced ? 0 : 900);
          return n;
        }
        return n + 1;
      });
    }, reduced ? 60 : 850);
    return () => window.clearInterval(tick);
  }, [step, reduced]);

  const cardBase: React.CSSProperties = {
    border: `1px solid ${palette.hairline}`,
    background: palette.paper,
    borderRadius: 16,
    padding: '18px 20px',
  };

  return (
    <div className={styles.inner} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <StepDots step={step} />

      <AnimatePresence mode="wait">
        {step === 'industry' ? (
          <motion.div
            key="industry"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className={styles.h2}>
              choose your industry
              <span aria-hidden style={{ color: palette.accentGold }}>
                .
              </span>
            </p>
            <p className={styles.sectionLede}>
              One template per industry — the agents, bookings, knowledge, and website that
              business actually needs. Dog training is live today; the rest are in the studio.
            </p>
            <div
              style={{
                display: 'grid',
                gap: 14,
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                marginTop: 24,
              }}
            >
              {INDUSTRIES.map((ind) => {
                const on = industry === ind.id;
                return (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => (ind.ready ? setIndustry(ind.id) : undefined)}
                    aria-disabled={!ind.ready}
                    style={{
                      ...cardBase,
                      textAlign: 'left',
                      cursor: ind.ready ? 'pointer' : 'default',
                      opacity: ind.ready ? 1 : 0.55,
                      borderColor: on ? palette.accentGold : palette.hairline,
                      boxShadow: on ? '0 14px 34px rgba(24,28,38,0.08)' : undefined,
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ fontFamily: display, fontSize: 21, color: palette.ink, display: 'block' }}>
                      {ind.name}
                      {on ? <span style={{ color: palette.accentGold }}> ✓</span> : null}
                    </span>
                    <span style={{ fontSize: 13, color: palette.bodyGrey, display: 'block', marginTop: 6, lineHeight: 1.5 }}>
                      {ind.blurb}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        marginTop: 10,
                        display: 'block',
                        color: ind.ready ? palette.accentGold : palette.silverDeep,
                      }}
                    >
                      {ind.ready ? 'template ready' : 'waitlist'}
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 26 }}>
              <button
                type="button"
                disabled={!industry}
                onClick={() => setStep('questions')}
                className={styles.ctaPrimary}
                style={{ border: 'none', cursor: industry ? 'pointer' : 'not-allowed', opacity: industry ? 1 : 0.5 }}
              >
                continue
                <span aria-hidden style={{ color: palette.goldSoft }}>
                  →
                </span>
              </button>
            </div>
          </motion.div>
        ) : null}

        {step === 'questions' ? (
          <motion.div
            key="questions"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className={styles.h2}>
              ten questions
              <span aria-hidden style={{ color: palette.accentGold }}>
                .
              </span>
            </p>
            <p className={styles.sectionLede}>
              This is the whole setup. Your answers become the Business Genome — every surface
              reads from it. Got a website, docs, or FAQs already? In the real install you drop
              them here and we read them for you.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '20px 0', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setAnswers(Object.fromEntries(QUESTIONS.map((q) => [q.id, q.sample])))}
                className={styles.ctaGhost}
                style={{ cursor: 'pointer' }}
              >
                use fred&apos;s sample answers
              </button>
              <span style={{ fontSize: 12, color: palette.bodyGrey }}>{answered}/10 answered</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {QUESTIONS.map((q, i) => (
                <div key={q.id} style={cardBase}>
                  <label
                    htmlFor={`install-${q.id}`}
                    style={{ fontFamily: display, fontSize: 18, color: palette.ink, display: 'block' }}
                  >
                    {i + 1} · {q.q}
                  </label>
                  <input
                    id={`install-${q.id}`}
                    value={answers[q.id] ?? ''}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                    placeholder={q.sample}
                    style={{
                      width: '100%',
                      marginTop: 10,
                      fontSize: 14,
                      color: palette.ink,
                      background: palette.paperDeep,
                      border: `1px solid ${palette.hairline}`,
                      borderRadius: 10,
                      padding: '11px 13px',
                      outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={answered < 10}
                onClick={() => setStep('generating')}
                className={styles.ctaPrimary}
                style={{ border: 'none', cursor: answered === 10 ? 'pointer' : 'not-allowed', opacity: answered === 10 ? 1 : 0.5 }}
              >
                generate my living site
                <span aria-hidden style={{ color: palette.goldSoft }}>
                  •
                </span>
              </button>
              <button type="button" onClick={() => setStep('industry')} className={styles.ctaGhost} style={{ cursor: 'pointer' }}>
                back
              </button>
            </div>
          </motion.div>
        ) : null}

        {step === 'generating' ? (
          <motion.div
            key="generating"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className={styles.h2}>
              assembling
              <span aria-hidden style={{ color: palette.accentGold }}>
                …
              </span>
            </p>
            <p className={styles.sectionLede}>
              Nobody bolts plugins together. The business simply appears, one surface at a time.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24, maxWidth: 640 }}>
              {GENERATION.slice(0, genCount).map((g, i) => (
                <motion.div
                  key={g.label}
                  initial={reduced ? false : { opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  style={{ ...cardBase, display: 'flex', gap: 12, alignItems: 'baseline' }}
                >
                  <span aria-hidden style={{ color: palette.accentGold, fontSize: 13 }}>
                    ✓
                  </span>
                  <span>
                    <span style={{ fontFamily: display, fontSize: 19, color: palette.ink }}>{g.label}</span>
                    <span style={{ fontSize: 12.5, color: palette.bodyGrey, display: 'block', marginTop: 2 }}>
                      {g.detail}
                    </span>
                  </span>
                </motion.div>
              ))}
              {genCount < GENERATION.length ? (
                <motion.p
                  animate={reduced ? undefined : { opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ margin: '6px 0 0', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: palette.bodyGrey }}
                >
                  ● {GENERATION[genCount]?.label}…
                </motion.p>
              ) : null}
            </div>
          </motion.div>
        ) : null}

        {step === 'ready' ? (
          <motion.div
            key="ready"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className={styles.h2}>
              your living site is ready
              <span aria-hidden style={{ color: palette.accentGold }}>
                .
              </span>
            </p>
            <p className={styles.sectionLede}>
              This demo lands on Fred&apos;s — a real Living Site, generated from answers exactly
              like yours. Everything below is interactive.
            </p>
            <div
              style={{
                display: 'grid',
                gap: 14,
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                marginTop: 24,
              }}
            >
              {[
                { href: '/living-site/fred', title: 'the website', body: 'hero, programmes, pricing, faqs, book — all read from the genome' },
                { href: '/living-site', title: 'the operating system', body: 'the genome ripple + the morning brief, live' },
                { href: '/contact', title: 'your own install', body: 'guided setup with the assembl team — bring your website and docs' },
              ].map((c) => (
                <Link key={c.href} href={c.href} style={{ textDecoration: 'none' }}>
                  <div style={{ ...cardBase, height: '100%', borderColor: `${palette.accentGold}66` }}>
                    <span style={{ fontFamily: display, fontSize: 21, color: palette.ink }}>
                      {c.title}
                      <span style={{ color: palette.accentGold }}> →</span>
                    </span>
                    <span style={{ fontSize: 13, color: palette.bodyGrey, display: 'block', marginTop: 6, lineHeight: 1.5 }}>
                      {c.body}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <p style={{ marginTop: 22, fontSize: 12, color: palette.bodyGrey }}>
              demo · the generation above is simulated — your answers stayed in this browser tab.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
          •
        </span>
        <MicroLabel>less admin. more mahi.</MicroLabel>
      </div>
    </div>
  );
}
