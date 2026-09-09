'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

/**
 * Homepage craft layer (PREVIEW): Lenis inertia + GSAP ScrollTrigger.
 * Elegant parallax / scrub — sparse, not noisy.
 * Honours prefers-reduced-motion.
 * Live chat phone stays interactive via data-lenis-prevent.
 */
export function CraftScroll({ rootSelector = '.cj' }: { rootSelector?: string }) {
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
      anchors: true,
      allowNestedScroll: true,
      prevent: (node) => {
        if (!(node instanceof HTMLElement)) return false;
        if (node.closest('[data-lenis-prevent], .cj-live-phone, .hg-phone, .aj-phone')) {
          return true;
        }
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
      '.cj-story > section:not(.cj-hero), .cj-footer',
    );

    const ctx = gsap.context(() => {
      sections.forEach((section) => {
        const targets = section.querySelectorAll<HTMLElement>(
          ':scope > *:not(.cj-live-phone):not([data-lenis-prevent])',
        );
        if (!targets.length) return;

        gsap.set(targets, { autoAlpha: 0, y: 36 });
        gsap.to(targets, {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
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

      // Hero: media scales gently; copy drifts slower — depth without noise.
      const hero = root.querySelector<HTMLElement>('.cj-hero');
      const heroMedia = root.querySelector<HTMLElement>('[data-cj-parallax="hero-media"]');
      const heroCopy = root.querySelector<HTMLElement>('[data-cj-parallax="hero-copy"]');

      if (hero && heroMedia) {
        gsap.fromTo(
          heroMedia,
          { y: 0, scale: 1.06 },
          {
            y: 80,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.6,
            },
          },
        );
      }

      if (hero && heroCopy) {
        gsap.to(heroCopy, {
          y: -48,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.55,
          },
        });
      }

      // Wait still rises into frame.
      const waitMedia = root.querySelector<HTMLElement>('[data-cj-parallax="wait-media"]');
      if (waitMedia) {
        gsap.fromTo(
          waitMedia,
          { y: 64 },
          {
            y: -32,
            ease: 'none',
            scrollTrigger: {
              trigger: waitMedia.closest('.cj-wait') ?? waitMedia,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.7,
            },
          },
        );
      }

      // Industry cards assemble left → right as they enter.
      root.querySelectorAll<HTMLElement>('.cj-industry').forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 28, autoAlpha: 0.35 },
          {
            y: 0,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              end: 'top 55%',
              scrub: 0.5 + index * 0.08,
            },
          },
        );
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
