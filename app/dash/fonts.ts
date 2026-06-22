/**
 * Dash type system — Lato, loaded via next/font/google and exposed as a CSS
 * variable that dash-kit.css + styles/dash-tokens.css read. One refined,
 * premium sans across everything (display + body): charcoal text on white,
 * with yellow accents.
 */
import { Lato } from 'next/font/google';

export const dashFont = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-dash-sans',
  display: 'swap',
});

export const dashFontVars = dashFont.variable;
