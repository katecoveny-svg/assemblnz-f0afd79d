'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Kete, KeteSlug } from '@/lib/kete';
import { agentCountByKete } from '@/lib/agents';
import { useKeteAccent } from '@/components/KeteAccentContext';
import { KeteIllustration } from '@/components/KeteIllustration';

/**
 * Per-kete subtle background pattern. CSS-only, layered at low opacity.
 * Visible primarily on hover (opacity bumps from 0.06 → 0.14).
 */
const KETE_PATTERN: Record<KeteSlug, string> = {
  // Blueprint grid lines (Construction)
  waihanga:
    'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
  // Diagonal apron stripe (Hospitality)
  manaaki:
    'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)',
  // Container hatching (Freight & Customs)
  pikau:
    'repeating-linear-gradient(0deg, currentColor 0, currentColor 1px, transparent 1px, transparent 18px), repeating-linear-gradient(90deg, currentColor 0, currentColor 1px, transparent 1px, transparent 18px)',
  // Dashed road stripe diagonal (Automotive)
  arataki:
    'repeating-linear-gradient(135deg, currentColor 0, currentColor 8px, transparent 8px, transparent 20px)',
  // Dotted artist grid (Creative)
  auaha:
    'radial-gradient(circle, currentColor 1px, transparent 1.5px)',
  // Shelving grid (Retail)
  hoko:
    'repeating-linear-gradient(0deg, currentColor 0, currentColor 1px, transparent 1px, transparent 22px), repeating-linear-gradient(90deg, currentColor 0, currentColor 1px, transparent 1px, transparent 44px)',
  // Soft scribble dots (Early Childhood)
  ako:
    'radial-gradient(circle at 25% 25%, currentColor 1.5px, transparent 2px), radial-gradient(circle at 75% 75%, currentColor 1.5px, transparent 2px)',
  // Ruled exercise-book lines (Secondary Education)
  matauranga:
    'repeating-linear-gradient(0deg, currentColor 0, currentColor 1px, transparent 1px, transparent 22px)',
  // Floorplan grid (Whānau)
  toro:
    'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
};

const KETE_PATTERN_SIZE: Record<KeteSlug, string> = {
  waihanga: '24px 24px',
  manaaki: '14px 14px',
  pikau: '18px 18px',
  arataki: '20px 20px',
  auaha: '18px 18px',
  hoko: '44px 22px',
  ako: '32px 32px',
  matauranga: '22px 22px',
  toro: '32px 32px',
};

const AGENT_COUNTS = agentCountByKete();

export function KeteCard({
  kete,
  index = 0,
  featured = false,
}: {
  kete: Kete;
  index?: number;
  featured?: boolean;
}) {
  const { setAccent } = useKeteAccent();
  const agentCount = AGENT_COUNTS[kete.slug] ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="h-full"
    >
      <Link
        href={`/kete/${kete.slug}`}
        data-kete={kete.slug}
        onMouseEnter={() => setAccent(kete.accent)}
        onMouseLeave={() => setAccent(null)}
        onFocus={() => setAccent(kete.accent)}
        onBlur={() => setAccent(null)}
        className={`kete-card group relative block h-full overflow-hidden rounded-card border border-[rgba(35,33,31,0.08)] bg-white/55 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-[rgba(35,33,31,0.18)] hover:shadow-[0_24px_56px_rgba(43,107,87,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] ${
          featured ? 'p-10 md:p-14' : 'p-8 md:p-10'
        }`}
        style={{ ['--kete-accent' as string]: kete.accent }}
      >
        {/* Per-kete subtle pattern — fades up on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] transition-opacity duration-500 group-hover:opacity-[0.14]"
          style={{
            color: kete.accent,
            backgroundImage: KETE_PATTERN[kete.slug],
            backgroundSize: KETE_PATTERN_SIZE[kete.slug],
          }}
        />

        {/* Accent stripe — left edge, grows top→full on hover */}
        <span
          aria-hidden
          className="absolute left-0 top-8 h-12 w-1 rounded-r transition-all duration-500 group-hover:top-0 group-hover:h-full group-hover:w-2"
          style={{ backgroundColor: kete.accent }}
        />

        <div className={`relative ${featured ? 'grid items-center gap-8 md:grid-cols-[1fr_auto] md:gap-12' : ''}`}>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                {kete.industry}
              </span>
              <ArrowUpRight
                className="h-5 w-5 text-[color:var(--text-secondary)] transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[color:var(--text-primary)]"
                aria-hidden
              />
            </div>

            <h3
              className={`mt-5 font-display text-[color:var(--text-primary)] ${
                featured ? 'text-5xl md:text-6xl' : 'text-3xl md:text-4xl'
              }`}
            >
              {kete.name}
            </h3>

            <p
              className={`mt-4 leading-relaxed text-[color:var(--text-body)] ${
                featured ? 'text-lg md:text-xl' : 'text-base'
              }`}
            >
              {kete.tagline}
            </p>

            {featured && (
              <p className="mt-4 max-w-xl text-sm text-[color:var(--text-secondary)]">
                Live now. Every agent grounded in current NZ legislation. Click through for the
                full agent list and the legislation each one cites.
              </p>
            )}
          </div>

          {/* Per-kete illustration — featured cards show full size on the right */}
          {featured && (
            <div className="flex justify-center md:justify-end">
              <KeteIllustration
                slug={kete.slug}
                accent={kete.accent}
                className="h-44 w-auto transition-transform duration-700 group-hover:scale-[1.04] md:h-56"
              />
            </div>
          )}
        </div>

        {/* Non-featured cards: small illustration top-right */}
        {!featured && (
          <KeteIllustration
            slug={kete.slug}
            accent={kete.accent}
            className="pointer-events-none absolute right-4 top-4 h-20 w-auto opacity-60 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110"
          />
        )}

        <div className="relative">

          <div className="mt-7 flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono text-[11px] text-[color:var(--text-secondary)]">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full transition-transform duration-500 group-hover:scale-150"
                style={{ backgroundColor: kete.accent }}
              />
              {kete.accentName}
            </span>

            {/* "+ N agents" chip — appears on hover */}
            {agentCount > 0 && (
              <span
                className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  color: kete.accent,
                  borderColor: kete.accent + '55',
                  backgroundColor: kete.accent + '10',
                }}
              >
                + {agentCount} {agentCount === 1 ? 'agent' : 'agents'}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
