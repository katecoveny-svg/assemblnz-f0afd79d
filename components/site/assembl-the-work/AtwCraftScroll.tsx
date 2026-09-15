'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

/**
 * Sparse craft layer for the assembl-the-work homepage.
 * Lenis + section assemble-in. Honours prefers-reduced-motion.
 */
export function AtwCraftScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const root = document.querySelector<HTMLElement>('.atw');
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const heavyEase = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

    const lenis = new Lenis({
      duration: 1.15,
      easing: heavyEase,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.3,
      autoRaf: false,
      anchors: true,
      allowNestedScroll: true,
      prevent: (node) => {
        if (!(node instanceof HTMLElement)) return false;
        if (node.closest('[data-lenis-prevent]')) return true;
        const tag = node.tagName;
        return (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          tag === 'BUTTON' ||
          node.isContentEditable
        );
      },
    });

    lenis.on('scroll', ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const sections = root.querySelectorAll<HTMLElement>(
      '.atw-section, .atw-studio, .atw-footer',
    );

    const ctx = gsap.context(() => {
      sections.forEach((section) => {
        const targets = section.querySelectorAll<HTMLElement>(':scope > *');
        if (!targets.length) return;

        gsap.set(targets, { y: 18 });
        gsap.to(targets, {
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.07,
          overwrite: 'auto',
          scrollTrigger: {
            trigger: section,
            start: 'top 86%',
            once: true,
          },
        });
      });

      const heroCopy = root.querySelector<HTMLElement>('.atw-hero-copy');
      const hero = root.querySelector<HTMLElement>('.atw-hero');
      if (hero && heroCopy) {
        gsap.to(heroCopy, {
          y: -36,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.55,
          },
        });
      }
    }, root);

    return () => {
      ctx.revert();
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, []);

  return null;
}
