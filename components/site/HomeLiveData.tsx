'use client';

import { useEffect, useState } from 'react';

/**
 * The live-data panel — assembl's credibility claim, stated as numbers a visitor
 * can watch move rather than as an adjective.
 *
 * It reads /api/home/live, which counts the Knowledge Brain at request time. If
 * the call fails we render the explanation and hide the figures. A placeholder
 * number here would discredit the exact claim the section is making.
 */

type Figure = { label: string; value: number; hint: string };
type Live = { figures: Figure[]; lastFetch: string | null; lastFetchSource: string | null };

function sinceLabel(iso: string | null): string | null {
  if (!iso) return null;
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(mins) || mins < 0) return null;
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export function HomeLiveData() {
  const [live, setLive] = useState<Live | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/home/live')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('unavailable'))))
      .then((d) => {
        if (alive) setLive(d);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const fresh = sinceLabel(live?.lastFetch ?? null);

  return (
    <section className="aj-panel aj-livedata" id="live-data">
      <article className="aj-livedata-copy">
        <span>07 / WHERE THE ANSWERS COME FROM</span>
        <h2>Nothing here is typed in by hand.</h2>
        <p>
          An agent is only worth trusting if it is reading something real. assembl keeps a Knowledge
          Brain: official sources checked on their own schedule, every change recorded with what
          moved and when. When an agent answers, it answers from that.
        </p>
        <p>
          The New Zealand legislation feeds come straight from the Parliamentary Counsel Office —
          the Food Act, the Privacy Act, the Health and Safety at Work Act and the rest — and they
          re-check daily. So when an agent cites a section, it is citing the version that is in
          force today, not the one it was trained on.
        </p>
        <div className="aj-livedata-note">
          <i aria-hidden="true" />
          <span>A SOURCE THAT STOPS RETURNING IS MARKED STALE, NOT LEFT LOOKING FINE</span>
        </div>
      </article>

      <div className="aj-livedata-figures" aria-label="Live knowledge base figures">
        {live?.figures.map((f) => (
          <div key={f.label} className="aj-figure">
            <strong>{f.value.toLocaleString('en-NZ')}</strong>
            <span>{f.label}</span>
            <small>{f.hint}</small>
          </div>
        ))}

        {!live && !failed && (
          <div className="aj-figure aj-figure-wait">
            <strong>·</strong>
            <span>reading the knowledge brain…</span>
          </div>
        )}

        {failed && (
          <div className="aj-figure aj-figure-wait">
            <span>Live figures are unavailable right now.</span>
            <small>They are counted at page load, so this is a live read, not a cached number.</small>
          </div>
        )}

        {fresh && live?.lastFetchSource && (
          <p className="aj-livedata-fresh">
            Most recent source check: <b>{live.lastFetchSource}</b>, {fresh}.
          </p>
        )}
      </div>
    </section>
  );
}
