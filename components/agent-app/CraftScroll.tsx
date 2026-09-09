'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

type CraftScrollProps = {
  /** Root selector scoped for Lenis + section reveals. Default `.aa-root`. */
  rootSelector?: string;
  /** Extra section selectors to reveal (beyond story children). */
  revealSelector?: string;
};

/**
 * Shared agent-app PREVIEW craft: Lenis (~1.2) + GSAP section reveals.
 * Wires ScrollTrigger.scrollerProxy so BlueprintScene pin/scrub advances
 * under Lenis. Assemble timeline stays in BlueprintScene.
 */
export function CraftScroll({
  rootSelector = '.aa-root',
  revealSelector = '.aa-story > section:not(.aa-hero):not(.aa-assemble-pin), .aa-footer',
}: CraftScrollProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const heavyEase = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

    const lenis = new Lenis({
      duration: 1.2,
      easing: heavyEase,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.35,
      autoRaf: false,
    });

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length && typeof value === 'number') {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
    });

    lenis.on('scroll', ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(refresh);
    window.addEventListener('load', refresh);
    window.addEventListener('resize', refresh);

    const sections = root.querySelectorAll<HTMLElement>(revealSelector);

    const ctx = gsap.context(() => {
      sections.forEach((section) => {
        const targets = section.querySelectorAll<HTMLElement>(':scope > *');
        if (!targets.length) return;

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.08,
            overwrite: 'auto',
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: 'top 84%',
              once: true,
              toggleActions: 'play none none none',
            },
          },
        );
      });
    }, root);

    return () => {
      window.removeEventListener('load', refresh);
      window.removeEventListener('resize', refresh);
      ctx.revert();
      gsap.ticker.remove(ticker);
      lenis.destroy();
      // Do not kill BlueprintScene pin triggers here — they own their own context.
    };
  }, [rootSelector, revealSelector]);

  return null;
}
