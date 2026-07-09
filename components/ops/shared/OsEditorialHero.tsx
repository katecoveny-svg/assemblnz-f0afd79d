'use client';

import Image from 'next/image';
import type { BrandConfig } from '@/lib/brand/brand-config';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Editorial photo hero — real imagery + brand line-art wash.
 * Prefer this over cartoon R3F silhouettes for OS headers.
 * When SAM 3D splat/GLB assets land under photography, swap the still for a
 * viewer; until then photography carries the wow.
 */
export function OsEditorialHero({
  config,
  heightClass = 'h-56 md:h-72',
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

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-3xl border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.14)] ${heightClass}`}
      style={{ backgroundColor: config.colours.ink }}
      data-os-editorial-hero={config.slug}
    >
      {photo ? (
        <Image
          src={photo}
          alt={config.mascot?.alt ?? `${config.displayName} hero`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 960px"
          className="object-cover object-center"
        />
      ) : null}

      {/* brand line-art wash — HT-style pattern over the photo */}
      {pattern ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-soft-light"
          style={{
            backgroundImage: `url(${pattern})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '320px auto',
          }}
        />
      ) : null}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(105deg, ${config.colours.ink}ee 0%, ${config.colours.ink}66 42%, transparent 68%), linear-gradient(to top, ${config.colours.ink}cc 0%, transparent 45%)`,
        }}
      />

      <div className="relative z-[1] flex h-full max-w-xl flex-col justify-end gap-2 p-6 md:p-8">
        <p
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ color: config.colours.accent, fontFamily: 'var(--font-brand-mono), ui-monospace, monospace' }}
        >
          {eyebrow ?? config.taglines?.primary ?? config.displayName}
        </p>
        <h2
          className="text-3xl font-medium leading-tight md:text-4xl"
          style={{
            color: '#fff',
            fontFamily: 'var(--font-brand-display), Georgia, serif',
          }}
        >
          {title ?? config.displayName}
        </h2>
        {blurb || config.taglines?.social ? (
          <p className="max-w-md text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>
            {blurb ?? config.taglines?.social}
          </p>
        ) : null}
      </div>
    </motion.section>
  );
}
