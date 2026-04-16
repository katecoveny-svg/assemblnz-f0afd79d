import { useEffect, useRef } from "react";

/**
 * Light-mode hero particles — soft floating orbs with 3D neomorphic glow,
 * gentle drift, and bloom. Designed for #FAFBFC backgrounds.
 */
export default function HeroParticlesLight({
  className = "",
  accentColor = "#4AA5A8",
  secondaryColor = "#E8A948",
}: {
  className?: string;
  accentColor?: string;
  secondaryColor?: string;
}) {
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

    interface Orb {
      x: number; y: number; r: number; vx: number; vy: number;
      phase: number; speed: number; color: string; opacity: number;
    }
    interface Mote {
      x: number; y: number; r: number; vx: number; vy: number;
      phase: number; color: string; opacity: number;
    }

    let orbs: Orb[] = [];
    let motes: Mote[] = [];

    const hexToRgb = (hex: string) => ({
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    });

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
      const colors = [accentColor, secondaryColor, "#E8E6F0", accentColor, "#D4E8E6"];
      const orbCount = isMobile ? 4 : 8;
      orbs = [];
      for (let i = 0; i < orbCount; i++) {
        orbs.push({
          x: w * 0.1 + Math.random() * w * 0.8,
          y: h * 0.1 + Math.random() * h * 0.8,
          r: 40 + Math.random() * 80,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.08,
          phase: Math.random() * Math.PI * 2,
          speed: 0.1 + Math.random() * 0.15,
          color: colors[i % colors.length],
          opacity: 0.06 + Math.random() * 0.06,
        });
      }

      const moteCount = isMobile ? 12 : 35;
      motes = [];
      for (let i = 0; i < moteCount; i++) {
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 1 + Math.random() * 2.5,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.06,
          phase: Math.random() * Math.PI * 2,
          color: Math.random() < 0.3 ? secondaryColor : accentColor,
          opacity: 0.15 + Math.random() * 0.2,
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      t += 0.005;
      ctx.clearRect(0, 0, w, h);

      // Soft orbs — neomorphic glow
      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.r * 2) orb.x = w + orb.r * 2;
        if (orb.x > w + orb.r * 2) orb.x = -orb.r * 2;
        if (orb.y < -orb.r * 2) orb.y = h + orb.r * 2;
        if (orb.y > h + orb.r * 2) orb.y = -orb.r * 2;

        const breathe = Math.sin(t * orb.speed + orb.phase) * 0.3 + 0.7;
        const r = orb.r * (0.9 + breathe * 0.15);
        const { r: cr, g: cg, b: cb } = hexToRgb(orb.color);
        const a = orb.opacity * breathe;

        // Outer soft bloom
        const g2 = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 2);
        g2.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 0.7})`);
        g2.addColorStop(0.4, `rgba(${cr},${cg},${cb},${a * 0.3})`);
        g2.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 2, 0, Math.PI * 2);
        ctx.fillStyle = g2;
        ctx.fill();

        // Inner core — brighter center for 3D effect
        const g = ctx.createRadialGradient(orb.x - r * 0.2, orb.y - r * 0.2, r * 0.05, orb.x, orb.y, r);
        g.addColorStop(0, `rgba(255,255,255,${a * 1.5})`);
        g.addColorStop(0.3, `rgba(${cr},${cg},${cb},${a * 1.2})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // Tiny floating motes
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.x < 0) m.x = w;
        if (m.x > w) m.x = 0;
        if (m.y < 0) m.y = h;
        if (m.y > h) m.y = 0;

        const twinkle = Math.sin(t * 1.5 + m.phase) * 0.4 + 0.6;
        const alpha = m.opacity * twinkle;
        const { r: cr, g: cg, b: cb } = hexToRgb(m.color);

        // Core dot
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
        ctx.fill();

        // Soft glow
        if (m.r > 1.5) {
          const gl = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 6);
          gl.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * 0.25})`);
          gl.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r * 6, 0, Math.PI * 2);
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
  }, [accentColor, secondaryColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
