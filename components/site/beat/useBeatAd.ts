'use client';

/**
 * useBeatAd — the HAPAI-side adapter for @assembl/beat-sdk.
 *
 * Dogfood wiring: assembl is its own first Beat publisher ('assembl-hapai').
 * A HAPAI surface calls `request()` when its wait state begins; if an ad comes
 * back it renders one quiet line, and `clear()` drops it when the wait ends.
 * Fail-open is built into the SDK — request() resolves to null on any miss, so
 * the surface just shows its normal loading text.
 *
 * The endpoint is same-origin ('/api/beat') so it works on localhost, every
 * Vercel preview, and prod without configuration.
 */

import { useCallback, useState } from 'react';
import { beat, type BeatAd } from '@assembl/beat-sdk';

const PUBLISHER_ID = 'assembl-hapai';
let initialised = false;

function ensureInit() {
  if (initialised) return;
  beat.init({ publisherId: PUBLISHER_ID, endpoint: '/api/beat' });
  initialised = true;
}

export function useBeatAd(surface: string) {
  const [ad, setAd] = useState<BeatAd | null>(null);

  const request = useCallback(
    async (context?: Record<string, string | number | boolean>) => {
      ensureInit();
      const next = await beat.show({ surface, context });
      setAd(next);
      return next;
    },
    [surface],
  );

  /** Drop the current ad (wait state ended). Not a dismissal — no beacon. */
  const clear = useCallback(() => setAd(null), []);

  /** Record a click and route to the advertiser via the tracking redirect. */
  const click = useCallback((impressionId: string) => beat.click(impressionId), []);

  return { ad, request, clear, click };
}
