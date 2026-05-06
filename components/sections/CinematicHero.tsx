'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CinematicHero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#FAF7F2]"
    >
      {/* Background image with parallax */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <Image
          src="/images/auckland-golden-hour.jpg"
          alt="Auckland skyline at golden hour from Waiheke Island"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Gradient overlay for text legibility */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(250,247,242,0.7) 0%, rgba(250,247,242,0.4) 40%, rgba(250,247,242,0.85) 75%, rgba(250,247,242,1) 100%)',
          }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex min-h-screen flex-col justify-center px-6 md:px-12 lg:px-20"
      >
        <div className="mx-auto w-full max-w-[1400px]">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#23211F]/60"
          >
            Built in Aotearoa · Mārama Whenua
          </motion.p>

          {/* Massive headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-8 max-w-[1100px] font-display uppercase leading-[0.88] tracking-[-0.02em] text-[#23211F]"
            style={{
              fontWeight: 300,
              fontSize: 'clamp(3rem, 10vw, 9rem)',
            }}
          >
            Automate the{' '}
            <em className="italic text-[#2B6B57]">mundane</em>.
            <br />
            Accelerate the{' '}
            <em className="italic text-[#D4A853]">remarkable</em>.
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 max-w-2xl font-display text-xl leading-relaxed text-[#23211F]/80 md:text-2xl lg:text-3xl"
            style={{ fontWeight: 300 }}
          >
            We are quietly rewiring New Zealand businesses for a calmer, more compliant tomorrow.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-14 flex flex-col items-start gap-4 sm:flex-row"
          >
            <Link
              href="/contact"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#2B6B57] px-8 font-mono text-xs uppercase tracking-[0.2em] text-[#FAF7F2] transition-all duration-500 hover:bg-[#23211F] hover:shadow-lg"
            >
              Start your pilot
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/kete"
              className="inline-flex h-14 items-center gap-3 rounded-full border border-[#23211F]/20 px-8 font-mono text-xs uppercase tracking-[0.2em] text-[#23211F] transition-all duration-500 hover:border-[#23211F]/40 hover:bg-[#23211F]/5"
            >
              See the kete
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#23211F]/50">
            Scroll
          </span>
          <motion.span
            animate={{ scaleY: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-10 w-px bg-[#23211F]/30"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
