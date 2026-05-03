import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * Lenis-powered inertia smooth scroll. Mount once near the top of a route
 * to opt that route in. Honors prefers-reduced-motion (no-op).
 *
 * Scoped per-route so the rest of the site keeps native scroll until we're
 * ready to ship sitewide.
 */
export default function SmoothScroll({
  duration = 1.15,
  lerp = 0.08,
}: { duration?: number; lerp?: number }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration,
      lerp,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [duration, lerp]);

  return null;
}
