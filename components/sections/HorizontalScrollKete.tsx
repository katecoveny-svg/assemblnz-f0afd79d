'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { INDUSTRY_KETES } from '@/lib/kete';
import { KeteIllustration } from '@/components/KeteIllustration';

const KETE_IMAGES = [
  '/images/kete-card-1.jpg',
  '/images/kete-card-2.jpg',
  '/images/kete-card-3.jpg',
  '/images/kete-card-1.jpg',
  '/images/kete-card-2.jpg',
];

// Brand-aligned accent colors
const BRAND_ACCENTS = [
  '#2B6B57', // Pounamu
  '#D4A853', // Soft gold
  '#23211F', // Ink
  '#6B5843', // Parauri
  '#2B6B57', // Pounamu
];

export function HorizontalScrollKete() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Translate cards horizontally as user scrolls vertically
  const x = useTransform(scrollYProgress, [0, 1], ['5%', '-60%']);

  const ketes = INDUSTRY_KETES.slice(0, 5);

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-[#FAF7F2]">
      {/* Sticky container */}
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 px-6 pt-24 md:flex-row md:items-end md:px-12 lg:px-20">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#23211F]/60">
              Industry Kete
            </p>
            <h2
              className="mt-4 max-w-2xl font-display leading-[0.92] tracking-tight text-[#23211F]"
              style={{ fontWeight: 300, fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
            >
              Every kete bundles{' '}
              <em className="italic text-[#2B6B57]">specialist agents</em>
            </h2>
          </div>
          <Link
            href="/kete"
            className="group flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#23211F]/70 transition-colors hover:text-[#2B6B57]"
          >
            View all kete
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Horizontal scrolling cards */}
        <motion.div
          style={{ x }}
          className="mt-12 flex flex-1 items-center gap-8 px-6 md:px-12 lg:px-20"
        >
          {ketes.map((kete, index) => (
            <Link
              key={kete.slug}
              href={`/kete/${kete.slug}`}
              className="group relative flex h-[70vh] w-[380px] flex-shrink-0 flex-col overflow-hidden rounded-3xl bg-[#E8E4DE] transition-transform duration-700 hover:scale-[1.02] md:w-[420px]"
            >
              {/* Image area — 60% */}
              <div className="relative h-[60%] overflow-hidden">
                <Image
                  src={KETE_IMAGES[index]}
                  alt={`${kete.name} kete illustration`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="420px"
                />
                {/* Kete illustration overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <KeteIllustration
                    slug={kete.slug}
                    accent={BRAND_ACCENTS[index]}
                    className="h-32 w-auto drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 md:h-40"
                  />
                </div>
                {/* Gradient fade */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-24"
                  style={{
                    background: 'linear-gradient(to top, #E8E4DE 0%, transparent 100%)',
                  }}
                />
              </div>

              {/* Content area — 40% */}
              <div className="flex flex-1 flex-col justify-between p-8">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#23211F]/50">
                    {kete.industry}
                  </p>
                  <h3
                    className="mt-3 font-display text-[#23211F]"
                    style={{
                      fontWeight: 300,
                      fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                    }}
                  >
                    {kete.name}
                  </h3>
                  <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-[#23211F]/70">
                    {kete.tagline}
                  </p>
                </div>

                {/* Status badge + arrow */}
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-full px-4 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em]"
                    style={{
                      background: `${BRAND_ACCENTS[index]}15`,
                      color: BRAND_ACCENTS[index],
                    }}
                  >
                    {kete.status === 'active' ? 'Live' : 'Coming soon'}
                  </span>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 group-hover:scale-110"
                    style={{
                      borderColor: `${BRAND_ACCENTS[index]}40`,
                      background: `${BRAND_ACCENTS[index]}10`,
                    }}
                  >
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      style={{ color: BRAND_ACCENTS[index] }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom accent line */}
              <div
                aria-hidden
                className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full"
                style={{ background: BRAND_ACCENTS[index] }}
              />
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
