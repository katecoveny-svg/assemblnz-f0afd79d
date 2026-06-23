import type { ReactNode } from 'react';
import { Lato, Space_Mono } from 'next/font/google';

/**
 * Pilot shell — scopes the Dash brand type system (locked 2026-06-23) to the
 * /pilot subtree, matching the /agents marketplace it lives inside.
 *
 * Lato (900 headlines, 700 buttons, 400 body) + Space Mono (eyebrows, mono
 * labels). CSS variables: --mk-display (Lato) and --mk-mono (Space Mono).
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

export default function PilotLayout({ children }: { children: ReactNode }) {
  return <div className={`${lato.variable} ${spaceMono.variable}`}>{children}</div>;
}
