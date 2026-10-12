/** Preserve explicit device consent carried inside an older confirmation template. */
export function resolveRememberParam(url: URL): '0' | '1' | null {
  const direct = url.searchParams.get('remember');
  if (direct === '0' || direct === '1') return direct;
  const next = url.searchParams.get('next');
  if (!next) return null;
  try {
    const nested = new URL(next);
    if (nested.protocol !== 'https:' ||
        !(nested.hostname === 'assembl.co.nz' || nested.hostname.endsWith('.assembl.co.nz')) ||
        !['/auth/confirm', '/auth/callback'].includes(nested.pathname)) return null;
    const remember = nested.searchParams.get('remember');
    return remember === '0' || remember === '1' ? remember : null;
  } catch { return null; }
}
