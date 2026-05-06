'use client';

import Link from 'next/link';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode, MouseEvent } from 'react';

/**
 * Premium portfolio card with parallax tilt, lift hover, and accent glow.
 * ~600px tall, image-dominant (60% visual), editorial typography.
 */
export function PortfolioCard({
  href,
  eyebrow,
  title,
  description,
  accent,
  visual,
  index = 0,
  bg = 'paper',
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  visual: ReactNode;
  index?: number;
  bg?: 'paper' | 'mist' | 'ink';
}) {
  // Mouse position for parallax tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring for the tilt effect
  const rotateX = useSpring(0, { stiffness: 200, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 30 });
  const scale = useSpring(1, { stiffness: 200, damping: 30 });

  // Parallax offset for image
  const imageX = useSpring(0, { stiffness: 150, damping: 25 });
  const imageY = useSpring(0, { stiffness: 150, damping: 25 });

  function handleMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;

    // Normalize to -1 to 1 range
    const normalizedX = x / (rect.width / 2);
    const normalizedY = y / (rect.height / 2);

    // Set rotation (inverted Y for natural tilt feel)
    rotateX.set(-normalizedY * 6);
    rotateY.set(normalizedX * 6);

    // Parallax image shift
    imageX.set(normalizedX * 12);
    imageY.set(normalizedY * 8);

    // Store for glow
    mouseX.set(x + rect.width / 2);
    mouseY.set(y + rect.height / 2);
  }

  function handleMouseEnter() {
    scale.set(1.02);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    imageX.set(0);
    imageY.set(0);
  }

  // Dynamic glow position
  const glowBackground = useMotionTemplate`
    radial-gradient(
      400px circle at ${mouseX}px ${mouseY}px,
      ${accent}30,
      transparent 60%
    )
  `;

  // Background and text styles based on bg prop
  const bgClass =
    bg === 'ink'
      ? 'bg-assembl-ink'
      : bg === 'mist'
        ? 'bg-assembl-mist'
        : 'bg-assembl-paper';

  const eyebrowClass =
    bg === 'ink' ? 'text-assembl-shadow' : 'text-[color:var(--text-secondary)]';
  const titleClass =
    bg === 'ink' ? 'text-assembl-paper' : 'text-[color:var(--text-primary)]';
  const descClass =
    bg === 'ink' ? 'text-assembl-shadow' : 'text-[color:var(--text-body)]';
  const borderClass =
    bg === 'ink'
      ? 'border-white/10 hover:border-white/20'
      : 'border-[rgba(35,33,31,0.08)] hover:border-[rgba(35,33,31,0.18)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
      style={{ perspective: 1200 }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className="h-full"
      >
        <Link
          href={href}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`group relative flex h-[600px] flex-col overflow-hidden rounded-[32px] border transition-shadow duration-700 ${bgClass} ${borderClass}`}
          style={{ ['--card-accent' as string]: accent }}
        >
          {/* Hover glow overlay */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: glowBackground }}
          />

          {/* Static accent glow — top corner */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-60"
            style={{ background: accent }}
          />

          {/* Visual area — 60% of card */}
          <motion.div
            className="relative flex h-[60%] items-center justify-center overflow-hidden p-8"
            style={{ x: imageX, y: imageY }}
          >
            {visual}
          </motion.div>

          {/* Text area — 40% of card */}
          <div className="relative z-20 flex flex-1 flex-col justify-between p-8 pt-0 md:p-10 md:pt-0">
            <div>
              <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${eyebrowClass}`}>
                {eyebrow}
              </p>
              <h3
                className={`mt-4 font-display leading-[0.92] tracking-tight ${titleClass}`}
                style={{ fontWeight: 300, fontSize: 'clamp(2.5rem, 4vw, 4.5rem)' }}
              >
                {title}
              </h3>
              <p className={`mt-4 max-w-sm text-base leading-relaxed ${descClass}`}>
                {description}
              </p>
            </div>

            {/* CTA row */}
            <div className="mt-6 flex items-center justify-between">
              <span
                className="font-mono text-xs uppercase tracking-[0.28em] transition-transform duration-500 group-hover:translate-x-1"
                style={{ color: bg === 'ink' ? 'var(--assembl-soft-gold)' : accent }}
              >
                Explore
              </span>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 group-hover:scale-110"
                style={{
                  borderColor: bg === 'ink' ? 'rgba(250,247,242,0.2)' : `${accent}40`,
                  background: bg === 'ink' ? 'rgba(250,247,242,0.05)' : `${accent}10`,
                }}
              >
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: bg === 'ink' ? 'var(--assembl-soft-gold)' : accent }}
                  aria-hidden
                />
              </div>
            </div>
          </div>

          {/* Bottom accent line */}
          <div
            aria-hidden
            className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-700 group-hover:w-full"
            style={{ background: accent }}
          />
        </Link>
      </motion.div>
    </motion.div>
  );
}
