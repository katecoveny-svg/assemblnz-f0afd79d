import type { BuildConfig } from './config';

/**
 * Serialise a BuildConfig to a compact base64url string that fits in a URL
 * (no server / DB dependency). The encoded string is passed via `?c=` — the
 * client hydrates from it on mount, and the OG image endpoint reads it too.
 *
 * Format: base64url(JSON.stringify({n, b, m, r, t, k, v, g})) — one-letter
 * keys keep the URL short. Long fields (name, business, voice) get length
 * caps so a very long paragraph doesn't blow past URL limits.
 */

const NAME_MAX = 80;
const BUSINESS_MAX = 500;
const VOICE_MAX = 400;

interface Compact {
  n: string;       // name
  b: string;       // business
  m: string;       // modelTier
  r: string;       // memoryScope (r = "remember")
  t: string[];     // tools
  k: string[];     // knowledge
  v: string;       // voice
  g: string[];     // guardrails
}

function base64urlEncode(input: string): string {
  const b64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(input, 'utf8').toString('base64')
      : btoa(unescape(encodeURIComponent(input)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (input.length % 4)) % 4);
  if (typeof Buffer !== 'undefined') return Buffer.from(b64, 'base64').toString('utf8');
  return decodeURIComponent(escape(atob(b64)));
}

export function encodeConfig(config: BuildConfig): string {
  const compact: Compact = {
    n: config.name.slice(0, NAME_MAX),
    b: config.business.slice(0, BUSINESS_MAX),
    m: config.modelTier,
    r: config.memoryScope,
    t: config.tools,
    k: config.knowledge,
    v: config.voice.slice(0, VOICE_MAX),
    g: config.guardrails,
  };
  return base64urlEncode(JSON.stringify(compact));
}

export function decodeConfig(encoded: string | null | undefined): Partial<BuildConfig> | null {
  if (!encoded) return null;
  try {
    const compact = JSON.parse(base64urlDecode(encoded)) as Partial<Compact>;
    return {
      name: typeof compact.n === 'string' ? compact.n.slice(0, NAME_MAX) : undefined,
      business: typeof compact.b === 'string' ? compact.b.slice(0, BUSINESS_MAX) : undefined,
      modelTier: (compact.m as BuildConfig['modelTier']) || undefined,
      memoryScope: (compact.r as BuildConfig['memoryScope']) || undefined,
      tools: Array.isArray(compact.t) ? compact.t.slice(0, 12) : undefined,
      knowledge: Array.isArray(compact.k) ? compact.k.slice(0, 12) : undefined,
      voice: typeof compact.v === 'string' ? compact.v.slice(0, VOICE_MAX) : undefined,
      guardrails: Array.isArray(compact.g) ? compact.g.slice(0, 12) : undefined,
    };
  } catch {
    return null;
  }
}

export function shareUrlFor(config: BuildConfig, origin: string): string {
  return `${origin.replace(/\/$/, '')}/build-an-agent?c=${encodeConfig(config)}`;
}
