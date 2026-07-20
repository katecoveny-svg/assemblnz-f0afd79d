'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import { encodeConfig } from '@/lib/build-an-agent/share';
import { useBuilder } from '@/lib/build-an-agent/store';
import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';

import { useReveal } from './useReveal';
import styles from './share-section.module.css';

type SaveState = 'idle' | 'sending' | 'sent' | 'error';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Save + share step. The visitor gets:
 *   - A share URL that hydrates their exact placed agent on the receiver
 *   - A downloadable PNG (the same next/og image; renders name + chrome sphere)
 *   - An optional email so Kate holds it and follows up
 */
export function ShareSection() {
  const {
    state: { config },
  } = useBuilder();
  const copy = BUILD_AN_AGENT.share;
  const { ref, shown } = useReveal<HTMLElement>();

  const encoded = useMemo(() => encodeConfig(config), [config]);
  const [origin, setOrigin] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const shareUrl = origin ? `${origin}/build-an-agent?c=${encoded}` : `/build-an-agent?c=${encoded}`;
  // The /og route handler (not the opengraph-image file convention — that
  // never receives query params, so it can't personalise).
  const imageUrl = origin
    ? `${origin}/build-an-agent/og?c=${encoded}`
    : `/build-an-agent/og?c=${encoded}`;

  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [save, setSave] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const agentName = config.name.trim() || copy.defaultName;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback — select the input.
      window.prompt(copy.manualCopyPrompt, shareUrl);
    }
  }

  function downloadImage() {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `assembl-agent-${agentName.replace(/\s+/g, '-').toLowerCase() || 'preview'}.png`;
    a.rel = 'noopener';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (save === 'sending' || save === 'sent') return;
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setSaveError(copy.emailInvalid);
      return;
    }
    setSaveError(null);
    setSave('sending');
    try {
      const res = await fetch('/api/build-agent/save', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ config, email: trimmed }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setSaveError(typeof j.error === 'string' ? j.error : copy.saveErrorGeneric);
        setSave('error');
        return;
      }
      setSave('sent');
    } catch {
      setSaveError(copy.saveErrorGeneric);
      setSave('error');
    }
  }

  return (
    <section
      id="share"
      ref={ref}
      className={`${styles.root} reveal ${shown ? 'revealShown' : ''}`}
      aria-label="Save and share your agent"
    >
      <div className="chromeField" aria-hidden />
      <header className={`${styles.banner} glowSoft`} data-parallax="0.05">
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 className={styles.heading}>{copy.heading}</h2>
        <p className={styles.lede}>{copy.lede}</p>
      </header>

      <div className={styles.grid}>
        {/* PREVIEW CARD — shows the OG image, i.e. the exact same image
             LinkedIn/X will preview if they paste the share URL. */}
        <figure className={styles.preview}>
          <div className={styles.previewFrame}>
            {origin && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={copy.previewAlt.replace('{name}', agentName)}
                width={1200}
                height={630}
                className={styles.previewImage}
              />
            )}
          </div>
          <figcaption className={styles.previewCaption}>{copy.previewCaption}</figcaption>
        </figure>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <div className={styles.linkRow}>
            <span className={styles.linkLabel}>{copy.linkLabel}</span>
            <div className={styles.linkBox}>
              <input
                type="text"
                readOnly
                className={styles.linkInput}
                value={shareUrl}
                aria-label={copy.linkLabel}
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                type="button"
                className="btn3d btn3dSm"
                onClick={copyLink}
                aria-live="polite"
              >
                {copied ? copy.linkCopied : copy.linkCopy}
              </button>
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button type="button" className="btn3d btn3dGhost btn3dSm" onClick={downloadImage}>
              {copy.saveImage}
              <span aria-hidden className={styles.buttonArrow}>↓</span>
            </button>
          </div>

          {/* HOLD IT FOR ME — email → notifyLead → Kate */}
          <form className={styles.saveForm} onSubmit={handleSave}>
            <label className={styles.saveField}>
              <span className={styles.saveLabel}>{copy.saveLabel}</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={copy.savePlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={save === 'sending' || save === 'sent'}
                className={styles.saveInput}
              />
            </label>
            <button
              type="submit"
              className="btn3d btn3dSm"
              disabled={
                save === 'sending' ||
                save === 'sent' ||
                !EMAIL_RE.test(email.trim())
              }
            >
              {save === 'sent' ? copy.saveSent : save === 'sending' ? copy.saveSending : copy.saveSubmit}
            </button>
          </form>

          {saveError && (
            <p className={styles.error} role="alert">
              {saveError}
            </p>
          )}

          <p className={styles.footnote}>{copy.footnote}</p>
        </div>
      </div>
    </section>
  );
}
