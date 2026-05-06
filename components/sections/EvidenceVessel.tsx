'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

// Brand colors
const PAPER = '#FAF7F2';
const INK = '#23211F';
const POUNAMU = '#2B6B57';
const SOFT_GOLD = '#D4A853';
const MIST = '#E8E4DE';

// The five evidence facets
const FACETS = [
  {
    id: 'baseline',
    label: 'Baseline',
    description: 'Current state metrics and performance benchmarks before intervention.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M3 12h4l3-9 4 18 3-9h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'intervention',
    label: 'Intervention',
    description: 'Agent actions taken, decisions made, and outputs generated.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07-2.83 2.83M9.76 14.24l-2.83 2.83m11.14 0-2.83-2.83M9.76 9.76 6.93 6.93" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'guardrails',
    label: 'Guardrails',
    description: 'Compliance checks, boundary validations, and safety confirmations.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M12 2 4 6v6c0 5.25 3.4 10.15 8 11.25 4.6-1.1 8-6 8-11.25V6l-8-4Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'time-saved',
    label: 'Time saved',
    description: 'Measured efficiency gains and hours returned to your team.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'next-actions',
    label: 'Next actions',
    description: 'Recommended follow-ups and suggested improvements based on outcomes.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M5 12h14m-4-4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// Vessel layer positions for the 5 facets
const LAYER_TRANSFORMS = [
  { rotateX: -8, rotateY: 12, z: 0, y: 0 },
  { rotateX: -4, rotateY: 8, z: 20, y: -15 },
  { rotateX: 0, rotateY: 4, z: 40, y: -30 },
  { rotateX: 4, rotateY: 0, z: 60, y: -45 },
  { rotateX: 8, rotateY: -4, z: 80, y: -60 },
];

export function EvidenceVessel() {
  const [activeFacet, setActiveFacet] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden py-32 lg:py-40"
      style={{ backgroundColor: PAPER }}
    >
      {/* Background accent */}
      <div
        className="absolute right-0 top-1/4 h-[600px] w-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: `radial-gradient(circle, ${POUNAMU}40, transparent 70%)` }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 max-w-2xl"
        >
          <span
            className="mb-4 block font-mono text-xs uppercase tracking-[0.3em]"
            style={{ color: POUNAMU }}
          >
            Transparent AI
          </span>
          <h2
            className="mb-6 font-display leading-[0.95]"
            style={{
              color: INK,
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 300,
            }}
          >
            Every output,{' '}
            <span className="italic" style={{ color: POUNAMU }}>
              fully evidenced
            </span>
          </h2>
          <p
            className="max-w-xl text-lg leading-relaxed"
            style={{ color: INK, opacity: 0.7 }}
          >
            Each agent action is wrapped in a vessel of evidence. Hover to explore the five facets that make AI decisions auditable, defensible, and trustworthy.
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Vessel visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
            style={{ perspective: '1200px' }}
          >
            <div
              className="relative h-[400px] w-[320px] lg:h-[500px] lg:w-[400px]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Five layered vessel planes */}
              {FACETS.map((facet, index) => {
                const isActive = activeFacet === facet.id;
                const transform = LAYER_TRANSFORMS[index];
                const layerColors = [MIST, PAPER, MIST, PAPER, MIST];
                const accentColors = [POUNAMU, SOFT_GOLD, POUNAMU, SOFT_GOLD, POUNAMU];

                return (
                  <motion.div
                    key={facet.id}
                    className="absolute inset-0 cursor-pointer rounded-3xl border"
                    style={{
                      backgroundColor: layerColors[index],
                      borderColor: isActive ? accentColors[index] : `${INK}15`,
                      boxShadow: isActive
                        ? `0 25px 50px -12px ${accentColors[index]}30, 0 0 0 1px ${accentColors[index]}50`
                        : `0 25px 50px -12px ${INK}10`,
                    }}
                    initial={{
                      rotateX: transform.rotateX,
                      rotateY: transform.rotateY,
                      z: transform.z,
                      y: transform.y,
                    }}
                    animate={{
                      rotateX: isActive ? 0 : transform.rotateX,
                      rotateY: isActive ? 0 : transform.rotateY,
                      z: isActive ? 120 : transform.z,
                      y: isActive ? -80 : transform.y,
                      scale: isActive ? 1.05 : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    onMouseEnter={() => setActiveFacet(facet.id)}
                    onMouseLeave={() => setActiveFacet(null)}
                  >
                    {/* Layer content */}
                    <div className="flex h-full flex-col items-center justify-center p-8">
                      <motion.div
                        className="mb-4 rounded-full p-3"
                        style={{
                          backgroundColor: isActive ? accentColors[index] : `${INK}08`,
                          color: isActive ? PAPER : INK,
                        }}
                        animate={{ scale: isActive ? 1.1 : 1 }}
                      >
                        {facet.icon}
                      </motion.div>
                      <span
                        className="font-mono text-xs uppercase tracking-[0.2em]"
                        style={{ color: isActive ? accentColors[index] : INK, opacity: isActive ? 1 : 0.5 }}
                      >
                        {facet.label}
                      </span>
                    </div>

                    {/* Folded corner effect */}
                    <div
                      className="absolute right-0 top-0 h-12 w-12 rounded-bl-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${PAPER} 50%, ${isActive ? accentColors[index] : MIST} 50%)`,
                      }}
                    />
                  </motion.div>
                );
              })}

              {/* Central vessel core — pounamu glass effect */}
              <div
                className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${POUNAMU}60, ${POUNAMU}20)`,
                  boxShadow: `
                    inset 0 0 40px ${PAPER}30,
                    0 0 60px ${POUNAMU}20
                  `,
                  backdropFilter: 'blur(8px)',
                }}
              />
            </div>
          </motion.div>

          {/* Facet cards */}
          <div className="flex flex-col justify-center space-y-4">
            {FACETS.map((facet, index) => {
              const isActive = activeFacet === facet.id;
              const accentColor = index % 2 === 0 ? POUNAMU : SOFT_GOLD;

              return (
                <motion.div
                  key={facet.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group cursor-pointer rounded-2xl border p-6 transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? `${accentColor}08` : 'rgba(255,255,255,0.6)',
                    borderColor: isActive ? `${accentColor}40` : `${INK}10`,
                    boxShadow: isActive
                      ? `0 8px 30px ${accentColor}15`
                      : '0 4px 20px rgba(35,33,31,0.04)',
                  }}
                  onMouseEnter={() => setActiveFacet(facet.id)}
                  onMouseLeave={() => setActiveFacet(null)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors duration-300"
                      style={{
                        backgroundColor: isActive ? accentColor : `${INK}08`,
                        color: isActive ? PAPER : INK,
                      }}
                    >
                      {facet.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3
                        className="mb-1 font-display text-xl transition-colors duration-300"
                        style={{
                          color: isActive ? accentColor : INK,
                          fontWeight: 400,
                        }}
                      >
                        {facet.label}
                      </h3>
                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm leading-relaxed"
                            style={{ color: INK, opacity: 0.7 }}
                          >
                            {facet.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Expand indicator */}
                    <motion.div
                      className="flex-shrink-0"
                      animate={{ rotate: isActive ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={isActive ? accentColor : INK}
                        strokeWidth="1.5"
                        className="h-5 w-5 opacity-40"
                      >
                        <path d="M12 5v14m-7-7h14" strokeLinecap="round" />
                      </svg>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 text-center"
        >
          <p
            className="mb-6 font-display text-2xl italic"
            style={{ color: INK, fontWeight: 300 }}
          >
            No black boxes. Every decision, defensible.
          </p>
          <button
            className="cta-primary px-8 py-4 text-sm font-medium tracking-wide"
            style={{ fontSize: '0.875rem' }}
          >
            See a live evidence trace
          </button>
        </motion.div>
      </div>
    </section>
  );
}
