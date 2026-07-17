/**
 * Stateless community-agent links — the no-database bridge for /a.
 *
 * When the community_agents insert fails (Supabase paused, unreachable, or
 * unconfigured), the create route falls back to encoding the VALIDATED seed
 * into the share slug itself: JSON → raw deflate → base64url, prefixed `l~`
 * so it sorts cleanly away from DB slugs (which are [a-z0-9-] only). The
 * /a/[slug] page, OG card and chat route detect the prefix, decode, and
 * STRICTLY re-validate through lib/community/seed.ts before rebuilding the
 * pack server-side — nothing from the wire is ever trusted directly, and the
 * system prompt is always regenerated, never carried in the link.
 *
 * These links must stay decodable FOREVER (they are shared in the wild), so
 * the payload carries a version field; any future format bumps the version
 * and keeps v1 decoding.
 *
 * Server-side only (node:zlib), but deliberately not 'server-only' so the
 * round-trip is unit-testable outside a React server context.
 */
import { deflateRawSync, inflateRawSync } from 'node:zlib';
import {
  validateCommunitySeed,
  type CommunitySeed,
} from '@/lib/community/seed';

export const STATELESS_SLUG_PREFIX = 'l~';

/** Encoded payload cap — far above any legitimate seed, well below URL limits. */
const MAX_PAYLOAD_CHARS = 4096;
/** Inflate cap — a legitimate seed JSON is < 1 KB; anything bigger is hostile. */
const MAX_INFLATED_BYTES = 16 * 1024;

const BASE64URL = /^[A-Za-z0-9_-]+$/;

/** Compact v1 wire shape (short keys keep the URL down; deflate does the rest). */
interface WireSeedV1 {
  v: 1;
  t: string; // templateId ('' = blank)
  n: string; // name
  s: string; // sentence
  o: string; // tone
  i: {
    m: string; // mode
    f: string; // foregroundColor
    a: string; // accentColor
    c: number; // count
    u: number; // turbulence
    p: number; // speed
    g: boolean; // glow
  };
}

export function isStatelessSlug(slug: string): boolean {
  return slug.startsWith(STATELESS_SLUG_PREFIX);
}

/** Encode a validated seed into a `l~…` share slug. */
export function encodeStatelessSlug(seed: CommunitySeed): string {
  const wire: WireSeedV1 = {
    v: 1,
    t: seed.templateId,
    n: seed.name,
    s: seed.sentence,
    o: seed.tone,
    i: {
      m: seed.identity.mode,
      f: seed.identity.foregroundColor,
      a: seed.identity.accentColor,
      c: seed.identity.count,
      u: seed.identity.turbulence,
      p: seed.identity.speed,
      g: seed.identity.glow,
    },
  };
  const packed = deflateRawSync(Buffer.from(JSON.stringify(wire), 'utf8'), { level: 9 });
  return `${STATELESS_SLUG_PREFIX}${packed.toString('base64url')}`;
}

/**
 * Decode a `l~…` slug back into a seed, or null for anything malformed,
 * oversized, tampered with, or failing the create-route validation rules.
 */
export function decodeStatelessSlug(slug: string): CommunitySeed | null {
  if (!isStatelessSlug(slug)) return null;
  const payload = slug.slice(STATELESS_SLUG_PREFIX.length);
  if (!payload || payload.length > MAX_PAYLOAD_CHARS || !BASE64URL.test(payload)) return null;

  let wire: unknown;
  try {
    const json = inflateRawSync(Buffer.from(payload, 'base64url'), {
      maxOutputLength: MAX_INFLATED_BYTES,
    }).toString('utf8');
    wire = JSON.parse(json);
  } catch {
    return null;
  }

  if (!wire || typeof wire !== 'object') return null;
  const w = wire as Partial<WireSeedV1>;
  if (w.v !== 1) return null;
  const i = (w.i ?? {}) as Partial<WireSeedV1['i']>;

  // The same strict validation the create route applies to a fresh request.
  return validateCommunitySeed({
    templateId: w.t,
    name: w.n,
    sentence: w.s,
    tone: w.o,
    identity: {
      mode: i.m,
      foregroundColor: i.f,
      accentColor: i.a,
      count: i.c,
      turbulence: i.u,
      speed: i.p,
      glow: i.g,
    },
  });
}
