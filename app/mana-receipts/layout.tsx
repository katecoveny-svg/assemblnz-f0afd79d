import { preserveSingleFontStyle } from '@/lib/fonts/local-font-metadata';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';


/**
 * Mana Receipts — the honest trust page. Self-contained CANON type system
 * (locked 2026-06-23): Cormorant Garamond display (incl. italic gold H1),
 * Lato body/UI, Space Mono eyebrows + labels. Scoped to this subtree via the
 * `--mana-*` CSS variables so it never touches the rest of the site fonts.
 * The global SiteHeader/Footer stay; this page carries the champagne-gold + cream
 * palette inline (see mana-receipts.module.css).
 */
const cormorant = localFont({
  src: [
    { path: '../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '700', style: 'normal' },
    { path: '../../lib/fonts/assets/cormorant-garamond-italic.woff2', weight: '400', style: 'italic' },
    { path: '../../lib/fonts/assets/cormorant-garamond-italic.woff2', weight: '500', style: 'italic' },
    { path: '../../lib/fonts/assets/cormorant-garamond-italic.woff2', weight: '600', style: 'italic' },
    { path: '../../lib/fonts/assets/cormorant-garamond-italic.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--mana-display',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Cormorant Garamond Build Fallback'],
});

const latoLocal = localFont({
  src: [
    { path: '../../lib/fonts/assets/lato-normal-400.ttf', weight: '400', style: 'normal' },
    { path: '../../lib/fonts/assets/lato-normal-700.ttf', weight: '700', style: 'normal' },
    { path: '../../lib/fonts/assets/lato-normal-900.ttf', weight: '900', style: 'normal' },
  ],
  variable: '--mana-body',
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
  variable: '--mana-mono',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Space Mono Build Fallback'],
});
const spaceMono = preserveSingleFontStyle(spaceMonoLocal, 'normal');

export default function ManaReceiptsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${cormorant.variable} ${lato.variable} ${spaceMono.variable}`}>{children}</div>
  );
}
