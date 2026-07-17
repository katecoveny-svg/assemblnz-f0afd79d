import type { Metadata } from 'next';
import Link from 'next/link';
import { AssemblHero } from '@/components/assembl-hero/AssemblHero';
import { BusinessGenomeOrbit } from '@/components/genome-orbit/BusinessGenomeOrbit';
import { BuildScroll } from '@/components/build-scroll/BuildScroll';
import { TimeSavingsCalculator } from '@/components/home/TimeSavingsCalculator';
import { BrandPlayground } from '@/components/home/BrandPlayground';
import { PatternDivider } from '@/components/pattern-studio/PatternDivider';
import { BusinessGenomeSection } from '@/components/business-genome/BusinessGenomeSection';
import { GENOME_FACTS, GENOME_SURFACES } from '@/lib/customers/auckland-dog-trainer/genome';

const REPEATABLE_VALUES = [20, 35, 50];

/** Seed the calculator from shareable URL params, clamped to safe ranges. */
function readSavingsSeed(sp: Record<string, string | string[] | undefined>) {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const clamp = (n: number, lo: number, hi: number, fallback: number) =>
    Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : fallback;
  const repeatable = Number(one(sp.repeatable));
  return {
    people: clamp(Number(one(sp.team)), 1, 25, 4),
    adminHours: clamp(Number(one(sp.admin)), 1, 20, 6),
    repeatableShare: REPEATABLE_VALUES.includes(repeatable) ? repeatable : 35,
  };
}

export const metadata: Metadata = {
  title: 'assembl — your living Business Genome',
  description:
    'assembl connects your business knowledge, people, tools and workflows into one living operating system, with specialised agents and human approval kept visible.',
  alternates: { canonical: '/' },
};

/**
 * Dashboard-first front door. The interactive workspace carries the company
 * story; the full interactive Business Genome remains available at /genome.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const seed = readSavingsSeed(await searchParams);
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#313c42' }}>
      <AssemblHero />
      <BusinessGenomeOrbit />
      <BuildScroll />

      <TimeSavingsCalculator initialValues={seed} />

      <BrandPlayground />

      <section
        aria-labelledby="agent-builder-title"
        style={{
          margin: '0 auto',
          width: 'min(1180px, calc(100% - 36px))',
          padding: 'clamp(34px, 6vw, 76px)',
          border: '1px solid rgba(49, 60, 66, 0.12)',
          borderRadius: 30,
          background: 'linear-gradient(135deg, #fbfaf6 0%, #ffffff 62%, #f3f5f3 100%)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          alignItems: 'center',
          gap: '32px 58px',
          fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
        }}
      >
        <div>
          <p style={{ margin: 0, color: '#8b7447', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Pilot · no-code agent builder
          </p>
          <h2
            id="agent-builder-title"
            style={{
              margin: '14px 0 0',
              maxWidth: 650,
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(34px, 5vw, 64px)',
              fontWeight: 400,
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
            }}
          >
            Build an agent that knows the work, the tools and where to stop.
          </h2>
          <p style={{ margin: '22px 0 0', maxWidth: 620, color: '#68766f', fontSize: 16, lineHeight: 1.65 }}>
            Pilot turns a real business workflow into a complete agent pack: role, knowledge, tools, guardrails, tests, launch plan and proof requirements. Your first build is free.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
          <Link
            href="/pilot"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '15px 22px',
              borderRadius: 999,
              background: '#313c42',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Build your agent <span aria-hidden style={{ color: '#c79b1f' }}>●</span>
          </Link>
          <Link href="/agents" style={{ color: '#53656a', fontSize: 13, textDecoration: 'none' }}>
            Or browse ready-made agents →
          </Link>
        </div>
      </section>

      <PatternDivider />
      <BusinessGenomeSection genomeFacts={GENOME_FACTS.length} surfaces={GENOME_SURFACES.length} />
    </div>
  );
}
