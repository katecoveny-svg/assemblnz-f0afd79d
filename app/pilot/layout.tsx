import localFont from 'next/font/local';
import { preserveSingleFontStyle } from '@/lib/fonts/local-font-metadata';
import type { ReactNode } from 'react';


/**
 * Pilot shell — scopes the Dash brand type system (locked 2026-06-23) to the
 * /pilot subtree, matching the /agents marketplace it lives inside.
 *
 * Lato (900 headlines, 700 buttons, 400 body) + Space Mono (eyebrows, mono
 * labels). CSS variables: --mk-display (Lato) and --mk-mono (Space Mono).
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

export default function PilotLayout({ children }: { children: ReactNode }) {
  return <div className={`${lato.variable} ${spaceMono.variable}`}>{children}</div>;
}
