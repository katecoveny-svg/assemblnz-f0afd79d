/**
 * Per-tenant PWA registry — which pilot workspaces install as phone apps.
 *
 * Client-safe plain data (no server-only imports): the global PwaRegister and
 * the in-workspace TenantPwa component both read this in the browser, and the
 * manifest / service-worker route handlers read it on the server.
 *
 * Path model: the same workspace is reachable at two bases —
 *   - `/customers/<slug>/…`  on www / previews
 *   - `/<slug>/…`            on demo.assembl.co.nz (middleware rewrite)
 * Everything PWA (manifest link, SW script URL, SW scope, start_url) is
 * therefore RELATIVE to whichever base the visitor is on, so an install from
 * the demo host stays scoped to the demo host paths. Never register a
 * service worker at scope "/" — see public/sw.js and PR #431.
 */

export interface PwaTenant {
  slug: string;
  /** Manifest `name` — "<Tenant> · assembl". */
  name: string;
  /** Manifest `short_name` — what iOS/Android show under the icon. */
  shortName: string;
  description: string;
}

export const PWA_TENANTS: Record<string, PwaTenant> = {
  aironaut: {
    slug: 'aironaut',
    name: 'Aironaut Customs Brokers · assembl',
    shortName: 'Aironaut',
    description:
      'The AI operating system for Aironaut Customs Brokers — entries, HS classification, landed cost. Draft-only: nothing lodges, nothing sends.',
  },
  'happy-tails': {
    slug: 'happy-tails',
    name: 'Happy Tails · assembl',
    shortName: 'Happy Tails',
    description:
      'The AI operating system for Happy Tails doggy daycare — roster, dog CRM, comms. Draft-only: nothing sends without a human yes.',
  },
};

export const PWA_TENANT_SLUGS = Object.keys(PWA_TENANTS);

/**
 * Match a location pathname to a PWA tenant base.
 * Returns e.g. { slug: 'aironaut', base: '/aironaut' } on the demo host or
 * { slug: 'aironaut', base: '/customers/aironaut' } on www. Null when the
 * path is not inside a PWA-enabled workspace.
 */
export function pwaBaseForPath(pathname: string): { slug: string; base: string } | null {
  const m = pathname.match(/^(\/customers)?\/([^/]+)(?:\/|$)/);
  if (!m) return null;
  const slug = m[2];
  if (!PWA_TENANTS[slug]) return null;
  return { slug, base: `${m[1] ?? ''}/${slug}` };
}

/** Cache-name prefix the tenant service workers use; PwaRegister preserves it. */
export const TENANT_CACHE_PREFIX = 'tenant-pwa-';

/**
 * True when a service-worker registration scope belongs to a tenant PWA —
 * the global kill-switch logic in PwaRegister must leave those alone.
 */
export function isTenantPwaScope(scopeUrl: string): boolean {
  try {
    return pwaBaseForPath(new URL(scopeUrl).pathname) !== null;
  } catch {
    return false;
  }
}
