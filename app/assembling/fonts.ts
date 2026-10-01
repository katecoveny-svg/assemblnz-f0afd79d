import localFont from 'next/font/local';
import { preserveSingleFontStyle } from '@/lib/fonts/local-font-metadata';
/**
 * Assembling type system (design handoff): Lato (display + UI) + Space Mono (the
 * technical voice — eyebrows, counters, code, "Sponsored" labels). Exposed as
 * --font-dash-sans / --font-dash-mono and read by dash-kit.css + dash-tokens.css.
 */


export const dashFont = localFont({
  src: [
    { path: '../../lib/fonts/assets/lato-normal-400.ttf', weight: '400', style: 'normal' },
    { path: '../../lib/fonts/assets/lato-normal-700.ttf', weight: '700', style: 'normal' },
    { path: '../../lib/fonts/assets/lato-normal-900.ttf', weight: '900', style: 'normal' },
    { path: '../../lib/fonts/assets/lato-italic-400.ttf', weight: '400', style: 'italic' },
    { path: '../../lib/fonts/assets/lato-italic-700.ttf', weight: '700', style: 'italic' },
    { path: '../../lib/fonts/assets/lato-italic-900.ttf', weight: '900', style: 'italic' },
  ],
  variable: '--font-dash-sans',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Lato Build Fallback'],
});

const dashMonoLocal = localFont({
  src: [
    { path: '../../lib/fonts/assets/space-mono-normal-400.woff2', weight: '400', style: 'normal' },
    { path: '../../lib/fonts/assets/space-mono-normal-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-dash-mono',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Space Mono Build Fallback'],
});
export const dashMono = preserveSingleFontStyle(dashMonoLocal, 'normal');

export const dashFontVars = `${dashFont.variable} ${dashMono.variable}`;
