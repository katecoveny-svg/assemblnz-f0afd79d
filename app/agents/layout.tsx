import localFont from 'next/font/local';
import { preserveSingleFontStyle } from '@/lib/fonts/local-font-metadata';
import type { ReactNode } from 'react';


/**
 * Agent marketplace shell — scopes the Dash brand type system (locked
 * 2026-06-23) to the /agents subtree without touching the global site fonts.
 *
 * Lato (900 headlines, 700 buttons, 400 body) + Space Mono (eyebrows, mono
 * labels). This wrapper only EXPOSES the font CSS variables to the subtree; the
 * Dash type/colour base is opted into per-surface via the `mk-root` class (so
 * the legacy kete-fleet fallback + /agents/pick keep the global site fonts).
 * The global SiteHeader/Footer are suppressed on /agents (see isAgentMarketplace
 * in site-header).
 */
const latoLocal = localFont({
  src: [
    { path: '../../lib/fonts/assets/lato-normal-400.ttf', weight: '400', style: 'normal' },
    { path: '../../lib/fonts/assets/lato-normal-700.ttf', weight: '700', style: 'normal' },
    { path: '../../lib/fonts/assets/lato-normal-900.ttf', weight: '900', style: 'normal' },
  ],
  variable: '--mk-display',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Lato Build Fallback'],
});
const lato = preserveSingleFontStyle(latoLocal, 'normal');

const spaceMonoLocal = localFont({
  src: [
    { path: '../../lib/fonts/assets/space-mono-normal-400.woff2', weight: '400', style: 'normal' },
    { path: '../../lib/fonts/assets/space-mono-normal-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--mk-mono',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Space Mono Build Fallback'],
});
const spaceMono = preserveSingleFontStyle(spaceMonoLocal, 'normal');

export default function AgentsLayout({ children }: { children: ReactNode }) {
  return <div className={`${lato.variable} ${spaceMono.variable}`}>{children}</div>;
}
