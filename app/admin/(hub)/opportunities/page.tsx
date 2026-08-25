import Link from 'next/link';
import { getOpportunityHorizon } from '@/lib/opportunity-horizon';
import styles from './opportunity-horizon.module.css';

export const dynamic = 'force-dynamic';

function nzDate(value: string | null): string {
  if (!value) return 'not yet';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-NZ', {
    dateStyle: 'medium',
    timeZone: 'Pacific/Auckland',
  }).format(date);
}

function words(value: string): string {
  return value.toLowerCase().replaceAll('_', ' ');
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const horizon = await getOpportunityHorizon(q);
  const highPriority = horizon.items.filter((item) => item.likelyToSayYesQuickly >= 7.5).length;
  const namedBuyers = horizon.items.filter((item) => item.buyerOrg).length;
  const sourceIssues = horizon.sources.filter((source) => source.active && source.status !== 'ok').length;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Operator · Opportunity Horizon</p>
          <h1>See the journey before the brief hardens.</h1>
          <p className={styles.lede}>
            Official policy, funding, delivery and procurement signals are scored against the moment assembl can still help shape a useful customer journey.
          </p>
        </div>
        <div className={styles.heroProof}>
          <span>PROVENANCE ON</span>
          <strong>{horizon.sources.length}</strong>
          <small>configured sources</small>
        </div>
      </header>

      <form className={styles.search} action="/admin/opportunities" method="get">
        <label htmlFor="opportunity-query">Search evidence</label>
        <div className={styles.searchRow}>
          <input
            id="opportunity-query"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="food waste, claims, energy hardship…"
            maxLength={120}
          />
          <button type="submit">Search horizon</button>
          {q ? <Link href="/admin/opportunities">Clear</Link> : null}
        </div>
      </form>

      <section className={styles.stats} aria-label="Opportunity summary">
        <article><span>Matches</span><strong>{horizon.items.length}</strong></article>
        <article><span>Score 7.5+</span><strong>{highPriority}</strong></article>
        <article><span>Named buyers</span><strong>{namedBuyers}</strong></article>
        <article><span>Source issues</span><strong>{sourceIssues}</strong></article>
      </section>

      <section className={styles.lifecycleSection} aria-labelledby="lifecycle-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Lifecycle model</p>
            <h2 id="lifecycle-title">One chain, nine commercial moments</h2>
          </div>
          <p>Each result sits at the earliest stage supported by its evidence. It is not promoted to a later stage by inference alone.</p>
        </div>
        <ol className={styles.lifecycle}>
          {horizon.lifecycle.map((stage, index) => (
            <li key={stage.key}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{stage.label}</strong>
            </li>
          ))}
        </ol>
      </section>

      {!horizon.available ? (
        <section className={styles.empty}>
          <p className={styles.eyebrow}>Not live in this environment</p>
          <h2>The source registry is not available yet.</h2>
          <p>Apply the Opportunity Horizon migration and allow the existing Knowledge Brain scheduler to complete its first source run.</p>
        </section>
      ) : horizon.items.length === 0 ? (
        <section className={styles.empty}>
          <p className={styles.eyebrow}>No supported match</p>
          <h2>{q ? `No evidence currently matches “${q}”.` : 'The configured sources have not produced a qualifying signal yet.'}</h2>
          <p>Source failures remain visible below; an unavailable optional page does not suppress healthy evidence.</p>
        </section>
      ) : (
        <section className={styles.results} aria-labelledby="results-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Ranked openings</p>
              <h2 id="results-title">Likely to say yes quickly</h2>
            </div>
            <p>The 0–10 score combines lifecycle timing, authority, customer-journey evidence, route openness, urgency, named organisation and recency.</p>
          </div>

          <div className={styles.cards}>
            {horizon.items.map((item) => (
              <article className={styles.card} key={item.id}>
                <div className={styles.cardTop}>
                  <div className={styles.score} aria-label={`${item.likelyToSayYesQuickly} out of 10 likely to say yes quickly`}>
                    <strong>{item.likelyToSayYesQuickly.toFixed(1)}</strong>
                    <span>/10</span>
                  </div>
                  <div className={styles.cardTitle}>
                    <div className={styles.badges}>
                      <span>{item.stageLabel}</span>
                      <span>Tier {item.authorityTier}</span>
                      <span>{words(item.urgency)}</span>
                    </div>
                    <h3>
                      {item.url ? <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a> : item.title}
                    </h3>
                    <p className={styles.source}>{item.sourceName} · confidence {Math.round(item.confidence * 100)}%</p>
                  </div>
                </div>

                {item.excerpt ? <p className={styles.excerpt}>{item.excerpt}</p> : null}

                <dl className={styles.detailsGrid}>
                  <div>
                    <dt>Named buyer / organisation</dt>
                    <dd>{item.buyerOrg ?? 'Not named in the extracted evidence'}</dd>
                  </div>
                  <div>
                    <dt>Publisher</dt>
                    <dd>{item.publisherOrg ?? item.sourceName}</dd>
                  </div>
                  <div>
                    <dt>Commercial opening</dt>
                    <dd>{item.commercialOpening}</dd>
                  </div>
                  <div>
                    <dt>Likely route</dt>
                    <dd>{item.likelyRoute}</dd>
                  </div>
                </dl>

                <div className={styles.cardFoot}>
                  <p><span>Urgency</span>{item.urgencyReason}</p>
                  <p><span>Observed</span>{nzDate(item.publishedAt ?? item.detectedAt)}</p>
                </div>

                <details className={styles.proof}>
                  <summary>Open evidence and score</summary>
                  <div className={styles.proofBody}>
                    <div>
                      <h4>Score components</h4>
                      <ul>
                        {item.scoreBreakdown.map((component) => (
                          <li key={component.label}><span>{component.label}</span><strong>+{component.points}</strong></li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4>Evidence boundary</h4>
                      <p>{item.authorityLabel}. Detected {nzDate(item.detectedAt)}.</p>
                      {item.limitations.length ? (
                        <ul>{item.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
                      ) : <p>No additional limitation recorded.</p>}
                    </div>
                  </div>
                </details>
              </article>
            ))}
          </div>
        </section>
      )}

      <details className={styles.sourceHealth} open={horizon.partial}>
        <summary>Source health · {horizon.sources.length - sourceIssues} healthy · {sourceIssues} need attention</summary>
        <div className={styles.sourceTableWrap}>
          <table>
            <thead><tr><th>Source</th><th>Class</th><th>Tier</th><th>Status</th><th>Last checked</th></tr></thead>
            <tbody>
              {horizon.sources.map((source) => (
                <tr key={source.id}>
                  <td><a href={source.url} target="_blank" rel="noreferrer">{source.name}</a>{source.optional ? <small>optional</small> : null}</td>
                  <td>{words(source.sourceClass)}</td>
                  <td>{source.authorityTier}</td>
                  <td>{source.status}</td>
                  <td>{nzDate(source.lastCheckedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
