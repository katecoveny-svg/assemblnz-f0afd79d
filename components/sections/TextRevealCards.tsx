'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const REVEALS = [
  {
    before: 'Generic AI',
    after: 'NZ-grounded agents',
    accent: '#2B6B57',
  },
  {
    before: 'Hallucinated citations',
    after: 'Verified Acts & Sections',
    accent: '#D4A853',
  },
  {
    before: 'Risk on autopilot',
    after: 'Draft Mode review',
    accent: '#23211F',
  },
];

export function TextRevealCards() {
  return (
    <section className="relative overflow-hidden bg-[#E8E4DE] py-32 md:py-44">
      {/* Background accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 50%, rgba(43,107,87,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(212,168,83,0.08) 0%, transparent 50%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#23211F]/60">
            The Difference
          </p>
          <h2
            className="mx-auto mt-6 max-w-3xl font-display leading-[0.95] tracking-tight text-[#23211F]"
            style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}
          >
            Not another AI tool.{' '}
            <em className="italic text-[#2B6B57]">A compliance partner.</em>
          </h2>
        </div>

        {/* Reveal cards */}
        <div className="flex flex-col gap-8 md:gap-12">
          {REVEALS.map((reveal, index) => (
            <TextRevealCard key={index} {...reveal} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TextRevealCard({
  before,
  after,
  accent,
  index,
}: {
  before: string;
  after: string;
  accent: string;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'center center'],
  });

  const revealProgress = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const beforeOpacity = useTransform(scrollYProgress, [0.3, 0.7], [1, 0.3]);
  const afterOpacity = useTransform(scrollYProgress, [0.3, 0.7], [0.3, 1]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-3xl bg-[#FAF7F2] p-8 md:p-12"
    >
      {/* Card number */}
      <span
        className="absolute right-8 top-8 font-mono text-[10px] uppercase tracking-[0.3em] md:right-12 md:top-12"
        style={{ color: `${accent}60` }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Content */}
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:gap-12">
        {/* Before text */}
        <motion.div style={{ opacity: beforeOpacity }} className="flex-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#23211F]/40">
            Before
          </p>
          <p
            className="mt-2 font-display leading-none text-[#23211F]/50 line-through decoration-[#23211F]/20"
            style={{ fontWeight: 300, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
          >
            {before}
          </p>
        </motion.div>

        {/* Arrow / divider */}
        <div className="hidden md:block">
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: `${accent}15` }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ color: accent }}
            >
              <path
                d="M4 10H16M16 10L11 5M16 10L11 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>

        {/* After text */}
        <motion.div style={{ opacity: afterOpacity }} className="flex-1">
          <p
            className="font-mono text-[9px] uppercase tracking-[0.3em]"
            style={{ color: accent }}
          >
            After
          </p>
          <p
            className="mt-2 font-display leading-none"
            style={{
              fontWeight: 300,
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              color: accent,
            }}
          >
            <em className="italic">{after}</em>
          </p>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-[#23211F]/10">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: revealProgress.get() + '%',
            background: accent,
          }}
        />
      </div>

      {/* Hover glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-40"
        style={{ background: accent }}
      />
    </motion.div>
  );
}
