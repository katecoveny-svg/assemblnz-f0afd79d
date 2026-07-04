import type { ReactNode } from 'react';
import { Cormorant_Garamond, Lato, Space_Mono } from 'next/font/google';

/**
 * Mana Receipts — the honest trust page. Self-contained CANON type system
 * (locked 2026-06-23): Cormorant Garamond display (incl. italic gold H1),
 * Lato body/UI, Space Mono eyebrows + labels. Scoped to this subtree via the
 * `--mana-*` CSS variables so it never touches the rest of the site fonts.
 * The global SiteHeader/Footer stay; this page carries the champagne-gold + cream
 * palette inline (see mana-receipts.module.css).
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--mana-display',
  display: 'swap',
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
