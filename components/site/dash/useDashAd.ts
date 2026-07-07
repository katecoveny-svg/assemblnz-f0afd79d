'use client';

/**
 * useDashAd — the SPARK-side adapter for @assembl/dash-sdk.
 *
 * Dogfood wiring: assembl is its own first Dash publisher ('assembl-hapai').
 * A SPARK surface calls `request()` when its wait state begins; if an ad comes
 * back it renders one line of text, and `clear()` drops it when the wait ends.
 * Fail-open is built into the SDK — request() resolves to null on any miss, so
 * the surface just shows its normal loading text.
 *
 * The endpoint is same-origin ('/api/dash') so it works on localhost, every
 * Vercel preview, and prod without configuration.
 */

import { useCallback, useState } from 'react';
import { dash, type DashAd } from '@assembl/dash-sdk';

const PUBLISHER_ID = 'assembl-hapai';
let initialised = false;

function ensureInit() {
  if (initialised) return;
  dash.init({ publisherId: PUBLISHER_ID, endpoint: '/api/dash' });
  initialised = true;
}

export function useDashAd(surface: string) {
  const [ad, setAd] = useState<DashAd | null>(null);

  const request = useCallback(
    async (context?: Record<string, string | number | boolean>) => {
      ensureInit();
      const next = await dash.show({ surface, context });
      setAd(next);
      return next;
    },
    [surface],
  );

  /** Drop the current ad (wait state ended). Not a dismissal — no beacon. */
  const clear = useCallback(() => setAd(null), []);

  /** Record a click and route to the advertiser via the tracking redirect. */
  const click = useCallback((impressionId: string) => dash.click(impressionId), []);

  return { ad, request, clear, click };
}
