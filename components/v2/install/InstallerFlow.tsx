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
 * review what appeared → step inside. Demo: generation is simulated; every
 * template lands on its industry's genome-backed sample site at
 * /living-site/<id> (all sample businesses fictional).
 */

import { SAMPLE_VERTICALS, verticalBySlug } from '@/lib/living-site/verticals';

const INDUSTRIES: Array<{ id: string; name: string; blurb: string; ready: boolean }> = [
  { id: 'dog-training', name: 'dog training', blurb: 'programmes, reactive-dog triage, session notes', ready: true },
  { id: 'customs', name: 'customs brokerage', blurb: 'entries, tariff codes, perishables triage', ready: true },
  { id: 'architecture', name: 'architecture practice', blurb: 'concept to consent, site observation, RFIs', ready: true },
  { id: 'hospitality', name: 'café & hospitality', blurb: 'menus, rosters, food-safety records', ready: true },
  { id: 'trades', name: 'trades & construction', blurb: 'quotes, variations, consent trails', ready: true },
  { id: 'health', name: 'physio & allied health', blurb: 'bookings, ACC notes, recall reminders', ready: true },
  { id: 'beauty', name: 'salon & beauty', blurb: 'bookings, rebooking nudges, retail', ready: true },
  { id: 'tutoring', name: 'tutoring & education', blurb: 'timetables, invoicing, progress reports', ready: true },
];

const QUESTIONS: Array<{ id: string; q: string }> = [
  { id: 'q1', q: 'what is your business called?' },
  { id: 'q2', q: 'who is behind it?' },
  { id: 'q3', q: 'where do you work?' },
  { id: 'q4', q: 'what do you sell, roughly priced?' },
  { id: 'q5', q: 'what question do customers ask you every week?' },
  { id: 'q6', q: 'what must never happen?' },
  { id: 'q7', q: 'how do bookings work?' },
  { id: 'q8', q: 'what proof do you have?' },
  { id: 'q9', q: 'what voice should it use?' },
  { id: 'q10', q: 'what should never send without you?' },
];

/** Sample answers derived from the chosen vertical's genome — the same facts
 *  its sample site renders, so the story stays honest end-to-end. */
function samplesFor(industryId: string | null): Record<string, string> {
  const v = verticalBySlug(industryId ?? '') ?? SAMPLE_VERTICALS[0];
  const byId = new Map(v.fallbackFacts.map((f) => [f.id, f]));
  const section = (s: string) => v.fallbackFacts.filter((f) => f.section === s);
  const services = section('services')
    .slice(0, 4)
    .map((f) => `${f.label} ${f.value.split('·')[0].trim()}`)
    .join(' · ');
  const knowledge = section('knowledge');
  return {
    q1: byId.get('g-name')?.value ?? v.businessName,
    q2: byId.get('g-team')?.value ?? `${v.owner} — owner`,
    q3: byId.get('g-area')?.value ?? '',
    q4: services,
    q5: knowledge[0]?.value.split('→')[0].trim() ?? '',
    q6: knowledge[1]?.value ?? '',
    q7: byId.get('g-booking-rules')?.value ?? '',
    q8: byId.get('g-testimonials')?.value ?? '',
    q9: byId.get('g-voice')?.value ?? '',
    q10: 'Everything. Client emails, bookings, posts — all wait for my yes.',
  };
}

const GENERATION: Array<{ label: string; detail: string }> = [
  { label: 'business genome', detail: 'your ten answers become one source of truth' },
  { label: 'website', detail: 'hero, services, pricing, faqs, testimonials, book' },
  { label: 'crm', detail: 'client profiles, stages, next actions' },
  { label: 'knowledge base', detail: 'your answers, your policies, your method' },
  { label: 'calendar & bookings', detail: 'your booking rules, deposits, buffers' },
  { label: 'voice & chat agent', detail: 'answers only from the genome' },
  { label: 'automations', detail: 'enquiry replies, follow-ups — draft-only' },
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
              business actually needs. Every template lands on a real, genome-backed sample
              business you can touch.
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
                onClick={() => setAnswers(samplesFor(industry))}
                className={styles.ctaGhost}
                style={{ cursor: 'pointer' }}
              >
                use the sample answers
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
                    placeholder={samplesFor(industry)[q.id]}
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
                onClick={() => {
                  setGenCount(0);
                  setStep('generating');
                }}
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
              This demo lands on{' '}
              {verticalBySlug(industry ?? '')?.businessName ?? 'a sample business'} — a real,
              genome-backed Living Site (fictional business, live system). Everything below is
              interactive.
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
                { href: `/living-site/${industry ?? 'dog-training'}`, title: 'the website', body: 'hero, services, pricing, faqs, book — all read from the genome' },
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
