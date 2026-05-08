'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { FadeUp } from '@/components/motion/FadeUp';

export interface NarrativeCard {
  eyebrow: string;
  name?: string;
  subtitle?: string;
  body: string;
  example?: string;
}

interface StickyScrollNarrativeProps {
  cards: readonly NarrativeCard[];
  /** Content of the sticky graphic panel (left column) */
  stickyContent: React.ReactNode;
  /** aria-label for the section */
  label?: string;
}

/**
 * Stripe-style sticky-side scroll narrative.
 * LEFT: sticky graphic panel that transforms as cards scroll past.
 * RIGHT: scrolling cards, each ~100vh tall, triggering graphic state change.
 * Per Interactive Web Canon §4: GSAP ScrollTrigger pinning.
 * Mobile: stacks normally (no sticky behaviour on <768px).
 * Respects prefers-reduced-motion — all transitions disabled.
 */
export function StickyScrollNarrative({
  cards,
  stickyContent,
  label,
}: StickyScrollNarrativeProps) {
  const shouldReduce = useReducedMotion();
  const stickyRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    if (shouldReduce || typeof window === 'undefined') return;

    let ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger | null = null;
    let gsap: typeof import('gsap').gsap | null = null;

    const setup = async () => {
      const gsapMod = await import('gsap');
      const { ScrollTrigger: ST } = await import('gsap/ScrollTrigger');
      gsap = gsapMod.gsap;
      ScrollTrigger = ST;
      gsap.registerPlugin(ST);

      const container = containerRef.current;
      const cards_els = container?.querySelectorAll('[data-narrative-card]');

      if (!container || !cards_els?.length) return;

      cards_els.forEach((card, i) => {
        ST.create({
          trigger: card,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => {
            activeIndexRef.current = i;
            // Dispatch custom event for sticky panel to react
            container.dispatchEvent(
              new CustomEvent('narrative-change', { detail: { index: i } })
            );
          },
          onEnterBack: () => {
            activeIndexRef.current = i;
            container.dispatchEvent(
              new CustomEvent('narrative-change', { detail: { index: i } })
            );
          },
        });
      });
    };

    setup();

    return () => {
      ScrollTrigger?.getAll().forEach((t) => t.kill());
    };
  }, [shouldReduce]);

  if (shouldReduce) {
    // Reduced-motion: simple stacked layout
    return (
      <div className="py-16 md:py-24" aria-label={label}>
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-12">{stickyContent}</div>
          <div className="space-y-12">
            {cards.map((card, i) => (
              <NarrativeCardBlock key={i} card={card} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative py-16 md:py-24"
      aria-label={label}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Mobile: stacked */}
        <div className="block md:hidden space-y-12">
          <div className="mb-12">{stickyContent}</div>
          {cards.map((card, i) => (
            <FadeUp key={i} delay={i * 0.05}>
              <NarrativeCardBlock card={card} />
            </FadeUp>
          ))}
        </div>

        {/* Desktop: sticky + scroll */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* LEFT: sticky graphic */}
          <div
            ref={stickyRef}
            className="sticky top-24 self-start"
            style={{ height: 'calc(100vh - 6rem)' }}
            data-narrative-sticky
          >
            {stickyContent}
          </div>

          {/* RIGHT: scrolling cards */}
          <div className="space-y-0">
            {cards.map((card, i) => (
              <div
                key={i}
                data-narrative-card
                data-index={i}
                className="flex min-h-[60vh] items-center py-16"
              >
                <FadeUp>
                  <NarrativeCardBlock card={card} />
                </FadeUp>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NarrativeCardBlock({ card }: { card: NarrativeCard }) {
  return (
    <div className="max-w-lg">
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
        {card.eyebrow}
      </p>
      {card.name && (
        <h3
          className="mt-3 font-display italic leading-tight text-[color:var(--text-primary)]"
          style={{ fontWeight: 400, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}
        >
          {card.name}
          {card.subtitle && (
            <span className="not-italic text-[color:var(--text-secondary)]">
              {' '}— {card.subtitle}
            </span>
          )}
        </h3>
      )}
      <p className="mt-4 font-body text-base leading-relaxed text-[color:var(--text-body)] md:text-[1.05rem]">
        {card.body}
      </p>
      {card.example && (
        <blockquote className="mt-5 border-l-2 border-[color:var(--assembl-pounamu)] pl-4">
          <p className="font-display italic text-sm leading-relaxed text-[color:var(--assembl-pounamu-deep)] md:text-base">
            {card.example}
          </p>
        </blockquote>
      )}
    </div>
  );
}
