'use client';
import { useRef, useState } from 'react';
import ProviderResults, { type ReviewedSelection } from './ProviderResults';
import type { ResultBatch } from '@/lib/do/travel/provider-selection';
import styles from './travel-planner.module.css';
type Access = { state: 'auth_required' | 'unavailable' | 'error'; authenticated?: boolean; configured?: boolean | null; reason?: string };
export default function ProviderAccess({ batch, briefKey, onReviewed }: { batch?: ResultBatch; briefKey?: string; onReviewed?: (selection: ReviewedSelection | null) => void } = {}) {
  const [access, setAccess] = useState<Access | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function check() {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try {
      const response = await fetch('/api/do/travel/search', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      setAccess(['auth_required', 'unavailable', 'error'].includes(data.state) ? data : { state: 'error' });
    } catch { setAccess({ state: 'error' }); }
    finally { setBusy(false); lock.current = false; }
  }
  return <><section className={styles.suggestions} aria-label="Provider search access"><p className={styles.eyebrow}>SEARCH INSIDE DO</p><h2>Provider access</h2><p>Check the connection without sending your trip or requesting paid inventory.</p><div className={styles.actions}><button type="button" className={styles.secondary} disabled={busy} onClick={check}>{busy ? 'Checking access…' : 'Check provider access'}</button></div>
    {access && <div role="status" className={styles.alert}>{access.state === 'auth_required' ? <p>Sign-in is required to check provider access. This does not tell us whether a provider is configured. Keep this page open to preserve your trip.</p> : access.state === 'error' ? <p>The access check did not finish. No search was requested. You can try the check again or use the browser searches.</p> : <><p>{access.configured === true ? 'A provider token is configured; search has not been verified.' : access.configured === false ? 'This adapter reports no configured provider token.' : 'The current provider adapter could not confirm compatible search access.'}</p><p>Owner-specific search permission and a spending limit are not verified. Search inside DO remains unavailable; your browser searches and reviewed plan still work.</p></>}</div>}
    <small>{batch ? 'A supplied search response appears below. Current room rates, a final quote and a booking are separate steps; none is confirmed here.' : 'Search results, room rates, a final quote and a booking are separate steps. DO has not performed any of them here.'}</small>
  </section>{batch && briefKey && <ProviderResults batch={batch} briefKey={briefKey} onReviewed={onReviewed} />}</>;
}
