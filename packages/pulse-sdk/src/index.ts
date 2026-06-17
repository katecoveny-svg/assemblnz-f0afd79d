/**
 * @assembl/pulse-sdk — the client for assembl Pulse, the NZ in-product ad network.
 *
 * The whole pitch is the trust contract: this SDK sends us ONLY
 * { publisherId, surface, context }. It never reads — and has no way to read —
 * prompts, content, code, files, or user data. `context` is a coarse,
 * caller-supplied bag (e.g. { tool: 'manaaki' }). Pass nothing sensitive.
 *
 * Two-line install:
 *   import { pulse } from '@assembl/pulse-sdk';
 *   pulse.init({ publisherId: 'xero-app' });
 *   const ad = await pulse.show({ surface: 'spinner' });
 */

export interface PulseConfig {
  /** Your publisher id, issued by assembl (e.g. 'xero-app'). */
  publisherId: string;
  /** Ad-server base URL. Defaults to the live assembl Pulse endpoint. */
  endpoint?: string;
}

export interface PulseShowOptions {
  /** Where the ad renders — e.g. 'spinner', 'chat', 'report'. */
  surface: string;
  /** Coarse, non-sensitive context only. Never content/prompts/user data. */
  context?: Record<string, string | number | boolean>;
}

export interface PulseAd {
  /** The ad (campaign) id. */
  id: string;
  /** The single quiet line to show in the wait state. */
  text: string;
  /** Where a click should land. */
  ctaUrl: string;
  /** This serve's impression id — pass it to click()/dismiss(). */
  impressionId: string;
}

const DEFAULT_ENDPOINT = 'https://www.assembl.co.nz/api/pulse';

let config: Required<PulseConfig> | null = null;

function endpointBase(): string {
  if (!config) throw new Error('[pulse] call pulse.init({ publisherId }) before show().');
  return config.endpoint.replace(/\/$/, '');
}

export const pulse = {
  /** Configure the SDK once, at startup. */
  init(cfg: PulseConfig): void {
    if (!cfg?.publisherId) throw new Error('[pulse] publisherId is required.');
    config = { publisherId: cfg.publisherId, endpoint: cfg.endpoint || DEFAULT_ENDPOINT };
  },

  /**
   * Request an ad for a wait state. Returns the ad, or null when the auction
   * is empty (the caller should then show its own fallback line — fail-open).
   * Never throws: any network/parse error resolves to null.
   */
  async show(opts: PulseShowOptions): Promise<PulseAd | null> {
    if (!opts?.surface) throw new Error('[pulse] show({ surface }) is required.');
    const base = endpointBase(); // throws loudly if init() was never called
    try {
      const res = await fetch(`${base}/serve`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          publisherId: config!.publisherId,
          surface: opts.surface,
          context: opts.context ?? {},
        }),
      });
      if (!res.ok) return null; // 204 (no fill) or any error → fail-open
      const ad = (await res.json()) as Partial<PulseAd> | null;
      if (!ad || !ad.impressionId || !ad.text || !ad.ctaUrl || !ad.id) return null;
      return ad as PulseAd;
    } catch {
      return null;
    }
  },

  /**
   * Record a click and navigate to the ad's destination. In a browser this
   * sends the user through the tracking redirect; elsewhere it just logs.
   */
  click(impressionId: string): void {
    if (!impressionId) return;
    const url = `${endpointBase()}/click?i=${encodeURIComponent(impressionId)}`;
    const loc = (globalThis as { location?: { assign(u: string): void } }).location;
    if (loc) loc.assign(url);
    else void fetch(url).catch(() => {});
  },

  /** Record a dismissal. Fire-and-forget; never throws. */
  dismiss(impressionId: string): void {
    if (!impressionId) return;
    const url = `${endpointBase()}/dismiss`;
    const body = JSON.stringify({ impressionId });
    const nav = globalThis.navigator as { sendBeacon?: (u: string, b: string) => boolean } | undefined;
    if (nav?.sendBeacon) nav.sendBeacon(url, body);
    else void fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {});
  },
};

export default pulse;
