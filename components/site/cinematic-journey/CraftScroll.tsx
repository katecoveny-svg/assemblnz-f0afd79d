'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

/**
 * Homepage craft layer (PREVIEW): Lenis inertia + GSAP ScrollTrigger reveals.
 * Scoped to the cinematic home only. Honours prefers-reduced-motion.
 *
 * Lenis: duration ~1.2, heavy ease, hash anchors on.
 * Reveals: ≤40px rise, child stagger ~0.08.
 */
export function CraftScroll({ rootSelector = '.cj' }: { rootSelector?: string }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    // Heavy ease — expo-out with a long settle (Kate: duration ~1.2).
    const heavyEase = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

    const lenis = new Lenis({
      duration: 1.2,
      easing: heavyEase,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.35,
      autoRaf: false,
      // Keep #assemble / #live-wait CTAs on Lenis inertia (lenis.css disables native smooth).
      anchors: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    // Hero paints immediately; subsequent chapters rise ≤40px with stagger ~0.08.
    const sections = root.querySelectorAll<HTMLElement>(
      '.cj-story > section:not(.cj-hero), .cj-footer',
    );

    const ctx = gsap.context(() => {
      sections.forEach((section) => {
        const targets = section.querySelectorAll<HTMLElement>(':scope > *');
        if (!targets.length) return;

        // Hide first so ScrollTrigger never pops visible → hidden mid-frame.
        gsap.set(targets, { autoAlpha: 0, y: 40 });
        gsap.to(targets, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          overwrite: 'auto',
          scrollTrigger: {
            trigger: section,
            start: 'top 84%',
            once: true,
            toggleActions: 'play none none none',
          },
        });
      });
    }, root);

    return () => {
      ctx.revert();
      gsap.ticker.remove(ticker);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [rootSelector]);

  return null;
}
