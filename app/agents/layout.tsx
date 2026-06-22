import type { ReactNode } from 'react';
import { Lato, Space_Mono } from 'next/font/google';

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
const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--mk-display',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--mk-mono',
  display: 'swap',
});

export default function AgentsLayout({ children }: { children: ReactNode }) {
  return <div className={`${lato.variable} ${spaceMono.variable}`}>{children}</div>;
}
