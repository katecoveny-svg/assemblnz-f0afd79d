'use client';

/**
 * EvidenceVessel — interactive 3D-inspired hero/feature section.
 *
 * Visual concept: a vertical octagonal vessel rendered in layered SVG,
 * suggesting folded paper + pounamu glass + stacked evidence pages.
 * Five horizontal facets correspond to five cards. Hovering a card
 * illuminates the matching facet on the vessel.
 *
 * Stack: Next.js + Tailwind + Framer Motion. Prepared for later
 * upgrade to React Three Fiber — the <Vessel /> sub-component is
 * the seam where a <Canvas> + <Scene> would slot in. The DOM API
 * (activeFacet, onFacetEnter, onFacetLeave) stays the same.
 */

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

type FacetId = 'baseline' | 'intervention' | 'guardrails' | 'time-saved' | 'next-actions';

type Facet = {
  id: FacetId;
  number: string;
  label: string;
  body: string;
};

const FACETS: Facet[] = [
  {
    id: 'baseline',
    number: '01',
    label: 'Baseline',
    body: 'Where you stand today. We measure the workload your team carries — every report, every check, every reworked draft — before we touch anything.',
  },
  {
    id: 'intervention',
    number: '02',
    label: 'Intervention',
    body: 'The agents step in. Specialist drafts built on NZ legislation. Your team reviews; the agents do the typing.',
  },
  {
    id: 'guardrails',
    number: '03',
    label: 'Guardrails',
    body: 'Five-stage pipeline on every output. Kahu, Iho, Tā, Mahara, Mana. Nothing ships without your sign-off.',
  },
  {
    id: 'time-saved',
    number: '04',
    label: 'Time saved',
    body: 'Hours your team gets back, measured against baseline. Not a productivity claim — a calendar comparison.',
  },
  {
    id: 'next-actions',
    number: '05',
    label: 'Next actions',
    body: 'What happens next, signed and dated, sitting in your Evidence Pack. The trail you can stand behind with an auditor.',
  },
];

const COLORS = {
  paper: '#FFF7EC',
  ink: '#23211F',
  pounamu: '#3A3832',
  gold: '#C79B1F',
  mist: '#E8E4DE',
} as const;

export function EvidenceVessel() {
  const [activeFacet, setActiveFacet] = useState<FacetId | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-15%' });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: COLORS.paper }}
    >
      {/* Soft atmospheric backdrop — pounamu wash bottom-left, gold wash top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 80% 10%, rgba(199,155,31,0.08) 0%, transparent 55%), radial-gradient(ellipse at 15% 90%, rgba(58,56,50,0.07) 0%, transparent 55%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-32 md:px-10 md:py-44 lg:py-56">
        {/* Eyebrow + headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-20 max-w-3xl text-center md:mb-32"
        >
          <p
            className="font-mono text-[12px] uppercase tracking-[0.32em]"
            style={{ color: COLORS.pounamu }}
          >
            Evidence Vessel
          </p>
          <h2
            className="mt-6 font-display leading-[0.92] tracking-tight"
            style={{
              color: COLORS.ink,
              fontWeight: 300,
              fontSize: 'clamp(2.4rem, 5vw, 4.75rem)',
            }}
          >
            Five facets of every{' '}
            <em
              className="not-italic"
              style={{
                background: `linear-gradient(135deg, ${COLORS.pounamu} 0%, ${COLORS.gold} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              decision
            </em>
            .
          </h2>
          <p
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed md:text-lg"
            style={{ color: COLORS.ink, opacity: 0.7 }}
          >
            Every workflow that passes through assembl gets bound into a vessel — five facets,
            stacked like folded paper, sealed in pounamu glass.
          </p>
        </motion.div>

        {/* Vessel + Facets layout */}
        <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          {/* Vessel — left column */}
          <div className="relative flex justify-center lg:sticky lg:top-32">
            <Vessel activeFacet={activeFacet} inView={inView} />
          </div>

          {/* Facet cards — right column */}
          <ol className="space-y-5">
            {FACETS.map((facet, i) => (
              <FacetCard
                key={facet.id}
                facet={facet}
                index={i}
                inView={inView}
                isActive={activeFacet === facet.id}
                onEnter={() => setActiveFacet(facet.id)}
                onLeave={() => setActiveFacet(null)}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Vessel — SVG visual with five facets that highlight on hover
// (Seam for future React Three Fiber Canvas — same activeFacet API)
// ─────────────────────────────────────────────────────────────────────────────

function Vessel({
  activeFacet,
  inView,
}: {
  activeFacet: FacetId | null;
  inView: boolean;
}) {
  const activeIndex = FACETS.findIndex((f) => f.id === activeFacet);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-md"
      style={{ aspectRatio: '3 / 4' }}
    >
      {/* Soft glow halo behind vessel — intensifies when a facet is active */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
        animate={{
          opacity: activeFacet ? 0.5 : 0.25,
        }}
        transition={{ duration: 0.6 }}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${COLORS.pounamu}40 0%, transparent 65%)`,
        }}
      />

      <svg
        viewBox="0 0 300 400"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden
      >
        <defs>
          {/* Pounamu glass gradient — fills each facet with subtle vertical depth */}
          <linearGradient id="vessel-glass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS.pounamu} stopOpacity="0.14" />
            <stop offset="50%" stopColor={COLORS.pounamu} stopOpacity="0.22" />
            <stop offset="100%" stopColor={COLORS.pounamu} stopOpacity="0.34" />
          </linearGradient>

          {/* Highlight gradient — subtle gold edge sheen */}
          <linearGradient id="vessel-edge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.gold} stopOpacity="0" />
            <stop offset="35%" stopColor={COLORS.gold} stopOpacity="0.5" />
            <stop offset="65%" stopColor={COLORS.gold} stopOpacity="0.5" />
            <stop offset="100%" stopColor={COLORS.gold} stopOpacity="0" />
          </linearGradient>

          {/* Facet active glow — intensifies the matched facet */}
          <radialGradient id="facet-active-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.gold} stopOpacity="0.5" />
            <stop offset="60%" stopColor={COLORS.gold} stopOpacity="0.18" />
            <stop offset="100%" stopColor={COLORS.gold} stopOpacity="0" />
          </radialGradient>

          {/* Inner paper-stack pattern — visible through translucency */}
          <pattern
            id="paper-grain"
            width="22"
            height="3"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(0)"
          >
            <line
              x1="0"
              y1="1.5"
              x2="22"
              y2="1.5"
              stroke={COLORS.ink}
              strokeWidth="0.4"
              strokeOpacity="0.06"
            />
          </pattern>

          {/* Soft drop-shadow for the whole vessel */}
          <filter id="vessel-shadow" x="-30%" y="-10%" width="160%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
            <feOffset dx="0" dy="14" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.18" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* The 5 facets — stacked truncated trapezoids forming an angular vase */}
        {/* Each facet narrows slightly at top, widens at bottom — folded-paper feel */}
        {/* Y bands: 50→120 (facet 1), 120→180 (2), 180→240 (3), 240→300 (4), 300→360 (5) */}

        {[
          { y1: 50, y2: 120, leftIn: 110, leftOut: 90, rightIn: 190, rightOut: 210 },
          { y1: 120, y2: 180, leftIn: 90, leftOut: 70, rightIn: 210, rightOut: 230 },
          { y1: 180, y2: 240, leftIn: 70, leftOut: 60, rightIn: 230, rightOut: 240 },
          { y1: 240, y2: 300, leftIn: 60, leftOut: 75, rightIn: 240, rightOut: 225 },
          { y1: 300, y2: 360, leftIn: 75, leftOut: 105, rightIn: 225, rightOut: 195 },
        ].map((seg, i) => {
          const isActive = activeIndex === i;
          const path = `M ${seg.leftIn} ${seg.y1} L ${seg.rightIn} ${seg.y1} L ${seg.rightOut} ${seg.y2} L ${seg.leftOut} ${seg.y2} Z`;

          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: 0.3 + i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              filter={i === 4 ? 'url(#vessel-shadow)' : undefined}
            >
              {/* Facet body — pounamu glass */}
              <motion.path
                d={path}
                fill="url(#vessel-glass)"
                stroke={COLORS.ink}
                strokeWidth="0.5"
                strokeOpacity="0.18"
                animate={{
                  fillOpacity: isActive ? 1.4 : 1,
                }}
                transition={{ duration: 0.5 }}
              />

              {/* Inner paper-grain pattern (visible through translucency) */}
              <path d={path} fill="url(#paper-grain)" />

              {/* Active-facet glow overlay */}
              <motion.path
                d={path}
                fill="url(#facet-active-glow)"
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Top edge of facet — folded-paper highlight line */}
              <motion.line
                x1={seg.leftIn}
                y1={seg.y1}
                x2={seg.rightIn}
                y2={seg.y1}
                stroke="url(#vessel-edge)"
                strokeWidth={isActive ? 1.6 : 1}
                animate={{ opacity: isActive ? 1 : 0.65 }}
                transition={{ duration: 0.4 }}
              />

              {/* Tiny "evidence stamp" dot on each facet — gold seal */}
              <motion.circle
                cx={seg.leftIn + (seg.rightIn - seg.leftIn) * 0.78}
                cy={seg.y1 + (seg.y2 - seg.y1) * 0.5}
                r={isActive ? 3 : 2}
                fill={COLORS.gold}
                animate={{
                  scale: isActive ? 1.3 : 1,
                  opacity: isActive ? 1 : 0.55,
                }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Tiny facet number */}
              <motion.text
                x={seg.leftIn + (seg.rightIn - seg.leftIn) * 0.18}
                y={seg.y1 + (seg.y2 - seg.y1) * 0.62}
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fontWeight="500"
                fill={COLORS.ink}
                animate={{ opacity: isActive ? 0.9 : 0.35 }}
                transition={{ duration: 0.4 }}
              >
                {String(i + 1).padStart(2, '0')}
              </motion.text>
            </motion.g>
          );
        })}

        {/* Vessel neck — narrow opening at top */}
        <motion.g
          initial={{ opacity: 0, y: -10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <ellipse
            cx="150"
            cy="50"
            rx="40"
            ry="6"
            fill={COLORS.mist}
            stroke={COLORS.ink}
            strokeWidth="0.6"
            strokeOpacity="0.25"
          />
          <ellipse
            cx="150"
            cy="48"
            rx="40"
            ry="3"
            fill={COLORS.gold}
            opacity="0.35"
          />
        </motion.g>

        {/* Vessel base — closed bottom */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <ellipse
            cx="150"
            cy="362"
            rx="45"
            ry="5"
            fill={COLORS.ink}
            opacity="0.18"
          />
          <ellipse
            cx="150"
            cy="361"
            rx="45"
            ry="3"
            fill={COLORS.pounamu}
            opacity="0.6"
          />
        </motion.g>

        {/* Floating evidence marks beside the vessel — small gold stamps drifting */}
        {[
          { cx: 245, cy: 95, delay: 0 },
          { cx: 55, cy: 175, delay: 0.7 },
          { cx: 250, cy: 245, delay: 1.4 },
          { cx: 50, cy: 305, delay: 2.1 },
        ].map((m, i) => (
          <motion.g
            key={`mark-${i}`}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: [0, 1, 1, 0] } : {}}
            transition={{
              duration: 4,
              delay: 1.5 + m.delay,
              repeat: Infinity,
              repeatDelay: 1,
              ease: 'easeInOut',
            }}
          >
            <circle cx={m.cx} cy={m.cy} r="1.5" fill={COLORS.gold} />
            <circle cx={m.cx} cy={m.cy} r="4" fill={COLORS.gold} opacity="0.18" />
          </motion.g>
        ))}

        {/* Subtle reflection highlight down the centre of the vessel — folded-paper sheen */}
        <motion.line
          x1="150"
          y1="55"
          x2="150"
          y2="358"
          stroke={COLORS.paper}
          strokeWidth="1.2"
          strokeOpacity="0.4"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FacetCard — shadcn-style card with stagger entry + active state
// ─────────────────────────────────────────────────────────────────────────────

function FacetCard({
  facet,
  index,
  inView,
  isActive,
  onEnter,
  onLeave,
}: {
  facet: Facet;
  index: number;
  inView: boolean;
  isActive: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.55,
        delay: 0.4 + index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      tabIndex={0}
      className="group cursor-default rounded-2xl border p-7 transition-all duration-500 outline-none focus-visible:ring-2 md:p-9"
      style={{
        borderColor: isActive ? `${COLORS.pounamu}55` : 'rgba(35,33,31, 0.10)',
        backgroundColor: isActive ? `${COLORS.mist}` : 'rgba(255, 255, 255, 0.55)',
        boxShadow: isActive
          ? `0 24px 48px -12px ${COLORS.pounamu}22`
          : '0 1px 0 rgba(35,33,31, 0.04)',
        transform: isActive ? 'translateX(-6px)' : 'translateX(0)',
      }}
    >
      <div className="flex items-baseline gap-4">
        <span
          className="font-mono text-[12px] uppercase tracking-[0.32em]"
          style={{ color: isActive ? COLORS.pounamu : 'rgba(35,33,31, 0.45)' }}
        >
          {facet.number}
        </span>
        <span
          className="h-px flex-1 transition-all duration-500"
          style={{
            backgroundColor: isActive
              ? COLORS.pounamu
              : 'rgba(35,33,31, 0.10)',
          }}
        />
        <motion.span
          aria-hidden
          className="block h-2 w-2 rounded-full"
          animate={{
            backgroundColor: isActive ? COLORS.gold : 'rgba(35,33,31, 0.20)',
            scale: isActive ? 1.4 : 1,
          }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <h3
        className="mt-4 font-display leading-tight tracking-tight"
        style={{
          color: COLORS.ink,
          fontWeight: 300,
          fontSize: 'clamp(1.6rem, 2.6vw, 2.4rem)',
        }}
      >
        {facet.label}
      </h3>

      {/* Body copy — staggered character reveal on active */}
      <motion.p
        className="mt-3 text-base leading-relaxed md:text-lg"
        style={{ color: COLORS.ink }}
        animate={{
          opacity: isActive ? 1 : 0.65,
        }}
        transition={{ duration: 0.45 }}
      >
        {facet.body}
      </motion.p>
    </motion.li>
  );
}
