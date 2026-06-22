/**
 * Dash type system (design handoff): Lato (display + UI) + Space Mono (the
 * technical voice — eyebrows, counters, code, "Sponsored" labels). Exposed as
 * --font-dash-sans / --font-dash-mono and read by dash-kit.css + dash-tokens.css.
 */
import { Lato, Space_Mono } from 'next/font/google';

export const dashFont = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-dash-sans',
  display: 'swap',
});

export const dashMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-dash-mono',
  display: 'swap',
});

export const dashFontVars = `${dashFont.variable} ${dashMono.variable}`;
