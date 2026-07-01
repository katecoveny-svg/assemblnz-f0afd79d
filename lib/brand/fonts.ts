import {
  Cormorant_Garamond,
  Fraunces,
  Inter,
  Inter_Tight,
  JetBrains_Mono,
  Lato,
  Manrope,
  Orbitron,
  Playfair_Display,
} from 'next/font/google';
import type { NextFontWithVariable } from 'next/dist/compiled/@next/font/dist/types';

// Shared body / mono — most brands share Inter body + JetBrains Mono.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-brand-body',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-brand-mono',
  display: 'swap',
});

// Per-brand display / specialty fonts.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-brand-display',
  display: 'swap',
});
const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-brand-display',
  display: 'swap',
});
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-brand-display',
  display: 'swap',
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-brand-display',
  display: 'swap',
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-brand-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// AIRONAUT: Orbitron Bold 700 as display, Lato Regular/Medium as body.
// Real brand kit — Orbitron for the uppercase wordmark & taglines, Lato for
// paragraph copy.
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-brand-display',
  display: 'swap',
  weight: ['700'],
});
// Note: Lato via next/font/google only ships 100/300/400/700/900. We use
// 400 (Regular) for body and 700 (Bold) as the emphasised weight — the brief
// asked for 400+500, but 500 is not published for Lato; 700 is the closest
// medium-weight substitute the family actually ships.
const lato = Lato({
  subsets: ['latin'],
  variable: '--font-brand-body',
  display: 'swap',
  weight: ['400', '700'],
});

// Air NZ needs Fraunces Italic 900 as body per brief.
const frauncesItalicBody = Fraunces({
  subsets: ['latin'],
  variable: '--font-brand-body',
  display: 'swap',
  weight: ['900'],
  style: ['italic'],
});

export type BrandFonts = {
  display: NextFontWithVariable;
  body: NextFontWithVariable;
  mono: NextFontWithVariable;
};

/**
 * Return the tuple of `next/font` objects for a given brand slug. The `.variable`
 * strings on each object are the CSS-variable classnames the layout should apply
 * to a wrapping element so `var(--font-brand-display)` etc. resolve.
 */
export function getBrandFonts(slug: string): BrandFonts {
  switch (slug) {
    case 'happy-tails':
      return { display: fraunces, body: inter, mono: jetbrainsMono };
    case 'air-nz':
      return { display: interTight, body: frauncesItalicBody, mono: jetbrainsMono };
    case 'everyday-rewards':
      return { display: manrope, body: inter, mono: jetbrainsMono };
    case 'auckland-zoo':
      return { display: playfair, body: inter, mono: jetbrainsMono };
    case 'aironaut':
      return { display: orbitron, body: lato, mono: jetbrainsMono };
    case 'lula-inn':
      return { display: cormorant, body: inter, mono: jetbrainsMono };
    default:
      return { display: inter, body: inter, mono: jetbrainsMono };
  }
}
