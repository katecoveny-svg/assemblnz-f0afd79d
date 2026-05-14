'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, FileCheck2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Kete, KeteSlug } from '@/lib/kete';
import type { PearlLiveStats } from '@/lib/pearl-live';

type KeteImagery = Record<KeteSlug, { square: string; wide: string }>;

interface HomePortalProps {
  ketes: Kete[];
  keteImagery: KeteImagery;
  pearlLive: PearlLiveStats;
}

const KETE_DETAILS: Record<KeteSlug, {
  status: string;
  workflow: string;
  agents: string;
  proof: string;
}> = {
  waihanga: {
    status: 'Live',
    workflow: 'Consent pre-checks, s14B, PS bundles, CCC evidence',
    agents: 'Ārai, Kaupapa, Ata, Rawa, Whakaaē, Pai',
    proof: 'Council-ready evidence packs with source citations',
  },
  manaaki: {
    status: 'Pilot',
    workflow: 'Food safety, liquor licensing, shift records',
    agents: 'Hospitality compliance agents',
    proof: 'Operator logs prepared for review',
  },
  pikau: {
    status: 'Live',
    workflow: 'Customs entries, HS checks, tariff evidence',
    agents: 'Pikau, Gateway, Transit-Freight',
    proof: 'Broker-ready freight packs',
  },
  arataki: {
    status: 'Pilot',
    workflow: 'WoF, CoF, CGA, IPP 3A, fleet office workflows',
    agents: 'Workshop, dealer, and fleet specialists',
    proof: 'Automotive records with human sign-off',
  },
  auaha: {
    status: 'Pilot',
    workflow: 'Creative briefs, rights checks, campaign records',
    agents: 'Creative operations agents',
    proof: 'Brand work with a traceable approval record',
  },
  ako: {
    status: 'Pilot',
    workflow: 'Te Whāriki, ratios, kaiako, ERO readiness',
    agents: 'ECE compliance specialists',
    proof: 'Centre evidence packs for named reviewers',
  },
  matauranga: {
    status: 'Greenfield / pilot',
    workflow: 'NCEA L1-3, reporting, achievement standards',
    agents: 'School-operator specialists',
    proof: 'Pilot packs for secondary education workflows',
  },
  hoko: {
    status: 'Mothballed',
    workflow: 'Consumer guarantees, product records, retail operations',
    agents: 'Retail compliance specialists',
    proof: 'Retail records ready when the kete reopens',
  },
  toro: {
    status: 'Live',
    workflow: 'Term Planner, Kid Money, Holiday Ideas',
    agents: 'Core Tōro navigator plus three public agents',
    proof: 'Parent-approved whānau actions and records',
  },
};

const PROOF_ITEMS = [
  {
    key: 'draftingNow',
    label: 'drafting now',
    note: 'evidence packs in draft',
  },
  {
    key: 'sealedLastHour',
    label: 'sealed last hour',
    note: 'hash-chained records',
  },
  {
    key: 'positiveOutcomesToday',
    label: 'outcomes today',
    note: 'accepted, cleared, paid',
  },
  {
    key: 'draftsInReview',
    label: 'human review',
    note: 'awaiting signature',
  },
] as const;

export function HomePortal({ ketes, keteImagery, pearlLive }: HomePortalProps) {
  const [activeSlug, setActiveSlug] = useState<KeteSlug>('waihanga');
  const activeKete = useMemo(
    () => ketes.find((kete) => kete.slug === activeSlug) ?? ketes[0],
    [activeSlug, ketes],
  );
  const activeDetails = KETE_DETAILS[activeKete.slug];
  const activeStyle = { '--kete-accent': activeKete.accent } as CSSProperties;

  return (
    <main
      className="min-h-screen bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]"
      style={activeStyle}
    >
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.08)] bg-[linear-gradient(180deg,#FAF7F2_0%,#F4EFE7_100%)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[color:var(--assembl-gold-thread)] opacity-80" />
        <div className="absolute inset-y-0 left-0 w-2 bg-[color:var(--kete-accent)]" aria-hidden />
        <div className="mx-auto grid min-h-[78vh] max-w-7xl gap-8 px-6 py-10 md:grid-cols-[minmax(0,1fr)_minmax(390px,540px)] md:px-10 md:py-14 xl:min-h-[74vh]">
          <div className="flex flex-col justify-between gap-8 md:pr-2">
            <div>
              <p className="inline-flex border border-[rgba(43,107,87,0.22)] bg-white/55 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                Nine kete / pilot sprint / evidence pack
              </p>
              <h1 className="mt-7 max-w-4xl font-display text-[clamp(3.1rem,7vw,6.9rem)] font-light leading-[0.91] text-[color:var(--text-primary)]">
                Pick a kete. Run a workflow. Leave with an evidence pack.
              </h1>
              <p className="mt-7 max-w-2xl text-[1.02rem] leading-[1.75] text-[color:var(--text-body)] md:text-lg">
                assembl is a platform of specialist agents for New Zealand operators and whānau.
                Each workflow drafts the work, records the sources, and waits for a named human
                before anything consequential leaves your account.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/pilot-sprint"
                  className="cta-primary inline-flex h-12 items-center justify-center px-7 text-sm md:text-base"
                >
                  Book a pilot
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/evidence-pack"
                  className="btn-ghost inline-flex h-12 items-center justify-center px-7 text-sm md:text-base"
                >
                  See evidence pack
                  <FileCheck2 className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>

            <ProofDock stats={pearlLive} />
          </div>

          <div className="flex flex-col gap-4">
            <FeaturedKete
              kete={activeKete}
              details={activeDetails}
              image={keteImagery[activeKete.slug].wide}
            />
            <KeteSelector
              ketes={ketes}
              activeSlug={activeSlug}
              onSelect={setActiveSlug}
            />
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--assembl-cloud)] px-6 py-8 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {[
            ['01', 'Choose a kete', 'Start from your industry or Tōro whānau workflow.'],
            ['02', 'Select the job', 'Pick the weekly workflow worth proving first.'],
            ['03', 'Review the draft', 'A named person checks every consequential step.'],
            ['04', 'Keep the record', 'The final pack carries citations, sign-off, and verifier trail.'],
          ].map(([number, title, body]) => (
            <div key={number} className="border-l border-[rgba(35,33,31,0.18)] bg-[rgba(250,247,242,0.45)] py-2 pl-4 pr-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                {number}
              </p>
              <h2 className="mt-3 font-display text-[1.65rem] font-light leading-none text-[color:var(--text-primary)]">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function FeaturedKete({
  kete,
  details,
  image,
}: {
  kete: Kete;
  details: (typeof KETE_DETAILS)[KeteSlug];
  image: string;
}) {
  return (
    <article className="overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[rgba(255,255,255,0.62)] shadow-[0_18px_60px_rgba(35,33,31,0.10)] backdrop-blur-xl">
      <div className="relative aspect-[16/9] border-b border-[rgba(35,33,31,0.08)]">
        <Image
          src={image}
          alt=""
          fill
          priority={kete.slug === 'waihanga'}
          sizes="(min-width: 1024px) 520px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[rgba(35,33,31,0.28)] to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-[rgba(250,247,242,0.86)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-primary)] shadow-sm">
          {details.status}
        </span>
      </div>
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--kete-accent)]">
              {kete.industry}
            </p>
            <h2 className="mt-2 font-display text-[clamp(2.25rem,4vw,3.4rem)] font-light leading-none text-[color:var(--text-primary)]">
              {kete.name}
            </h2>
          </div>
          <span className="mt-2 h-8 w-8 rounded-full border border-[rgba(35,33,31,0.14)] bg-[color:var(--kete-accent)]" aria-hidden />
        </div>
        <p className="mt-4 max-w-[58ch] text-[0.95rem] leading-[1.7] text-[color:var(--text-body)]">
          {kete.tagline}
        </p>
        <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3">
          <KeteMeta label="Workflow" value={details.workflow} />
          <KeteMeta label="Agents" value={details.agents} />
          <KeteMeta label="Proof" value={details.proof} />
        </dl>
        <Link
          href={`/kete/${kete.slug}`}
          className="mt-6 inline-flex items-center font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--assembl-pounamu)]"
        >
          Open kete
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

function KeteSelector({
  ketes,
  activeSlug,
  onSelect,
}: {
  ketes: Kete[];
  activeSlug: KeteSlug;
  onSelect: (slug: KeteSlug) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2" aria-label="Choose a kete">
      {ketes.map((kete) => {
        const active = kete.slug === activeSlug;
        return (
          <button
            key={kete.slug}
            type="button"
            onClick={() => onSelect(kete.slug)}
            style={{ '--tile-accent': kete.accent } as CSSProperties}
            className={[
              'min-h-[86px] rounded-[8px] border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tile-accent)] focus-visible:ring-offset-2',
              active
                ? 'border-[color:var(--tile-accent)] bg-white shadow-[0_8px_24px_rgba(35,33,31,0.08)]'
                : 'border-[rgba(35,33,31,0.12)] bg-white/45 hover:border-[color:var(--tile-accent)] hover:bg-white/75',
            ].join(' ')}
            aria-pressed={active}
          >
            <span className="mb-3 block h-1 w-8 rounded-full bg-[color:var(--tile-accent)]" aria-hidden />
            <span className="block font-display text-[1.35rem] font-light leading-none text-[color:var(--text-primary)]">
              {kete.name}
            </span>
            <span className="mt-2 block text-[11px] leading-snug text-[color:var(--text-secondary)]">
              {kete.industry}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ProofDock({ stats }: { stats: PearlLiveStats }) {
  return (
    <aside className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[rgba(255,255,255,0.64)] p-4 shadow-[0_12px_40px_rgba(35,33,31,0.08)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[color:var(--assembl-pounamu)] shadow-[0_0_0_4px_rgba(43,107,87,0.12)]" aria-hidden />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-secondary)]">
            Pearl Live
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          captured {formatTime(stats.capturedAt)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {PROOF_ITEMS.map((item) => {
          const value = stats[item.key];
          return (
            <div key={item.key} className="border-l border-[rgba(212,168,83,0.72)] pl-3">
              <p className="font-display text-[clamp(2rem,3vw,2.7rem)] font-light leading-none tabular-nums text-[color:var(--text-primary)]">
                {value === 0 ? '—' : value.toLocaleString('en-NZ')}
              </p>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
                {item.label}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-[color:var(--text-secondary)]">
                {item.note}
              </p>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function KeteMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-[rgba(250,247,242,0.62)] p-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--kete-accent)]">
        {label}
      </dt>
      <dd className="mt-2 leading-relaxed text-[color:var(--text-body)]">{value}</dd>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}
