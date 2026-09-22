/** next/font uses generated family names. Resolve its CSS variable for canvas exports. */
export function canvasFontFamily(kind: 'body' | 'mono' = 'body'): string {
  const fallback = kind === 'mono' ? '"IBM Plex Mono", monospace' : '"Instrument Sans", sans-serif';
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.body).getPropertyValue(`--font-${kind}`).trim() || fallback;
}
