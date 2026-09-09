'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { BlueprintStep } from '@/lib/agent-app/blueprint-craft';
import { PlanAssembling } from '@/components/agent-app/PlanAssembling';
import './blueprint-craft.css';

/**
 * Pinned step scroll — Heron behaviour, Assembl craft.
 * Sticky plan + step copy; scroll advances Observe → Advise → Act.
 * Reusable: pass any vertical's steps + optional plan slot later.
 */
export function PinnedSteps({
  eyebrow,
  title,
  steps,
  partsLabel,
}: {
  eyebrow: string;
  title: string;
  steps: readonly BlueprintStep[];
  partsLabel: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = rootRef.current;
    if (!root) return;

    if (reduce) {
      setActive(steps.length - 1);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const spacers = root.querySelectorAll<HTMLElement>('.bp-pin-spacer');
    const triggers: ScrollTrigger[] = [];

    spacers.forEach((spacer, i) => {
      const st = ScrollTrigger.create({
        trigger: spacer,
        start: 'top 70%',
        end: 'bottom 70%',
        onEnter: () => setActive(i),
        onEnterBack: () => setActive(i),
      });
      triggers.push(st);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [steps.length]);

  return (
    <section
      ref={rootRef}
      className="arc-section bp-pin-steps"
      aria-labelledby="arc-narrative-title"
      id="arc-narrative"
    >
      <div className="bp-pin-sticky">
        <div className="bp-pin-copy">
          <p className="arc-eyebrow arc-mono">{eyebrow}</p>
          <h2 id="arc-narrative-title">{title}</h2>
          <p className="bp-micro">{partsLabel}</p>
          <ol className="bp-pin-step-list">
            {steps.map((step, i) => (
              <li key={step.id}>
                <button
                  type="button"
                  data-active={active === i ? 'true' : 'false'}
                  onClick={() => setActive(i)}
                  aria-current={active === i ? 'step' : undefined}
                >
                  <span className="bp-micro">{step.label}</span>
                  <span>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <PlanAssembling activeStep={active} />
      </div>

      {/* scroll runway — each spacer advances one step while the sticky stage holds */}
      {steps.map((step) => (
        <div key={`spacer-${step.id}`} className="bp-pin-spacer" aria-hidden />
      ))}
    </section>
  );
}
