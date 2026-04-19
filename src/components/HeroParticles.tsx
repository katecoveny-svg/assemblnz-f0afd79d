import { useEffect, useRef } from "react";

/**
 * Hero-section canvas — PHOTON-inspired with flowing energy streams,
 * star particles with motion trails, and dramatic bloom glow.
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

    interface Star {
      x: number; y: number; r: number; vx: number; vy: number;
      a: number; phase: number; gold: boolean;
      trail: { x: number; y: number }[];
    }
    interface Orb {
      x: number; y: number; r: number; vx: number; vy: number;
      phase: number; speed: number; color: string;
    }
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
      const count = isMobile ? 15 : 60;
      stars = [];
      for (let i = 0; i < count; i++) {
        const isGold = Math.random() < 0.3;
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.5 + Math.random() * 2.2,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.1,
          a: 0.15 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2,
          gold: isGold,
          trail: [],
        });
      }

      const orbCount = isMobile ? 3 : 5;
      orbs = [];
      const colors = ["#4AA5A8", "#3A7D6E", "#5AADA0", "#A8DDDB", "#7ECFC2"];
      for (let i = 0; i < orbCount; i++) {
        orbs.push({
          x: w * 0.2 + Math.random() * w * 0.6,
          y: h * 0.2 + Math.random() * h * 0.6,
          r: 35 + Math.random() * 60,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.08,
          phase: Math.random() * Math.PI * 2,
          speed: 0.15 + Math.random() * 0.25,
          color: colors[i % colors.length],
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);

      // Orbs with bloom
      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.r) orb.x = w + orb.r;
        if (orb.x > w + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = h + orb.r;
        if (orb.y > h + orb.r) orb.y = -orb.r;

        const breathe = Math.sin(t * orb.speed + orb.phase) * 0.3 + 0.7;
        const r = orb.r * (0.95 + breathe * 0.1);
        const a = 0.04 * breathe;

        const hex = orb.color;
        const cr = parseInt(hex.slice(1, 3), 16);
        const cg = parseInt(hex.slice(3, 5), 16);
        const cb = parseInt(hex.slice(5, 7), 16);

        // Outer bloom
        const g2 = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 1.6);
        g2.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 1.2})`);
        g2.addColorStop(0.3, `rgba(${cr},${cg},${cb},${a * 0.5})`);
        g2.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = g2;
        ctx.fill();

        // Core
        const g = ctx.createRadialGradient(orb.x, orb.y, r * 0.1, orb.x, orb.y, r);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 2})`);
        g.addColorStop(0.5, `rgba(255,255,255,${a * 0.4})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // Stars with trails
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;

        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > 10) s.trail.shift();

        const twinkle = Math.sin(t * 0.7 + s.phase) * 0.4 + 0.6;
        const alpha = s.a * twinkle;

        const r = s.gold ? 212 : 255;
        const g2 = s.gold ? 190 : 255;
        const b = s.gold ? 140 : 255;

        // Trail
        if (s.trail.length > 2 && s.r > 1) {
          for (let i = 0; i < s.trail.length - 1; i++) {
            const trailAlpha = (i / s.trail.length) * alpha * 0.25;
            ctx.beginPath();
            ctx.moveTo(s.trail[i].x, s.trail[i].y);
            ctx.lineTo(s.trail[i + 1].x, s.trail[i + 1].y);
            ctx.strokeStyle = `rgba(${r},${g2},${b},${trailAlpha})`;
            ctx.lineWidth = s.r * 0.4 * (i / s.trail.length);
            ctx.stroke();
          }
        }

        // Core
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g2},${b},${alpha})`;
        ctx.fill();

        // Bloom glow
        if (s.r > 0.8) {
          const gl = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 7);
          gl.addColorStop(0, `rgba(${r},${g2},${b},${alpha * 0.3})`);
          gl.addColorStop(1, `rgba(${r},${g2},${b},0)`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 7, 0, Math.PI * 2);
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
