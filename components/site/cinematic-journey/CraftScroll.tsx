'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

/**
 * Homepage craft layer (PREVIEW): Lenis inertia + GSAP ScrollTrigger.
 * - Section reveals (≤40px rise, stagger ~0.08)
 * - Scroll-scrubbed parallax on media / beat markers / atmosphere depth
 * Honours prefers-reduced-motion.
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
        const targets = section.querySelectorAll<HTMLElement>(':scope > *');
        if (!targets.length) return;

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: 40 },
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

      // Hero copy drifts slower than the stage — depth without flash.
      const heroCopy = root.querySelector<HTMLElement>('.cj-hero-copy');
      if (heroCopy) {
        gsap.to(heroCopy, {
          y: -56,
          ease: 'none',
          scrollTrigger: {
            trigger: root.querySelector('.cj-hero'),
            start: 'top top',
            end: 'bottom top',
            scrub: 0.55,
          },
        });
      }

      // Beat markers dock in as each beat scrolls through.
      root.querySelectorAll<HTMLElement>('.cj-beat').forEach((beat) => {
        const marker = beat.querySelector<HTMLElement>('.cj-beat-marker');
        const media = beat.querySelector<HTMLElement>('.cj-media');
        if (marker) {
          gsap.fromTo(
            marker,
            { scale: 0.72, autoAlpha: 0.35, rotate: -8 },
            {
              scale: 1,
              autoAlpha: 1,
              rotate: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: beat,
                start: 'top 75%',
                end: 'center 45%',
                scrub: 0.65,
              },
            },
          );
        }
        if (media) {
          gsap.fromTo(
            media,
            { y: 48, scale: 0.96 },
            {
              y: -24,
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: beat,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.7,
              },
            },
          );
        }
      });

      // Inline assemble media scrub (video slot / still B).
      const assembleMedia = root.querySelector<HTMLElement>('.cj-assemble-media');
      if (assembleMedia) {
        gsap.fromTo(
          assembleMedia,
          { y: 80, autoAlpha: 0.4 },
          {
            y: -40,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: root.querySelector('#assemble'),
              start: 'top 90%',
              end: 'bottom 20%',
              scrub: 0.75,
            },
          },
        );
      }

      // Proof fold opens as a slight horizontal slide — assembly, not bounce.
      const fold = root.querySelector<HTMLElement>('.cj-proof-fold');
      if (fold) {
        gsap.fromTo(
          fold.querySelectorAll('.cj-proof-face'),
          { x: (i: number) => (i === 0 ? -36 : 36), autoAlpha: 0.4 },
          {
            x: 0,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: fold,
              start: 'top 80%',
              end: 'top 40%',
              scrub: 0.6,
            },
          },
        );
      }
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
