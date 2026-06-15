'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * StickyScrollNarrative — Stripe-style sticky-side narrative.
 *
 * Left column: long-scroll sequence of stages (text). Each stage occupies
 * ~one viewport. The active stage updates as it crosses the viewport
 * midline.
 *
 * Right column: sticky media that swaps according to the active stage
 * index. Cross-fade between media using opacity.
 *
 * On screens < md, falls back to a stacked layout with each stage's
 * media inline beneath the text. ScrollTrigger only runs on md+.
 *
 * Honours prefers-reduced-motion (no scroll-bound animation, just
 * stacked layout).
 */
export type Stage = {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  body: string;
  example?: string;
};

export function StickyScrollNarrative({
  stages,
  media,
  accent = '#2B6B57',
  renderFrame,
  frameAspect = 'aspect-[4/5]',
}: {
  stages: readonly Stage[];
  // Optional per-stage media (image or color block). Falls back to a
  // gradient placeholder if not supplied.
  media?: ReadonlyArray<{ src?: string; alt?: string }>;
  accent?: string;
  // Custom right-column frame, indexed by active stage. When provided,
  // replaces the default cross-fading image stack.
  renderFrame?: (activeIndex: number) => ReactNode;
  frameAspect?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (!isDesktop) return;

    gsap.registerPlugin(ScrollTrigger);

    const sections = wrap.querySelectorAll<HTMLElement>('[data-stage]');
    const triggers: ScrollTrigger[] = [];

    sections.forEach((el, i) => {
      const t = ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActive(i),
        onEnterBack: () => setActive(i),
      });
      triggers.push(t);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [stages.length]);

  return (
    <div ref={wrapRef} className="relative">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] md:gap-12 xl:gap-16">
          {/* Left — long scroll text */}
          <div>
            {stages.map((stage, i) => (
              <article
                key={stage.id}
                data-stage={stage.id}
                className="flex min-h-[64vh] flex-col justify-center py-14 md:min-h-[72vh] md:py-10 xl:min-h-[76vh]"
              >
                <p
                  className="font-mono text-[11px] uppercase tracking-[0.32em]"
                  style={{ color: accent }}
                >
                  Stage {stage.number}
                  {stage.subtitle && (
                    <span className="ml-3 text-[color:var(--text-secondary)]">
                      · {stage.subtitle}
                    </span>
                  )}
                </p>
                <h3
                  className="mt-4 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
                  style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 4.2vw, 5.25rem)' }}
                >
                  {stage.title}
                </h3>
                <p className="mt-6 max-w-md text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                  {stage.body}
                </p>

                {stage.example && (
                  <div
                    className="mt-6 max-w-md border-l-2 pl-4"
                    style={{ borderColor: accent }}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                      Example
                    </p>
                    <p className="mt-1 font-display text-lg leading-snug text-[color:var(--text-primary)]">
                      {stage.example}
                    </p>
                  </div>
                )}

                {/* Mobile inline media (visible < md only) */}
                {media?.[i]?.src && (
                  <img
                    src={media[i]?.src}
                    alt={media[i]?.alt ?? ''}
                    className="mt-8 aspect-video w-full rounded-card object-cover shadow-card md:hidden"
                    loading="lazy"
                  />
                )}
              </article>
            ))}
          </div>

          {/* Right — sticky media (visible md+ only) */}
          <div className="hidden md:block">
            <div className="sticky top-24 flex h-[calc(100vh-6rem)] items-center">
              <div
                className={`relative ${frameAspect} w-full overflow-hidden rounded-card shadow-brand-soft`}
              >
                {renderFrame ? (
                  renderFrame(active)
                ) : (
                  <>
                    {/* Image stack — all 5 frames render layered, cross-fade
                        between them via opacity. NO captions on these frames
                        (captions live in a single overlay below — fixes the
                        2026-05-17 caption-stacking bug where all 5 stage
                        labels mixed at the same position). */}
                    {stages.map((stage, i) => {
                      const m = media?.[i];
                      return (
                        <div
                          key={stage.id}
                          className="absolute inset-0 transition-opacity duration-700 ease-out"
                          style={{ opacity: active === i ? 1 : 0 }}
                          aria-hidden={active !== i}
                        >
                          {m?.src ? (
                            <img
                              src={m.src}
                              alt={m.alt ?? ''}
                              className="absolute inset-0 h-full w-full object-cover"
                              loading={i === 0 ? 'eager' : 'lazy'}
                            />
                          ) : (
                            <div
                              className="absolute inset-0"
                              style={{
                                background: `linear-gradient(135deg, ${accent} 0%, #1F4F40 100%)`,
                              }}
                            />
                          )}
                          <div className="absolute inset-0 bg-[rgba(35,33,31,0.18)]" />
                        </div>
                      );
                    })}

                    {/* Single caption overlay — only the ACTIVE stage's label
                        renders. Smoothly cross-fades title on stage change. */}
                    {stages[active] && (
                      <div
                        key={stages[active].id}
                        className="absolute bottom-8 left-8 right-8 text-[#FAF7F2] transition-opacity duration-500 ease-out"
                      >
                        <p className="font-mono text-[11px] uppercase tracking-[0.32em] opacity-70">
                          {stages[active].number}
                        </p>
                        <p className="mt-2 font-display text-3xl leading-tight">
                          {stages[active].title}
                        </p>
                        {stages[active].subtitle && (
                          <p className="mt-1 font-mono text-xs uppercase tracking-[0.22em] opacity-80">
                            {stages[active].subtitle}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
