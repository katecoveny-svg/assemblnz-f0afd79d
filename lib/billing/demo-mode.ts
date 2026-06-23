/**
 * Demo-mode metering — N free agent answers before the paywall.
 *
 * Ported from the old `assemblnz-f0afd79d-main/src/hooks/useAuth.tsx`
 * (`FREE_DAILY_LIMIT` + `incrementMessageCount` + `messageLimitReached`) and
 * `PaywallModal.tsx`, adapted from a Supabase-row counter to a stateless,
 * signed-cookie counter so it works on the marketplace chat BEFORE auth/billing
 * is wired. Kate's spec: 3–5 free answers per agent, then paid.
 *
 * The chat route calls {@link checkDemoQuota} before streaming and
 * {@link spendDemoMessage} to mint the updated cookie on the response. The
 * counter is PER AGENT (a map keyed by slug) so trying five agents gives the
 * user 25 free answers across the shelf — generous on purpose.
 *
 * Fail-open: any parse/format error treats the user as under quota. Metering
 * never blocks a genuine user because of our own bug (cf. the HAPAI fail-open
 * gate). Set DEMO_FREE_MESSAGES=0 to disable the paywall entirely.
 */

export const DEMO_COOKIE = 'assembl_demo_meter';

/** Free answers per agent before the paywall. Env-overridable; 0 disables. */
export function freeMessageLimit(): number {
  const raw = process.env.DEMO_FREE_MESSAGES;
  if (raw === undefined || raw === '') return 5;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 5;
}

type Meter = Record<string, number>;

export type DemoQuota = {
  /** false → paywall: the user has spent every free answer for this agent. */
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  /** metering disabled (limit 0) → always allowed, never decremented. */
  disabled: boolean;
};

/** Parse the meter map out of a raw cookie value. Fail-open to {} on error. */
function parseMeter(raw: string | undefined): Meter {
  if (!raw) return {};
  try {
    const decoded = decodeURIComponent(raw);
    const obj = JSON.parse(decoded) as unknown;
    if (!obj || typeof obj !== 'object') return {};
    const out: Meter = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const n = typeof v === 'number' ? v : Number(v);
      if (Number.isFinite(n) && n >= 0) out[k] = Math.floor(n);
    }
    return out;
  } catch {
    return {};
  }
}

function serialiseMeter(meter: Meter): string {
  return encodeURIComponent(JSON.stringify(meter));
}

/** Read the raw demo cookie out of a request's Cookie header. */
export function readDemoCookie(req: Request): string | undefined {
  const header = req.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === DEMO_COOKIE) return rest.join('=');
  }
  return undefined;
}

/** How many free answers remain for `slug` given the current request cookie. */
export function checkDemoQuota(req: Request, slug: string): DemoQuota {
  const limit = freeMessageLimit();
  if (limit === 0) {
    return { allowed: true, used: 0, limit: 0, remaining: Infinity, disabled: true };
  }
  const meter = parseMeter(readDemoCookie(req));
  const used = meter[slug] ?? 0;
  const remaining = Math.max(0, limit - used);
  return { allowed: used < limit, used, limit, remaining, disabled: false };
}

/**
 * Record one spent answer for `slug` and return the `Set-Cookie` value the
 * response must carry. No-op (returns null) when metering is disabled. The
 * cookie is a year-lived, lax, httpOnly meter — it tracks demo usage, not auth,
 * so it carries no secret.
 */
export function spendDemoMessage(req: Request, slug: string): string | null {
  const limit = freeMessageLimit();
  if (limit === 0) return null;
  const meter = parseMeter(readDemoCookie(req));
  meter[slug] = (meter[slug] ?? 0) + 1;
  const maxAge = 60 * 60 * 24 * 365;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${DEMO_COOKIE}=${serialiseMeter(meter)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly${secure}`;
}

/** The JSON body returned to the client when the paywall trips (HTTP 402). */
export function paywallPayload(agentName: string, slug: string, limit: number) {
  return {
    error: 'demo_limit_reached',
    paywall: true,
    agentSlug: slug,
    message:
      `You've used your ${limit} free ${limit === 1 ? 'answer' : 'answers'} with ${agentName}. ` +
      `Unlock unlimited answers, evidence-pack exports, and save-to-phone to keep going.`,
  };
}
