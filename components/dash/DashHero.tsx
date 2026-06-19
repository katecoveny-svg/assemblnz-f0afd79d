'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { DashDog } from './DashDog';

/**
 * Dash home hero — recreated from `Dash Home Hero.html`.
 *
 * Three layered motion effects, all gated on reduced-motion / coarse pointer:
 *  1. A woven-light particle mesh on a <canvas> (gold points drift, link when
 *     close, twinkle).
 *  2. A 3D parallax tilt of the whole stage toward the pointer.
 *  3. The dog floats on a gold halo with a gold shine sweeping its body.
 */
export function DashHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse =
      typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    if (reduce) return;

    // ---------- woven-light particle mesh ----------
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    let raf = 0;
    let points: { x: number; y: number; vx: number; vy: number; r: number; tw: number }[] = [];

    function size() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, Math.max(34, (w * h) / 22000)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.6,
        tw: Math.random() * Math.PI * 2,
      }));
    }

    function frame() {
      if (!canvas || !ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.tw += 0.02;
      }
      // links under 150px
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            ctx.globalAlpha = (1 - dist / 150) * 0.18;
            ctx.strokeStyle = '#e0b16e';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // twinkling points
      for (const p of points) {
        ctx.globalAlpha = 0.35 + Math.sin(p.tw) * 0.3;
        ctx.fillStyle = '#e0b16e';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    size();
    frame();
    window.addEventListener('resize', size);

    // ---------- 3D parallax tilt toward pointer ----------
    const stage = stageRef.current;
    let tiltRaf = 0;
    let tx = 0;
    let ty = 0;
    function onMove(e: PointerEvent) {
      if (!stage || coarse) return;
      const r = stage.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(tiltRaf);
      tiltRaf = requestAnimationFrame(() => {
        tx = cx;
        ty = cy;
        stage.style.transform = `perspective(1100px) rotateY(${tx * 8}deg) rotateX(${-ty * 6}deg)`;
      });
    }
    function onLeave() {
      if (!stage) return;
      stage.style.transform = 'perspective(1100px) rotateY(0deg) rotateX(0deg)';
    }
    if (!coarse) {
      window.addEventListener('pointermove', onMove);
      stage?.addEventListener('pointerleave', onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(tiltRaf);
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', onMove);
      stage?.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* golden-hour radial cream backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 32% 30%, #f7f1e3 0%, #efe9da 52%, #e6dcc6 100%)',
        }}
      />
      {/* woven-light particle mesh */}
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0" />

      <div className="container relative grid min-h-[88vh] items-center gap-10 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* copy */}
        <div style={{ transform: 'translateZ(40px)' }}>
          <span className="d-pill d-pill--gold">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: '#8a6320' }}
              aria-hidden
            />
            Dash by assembl · NZ attention network
          </span>
          <h1
            className="d-display mt-6 font-semibold"
            style={{ fontSize: 'clamp(3.2rem, 9vw, 6.5rem)', lineHeight: 0.96 }}
          >
            <span className="dash-rise-word" style={{ animationDelay: '0.05s' }}>
              Get
            </span>{' '}
            <span className="dash-rise-word" style={{ animationDelay: '0.12s' }}>
              paid
            </span>
            <br />
            <span className="dash-rise-word" style={{ animationDelay: '0.2s' }}>
              to
            </span>{' '}
            <span
              className="dash-rise-word d-serif italic"
              style={{ animationDelay: '0.28s', color: 'var(--gold)' }}
            >
              wait.
            </span>
          </h1>
          <p className="d-lead mt-7 max-w-xl" style={{ color: 'var(--muted)' }}>
            Dash renders NZ-brand creative inside the seconds your app spends loading — the wait
            states — and shares the revenue with the publisher. Own the space between click and
            result.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#waitlist" className="d-btn d-btn--primary d-btn--lg">
              Join the waitlist <ArrowRight aria-hidden />
            </a>
            <a href="#how" className="d-btn d-btn--ghost d-btn--lg">
              See how it works
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t pt-6" style={{ borderColor: 'var(--line)' }}>
            {['Private by design', 'NZ data residency', 'Enterprise grade'].map((t) => (
              <li
                key={t}
                className="d-eyebrow flex items-center gap-2"
                style={{ letterSpacing: '0.16em' }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--gold)' }}
                  aria-hidden
                />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* dog stage */}
        <div ref={stageRef} className="relative" style={{ transformStyle: 'preserve-3d', transition: 'transform 0.4s var(--ease)' }}>
          <div
            className="relative mx-auto w-full max-w-[560px]"
            style={{ transform: 'translateZ(85px)' }}
          >
            {/* gold halo */}
            <div
              aria-hidden
              className="dash-halo pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(224,177,110,0.42) 0%, rgba(224,177,110,0.12) 45%, transparent 70%)',
              }}
            />
            <div className="dash-float relative overflow-hidden">
              <DashDog title="The dash dachshund — its segmented body doubles as a loading bar" />
              {/* gold shine sweep */}
              <div
                aria-hidden
                className="dash-shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
                style={{
                  background:
                    'linear-gradient(105deg, transparent, rgba(255,247,225,0.65), transparent)',
                  mixBlendMode: 'soft-light',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
