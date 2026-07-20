import { Fragment } from 'react';
import {
  EDITORIAL_WORDMARK,
  EDITORIAL_HERO_TOKENS,
  EDITORIAL_SUBLINE,
  EDITORIAL_CTAS,
} from '@/lib/copy/editorial-home';
import { InlineDemoChip } from './InlineDemoChip';

/**
 * Viewport 1 — the arresting typography moment.
 *
 * White gallery ground, dark ink. A tiny Cormorant italic wordmark up top,
 * then a MASSIVE Archivo Black H1 broken poetically across lines with tiny
 * concept-demo chips slotted between phrases like photo strips in a
 * magazine spread. Space Mono sub-line, two calm CTAs, a lot of paper
 * left unwritten.
 *
 * Reference: designbyshiv._ "The Work" post — coffee-cup type spread —
 * translated to the assembl gallery palette (paper #FBFAF6, ink #1A1918,
 * champagne #BFA37A).
 */
export function EditorialHero() {
  return (
    <section
      aria-label="assembl — make AI visible"
      className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-[#FBFAF6] px-6 pb-10 pt-8 text-[#1A1918] sm:px-10 sm:pb-14 sm:pt-10 lg:px-16 lg:pb-20 lg:pt-14"
    >
      {/* Top rail — wordmark left, tiny nav pill right (kept understated) */}
      <header className="relative z-10 flex items-start justify-between">
        <a
          href="/"
          className="text-2xl italic leading-none tracking-[-0.01em] text-[#1A1918] sm:text-[28px]"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          {EDITORIAL_WORDMARK}
        </a>
        <nav
          className="hidden items-center gap-6 text-[11px] uppercase tracking-[0.22em] text-[#1A1918]/70 sm:flex"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <a href="#gallery" className="transition-colors hover:text-[#1A1918]">Gallery</a>
          <a href="/field-notes" className="transition-colors hover:text-[#1A1918]">Field notes</a>
          <a href="mailto:assembl@assembl.co.nz" className="transition-colors hover:text-[#1A1918]">Contact</a>
        </nav>
      </header>

      {/* The hero type block — everything else is negative space */}
      <div className="relative z-10 mx-auto mt-10 flex w-full max-w-[1200px] flex-1 flex-col justify-center sm:mt-14">
        <h1
          className="text-left uppercase text-[#1A1918]"
          style={{
            fontFamily: 'var(--font-editorial)',
            // Poster set at page width — smaller on mobile so the whole H1
            // + subline + CTAs sit inside one initial viewport with room to
            // breathe, scales up to a hard ceiling on desktop.
            fontSize: 'clamp(2.25rem, 8.4vw, 6.75rem)',
            lineHeight: 0.94,
            letterSpacing: '-0.025em',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            hyphens: 'manual',
          }}
        >
          {EDITORIAL_HERO_TOKENS.map((token, idx) => {
            const key = `hero-${idx}`;
            if (token.kind === 'break') {
              return <br key={key} />;
            }
            if (token.kind === 'chip') {
              return (
                <Fragment key={key}>
                  <InlineDemoChip id={token.id} />{' '}
                </Fragment>
              );
            }
            if (token.kind === 'accent') {
              return (
                <Fragment key={key}>
                  <span className="italic" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                    {token.value}
                  </span>{' '}
                </Fragment>
              );
            }
            return (
              <Fragment key={key}>
                {token.value}{' '}
              </Fragment>
            );
          })}
        </h1>
      </div>

      {/* Sub-line + CTAs — small, calm, editorial */}
      <footer className="relative z-10 mt-10 flex flex-col gap-6 sm:mt-14 sm:flex-row sm:items-end sm:justify-between">
        <p
          className="max-w-[36ch] text-[10px] uppercase leading-[1.6] tracking-[0.32em] text-[#1A1918]/70 sm:text-[11px]"
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

      {/* Champagne hairline etched into the base of the hero — assembl chrome */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-4 h-px bg-[#BFA37A]/60 sm:inset-x-10 lg:inset-x-16"
      />
    </section>
  );
}
