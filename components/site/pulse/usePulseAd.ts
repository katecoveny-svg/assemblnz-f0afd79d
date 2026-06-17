'use client';

/**
 * usePulseAd — the HAPAI-side adapter for @assembl/pulse-sdk.
 *
 * Dogfood wiring: assembl is its own first Pulse publisher ('assembl-hapai').
 * A HAPAI surface calls `request()` when its wait state begins; if an ad comes
 * back it renders one quiet line, and `clear()` drops it when the wait ends.
 * Fail-open is built into the SDK — request() resolves to null on any miss, so
 * the surface just shows its normal loading text.
 *
 * The endpoint is same-origin ('/api/pulse') so it works on localhost, every
 * Vercel preview, and prod without configuration.
 */

import { useCallback, useState } from 'react';
import { pulse, type PulseAd } from '@assembl/pulse-sdk';

const PUBLISHER_ID = 'assembl-hapai';
let initialised = false;

function ensureInit() {
  if (initialised) return;
  pulse.init({ publisherId: PUBLISHER_ID, endpoint: '/api/pulse' });
  initialised = true;
}

export function usePulseAd(surface: string) {
  const [ad, setAd] = useState<PulseAd | null>(null);

  const request = useCallback(
    async (context?: Record<string, string | number | boolean>) => {
      ensureInit();
      const next = await pulse.show({ surface, context });
      setAd(next);
      return next;
    },
    [surface],
  );

  /** Drop the current ad (wait state ended). Not a dismissal — no beacon. */
  const clear = useCallback(() => setAd(null), []);

  /** Record a click and route to the advertiser via the tracking redirect. */
  const click = useCallback((impressionId: string) => pulse.click(impressionId), []);

  return { ad, request, clear, click };
}
