'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const BENTO_ITEMS = [
  {
    title: 'Draft Mode',
    description: 'Every output reviewed before it ships. You stay in control.',
    image: '/images/kete-card-1.jpg',
    href: '/about',
    accent: '#2B6B57',
    span: 'col-span-2 row-span-2', // Large hero cell
  },
  {
    title: 'NZ Legislation',
    description: 'Grounded in current Acts & Sections.',
    image: '/images/kete-card-2.jpg',
    href: '/kete',
    accent: '#D4A853',
    span: 'col-span-1 row-span-1',
  },
  {
    title: 'Evidence Packs',
    description: 'Audit trails your compliance team will love.',
    image: '/images/kete-card-3.jpg',
    href: '/pricing',
    accent: '#23211F',
    span: 'col-span-1 row-span-1',
  },
  {
    title: 'Pilot Sprint',
    description: 'Two weeks. One workflow. Money-back guarantee.',
    image: '/images/atmosphere-nz.jpg',
    href: '/contact',
    accent: '#2B6B57',
    span: 'col-span-2 row-span-1', // Wide cell
  },
];

export function BentoGrid() {
  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#23211F]/60">
            How It Works
          </p>
          <h2
            className="mx-auto mt-6 max-w-3xl font-display leading-[0.95] tracking-tight text-[#23211F]"
            style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}
          >
            Built for <em className="italic text-[#2B6B57]">compliance teams</em>
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {BENTO_ITEMS.map((item, index) => (
            <BentoCard key={index} {...item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  title,
  description,
  image,
  href,
  accent,
  span,
  index,
}: {
  title: string;
  description: string;
  image: string;
  href: string;
  accent: string;
  span: string;
  index: number;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const isLarge = span.includes('col-span-2 row-span-2');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={span}
    >
      <Link
        ref={cardRef}
        href={href}
        className="group relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl bg-[#E8E4DE] md:min-h-[280px] md:rounded-3xl"
      >
        {/* Background image with parallax */}
        <motion.div
          style={{ y: imageY }}
          className="absolute inset-0"
        >
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes={isLarge ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
          />
          {/* Overlay */}
          <div
            aria-hidden
            className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-70"
            style={{
              background: `linear-gradient(to top, ${accent}ee 0%, ${accent}80 30%, transparent 70%)`,
            }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 mt-auto p-5 md:p-8">
          <h3
            className={`font-display text-[#FAF7F2] ${
              isLarge ? 'text-2xl md:text-4xl' : 'text-lg md:text-xl'
            }`}
            style={{ fontWeight: 300 }}
          >
            {title}
          </h3>
          <p
            className={`mt-2 text-[#FAF7F2]/80 ${
              isLarge ? 'text-sm md:text-base' : 'text-xs md:text-sm'
            } line-clamp-2`}
          >
            {description}
          </p>
        </div>

        {/* Arrow indicator */}
        <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF7F2]/20 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 md:right-6 md:top-6 md:h-10 md:w-10">
          <ArrowUpRight className="h-4 w-4 text-[#FAF7F2] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>

        {/* Accent border on hover */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl border-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:rounded-3xl"
          style={{ borderColor: `${accent}40` }}
        />
      </Link>
    </motion.div>
  );
}
