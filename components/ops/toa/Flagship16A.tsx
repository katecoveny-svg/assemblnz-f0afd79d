import Image from 'next/image';
import { toa16A } from '@/lib/customers/toa-architects/demo-data';

/**
 * Flagship16A — "here's what ARC is doing for 16A this week".
 *
 * Nick's real project, front and centre: the April massing aerial on the
 * left, the site facts (straight from the draft RC of 12 May 2025) and this
 * week's ARC activity on the right, interior-study frames along the bottom.
 * Imagery is the existing assembl-generated 16A work — nothing newly
 * generated for this surface.
 */
export function Flagship16A() {
  return (
    <section
      aria-label="Flagship project — 16A Hubert Henderson Place"
      className="overflow-hidden rounded-2xl border border-black/5 bg-[color:var(--brand-surface)]"
    >
      <div className="grid grid-cols-1 md:grid-cols-[380px_1fr]">
        {/* the proposed unit — Kate's exterior render */}
        <div className="relative min-h-[240px] bg-[#f6f4ee]">
          <Image
            src={toa16A.images.renders[0]}
            alt="16C — concept render of the proposed two-bed unit: cedar shiplap, dark gable roof, deck, piles for the sloped site"
            fill
            sizes="(max-width: 768px) 90vw, 380px"
            className="object-cover"
          />
          <span className="absolute left-3 top-3 rounded bg-black/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white">
            16C · concept render
          </span>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-[family-name:var(--font-brand-display)] text-base font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-ink)]">
              This week on {toa16A.name}
            </h2>
            <span className="text-xs text-[color:var(--brand-muted)]">
              {toa16A.suburb} · flagship project
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {toa16A.facts.map((f) => (
              <span
                key={f}
                className="rounded-full bg-[color:var(--brand-bg)] px-2.5 py-1 text-[11px] text-[color:var(--brand-muted)]"
              >
                {f}
              </span>
            ))}
          </div>

          <ul className="flex flex-col gap-1.5 text-sm text-[color:var(--brand-ink)]">
            {toa16A.thisWeek.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: 'var(--brand-canary)' }}
                />
                {t}
              </li>
            ))}
          </ul>

          <p className="mt-auto text-[11px] text-[color:var(--brand-muted)]">
            real project, real April pre-checks · week-by-week activity is demo
            · Te Aranga audit held for review with mana whenua
          </p>
        </div>
      </div>

      {/* render + study strip — more of the house, then massing + interior */}
      <div className="grid grid-cols-4 gap-px border-t border-black/5 bg-black/5">
        {[
          { src: toa16A.images.renders[1], alt: '16C concept render — deck and piles on the sloped site' },
          { src: toa16A.images.renders[2], alt: '16C concept render — entry elevation' },
          { src: toa16A.images.massing, alt: 'Site massing aerial — existing units and proposed 16C + 16D' },
          { src: toa16A.images.interiors[1], alt: 'Interior study — screened light' },
        ].map((im) => (
          <div key={im.src} className="relative aspect-[16/9]">
            <Image
              src={im.src}
              alt={im.alt}
              fill
              sizes="(max-width: 768px) 25vw, 210px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
