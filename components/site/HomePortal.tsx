'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, FileCheck2, LayoutDashboard, MessageCircle, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Kete, KeteSlug } from '@/lib/kete';
import type { PearlLiveStats } from '@/lib/pearl-live';
import { AssemblConciergeWidget } from './AssemblConciergeWidget';

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
    proof: 'Service logs prepared for review',
  },
  pikau: {
    status: 'Live',
    workflow: 'Customs entries, HS checks, tariff evidence',
    agents: 'Pīkau, Gateway, Transit-Freight',
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

const LOCAL_VESSELS = {
  manaaki: '/img/kete/manaaki-vessel.png',
  pikau: '/img/kete/pikau-vessel.jpg',
  toro: '/img/kete/toro-vessel.png',
} as Partial<Record<KeteSlug, string>>;

const PRODUCT_ACCESS = [
  {
    href: '/pilot-sprint',
    label: 'Book a pilot',
    body: 'Two weeks, one workflow, one evidence pack reviewed by your team.',
    icon: MessageCircle,
  },
  {
    href: '/evidence-pack',
    label: 'See an evidence pack',
    body: 'What the signed evidence record contains and how verification works.',
    icon: ShieldCheck,
  },
  {
    href: '/kete',
    label: 'Explore kete',
    body: 'Nine kete: eight industries plus Tōro whānau.',
    icon: LayoutDashboard,
  },
  {
    href: '/industry-pack',
    label: 'Industry Pack',
    body: 'NZ$5,000 a month for one industry fleet, one operating loop, no setup fee.',
    icon: FileCheck2,
  },
] as const;

export function HomePortal({ ketes, keteImagery, pearlLive }: HomePortalProps) {
  const [activeSlug, setActiveSlug] = useState<KeteSlug>('waihanga');
  const reduceMotion = useReducedMotion();
  const activeKete = useMemo(
    () => ketes.find((kete) => kete.slug === activeSlug) ?? ketes[0],
    [activeSlug, ketes],
  );
  const activeDetails = KETE_DETAILS[activeKete.slug];
  const activeStyle = { '--kete-accent': activeKete.accent } as CSSProperties;

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]"
      style={activeStyle}
    >
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.08)] bg-[linear-gradient(180deg,#FAF7F2_0%,#F4EFE7_100%)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[color:var(--assembl-gold-thread)] opacity-80" />
        <motion.div
          className="absolute inset-y-0 left-0 w-2 bg-[color:var(--kete-accent)]"
          aria-hidden
          animate={reduceMotion ? undefined : { opacity: [0.7, 1] }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="mx-auto grid min-h-[78vh] max-w-7xl gap-8 px-6 py-10 md:grid-cols-[minmax(0,1fr)_minmax(390px,540px)] md:px-10 md:py-14 xl:min-h-[74vh]">
          <div className="min-w-0 flex flex-col justify-between gap-8 md:pr-2">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0.92, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="inline-flex border border-[rgba(43,107,87,0.22)] bg-white/55 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                assembl evidence vessel · Built in Aotearoa
              </p>
              <h1 className="mt-5 max-w-[11ch] font-display text-[2rem] font-light leading-[0.96] text-[color:var(--text-primary)] md:mt-7 md:max-w-4xl md:text-[clamp(3.4rem,7vw,6.9rem)] md:leading-[0.91]">
                Mahi that earns its proof.
              </h1>
              <div className="mt-4 md:hidden">
                <KeteSelector
                  ketes={ketes}
                  imagery={keteImagery}
                  activeSlug={activeSlug}
                  onSelect={setActiveSlug}
                  reduceMotion={reduceMotion}
                  variant="rail"
                />
              </div>
              <p className="mt-7 hidden max-w-2xl text-lg leading-[1.75] text-[color:var(--text-body)] md:block">
                Assembl runs operational compliance work in the open: every workflow
                is grounded in New Zealand legislation, reviewed by a named person on
                your team, and sealed with an evidence pack you can file, forward, or
                footnote.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-8">
                <Link
                  href="/pilot-sprint"
                  className="cta-primary inline-flex h-11 w-full items-center justify-center px-7 text-sm sm:w-auto md:h-12 md:text-base"
                >
                  Book a pilot
                  <MessageCircle className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/evidence-pack"
                  className="btn-ghost inline-flex h-11 w-full items-center justify-center px-7 text-sm sm:w-auto md:h-12 md:text-base"
                >
                  See an evidence pack
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/kete"
                  className="btn-ghost inline-flex h-11 w-full items-center justify-center px-7 text-sm sm:w-auto md:h-12 md:text-base"
                >
                  Explore kete
                  <FileCheck2 className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </div>
            </motion.div>

            <ProductAccessPanel />
            <ProofDock stats={pearlLive} />
            <p className="text-sm leading-[1.62] text-[color:var(--text-body)] md:hidden">
              Grounded in New Zealand legislation, reviewed by your team, sealed with evidence.
            </p>
          </div>

          <div className="min-w-0 flex flex-col gap-4">
            <FeaturedKete
              kete={activeKete}
              details={activeDetails}
              image={LOCAL_VESSELS[activeKete.slug] ?? keteImagery[activeKete.slug].wide}
              reduceMotion={reduceMotion}
            />
            <div className="hidden md:block">
              <KeteSelector
                ketes={ketes}
                imagery={keteImagery}
                activeSlug={activeSlug}
                onSelect={setActiveSlug}
                reduceMotion={reduceMotion}
                variant="grid"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--assembl-cloud)] px-6 py-8 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {[
            ['01', 'Choose a kete', 'Nine kete: eight industries plus Tōro whānau.'],
            ['02', 'Talk to a specialist', 'Use chat now, or run a Pilot Sprint for a real workflow.'],
            ['03', 'Review the draft', 'A named person approves every consequential step.'],
            ['04', 'Keep the record', 'Citations, reviewer, sign-off, and verifier trail stay together.'],
          ].map(([number, title, body]) => (
            <motion.div
              key={number}
              className="border-l border-[rgba(35,33,31,0.18)] bg-[rgba(250,247,242,0.45)] py-2 pl-4 pr-3"
              initial={reduceMotion ? false : { opacity: 0.86, y: 8 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: Number(number) * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                {number}
              </p>
              <h2 className="mt-3 font-display text-[1.65rem] font-light leading-none text-[color:var(--text-primary)]">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
      <AssemblConciergeWidget />
    </main>
  );
}

function ProductAccessPanel() {
  return (
    <nav
      aria-label="Product access"
      className="grid gap-2 rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[rgba(255,255,255,0.58)] p-3 shadow-[0_12px_40px_rgba(35,33,31,0.07)] backdrop-blur-xl sm:grid-cols-2"
    >
      {PRODUCT_ACCESS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group flex min-h-[78px] gap-3 rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-[rgba(250,247,242,0.62)] p-3 transition-colors hover:border-[color:var(--assembl-pounamu)] hover:bg-white"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--assembl-pounamu)] text-[color:var(--assembl-paper)]">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
                {item.label}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[color:var(--text-secondary)]">
                {item.body}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function FeaturedKete({
  kete,
  details,
  image,
  reduceMotion,
}: {
  kete: Kete;
  details: (typeof KETE_DETAILS)[KeteSlug];
  image: string;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.article
      key={kete.slug}
      className="overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[rgba(255,255,255,0.62)] shadow-[0_18px_60px_rgba(35,33,31,0.10)] backdrop-blur-xl"
      initial={reduceMotion ? false : { opacity: 0.78, x: 10 }}
      animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
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
    </motion.article>
  );
}

function KeteSelector({
  ketes,
  imagery,
  activeSlug,
  onSelect,
  reduceMotion,
  variant = 'grid',
}: {
  ketes: Kete[];
  imagery: KeteImagery;
  activeSlug: KeteSlug;
  onSelect: (slug: KeteSlug) => void;
  reduceMotion: boolean | null;
  variant?: 'grid' | 'rail';
}) {
  return (
    <div
      className={variant === 'rail' ? 'flex max-w-full gap-2 overflow-x-auto pb-2' : 'grid grid-cols-3 gap-2'}
      aria-label="Choose a kete"
    >
      {ketes.map((kete) => {
        const active = kete.slug === activeSlug;
        return (
          <motion.button
            key={kete.slug}
            type="button"
            onClick={() => onSelect(kete.slug)}
            style={{ '--tile-accent': kete.accent } as CSSProperties}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={[
              'group rounded-[8px] border px-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tile-accent)] focus-visible:ring-offset-2',
              variant === 'rail'
                ? 'min-h-[58px] min-w-[126px] py-2'
                : 'min-h-[86px] py-3',
              active
                ? 'border-[color:var(--tile-accent)] bg-white shadow-[0_8px_24px_rgba(35,33,31,0.08)]'
                : 'border-[rgba(35,33,31,0.12)] bg-white/45 hover:border-[color:var(--tile-accent)] hover:bg-white/75',
            ].join(' ')}
            aria-pressed={active}
          >
            <span
              className={[
                'relative mb-3 block w-full overflow-hidden rounded-[6px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)]',
                variant === 'rail' ? 'h-8' : 'h-12',
              ].join(' ')}
              aria-hidden
            >
              <Image
                src={imagery[kete.slug].square}
                alt=""
                fill
                sizes={variant === 'rail' ? '126px' : '170px'}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <span
                className="absolute inset-x-0 bottom-0 h-1 bg-[color:var(--tile-accent)]"
                aria-hidden
              />
            </span>
            <span className="block font-display text-[1.18rem] font-light leading-none text-[color:var(--text-primary)] md:text-[1.35rem]">
              {kete.name}
            </span>
            <span className="mt-2 block text-[10px] leading-snug text-[color:var(--text-secondary)] md:text-[11px]">
              {kete.industry}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function ProofDock({ stats: initialStats }: { stats: PearlLiveStats }) {
  const [stats, setStats] = useState(initialStats);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch('/api/pearl-live', { cache: 'no-store' });
        if (!res.ok) return;
        const next = (await res.json()) as PearlLiveStats;
        setStats(next);
      } catch {
        // Keep the server-rendered snapshot if the live endpoint is unavailable.
      }
    };

    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.aside
      className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[rgba(255,255,255,0.64)] p-3 shadow-[0_12px_40px_rgba(35,33,31,0.08)] backdrop-blur-xl md:p-4"
      initial={reduceMotion ? false : { opacity: 0.9, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-3 flex items-center justify-between gap-4 md:mb-4">
        <div className="flex items-center gap-2">
          <motion.span
            className="h-2 w-2 rounded-full bg-[color:var(--assembl-pounamu)] shadow-[0_0_0_4px_rgba(43,107,87,0.12)]"
            aria-hidden
            animate={reduceMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-secondary)]">
            Pearl Live
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          captured {formatTime(stats.capturedAt)}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 md:gap-3">
        {PROOF_ITEMS.map((item) => {
          const value = stats[item.key];
          return (
            <motion.div
              key={item.key}
              className="min-w-0 border-l border-[rgba(212,168,83,0.72)] pl-2 md:pl-3"
              initial={reduceMotion ? false : { opacity: 0.88, y: 6 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-display text-[clamp(1.55rem,3vw,2.7rem)] font-light leading-none tabular-nums text-[color:var(--text-primary)]">
                {value === 0 ? '—' : value.toLocaleString('en-NZ')}
              </p>
              <p className="mt-2 truncate font-mono text-[7px] uppercase tracking-[0.08em] text-[color:var(--assembl-pounamu)] md:text-[9px] md:tracking-[0.18em]">
                {item.label}
              </p>
              <p className="mt-1 hidden text-[11px] leading-snug text-[color:var(--text-secondary)] md:block">
                {item.note}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.aside>
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
