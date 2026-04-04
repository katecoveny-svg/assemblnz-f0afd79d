import { useEffect, useRef, Component, type ReactNode } from "react";

class ParticleErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? null : this.props.children; }
}

/** Whenua palette hex → RGB arrays */
const ACCENT_COLORS = [
  [212, 168, 67],  // Kōwhai gold
  [58, 125, 110],  // Pounamu teal
  [123, 104, 238], // Tech purple
  [74, 122, 181],  // Mid-blue
  [193, 122, 58],  // Tōtara amber
  [137, 207, 240], // Sky blue
];

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulse: number;
  color: number[];
  isNode: boolean;
}

const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animFrame: number;
    let cancelled = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (cancelled) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const CONNECTION_DIST = 180;

    const stars: Star[] = [];
    const count = Math.min(80, Math.floor((W() * H()) / 15000));

    for (let i = 0; i < count; i++) {
      const isNode = Math.random() < 0.2;
      const color = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
      stars.push({
        x: Math.random() * W(),
        y: Math.random() * H(),
        vx: prefersReduced ? 0 : (Math.random() - 0.5) * 0.15,
        vy: prefersReduced ? 0 : (Math.random() - 0.5) * 0.15,
        size: isNode ? Math.random() * 2.5 + 2 : Math.random() * 1.2 + 0.4,
        alpha: isNode ? Math.random() * 0.6 + 0.35 : Math.random() * 0.3 + 0.08,
        pulse: Math.random() * Math.PI * 2,
        color,
        isNode,
      });
    }

    const draw = () => {
      if (cancelled) return;
      try {
        ctx.clearRect(0, 0, W(), H());

        // Update positions
        for (const s of stars) {
          s.x += s.vx;
          s.y += s.vy;
          s.pulse += 0.006;
          if (s.x < -10) s.x = W() + 10;
          if (s.x > W() + 10) s.x = -10;
          if (s.y < -10) s.y = H() + 10;
          if (s.y > H() + 10) s.y = -10;
        }

        // Draw constellation lines between nearby stars
        for (let i = 0; i < stars.length; i++) {
          for (let j = i + 1; j < stars.length; j++) {
            const dx = stars[i].x - stars[j].x;
            const dy = stars[i].y - stars[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECTION_DIST) {
              const opacity = (1 - dist / CONNECTION_DIST) * 0.12;
              const c = stars[i].color;
              ctx.beginPath();
              ctx.moveTo(stars[i].x, stars[i].y);
              ctx.lineTo(stars[j].x, stars[j].y);
              ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }

        // Draw stars
        for (const s of stars) {
          const glow = (Math.sin(s.pulse) + 1) / 2;
          const a = s.alpha * (0.5 + glow * 0.5);
          const [r, g, b] = s.color;

          // Node glow ring
          if (s.isNode) {
            const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 6);
            grad.addColorStop(0, `rgba(${r},${g},${b},${a * 0.25})`);
            grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * 6, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
          }

          // Core dot
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = s.isNode
            ? `rgba(${r},${g},${b},${a})`
            : `rgba(255,255,255,${a * 0.8})`;
          ctx.fill();
        }

        animFrame = requestAnimationFrame(draw);
      } catch {
        // Canvas detached
      }
    };

    animFrame = requestAnimationFrame(draw);
    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
};

const ParticleField = () => (
  <ParticleErrorBoundary>
    <ParticleCanvas />
  </ParticleErrorBoundary>
);

export default ParticleField;
