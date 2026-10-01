import localFont from 'next/font/local';
import { JetBrains_Mono, Lato, Manrope, Montserrat, Orbitron, Playfair_Display, Poppins, Public_Sans } from 'next/font/google';
import type { NextFontWithVariable } from 'next/dist/compiled/@next/font/dist/types';

// Shared body / mono — most brands share Inter body + JetBrains Mono.
const inter = localFont({
  src: [
    { path: '../fonts/assets/inter-normal.woff2', weight: '100 900', style: 'normal' },
  ],
  style: 'normal',
  variable: '--font-brand-body',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Inter Build Fallback'],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-brand-mono',
  display: 'swap',
});

// Per-brand display / specialty fonts.
const interTight = localFont({
  src: [
    { path: '../fonts/assets/inter-tight-normal.woff2', weight: '100 900', style: 'normal' },
  ],
  style: 'normal',
  variable: '--font-brand-display',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Inter Tight Build Fallback'],
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
const cormorant = localFont({
  src: [
    { path: '../fonts/assets/cormorant-garamond-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/assets/cormorant-garamond-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/assets/cormorant-garamond-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/assets/cormorant-garamond-normal.woff2', weight: '700', style: 'normal' },
  ],
  style: 'normal',
  variable: '--font-brand-display',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Cormorant Garamond Build Fallback'],
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

// Pearl canon (2026-07-17): Happy Tails reads the Cormorant display + Inter
// body like the rest of the pearl surfaces (their keeper workspace already
// sets Cormorant via --font-keeper-serif). Public Sans stays for Toa.
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
const frauncesItalicBody = localFont({
  src: [
    { path: '../fonts/assets/fraunces-italic.woff2', weight: '900', style: 'italic' },
  ],
  weight: '900',
  style: 'italic',
  variable: '--font-brand-body',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Fraunces Build Fallback'],
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
      return { display: cormorant, body: inter, mono: jetbrainsMono };
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
    case 'family':
      return { display: playfair, body: lato, mono: jetbrainsMono };
    case 'auckland-dog-trainer':
      return { display: playfair, body: lato, mono: jetbrainsMono };
    case 'contact-energy':
      return { display: interTight, body: inter, mono: jetbrainsMono };
    default:
      return { display: inter, body: inter, mono: jetbrainsMono };
  }
}
