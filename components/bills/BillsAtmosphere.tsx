'use client';

import { useEffect, useRef } from 'react';

/**
 * The paper backdrop for assembl bills — quiet particulate silver/gold dots
 * with sparse constellation lines on warm paper, matching the master assembl
 * landscape language. Sits behind everything at z-0; pointer-events off.
 * Honours prefers-reduced-motion (static render, no rAF loop).
 */
export function BillsAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let W = 0,
      H = 0,
      raf = 0,
      t = 0;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    // assembl particulate palette: silver, warm-grey, champagne gold, pounamu, blue undertone
    const TINTS = ['181,176,162', '201,197,186', '191,163,122', '43,107,87', '141,160,184'];
    type P = { x: number; y: number; r: number; op: number; spd: number; ph: number; col: string; node: boolean };
    let dots: P[] = [];
    let links: { a: P; b: P; op: number }[] = [];

    const build = () => {
      const bg: P[] = Array.from({ length: Math.min(160, Math.round((W * H) / 14000)) }, () => ({
        x: rand(0, W), y: rand(0, H), r: rand(0.3, 1.5), op: rand(0.1, 0.6), spd: rand(0.3, 1.6), ph: rand(0, Math.PI * 2), col: '181,176,162', node: false,
      }));
      const nodes: P[] = Array.from({ length: 12 }, () => ({
        x: rand(W * 0.05, W * 0.95), y: rand(H * 0.05, H * 0.95), r: rand(1.4, 2.6), op: rand(0.5, 1), spd: rand(0.6, 1.6), ph: rand(0, Math.PI * 2), col: TINTS[Math.floor(Math.random() * TINTS.length)], node: true,
      }));
      links = [];
      const maxD = Math.min(W, H) * 0.42;
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          if (Math.hypot(dx, dy) < maxD) links.push({ a: nodes[i], b: nodes[j], op: rand(0.04, 0.14) });
        }
      dots = [...bg, ...nodes];
    };

    const resize = () => {
      W = cv.width = window.innerWidth;
      H = cv.height = Math.max(window.innerHeight, document.body.scrollHeight || 0);
      build();
    };

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;
      for (const l of links) {
        const a = l.op * (0.5 + 0.5 * Math.sin(t * 0.3 + l.a.ph));
        ctx.beginPath();
        ctx.moveTo(l.a.x, l.a.y);
        ctx.lineTo(l.b.x, l.b.y);
        ctx.strokeStyle = `rgba(${l.a.col},${a})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      for (const s of dots) {
        const bk = (Math.sin(t * s.spd + s.ph) + 1) / 2;
        const a = 0.1 + bk * s.op * 0.85;
        if (s.r > 1.2) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 7);
          g.addColorStop(0, `rgba(${s.col},${a * 0.45})`);
          g.addColorStop(1, `rgba(${s.col},0)`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 7, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * (0.65 + bk * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.col},${a})`;
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    resize();
    frame();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Soft paper washes — pounamu / gold, whisper quiet */}
      <div className="orb-b" style={{ width: 520, height: 420, top: '-8%', left: '-6%', background: 'radial-gradient(circle, rgba(43,107,87,0.07), transparent 70%)', ['--d' as string]: '17s' }} />
      <div className="orb-b" style={{ width: 460, height: 460, top: '20%', right: '-10%', background: 'radial-gradient(circle, rgba(191,163,122,0.08), transparent 70%)', ['--d' as string]: '21s', ['--del' as string]: '-4s' }} />
      <div className="orb-b" style={{ width: 380, height: 300, bottom: '-6%', left: '25%', background: 'radial-gradient(circle, rgba(141,160,184,0.06), transparent 70%)', ['--d' as string]: '25s', ['--del' as string]: '-9s' }} />
      {/* Particle field */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-60" />
      {/* Warm vignette toward the page edges */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 50% -10%, transparent 40%, rgba(247,245,238,0.7) 100%)' }} />
      <style>{`
        .orb-b { position:absolute; border-radius:50%; filter:blur(70px); animation: bills-orb var(--d,18s) ease-in-out infinite var(--del,0s); }
        @keyframes bills-orb {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(28px,-20px) scale(1.1); }
          66% { transform: translate(-16px,14px) scale(0.92); }
        }
        @media (prefers-reduced-motion: reduce){ .orb-b { animation: none; } }
      `}</style>
    </div>
  );
}
