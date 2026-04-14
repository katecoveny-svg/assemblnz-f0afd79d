import { useEffect, useRef, useCallback } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/**
 * Kete Particle Canvas — woven strands connecting micro nodes.
 * Hero background with mouse interaction.
 */
const KeteParticleCanvas = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef(0);
  const visible = useRef(true);

  const initNodes = useCallback((w: number, h: number) => {
    const isMobile = w < 768;
    const count = isMobile ? 40 : 70;
    const nodes: Node[] = [];
    for (let i = 0; i < count; i++) {
      // Cluster denser in center
      const cx = w / 2 + (Math.random() - 0.5) * w * 0.9;
      const cy = h / 2 + (Math.random() - 0.5) * h * 0.9;
      nodes.push({
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: 3 + Math.random() * 2,
      });
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
      if (nodesRef.current.length === 0) initNodes(rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener("mousemove", handleMouse);

    // IntersectionObserver to pause when off-screen
    const obs = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    }, { threshold: 0.05 });
    obs.observe(canvas);

    const POUNAMU = "58,125,110";
    const GOLD = "212,168,83";
    const CONNECTION_DIST = 160;

    const draw = () => {
      if (!visible.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      const w = canvas.width / (Math.min(window.devicePixelRatio, 2));
      const h = canvas.height / (Math.min(window.devicePixelRatio, 2));
      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        // Mouse attraction
        const dx = mx - n.x;
        const dy = my - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 1) {
          n.x += dx * 0.003;
          n.y += dy * 0.003;
        }
      }

      // Draw strands (connections)
      let strandIdx = 0;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > CONNECTION_DIST) continue;

          const alpha = (1 - dist / CONNECTION_DIST) * 0.5;
          const isGold = strandIdx % 5 === 0;
          const color = isGold ? GOLD : POUNAMU;

          // Draw two parallel strands with slight offset (woven pair)
          const nx = -dy / dist * 1.5;
          const ny = dx / dist * 1.5;
          const midX = (nodes[i].x + nodes[j].x) / 2;
          const midY = (nodes[i].y + nodes[j].y) / 2;

          // Strand A
          ctx.beginPath();
          ctx.moveTo(nodes[i].x + nx, nodes[i].y + ny);
          ctx.quadraticCurveTo(midX - nx * 2, midY - ny * 2, nodes[j].x + nx, nodes[j].y + ny);
          ctx.strokeStyle = `rgba(${color},${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Strand B  
          ctx.beginPath();
          ctx.moveTo(nodes[i].x - nx, nodes[i].y - ny);
          ctx.quadraticCurveTo(midX + nx * 2, midY + ny * 2, nodes[j].x - nx, nodes[j].y - ny);
          ctx.strokeStyle = `rgba(${color},${alpha * 0.7})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          strandIdx++;
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dx = mx - n.x;
        const dy = my - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNear = dist < 150;
        const nodeColor = isNear ? `rgba(${GOLD},0.8)` : `rgba(${POUNAMU},0.5)`;
        const size = isNear ? 5 : n.r;

        // Glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, size * 2, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, size * 2);
        grad.addColorStop(0, isNear ? `rgba(${GOLD},0.3)` : `rgba(${POUNAMU},0.15)`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(n.x, n.y, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
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

export default KeteParticleCanvas;
