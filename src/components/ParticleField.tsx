import { useEffect, useRef, Component, type ReactNode } from "react";

class ParticleErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? null : this.props.children; }
}

/**
 * Matariki Field — Star clusters scattered across the background like
 * the Pleiades / Matariki constellation. Each cluster is a group of 7
 * tightly-packed twinkling stars with subtle connecting lines.
 * Multiple clusters at different positions represent data/intelligence nodes.
 */

// Mārama palette — moonlight whites and silvers with faint gold warmth
const PURE_WHITE = [255, 255, 255];
const SILVER = [220, 230, 245];
const WARM_SILVER = [240, 235, 220]; // faintest gold warmth
const SOFT_GOLD = [245, 230, 190]; // like distant moonlight

const PALETTE = [PURE_WHITE, PURE_WHITE, SILVER, SILVER, WARM_SILVER, SOFT_GOLD];

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: number[];
}

interface Cluster {
  cx: number;
  cy: number;
  stars: Star[];
  color: number[];
}

function createCluster(cx: number, cy: number, color: number[], large = false): Cluster {
  const stars: Star[] = [];
  const count = large ? (8 + Math.floor(Math.random() * 4)) : (6 + Math.floor(Math.random() * 3)); // 6-11 stars
  const spread = large ? 50 : 38;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 8 + Math.random() * spread;
    stars.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      size: i === 0 ? (large ? 3 : 2.5) : 1 + Math.random() * 1.5,
      baseAlpha: 0.55 + Math.random() * 0.45, // brighter
      twinkleSpeed: 0.003 + Math.random() * 0.006, // faster twinkle
      twinklePhase: Math.random() * Math.PI * 2,
      color: i < 2 ? color : PURE_WHITE, // mostly white, lead stars pick up cluster tint
    });
  }
  return { cx, cy, stars, color };
}

const MatarikiCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animFrame: number;
    let cancelled = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Fixed viewport canvas — GPU-composited, stars visible on every section as you scroll
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

    // Create Matariki clusters scattered across the viewport — DENSE starfield
    const clusterCount = Math.max(18, Math.min(28, Math.floor((W() * H()) / 60000)));
    const clusters: Cluster[] = [];
    for (let i = 0; i < clusterCount; i++) {
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const isLarge = i < 6; // first 6 clusters are larger/brighter
      clusters.push(createCluster(
        60 + Math.random() * (W() - 120),
        60 + Math.random() * (H() - 120),
        color,
        isLarge,
      ));
    }

    // Scattered individual background stars — many more, brighter
    const bgStars: Star[] = [];
    const bgCount = Math.max(120, Math.min(200, Math.floor((W() * H()) / 8000)));
    for (let i = 0; i < bgCount; i++) {
      const isBright = Math.random() < 0.15; // 15% chance of a bright star
      bgStars.push({
        x: Math.random() * W(),
        y: Math.random() * H(),
        size: isBright ? (1 + Math.random() * 1.2) : (0.4 + Math.random() * 0.9),
        baseAlpha: isBright ? (0.5 + Math.random() * 0.4) : (0.2 + Math.random() * 0.35),
        twinkleSpeed: prefersReduced ? 0 : 0.002 + Math.random() * 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: isBright ? SOFT_GOLD : PURE_WHITE, // bright stars get warm moonlight tint
      });
    }

    let t = 0;
    const draw = () => {
      if (cancelled) return;
      try {
        ctx.clearRect(0, 0, W(), H());
        t += 1;

        // Background stars — vivid twinkle
        for (const s of bgStars) {
          s.twinklePhase += s.twinkleSpeed;
          const twinkle = (Math.sin(s.twinklePhase) + 1) / 2;
          const a = s.baseAlpha * (0.3 + twinkle * 0.7); // wider range = more visible twinkle
          const [r, g, b] = s.color;

          // Bright stars get a glow halo too
          if (s.size > 1) {
            const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 6);
            grad.addColorStop(0, `rgba(${r},${g},${b},${a * 0.3})`);
            grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * 6, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.fill();
        }

        // Matariki clusters
        for (const cluster of clusters) {
          // Connecting lines within cluster
          for (let i = 0; i < cluster.stars.length; i++) {
            for (let j = i + 1; j < cluster.stars.length; j++) {
              const a = cluster.stars[i], b = cluster.stars[j];
              const dx = a.x - b.x, dy = a.y - b.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 60) {
                const opacity = (1 - dist / 60) * 0.22;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                // White/silver constellation lines — moonlit
                ctx.strokeStyle = `rgba(220,230,245,${opacity})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
              }
            }
          }

          // Stars — vivid twinkle with breathing effect
          for (const s of cluster.stars) {
            s.twinklePhase += s.twinkleSpeed;
            const twinkle = (Math.sin(s.twinklePhase) + 1) / 2;
            const breathe = (Math.sin(t * 0.008 + s.twinklePhase) + 1) / 2; // slow breathe
            const a = s.baseAlpha * (0.25 + twinkle * 0.55 + breathe * 0.2);
            const [r, g, b] = s.color;

            // Glow halo — larger, brighter
            const haloR = s.size * 10;
            const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, haloR);
            grad.addColorStop(0, `rgba(${r},${g},${b},${a * 0.4})`);
            grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(s.x, s.y, haloR, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Star core
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
            ctx.fill();
          }
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
    <MatarikiCanvas />
  </ParticleErrorBoundary>
);

export default ParticleField;
