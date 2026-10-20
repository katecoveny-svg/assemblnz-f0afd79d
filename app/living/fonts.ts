/**
 * assembl / living — scoped display face for dayrally surfaces
 * -------------------------------------------------------------
 * Fredoka 700 (SIL OFL 1.1, `lib/fonts/assets/Fredoka-OFL.txt`) is the
 * dayrally wordmark and display face (ADR-011). It is exposed as
 * `--font-dayrally` and used only where a dayrally product is on screen;
 * assembl company surfaces stay on Instrument Sans + IBM Plex Mono.
 */
import localFont from 'next/font/local';

export const fredoka = localFont({
  src: '../../lib/fonts/assets/fredoka-bold.ttf',
  weight: '700',
  style: 'normal',
  variable: '--font-dayrally',
  display: 'swap',
});
