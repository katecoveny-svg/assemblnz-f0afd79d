import {
  EDITORIAL_WORDMARK,
  EDITORIAL_HERO_TOKENS,
  EDITORIAL_SUBLINE,
  EDITORIAL_CTAS,
} from '@/lib/copy/editorial-home';
import { PosterHeadline } from './PosterHeadline';

/**
 * Viewport 1 — the arresting typography moment.
 *
 * White gallery ground, dark ink. A tiny Cormorant italic wordmark up top,
 * then a MASSIVE Archivo Black H1 broken poetically across lines. Between
 * phrases the H1 stops and shows tiny LIVE 3D objects (chrome sphere,
 * glass block, iridescent koru) sitting on the type baseline — the
 * designbyshiv "photo strip between words" trick, translated to r3f so
 * the "MAKE AI VISIBLE" claim is answered inside the sentence itself.
 *
 * No italic accents, no added commas — Kate's words, verbatim.
 */
export function EditorialHero() {
  return (
    <section
      aria-label="assembl — make AI visible"
      className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-[#FBFAF6] px-6 pb-8 pt-7 text-[#1A1918] sm:px-10 sm:pb-10 sm:pt-9 lg:px-16 lg:pb-12 lg:pt-10"
    >
      <header className="relative z-10 flex items-start justify-between">
        <a
          href="/"
          className="text-2xl italic leading-none tracking-[-0.01em] text-[#1A1918] sm:text-[28px]"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          {EDITORIAL_WORDMARK}
        </a>
        <nav
          className="hidden items-center gap-6 text-[12px] uppercase tracking-[0.22em] text-[#1A1918]/70 sm:flex"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <a href="#gallery" className="transition-colors hover:text-[#1A1918]">Gallery</a>
          <a href="/field-notes" className="transition-colors hover:text-[#1A1918]">Field notes</a>
          <a href="mailto:assembl@assembl.co.nz" className="transition-colors hover:text-[#1A1918]">Contact</a>
        </nav>
      </header>

      <div className="relative z-10 mx-auto mt-6 flex w-full max-w-[1200px] flex-1 flex-col justify-center sm:mt-8">
        <PosterHeadline tokens={EDITORIAL_HERO_TOKENS} />
      </div>

      <footer className="relative z-10 mt-10 flex flex-col gap-6 sm:mt-14 sm:flex-row sm:items-end sm:justify-between">
        <p
          className="max-w-[36ch] text-[12px] uppercase leading-[1.6] tracking-[0.32em] text-[#1A1918]/70 sm:text-[12px]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {EDITORIAL_SUBLINE}
        </p>
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <a
            href={EDITORIAL_CTAS.primary.href}
            className="inline-flex items-center gap-2 rounded-full bg-[#1A1918] px-6 py-3 text-[13px] font-medium text-[#FBFAF6] transition-all hover:-translate-y-[1px] hover:bg-[#000] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1918] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBFAF6]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {EDITORIAL_CTAS.primary.label}
            <span aria-hidden className="text-base leading-none">→</span>
          </a>
          <a
            href={EDITORIAL_CTAS.secondary.href}
            className="inline-flex items-center border-b border-[#1A1918]/40 pb-[3px] text-[13px] text-[#1A1918] transition-colors hover:border-[#1A1918]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {EDITORIAL_CTAS.secondary.label}
          </a>
        </div>
      </footer>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-4 h-px bg-[#BFA37A]/60 sm:inset-x-10 lg:inset-x-16"
      />
    </section>
  );
}
