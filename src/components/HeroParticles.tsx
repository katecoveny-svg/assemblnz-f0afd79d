import { useEffect, useRef } from "react";

/**
 * Hero-section canvas with ~50 drifting star particles + slow light orbs.
 * GPU-friendly requestAnimationFrame. Disabled on prefers-reduced-motion.
 * Count drops to 10 on mobile.
 */
export default function HeroParticles({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let w = 0, h = 0;
    const isMobile = window.innerWidth < 768;

    interface Star { x: number; y: number; r: number; vx: number; vy: number; a: number; phase: number; gold: boolean }
    interface Orb { x: number; y: number; r: number; vx: number; vy: number; phase: number; speed: number }
    let stars: Star[] = [];
    let orbs: Orb[] = [];

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = rect?.width || window.innerWidth;
      h = rect?.height || 700;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    };

    const init = () => {
      const count = isMobile ? 10 : 50;
      stars = [];
      for (let i = 0; i < count; i++) {
        const isGold = Math.random() < 0.3;
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.5 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.08,
          a: 0.15 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
          gold: isGold,
        });
      }

      const orbCount = isMobile ? 2 : 4;
      orbs = [];
      for (let i = 0; i < orbCount; i++) {
        orbs.push({
          x: w * 0.2 + Math.random() * w * 0.6,
          y: h * 0.2 + Math.random() * h * 0.6,
          r: 30 + Math.random() * 50,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.06,
          phase: Math.random() * Math.PI * 2,
          speed: 0.15 + Math.random() * 0.25,
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);

      // Orbs
      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.r) orb.x = w + orb.r;
        if (orb.x > w + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = h + orb.r;
        if (orb.y > h + orb.r) orb.y = -orb.r;

        const breathe = Math.sin(t * orb.speed + orb.phase) * 0.3 + 0.7;
        const r = orb.r * (0.95 + breathe * 0.1);
        const a = 0.025 * breathe;

        const g = ctx.createRadialGradient(orb.x, orb.y, r * 0.1, orb.x, orb.y, r);
        g.addColorStop(0, `rgba(212,168,67,${a * 1.5})`);
        g.addColorStop(0.5, `rgba(255,255,255,${a * 0.5})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // Stars
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;

        const twinkle = Math.sin(t * 0.7 + s.phase) * 0.4 + 0.6;
        const alpha = s.a * twinkle;

        const r = s.gold ? 212 : 255;
        const g2 = s.gold ? 190 : 255;
        const b = s.gold ? 140 : 255;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g2},${b},${alpha})`;
        ctx.fill();

        // glow
        if (s.r > 1) {
          const gl = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
          gl.addColorStop(0, `rgba(${r},${g2},${b},${alpha * 0.25})`);
          gl.addColorStop(1, `rgba(${r},${g2},${b},0)`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
          ctx.fillStyle = gl;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  );
}
