'use client';

/**
 * UberDispatchCard — the "🚗 Send it via Uber" surface inside Helm + Kai chat.
 *
 * Kai (urgent grocery drop) and Helm (forgotten lunch, laptop, meds pickup)
 * emit a fenced block on an eligible reply:
 *
 *   ```assembl-uber
 *   { "scenario": "forgotten lunch", "pickup": "home", "dropoff": "Ponsonby School",
 *     "packageDescription": "lunchbox", "distanceKm": 2.4, "region": "auckland" }
 *   ```
 *
 * {@link parseUberDispatch} strips those blocks out of the message and returns
 * the specs; this card renders the button. Pressing it fetches a QUOTE only
 * (Auckland geofence + NZD cost model) — it NEVER dispatches a real delivery.
 * Scaffold per the Kai pack (03-uber-direct-spec); live-fire lands after Kate
 * signs off.
 *
 * Privacy Act 2020 (IPP 1): the block carries a coarse pickup/dropoff label and
 * a package description only — no full addresses or phone numbers.
 */

import { useState } from 'react';
import { Car } from 'lucide-react';
import { PALETTE } from '@/lib/marketplace/agents';

export interface UberDispatchSpec {
  scenario?: string;
  pickup?: string;
  dropoff?: string;
  packageDescription?: string;
  distanceKm?: number;
  region?: string;
}

interface QuoteResult {
  eligible: boolean;
  tier: 'uber_direct' | 'alt_courier' | 'drive_yourself';
  band: string | null;
  estimatedTotalNzd: number | null;
  etaLabel: string | null;
  message: string;
}

const FENCE = /```assembl-uber\s*\n([\s\S]*?)```/g;

/** Pull every `assembl-uber` block out of `text`; return cleaned text + specs. */
export function parseUberDispatch(text: string): { text: string; dispatches: UberDispatchSpec[] } {
  const dispatches: UberDispatchSpec[] = [];
  const cleaned = text.replace(FENCE, (_m, body: string) => {
    try {
      const spec = JSON.parse(body.trim()) as UberDispatchSpec;
      if (spec && typeof spec === 'object') dispatches.push(spec);
    } catch {
      /* malformed — drop it, keep the chat intact */
    }
    return '';
  });
  return { text: cleaned.trim(), dispatches };
}

export function UberDispatchCard({ spec }: { spec: UberDispatchSpec }) {
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const label = spec.scenario
    ? spec.scenario.charAt(0).toUpperCase() + spec.scenario.slice(1)
    : 'Urgent drop-off';

  async function getQuote() {
    setLoading(true);
    setError(false);
    try {
      const r = await fetch('/api/hapai/uber-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quote',
          region: spec.region ?? 'auckland',
          distanceKm: spec.distanceKm,
          packageDescription: spec.packageDescription,
        }),
      });
      const d = (await r.json()) as { quote?: QuoteResult };
      if (d.quote) setQuote(d.quote);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="my-2 rounded-[16px] border p-3"
      style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.paper }}
    >
      <div className="flex items-center gap-2">
        <span
          className="mk-mono text-[12px] uppercase tracking-[0.18em]"
          style={{ color: PALETTE.muted }}
        >
          {label}
        </span>
        {spec.pickup && spec.dropoff ? (
          <span className="text-[12px]" style={{ color: PALETTE.body }}>
            {spec.pickup} → {spec.dropoff}
          </span>
        ) : null}
      </div>

      {!quote ? (
        <button
          type="button"
          onClick={getQuote}
          disabled={loading}
          className="mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-60"
          style={{ background: 'linear-gradient(180deg, #D9B87A, #BFA37A)', color: PALETTE.ink }}
        >
          <Car size={15} aria-hidden />
          {loading ? 'Checking coverage…' : '🚗 Send it via Uber'}
        </button>
      ) : (
        <div className="mt-2">
          {quote.eligible ? (
            <div className="rounded-[12px] p-2.5" style={{ backgroundColor: PALETTE.cream }}>
              <p className="text-lg font-black leading-none" style={{ color: PALETTE.ink }}>
                ~${quote.estimatedTotalNzd?.toFixed(2)}{' '}
                <span className="text-xs font-bold" style={{ color: PALETTE.body }}>
                  · {quote.band} · {quote.etaLabel}
                </span>
              </p>
              <p className="mt-1.5 text-[13px]" style={{ color: PALETTE.body }}>
                {quote.message}
              </p>
            </div>
          ) : (
            <div className="rounded-[12px] p-2.5" style={{ backgroundColor: PALETTE.cream }}>
              <p className="text-[13px] font-bold" style={{ color: PALETTE.ink }}>
                {quote.tier === 'alt_courier' ? 'Alternative courier' : 'Drive it yourself'}
              </p>
              <p className="mt-1 text-[13px]" style={{ color: PALETTE.body }}>
                {quote.message}
              </p>
            </div>
          )}
          <p className="mk-mono mt-2 text-[12px]" style={{ color: PALETTE.muted }}>
            Draft only · no delivery is dispatched · you confirm every drop · Privacy Act 2020 IPP 3A
          </p>
        </div>
      )}

      {error ? (
        <p className="mt-2 text-[13px]" style={{ color: PALETTE.body }}>
          Couldn’t check Uber coverage right now — try again in a moment.
        </p>
      ) : null}
    </div>
  );
}
