import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { DEMOS, SUPERSEDED, url } from '@/lib/demos/catalogue';
import { DemosGate } from './DemosGate';
import { DEMOS_COOKIE } from './gate-shared';
import { GlassIdentity } from '@/components/brand/GlassIdentity';
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
export default async function DemosPage() {
  // Kate, 1 Aug 2026: the index is the playbook — hers, not the public's. The
  // concept links stay open for clients; only this page sits behind the word.
  const jar = await cookies();
  if (jar.get(DEMOS_COOKIE)?.value !== '1') return <DemosGate />;

  // 1 Aug 2026: the demo-framework docs turned the flat list into a stack —
  // send-now, this-month, evidence exhibits, and parked (kept live because
  // links are in inboxes, but out of the outreach path).
  const now = DEMOS.filter((d) => d.tier === 'now');
  const next = DEMOS.filter((d) => d.tier === 'next');
  const exhibits = DEMOS.filter((d) => d.tier === 'exhibit');
  const parked = DEMOS.filter((d) => d.tier === 'parked');
  const flagged = DEMOS.filter((d) => d.caution && d.tier !== 'parked');

  return (
    <div className="dm">
      <div className="dm-wrap">
        <header className="dm-head"><GlassIdentity kind="assembl" size={48} />
          <p className="dm-kick">assembl · internal · not indexed</p>
          <h1>
            The concept fleet.<br />
            <span className="dm-metal">One link per lead.</span>
          </h1>
          <p className="dm-lede">
            Current discovery links with dated verification: {now.length} priority reviews,
            {' '}{next.length} next reviews, {exhibits.length} references and {parked.length} parked.
            Legacy priorities are retained for navigation; they do not establish current readiness
            or authorise outreach. Only the Woolworths canonical destination was rechecked in this slice.
          </p>
          <p className="dm-note">
            Every concept is independent: not commissioned by, affiliated with or endorsed by the
            company named. Category demonstrators use invented companies so no real brand is
            borrowed.
          </p>
        </header>

        {flagged.length > 0 && (
          <section className="dm-flags">
            <h2>Check before external use</h2>
            <ul>
              {flagged.map((d) => (
                <li key={d.slug}>
                  <b>{d.company}</b> {d.caution}
                </li>
              ))}
            </ul>
          </section>
        )}

        {[
          {
            title: 'Priority review',
            sub: 'Current primary links. Review the dated behavior and limitations before using a concept externally.',
            list: now,
            tight: false,
          },
          {
            title: 'Next review',
            sub: 'Preserved discovery priorities from the earlier catalogue. Current access and provider behavior require verification.',
            list: next,
            tight: false,
          },
          {
            title: 'Evidence exhibits — no further build',
            sub: 'Historical examples for inspection and reuse. Their presence is not a production-readiness claim.',
            list: exhibits,
            tight: true,
          },
        ].map((g) => (
          <section key={g.title}>
            <h2 className="dm-h2">{g.title}</h2>
            <p className="dm-sub">{g.sub}</p>
            <div className={g.tight ? 'dm-list tight' : 'dm-list'}>
              {g.list.map((d) => (
                <article key={d.slug} className={g.tight ? 'dm-card small' : 'dm-card'}>
                  <div className="dm-card-top">
                    <div>
                      <p className="dm-sector">{d.sector}</p>
                      <h3>{d.company}</h3>
                    </div>
                    <a className="dm-open" href={url(d)} target="_blank" rel="noopener">
                      open &rarr;
                    </a>
                  </div>
                  {!g.tight && <p className="dm-wedge"><b>Open with:</b> {d.wedge}</p>}
                  <p className="dm-show">{g.tight ? d.showpiece : <><b>Worth showing:</b> {d.showpiece}</>}</p>
                  {d.caution && !g.tight && <p className="dm-caution">{d.caution}</p>}
                  <div className="dm-meta">
                    <code className="dm-url">{url(d)}</code>
                    {!g.tight && (
                      <span className="dm-has">
                        {[
                          d.has.waits && 'wait concepts',
                          d.has.accept && 'accept panel',
                          d.has.scratch && 'scratch',
                          d.has.agent && 'agent concept',
                        ].filter(Boolean).join(' · ') || 'bespoke build'}
                      </span>
                    )}
                  </div>
                  {d.verification && <p className="dm-caution">Verified {d.verification.observedAt} · {d.verification.access} · {d.verification.behavior} {d.verification.readiness}</p>}
                  {d.superseded && !g.tight && (
                    <p className="dm-sup">
                      Preserved references: {d.superseded.map((s) => s.slug).join(' and ')} &mdash;{' '}
                      {d.superseded[0]!.note}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="dm-dead">
          <h2>Parked &mdash; not for outreach</h2>
          <p className="dm-sub">
            Kept for reference under their earlier catalogue classification. No outreach is
            authorised by this index. Access and integration status have not been reverified here.
          </p>
          <ul>
            {parked.map((d) => (
              <li key={d.slug}>
                <code>{url(d)}</code>
                <span>{d.company} &mdash; {d.sector}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Kate, 1 Aug 2026: "put the receipts in there and also the team rooms
            and that I use Hermes' agent and Claude agent." The rest of the kit
            a pitch leans on, listed beside the fleet so nothing lives only in
            her head. The teamroom has no public URL on purpose — it runs on the
            studio's own BUZZ stack. */}
        <section>
          <h2 className="dm-h2">The rest of the kit</h2>
          <div className="dm-list tight">
            <article className="dm-card small">
              <div className="dm-card-top">
                <div>
                  <p className="dm-sector">trust · every demo</p>
                  <h3>Mana Receipts</h3>
                </div>
                <a className="dm-open" href="/mana-receipts" target="_blank" rel="noopener">
                  open &rarr;
                </a>
              </div>
              <p className="dm-show">
                The audit artefact behind the fleet: what an agent did, what it refused, and who
                approved it &mdash; itemised, on the record. The Everyday Rewards demonstrator ends
                on one; pilots issue them from the teamroom.
              </p>
              <code className="dm-url">assembl.co.nz/mana-receipts</code>
            </article>
            <article className="dm-card small">
              <div className="dm-card-top">
                <div>
                  <p className="dm-sector">pilot workspace · studio-run</p>
                  <h3>The teamroom</h3>
                </div>
              </div>
              <p className="dm-show">
                Where pilots actually run: a shared room on the studio&rsquo;s BUZZ stack where the
                client, Kate, and the agents work side by side &mdash; staffed by Hermes&rsquo; agent
                and the Claude agent as named teammates, with Mana Receipts issued from the room.
                No public URL by design; clients are invited in per pilot.
              </p>
              <code className="dm-url">private &mdash; invitation per pilot</code>
            </article>
          </div>
        </section>

        <section className="dm-dead">
          <h2>Preserved earlier references</h2>
          <p className="dm-sub">
            Original destinations are preserved without redirects or deletion. Their current availability is unverified; use the canonical destination for the current concept.
          </p>
          <ul>
            {SUPERSEDED.map((s) => (
              <li key={s.slug}>
                <a href={url(s.slug)} target="_blank" rel="noopener"><code>{url(s.slug)}</code></a>
                <span>
                  {s.company} &mdash; {s.note}. Current:{' '}
                  <a href={s.replacedByTarget} target="_blank" rel="noopener">
                    {s.replacedBy}
                  </a>{' '}
                  .
                </span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="dm-foot">
          <p>
            assembl &mdash; intuitive agentic customer journeys. Sample concepts and historical
            references require their own evidence checks; this index does not certify production readiness.
          </p>
        </footer>
      </div>
    </div>
  );
}
