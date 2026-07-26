'use client';

import { useState } from 'react';
import { assembleBlueprint, type Brief as SharedBrief, type BriefBrand } from '@/lib/build-an-agent/assemble-client';

/**
 * The Blueprint invitation — the first thing a visitor does on the homepage.
 *
 * It asks for the one thing they already have. The full experience (the agent
 * wearing their colours, the live questions, the PDF) lives at /build-an-agent;
 * this hands the finished blueprint over in sessionStorage so the model isn't
 * asked to read the same page twice.
 */

type Brief = SharedBrief;

/** What has actually finished, shown while the model reads. */
interface Progress {
  fetched?: string;
  styles?: number;
  brand?: BriefBrand | null;
  reading?: boolean;
}

export function BlueprintStart() {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [brief, setBrief] = useState<Brief | null>(null);
  const [progress, setProgress] = useState<Progress>({});

  async function assemble() {
    const value = url.trim();
    if (!value || busy) return;
    setBusy(true);
    setError('');
    setBrief(null);
    setProgress({});
    try {
      const result = await assembleBlueprint(value, (evt) => {
        if (evt.stage === 'fetched') setProgress((p) => ({ ...p, fetched: evt.source }));
        else if (evt.stage === 'styles') setProgress((p) => ({ ...p, styles: evt.count }));
        else if (evt.stage === 'colours') setProgress((p) => ({ ...p, brand: evt.brand }));
        else if (evt.stage === 'reading') setProgress((p) => ({ ...p, reading: true }));
      });
      setBrief(result);
      // Announce it so anything else on the page can wear this business —
      // the assembler in particular. sessionStorage as well as the event, so
      // a reload keeps it. They sit far apart in the tree and threading a
      // prop through the whole page component to reach one of them is worse.
      try {
        sessionStorage.setItem('assembl:brief', JSON.stringify(result));
      } catch {
        /* private mode — nothing downstream depends on this succeeding */
      }
      window.dispatchEvent(new CustomEvent('assembl:brief', { detail: result }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The blueprint service is resting — try again in a moment.');
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

      {busy ? (
        <div className="bp-progress">
          {progress.fetched ? <div className="bp-step done">read {progress.fetched}</div> : <div className="bp-step">fetching the page…</div>}
          {progress.styles !== undefined ? (
            <div className="bp-step done">{progress.styles} stylesheet{progress.styles === 1 ? '' : 's'} read</div>
          ) : null}
          {progress.brand !== undefined ? (
            <div className="bp-step done">
              <span>your colours</span>
              <span className="bp-live-sw">
                {progress.brand ? (
                  [progress.brand.primary, progress.brand.secondary, progress.brand.accent]
                    .filter(Boolean)
                    .map((hex) => <i key={hex as string} className="bp-sw" style={{ background: hex as string }} />)
                ) : (
                  <em>no clear palette — your agent will wear assembl&rsquo;s</em>
                )}
              </span>
            </div>
          ) : null}
          {progress.reading ? <div className="bp-step">reading what your business does…</div> : null}
        </div>
      ) : null}

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
