import { checkedClaim, type AdmissionRequest, type DistributedAdmission, type MonotonicClock, type Admission } from './policy';
/** Freight-only proposal. Counts all backend attempts, including denials/timeouts, before RPC.
 * Finite per-process backstop, not a strict global edge-cost cap. No IP map or raw logs.
 */
export function boundedAdmissionCaller(store: DistributedAdmission, now: MonotonicClock = () => performance.now()) {
  let start = now(), used = 0, active = 0;
  return async (request: AdmissionRequest): Promise<Admission> => {
    const t = now();
    if (!Number.isFinite(t) || t < start || request.domain !== 'freight') return { state: 'denied', reason: 'unavailable', retryAfterSeconds: 60 };
    if (t - start >= 60000) { start = t; used = 0; }
    if (active >= 4 || used >= 60) return { state: 'denied', reason: 'limit', retryAfterSeconds: 60 };
    used++; active++;
    try { return await checkedClaim(request, store, now); }
    finally { active--; }
  };
}
/** Production log emission additionally requires a globally bounded backend-issued token.
 * No token on denied/uncertain RPC = zero app logs. Callback receives only fixed counters.
 */
export function rejectionSummary(now: MonotonicClock = () => performance.now()) {
  let window = now(), emitted = false;
  let denied = 0, unavailable = 0;
  return {
    add(kind: 'denied' | 'unavailable') { if (kind === 'denied') denied = Math.min(1000000, denied + 1); else unavailable = Math.min(1000000, unavailable + 1); },
    async take(authority: { claimGlobalLogSlot(signal?: AbortSignal): Promise<boolean> }) {
      const t = now();
      if (!Number.isFinite(t) || t < window) return null;
      if (t - window >= 60000) { window = t; emitted = false; }
      if (emitted) return null;
      emitted = true; // at most one backend log-slot attempt/minute, including rejection/error
      const controller = new AbortController();
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const granted = await Promise.race([
          Promise.resolve().then(() => authority.claimGlobalLogSlot(controller.signal)),
          new Promise<false>((resolve) => { timer = setTimeout(() => { controller.abort(); resolve(false); }, 1000); }),
        ]);
        if (granted !== true) return null;
      } catch { return null; }
      finally { if (timer) clearTimeout(timer); controller.abort(); }
      const result = { event: 'nz_freight_rejections', denied, unavailable } as const;
      denied = 0; unavailable = 0;
      return result;
    },
  };
}
