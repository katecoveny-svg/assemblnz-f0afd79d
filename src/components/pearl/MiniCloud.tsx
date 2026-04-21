import { useEffect, useMemo, useRef } from "react";
import cloudImg from "@/assets/hero-cloud-photoreal.png";

/**
 * MiniCloud — a soft, near-white photoreal cumulus with an embedded
 * twinkling data-light network. The cloud image is desaturated and
 * brightness-lifted in CSS so the pounamu green reads as nearly white;
 * the network of bright cyan-white nodes + connecting lines on top
 * makes the "data" reading unmistakable.
 */
interface MiniCloudProps {
  size?: number;
  opacity?: number;
  drift?: "slow" | "med" | "fast";
  className?: string;
  /** show the embedded data-light network (default true) */
  lights?: boolean;
  /** number of network nodes (default scales with size) */
  nodeCount?: number;
}

interface Node {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

export default function MiniCloud({
  size = 200,
  opacity = 0.85,
  drift = "med",
  className = "",
  lights = true,
  nodeCount,
}: MiniCloudProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Build a deterministic-ish constellation of nodes inside the cloud's
  // visible silhouette (roughly an ellipse in the lower 70% of the box).
  const nodes = useMemo<Node[]>(() => {
    const target = nodeCount ?? Math.max(8, Math.min(22, Math.round(size / 28)));
    const out: Node[] = [];
    // simple seeded RNG so positions stay stable per mount
    let seed = Math.floor(size * 7 + 13);
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    let attempts = 0;
    while (out.length < target && attempts < target * 40) {
      attempts++;
      // sample inside an ellipse centered at (50, 58), rx 38, ry 26 (% units)
      const u = rnd();
      const v = rnd();
      const theta = u * Math.PI * 2;
      const rad = Math.sqrt(v);
      const x = 50 + Math.cos(theta) * rad * 38;
      const y = 58 + Math.sin(theta) * rad * 26;
      // reject if too close to an existing node
      if (out.some((n) => Math.hypot(n.x - x, n.y - y) < 9)) continue;
      out.push({
        x,
        y,
        r: 0.5 + rnd() * 0.8,
        phase: rnd() * Math.PI * 2,
        speed: 1.6 + rnd() * 2.2,
      });
    }
    return out;
  }, [size, nodeCount]);

  // Pre-compute edges: each node connects to its 2 nearest neighbours.
  const edges = useMemo(() => {
    const e: Array<{ a: number; b: number; dur: number; delay: number }> = [];
    const seen = new Set<string>();
    nodes.forEach((n, i) => {
      const neighbours = nodes
        .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
        .filter((x) => x.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      neighbours.forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) return;
        seen.add(key);
        e.push({ a: i, b: j, dur: 2.4 + Math.random() * 1.8, delay: Math.random() * 2 });
      });
    });
    return e;
  }, [nodes]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const speed = drift === "slow" ? 22000 : drift === "fast" ? 9000 : 14000;
    const phase = Math.random() * 2000;
    let raf = 0;
    const tick = () => {
      const t = performance.now() + phase;
      const y = Math.sin((t / speed) * Math.PI * 2) * 6;
      const x = Math.sin((t / (speed * 1.3)) * Math.PI * 2 + 0.7) * 4;
      const s = 1 + Math.sin((t / (speed * 0.9)) * Math.PI * 2) * 0.015;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [drift]);

  return (
    <div
      className={`relative pointer-events-none ${className}`}
      style={{ width: size, height: size, opacity }}
    >
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
          willChange: "transform",
          position: "relative",
        }}
      >
        <img
          src={cloudImg}
          alt=""
          aria-hidden
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            // Strip the green cast: kill saturation, lift brightness/contrast
            // slightly, and add a soft cool drop-shadow instead of pounamu.
            filter:
              "saturate(0.15) brightness(1.06) contrast(1.02) drop-shadow(0 14px 28px rgba(120,150,180,0.10))",
            userSelect: "none",
          }}
        />

        {lights && (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              overflow: "visible",
            }}
          >
            <defs>
              <radialGradient id={`mc-node-glow-${size}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="35%" stopColor="#CFE9FF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#7FB8E0" stopOpacity="0" />
              </radialGradient>
              <filter id={`mc-blur-${size}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.6" />
              </filter>
            </defs>

            {/* Edges: thin pulsing data lines between nodes */}
            <g
              style={{
                stroke: "#9FD4FF",
                strokeWidth: 0.18,
                fill: "none",
                mixBlendMode: "screen",
              }}
            >
              {edges.map((e, i) => {
                const a = nodes[e.a];
                const b = nodes[e.b];
                return (
                  <line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    style={{
                      animation: `mcEdgePulse ${e.dur}s ease-in-out ${e.delay}s infinite`,
                    }}
                  />
                );
              })}
            </g>

            {/* Soft glow halos behind each node */}
            <g style={{ mixBlendMode: "screen" }}>
              {nodes.map((n, i) => (
                <circle
                  key={`g-${i}`}
                  cx={n.x}
                  cy={n.y}
                  r={n.r * 3.6}
                  fill={`url(#mc-node-glow-${size})`}
                  filter={`url(#mc-blur-${size})`}
                  style={{
                    transformOrigin: `${n.x}px ${n.y}px`,
                    animation: `mcNodeTwinkle ${n.speed}s ease-in-out ${n.phase}s infinite`,
                  }}
                />
              ))}
            </g>

            {/* Bright twinkling cores */}
            <g style={{ mixBlendMode: "screen" }}>
              {nodes.map((n, i) => (
                <circle
                  key={`c-${i}`}
                  cx={n.x}
                  cy={n.y}
                  r={n.r}
                  fill="#FFFFFF"
                  style={{
                    transformOrigin: `${n.x}px ${n.y}px`,
                    animation: `mcNodeCore ${n.speed * 0.7}s ease-in-out ${n.phase}s infinite`,
                  }}
                />
              ))}
            </g>

            <style>{`
              @keyframes mcNodeTwinkle {
                0%, 100% { opacity: 0.35; transform: scale(0.85); }
                50%      { opacity: 1;    transform: scale(1.25); }
              }
              @keyframes mcNodeCore {
                0%, 100% { opacity: 0.55; }
                50%      { opacity: 1; }
              }
              @keyframes mcEdgePulse {
                0%, 100% { opacity: 0.15; }
                50%      { opacity: 0.7; }
              }
            `}</style>
          </svg>
        )}
      </div>
    </div>
  );
}
