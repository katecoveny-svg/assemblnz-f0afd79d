import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Full-page ambient drifting particles.
 * ~15 on desktop, ~8 on mobile, respects prefers-reduced-motion.
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

    interface P { x: number; y: number; vx: number; vy: number; r: number; a: number; phase: number }
    let particles: P[] = [];

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
      const count = isMobile ? 8 : 15;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.1,
          r: 1 + Math.random() * 1.5,
          a: 0.08 + Math.random() * 0.12,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    init();
    window.addEventListener("resize", init);

    let t = 0;
    const draw = () => {
      t += 0.006;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        const twinkle = Math.sin(t + p.phase) * 0.4 + 0.6;
        const alpha = p.a * twinkle;
        // gold-ish white
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,190,140,${alpha})`;
        ctx.fill();
        // soft glow
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        g.addColorStop(0, `rgba(212,190,140,${alpha * 0.3})`);
        g.addColorStop(1, "rgba(212,190,140,0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = g;
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
