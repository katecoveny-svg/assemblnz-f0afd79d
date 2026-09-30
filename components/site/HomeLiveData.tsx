'use client';
import { useEffect, useState } from 'react';
import type { PublicNzResult } from '@/lib/public-nz/model';
function dateLabel(value: string | null) { return value ? new Date(value).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' }) + ' NZ time' : 'unavailable'; }
export function HomeLiveData() {
  const [data, setData] = useState<PublicNzResult | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/home/live', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]) })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('unavailable')))
      .then(value => { if (!controller.signal.aborted) setData(value.publicNz); })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, []);
  return <section className="aj-panel aj-livedata" id="live-data">
    <article className="aj-livedata-copy">
      <span>07 / WHERE THE EVIDENCE STARTS</span>
      <h2>Start with the official source.</h2>
      <p>Explore a reviewed set of public New Zealand tender and Parliament links. Source checks show whether the feed is returning. They do not establish when a notice was published or whether a tender remains open.</p>
      <p>This first connection is a link index. Read the original record to verify its contents, publication date and status before preparing work in Pursuit or DO.</p>
      <div className="aj-livedata-note"><i aria-hidden="true" /><span>PUBLICATION, DEADLINES AND SOURCE CHECKS ARE DIFFERENT DATES</span></div>
    </article>
    <div className="aj-livedata-figures" aria-label="Reviewed public New Zealand source links">
      {!data && <p>{failed ? 'Public source links are unavailable right now.' : 'Checking reviewed source links…'}</p>}
      {data?.sources.map(source => <div key={source.key} className="aj-figure">
        <span><a href={source.url} target="_blank" rel="noopener noreferrer">{source.name}</a> / {source.state}</span>
        <small>Last successful fetch: {dateLabel(source.lastSuccessfulFetchAt)}<br />Last check: {dateLabel(source.lastCheckedAt)}</small>
      </div>)}
      {data && !data.records.length && <p>No verified source links are available for this read.</p>}
      {data?.records.map(record => <div key={record.citation} className="aj-figure">
        <span><a href={record.url} target="_blank" rel="noopener noreferrer">{record.label}</a></span>
        <small>Original publication date: unverified. Status: verify at source.<br />Recorded in index: {dateLabel(record.recordedAt)}</small>
      </div>)}
      {data?.degraded && <p>Some source checks are stale, failed or unavailable. Linked records may be historical.</p>}
    </div>
  </section>;
}
