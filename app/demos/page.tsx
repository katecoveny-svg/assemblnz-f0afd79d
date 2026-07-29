import type { Metadata } from 'next';
import { DEMOS, SUPERSEDED, url } from '@/lib/demos/catalogue';
import './demos.css';

export const metadata: Metadata = {
  title: 'Concept demos — the canonical list · assembl',
  description:
    'Every assembl concept demo, one per lead, with the line that opens the conversation and anything to check before sending.',
  robots: { index: false, follow: false },
};

/**
 * /demos — the front door for the concept fleet.
 *
 * Kate, 30 July 2026: "combine the best of all into one sharp cohesive demo
 * concept that I can easily find and access to stop the double ups."
 *
 * The double-ups happened because nothing recorded which build was current and
 * nothing listed them. This page is the record: one row per lead, the wedge to
 * open with, the caution to check, and an explicit list of the URLs that are
 * superseded and should not be sent.
 */
export default function DemosPage() {
  const named = DEMOS.filter((d) => d.kind === 'named');
  const demos = DEMOS.filter((d) => d.kind === 'demonstrator');
  const flagged = DEMOS.filter((d) => d.caution);

  return (
    <main className="dm">
      <div className="dm-wrap">
        <header className="dm-head">
          <p className="dm-kick">assembl · internal · not indexed</p>
          <h1>
            The concept fleet.<br />
            <span className="dm-metal">One link per lead.</span>
          </h1>
          <p className="dm-lede">
            {named.length} named concepts and {demos.length} category demonstrators. Each row is
            the one to send &mdash; the older builds are listed at the bottom so nothing gets
            forwarded twice.
          </p>
          <p className="dm-note">
            Every concept is independent: not commissioned by, affiliated with or endorsed by the
            company named. Category demonstrators use invented companies so no real brand is
            borrowed.
          </p>
        </header>

        {flagged.length > 0 && (
          <section className="dm-flags">
            <h2>Check these before you send</h2>
            <ul>
              {flagged.map((d) => (
                <li key={d.slug}>
                  <b>{d.company}</b> {d.caution}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="dm-h2">Named concepts</h2>
          <div className="dm-list">
            {named.map((d) => (
              <article key={d.slug} className="dm-card">
                <div className="dm-card-top">
                  <div>
                    <p className="dm-sector">{d.sector}</p>
                    <h3>{d.company}</h3>
                  </div>
                  <a className="dm-open" href={url(d.slug)} target="_blank" rel="noopener">
                    open &rarr;
                  </a>
                </div>
                <p className="dm-wedge"><b>Open with:</b> {d.wedge}</p>
                <p className="dm-show"><b>Worth showing:</b> {d.showpiece}</p>
                {d.caution && <p className="dm-caution">{d.caution}</p>}
                <div className="dm-meta">
                  <code className="dm-url">{url(d.slug)}</code>
                  <span className="dm-has">
                    {[
                      d.has.waits && 'six waits',
                      d.has.accept && 'accept panel',
                      d.has.scratch && 'scratch',
                      d.has.agent && 'live agent',
                    ].filter(Boolean).join(' · ') || 'bespoke build'}
                  </span>
                </div>
                {d.superseded && (
                  <p className="dm-sup">
                    Replaces {d.superseded.map((s) => s.slug).join(' and ')} &mdash;{' '}
                    {d.superseded[0]!.note}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="dm-h2">Category demonstrators</h2>
          <p className="dm-sub">
            Invented companies, so the shape of a sector can be shown without borrowing anyone&rsquo;s
            brand to do it.
          </p>
          <div className="dm-list tight">
            {demos.map((d) => (
              <article key={d.slug} className="dm-card small">
                <div className="dm-card-top">
                  <div>
                    <p className="dm-sector">{d.sector}</p>
                    <h3>{d.company}</h3>
                  </div>
                  <a className="dm-open" href={url(d.slug)} target="_blank" rel="noopener">
                    open &rarr;
                  </a>
                </div>
                <p className="dm-show">{d.showpiece}</p>
                <code className="dm-url">{url(d.slug)}</code>
              </article>
            ))}
          </div>
        </section>

        <section className="dm-dead">
          <h2>Superseded &mdash; do not send</h2>
          <p className="dm-sub">
            Still live, because links are already in inboxes. Nothing here is the current build.
          </p>
          <ul>
            {SUPERSEDED.map((s) => (
              <li key={s.slug}>
                <code>{url(s.slug)}</code>
                <span>
                  {s.company} &mdash; {s.note}. Send{' '}
                  <a href={url(s.replacedBy)} target="_blank" rel="noopener">
                    {s.replacedBy}
                  </a>{' '}
                  instead.
                </span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="dm-foot">
          <p>
            assembl &mdash; intuitive agentic customer journeys. Every figure on every concept
            carries its source; anything unsourced was left out.
          </p>
        </footer>
      </div>
    </main>
  );
}
