'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TitleBlock } from '@/components/agent-app/TitleBlock';
import type { TitleBlockField } from '@/lib/agent-app/types';

export type BlueprintSceneProps = {
  sectionId: string;
  titleId: string;
  eyebrow: string;
  title: string;
  support: string;
  titleBlock: TitleBlockField[];
  caption: string;
  ariaLabel: string;
  /** SVG children with data-part / data-flat / data-assembled / data-assemble-stamp */
  children: ReactNode;
  viewBox?: string;
  gridPatternId?: string;
};

/**
 * Paper blueprint assembly canvas — Kate craft OVERRIDE.
 * Field = paper #FFFDFB. Plum #240B21 = ink/parts only.
 * Flat-lay parts (data-part + scatter attrs) scrub into plan seats.
 */
export function BlueprintScene({
  sectionId,
  titleId,
  eyebrow,
  title,
  support,
  titleBlock,
  caption,
  ariaLabel,
  children,
  viewBox = '0 0 640 420',
  gridPatternId = 'aa-eng-grid',
}: BlueprintSceneProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pin = pinRef.current;
    const sheet = sheetRef.current;
    if (!pin || !sheet) return;

    const parts = sheet.querySelectorAll<SVGElement>('[data-part]');
    const assembled = sheet.querySelectorAll<SVGElement>('[data-assembled]');
    const flat = sheet.querySelectorAll<SVGElement>('[data-flat]');

    if (reduce) {
      parts.forEach((el) => {
        el.style.transform = '';
        el.style.opacity = '1';
      });
      flat.forEach((el) => {
        el.style.opacity = '0';
      });
      assembled.forEach((el) => {
        el.style.opacity = '1';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Seed flat-lay so first paint is scattered before scrub advances.
      parts.forEach((el) => {
        gsap.set(el, {
          x: Number(el.dataset.sx ?? 0),
          y: Number(el.dataset.sy ?? 0),
          rotation: Number(el.dataset.sr ?? 0),
          transformOrigin: '50% 50%',
        });
      });
      gsap.set(assembled, { autoAlpha: 0 });
      gsap.set(flat, { autoAlpha: 1 });
      gsap.set(sheet.querySelectorAll('[data-assemble-stamp]'), { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: '+=240%',
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(flat, { autoAlpha: 0, duration: 0.2, ease: 'none' }, 0);

      parts.forEach((el, i) => {
        tl.to(
          el,
          {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.55,
            ease: 'power2.inOut',
          },
          0.06 + i * 0.07,
        );
      });

      tl.to(assembled, { autoAlpha: 1, duration: 0.3, ease: 'power1.out' }, 0.7);
      tl.to(
        sheet.querySelectorAll('[data-assemble-stamp]'),
        { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' },
        0.85,
      );
    }, pin);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      className="aa-assemble-pin"
      ref={pinRef}
      aria-labelledby={titleId}
      id={sectionId}
    >
      <div className="aa-assemble-stage">
        <div className="aa-section-head aa-assemble-head">
          <p className="aa-eyebrow aa-mono">{eyebrow}</p>
          <h2 id={titleId}>{title}</h2>
          <p>{support}</p>
        </div>

        <div className="aa-plan-sheet" ref={sheetRef} data-sheet="assemble">
          <TitleBlock fields={titleBlock} />

          <svg className="aa-plan-svg" viewBox={viewBox} role="img" aria-label={ariaLabel}>
            <defs>
              <pattern id={gridPatternId} width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#240B21"
                  strokeWidth="0.35"
                  opacity="0.08"
                />
              </pattern>
            </defs>

            <rect width="640" height="420" fill="#FFFDFB" />
            <rect width="640" height="420" fill={`url(#${gridPatternId})`} />

            {children}
          </svg>

          <p className="aa-sheet-caption aa-mono">{caption}</p>
        </div>
      </div>
    </section>
  );
}
