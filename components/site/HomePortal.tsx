'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  FileCheck2,
  ImageIcon,
  LayoutDashboard,
  MessageCircle,
  Route,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
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
    agents: 'Six construction specialists',
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
    status: 'Pilot',
    workflow: 'Consumer guarantees, product records, retail operations',
    agents: 'Retail compliance specialists',
    proof: 'Retail records ready for operator review',
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

const PRODUCT_SHORTCUTS = [
  {
    href: '/app/chat',
    icon: MessageCircle,
    title: 'Talk to an agent',
    body: 'Pick a kete, choose a specialist, ask a real question.',
    label: 'signed-in app',
    image: '/images/brand-film-still-pipeline.jpg',
  },
  {
    href: '/app/toro',
    icon: Smartphone,
    title: 'Open Tōro',
    body: 'Term Planner, Kid Money, Holiday Ideas, and the whānau navigator.',
    label: 'home screen app',
    image: '/img/kete/toro-vessel.png',
  },
  {
    href: '/app/admin/dashboard',
    icon: LayoutDashboard,
    title: 'See admin',
    body: 'Live agents, drafts, routing logs, audit rows, and operator checklist.',
    label: 'protected',
    image: '/images/golden-nodes-square.jpg',
  },
  {
    href: '/dashboard/vessel-studio',
    icon: ImageIcon,
    title: 'Update imagery',
    body: 'Generate and manage vessel, hero, and social imagery.',
    label: 'founder tool',
    image: '/images/hero-kete-totem.png',
  },
] as const;

const BACKEND_PROOF = [
  {
    icon: Route,
    title: 'Iho routes',
    body: 'Every request is assigned to a kete, specialist, and review path.',
  },
  {
    icon: Bot,
    title: 'Agents draft',
    body: 'Specialists prepare the operational work with NZ context.',
  },
  {
    icon: ShieldCheck,
    title: 'Humans approve',
    body: 'Nothing consequential ships until a named person signs off.',
  },
  {
    icon: FileCheck2,
    title: 'Records seal',
    body: 'Evidence packs keep citations, reviewer trail, and verifier proof together.',
  },
] as const;

const HERO_LINES = ['Specialist agents', 'for NZ work', 'that needs proof.'] as const;

const WORKFLOW_STEPS = ['Ask', 'Route', 'Draft', 'Review', 'Seal'] as const;

const ACTIVE_SIGNALS = [
  { label: 'request', value: 'captured' },
  { label: 'iho', value: 'routing' },
  { label: 'agent', value: 'drafting' },
  { label: 'review', value: 'ready' },
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
        <motion.div
          key={`wash-${activeKete.slug}`}
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[72vw] opacity-[0.24] md:block"
          aria-hidden
          initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
          animate={reduceMotion ? undefined : { opacity: 0.24, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={keteImagery[activeKete.slug].wide}
            alt=""
            fill
            priority
            sizes="72vw"
            className="object-cover object-center mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#FAF7F2_0%,rgba(250,247,242,0.82)_34%,rgba(250,247,242,0.28)_100%)]" />
        </motion.div>
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
                Nine kete / live agents / evidence packs
              </p>
              <motion.div
                key={`mobile-visual-${activeKete.slug}`}
                className="relative mt-5 aspect-[16/9] overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] shadow-[0_16px_42px_rgba(35,33,31,0.10)] md:hidden"
                initial={reduceMotion ? false : { opacity: 0.82, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={keteImagery[activeKete.slug].wide}
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                <motion.div
                  className="absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,rgba(250,247,242,0),rgba(250,247,242,0.46),rgba(250,247,242,0))] mix-blend-screen"
                  aria-hidden
                  initial={reduceMotion ? false : { x: '-130%' }}
                  animate={reduceMotion ? undefined : { x: '360%' }}
                  transition={{ duration: 3.4, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
                />
                <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-[rgba(250,247,242,0.88)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--text-primary)]">
                  {activeDetails.status}
                </span>
                <SignalStack reduceMotion={reduceMotion} />
              </motion.div>
              <h1
                className="mt-5 max-w-[12ch] font-display text-[2.55rem] font-light leading-[0.92] text-[color:var(--text-primary)] md:mt-7 md:max-w-4xl md:text-[clamp(3.6rem,7.4vw,7.2rem)] md:leading-[0.9]"
                aria-label="Specialist agents for NZ work that needs proof."
              >
                {HERO_LINES.map((line, index) => (
                  <span key={line} className="block overflow-hidden" aria-hidden>
                    <motion.span
                      className="block"
                      initial={reduceMotion ? false : { y: '104%', opacity: 0.6 }}
                      animate={reduceMotion ? undefined : { y: 0, opacity: 1 }}
                      transition={{
                        duration: 0.72,
                        delay: index * 0.09,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <div className="mt-4 md:hidden">
                <KeteSelector
                  ketes={ketes}
                  keteImagery={keteImagery}
                  activeSlug={activeSlug}
                  onSelect={setActiveSlug}
                  reduceMotion={reduceMotion}
                  variant="rail"
                />
              </div>
              <p className="mt-7 hidden max-w-2xl text-lg leading-[1.75] text-[color:var(--text-body)] md:block">
                Choose a kete, run one real workflow, review the draft, and leave
                with a sealed evidence pack your team can file, forward, or verify.
              </p>
              <WorkflowTrace reduceMotion={reduceMotion} compact />
              <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-8">
                <Link
                  href="/pilot-sprint"
                  className="cta-primary inline-flex h-11 w-full items-center justify-center px-7 text-sm sm:w-auto md:h-12 md:text-base"
                >
                  Book a pilot
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/evidence-pack"
                  className="btn-ghost inline-flex h-11 w-full items-center justify-center px-7 text-sm sm:w-auto md:h-12 md:text-base"
                >
                  See evidence pack
                  <FileCheck2 className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </div>
            </motion.div>

            <ProofDock stats={pearlLive} />
            <p className="text-sm leading-[1.62] text-[color:var(--text-body)] md:hidden">
              Pick a kete, ask the right specialist, approve the draft, and keep
              the sources, reviewer, and final record together.
            </p>
          </div>

          <div className="min-w-0 flex flex-col gap-4">
            <FeaturedKete
              kete={activeKete}
              details={activeDetails}
              image={keteImagery[activeKete.slug].wide}
              reduceMotion={reduceMotion}
            />
            <div className="hidden md:block">
              <KeteSelector
                ketes={ketes}
                keteImagery={keteImagery}
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
          {BACKEND_PROOF.map((item, index) => {
            const Icon = item.icon;
            return (
            <motion.div
              key={item.title}
              className="border-l border-[rgba(35,33,31,0.18)] bg-[rgba(250,247,242,0.45)] py-2 pl-4 pr-3"
              initial={reduceMotion ? false : { opacity: 0.86, y: 8 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              whileHover={reduceMotion ? undefined : { y: -4, borderColor: 'rgba(43,107,87,0.62)' }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: (index + 1) * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <Icon className="h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
              <h2 className="mt-3 font-display text-[1.65rem] font-light leading-none text-[color:var(--text-primary)]">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                {item.body}
              </p>
            </motion.div>
            );
          })}
        </div>
      </section>

      <section className="bg-[color:var(--assembl-paper)] px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--assembl-gold-thread)]">
              Open the product
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.8rem)] font-light leading-none text-[color:var(--text-primary)]">
              Use it, inspect it, improve it.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PRODUCT_SHORTCUTS.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  initial={reduceMotion ? false : { opacity: 0.86, y: 10 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  whileHover={reduceMotion ? undefined : { y: -5, scale: 1.01 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={item.href}
                    className="group grid min-h-[170px] overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/58 shadow-[0_10px_30px_rgba(35,33,31,0.05)] transition hover:border-[color:var(--assembl-pounamu)] hover:bg-white sm:grid-cols-[132px_1fr]"
                  >
                    <span className="relative min-h-[128px] overflow-hidden sm:min-h-full">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 132px, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,33,31,0.04),rgba(35,33,31,0.24))]" />
                      <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-[5px] bg-[rgba(250,247,242,0.82)] text-[color:var(--assembl-pounamu)] backdrop-blur">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                    </span>
                    <span className="p-4">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                        {item.label}
                      </span>
                      <span className="mt-2 block font-display text-2xl font-light leading-none text-[color:var(--text-primary)]">
                        {item.title}
                      </span>
                      <span className="mt-3 block text-sm leading-relaxed text-[color:var(--text-body)]">
                        {item.body}
                      </span>
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
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
      initial={reduceMotion ? false : { opacity: 0.72, y: 18, scale: 0.985 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
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
        <motion.div
          className="absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,rgba(250,247,242,0),rgba(250,247,242,0.5),rgba(250,247,242,0))] mix-blend-screen"
          aria-hidden
          initial={reduceMotion ? false : { x: '-130%' }}
          animate={reduceMotion ? undefined : { x: '360%' }}
          transition={{ duration: 3.4, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
        />
        <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-[rgba(250,247,242,0.86)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-primary)] shadow-sm">
          {details.status}
        </span>
        <SignalStack reduceMotion={reduceMotion} />
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
  keteImagery,
  activeSlug,
  onSelect,
  reduceMotion,
  variant = 'grid',
}: {
  ketes: Kete[];
  keteImagery: KeteImagery;
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
              'group overflow-hidden rounded-[8px] border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tile-accent)] focus-visible:ring-offset-2',
              variant === 'rail'
                ? 'grid min-h-[74px] min-w-[172px] grid-cols-[64px_1fr]'
                : 'min-h-[118px]',
              active
                ? 'border-[color:var(--tile-accent)] bg-white shadow-[0_8px_24px_rgba(35,33,31,0.08)]'
                : 'border-[rgba(35,33,31,0.12)] bg-white/45 hover:border-[color:var(--tile-accent)] hover:bg-white/75',
            ].join(' ')}
            aria-pressed={active}
          >
            <span
              className={
                variant === 'rail'
                  ? 'relative block min-h-full overflow-hidden'
                  : 'relative block aspect-[16/9] overflow-hidden'
              }
              aria-hidden
            >
              <Image
                src={keteImagery[kete.slug].square}
                alt=""
                fill
                sizes={variant === 'rail' ? '64px' : '(min-width: 1024px) 170px, 33vw'}
                className="object-cover transition duration-700 group-hover:scale-[1.05]"
              />
              <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,33,31,0.02),rgba(35,33,31,0.22))]" />
            </span>
            <span className={variant === 'rail' ? 'block p-3' : 'block p-3'}>
              <span className="mb-2 block h-1 w-8 rounded-full bg-[color:var(--tile-accent)]" aria-hidden />
              <span className="block font-display text-[1.12rem] font-light leading-none text-[color:var(--text-primary)] md:text-[1.28rem]">
                {kete.name}
              </span>
              <span className="mt-2 block text-[10px] leading-snug text-[color:var(--text-secondary)] md:text-[11px]">
                {kete.industry}
              </span>
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
      className="relative overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[rgba(255,255,255,0.64)] p-3 shadow-[0_12px_40px_rgba(35,33,31,0.08)] backdrop-blur-xl md:p-4"
      initial={reduceMotion ? false : { opacity: 0.9, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.span
        className="pointer-events-none absolute inset-y-0 w-24 bg-[linear-gradient(90deg,rgba(212,168,83,0),rgba(212,168,83,0.20),rgba(212,168,83,0))]"
        aria-hidden
        initial={reduceMotion ? false : { x: '-120%' }}
        animate={reduceMotion ? undefined : { x: '720%' }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'linear' }}
      />
      <div className="mb-3 flex items-center justify-between gap-4 md:mb-4">
        <div className="flex items-center gap-2">
          <motion.span
            className="h-2 w-2 rounded-full bg-[color:var(--assembl-pounamu)] shadow-[0_0_0_4px_rgba(43,107,87,0.12)]"
            aria-hidden
            animate={reduceMotion ? undefined : { scale: [1, 1.28, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
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
              <motion.p
                key={`${item.key}-${value}`}
                className="font-display text-[clamp(1.55rem,3vw,2.7rem)] font-light leading-none tabular-nums text-[color:var(--text-primary)]"
                initial={reduceMotion ? false : { opacity: 0.72, y: 6 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                {value === 0 ? '—' : value.toLocaleString('en-NZ')}
              </motion.p>
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

function WorkflowTrace({
  reduceMotion,
  compact = false,
}: {
  reduceMotion: boolean | null;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'mt-5 max-w-2xl md:mt-7' : 'mt-7 max-w-2xl'}>
      <div className="relative rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/58 px-3 py-3 shadow-[0_10px_32px_rgba(35,33,31,0.06)] backdrop-blur md:px-4">
        <div className="absolute left-7 right-7 top-[28px] h-px bg-[rgba(43,107,87,0.24)]" aria-hidden />
        <motion.div
          className="absolute top-[25px] h-[7px] w-[7px] rounded-full bg-[color:var(--assembl-gold-thread)] shadow-[0_0_0_6px_rgba(212,168,83,0.18)]"
          aria-hidden
          initial={reduceMotion ? false : { left: '26px' }}
          animate={reduceMotion ? undefined : { left: 'calc(100% - 31px)' }}
          transition={{ duration: 3.2, repeat: Infinity, repeatType: 'reverse', ease: [0.65, 0, 0.35, 1] }}
        />
        <div className="relative grid grid-cols-5 gap-2">
          {WORKFLOW_STEPS.map((step, index) => (
            <motion.div
              key={step}
              className="min-w-0 text-center"
              initial={reduceMotion ? false : { opacity: 0.72, y: 5 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.18 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="mx-auto block h-3 w-3 rounded-full border border-[rgba(43,107,87,0.34)] bg-[color:var(--assembl-paper)] shadow-[0_0_0_4px_rgba(250,247,242,0.85)]" />
              <span className="mt-3 block truncate font-mono text-[8px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)] md:text-[9px] md:tracking-[0.18em]">
                {step}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SignalStack({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div className="absolute inset-x-3 bottom-3 grid grid-cols-2 gap-2 md:grid-cols-4">
      {ACTIVE_SIGNALS.map((signal, index) => (
        <motion.div
          key={signal.label}
          className="border border-white/36 bg-[rgba(250,247,242,0.84)] px-2.5 py-2 shadow-[0_8px_22px_rgba(35,33,31,0.16)] backdrop-blur"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0.84, 1, 0.84],
                  y: [0, -4, 0],
                }
          }
          transition={{
            duration: 2.6,
            delay: index * 0.16,
            repeat: Infinity,
            repeatDelay: 1,
            ease: 'easeInOut',
          }}
        >
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
            {signal.label}
          </p>
          <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)]">
            {signal.value}
          </p>
        </motion.div>
      ))}
    </div>
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
