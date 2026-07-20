'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import { useBuilder } from '@/lib/build-an-agent/store';
import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';

import styles from './ask-section.module.css';

/**
 * "Ask your agent something" — the payoff moment.
 *
 * A real Claude call driven by the placed parts. The response streams in
 * plain text chunks and appears in the card; while it's in flight, we flip
 * the shared `speaking` flag so the model-core mesh in the 3D scene glows.
 */
export function AskSection() {
  const {
    state: { config, speaking },
    setSpeaking,
  } = useBuilder();
  const copy = BUILD_AN_AGENT.ask;

  const [question, setQuestion] = useState<string>(copy.starter);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [asked, setAsked] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (speaking) return;
    const trimmed = question.trim();
    if (trimmed.length < 3) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setError(null);
    setAnswer('');
    setAsked(true);
    setSpeaking(true);

    try {
      const res = await fetch('/api/build-agent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ config, question: trimmed }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(typeof j.error === 'string' ? j.error : 'the agent hit a hiccup');
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error('no stream');
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setAnswer(acc);
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError((err as Error).message || 'try again in a moment');
    } finally {
      setSpeaking(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
    setSpeaking(false);
  }

  return (
    <section id="ask" className={styles.root} aria-label="Ask your agent">
      <header className={styles.banner}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 className={styles.heading}>{copy.heading}</h2>
        <p className={styles.lede}>{copy.lede}</p>
      </header>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={ask}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{copy.questionLabel}</span>
            <textarea
              className={styles.textarea}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={copy.questionPlaceholder}
              rows={3}
              disabled={speaking}
              maxLength={900}
            />
          </label>

          <div className={styles.suggestions}>
            <span className={styles.suggestionsLabel}>{copy.suggestionsLabel}</span>
            <div className={styles.suggestionRow}>
              {copy.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={styles.suggestion}
                  onClick={() => setQuestion(s)}
                  disabled={speaking}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.submitRow}>
            {speaking ? (
              <button type="button" className={styles.stopButton} onClick={stop}>
                {copy.stopLabel}
              </button>
            ) : (
              <button
                type="submit"
                className={styles.submit}
                disabled={question.trim().length < 3}
              >
                {copy.submitLabel}
                <span aria-hidden className={styles.submitArrow}>
                  →
                </span>
              </button>
            )}
            <span className={styles.draftNote}>{copy.draftNote}</span>
          </div>
        </form>

        <div className={styles.answerBlock} aria-live="polite">
          <div className={styles.answerTop}>
            <span className={styles.answerBadge}>
              {config.name.trim() || copy.defaultName}
            </span>
            <span className={styles.answerSub}>
              {speaking ? copy.streamingLabel : asked ? copy.readyLabel : copy.idleLabel}
              {speaking && <span className={styles.dots} aria-hidden>…</span>}
            </span>
          </div>

          {!asked && !answer && (
            <p className={styles.answerHello}>{copy.idleBody}</p>
          )}

          {(asked || answer) && (
            <div className={styles.answerBody}>
              {answer
                .split(/\n{2,}/)
                .filter((p) => p.trim())
                .map((p, i) => (
                  <p key={i}>{p.trim()}</p>
                ))}
              {speaking && !answer && (
                <p className={styles.answerLoading}>{copy.streamingBody}</p>
              )}
            </div>
          )}

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          {/* Share at peak delight — the moment the answer lands, not three
              sections later. */}
          {answer && !speaking && (
            <div className={styles.shareStrip}>
              <button
                type="button"
                className={styles.shareCtaBtn}
                onClick={() =>
                  document.getElementById('share')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              >
                {copy.shareCta}
                <span aria-hidden>↓</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
