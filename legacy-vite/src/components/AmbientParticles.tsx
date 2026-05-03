import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Full-page ambient particles — PHOTON-inspired with motion trails,
 * energy streams, and stronger bloom glow.
 */
export default function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let w = 0, h = 0;

    interface P {
      x: number; y: number; vx: number; vy: number;
      r: number; a: number; phase: number;
      trail: { x: number; y: number }[];
      gold: boolean;
    }

    interface Stream {
      x: number; y: number; vx: number; vy: number;
      r: number; phase: number; speed: number; color: string;
    }

    let particles: P[] = [];
    let streams: Stream[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = document.documentElement.scrollHeight;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      resize();
      const count = isMobile ? 10 : 20;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.12,
          r: 1 + Math.random() * 2,
          a: 0.1 + Math.random() * 0.15,
          phase: Math.random() * Math.PI * 2,
          trail: [],
          gold: Math.random() < 0.3,
        });
      }

      // Energy streams — slow-moving light orbs with trails
      const streamCount = isMobile ? 3 : 6;
      streams = [];
      for (let i = 0; i < streamCount; i++) {
        const colors = ["#4AA5A8", "#3A7D6E", "#5AADA0", "#A8DDDB"];
        streams.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.08,
          r: 35 + Math.random() * 55,
          phase: Math.random() * Math.PI * 2,
          speed: 0.12 + Math.random() * 0.2,
          color: colors[i % colors.length],
        });
      }
    };

    init();
    window.addEventListener("resize", init);

    let t = 0;
    const draw = () => {
      t += 0.006;
      ctx.clearRect(0, 0, w, h);

      // Energy streams with bloom
      for (const s of streams) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -s.r) s.x = w + s.r;
        if (s.x > w + s.r) s.x = -s.r;
        if (s.y < -s.r) s.y = h + s.r;
        if (s.y > h + s.r) s.y = -s.r;

        const breathe = Math.sin(t * s.speed + s.phase) * 0.3 + 0.7;
        const r = s.r * (0.95 + breathe * 0.1);
        const a = 0.035 * breathe;

        // Outer bloom
        const g2 = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 1.5);
        g2.addColorStop(0, hexToRgba(s.color, a * 0.8));
        g2.addColorStop(0.4, hexToRgba(s.color, a * 0.3));
        g2.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = g2;
        ctx.fill();

        // Core glow
        const g = ctx.createRadialGradient(s.x, s.y, r * 0.1, s.x, s.y, r);
        g.addColorStop(0, hexToRgba(s.color, a * 2));
        g.addColorStop(0.5, hexToRgba(s.color, a * 0.6));
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // Particles with motion trails
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Store trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 12) p.trail.shift();

        const twinkle = Math.sin(t + p.phase) * 0.4 + 0.6;
        const alpha = p.a * twinkle;

        const r = p.gold ? 212 : 255;
        const g = p.gold ? 190 : 255;
        const b = p.gold ? 140 : 255;

        // Draw trail
        if (p.trail.length > 2) {
          for (let i = 0; i < p.trail.length - 1; i++) {
            const trailAlpha = (i / p.trail.length) * alpha * 0.3;
            ctx.beginPath();
            ctx.moveTo(p.trail[i].x, p.trail[i].y);
            ctx.lineTo(p.trail[i + 1].x, p.trail[i + 1].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${trailAlpha})`;
            ctx.lineWidth = p.r * 0.5 * (i / p.trail.length);
            ctx.stroke();
          }
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();

        // Bloom glow
        const gl = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
        gl.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.35})`);
        gl.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
        ctx.fillStyle = gl;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", init);
      cancelAnimationFrame(animId);
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
