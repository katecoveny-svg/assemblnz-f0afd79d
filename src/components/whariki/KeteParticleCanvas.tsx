import { useEffect, useRef, useCallback } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseX: number;
  baseY: number;
  isGold: boolean;
  glowPhase: number;
}

/**
 * Kete-shaped particle constellation with rich glow effects.
 * Nodes arranged in a woven kete (basket) silhouette with handle.
 */
const KeteParticleCanvas = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef(0);
  const visible = useRef(true);
  const timeRef = useRef(0);

  const initNodes = useCallback((w: number, h: number) => {
    const isMobile = w < 768;
    const nodes: Node[] = [];
    const cx = w / 2;
    const cy = h / 2 + h * 0.05;
    const scale = Math.min(w, h) * (isMobile ? 0.35 : 0.32);

    // Kete body outline — wider at top, narrower at bottom (like a woven basket)
    const bodyPoints = 40;
    for (let i = 0; i < bodyPoints; i++) {
      const t = i / bodyPoints;
      const angle = t * Math.PI * 2;
      // Elliptical shape wider at top
      const yFactor = Math.sin(angle);
      const xFactor = Math.cos(angle);
      const widthAtY = 1.0 - yFactor * 0.25; // wider top, narrower bottom
      const px = cx + xFactor * scale * widthAtY * 0.9;
      const py = cy + yFactor * scale * 0.7;
      nodes.push(makeNode(px, py, i % 5 === 0));
    }

    // Horizontal weave rings (aho)
    for (let ring = 0; ring < 6; ring++) {
      const ringY = -0.5 + ring * 0.2;
      const ringWidth = 1.0 - Math.abs(ringY) * 0.35;
      const pts = isMobile ? 8 : 12;
      for (let i = 0; i < pts; i++) {
        const t = (i / pts) * Math.PI * 2;
        const px = cx + Math.cos(t) * scale * ringWidth * 0.8;
        const py = cy + ringY * scale * 0.65 + Math.sin(t * 2) * 4;
        nodes.push(makeNode(px, py, ring % 3 === 0));
      }
    }

    // Vertical weave strands (whenu)
    for (let strand = 0; strand < (isMobile ? 6 : 10); strand++) {
      const angle = (strand / (isMobile ? 6 : 10)) * Math.PI * 2;
      for (let j = 0; j < 5; j++) {
        const t = -0.5 + j * 0.25;
        const width = 1.0 - Math.abs(t) * 0.35;
        const px = cx + Math.cos(angle) * scale * width * 0.75;
        const py = cy + t * scale * 0.6;
        nodes.push(makeNode(px, py, false));
      }
    }

    // Kete handle (arc above)
    const handlePts = isMobile ? 8 : 14;
    for (let i = 0; i <= handlePts; i++) {
      const t = i / handlePts;
      const angle = Math.PI + t * Math.PI; // semicircle above
      const px = cx + Math.cos(angle) * scale * 0.45;
      const py = cy - scale * 0.7 + Math.sin(angle) * scale * 0.4;
      nodes.push(makeNode(px, py, i % 4 === 0));
    }

    // Scatter a few ambient nodes around the kete
    const ambient = isMobile ? 6 : 12;
    for (let i = 0; i < ambient; i++) {
      const px = cx + (Math.random() - 0.5) * w * 0.85;
      const py = cy + (Math.random() - 0.5) * h * 0.7;
      nodes.push(makeNode(px, py, Math.random() < 0.2));
    }

    nodesRef.current = nodes;
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
      nodesRef.current = [];
      initNodes(rect.width, rect.height);
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

    const POUNAMU = [58, 125, 110];
    const POUNAMU_GLOW = [126, 207, 194];
    const GOLD = [212, 168, 83];
    const GOLD_GLOW = [240, 208, 120];
    const CONNECTION_DIST = 130;

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

      const nodes = nodesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update positions — gentle drift around base position
      for (const n of nodes) {
        n.x = n.baseX + Math.sin(time * 0.5 + n.glowPhase) * 3;
        n.y = n.baseY + Math.cos(time * 0.4 + n.glowPhase * 1.3) * 2.5;

        // Mouse attraction
        const dx = mx - n.x;
        const dy = my - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 1) {
          n.x += dx * 0.015;
          n.y += dy * 0.015;
        }
      }

      // Draw connections — woven paired strands
      let strandIdx = 0;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > CONNECTION_DIST) continue;

          const alpha = (1 - dist / CONNECTION_DIST) * 0.35;
          const isGoldStrand = strandIdx % 7 === 0;
          const c = isGoldStrand ? GOLD : POUNAMU;

          const nx = -dy / dist * 1.2;
          const ny = dx / dist * 1.2;
          const midX = (nodes[i].x + nodes[j].x) / 2;
          const midY = (nodes[i].y + nodes[j].y) / 2;

          ctx.beginPath();
          ctx.moveTo(nodes[i].x + nx, nodes[i].y + ny);
          ctx.quadraticCurveTo(midX - nx * 2.5, midY - ny * 2.5, nodes[j].x + nx, nodes[j].y + ny);
          ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
          ctx.lineWidth = isGoldStrand ? 1.2 : 0.8;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(nodes[i].x - nx, nodes[i].y - ny);
          ctx.quadraticCurveTo(midX + nx * 2.5, midY + ny * 2.5, nodes[j].x - nx, nodes[j].y - ny);
          ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha * 0.5})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();

          strandIdx++;
        }
      }

      // Draw nodes with rich glow
      for (const n of nodes) {
        const dx = mx - n.x;
        const dy = my - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNear = dist < 150;
        const pulse = 0.7 + Math.sin(time * 2 + n.glowPhase) * 0.3;

        const c = n.isGold ? GOLD : POUNAMU;
        const cg = n.isGold ? GOLD_GLOW : POUNAMU_GLOW;
        const intensity = isNear ? 1.0 : pulse * 0.6;

        // Outer glow halo
        const glowSize = (isNear ? 18 : 12) * intensity;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowSize);
        grad.addColorStop(0, `rgba(${cg[0]},${cg[1]},${cg[2]},${0.35 * intensity})`);
        grad.addColorStop(0.4, `rgba(${c[0]},${c[1]},${c[2]},${0.12 * intensity})`);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Mid glow
        const midGlow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 6);
        midGlow.addColorStop(0, `rgba(${cg[0]},${cg[1]},${cg[2]},${0.6 * intensity})`);
        midGlow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = midGlow;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(n.x, n.y, isNear ? 2.5 : 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cg[0]},${cg[1]},${cg[2]},${0.9 * intensity})`;
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
  }, [initNodes]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: "auto" }}
    />
  );
};

function makeNode(x: number, y: number, isGold: boolean): Node {
  return {
    x, y,
    baseX: x,
    baseY: y,
    vx: 0,
    vy: 0,
    r: 2 + Math.random() * 2,
    isGold,
    glowPhase: Math.random() * Math.PI * 2,
  };
}

export default KeteParticleCanvas;
