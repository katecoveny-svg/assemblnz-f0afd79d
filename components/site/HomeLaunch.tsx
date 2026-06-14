import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { KETES } from '@/lib/kete';

// Verbatim from assembl-site-copy.md — "Pick your area". One link per kete.
const KETE_ROWS = [
  { slug: 'waihanga', name: 'Waihanga', area: 'Construction', drafts: 'RFIs, variation packs, site logs' },
  { slug: 'manaaki', name: 'Manaaki', area: 'Hospitality', drafts: 'Allergen reports, guest replies, supplier comparisons' },
  { slug: 'pikau', name: 'Pīkau', area: 'Freight & customs', drafts: 'Customs entries, freight exceptions, carrier compliance' },
  { slug: 'arataki', name: 'Arataki', area: 'Automotive & fleet', drafts: 'WoF readiness, CGA disclosures, defect logs' },
  { slug: 'auaha', name: 'Auaha', area: 'Creative', drafts: 'Caption batches, briefs, tagline shortlists' },
  { slug: 'ako', name: 'Ako', area: 'Education', drafts: 'Notice rewrites, assessment summaries, parent updates' },
  { slug: 'matauranga', name: 'Mātauranga', area: 'Knowledge & research', drafts: 'Source checks, document comparisons, submissions' },
  { slug: 'hoko', name: 'Hoko', area: 'Commerce', drafts: 'Return triage, customer replies, supplier comparisons' },
  { slug: 'toro', name: 'Tōro', area: 'Family', drafts: 'School notices, weekly plans, gear lists' },
] as const;

const ACCENT = Object.fromEntries(KETES.map((k) => [k.slug, k.accent])) as Record<string, string>;

const HOW_STEPS = [
  ['AI drafts it', 'the slow, repetitive writing, done in seconds.'],
  ['You decide', 'nothing sends, publishes, or gets filed until a named person signs it off.'],
  [
    'You get the receipts',
    'every output comes with an evidence pack: the sources used, the assumptions made, and who approved it. One file to keep or forward.',
  ],
] as const;

export function HomeLaunch() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      {/* 1 · Hero */}
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <p className="font-mono text-eyebrow uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            Built in Aotearoa
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-display-xl font-light">Mahi that earns its proof.</h1>
          <p className="mt-8 max-w-2xl text-body-lg text-[color:var(--text-body)]">
            AI drafts the admin that eats your team’s day — the reports, the customs entries, the
            notices. Your team signs it off, every output comes with a record of how it was made,
            and your people get those hours back.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/hapai" className="cta-primary inline-flex h-12 items-center px-7">
              Try a free tool
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link href="/pilot-sprint" className="btn-ghost inline-flex h-12 items-center px-7">
              Book a Pilot Sprint
            </Link>
          </div>
        </div>
      </section>

      {/* 2 · The problem */}
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <h2 className="max-w-3xl font-display text-display-lg font-light">Less admin. More of the actual job.</h2>
          <p className="mt-8 max-w-3xl text-body-lg text-[color:var(--text-body)]">
            Hospitality teams shouldn’t spend their best hour writing the allergen report. Builders
            shouldn’t spend it checking a variation against clause 24A. Schools shouldn’t spend it
            rewording the same notice for a fourth year group. That’s the work assembl picks up — so
            your people get those hours back.
          </p>
        </div>
      </section>

      {/* 3 · How it works */}
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <h2 className="max-w-3xl font-display text-display-lg font-light">Three steps. No platform to learn.</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {HOW_STEPS.map(([label, body]) => (
              <article key={label} className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/55 p-7">
                <p className="font-display text-display-md font-light">{label}</p>
                <p className="mt-4 text-body-md text-[color:var(--text-body)]">{body}</p>
              </article>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/how-it-works" className="btn-ghost inline-flex h-12 items-center px-7">
              See how it works
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 · Proof */}
      <section className="border-b border-[rgba(212,168,83,0.36)] py-24 lg:py-32">
        <div className="container">
          <h2 className="max-w-3xl font-display text-display-lg font-light">Every output comes with a receipt.</h2>
          <p className="mt-8 max-w-3xl text-body-lg text-[color:var(--text-body)]">
            That’s the evidence pack — what was asked, the sources used, what changed, and who signed
            off. So when someone asks “where did this come from?” six months later, the answer is one
            file, not a scramble.
          </p>
          <div className="mt-10">
            <Link href="/evidence-pack" className="btn-ghost inline-flex h-12 items-center px-7">
              See a sample pack
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* 5 · Pick your area */}
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <h2 className="max-w-3xl font-display text-display-lg font-light">Pick the pack for your work.</h2>
          <p className="mt-6 max-w-2xl text-body-lg text-[color:var(--text-body)]">
            A kete is a kit for one kind of work — the agents, tools, and rules shaped for it.
          </p>

          <ul className="mt-10 divide-y divide-[rgba(35,33,31,0.08)] border-y border-[rgba(35,33,31,0.08)]">
            {KETE_ROWS.map((row) => (
              <li key={row.slug}>
                <Link
                  href={`/kete/${row.slug}`}
                  className="group grid grid-cols-1 items-center gap-2 py-5 sm:grid-cols-[minmax(180px,1fr)_2fr_auto] sm:gap-6"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ACCENT[row.slug] }} aria-hidden />
                    <span className="font-display text-2xl font-light">
                      {row.name} <span className="text-[color:var(--text-secondary)]">· {row.area}</span>
                    </span>
                  </span>
                  <span className="text-body-md text-[color:var(--text-body)]">{row.drafts}</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)] transition group-hover:gap-2.5">
                    Open <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Link href="/kete" className="btn-ghost inline-flex h-12 items-center px-7">
              See all packs
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* 6 · Start */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <h2 className="max-w-3xl font-display text-display-lg font-light">Start with the work in front of you.</h2>
          <p className="mt-8 max-w-2xl text-body-lg text-[color:var(--text-body)]">
            Try a free tool now, or bring one real workflow to a Pilot Sprint and see it run on your
            own data in ten working days.
          </p>
          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link href="/hapai" className="cta-primary inline-flex h-12 items-center px-7">
              Try a free tool
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link href="/pilot-sprint" className="btn-ghost inline-flex h-12 items-center px-7">
              Book a Pilot Sprint
            </Link>
            <Link
              href="/pricing"
              className="font-mono text-[12px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
