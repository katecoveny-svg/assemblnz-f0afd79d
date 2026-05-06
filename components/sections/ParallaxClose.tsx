'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function ParallaxClose() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Multi-layer parallax speeds
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const midY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const fgY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['20%', '-20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.8]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[120vh] overflow-hidden bg-[#FAF7F2]"
    >
      {/* Background layer — furthest back */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 -top-20"
      >
        <Image
          src="/images/atmosphere-nz.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        {/* Color overlay */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(250,247,242,0.3) 0%, rgba(250,247,242,0.6) 50%, rgba(250,247,242,0.95) 100%)',
          }}
        />
      </motion.div>

      {/* Mid layer — abstract shapes */}
      <motion.div
        style={{ y: midY }}
        className="absolute inset-0"
      >
        {/* Pounamu circle */}
        <div
          className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: '#2B6B57' }}
        />
        {/* Gold circle */}
        <div
          className="absolute right-[15%] top-[40%] h-48 w-48 rounded-full opacity-25 blur-3xl"
          style={{ background: '#D4A853' }}
        />
        {/* Ink circle */}
        <div
          className="absolute bottom-[30%] left-[30%] h-56 w-56 rounded-full opacity-15 blur-3xl"
          style={{ background: '#23211F' }}
        />
      </motion.div>

      {/* Foreground layer — floating accent elements */}
      <motion.div
        style={{ y: fgY }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Floating lines */}
        <div className="absolute left-[5%] top-[30%] h-px w-32 bg-gradient-to-r from-transparent via-[#2B6B57]/30 to-transparent" />
        <div className="absolute right-[10%] top-[50%] h-px w-48 bg-gradient-to-r from-transparent via-[#D4A853]/40 to-transparent" />
        <div className="absolute left-[20%] bottom-[40%] h-px w-24 bg-gradient-to-r from-transparent via-[#23211F]/20 to-transparent" />
      </motion.div>

      {/* Content layer */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 flex min-h-[120vh] flex-col items-center justify-center px-6 py-32 text-center"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#23211F]/60">
          Ready to start?
        </p>

        <h2
          className="mx-auto mt-8 max-w-4xl font-display leading-[0.9] tracking-tight text-[#23211F]"
          style={{ fontWeight: 300, fontSize: 'clamp(3rem, 8vw, 7rem)' }}
        >
          Two weeks.
          <br />
          <em className="italic text-[#2B6B57]">One workflow.</em>
          <br />
          <span className="text-[#D4A853]">One Evidence Pack.</span>
        </h2>

        <p className="mx-auto mt-10 max-w-xl text-base leading-relaxed text-[#23211F]/70 md:text-lg">
          NZ$5,000 + GST. Pick a workflow. We draft it end-to-end with every NZ Act and Section
          cited. If your team hasn&apos;t saved time by week two, you get your money back.
        </p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-14 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/contact"
            className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#2B6B57] px-10 font-mono text-xs uppercase tracking-[0.2em] text-[#FAF7F2] shadow-lg transition-all duration-500 hover:bg-[#23211F] hover:shadow-xl"
          >
            Book your pilot
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-14 items-center gap-3 rounded-full border border-[#23211F]/20 px-10 font-mono text-xs uppercase tracking-[0.2em] text-[#23211F] transition-all duration-500 hover:border-[#23211F]/40 hover:bg-[#23211F]/5"
          >
            See pricing
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            'Money-back guarantee',
            '100% NZ-owned',
            'Draft Mode review',
          ].map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#23211F]/50"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-[#2B6B57]" />
              {badge}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade to footer */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to top, #FAF7F2 0%, transparent 100%)',
        }}
      />
    </section>
  );
}
