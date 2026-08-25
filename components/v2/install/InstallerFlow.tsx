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
 * review what appeared → step inside. The generation is REAL: the ten
 * answers are written as rows in living_site_genome under a fresh install
 * tenant, and /living-site/install/[id] renders a living site from them.
 * If the write is unavailable (offline, capacity cap), the flow falls back
 * to the industry's fictional sample site and says so.
 */

import { SAMPLE_VERTICALS, verticalBySlug } from '@/lib/living-site/verticals';
import { generateInstall } from '@/app/install/actions';

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

// The canon onboarding order: conversation first, documents second,
// generation third, review fourth, live fifth.
type Step = 'industry' | 'questions' | 'documents' | 'generating' | 'ready';

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ['industry', 'questions', 'documents', 'generating', 'ready'];
  const labels = ['choose', 'introduce', 'share', 'generate', 'go live'];
  const idx = order.indexOf(step);
  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
      {order.map((s, i) => (
        <span
          key={s}
          style={{
            fontSize: 12,
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
  const [qIndex, setQIndex] = React.useState(0);
  // null = write in flight · {id} = real install written · {failed} = fall
  // back to the sample site (keeping WHY, so the copy stays honest).
  // Mirrored in a ref so the generation timers and the server-action promise
  // can hand off to 'ready' without an effect.
  type InstallState = { id: string } | { failed: 'invalid' | 'capacity' | 'unavailable' } | null;
  const [install, setInstall] = React.useState<InstallState>(null);
  const installRef = React.useRef<InstallState>(null);
  const animDoneRef = React.useRef(false);
  const inFlightRef = React.useRef(false);

  const maybeReady = React.useCallback(() => {
    if (animDoneRef.current && installRef.current !== null) setStep('ready');
  }, []);

  const beginGeneration = () => {
    // A double-click must not mint two genomes.
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setGenCount(0);
    animDoneRef.current = false;
    installRef.current = null;
    setInstall(null);
    setStep('generating');
    generateInstall(industry ?? 'dog-training', answers)
      .then((r) => {
        installRef.current = r.ok ? { id: r.id } : { failed: r.error };
        setInstall(installRef.current);
        maybeReady();
      })
      .catch(() => {
        installRef.current = { failed: 'unavailable' };
        setInstall(installRef.current);
        maybeReady();
      })
      .finally(() => {
        inFlightRef.current = false;
      });
  };

  const advanceQuestion = () => {
    if (qIndex === QUESTIONS.length - 1) setStep('documents');
    else setQIndex((i) => i + 1);
  };

  React.useEffect(() => {
    if (step !== 'generating') return;
    const tick = window.setInterval(() => {
      setGenCount((n) => {
        if (n >= GENERATION.length) {
          window.clearInterval(tick);
          window.setTimeout(
            () => {
              animDoneRef.current = true;
              maybeReady();
            },
            reduced ? 0 : 900,
          );
          return n;
        }
        return n + 1;
      });
    }, reduced ? 60 : 850);
    return () => window.clearInterval(tick);
  }, [step, reduced, maybeReady]);

  const installed = install && 'id' in install ? install : null;
  const failure = install && 'failed' in install ? install.failed : null;
  const readySiteHref = installed
    ? `/living-site/install/${installed.id}`
    : `/living-site/${industry ?? 'dog-training'}`;
  const readyOsHref = `${readySiteHref}/os`;
  const businessLabel =
    (answers.q1 ?? '').trim() ||
    (verticalBySlug(industry ?? '')?.businessName ?? 'Your business');

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
                        fontSize: 12,
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
                onClick={() => {
                  setQIndex(0);
                  setStep('questions');
                }}
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
            key={`question-${qIndex}`}
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {/* One question at a time — a conversation, not a form. */}
            <p style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.bodyGrey, margin: 0 }}>
              {qIndex + 1} of {QUESTIONS.length}
            </p>
            <label
              htmlFor={`install-${QUESTIONS[qIndex].id}`}
              className={styles.h2}
              style={{ display: 'block', marginTop: 14, maxWidth: 640 }}
            >
              {QUESTIONS[qIndex].q}
              <span aria-hidden style={{ color: palette.accentGold }}>
                {' '}
              </span>
            </label>
            <input
              id={`install-${QUESTIONS[qIndex].id}`}
              key={QUESTIONS[qIndex].id}
              autoFocus
              value={answers[QUESTIONS[qIndex].id] ?? ''}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, [QUESTIONS[qIndex].id]: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (answers[QUESTIONS[qIndex].id] ?? '').trim()) {
                  e.preventDefault();
                  advanceQuestion();
                }
              }}
              placeholder={samplesFor(industry)[QUESTIONS[qIndex].id]}
              style={{
                width: '100%',
                maxWidth: 640,
                marginTop: 24,
                fontSize: 17,
                color: palette.ink,
                background: palette.paper,
                border: 'none',
                borderBottom: `1.5px solid ${palette.hairline}`,
                padding: '10px 2px 12px',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 26, flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={!(answers[QUESTIONS[qIndex].id] ?? '').trim()}
                onClick={advanceQuestion}
                className={styles.ctaPrimary}
                style={{
                  border: 'none',
                  cursor: (answers[QUESTIONS[qIndex].id] ?? '').trim() ? 'pointer' : 'not-allowed',
                  opacity: (answers[QUESTIONS[qIndex].id] ?? '').trim() ? 1 : 0.45,
                }}
              >
                {qIndex === QUESTIONS.length - 1 ? 'that’s the setup' : 'next'}
                <span aria-hidden style={{ color: palette.goldSoft }}>
                  →
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setAnswers((a) => ({
                    ...a,
                    [QUESTIONS[qIndex].id]: samplesFor(industry)[QUESTIONS[qIndex].id],
                  }))
                }
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: palette.bodyGrey, textDecoration: 'underline', padding: 0 }}
              >
                use the sample answer
              </button>
              <button
                type="button"
                onClick={() => (qIndex === 0 ? setStep('industry') : setQIndex((i) => i - 1))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: palette.bodyGrey, padding: 0 }}
              >
                back
              </button>
            </div>
          </motion.div>
        ) : null}

        {step === 'documents' ? (
          <motion.div
            key="documents"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className={styles.h2}>
              already written it down somewhere
              <span aria-hidden style={{ color: palette.accentGold }}>
                ?
              </span>
            </p>
            <p className={styles.sectionLede}>
              Drop in anything you&apos;ve got. assembl reads it, so you never repeat yourself.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20, maxWidth: 560 }}>
              {['website', 'PDFs', 'emails', 'price list', 'logos', 'Google Drive', 'social media', 'spreadsheets'].map((chip) => (
                <span
                  key={chip}
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    padding: '8px 14px',
                    borderRadius: 999,
                    background: palette.paper,
                    border: `1px solid ${palette.hairline}`,
                    color: palette.ink,
                    boxShadow: '0 6px 18px rgba(24,28,38,0.05)',
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
            <div
              aria-hidden
              style={{
                ...cardBase,
                marginTop: 16,
                maxWidth: 560,
                padding: '38px 24px',
                textAlign: 'center',
                borderStyle: 'dashed',
                color: palette.bodyGrey,
                fontSize: 13.5,
              }}
            >
              drop files or folders here · demo only — nothing uploads
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 26, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={beginGeneration}
                className={styles.ctaPrimary}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                generate my living site
                <span aria-hidden style={{ color: palette.goldSoft }}>
                  •
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStep('questions')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: palette.bodyGrey, padding: 0 }}
              >
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
              understanding your business
              <span aria-hidden style={{ color: palette.accentGold }}>
                …
              </span>
            </p>
            <p className={styles.sectionLede}>
              Your answers become the genome; the business appears around it, one surface at a
              time. Nobody bolts plugins together.
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
              {genCount < GENERATION.length || install === null ? (
                <motion.p
                  animate={reduced ? undefined : { opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ margin: '6px 0 0', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: palette.bodyGrey }}
                >
                  ● {GENERATION[genCount]?.label ?? 'writing your genome'}…
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
              {installed
                ? `${businessLabel} is live — a real Living Site generated from your ten answers. The genome exists in the database, and the site reads it on every load.`
                : `${verticalBySlug(industry ?? '')?.businessName ?? 'A sample business'} is live — a real, genome-backed Living Site. Fictional business, live system.`}
            </p>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginTop: 26, flexWrap: 'wrap' }}>
              <Link href={readySiteHref} className={styles.ctaPrimary}>
                step inside
                <span aria-hidden style={{ color: palette.goldSoft }}>
                  •
                </span>
              </Link>
              <Link href={readyOsHref} style={{ fontSize: 12.5, color: palette.bodyGrey }}>
                see its operating system
              </Link>
              <Link href="/contact" style={{ fontSize: 12.5, color: palette.bodyGrey }}>
                your own install
              </Link>
            </div>
            <p style={{ marginTop: 22, fontSize: 12, color: palette.bodyGrey }}>
              {installed
                ? 'demo install · unlisted, cleared periodically — your answers went into a real Business Genome and nowhere else.'
                : failure === 'capacity'
                  ? 'demo · today’s install capacity is used up, so this landed on the sample site — try again tomorrow; your answers stayed in this browser tab.'
                  : failure === 'invalid'
                    ? 'demo · those answers couldn’t be turned into a genome, so this landed on the sample site — your answers stayed in this browser tab.'
                    : 'demo · generation could not reach the database just now, so this landed on the sample site — your answers stayed in this browser tab.'}
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
