import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Premium particle constellation hero — inspired by 3D dot spheres,
 * wireframe forms, and stippled cosmic landscapes on dark backgrounds.
 */

const GOLD = [212, 168, 67] as const;
const TEAL = [58, 125, 110] as const;
const WHITE = [255, 255, 255] as const;

interface Particle {
  x: number; y: number; z: number;
  r: number; baseAlpha: number; phase: number; speed: number;
  color: readonly [number, number, number];
}

export default function StarConstellationHero({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    let bgStars: Particle[] = [];
    let spherePoints: { theta: number; phi: number; r: number }[] = [];
    let terrainPoints: { bx: number; by: number; amp: number; phase: number }[] = [];

    // Sphere config
    const SPHERE_RADIUS = 90;
    const SPHERE_POINT_COUNT = 280;
    const SPHERE_CENTER = { xRatio: 0.78, yRatio: 0.38 };

    // Terrain config
    const TERRAIN_ROWS = 18;
    const TERRAIN_COLS = 60;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = rect?.width || window.innerWidth;
      h = rect?.height || 700;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Background stars
      bgStars = [];
      const count = Math.floor((w * h) / 3200);
      for (let i = 0; i < count; i++) {
        const roll = Math.random();
        const col = roll < 0.12 ? GOLD : roll < 0.2 ? TEAL : WHITE;
        bgStars.push({
          x: Math.random() * w, y: Math.random() * h, z: 0,
          r: Math.random() * 1.6 + 0.2,
          baseAlpha: Math.random() * 0.4 + 0.08,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.6 + 0.2,
          color: col,
        });
      }

      // Sphere points (Fibonacci distribution)
      spherePoints = [];
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < SPHERE_POINT_COUNT; i++) {
        const y = 1 - (i / (SPHERE_POINT_COUNT - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = golden * i;
        spherePoints.push({ theta, phi: Math.acos(y), r: 1 + Math.random() * 0.3 });
      }

      // Terrain grid
      terrainPoints = [];
      for (let row = 0; row < TERRAIN_ROWS; row++) {
        for (let col = 0; col < TERRAIN_COLS; col++) {
          terrainPoints.push({
            bx: col / (TERRAIN_COLS - 1),
            by: row / (TERRAIN_ROWS - 1),
            amp: Math.random() * 0.6 + 0.4,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, w, h);

      // ── Background stars ──
      for (const s of bgStars) {
        const twinkle = Math.sin(t * s.speed + s.phase) * 0.35 + 0.65;
        const a = s.baseAlpha * twinkle;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${a})`;
        ctx.fill();
        if (s.r > 1.1) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3.5);
          g.addColorStop(0, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${a * 0.25})`);
          g.addColorStop(1, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},0)`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      // ── Rotating particle sphere ──
      const cx = w * SPHERE_CENTER.xRatio;
      const cy = h * SPHERE_CENTER.yRatio;
      const rotY = t * 0.3;
      const rotX = Math.sin(t * 0.15) * 0.2;
      const cosRY = Math.cos(rotY), sinRY = Math.sin(rotY);
      const cosRX = Math.cos(rotX), sinRX = Math.sin(rotX);

      const projected: { x: number; y: number; z: number; r: number; a: number }[] = [];

      for (const sp of spherePoints) {
        const sP = Math.sin(sp.phi), cP = Math.cos(sp.phi);
        const sT = Math.sin(sp.theta + rotY), cT = Math.cos(sp.theta + rotY);
        let px = SPHERE_RADIUS * sP * cT;
        let py = SPHERE_RADIUS * cP;
        let pz = SPHERE_RADIUS * sP * sT;
        // Rotate X
        const py2 = py * cosRX - pz * sinRX;
        const pz2 = py * sinRX + pz * cosRX;
        py = py2; pz = pz2;

        const depth = (pz + SPHERE_RADIUS) / (2 * SPHERE_RADIUS); // 0 (back) to 1 (front)
        const alpha = 0.15 + depth * 0.6;
        const dotR = 0.6 + depth * 1.2;
        projected.push({ x: cx + px, y: cy + py, z: pz, r: dotR * sp.r, a: alpha });
      }

      // Sort back to front
      projected.sort((a, b) => a.z - b.z);

      // Draw wireframe lines (connect nearest neighbors on sphere surface)
      ctx.strokeStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},0.06)`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < Math.min(i + 4, projected.length); j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 22) {
            const lineA = Math.min(projected[i].a, projected[j].a) * 0.3;
            ctx.strokeStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${lineA * 0.4})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw sphere dots
      for (const p of projected) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${p.a})`;
        ctx.fill();
        if (p.r > 1.2) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          g.addColorStop(0, `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${p.a * 0.3})`);
          g.addColorStop(1, `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      // Sphere ring / orbit line
      ctx.beginPath();
      ctx.ellipse(cx, cy, SPHERE_RADIUS * 1.15, SPHERE_RADIUS * 0.3, 0.15, 0, Math.PI * 2);
      const ringPulse = Math.sin(t * 0.4) * 0.03 + 0.07;
      ctx.strokeStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${ringPulse})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // ── Stippled terrain (bottom-left) ──
      const terrainX = w * 0.02;
      const terrainY = h * 0.62;
      const terrainW = w * 0.42;
      const terrainH = h * 0.32;

      for (const tp of terrainPoints) {
        const px = terrainX + tp.bx * terrainW;
        const wave = Math.sin(tp.bx * 8 + t * 0.8 + tp.phase) * tp.amp * 18 +
                     Math.sin(tp.bx * 3 + t * 0.3) * tp.amp * 12;
        const perspective = 0.4 + tp.by * 0.6;
        const py = terrainY + tp.by * terrainH - wave * perspective;
        const alpha = (0.1 + tp.by * 0.35) * perspective;
        const r = 0.6 + tp.by * 1.0;

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${TEAL[0]},${TEAL[1]},${TEAL[2]},${alpha})`;
        ctx.fill();
      }

      // Terrain grid lines (horizontal)
      for (let row = 0; row < TERRAIN_ROWS; row++) {
        const by = row / (TERRAIN_ROWS - 1);
        const perspective = 0.4 + by * 0.6;
        const lineA = (0.02 + by * 0.06) * perspective;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${TEAL[0]},${TEAL[1]},${TEAL[2]},${lineA})`;
        ctx.lineWidth = 0.4;
        for (let col = 0; col <= TERRAIN_COLS; col++) {
          const bx = col / TERRAIN_COLS;
          const px = terrainX + bx * terrainW;
          const wave = Math.sin(bx * 8 + t * 0.8 + row * 0.5) * 18 +
                       Math.sin(bx * 3 + t * 0.3) * 12;
          const py = terrainY + by * terrainH - wave * perspective * 0.7;
          if (col === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // ── Constellation triangulum (Assembl logo echo) ──
      const triCx = w * 0.35, triCy = h * 0.28;
      const triR = 35 + Math.sin(t * 0.5) * 3;
      const triNodes = [0, 1, 2].map(i => {
        const angle = (i * Math.PI * 2) / 3 - Math.PI / 2 + t * 0.1;
        return { x: triCx + Math.cos(angle) * triR, y: triCy + Math.sin(angle) * triR };
      });

      const triAlpha = Math.sin(t * 0.3) * 0.08 + 0.15;
      ctx.strokeStyle = `rgba(255,255,255,${triAlpha})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(triNodes[0].x, triNodes[0].y);
      for (let i = 1; i <= 3; i++) ctx.lineTo(triNodes[i % 3].x, triNodes[i % 3].y);
      ctx.stroke();

      for (const n of triNodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${triAlpha + 0.3})`;
        ctx.fill();
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 8);
        g.addColorStop(0, `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${triAlpha * 0.5})`);
        g.addColorStop(1, `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // ── Shooting stars (occasional) ──
      if (Math.random() < 0.003) {
        const sx = Math.random() * w;
        const sy = Math.random() * h * 0.35;
        const angle = Math.PI * 0.15 + Math.random() * 0.2;
        const len = 50 + Math.random() * 80;
        const sg = ctx.createLinearGradient(sx, sy, sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        sg.addColorStop(0, "rgba(212,168,67,0.7)");
        sg.addColorStop(1, "rgba(212,168,67,0)");
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        ctx.strokeStyle = sg;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <motion.div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 78% 38%, transparent 15%, rgba(9,9,15,0.5) 45%, rgba(9,9,15,0.85) 75%, rgba(9,9,15,0.98) 100%)",
        }}
      />
    </motion.div>
  );
}
