/**
 * Canonical auth origins for magic-link / password-reset emails.
 *
 * Operator auth lives on demo.assembl.co.nz (middleware comments + www
 * /admin* → demo 302). Magic-link `emailRedirectTo` must therefore land on the
 * demo host — if the confirm URL is built from www/apex (or a preview host
 * that is not in Supabase Redirect URLs), the link is rejected or the session
 * cookies never reach the operator hub.
 */

export const DEMO_AUTH_ORIGIN = 'https://demo.assembl.co.nz';

const DEMO_HOSTS = new Set(['demo.assembl.co.nz']);
const MARKETING_HOSTS = new Set(['assembl.co.nz', 'www.assembl.co.nz']);

/**
 * Resolve the origin used for `emailRedirectTo` / password-reset links.
 *
 * - Admin destinations always use the demo host (operator session cookies).
 * - Marketing hosts (www/apex) also resolve to demo when the request somehow
 *   still reaches this action (defence in depth — /admin already 302s).
 * - Otherwise honour the request host (local / preview) so Redirect URLs can
 *   be tested without hard-coding.
 */
export function resolveAuthOrigin(opts: {
  host: string | null;
  proto?: string | null;
  redirectTo?: string;
}): string {
  const redirectTo = opts.redirectTo ?? '';
  const host = (opts.host ?? '').split(':')[0]?.toLowerCase() ?? '';
  const proto = opts.proto ?? 'https';

  if (redirectTo.startsWith('/admin') || MARKETING_HOSTS.has(host)) {
    return DEMO_AUTH_ORIGIN;
  }
  if (DEMO_HOSTS.has(host)) {
    return DEMO_AUTH_ORIGIN;
  }
  if (!host) {
    return DEMO_AUTH_ORIGIN;
  }
  return `${proto}://${opts.host}`;
}

/** True when this redirect path belongs on the operator hub. */
export function isAdminRedirect(redirectTo: string): boolean {
  return redirectTo.startsWith('/admin');
}
