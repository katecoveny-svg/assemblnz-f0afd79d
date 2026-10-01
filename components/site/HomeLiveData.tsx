'use client';
import { useEffect, useState } from 'react';
import type { PublicNzResult } from '@/lib/public-nz/model';
import type { OfficialVerification } from '@/lib/public-nz/parliament';
function dateLabel(value: string | null) { return value ? new Date(value).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' }) + ' NZ time' : 'unavailable'; }
export function HomeLiveData() {
  const [data, setData] = useState<PublicNzResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [verification, setVerification] = useState<OfficialVerification | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/home/live', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(7000)]) })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('unavailable')))
      .then(value => { if (!controller.signal.aborted) { setData(value.publicNz); setVerification({ ...value.verification, records: value.verification.records.filter((r: OfficialVerification['records'][number]) => r.state !== 'verified' || Date.parse(r.expiresAt) > Date.now()) }); } })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const expiries = verification?.records.flatMap(r => r.state === 'verified' ? [Date.parse(r.expiresAt)] : []) ?? [];
    if (!expiries.length) return;
    const timer = setTimeout(() => setVerification(null), Math.max(0, Math.min(...expiries) - Date.now()));
    return () => clearTimeout(timer);
  }, [verification]);
  return <section className="aj-panel aj-livedata" id="live-data">
    <article className="aj-livedata-copy">
      <span>07 / WHERE THE EVIDENCE STARTS</span>
      <h2>Start with the official source.</h2>
      <p>Explore a reviewed set of public New Zealand tender and Parliament links. Source checks show whether the feed is returning. They do not establish when a notice was published or whether a tender remains open.</p>
      <p>Parliament records show a title and stage only when a fresh check of the official detail API succeeds. Other records remain discovery links. Read the original source before preparing work.</p>
      <div className="aj-livedata-note"><i aria-hidden="true" /><span>PUBLICATION, DEADLINES AND SOURCE CHECKS ARE DIFFERENT DATES</span></div>
    </article>
    <div className="aj-livedata-figures" aria-label="Reviewed public New Zealand source links">
      {!data && <p>{failed ? 'Public source links are unavailable right now.' : 'Checking reviewed source links…'}</p>}
      {data?.sources.map(source => <div key={source.key} className="aj-figure">
        <span><a href={source.url} target="_blank" rel="noopener noreferrer">{source.name}</a> / {source.state}</span>
        <small>Last successful fetch: {dateLabel(source.lastSuccessfulFetchAt)}<br />Last check: {dateLabel(source.lastCheckedAt)}</small>
      </div>)}
      {data && !data.records.length && <p>No verified source links are available for this read.</p>}
      {data?.records.map(record => {
        const proof = verification?.records.find(r => r.citation === record.citation);
        const verified = proof?.state === 'verified' ? proof : null;
        return <div key={record.citation} className="aj-figure">
          <span><a href={record.url} target="_blank" rel="noopener noreferrer">{verified?.title ?? record.label}</a></span>
          {verified ? <small>Official status: {verified.status ?? 'not provided'} / Stage: {verified.stage ?? 'not provided'}<br />Introduced: {verified.introducedAt ?? 'not provided'}. Stage activity: {verified.activityAt ?? 'not provided'}.<br />Detail checked: {dateLabel(verified.verifiedAt)}. Original publication date: not provided.</small> : <small>Discovery link. Original publication date: unverified. Status: verify at source.<br />Recorded in index: {dateLabel(record.recordedAt)}</small>}
        </div>;
      })}
      {data?.degraded && <p>Some source checks are stale, failed or unavailable. Linked records may be historical.</p>}
    </div>
  </section>;
}
