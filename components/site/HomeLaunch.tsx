import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { KETES } from '@/lib/kete';
import { SectionReveal } from '@/components/SectionReveal';
import { VesselHero } from '@/components/hero/VesselHero';

// "Pick your area" — one link per kete. English first, te reo second.
const KETE_ROWS = [
  { slug: 'waihanga', name: 'Waihanga', area: 'Construction', drafts: 'RFIs, variation packs, site logs' },
  { slug: 'manaaki', name: 'Manaaki', area: 'Hospitality', drafts: 'Allergen reports, guest replies, supplier comparisons' },
  { slug: 'pikau', name: 'Pīkau', area: 'Freight & Customs', drafts: 'Customs entries, freight exceptions, carrier compliance' },
  { slug: 'arataki', name: 'Arataki', area: 'Automotive & Fleet', drafts: 'WoF readiness, CGA disclosures, defect logs' },
  { slug: 'auaha', name: 'Auaha', area: 'Creative', drafts: 'Caption batches, briefs, tagline shortlists' },
  { slug: 'ako', name: 'Ako', area: 'Education', drafts: 'Notice rewrites, assessment summaries, parent updates' },
  { slug: 'matauranga', name: 'Mātauranga', area: 'Knowledge & Research', drafts: 'Source checks, document comparisons, submissions' },
  { slug: 'hoko', name: 'Hoko', area: 'Commerce', drafts: 'Return triage, customer replies, supplier comparisons' },
  { slug: 'toro', name: 'Tōro', area: 'Family', drafts: 'School notices, weekly plans, gear lists' },
] as const;

const ACCENT = Object.fromEntries(KETES.map((k) => [k.slug, k.accent])) as Record<string, string>;

const HOW_STEPS = [
  ['i', 'Agents draft it', 'The slow, repetitive writing — done in seconds, grounded in your industry’s rules.'],
  ['ii', 'You sign off', 'Nothing sends, files, or lodges until a named person on your team approves it.'],
  ['iii', 'The receipt', 'Every output carries an evidence pack: the sources used, the assumptions made, and who approved it.'],
] as const;

const GLASS =
  'rounded-[22px] border border-white/65 bg-[linear-gradient(160deg,rgba(255,255,255,0.55),rgba(255,255,255,0.28))] ' +
  'backdrop-blur-xl shadow-[0_18px_50px_rgba(40,30,18,0.07),inset_0_1px_0_rgba(255,255,255,0.6)] ' +
  'transition duration-300 hover:-translate-y-1.5 hover:bg-[linear-gradient(160deg,rgba(255,255,255,0.72),rgba(255,255,255,0.42))] hover:shadow-[0_34px_80px_rgba(40,30,18,0.14)]';

export function HomeLaunch() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      {/* 1 · Hero — the stacked vessel + the line, in clean space */}
      <section className="relative bg-[radial-gradient(120%_90%_at_28%_30%,#f7f0e3_0%,#ece3d2_52%,#ddd2bd_100%)]">
        <div className="container grid min-h-[92vh] items-center gap-6 py-24 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative h-[46vh] min-h-[320px] lg:h-[78vh]">
            <VesselHero />
          </div>
          <SectionReveal>
            <div className="max-w-xl">
              <p className="font-mono text-eyebrow uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">
                Built in Aotearoa
              </p>
              <h1 className="mt-5 font-display text-[clamp(2.9rem,6vw,5.6rem)] font-light leading-[0.98] tracking-[-0.025em]">
                Mahi that earns <em className="italic">its proof.</em>
              </h1>
              <p className="mt-6 max-w-md text-body-lg leading-relaxed text-[color:var(--text-body)]">
                Specialist agents draft the admin-heavy work. A named person signs it off. Every
                output is sealed in an evidence pack — the receipt.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/hapai" className="cta-primary inline-flex h-12 items-center gap-2 px-7">
                  Try a free tool <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/pilot-sprint" className="btn-ghost inline-flex h-12 items-center px-6">
                  Book a Pilot Sprint
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* 2 · The promise */}
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <SectionReveal>
            <h2 className="max-w-3xl font-display text-display-lg font-light">Less admin, more mahi.</h2>
            <p className="mt-8 max-w-3xl text-body-lg text-[color:var(--text-body)]">
              Hospitality teams shouldn’t spend their best hour writing the allergen report. Builders
              shouldn’t spend it checking a variation against clause 24A. Schools shouldn’t spend it
              rewording the same notice for a fourth year group. That’s the work assembl picks up — so
              your people get those hours back.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* 3 · Pick your area — the nine kete, glass cards, one link each */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <SectionReveal>
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-display-lg font-light">Pick the pack for your work.</h2>
              <span className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">Nine kete</span>
            </div>
            <p className="max-w-2xl text-body-lg text-[color:var(--text-body)]">
              A kete is a kit for one kind of work — the agents, tools, and rules shaped for it.
            </p>
          </SectionReveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {KETE_ROWS.map((row, i) => (
              <SectionReveal key={row.slug} delay={(i % 3) * 0.06}>
                <Link href={`/kete/${row.slug}`} className={`group flex h-full flex-col justify-between p-6 ${GLASS}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">{row.area}</span>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ACCENT[row.slug] }} aria-hidden />
                  </div>
                  <div className="mt-8">
                    <h3 className="font-display text-2xl font-light">
                      {row.name} <span className="text-[color:var(--text-secondary)]">· {row.area}</span>
                    </h3>
                    <p className="mt-3 text-body-md text-[color:var(--text-body)]">{row.drafts}</p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)] transition group-hover:gap-2.5">
                    Open <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · How it works */}
      <section className="border-y border-[rgba(212,168,83,0.36)] bg-[radial-gradient(120%_70%_at_50%_0%,#f6efe4,transparent_60%)] py-24 lg:py-32">
        <div className="container">
          <SectionReveal>
            <div className="mb-10 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-display-lg font-light">Draft. Sign off. Sealed receipt.</h2>
              <span className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">How it works</span>
            </div>
          </SectionReveal>
          <div className="grid gap-4 lg:grid-cols-3">
            {HOW_STEPS.map(([n, title, body], i) => (
              <SectionReveal key={title} delay={i * 0.06}>
                <article className={`h-full p-7 ${GLASS}`}>
                  <p className="font-display text-4xl font-light italic text-[#b9ad9c]">{n}</p>
                  <h3 className="mt-3 font-display text-display-md font-light">{title}</h3>
                  <p className="mt-4 text-body-md text-[color:var(--text-body)]">{body}</p>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5 · Pricing teaser */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">Pricing</p>
              <h2 className="mt-5 font-display text-display-lg font-light">Start with the work in front of you.</h2>
              <p className="mx-auto mt-6 max-w-xl text-body-lg text-[color:var(--text-body)]">
                Free tools, a Pilot Sprint proven on your data, a kete pack for your industry, and a
                Tōro option for whānau. Simple and honest.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link href="/hapai" className="cta-primary inline-flex h-12 items-center gap-2 px-7">
                  Try a free tool <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/pricing" className="btn-ghost inline-flex h-12 items-center px-6">See pricing</Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </main>
  );
}
