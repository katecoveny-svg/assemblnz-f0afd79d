import {
  Cormorant_Garamond,
  Fraunces,
  Inter,
  Inter_Tight,
  JetBrains_Mono,
  Manrope,
  Playfair_Display,
  Space_Grotesk,
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
const spaceGrotesk = Space_Grotesk({
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
    case 'aeronaut':
      return { display: spaceGrotesk, body: inter, mono: jetbrainsMono };
    case 'lula-inn':
      return { display: cormorant, body: inter, mono: jetbrainsMono };
    default:
      return { display: inter, body: inter, mono: jetbrainsMono };
  }
}
