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
import { KeteRotator } from './KeteRotator';

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
        <Image
          src="/img/kete/home-vessel-pounamu.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover opacity-[0.54] mix-blend-multiply"
        />
        {!reduceMotion && (
          <video
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover opacity-[0.78] mix-blend-multiply md:block motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/videos/vessel-rotate-720p.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(250,247,242,0.18)_0%,rgba(250,247,242,0.42)_30%,rgba(250,247,242,0.92)_68%)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#FAF7F2] to-transparent" aria-hidden />
        <motion.div
          className="absolute inset-y-0 left-0 w-2 bg-[color:var(--kete-accent)]"
          aria-hidden
          animate={reduceMotion ? undefined : { opacity: [0.7, 1] }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] max-w-[1800px] grid-rows-[1fr_auto] gap-8 px-6 py-8 md:px-12 md:py-12 xl:px-20">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.7fr)] xl:gap-16">
            <motion.div
              className="min-w-0"
              initial={reduceMotion ? false : { opacity: 0.92, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="inline-flex border border-[rgba(43,107,87,0.22)] bg-white/70 px-3 py-2 font-mono text-eyebrow uppercase text-[color:var(--text-secondary)] shadow-sm backdrop-blur-md">
                assembl evidence vessel · Built in Aotearoa
              </p>
              <KeteRotator
                ketes={ketes}
                className="mt-6 md:mt-8"
                scale="immersive"
                activeSlug={activeSlug}
                onActiveSlugChange={setActiveSlug}
              />
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
              <div className="mt-7 flex flex-col gap-3 sm:flex-row md:mt-10">
                <Link
                  href="/pilot-sprint"
                  className="cta-primary inline-flex h-12 w-full items-center justify-center px-8 text-base sm:w-auto md:h-14"
                >
                  Book a pilot
                  <MessageCircle className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/evidence-pack"
                  className="btn-ghost inline-flex h-12 w-full items-center justify-center bg-white/58 px-8 text-base backdrop-blur-md sm:w-auto md:h-14"
                >
                  See an evidence pack
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/kete"
                  className="btn-ghost inline-flex h-12 w-full items-center justify-center bg-white/58 px-8 text-base backdrop-blur-md sm:w-auto md:h-14"
                >
                  Explore kete
                  <FileCheck2 className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div className="mt-8 max-w-4xl">
                <ProductAccessPanel />
              </div>
            </motion.div>

            <motion.div
              className="hidden min-w-0 lg:block"
              initial={reduceMotion ? false : { opacity: 0.78, x: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <FeaturedKete
                kete={activeKete}
                details={activeDetails}
                image={LOCAL_VESSELS[activeKete.slug] ?? keteImagery[activeKete.slug].wide}
                reduceMotion={reduceMotion}
              />
            </motion.div>
          </div>

          <div className="grid gap-4">
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
            <ProofDock stats={pearlLive} />
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
              <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
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
            <p className="font-mono text-eyebrow uppercase text-[color:var(--kete-accent)]">
              {kete.industry}
            </p>
            <h2 className="mt-2 font-display text-display-lg font-light text-[color:var(--text-primary)]">
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
      className={variant === 'rail' ? 'flex max-w-full gap-2 overflow-x-auto pb-2' : 'grid grid-cols-3 gap-2 md:grid-cols-9'}
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
                : 'min-h-[86px] py-3 md:min-h-[108px]',
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
          <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
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
              <p className="font-display text-display-md font-light tabular-nums text-[color:var(--text-primary)]">
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
