import {
  Archivo_Black,
  Cormorant_Garamond,
  Fraunces,
  Inter,
  Inter_Tight,
  JetBrains_Mono,
  Lato,
  Manrope,
  Montserrat,
  Orbitron,
  Playfair_Display,
  Poppins,
  Public_Sans,
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

// HAPPY TAILS: real brand font on happytailsdaycare.co.nz is Murs Gothic Wide
// Bold (headings) + Public Sans 500 (body), read from the site's computed CSS
// 2026-07-02. Murs Gothic is Wix-licensed and can't ship here — Archivo Black
// is the closest free wide-bold-grotesque stand-in. Public Sans is exact.
const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  variable: '--font-brand-display',
  display: 'swap',
  weight: ['400'],
});
const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-brand-body',
  display: 'swap',
  weight: ['400', '500', '700'],
});

// TOA ARCHITECTS: real site (toa.nz) sets Gotham Book/Bold uppercase headings
// with wide tracking + Archer Book slab body, read from computed CSS
// 2026-07-04. Both are licensed (Hoefler) and can't ship here — Montserrat is
// the standard free geometric-sans stand-in for Gotham; Public Sans (exact
// weights already loaded) carries body/UI copy. Tracking + uppercase live in
// the components, not the font.
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-brand-display',
  display: 'swap',
  weight: ['300', '500', '700'],
});

// MOANA (concept pilot): a clean nautical geometric sans — Poppins as display,
// Lato (already imported for Aironaut) as body. JetBrains Mono for mono.
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-brand-display',
  display: 'swap',
  weight: ['500', '600', '700'],
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
      return { display: archivoBlack, body: publicSans, mono: jetbrainsMono };
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
    case 'toa-architects':
      return { display: montserrat, body: publicSans, mono: jetbrainsMono };
    case 'moana':
      return { display: poppins, body: lato, mono: jetbrainsMono };
    default:
      return { display: inter, body: inter, mono: jetbrainsMono };
  }
}
