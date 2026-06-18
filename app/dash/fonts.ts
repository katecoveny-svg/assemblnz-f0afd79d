/**
 * Dash type system, loaded via next/font/google and exposed as CSS variables
 * that styles/dash-tokens.css reads (--font-dash-display / --font-dash-body).
 *
 *   Cormorant Garamond — display (weight 500; never italic on the wordmark)
 *   Mulish             — UI / body (400–800)
 *
 * Scoped to /dash routes: apply `dashFontVars` to a wrapper that also carries
 * `data-dash`, so neither the fonts nor the palette bleed into the rest of the
 * Mārama Whenua site.
 */
import { Cormorant_Garamond, Mulish } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal'],
  variable: '--font-dash-display',
  display: 'swap',
});

const mulish = Mulish({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-dash-body',
  display: 'swap',
});

export const dashFontVars = `${cormorant.variable} ${mulish.variable}`;
