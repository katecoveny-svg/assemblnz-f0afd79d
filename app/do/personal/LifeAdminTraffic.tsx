"use client";
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import type { NztaTrafficSnapshot } from '@/lib/do/nz-public-data';
import styles from './LifeAdmin.module.css';
const officialUrl = 'https://www.journeys.nzta.govt.nz/highway-conditions/traffic-and-travel-list-view';
/** Reads only the public national feed. All filtering stays in this browser. */
export function LifeAdminTraffic() {
  const [snapshot, setSnapshot] = useState<NztaTrafficSnapshot | null>(null);
  const [region, setRegion] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [limit, setLimit] = useState(6);
  const controller = useRef<AbortController | null>(null);
  const lock = useRef(false);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 15_000); return () => { clearInterval(timer); controller.current?.abort(); }; }, []);
  async function refresh() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setNotice('');
    const request = new AbortController(); controller.current = request;
    try {
      const response = await fetch('/api/do/nz-public-data?source=nzta-traffic', { cache: 'no-store', signal: request.signal });
      const body = await response.json();
      if (request.signal.aborted) return;
      if (body.source?.id !== 'nzta-traffic' || !Array.isArray(body.events)) throw new Error(body.message || 'Traffic information is unavailable.');
      setSnapshot(body as NztaTrafficSnapshot); setNow(Date.now()); setLimit(6);
      if (!response.ok) setNotice(body.message || 'Traffic information is unavailable.');
    } catch (error) {
      if (!request.signal.aborted) { setSnapshot(null); setNotice(error instanceof Error ? error.message : 'Traffic information is unavailable.'); }
    } finally { lock.current = false; setBusy(false); }
  }
  const events = snapshot?.events.filter((event) => !region || event.region.name === region) ?? [];
  const regions = [...new Set(snapshot?.events.map((event) => event.region.name) ?? [])].sort();
  const stale = snapshot?.suggestedRefreshAfter ? now >= Date.parse(snapshot.suggestedRefreshAfter) : true;
  return <details className={styles.disclosure}><summary>Check public NZTA road notices</summary><p>No extra account. DO fetches the public national feed; your notes, journey and location are not sent. This covers notable state-highway events, not all roads or bus/train services.</p><button type="button" disabled={busy} onClick={() => void refresh()}><RefreshCw size={16} />{busy ? 'Checking NZTA…' : snapshot ? 'Refresh road notices' : 'Check road notices'}</button>{busy && <button type="button" onClick={() => { controller.current?.abort(); setNotice('Stopped. No private notes or journey details were sent.'); }}>Stop checking</button>}
    {snapshot?.status === 'available' && <><p className={styles.hint}>Fetched {snapshot.fetchedAt ? new Date(snapshot.fetchedAt).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' }) : 'time unavailable'} NZ time · {stale ? 'Refresh before relying on this snapshot' : 'Recent snapshot; conditions can change'}</p><label>Filter by region on this device<select value={region} onChange={(event) => { setRegion(event.target.value); setLimit(6); }}><option value="">All regions</option>{regions.map((name) => <option key={name}>{name}</option>)}</select></label><p className={styles.hint}>Showing {Math.min(limit, events.length)} of {events.length} notices. Status may be Active, Scheduled or Resolved. No listed event does not mean a road is clear.</p><ul className={styles.traffic}>{events.slice(0, limit).map((event) => <li key={event.id}><strong>{event.locationArea}</strong><span>{event.status ?? 'Status not supplied'} · {event.impact ?? 'Impact not supplied'}</span><p>{event.eventDescription}</p>{event.eventComments && <details><summary>Official details</summary><p>{event.eventComments}</p>{event.alternativeRoute && <p>Alternative route: {event.alternativeRoute}</p>}<small>Starts: {event.startDate ?? 'Not supplied'}<br />Ends: {event.endDate ?? 'Not supplied'}<br />Updated by source: {event.eventModified ?? 'Not supplied'}</small></details>}</li>)}</ul>{events.length > limit && <button type="button" onClick={() => setLimit(limit + 10)}>Show 10 more notices</button>}<p className={styles.hint}>{snapshot.source.attribution} The underlying NZTA travel information is free.</p></>}
    {notice && <p role="status">{notice}</p>}<p><a href={officialUrl} target="_blank" rel="noopener noreferrer">Check current conditions with NZTA <ArrowUpRight size={14} /></a></p>
  </details>;
}
