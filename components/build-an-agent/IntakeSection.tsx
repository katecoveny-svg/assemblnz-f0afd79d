'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';

import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';

import styles from './intake-section.module.css';

type SampleId = keyof typeof BUILD_AN_AGENT.intake.sampleBusinesses;

type State =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'answered'; answer: string; business: string; fellBack: boolean }
  | { kind: 'error'; message: string };

type LeadState = 'idle' | 'sending' | 'sent' | 'error';

const MIN = 24;
const MAX = 900;

export function IntakeSection() {
  const copy = BUILD_AN_AGENT.intake;
  const [business, setBusiness] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [email, setEmail] = useState('');
  const [leadState, setLeadState] = useState<LeadState>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSubmit = useMemo(
    () => business.trim().length >= MIN && business.trim().length <= MAX && state.kind !== 'submitting',
    [business, state.kind],
  );

  function loadSample(id: SampleId) {
    setBusiness(copy.sampleBusinesses[id]);
    textareaRef.current?.focus();
    setState({ kind: 'idle' });
  }

  function reset() {
    setBusiness('');
    setState({ kind: 'idle' });
    setLeadState('idle');
    setEmail('');
    textareaRef.current?.focus();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setState({ kind: 'submitting' });
    try {
      const res = await fetch('/api/home-intake', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ business: business.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data.error === 'string' ? data.error : 'The agent hit a hiccup — try again in a moment.';
        setState({ kind: 'error', message: msg });
        return;
      }
      setState({
        kind: 'answered',
        business: business.trim(),
        answer: typeof data.answer === 'string' ? data.answer : '',
        fellBack: Boolean(data.fellBack),
      });
    } catch {
      setState({
        kind: 'error',
        message: 'The agent lost signal. Try once more — or leave your email and Kate will pick it up.',
      });
    }
  }

  async function handleLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.kind !== 'answered') return;
    const trimmed = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) return;
    setLeadState('sending');
    try {
      await fetch('/api/home-intake', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          business: state.business,
          email: trimmed,
          answer: state.answer,
          leadOnly: true,
        }),
      });
      setLeadState('sent');
    } catch {
      setLeadState('error');
    }
  }

  const showAnswer = state.kind === 'answered';

  return (
    <section id="intake" className={styles.root} aria-label="Tell your agent about your business">
      <header className={styles.banner}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 className={styles.heading}>{copy.heading}</h2>
        <p className={styles.lede}>{copy.lede}</p>
      </header>

      <div className={styles.grid}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{copy.textareaLabel}</span>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder={copy.textareaPlaceholder}
              rows={7}
              maxLength={MAX + 20}
              disabled={state.kind === 'submitting'}
            />
            <span className={styles.counter} aria-hidden>
              {business.trim().length}
              <span className={styles.counterSep}>/</span>
              {MAX}
            </span>
          </label>

          <div className={styles.samples}>
            <span className={styles.samplesLabel}>{copy.sampleLabel}</span>
            <div className={styles.sampleRow}>
              {copy.samples.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={styles.sample}
                  onClick={() => loadSample(s.id as SampleId)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.submitRow}>
            <button type="submit" className={styles.submit} disabled={!canSubmit}>
              {state.kind === 'submitting' ? copy.submitBusy : copy.submitLabel}
              <span className={styles.submitArrow} aria-hidden>→</span>
            </button>
            <p className={styles.disclaimer}>{copy.disclaimer}</p>
          </div>

          {state.kind === 'error' && (
            <p className={styles.error} role="alert">
              {state.message}
            </p>
          )}
        </form>

        <aside className={styles.answerCard} aria-live="polite">
          <div className={styles.answerTop}>
            <span className={styles.answerBadge}>your assembl agent</span>
            <span className={styles.answerSub}>draft only · a person confirms</span>
          </div>

          {!showAnswer && (
            <div className={styles.answerIdle}>
              <p className={styles.answerHello}>
                I&rsquo;m reading. Tell me about your business on the left — one paragraph, in your own words — and I&rsquo;ll show you what a Business Genome for you would look like, and what Monday morning would already have done by the time your coffee&rsquo;s cool.
              </p>
              {state.kind === 'submitting' && (
                <p className={styles.answerBusy} aria-live="polite">
                  reading your words
                  <span className={styles.answerBusyDots} aria-hidden>…</span>
                </p>
              )}
            </div>
          )}

          {showAnswer && (
            <div className={styles.answerFull}>
              <h3 className={styles.answerHeading}>{copy.answerHeading}</h3>
              <div className={styles.answerBody}>
                {state.answer
                  .split(/\n{2,}/)
                  .filter((p) => p.trim())
                  .map((p, i) => (
                    <p key={i}>{p.trim()}</p>
                  ))}
              </div>

              {state.fellBack && (
                <p className={styles.answerFallback}>{copy.fallbackNote}</p>
              )}

              <form className={styles.leadForm} onSubmit={handleLead}>
                <label className={styles.leadField}>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={copy.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={leadState === 'sending' || leadState === 'sent'}
                    className={styles.leadInput}
                  />
                </label>
                <button
                  type="submit"
                  className={styles.leadSubmit}
                  disabled={
                    leadState === 'sending' ||
                    leadState === 'sent' ||
                    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
                  }
                >
                  {leadState === 'sent' ? copy.emailSent : copy.emailSubmit}
                </button>
              </form>

              <button type="button" className={styles.reset} onClick={reset}>
                ← {copy.resetLabel}
              </button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
