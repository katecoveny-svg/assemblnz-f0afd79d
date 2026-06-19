'use client';

import { useEffect, useRef } from 'react';

/**
 * A faint woven-light particle mesh for the home hero — gold points drift and
 * link when close, and brighten near the pointer. It echoes assembl's existing
 * gold-thread / evidence-vessel motif rather than introducing a new visual
 * language.
 *
 * Purely additive and decorative: absolutely positioned, pointer-events-none,
 * aria-hidden, and fully disabled under prefers-reduced-motion (renders
 * nothing, costs nothing). Sits behind the hero content.
 */
export function HeroThreads({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let raf = 0;
    let pts: { x: number; y: number; vx: number; vy: number; r: number; tw: number }[] = [];
    const pointer = { x: -9999, y: -9999 };

    const size = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, Math.max(28, (w * h) / 26000)));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.5 + 0.5,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const frame = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.tw += 0.018;
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 140) {
            ctx.globalAlpha = (1 - dist / 140) * 0.14;
            ctx.strokeStyle = '#c9a24b';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        const near = Math.hypot(p.x - pointer.x, p.y - pointer.y) < 120;
        ctx.globalAlpha = (near ? 0.85 : 0.4) + Math.sin(p.tw) * 0.25;
        ctx.fillStyle = '#c9a24b';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    size();
    frame();
    window.addEventListener('resize', size);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerout', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
