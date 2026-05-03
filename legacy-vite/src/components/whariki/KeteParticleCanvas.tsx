import { useEffect, useRef, useCallback } from "react";

interface Strand {
  points: { x: number; y: number }[];
  width: number;
  isGold: boolean;
  phase: number;
  depth: number; // 0 = far, 1 = near
}

interface Sparkle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  phase: number;
  speed: number;
}

interface FogBlob {
  x: number;
  y: number;
  radius: number;
  phase: number;
  speed: number;
  isGold: boolean;
}

/**
 * Luminous woven harakeke strands radiating from a vanishing point
 * with volumetric glow, sparkle particles, and atmospheric fog.
 */
const KeteParticleCanvas = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strandsRef = useRef<Strand[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const fogRef = useRef<FogBlob[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef(0);
  const visible = useRef(true);
  const timeRef = useRef(0);

  const initScene = useCallback((w: number, h: number) => {
    const isMobile = w < 768;
    const strands: Strand[] = [];
    const sparkles: Sparkle[] = [];
    const fog: FogBlob[] = [];

    // Vanishing point — bottom center
    const vpX = w * 0.5;
    const vpY = h * 0.85;

    const strandCount = isMobile ? 14 : 26;

    for (let i = 0; i < strandCount; i++) {
      const t = i / strandCount;
      const isGold = i % 5 === 0;
      const depth = 0.3 + Math.random() * 0.7;

      // Fan out from vanishing point toward top edges
      const spreadAngle = -Math.PI * 0.15 - t * Math.PI * 0.7;
      const reach = (0.5 + depth * 0.5) * Math.min(w, h) * 0.9;

      const endX = vpX + Math.cos(spreadAngle) * reach;
      const endY = vpY + Math.sin(spreadAngle) * reach;

      // Generate 8-12 control points along the strand with organic wobble
      const ptCount = 8 + Math.floor(Math.random() * 5);
      const points: { x: number; y: number }[] = [];
      for (let j = 0; j <= ptCount; j++) {
        const frac = j / ptCount;
        const baseX = vpX + (endX - vpX) * frac;
        const baseY = vpY + (endY - vpY) * frac;
        // Organic wobble increases away from vanishing point
        const wobble = frac * 30 * depth;
        points.push({
          x: baseX + (Math.random() - 0.5) * wobble,
          y: baseY + (Math.random() - 0.5) * wobble * 0.6,
        });
      }

      strands.push({
        points,
        width: (isMobile ? 1.5 : 2) + depth * (isMobile ? 1 : 2),
        isGold,
        phase: Math.random() * Math.PI * 2,
        depth,
      });
    }

    // Sparkle particles scattered across the strand field
    const sparkleCount = isMobile ? 30 : 80;
    for (let i = 0; i < sparkleCount; i++) {
      const sx = w * 0.1 + Math.random() * w * 0.8;
      const sy = h * 0.05 + Math.random() * h * 0.75;
      sparkles.push({
        x: sx, y: sy,
        baseX: sx, baseY: sy,
        size: 0.8 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
      });
    }

    // Fog blobs — large, soft, drifting
    const fogCount = isMobile ? 3 : 6;
    for (let i = 0; i < fogCount; i++) {
      fog.push({
        x: w * 0.2 + Math.random() * w * 0.6,
        y: h * 0.1 + Math.random() * h * 0.6,
        radius: 150 + Math.random() * 250,
        phase: Math.random() * Math.PI * 2,
        speed: 0.1 + Math.random() * 0.2,
        isGold: i % 3 === 0,
      });
    }

    strandsRef.current = strands;
    sparklesRef.current = sparkles;
    fogRef.current = fog;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initScene(rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener("mousemove", handleMouse);

    const obs = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    }, { threshold: 0.05 });
    obs.observe(canvas);

    const isMobile = window.innerWidth < 768;
    const BLUR_BASE = isMobile ? 8 : 20;

    const TEAL_BRIGHT = [79, 228, 167];
    const CYAN = [0, 220, 200];
    const GOLD = [74, 165, 168];
    const GOLD_GLOW = [240, 208, 120];

    const draw = () => {
      if (!visible.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      timeRef.current += 0.016;
      const time = timeRef.current;
      const w = canvas.width / Math.min(window.devicePixelRatio, 2);
      const h = canvas.height / Math.min(window.devicePixelRatio, 2);
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ── Ambient fog/mist ──
      for (const f of fogRef.current) {
        const fx = f.x + Math.sin(time * f.speed + f.phase) * 40;
        const fy = f.y + Math.cos(time * f.speed * 0.7 + f.phase) * 25;
        const c = f.isGold ? GOLD : TEAL_BRIGHT;
        const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, f.radius);
        grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.04)`);
        grad.addColorStop(0.5, `rgba(${c[0]},${c[1]},${c[2]},0.015)`);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(fx, fy, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // ── Flowing strands ──
      for (const strand of strandsRef.current) {
        const pts = strand.points;
        if (pts.length < 2) continue;

        // Animate points with gentle drift
        const animPts = pts.map((p, idx) => {
          const frac = idx / (pts.length - 1);
          const drift = frac * 8 * strand.depth;
          let ax = p.x + Math.sin(time * 0.4 + strand.phase + idx * 0.5) * drift;
          let ay = p.y + Math.cos(time * 0.3 + strand.phase + idx * 0.7) * drift * 0.6;

          // Mouse warp — strands near cursor bend toward it
          const dx = mx - ax;
          const dy = my - ay;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180 && dist > 1) {
            const influence = (1 - dist / 180) * 0.12;
            ax += dx * influence;
            ay += dy * influence;
          }
          return { x: ax, y: ay };
        });

        // Determine glow color
        const c = strand.isGold ? GOLD : TEAL_BRIGHT;
        const cg = strand.isGold ? GOLD_GLOW : CYAN;

        // Pulse brightness
        const pulse = 0.6 + Math.sin(time * 1.5 + strand.phase) * 0.4;
        const alpha = (0.3 + strand.depth * 0.5) * pulse;
        const glowAlpha = (0.15 + strand.depth * 0.3) * pulse;

        // Draw glow layer (thicker, blurred)
        ctx.save();
        ctx.shadowBlur = BLUR_BASE + strand.depth * 10;
        ctx.shadowColor = `rgba(${cg[0]},${cg[1]},${cg[2]},${glowAlpha})`;
        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha * 0.5})`;
        ctx.lineWidth = strand.width * 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        drawSmoothCurve(ctx, animPts);
        ctx.stroke();
        ctx.restore();

        // Draw core strand (thinner, brighter)
        ctx.save();
        ctx.shadowBlur = BLUR_BASE * 0.5;
        ctx.shadowColor = `rgba(${cg[0]},${cg[1]},${cg[2]},${alpha * 0.6})`;
        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
        ctx.lineWidth = strand.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        drawSmoothCurve(ctx, animPts);
        ctx.stroke();
        ctx.restore();

        // Chevron texture on gold strands
        if (strand.isGold && strand.depth > 0.5) {
          const chevronInterval = 30;
          for (let ci = 1; ci < animPts.length - 1; ci++) {
            const cp = animPts[ci];
            const np = animPts[ci + 1];
            const segDx = np.x - cp.x;
            const segDy = np.y - cp.y;
            const segLen = Math.sqrt(segDx * segDx + segDy * segDy);
            if (segLen < chevronInterval) continue;

            const steps = Math.floor(segLen / chevronInterval);
            for (let s = 0; s < steps; s++) {
              const f = s / steps;
              const cx = cp.x + segDx * f;
              const cy = cp.y + segDy * f;
              const nx = -segDy / segLen;
              const ny = segDx / segLen;

              ctx.beginPath();
              ctx.moveTo(cx - nx * 3 - segDx / segLen * 2, cy - ny * 3 - segDy / segLen * 2);
              ctx.lineTo(cx, cy);
              ctx.lineTo(cx + nx * 3 - segDx / segLen * 2, cy + ny * 3 - segDy / segLen * 2);
              ctx.strokeStyle = `rgba(${GOLD_GLOW[0]},${GOLD_GLOW[1]},${GOLD_GLOW[2]},${alpha * 0.3})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }

      // ── Sparkle particles ──
      for (const sp of sparklesRef.current) {
        sp.x = sp.baseX + Math.sin(time * sp.speed + sp.phase) * 6;
        sp.y = sp.baseY + Math.cos(time * sp.speed * 0.8 + sp.phase) * 4;

        const dx = mx - sp.x;
        const dy = my - sp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNear = dist < 120;
        const twinkle = 0.3 + Math.sin(time * 3 + sp.phase) * 0.7;
        const intensity = isNear ? 1.0 : twinkle * 0.5;

        if (intensity < 0.1) continue;

        // Glow halo
        const haloSize = (isNear ? 8 : 5) * intensity;
        const grad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, haloSize);
        grad.addColorStop(0, `rgba(${CYAN[0]},${CYAN[1]},${CYAN[2]},${0.3 * intensity})`);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, haloSize, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * intensity, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${TEAL_BRIGHT[0]},${TEAL_BRIGHT[1]},${TEAL_BRIGHT[2]},${0.8 * intensity})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouse);
      obs.disconnect();
    };
  }, [initScene]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: "auto" }}
    />
  );
};

/** Draw a smooth curve through points using quadratic beziers */
function drawSmoothCurve(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);

  if (pts.length === 2) {
    ctx.lineTo(pts[1].x, pts[1].y);
    return;
  }

  for (let i = 0; i < pts.length - 1; i++) {
    const midX = (pts[i].x + pts[i + 1].x) / 2;
    const midY = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
  }
  // Connect to last point
  const last = pts[pts.length - 1];
  ctx.lineTo(last.x, last.y);
}

export default KeteParticleCanvas;
