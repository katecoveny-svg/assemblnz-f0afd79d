import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Liquid Glass Network Hero — Pounamu green node clusters with
 * liquid-glass orbs, flowing signal particles, and glowing white
 * star constellations over a deep midnight terrain.
 */

const POUNAMU = [47, 203, 137] as const;
const POUNAMU_DEEP = [30, 140, 95] as const;
const WHITE = [255, 255, 255] as const;
const GOLD = [203, 174, 109] as const;
const TEAL_MIST = [120, 220, 180] as const;

interface GlassOrb {
  x: number; y: number; r: number;
  vx: number; vy: number;
  phase: number; speed: number;
  opacity: number;
}

interface NetNode {
  x: number; y: number; r: number;
  pulsePhase: number; pulseSpeed: number;
  color: readonly [number, number, number];
  brightness: number;
  connections: number[];
  cluster: number;
}

interface FlowParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
  color: readonly [number, number, number];
}

interface TerrainLine {
  baseY: number; amplitude: number;
  frequency: number; phase: number;
  speed: number; alpha: number;
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
    let nodes: NetNode[] = [];
    let glassOrbs: GlassOrb[] = [];
    let flowParticles: FlowParticle[] = [];
    let terrainLines: TerrainLine[] = [];
    let bgStars: { x: number; y: number; r: number; a: number; phase: number }[] = [];

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
      init();
    };

    const init = () => {
      // Background stars — dense field
      bgStars = [];
      const starCount = Math.floor((w * h) / 2500);
      for (let i = 0; i < starCount; i++) {
        bgStars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.6,
          r: Math.random() * 1.4 + 0.15,
          a: Math.random() * 0.35 + 0.03,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Liquid glass orbs — floating semi-transparent blobs
      glassOrbs = [];
      const orbCount = Math.min(7, Math.floor(w / 180));
      for (let i = 0; i < orbCount; i++) {
        glassOrbs.push({
          x: w * 0.1 + Math.random() * w * 0.8,
          y: h * 0.15 + Math.random() * h * 0.6,
          r: 40 + Math.random() * 80,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.1,
          phase: Math.random() * Math.PI * 2,
          speed: 0.2 + Math.random() * 0.4,
          opacity: 0.03 + Math.random() * 0.04,
        });
      }

      // Network nodes in clusters
      nodes = [];
      const clusterCenters = [
        { x: w * 0.15, y: h * 0.55 },
        { x: w * 0.35, y: h * 0.4 },
        { x: w * 0.55, y: h * 0.6 },
        { x: w * 0.75, y: h * 0.45 },
        { x: w * 0.9, y: h * 0.55 },
        { x: w * 0.5, y: h * 0.75 },
      ];

      for (let ci = 0; ci < clusterCenters.length; ci++) {
        const center = clusterCenters[ci];
        const count = 5 + Math.floor(Math.random() * 6);
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 15 + Math.random() * 80;
          const isWhite = Math.random() < 0.3;
          const isBright = Math.random() < 0.2;
          nodes.push({
            x: center.x + Math.cos(angle) * dist,
            y: center.y + Math.sin(angle) * dist,
            r: isBright ? 2.5 + Math.random() * 2.5 : 1 + Math.random() * 1.8,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.3 + Math.random() * 0.7,
            color: isWhite ? WHITE : (Math.random() < 0.15 ? GOLD : POUNAMU),
            brightness: isBright ? 0.9 : 0.3 + Math.random() * 0.4,
            connections: [],
            cluster: ci,
          });
        }
      }

      // Connections — within clusters + some cross-cluster
      for (let i = 0; i < nodes.length; i++) {
        const distances: { idx: number; d: number }[] = [];
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          distances.push({ idx: j, d: Math.sqrt(dx * dx + dy * dy) });
        }
        distances.sort((a, b) => a.d - b.d);
        const maxConn = nodes[i].cluster === nodes[distances[0]?.idx]?.cluster ? 3 : 1;
        nodes[i].connections = distances
          .filter(d => d.d < w * 0.18)
          .slice(0, maxConn)
          .map(d => d.idx);
      }

      // Flow particles — glowing dots that travel along connections
      flowParticles = [];

      // Terrain contour lines
      terrainLines = [];
      for (let i = 0; i < 14; i++) {
        const t = i / 14;
        terrainLines.push({
          baseY: h * 0.5 + t * h * 0.4,
          amplitude: 12 + t * 30,
          frequency: 1.2 + Math.random() * 2.5,
          phase: Math.random() * Math.PI * 2,
          speed: 0.08 + Math.random() * 0.15,
          alpha: 0.02 + t * 0.055,
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    // Spawn flow particles periodically
    const spawnFlow = () => {
      if (nodes.length < 2 || flowParticles.length > 60) return;
      const src = nodes[Math.floor(Math.random() * nodes.length)];
      if (src.connections.length === 0) return;
      const tgt = nodes[src.connections[Math.floor(Math.random() * src.connections.length)]];
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 5) return;
      const speed = 0.4 + Math.random() * 0.6;
      flowParticles.push({
        x: src.x, y: src.y,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        life: 0,
        maxLife: dist / speed,
        size: 1.5 + Math.random() * 2,
        color: Math.random() < 0.7 ? POUNAMU : WHITE,
      });
    };

    let t = 0;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);

      // Spawn particles
      if (Math.random() < 0.3) spawnFlow();

      // ── Atmosphere ──
      const atmo = ctx.createRadialGradient(w * 0.65, h * 0.35, 0, w * 0.65, h * 0.35, w * 0.6);
      atmo.addColorStop(0, "rgba(47,203,137,0.05)");
      atmo.addColorStop(0.4, "rgba(16,36,43,0.04)");
      atmo.addColorStop(1, "transparent");
      ctx.fillStyle = atmo;
      ctx.fillRect(0, 0, w, h);

      // Horizon glow
      const hz = ctx.createRadialGradient(w * 0.7, h * 0.5, 0, w * 0.7, h * 0.5, w * 0.5);
      hz.addColorStop(0, "rgba(47,203,137,0.04)");
      hz.addColorStop(0.5, "rgba(203,174,109,0.02)");
      hz.addColorStop(1, "transparent");
      ctx.fillStyle = hz;
      ctx.fillRect(0, 0, w, h);

      // ── Stars ──
      for (const s of bgStars) {
        const twinkle = Math.sin(t * 0.6 + s.phase) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a * twinkle})`;
        ctx.fill();
      }

      // ── Liquid glass orbs ──
      for (const orb of glassOrbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;
        // Bounce softly
        if (orb.x < -orb.r) orb.x = w + orb.r;
        if (orb.x > w + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = h + orb.r;
        if (orb.y > h + orb.r) orb.y = -orb.r;

        const breathe = Math.sin(t * orb.speed + orb.phase) * 0.3 + 0.7;
        const r = orb.r * (0.95 + breathe * 0.1);
        const a = orb.opacity * breathe;

        // Outer glow
        const g1 = ctx.createRadialGradient(orb.x, orb.y, r * 0.2, orb.x, orb.y, r);
        g1.addColorStop(0, `rgba(${POUNAMU[0]},${POUNAMU[1]},${POUNAMU[2]},${a * 1.2})`);
        g1.addColorStop(0.5, `rgba(${POUNAMU_DEEP[0]},${POUNAMU_DEEP[1]},${POUNAMU_DEEP[2]},${a * 0.5})`);
        g1.addColorStop(1, `rgba(${POUNAMU[0]},${POUNAMU[1]},${POUNAMU[2]},0)`);
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g1;
        ctx.fill();

        // Glass rim highlight
        const rimA = a * 0.6;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 0.85, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${rimA})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Inner specular
        const spec = ctx.createRadialGradient(
          orb.x - r * 0.2, orb.y - r * 0.25, 0,
          orb.x - r * 0.2, orb.y - r * 0.25, r * 0.5
        );
        spec.addColorStop(0, `rgba(255,255,255,${a * 0.6})`);
        spec.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = spec;
        ctx.fill();
      }

      // ── Terrain contours ──
      for (const line of terrainLines) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${POUNAMU[0]},${POUNAMU[1]},${POUNAMU[2]},${line.alpha})`;
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= w; x += 3) {
          const nx = x / w;
          const y = line.baseY +
            Math.sin(nx * line.frequency * Math.PI * 2 + t * line.speed + line.phase) * line.amplitude +
            Math.sin(nx * line.frequency * 3.5 + t * line.speed * 0.6) * line.amplitude * 0.35;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // ── Node connection lines ──
      ctx.lineWidth = 0.4;
      for (const node of nodes) {
        for (const ci of node.connections) {
          const target = nodes[ci];
          const dx = target.x - node.x;
          const dy = target.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = w * 0.18;
          if (dist > maxDist) continue;
          const lineAlpha = (1 - dist / maxDist) * 0.14;

          // Gradient line from node to target
          const lg = ctx.createLinearGradient(node.x, node.y, target.x, target.y);
          lg.addColorStop(0, `rgba(${node.color[0]},${node.color[1]},${node.color[2]},${lineAlpha})`);
          lg.addColorStop(1, `rgba(${target.color[0]},${target.color[1]},${target.color[2]},${lineAlpha})`);
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = lg;
          ctx.stroke();
        }
      }

      // ── Nodes ──
      for (const node of nodes) {
        const pulse = Math.sin(t * node.pulseSpeed + node.pulsePhase) * 0.3 + 0.7;
        const a = node.brightness * pulse;
        const r = node.r * (0.9 + pulse * 0.15);

        // Glow halo
        if (node.brightness > 0.5) {
          const g = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 8);
          g.addColorStop(0, `rgba(${node.color[0]},${node.color[1]},${node.color[2]},${a * 0.2})`);
          g.addColorStop(1, `rgba(${node.color[0]},${node.color[1]},${node.color[2]},0)`);
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 8, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${node.color[0]},${node.color[1]},${node.color[2]},${a})`;
        ctx.fill();

        // White specular on bright nodes
        if (node.brightness > 0.7) {
          ctx.beginPath();
          ctx.arc(node.x - r * 0.25, node.y - r * 0.25, r * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${a * 0.5})`;
          ctx.fill();
        }
      }

      // ── Flow particles ──
      for (let i = flowParticles.length - 1; i >= 0; i--) {
        const fp = flowParticles[i];
        fp.x += fp.vx;
        fp.y += fp.vy;
        fp.life++;
        if (fp.life > fp.maxLife) {
          flowParticles.splice(i, 1);
          continue;
        }
        const lifeRatio = fp.life / fp.maxLife;
        const fadeA = lifeRatio < 0.1 ? lifeRatio / 0.1 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1;
        const a = fadeA * 0.8;

        // Glow trail
        const tg = ctx.createRadialGradient(fp.x, fp.y, 0, fp.x, fp.y, fp.size * 5);
        tg.addColorStop(0, `rgba(${fp.color[0]},${fp.color[1]},${fp.color[2]},${a * 0.35})`);
        tg.addColorStop(1, `rgba(${fp.color[0]},${fp.color[1]},${fp.color[2]},0)`);
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, fp.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = tg;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(fp.x, fp.y, fp.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${fp.color[0]},${fp.color[1]},${fp.color[2]},${a})`;
        ctx.fill();
      }

      // ── Assembl constellation triangle ──
      const triCx = w * 0.82, triCy = h * 0.18;
      const triR = 26 + Math.sin(t * 0.4) * 3;
      const triColors = [GOLD, POUNAMU, TEAL_MIST];
      const triNodes = [0, 1, 2].map(i => {
        const angle = (i * Math.PI * 2) / 3 - Math.PI / 2 + t * 0.04;
        return { x: triCx + Math.cos(angle) * triR, y: triCy + Math.sin(angle) * triR };
      });

      ctx.strokeStyle = `rgba(255,255,255,0.07)`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(triNodes[0].x, triNodes[0].y);
      for (let i = 1; i <= 3; i++) ctx.lineTo(triNodes[i % 3].x, triNodes[i % 3].y);
      ctx.stroke();

      for (let i = 0; i < 3; i++) {
        const n = triNodes[i];
        const c = triColors[i];
        const na = Math.sin(t * 0.35 + i * 2.1) * 0.15 + 0.45;
        const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 12);
        ng.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${na})`);
        ng.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = ng;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${na + 0.3})`;
        ctx.fill();
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
          background: "radial-gradient(ellipse at 65% 40%, transparent 10%, rgba(9,22,26,0.35) 40%, rgba(9,22,26,0.75) 70%, rgba(9,22,26,0.97) 100%)",
        }}
      />
    </motion.div>
  );
}
