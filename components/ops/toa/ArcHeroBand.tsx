import Image from 'next/image';
import { Cormorant_Garamond, Zilla_Slab } from 'next/font/google';
import type { BrandConfig } from '@/lib/brand/brand-config';

/**
 * ArcHeroBand — the above-the-fold story for the TOA × ARC concept demo.
 *
 * Dark TOA ground (#161516) with a low-contrast tessellated-triangle texture
 * drawn in CSS (their site's dark sections use a similar tukutuku-like field;
 * we redraw it, we don't lift their asset). White TOA wordmark sits top-left;
 * ARC is introduced in assembl chrome — Cormorant lowercase + champagne per
 * DIRECTION-LOCKED-2026-07-01. The italic serif line is the tone contract
 * from the April 2026 discovery doc.
 *
 * Concept framing is structural, not small print: the eyebrow says this is
 * a concept, and nothing in the band claims a partnership.
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});
// Stand-in for TOA's Archer slab (licensed) — used only for the italic
// tone-contract line, mirroring the italic serif quotes on toa.nz.
const zilla = Zilla_Slab({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
  display: 'swap',
});

const CHAMPAGNE = '#bfa37a';

/** ARC mark — deep navy square, champagne monogram. Small, chat-panel scale. */
export function ArcMark({ size = 36 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-md font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor: '#0b1f3a',
        color: CHAMPAGNE,
        fontSize: size * 0.34,
        letterSpacing: '0.08em',
        border: `1px solid ${CHAMPAGNE}55`,
      }}
    >
      ARC
    </span>
  );
}

/** Redrawn low-contrast triangle field for dark grounds. */
export const toaTriangleField: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, rgba(255,255,255,0.028) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.028) 25%, transparent 25%)',
  backgroundSize: '28px 28px',
};

export function ArcHeroBand({
  config,
  waiting,
}: {
  config: BrandConfig;
  waiting: number;
}) {
  return (
    <section
      aria-label="ARC — concept operating system for TOA Architects"
      className="relative overflow-hidden rounded-2xl"
      style={{ backgroundColor: '#161516', ...toaTriangleField }}
    >
      <div className="relative flex flex-col gap-5 px-8 py-9 md:px-10">
        {/* TOA wordmark — white variant on the dark ground */}
        <div className="flex items-center justify-between gap-4">
          <Image
            src={config.logo.darkSrc ?? config.logo.src}
            alt={config.logo.alt}
            width={150}
            height={73}
            className="h-14 w-auto object-contain"
            priority
          />
          <span
            className="hidden rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em] sm:inline-block"
            style={{ borderColor: `${CHAMPAGNE}66`, color: CHAMPAGNE }}
          >
            concept · not affiliated with TOA Architects Ltd
          </span>
        </div>

        <div className="flex flex-col gap-4 md:max-w-2xl">
          <p
            className="text-[11px] uppercase tracking-[0.3em]"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            what a TOA × assembl operating system could look like
          </p>

          {/* Personal greeting — the demo is built for Nick Dalton. */}
          <p
            className={`${cormorant.className} -mb-2 text-2xl italic`}
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Kia ora Nick —
          </p>

          <div className="flex items-start gap-4">
            <ArcMark size={44} />
            <div>
              <h1
                className={`${cormorant.className} text-4xl leading-tight text-white md:text-5xl`}
              >
                ARC — your practice&apos;s operating brain
              </h1>
              <p
                className="mt-2 text-sm leading-relaxed md:text-base"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                runs consent, client updates, fee proposals and site reports —
                on top of the tools the studio already uses
              </p>
            </div>
          </div>

          <p
            className={`${zilla.className} text-sm md:text-base`}
            style={{ color: `${CHAMPAGNE}cc` }}
          >
            &ldquo;A tool that drafts, never decides; that flags, never claims.&rdquo;
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
            <span
              className="rounded-full border px-3 py-1 tracking-wide"
              style={{ borderColor: CHAMPAGNE, color: CHAMPAGNE }}
            >
              trust score A · concept demo
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'white' }}
            >
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: CHAMPAGNE }}
              />
              {waiting} drafts waiting for review · nothing sends itself
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
