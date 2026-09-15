'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AgentSpec } from '@/apps/do/shared/types';

export function DoShareIntake() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<AgentSpec | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setTitle(params.get('title') || '');
    setText(params.get('text') || '');
    setUrl(params.get('url') || '');
  }, []);

  async function submit(demo = false) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/do/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(
          demo
            ? {
                title: 'Shared into DO (DEMO)',
                text: 'Compare these two quotes and show me what differs — ask before I accept.',
                url: 'https://example.co.nz/quotes-demo',
                templateId: 'quote-compare',
              }
            : { title, text, url },
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'share failed');
      setSpec(data.spec as AgentSpec);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'share failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="do-root">
      <div className="do-shell">
        <header className="do-hero">
          <div>
            <p className="do-eyebrow">assembl · DO · PREVIEW</p>
            <h1 className="do-brand" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>
              Share into DO
            </h1>
            <p className="do-tag">Paste or share text / URL → ✦ make agent.</p>
          </div>
          <div className="do-hero-actions">
            <Link className="do-cta do-cta-secondary" href="/do">
              Back to /do
            </Link>
            <p className="do-honesty">
              DEMO · Web Share Target for installable DO. iOS Share Sheet → native DO when the app
              exists.
            </p>
          </div>
        </header>

        <section className="do-make" aria-label="Paste or share">
          <label className="do-label" htmlFor="share-title">
            Title
          </label>
          <input
            id="share-title"
            className="do-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Optional title"
          />
          <label className="do-label" htmlFor="share-text" style={{ marginTop: '1rem' }}>
            Text
          </label>
          <textarea
            id="share-text"
            className="do-input"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste shared text here"
            style={{ width: '100%', resize: 'vertical' }}
          />
          <label className="do-label" htmlFor="share-url" style={{ marginTop: '1rem' }}>
            URL
          </label>
          <input
            id="share-url"
            className="do-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
          <div className="do-make-row" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="do-cta"
              disabled={busy || (!text.trim() && !url.trim())}
              onClick={() => void submit(false)}
            >
              <span className="do-star" aria-hidden>
                ✦
              </span>
              Make agent from share
            </button>
            <button
              type="button"
              className="do-cta do-cta-secondary"
              disabled={busy}
              onClick={() => void submit(true)}
            >
              Load share DEMO fixture
            </button>
          </div>
          {error ? <p className="do-error">{error}</p> : null}
          {spec ? (
            <p className="do-note" style={{ marginTop: '1rem' }}>
              Compiled <strong>{spec.name}</strong> ·{' '}
              <Link href="/do">Open on /do boards</Link>
            </p>
          ) : null}
        </section>

        <section className="do-how">
          <p className="do-how-title">How share works</p>
          <ol>
            <li>
              <span className="do-how-n">01</span>
              <span>Web: paste here, or install DO PWA and use Share → DO</span>
            </li>
            <li>
              <span className="do-how-n">02</span>
              <span>POST /api/do/share (form or JSON) → AgentSpec</span>
            </li>
            <li>
              <span className="do-how-n">03</span>
              <span>iOS Share Sheet → DO when the native app ships (documented; not built here)</span>
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
