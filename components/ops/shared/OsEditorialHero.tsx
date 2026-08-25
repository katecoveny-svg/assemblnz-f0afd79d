'use client';

import Image from 'next/image';
import type { BrandConfig } from '@/lib/brand/brand-config';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Editorial brand-board hero — light surface, visible hand-drawn line-art
 * pattern, display type on the left, studio photography panel on the right.
 * Mirrors the Happy Tails brand-board direction (pattern + studio portrait on
 * a flat pastel field) and recolours per brand via `config.colours`.
 * When SAM 3D splat/GLB assets land under `photography`, the still swaps for
 * a viewer; until then photography carries the wow.
 */
export function OsEditorialHero({
  config,
  heightClass = 'min-h-56 md:min-h-72',
  eyebrow,
  title,
  blurb,
}: {
  config: BrandConfig;
  heightClass?: string;
  eyebrow?: string;
  title?: string;
  blurb?: string;
}) {
  const reduce = useReducedMotion();
  const photo = config.photography?.anchor;
  const pattern = config.patterns?.primary;
  const { ink, bg, accent, muted } = config.colours;

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-3xl border shadow-[0_24px_60px_rgba(0,0,0,0.1)] ${heightClass}`}
      style={{ backgroundColor: bg, borderColor: `${ink}1f` }}
      data-os-editorial-hero={config.slug}
    >
      {/* hand-drawn line-art pattern — clearly visible, multiply keeps white
          tile backgrounds invisible so only the ink lines show */}
      {pattern ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${pattern})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '300px auto',
            opacity: 0.24,
            mixBlendMode: 'multiply',
          }}
        />
      ) : null}

      <div className="relative z-[1] flex h-full flex-col md:flex-row md:items-stretch">
        {/* type panel */}
        <div className="flex flex-1 flex-col justify-center gap-3 p-6 md:p-9">
          <p
            className="text-[12px] uppercase tracking-[0.2em]"
            style={{
              color: accent,
              fontFamily: 'var(--font-brand-mono), ui-monospace, monospace',
            }}
          >
            {eyebrow ?? config.taglines?.primary ?? config.displayName}
          </p>
          <h2
            className="text-3xl font-semibold leading-[1.05] md:text-5xl"
            style={{
              color: ink,
              fontFamily: 'var(--font-brand-display), Georgia, serif',
            }}
          >
            {title ?? config.displayName}
          </h2>
          {blurb || config.taglines?.social ? (
            <p className="max-w-md text-sm leading-relaxed md:text-[15px]" style={{ color: muted }}>
              {blurb ?? config.taglines?.social}
            </p>
          ) : null}
          {config.ctaLabel ? (
            <span
              className="mt-1 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em]"
              style={{ backgroundColor: ink, color: bg }}
            >
              {config.ctaLabel}
            </span>
          ) : null}
        </div>

        {/* studio photo panel */}
        {photo ? (
          <div className="relative m-4 h-48 shrink-0 overflow-hidden rounded-2xl border md:m-5 md:h-auto md:w-[44%]"
            style={{ borderColor: `${ink}14`, backgroundColor: bg }}
          >
            <Image
              src={photo}
              alt={config.mascot?.alt ?? `${config.displayName} hero`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover object-center"
            />
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}
