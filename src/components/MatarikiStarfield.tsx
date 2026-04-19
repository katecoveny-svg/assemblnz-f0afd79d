import { useEffect, useRef } from "react";

/**
 * Matariki Starfield — Premium canvas particle system
 * Features:
 * - Matariki cluster (9 stars in traditional formation)
 * - Drifting constellation nodes with connection lines
 * - Liquid glow orbs
 * - GPU-friendly, respects prefers-reduced-motion
 * - Mobile: reduced count, disabled below 768px if `heroOnly`
 */

interface Props {
  className?: string;
  /** Number of background drift stars */
  starCount?: number;
  /** Show Matariki cluster */
  showMatariki?: boolean;
  /** Show connection lines between nearby stars */
  showConnections?: boolean;
  /** Show floating liquid orbs */
  showOrbs?: boolean;
  /** Fixed to viewport or flows with content */
  fixed?: boolean;
}

const MATARIKI_POSITIONS = [
  // Traditional Matariki cluster — 9 stars (Matariki + whānau)
  { x: 0.42, y: 0.18, r: 3.5, name: "Matariki" },
  { x: 0.39, y: 0.14, r: 2.2, name: "Tupuānuku" },
  { x: 0.445, y: 0.13, r: 2.0, name: "Tupuārangi" },
  { x: 0.47, y: 0.16, r: 2.4, name: "Waipuna-ā-Rangi" },
  { x: 0.36, y: 0.20, r: 1.8, name: "Waitī" },
  { x: 0.41, y: 0.23, r: 2.0, name: "Waitā" },
  { x: 0.46, y: 0.21, r: 2.6, name: "Ururangi" },
  { x: 0.50, y: 0.19, r: 1.6, name: "Pōhutukawa" },
  { x: 0.44, y: 0.25, r: 1.9, name: "Hiwa-i-te-Rangi" },
];

// Connection pairs for Matariki
const MATARIKI_CONNECTIONS = [
  [0, 1], [0, 2], [0, 6], [0, 5],
  [1, 4], [2, 3], [3, 7], [5, 8], [6, 7],
];

export default function MatarikiStarfield({
  className = "",
  starCount = 60,
  showMatariki = true,
  showConnections = true,
  showOrbs = true,
  fixed = false,
}: Props) {
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
    const actualStarCount = isMobile ? Math.min(starCount, 15) : starCount;

    interface Star {
      x: number; y: number; r: number;
      vx: number; vy: number;
      a: number; phase: number;
      gold: boolean; pounamu: boolean;
    }
    interface Orb {
      x: number; y: number; r: number;
      vx: number; vy: number;
      phase: number; speed: number;
      color: [number, number, number];
    }

    let stars: Star[] = [];
    let orbs: Orb[] = [];

    const resize = () => {
      if (fixed) {
        w = window.innerWidth;
        h = window.innerHeight;
      } else {
        const rect = canvas.parentElement?.getBoundingClientRect();
        w = rect?.width || window.innerWidth;
        h = rect?.height || window.innerHeight;
      }
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    };

    const init = () => {
      stars = [];
      for (let i = 0; i < actualStarCount; i++) {
        const rng = Math.random();
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.4 + Math.random() * 2,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.1,
          a: 0.1 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          gold: rng < 0.25,
          pounamu: rng > 0.25 && rng < 0.4,
        });
      }

      if (showOrbs && !isMobile) {
        const orbCount = 3;
        orbs = [];
        const orbColors: [number, number, number][] = [
          [212, 168, 67],  // gold
          [58, 125, 110],  // pounamu
          [90, 143, 168],  // tangaroa-light
        ];
        for (let i = 0; i < orbCount; i++) {
          orbs.push({
            x: w * 0.15 + Math.random() * w * 0.7,
            y: h * 0.1 + Math.random() * h * 0.8,
            r: 40 + Math.random() * 80,
            vx: (Math.random() - 0.5) * 0.06,
            vy: (Math.random() - 0.5) * 0.04,
            phase: Math.random() * Math.PI * 2,
            speed: 0.1 + Math.random() * 0.2,
            color: orbColors[i % orbColors.length],
          });
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      t += 0.006;
      ctx.clearRect(0, 0, w, h);

      // Liquid glass orbs
      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.r) orb.x = w + orb.r;
        if (orb.x > w + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = h + orb.r;
        if (orb.y > h + orb.r) orb.y = -orb.r;

        const breathe = Math.sin(t * orb.speed + orb.phase) * 0.3 + 0.7;
        const r = orb.r * (0.9 + breathe * 0.15);
        const a = 0.02 * breathe;
        const [cr, cg, cb] = orb.color;

        const g = ctx.createRadialGradient(orb.x, orb.y, r * 0.05, orb.x, orb.y, r);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 2})`);
        g.addColorStop(0.4, `rgba(${cr},${cg},${cb},${a})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // Background drift stars
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;

        const twinkle = Math.sin(t * 0.8 + s.phase) * 0.4 + 0.6;
        const alpha = s.a * twinkle;
        const r = s.gold ? 212 : s.pounamu ? 90 : 255;
        const g2 = s.gold ? 190 : s.pounamu ? 173 : 255;
        const b = s.gold ? 140 : s.pounamu ? 160 : 255;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g2},${b},${alpha})`;
        ctx.fill();

        // Glow halo for larger stars
        if (s.r > 1.2) {
          const gl = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
          gl.addColorStop(0, `rgba(${r},${g2},${b},${alpha * 0.2})`);
          gl.addColorStop(1, `rgba(${r},${g2},${b},0)`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 6, 0, Math.PI * 2);
          ctx.fillStyle = gl;
          ctx.fill();
        }
      }

      // Connection lines between nearby stars
      if (showConnections && !isMobile) {
        const maxDist = 120;
        ctx.strokeStyle = "rgba(212,190,140,0.04)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < stars.length; i++) {
          for (let j = i + 1; j < stars.length; j++) {
            const dx = stars[i].x - stars[j].x;
            const dy = stars[i].y - stars[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
              const lineAlpha = 0.06 * (1 - dist / maxDist);
              ctx.strokeStyle = `rgba(212,190,140,${lineAlpha})`;
              ctx.beginPath();
              ctx.moveTo(stars[i].x, stars[i].y);
              ctx.lineTo(stars[j].x, stars[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Matariki cluster
      if (showMatariki && !isMobile) {
        // Connection lines first
        ctx.lineWidth = 0.8;
        for (const [a, b] of MATARIKI_CONNECTIONS) {
          const sa = MATARIKI_POSITIONS[a];
          const sb = MATARIKI_POSITIONS[b];
          const ax = sa.x * w, ay = sa.y * h;
          const bx = sb.x * w, by = sb.y * h;
          const pulse = Math.sin(t * 0.5 + a) * 0.3 + 0.7;
          ctx.strokeStyle = `rgba(212,168,67,${0.12 * pulse})`;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }

        // Stars
        for (const ms of MATARIKI_POSITIONS) {
          const sx = ms.x * w;
          const sy = ms.y * h;
          const pulse = Math.sin(t * 0.6 + ms.x * 10) * 0.3 + 0.7;
          const r = ms.r * (0.9 + pulse * 0.2);

          // Outer glow
          const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 8);
          glow.addColorStop(0, `rgba(212,168,67,${0.15 * pulse})`);
          glow.addColorStop(0.5, `rgba(212,168,67,${0.04 * pulse})`);
          glow.addColorStop(1, "rgba(212,168,67,0)");
          ctx.beginPath();
          ctx.arc(sx, sy, r * 8, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,240,200,${0.7 + pulse * 0.3})`;
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
  }, [starCount, showMatariki, showConnections, showOrbs, fixed]);

  return (
    <canvas
      ref={canvasRef}
      className={`${fixed ? "fixed" : "absolute"} inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
