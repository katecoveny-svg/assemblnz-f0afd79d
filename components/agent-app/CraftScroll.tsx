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
 * Shared agent-app PREVIEW craft: Lenis (~1.2) + GSAP reveals + light parallax.
 * ScrollTrigger.scrollerProxy keeps BlueprintScene pin/scrub in sync with Lenis.
 * Paper field + plum accent only — see `lib/agent-app/craft-canon.ts`.
 */
export function CraftScroll({
  rootSelector = '.aa-root',
  revealSelector = '.aa-story > section:not(.aa-hero):not(.aa-assemble-pin), .aa-footer',
}: CraftScrollProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root) return;

    // App links can arrive before the streamed story and its pinned scenes settle.
    // Align after layout, using the same scroll controller as the story.
    let scrollToTarget = (top: number) => window.scrollTo({ top, behavior: 'instant' });
    let anchorFrame = 0;
    let disposed = false;
    let userMoved = false;
    const alignHash = () => {
      if (disposed || userMoved || !window.location.hash) return;
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const target = id === 'top' ? root : document.getElementById(id);
      if (!target || !root.contains(target)) return;
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop);
      const offset = margin || (root.querySelector('header')?.getBoundingClientRect().height ?? 0) + 20;
      scrollToTarget(Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset));
    };
    const scheduleHash = () => {
      cancelAnimationFrame(anchorFrame);
      anchorFrame = requestAnimationFrame(() => {
        anchorFrame = requestAnimationFrame(alignHash);
      });
    };
    const newHash = () => { userMoved = false; scheduleHash(); };
    const stopAligning = () => { userMoved = true; cancelAnimationFrame(anchorFrame); };
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) stopAligning();
    };
    window.addEventListener('hashchange', newHash);
    window.addEventListener('load', scheduleHash);
    window.addEventListener('wheel', stopAligning, { passive: true });
    window.addEventListener('touchstart', stopAligning, { passive: true });
    window.addEventListener('keydown', onKey);
    void document.fonts.ready.then(() => { if (!disposed) scheduleHash(); });
    scheduleHash();
    const cleanupHash = () => {
      disposed = true;
      cancelAnimationFrame(anchorFrame);
      window.removeEventListener('hashchange', newHash);
      window.removeEventListener('load', scheduleHash);
      window.removeEventListener('wheel', stopAligning);
      window.removeEventListener('touchstart', stopAligning);
      window.removeEventListener('keydown', onKey);
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return cleanupHash;

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
    scrollToTarget = (top) => lenis.scrollTo(top, { immediate: true });

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

      // Light parallax — hero title-block drifts slower than scroll (still camera).
      const heroSheet = root.querySelector<HTMLElement>('.aa-hero-sheet');
      if (heroSheet) {
        gsap.fromTo(
          heroSheet,
          { y: 28 },
          {
            y: -18,
            ease: 'none',
            scrollTrigger: {
              trigger: root.querySelector('.aa-hero') ?? heroSheet,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
            },
          },
        );
      }

      // Plan sheets (non-pin) ease upward slightly as they enter — depth, not bounce.
      root.querySelectorAll<HTMLElement>('.aa-plan-sheet:not(.aa-plan-interactive)').forEach((sheet) => {
        gsap.fromTo(
          sheet,
          { y: 40 },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: sheet,
              start: 'top 92%',
              end: 'top 48%',
              scrub: 0.7,
            },
          },
        );
      });
    }, root);

    return () => {
      cleanupHash();
      window.removeEventListener('load', refresh);
      window.removeEventListener('resize', refresh);
      ctx.revert();
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, [rootSelector, revealSelector]);

  return null;
}
