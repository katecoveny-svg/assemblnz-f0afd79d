import {
  EDITORIAL_MANIFESTO_EYEBROW,
  EDITORIAL_MANIFESTO_TOKENS,
} from '@/lib/copy/editorial-home';
import { PosterHeadline } from './PosterHeadline';

/**
 * Viewport 3 — the manifesto.
 *
 * Same white ground and poster face as the hero, one full screen of it, so
 * the page opens and closes on the same typographic note with the walkable
 * gallery in between. A single Space Mono eyebrow, then the poster; nothing
 * else competes.
 */
export function EditorialManifesto() {
  return (
    <section
      id="manifesto"
      aria-label="assembl manifesto"
      className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden bg-[#FBFAF6] px-6 py-14 text-[#1A1918] sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <p
          className="mb-8 text-[10px] uppercase tracking-[0.34em] text-[#1A1918]/55 sm:mb-12 sm:text-[11px]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {EDITORIAL_MANIFESTO_EYEBROW}
        </p>
        {/* One line longer than the hero, so a touch smaller to clear 100svh. */}
        <PosterHeadline
          tokens={EDITORIAL_MANIFESTO_TOKENS}
          style={{ fontSize: 'clamp(1.65rem, 5.3vw, 4.75rem)' }}
        />
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[#BFA37A]/45 sm:inset-x-10 lg:inset-x-16"
      />
    </section>
  );
}
