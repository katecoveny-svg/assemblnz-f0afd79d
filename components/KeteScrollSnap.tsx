'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { KETES, type Kete } from '@/lib/kete';
import { agentCountByKete } from '@/lib/agents';
import { KeteIllustration } from '@/components/KeteIllustration';

const COUNTS = agentCountByKete();

const KETE_TAGLINE: Record<string, { lead: string; body: string }> = {
  waihanga: {
    lead: 'Fewer reworked consents.',
    body:
      'Six specialist agents covering health and safety (HSWA 2015), building consents (Building Act 2004 s 14B), BIM analysis, materials, and quality assurance.',
  },
  pikau: {
    lead: 'The audit trail your broker needs.',
    body:
      'Customs declarations under Customs and Excise Act 2018, tariff classification, freight documentation. Drafted, cited, signed off before anything hits the EDI.',
  },
  manaaki: {
    lead: 'From liquor licensing to food safety.',
    body:
      'Hospitality compliance grounded in Food Act 2014, Sale and Supply of Alcohol Act 2012, and health-and-safety obligations. Compliance that does not slow your kitchen down.',
  },
  arataki: {
    lead: 'Workshop floor to fleet office.',
    body:
      'Automotive compliance — workshop safety, vehicle compliance, fleet documentation, transport regulations. Drafted to NZTA and Land Transport Act requirements.',
  },
  auaha: {
    lead: 'Brand work that is compliant by default.',
    body:
      'Creative compliance — Fair Trading Act 1986, ASA Codes, brand governance, content production. So your studio can focus on the work that requires you.',
  },
  hoko: {
    lead: 'Consumer protection on the floor.',
    body:
      'Retail compliance grounded in Consumer Guarantees Act 1993, product safety obligations, and retail employment. Coming soon.',
  },
  ako: {
    lead: 'Compliance that protects tamariki.',
    body:
      'Early childhood education compliance — Education and Training Act 2020, child safety, staff vetting, Privacy Act 2020 (IPP 3A). Coming soon.',
  },
  toro: {
    lead: 'Your family’s quiet assistant.',
    body:
      'A personal agent for household admin, school communications, appointments, family scheduling. Available self-serve at the Family plan, NZ$29/month.',
  },
};

export function KeteScrollSnap() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Track which scene is in view via IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.5) {
            const idx = Number((e.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { threshold: [0.5, 0.75] },
    );
    document.querySelectorAll('[data-kete-scene]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="snap-y snap-mandatory">
      {KETES.map((kete, i) => (
        <KeteScene
          key={kete.slug}
          kete={kete}
          index={i}
          total={KETES.length}
          isLast={i === KETES.length - 1}
        />
      ))}

      {/* Fixed side nav — dots showing which scene you're on */}
      <SceneDots activeIndex={activeIndex} ketes={KETES} />
    </div>
  );
}

function KeteScene({
  kete,
  index,
  total,
  isLast,
}: {
  kete: Kete;
  index: number;
  total: number;
  isLast: boolean;
}) {
  const copy = KETE_TAGLINE[kete.slug] ?? { lead: kete.tagline, body: '' };
  const count = COUNTS[kete.slug] ?? 0;
  const isComingSoon = kete.status === 'coming-soon' || kete.status === 'mothballed';

  return (
    <section
      data-kete-scene
      data-index={index}
      id={`scene-${kete.slug}`}
      className="relative flex min-h-screen snap-start items-center overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 30% 50%, ${kete.accent}1A 0%, transparent 55%), linear-gradient(180deg, var(--assembl-paper) 0%, ${kete.accent}08 100%)`,
      }}
    >
      {/* Scene number — top-left metadata */}
      <div className="absolute left-6 top-24 z-10 md:left-12 md:top-28">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </p>
      </div>

      <div className="container relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          {/* Text — left side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 lg:order-1"
          >
            <p
              className="font-mono text-xs uppercase tracking-[0.32em]"
              style={{ color: kete.accent }}
            >
              {kete.industry}
              {isComingSoon && ' · Coming soon'}
            </p>
            <h2
              className="mt-6 font-display leading-[0.9] tracking-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: 'clamp(3rem, 9vw, 9rem)' }}
            >
              {kete.name}
            </h2>
            <p
              className="mt-6 max-w-xl font-display text-2xl leading-snug text-[color:var(--text-body)] md:text-3xl"
              style={{ fontWeight: 300 }}
            >
              {copy.lead}
            </p>
            {copy.body && (
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                {copy.body}
              </p>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href={`/kete/${kete.slug}`}
                className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-[color:var(--text-primary)]"
              >
                <span
                  className="border-b pb-1 transition-colors duration-300 group-hover:opacity-80"
                  style={{ borderColor: kete.accent }}
                >
                  {isComingSoon ? `Register interest · ${kete.name}` : `Explore ${kete.name}`}
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  style={{ color: kete.accent }}
                  aria-hidden
                />
              </Link>

              {count > 0 && (
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: kete.accent }}
                >
                  ◆ {count} {count === 1 ? 'agent' : 'agents'}
                </span>
              )}
            </div>
          </motion.div>

          {/* Illustration — right side, very large, with halo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-1 flex justify-center lg:order-2"
          >
            {/* Soft halo behind the kete */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${kete.accent}40 0%, transparent 60%)`,
              }}
            />
            <KeteIllustration
              slug={kete.slug}
              accent={kete.accent}
              className="h-[24rem] w-auto md:h-[32rem] lg:h-[40rem]"
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll cue / footer link */}
      <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
        {!isLast ? (
          <a
            href={`#scene-${KETES[index + 1].slug}`}
            className="group flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)]"
            aria-label={`Scroll to ${KETES[index + 1].name}`}
          >
            <span>Next: {KETES[index + 1].name}</span>
            <ArrowDown
              className="h-4 w-4 animate-bounce transition-colors group-hover:text-[color:var(--text-primary)]"
              aria-hidden
            />
          </a>
        ) : (
          <Link
            href="/agents"
            className="group inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-primary)]"
          >
            <span className="border-b border-[color:var(--text-primary)] pb-1">
              Browse all agents
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        )}
      </div>
    </section>
  );
}

function SceneDots({ activeIndex, ketes }: { activeIndex: number; ketes: typeof KETES }) {
  return (
    <div className="pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
      {ketes.map((k, i) => (
        <a
          key={k.slug}
          href={`#scene-${k.slug}`}
          aria-label={`Jump to ${k.name}`}
          className="group pointer-events-auto relative flex h-7 items-center justify-end gap-3"
        >
          {/* Label appears on hover */}
          <AnimatePresence>
            <motion.span
              key={i === activeIndex ? 'active' : 'inactive'}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: i === activeIndex ? 1 : 0, x: 0 }}
              transition={{ duration: 0.3 }}
              className="font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)] group-hover:opacity-100"
            >
              {k.name}
            </motion.span>
          </AnimatePresence>
          <span
            className="block h-2 w-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === activeIndex ? k.accent : 'rgba(35,33,31,0.25)',
              transform: i === activeIndex ? 'scale(1.5)' : 'scale(1)',
            }}
          />
        </a>
      ))}
    </div>
  );
}
