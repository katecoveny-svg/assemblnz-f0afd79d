import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TeReo } from '@/components/site/TeReo';

export const metadata: Metadata = {
  title: 'Evidence pack',
  description:
    'Every workflow assembl runs ends in an evidence pack with reviewer, log, citations, attestations, and Mana seal.',
};

const PACKS = [
  {
    kete: 'Waihanga',
    title: 'Consenting brief',
    meta: '24 pages · 3.1 MB · generated 09:42',
    accent: '#2B6B57',
  },
  {
    kete: 'Manaaki',
    title: 'Alcohol-licence renewal pack',
    meta: '18 pages · 2.4 MB · generated 11:08',
    accent: '#AC5838',
  },
  {
    kete: 'Pīkau',
    title: 'Customs entry with biosecurity attestations',
    meta: '31 pages · 4.8 MB · generated 14:17',
    accent: '#3B7CB5',
  },
] as const;

const REGIONS = ['Header', 'Workflow ID', 'Reviewer', 'Workflow log', 'Citations', 'Compliance attestations', 'Mana seal'];

export default function EvidencePackPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
            Evidence pack
          </p>
          <h1 className="mt-6 max-w-5xl font-display text-display-xl font-light">
            Every output ends in an evidence pack.
          </h1>
          <p className="mt-8 max-w-2xl text-body-lg text-[color:var(--text-body)]">
            A primary deliverable, not a footer: reviewer, workflow log, citations, compliance attestations, and <TeReo title="authority">Mana</TeReo> seal in one fileable record.
          </p>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container grid gap-6 lg:grid-cols-3">
          {PACKS.map((pack) => (
            <article key={pack.title} className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/55 p-5">
              <div className="border-l-4 bg-[color:var(--assembl-paper)] p-5" style={{ borderLeftColor: pack.accent }}>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-secondary)]">
                  <span lang="mi">{pack.kete}</span>
                </p>
                <h2 className="mt-4 min-h-24 font-display text-display-md font-light">{pack.title}</h2>
                <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-secondary)]">
                  {pack.meta}
                </p>
                <div className="mt-6 space-y-2">
                  {[0, 1, 2, 3, 4].map((line) => (
                    <span
                      key={line}
                      className="block h-2 rounded-full bg-[rgba(35,33,31,0.12)]"
                      style={{ width: `${92 - line * 9}%` }}
                    />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[rgba(212,168,83,0.36)] py-24 lg:py-32">
        <div className="container">
          <h2 className="font-display text-display-lg font-light">Anatomy of an evidence pack.</h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white/60 p-6">
              <div className="border-l-4 border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-paper)] p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-secondary)]">ASB-WHG-0428 · Kate Hudson · 2026-05-16</p>
                <h3 className="mt-5 font-display text-4xl leading-none">Consent pre-check evidence pack</h3>
                <div className="mt-8 grid gap-3">
                  {REGIONS.slice(3, 6).map((region) => (
                    <div key={region} className="rounded-[6px] border border-[rgba(35,33,31,0.10)] bg-white p-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-secondary)]">
                      {region}
                    </div>
                  ))}
                </div>
                <p className="mt-8 font-display text-2xl italic"><TeReo title="authority">Mana</TeReo> seal</p>
              </div>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {REGIONS.map((region, index) => (
                <li key={region} className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/45 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--assembl-pounamu)]">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-3 text-body-md">{region}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container">
          <article className="mx-auto max-w-[65ch]">
            <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">Why this matters</p>
            <h2 className="mt-5 font-display text-display-lg font-light">
              Audit-ready by design.
            </h2>
            <p className="mt-8 font-display text-[1.75rem] leading-[1.7] text-[color:var(--text-primary)]">
              Work is only useful when someone can trust how it was made. Assembl treats the evidence pack as the finish line for every specialist agent run: what came in, which rule was checked, who reviewed the draft, what changed, and when the work was sealed. The pack gives operators a calm way to show their reasoning without reconstructing a week from email threads and memory.
            </p>
            <div className="mt-10">
              <Link href="/pilot-sprint" className="cta-primary inline-flex h-12 items-center px-7">
                Ship one in a Pilot Sprint
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
