'use client';

import { useState } from 'react';
import styles from './spark.module.css';

const EXAMPLES = [
  'A quote calculator for my painting business — room size, coats, prep, my labour rate, travel, plus GST, giving one clean total.',
  'A client intake form for my consultancy — name, business, contact, service wanted, budget, how they found us. Privacy Act compliant and accessible.',
  'A Healthy Homes compliance checklist — all five standards, a pass/fail and notes for each property, and a summary I can keep on file.',
  'A GST + cashflow calculator — take my income and expenses, set aside the GST I owe, and show what is genuinely mine to spend.',
];

type ToolState =
  | { kind: 'idle' }
  | { kind: 'building' }
  | { kind: 'tool'; title: string; summary: string; html: string; slug: string | null; notice: string }
  | { kind: 'drafting'; message: string };

export default function SparkBuilder() {
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ToolState>({ kind: 'idle' });
  const [copied, setCopied] = useState(false);

  async function build(desc: string, withEmail?: string) {
    setError(null);
    setState({ kind: 'building' });
    try {
      const res = await fetch('/api/spark/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc, email: withEmail ?? email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
        setState({ kind: 'idle' });
        return;
      }
      if (data.drafting) {
        setState({ kind: 'drafting', message: data.message });
        return;
      }
      setState({
        kind: 'tool',
        title: data.title,
        summary: data.summary,
        html: data.html,
        slug: data.slug,
        notice: data.notice,
      });
    } catch {
      setError('Network hiccup — give it another go.');
      setState({ kind: 'idle' });
    }
  }

  const shareUrl =
    state.kind === 'tool' && state.slug
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/spark/tool/${state.slug}`
      : '';

  return (
    <>
      <section className={styles.builder} aria-label="Describe your tool">
        <div className={styles.inputCard}>
          <label htmlFor="spark-desc" className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
            Describe the tool your business needs
          </label>
          <textarea
            id="spark-desc"
            className={styles.textarea}
            placeholder="Describe the tool your business needs — a quote calculator, an intake form, a checklist…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1200}
          />
          <div className={styles.controls}>
            <span className={styles.hint}>Plain English. SPARK builds a working tool — you set the terms.</span>
            <button
              type="button"
              className={styles.build}
              disabled={state.kind === 'building' || description.trim().length < 12}
              onClick={() => build(description)}
            >
              {state.kind === 'building' ? 'SPARK is building…' : 'Build it →'}
            </button>
          </div>
        </div>

        <div className={styles.examples}>
          <span className={styles.examplesLabel}>Or start from one of these</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              className={styles.chip}
              onClick={() => {
                setDescription(ex);
                setError(null);
              }}
            >
              {ex.split(' — ')[0]}
            </button>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </section>

      {state.kind === 'building' && (
        <section className={styles.preview}>
          <div className={styles.previewCard}>
            <div className={styles.previewHead}>
              <div>
                <div className={styles.previewTitle}>SPARK is building your tool…</div>
                <div className={styles.previewSummary}>Turning your description into a working tool.</div>
              </div>
              <span className={styles.draftBadge}>Draft</span>
            </div>
            <div className={styles.frame} style={{ display: 'grid', placeItems: 'center', color: '#7c7268' }}>
              Generating…
            </div>
          </div>
        </section>
      )}

      {state.kind === 'tool' && (
        <section className={styles.preview} aria-label="Your generated tool">
          <div className={styles.previewCard}>
            <div className={styles.previewHead}>
              <div>
                <div className={styles.previewTitle}>{state.title}</div>
                <div className={styles.previewSummary}>{state.summary}</div>
              </div>
              <span className={styles.draftBadge}>Draft preview · in review</span>
            </div>
            {/* Sandboxed: generated JS runs for calculators, but cannot reach the parent or cookies. */}
            <iframe
              className={styles.frame}
              title={state.title}
              srcDoc={state.html}
              sandbox="allow-scripts allow-forms"
            />
            {state.slug && (
              <div className={styles.previewFoot}>
                <span className={styles.shareLink} title={shareUrl}>
                  {shareUrl}
                </span>
                <button
                  type="button"
                  className={styles.copy}
                  onClick={() => {
                    navigator.clipboard?.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  }}
                >
                  {copied ? 'Copied ✓' : 'Copy shareable link'}
                </button>
              </div>
            )}
            <p className={styles.reassureLine}>
              <b>It&rsquo;s yours.</b> {state.notice} You set the rates and terms, you check it&rsquo;s right, you run it.
            </p>
          </div>
        </section>
      )}

      {state.kind === 'drafting' && (
        <section className={styles.preview}>
          <div className={styles.drafting}>
            <h3>SPARK is drafting your tool</h3>
            <p>{state.message}</p>
            <div className={styles.emailRow}>
              <input
                type="email"
                className={styles.emailInput}
                placeholder="you@business.co.nz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Your email"
              />
              <button
                type="button"
                className={styles.build}
                onClick={() => build(description, email)}
                disabled={!email}
              >
                Email it to me
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
