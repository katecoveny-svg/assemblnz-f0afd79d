'use client';

import { useState } from 'react';

/**
 * The Blueprint invitation — the first thing a visitor does on the homepage.
 *
 * It asks for the one thing they already have. The full experience (the agent
 * wearing their colours, the live questions, the PDF) lives at /build-an-agent;
 * this hands the finished blueprint over in sessionStorage so the model isn't
 * asked to read the same page twice.
 */

type Brand = { primary: string; secondary: string | null; accent: string | null; ink: string } | null;

interface Brief {
  business: string;
  sells: string[];
  voice: string;
  questions: string[];
  facts: string[];
  blindSpots: string[];
  source: string;
  brand: Brand;
}

export function BlueprintStart() {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [brief, setBrief] = useState<Brief | null>(null);

  async function assemble() {
    const value = url.trim();
    if (!value || busy) return;
    setBusy(true);
    setError('');
    setBrief(null);
    try {
      const res = await fetch('/api/agent-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'That site could not be read.');
        return;
      }
      setBrief(data as Brief);
    } catch {
      setError('The blueprint service is resting — try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  function openFull() {
    if (!brief) return;
    try {
      sessionStorage.setItem('assembl:brief', JSON.stringify(brief));
    } catch {
      /* private mode — the builder will just read the site again */
    }
    window.location.href = `/build-an-agent?site=${encodeURIComponent(brief.source)}`;
  }

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
          onKeyDown={(e) => { if (e.key === 'Enter') assemble(); }}
        />
        <button className="btn btn-solid" onClick={assemble} disabled={busy || !url.trim()}>
          {busy ? 'reading…' : 'assemble mine'}
        </button>
      </div>
      <div className="bp-note">
        One public page, about ten seconds. Nothing is stored and nothing is sent.
      </div>
      {error ? <div className="bp-error">{error}</div> : null}

      {brief ? (
        <div className="bp-result">
          <div className="bp-res-head">
            <span className="bp-lab">what it understood</span>
            {brief.brand ? (
              <span className="bp-sw-row">
                <i className="bp-sw" style={{ background: brief.brand.primary }} />
                {brief.brand.secondary ? <i className="bp-sw" style={{ background: brief.brand.secondary }} /> : null}
                {brief.brand.accent ? <i className="bp-sw" style={{ background: brief.brand.accent }} /> : null}
                <em>your colours, off your own stylesheet</em>
              </span>
            ) : null}
          </div>
          <p className="bp-business">{brief.business}</p>

          {brief.blindSpots.length ? (
            <div className="bp-gaps">
              <span className="bp-lab">and what your site doesn&rsquo;t answer</span>
              <ul>{brief.blindSpots.slice(0, 3).map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          ) : null}

          <button className="btn btn-solid bp-open" onClick={openFull}>
            open the full blueprint →
          </button>
        </div>
      ) : null}
    </div>
  );
}
