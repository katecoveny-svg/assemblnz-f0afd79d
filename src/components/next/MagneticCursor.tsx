import { useEffect, useRef, useState } from "react";

/**
 * Custom cursor that magnetises to elements with [data-magnetic].
 * Hidden on touch / coarse pointers and on prefers-reduced-motion.
 *
 * The cursor is two layered dots: a sharp inner pixel and a soft trailing ring
 * that lags slightly for filmic motion.
 */
export default function MagneticCursor({
  color = "#3A7D6E",
  ringSize = 36,
  dotSize = 6,
}: { color?: string; ringSize?: number; dotSize?: number }) {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let dx = mx, dy = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;

      const target = (e.target as HTMLElement | null)?.closest?.("[data-magnetic]") as HTMLElement | null;
      if (target) {
        const r = target.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Pull toward magnet center
        mx = cx + (e.clientX - cx) * 0.35;
        my = cy + (e.clientY - cy) * 0.35;
        setHover(true);
      } else {
        setHover(false);
      }
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dx += (mx - dx) * 0.55;
      dy += (my - dy) * 0.55;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx - ringSize / 2}px, ${ry - ringSize / 2}px, 0)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dx - dotSize / 2}px, ${dy - dotSize / 2}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [ringSize, dotSize]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          border: `1px solid ${color}55`,
          background: hover ? `${color}10` : "transparent",
          pointerEvents: "none",
          zIndex: 9998,
          mixBlendMode: "multiply",
          transition: "width 220ms ease, height 220ms ease, background 200ms ease, border-color 200ms ease",
          willChange: "transform",
          transform: `scale(${hover ? 1.6 : 1})`,
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: color,
          pointerEvents: "none",
          zIndex: 9999,
          opacity: hover ? 0 : 0.85,
          transition: "opacity 200ms ease",
          willChange: "transform",
        }}
      />
    </>
  );
}
