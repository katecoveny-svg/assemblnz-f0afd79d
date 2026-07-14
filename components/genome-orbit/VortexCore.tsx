'use client';

import { useEffect, useRef } from 'react';

/**
 * VortexCore — a particle vortex that spirals inward toward the Business
 * Genome. Canvas, DPR-aware, sized to its parent. Light-theme: Ming-teal
 * threads with occasional gold flecks drawn on the pearl canvas, pulled in
 * on a logarithmic spiral so the genome reads as the gravitational centre
 * everything resolves into. Reduced-motion renders a single still frame.
 *
 * Deliberately not three.js — the orbit around it is CSS, and a 2D canvas
 * keeps the whole section light. Particle state lives in refs, seeded so a
 * given mount is deterministic (no render-phase randomness).
 */

type Particle = {
  angle: number;
  radius: number; // 0..1 of the core radius
  speed: number; // angular velocity
  pull: number; // inward drift per frame
  size: number;
  gold: boolean;
  alpha: number;
};

// Small seeded PRNG so particle layout is deterministic per mount (keeps the
// component pure of render-phase Math.random and stable across re-renders).
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COUNT = 320;
const TWO_PI = Math.PI * 2;
const TAIL = 7; // spiral-arc segments per particle — reads as a swirl at rest

function seedParticles(rand: () => number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < COUNT; i += 1) {
    out.push({
      angle: rand() * TWO_PI,
      radius: 0.14 + rand() * 0.96,
      speed: 0.005 + rand() * 0.012,
      pull: 0.0016 + rand() * 0.0034,
      size: 0.6 + rand() * 2.1,
      gold: rand() > 0.84,
      alpha: 0.28 + rand() * 0.5,
    });
  }
  return out;
}

export function VortexCore({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const rand = mulberry32(0x1a2b3c4d);
    const particles = seedParticles(rand);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const cx = width / 2;
      const cy = height / 2;
      const coreR = Math.min(width, height) / 2;
      ctx.clearRect(0, 0, width, height);

      // Soft teal glow bloom at the centre — gives the vortex a luminous heart.
      const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      bloom.addColorStop(0, 'rgba(63, 115, 115, 0.3)');
      bloom.addColorStop(0.4, 'rgba(63, 115, 115, 0.1)');
      bloom.addColorStop(1, 'rgba(63, 115, 115, 0)');
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, TWO_PI);
      ctx.fill();

      ctx.lineCap = 'round';
      for (const p of particles) {
        // Draw the particle as a curved spiral arc: step backward along its
        // own logarithmic spiral (rising radius, trailing angle) so each mark
        // is a swirl, not a dot — the vortex reads even in a still frame.
        ctx.strokeStyle = p.gold
          ? `rgba(184, 150, 79, ${p.alpha * 0.7})`
          : `rgba(63, 115, 115, ${p.alpha})`;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        for (let k = 0; k <= TAIL; k += 1) {
          const proximityK = 1 - p.radius;
          const ak = p.angle - k * p.speed * (2.6 + proximityK * 3.2);
          const rk = (p.radius + k * p.pull * 4.2) * coreR;
          const px = cx + Math.cos(ak) * rk;
          const py = cy + Math.sin(ak) * rk;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // A brighter head where the particle is now.
        const hx = cx + Math.cos(p.angle) * p.radius * coreR;
        const hy = cy + Math.sin(p.angle) * p.radius * coreR;
        ctx.fillStyle = p.gold
          ? `rgba(184, 150, 79, ${Math.min(1, p.alpha + 0.2)})`
          : `rgba(63, 115, 115, ${Math.min(1, p.alpha + 0.2)})`;
        ctx.beginPath();
        ctx.arc(hx, hy, p.size * 0.72, 0, TWO_PI);
        ctx.fill();

        if (!reduced) {
          // Rotate faster and pull harder the closer to the centre — a true
          // vortex, not a flat ring. Respawn at the rim when swallowed.
          const proximity = 1 - p.radius;
          p.angle += p.speed * (1 + proximity * 2.4);
          p.radius -= p.pull * (0.5 + proximity * 1.6);
          if (p.radius < 0.08) {
            p.radius = 1.0 + rand() * 0.12;
            p.angle = rand() * TWO_PI;
          }
        }
      }

      if (!reduced) raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();

    let resizeRaf = 0;
    const onResize = () => {
      window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(() => {
        resize();
        if (reduced) draw();
      });
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.cancelAnimationFrame(resizeRaf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
