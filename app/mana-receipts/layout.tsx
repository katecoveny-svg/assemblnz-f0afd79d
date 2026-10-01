import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { Lato, Space_Mono } from 'next/font/google';

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

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--mana-body',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--mana-mono',
  display: 'swap',
});

export default function ManaReceiptsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${cormorant.variable} ${lato.variable} ${spaceMono.variable}`}>{children}</div>
  );
}
