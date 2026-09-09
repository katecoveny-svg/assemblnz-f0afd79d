'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

/**
 * Arc PREVIEW craft: Lenis (~1.2) + GSAP ScrollTrigger.
 * Wires scrollerProxy so pinned assemble scrub stays in sync with Lenis.
 * Assemble timeline lives here (same ticker) so pin + inertia share one clock.
 */
export function ArcCraftScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.querySelector<HTMLElement>('.arc-root');
    if (!root) return;

    if (reduce) {
      const sheet = root.querySelector<HTMLElement>('[data-sheet="assemble"]');
      if (sheet) {
        sheet.querySelectorAll<HTMLElement>('[data-flat]').forEach((el) => {
          el.style.opacity = '0';
        });
        sheet.querySelectorAll<HTMLElement>('[data-assembled], [data-assemble-stamp]').forEach((el) => {
          el.style.opacity = '1';
        });
        sheet.querySelectorAll<SVGElement>('[data-part]').forEach((el) => {
          el.style.transform = '';
        });
      }
      return;
    }

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

    // Keep ScrollTrigger measurements on the Lenis virtual scroll position.
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

    const ctx = gsap.context(() => {
      const pin = root.querySelector<HTMLElement>('.arc-assemble-pin');
      const sheet = root.querySelector<HTMLElement>('[data-sheet="assemble"]');

      if (pin && sheet) {
        const parts = sheet.querySelectorAll<SVGElement>('[data-part]');
        const assembled = sheet.querySelectorAll<SVGElement>('[data-assembled]');
        const flat = sheet.querySelectorAll<SVGElement>('[data-flat]');
        const stamp = sheet.querySelectorAll('[data-assemble-stamp]');

        // Seed scatter so first paint is flat-lay before scrub advances.
        parts.forEach((el) => {
          gsap.set(el, {
            x: Number(el.dataset.sx ?? 0),
            y: Number(el.dataset.sy ?? 0),
            rotation: Number(el.dataset.sr ?? 0),
            transformOrigin: '50% 50%',
            svgOrigin: '320 210',
          });
        });
        gsap.set(assembled, { autoAlpha: 0 });
        gsap.set(stamp, { autoAlpha: 0 });
        gsap.set(flat, { autoAlpha: 1 });

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
        tl.to(stamp, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.85);
      }

      const sections = root.querySelectorAll<HTMLElement>(
        '.arc-story > section:not(.arc-hero):not(.arc-assemble-pin), .arc-footer',
      );

      sections.forEach((section) => {
        const targets = section.querySelectorAll<HTMLElement>(':scope > *');
        if (!targets.length) return;

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            stagger: 0.07,
            overwrite: 'auto',
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: 'top 86%',
              once: true,
            },
          },
        );
      });
    }, root);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener('resize', onResize);
      ctx.revert();
      gsap.ticker.remove(ticker);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.normalizeScroll(false);
    };
  }, []);

  return null;
}
