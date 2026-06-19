'use client';

/**
 * SponsorLine — the NZ-brand ad fill shown during processing (consumer +
 * publisher modes). This is what generates the micro-revenue.
 *
 * Renders the dark "message block" that sits inside the dog body (per
 * dash-dog-ad.svg): a green "live" dot · the advertiser name · an amber
 * "SPONSORED" pill. That pill IS the ASA-compliance label — it is always
 * visible, never below 12px, never below 0.7 opacity, never obscured.
 *
 * If no `sponsor` is passed it falls back to GET /api/dash/sponsor. The
 * fetch sends NO page content — only the mode and (optional) publisherId.
 */
import { useEffect, useState } from 'react';
import type { SponsorPayload } from './types';
import styles from './DashLoader.module.css';

interface SponsorLineProps {
  /** Pre-resolved sponsor (from the `sponsorLine` prop). */
  sponsor?: SponsorPayload;
  mode: 'consumer' | 'publisher';
  publisherId?: string;
  /** When false, render a neutral placeholder (e.g. reduced-motion idle). */
  active?: boolean;
}

export function SponsorLine({ sponsor, mode, publisherId, active = true }: SponsorLineProps) {
  const [fetched, setFetched] = useState<SponsorPayload | null>(null);

  useEffect(() => {
    if (sponsor || !active) return;
    let cancelled = false;
    const qs = new URLSearchParams({ mode });
    if (publisherId) qs.set('publisherId', publisherId);
    fetch(`/api/dash/sponsor?${qs.toString()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SponsorPayload | null) => {
        if (!cancelled && data && data.text) setFetched(data);
      })
      .catch(() => {
        /* fail soft — the ASA pill still renders below */
      });
    return () => {
      cancelled = true;
    };
  }, [sponsor, active, mode, publisherId]);

  const resolved = sponsor ?? fetched;

  return (
    <div
      className={styles.sponsorBlock}
      // Announced as an ad so SR users always know it is sponsored content.
      role="note"
      aria-label={
        resolved ? `Sponsored content: ${resolved.text}` : 'Sponsored content placeholder'
      }
    >
      <span className={styles.sponsorDot} aria-hidden="true" />
      <span className={styles.sponsorName}>{resolved ? resolved.text : 'NZ brand'}</span>
      <span className={styles.sponsoredPill}>Sponsored</span>
    </div>
  );
}
