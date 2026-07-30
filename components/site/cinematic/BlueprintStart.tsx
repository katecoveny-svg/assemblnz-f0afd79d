'use client';

import { useState } from 'react';

/**
 * The homepage box — the first thing a visitor does.
 *
 * Kate, 30 July 2026: "its the home page box tghat doesnt give you the ai check
 * it gives you a business blueptint".
 *
 * She was right, and it was the wrong thing in the most damaging possible place.
 * The card's own copy promises an AI-readiness score and a context.md. The box
 * underneath it called `assembleBlueprint` — the old agent-builder pipeline —
 * showed "what it understood", and finished on a button reading "open the full
 * blueprint →" that sent people to /build-an-agent. So the one thing the
 * homepage asks a stranger to do delivered neither of the two things it had just
 * offered them.
 *
 * It now runs the real check. POST /api/ai-ready is deterministic, makes no model
 * call, and comes back in about a second with a score out of 100 and eight
 * checks, so the score can land inline rather than after a page load. Pressing
 * through goes to /ai-ready?u=…, where the same result reopens with the journey,
 * the context.md and the context PDF.
 */

type Check = {
  id: string;
  label: string;
  status: 'pass' | 'partial' | 'fail';
  detail: string;
  fix: string;
  weight: number;
};
type Ready = { url: string; site: string; score: number; checks: Check[]; checkedAt: string };

export function BlueprintStart() {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState<Ready | null>(null);

  async function check() {
    const value = url.trim();
    if (!value || busy) return;
    setBusy(true);
    setError('');
    setReady(null);
    try {
      const res = await fetch('/api/ai-ready', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: value }),
      });
      const data = (await res.json()) as Ready & { error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? 'That did not come back cleanly — try the public https:// address.');
        return;
      }
      setReady(data);
      /* Hand the result to /ai-ready so pressing through does not re-run the
         same eight checks on the same site. */
      try {
        sessionStorage.setItem('assembl:ai-ready', JSON.stringify(data));
      } catch {
        /* private mode — /ai-ready simply runs the checks again, which is cheap */
      }
    } catch {
      setError('That did not come back cleanly — check the address and try again.');
    } finally {
      setBusy(false);
    }
  }

  function openFull() {
    if (!ready) return;
    /* `url` is the address and `site` is the page title — the API returns both,
       and passing the title here silently broke the handover the first time. */
    window.location.href = `/ai-ready?u=${encodeURIComponent(ready.url)}`;
  }

  /* Lead with what is wrong, because that is the useful part and it is the
     reason to press through. A perfect score falls back to the passes. */
  const failed = ready ? ready.checks.filter((c) => c.status !== 'pass') : [];
  const shown = ready ? (failed.length ? failed : ready.checks).slice(0, 3) : [];

  return (
    <div className="bp-start">
      <div className="bp-row">
        <input
          className="bp-input"
          type="text"
          inputMode="url"
          value={url}
          maxLength={200}
          placeholder="yourbusiness.co.nz"
          aria-label="your website address"
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void check(); }}
        />
        <button className="btn btn-solid" onClick={() => void check()} disabled={busy || !url.trim()}>
          {busy ? 'checking…' : 'check my site — free'}
        </button>
      </div>
      <div className="bp-note">
        Eight checks on one public page, about a second. Nothing is stored and nothing is sent.
      </div>
      {error ? <div className="bp-error">{error}</div> : null}

      {busy ? (
        <div className="bp-progress">
          <div className="bp-step">reading the page…</div>
          <div className="bp-step">can AI assistants get in, and can they read you…</div>
        </div>
      ) : null}

      {ready ? (
        <div className="bp-result">
          <div className="bp-res-head">
            <span className="bp-lab">your AI-readiness score</span>
            <span className="bp-score">{ready.score}<em>/100</em></span>
          </div>
          <p className="bp-business">
            {ready.checks.filter((c) => c.status === 'pass').length} of {ready.checks.length}{' '}
            checks passed on <b>{ready.url.replace(/^https?:\/\//, '')}</b>.
          </p>

          {shown.length ? (
            <div className="bp-gaps">
              <span className="bp-lab">
                {failed.length ? 'what is holding you back' : 'what is already working'}
              </span>
              <ul>{shown.map((c) => <li key={c.id}>{c.label} — {c.detail}</li>)}</ul>
            </div>
          ) : null}

          <button className="btn btn-solid bp-open" onClick={openFull}>
            open the full result + context PDF →
          </button>
        </div>
      ) : null}
    </div>
  );
}
