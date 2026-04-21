import { useEffect, useMemo, useRef, useState } from "react";

/**
 * FluffyCloud — interactive sparkly cumulus, drawn in SVG.
 *
 * After several attempts with point-sprite WebGL clouds that read as
 * scattered dots, this version uses the right tool: overlapping soft
 * white ellipses with heavy Gaussian blur to form a REAL cumulus
 * silhouette. SVG composites predictably on the warm pearl canvas,
 * looks like a cloud at any zoom, and is cheap to animate.
 *
 * Public exports:
 *   <HeroCloud />          giant interactive hero cloud
 *   <FluffyCloudScene />   small atmospheric wisp
 *   <FairyLightStrand />   hairline fairy-light strand
 */

/* ───────────────── Palette (warm pearl, golden hour) ───────────────── */
const CANDLE_WARM = "#F8E9C4";  // candle-warm sparkle core
const POUNAMU = "#1F4D47";       // deep pounamu (thread, hint of green)
const POUNAMU_GLOW = "#3A8077";  // softer pounamu glow

/* ───────────────── Cloud puff geometry ───────────────── */

interface Puff {
  /** centre x in viewBox units */
  cx: number;
  /** centre y in viewBox units */
  cy: number;
  /** horizontal radius */
  rx: number;
  /** vertical radius */
  ry: number;
  /** opacity 0..1 */
  op: number;
  /** breathing weight (0..1) — how much this puff swells with the cycle */
  breath: number;
  /** breathing phase offset */
  phase: number;
  /** layer: 0 = back rim, 1 = body, 2 = highlight cap */
  layer: 0 | 1 | 2;
}

/** Hand-tuned cumulus silhouette inside a 1000×460 viewBox.
 *  Built like real cumulus: flatter base, billowy cauliflower top,
 *  stacked overlapping ellipses for volume. */
const HERO_PUFFS: Puff[] = [
  // ── back rim (cooler, larger, drifts behind) ──
  { cx: 220, cy: 260, rx: 170, ry: 130, op: 0.55, breath: 0.9, phase: 0.0, layer: 0 },
  { cx: 380, cy: 220, rx: 200, ry: 155, op: 0.6,  breath: 0.7, phase: 0.6, layer: 0 },
  { cx: 560, cy: 200, rx: 230, ry: 175, op: 0.6,  breath: 1.0, phase: 1.2, layer: 0 },
  { cx: 740, cy: 230, rx: 200, ry: 150, op: 0.55, breath: 0.8, phase: 1.8, layer: 0 },
  { cx: 870, cy: 270, rx: 150, ry: 115, op: 0.5,  breath: 0.6, phase: 2.4, layer: 0 },

  // ── main warm pearl body (densest, brightest) ──
  { cx: 280, cy: 280, rx: 130, ry: 105, op: 0.95, breath: 0.5, phase: 0.3, layer: 1 },
  { cx: 360, cy: 240, rx: 125, ry: 110, op: 1.0,  breath: 0.8, phase: 0.9, layer: 1 },
  { cx: 460, cy: 215, rx: 145, ry: 130, op: 1.0,  breath: 1.0, phase: 1.5, layer: 1 },
  { cx: 560, cy: 205, rx: 155, ry: 140, op: 1.0,  breath: 0.9, phase: 2.1, layer: 1 },
  { cx: 660, cy: 220, rx: 145, ry: 125, op: 1.0,  breath: 0.8, phase: 2.7, layer: 1 },
  { cx: 750, cy: 250, rx: 130, ry: 110, op: 0.95, breath: 0.6, phase: 3.3, layer: 1 },
  { cx: 820, cy: 290, rx: 105, ry: 90,  op: 0.9,  breath: 0.5, phase: 3.9, layer: 1 },
  // flatter base
  { cx: 350, cy: 320, rx: 130, ry: 70,  op: 0.85, breath: 0.4, phase: 4.2, layer: 1 },
  { cx: 500, cy: 335, rx: 180, ry: 75,  op: 0.9,  breath: 0.4, phase: 4.5, layer: 1 },
  { cx: 660, cy: 325, rx: 150, ry: 70,  op: 0.85, breath: 0.4, phase: 4.8, layer: 1 },

  // ── sun-warmed highlight cap (golden-hour catching the top) ──
  { cx: 430, cy: 195, rx: 80,  ry: 65,  op: 0.7,  breath: 0.9, phase: 1.0, layer: 2 },
  { cx: 540, cy: 178, rx: 95,  ry: 75,  op: 0.78, breath: 1.0, phase: 1.7, layer: 2 },
  { cx: 640, cy: 195, rx: 80,  ry: 65,  op: 0.7,  breath: 0.8, phase: 2.4, layer: 2 },
];

/** Smaller wisp silhouette — a single billow with a flat base. */
const WISP_PUFFS: Puff[] = [
  { cx: 200, cy: 130, rx: 100, ry: 75, op: 0.55, breath: 0.8, phase: 0.0, layer: 0 },
  { cx: 320, cy: 115, rx: 110, ry: 80, op: 0.6,  breath: 1.0, phase: 0.7, layer: 0 },
  { cx: 440, cy: 130, rx: 95,  ry: 70, op: 0.55, breath: 0.7, phase: 1.4, layer: 0 },
  { cx: 280, cy: 130, rx: 80,  ry: 65, op: 0.95, breath: 0.6, phase: 0.3, layer: 1 },
  { cx: 360, cy: 115, rx: 90,  ry: 70, op: 1.0,  breath: 0.9, phase: 0.9, layer: 1 },
  { cx: 250, cy: 165, rx: 110, ry: 35, op: 0.8,  breath: 0.3, phase: 1.8, layer: 1 },
  { cx: 380, cy: 168, rx: 110, ry: 35, op: 0.8,  breath: 0.3, phase: 2.1, layer: 1 },
  { cx: 340, cy: 95,  rx: 55,  ry: 42, op: 0.7,  breath: 1.0, phase: 1.2, layer: 2 },
];

/* ───────────────── Sparkles ───────────────── */

interface Sparkle {
  x: number;
  y: number;
  r: number;
  delay: number;
  dur: number;
  /** 0 = deep inside (dim, foggy), 1 = surface (bright, sharp) */
  surface: number;
}

function makeSparkles(count: number, w: number, h: number, seed = 1): Sparkle[] {
  // tiny seeded RNG so the sparkles are stable per-mount
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  return Array.from({ length: count }, () => {
    const surface = rnd();
    return {
      // bias sparkles toward cloud body shape (centre-weighted)
      x: w * (0.15 + (rnd() + rnd()) * 0.35),
      y: h * (0.2 + (rnd() + rnd()) * 0.3),
      r: surface > 0.55 ? 1.6 + rnd() * 1.4 : 1.0 + rnd() * 0.8,
      delay: rnd() * 6,
      // 2–6s twinkle, no pattern
      dur: 2 + rnd() * 4,
      surface,
    };
  });
}

/* ───────────────── Hero cloud ───────────────── */

interface HeroCloudProps {
  height?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function HeroCloud({
  height = 760,
  opacity = 0.97,
  className = "",
  style,
}: HeroCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudGroupRef = useRef<SVGGElement>(null);
  const [reduced, setReduced] = useState(false);

  // cursor follow with 350ms lag
  const target = useRef({ x: 0, y: 0 });
  const lagged = useRef({ x: 0, y: 0 });
  const scrollY = useRef(0);
  const breathe = useRef(0);
  const t0 = useRef(performance.now());

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = () => setReduced(mq.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduced) return;

    const handlePointer = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      target.current.x = Math.max(-1, Math.min(1, nx));
      target.current.y = Math.max(-1, Math.min(1, ny));
    };
    const handleLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };
    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };
    window.addEventListener("pointermove", handlePointer, { passive: true });
    el.addEventListener("pointerleave", handleLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    let raf = 0;
    let lastT = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      // 350ms ease toward target
      const k = 1 - Math.exp(-dt / 0.38);
      lagged.current.x += (target.current.x - lagged.current.x) * k;
      lagged.current.y += (target.current.y - lagged.current.y) * k;

      // ambient breath (14s cycle)
      const elapsed = (now - t0.current) / 1000;
      breathe.current = Math.sin(elapsed * (Math.PI * 2) / 14);

      const g = cloudGroupRef.current;
      if (g) {
        // cursor offset (subtle), scroll parallax (gentle upward drift),
        // breathing (tiny scale pulse)
        const tx = lagged.current.x * 28;
        const ty = lagged.current.y * 14 - scrollY.current * 0.18;
        const sc = 1 + breathe.current * 0.018;
        g.setAttribute(
          "transform",
          `translate(${tx} ${ty}) scale(${sc})`
        );
        g.style.transformOrigin = "500px 250px";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", handlePointer);
      el.removeEventListener("pointerleave", handleLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [reduced]);

  const sparkles = useMemo(() => makeSparkles(70, 1000, 460, 7), []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height,
        opacity,
        position: "relative",
        pointerEvents: "auto",
        ...style,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 460"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          {/* Soft blur — light enough to keep puffs visible as billows, heavy
              enough to dissolve hard edges. */}
          <filter id="cloudBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="cloudBlurSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="cloudShadowBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id="sparkleGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2" />
          </filter>

          {/* Golden-hour core glow — sits behind the cloud, makes it lit from inside */}
          <radialGradient id="goldenCore" cx="50%" cy="48%" r="50%">
            <stop offset="0%" stopColor="#FFD89A" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#FFE6B8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFE6B8" stopOpacity="0" />
          </radialGradient>
          {/* Subtle pounamu mist — green light filtering through moisture */}
          <radialGradient id="pounamuMist" cx="50%" cy="55%" r="60%">
            <stop offset="0%" stopColor={POUNAMU} stopOpacity="0.10" />
            <stop offset="100%" stopColor={POUNAMU} stopOpacity="0" />
          </radialGradient>
          {/* Cool shadow — sits BENEATH the cloud body to give it volume against pearl */}
          <radialGradient id="cloudShadow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#8FA39F" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#A8B8B5" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#C4D6D2" stopOpacity="0" />
          </radialGradient>
          {/* Per-puff body fill — bright white core with cool falloff so each
              puff reads as a 3D billow against its neighbours. */}
          <radialGradient id="puffBody" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="35%" stopColor="#FBFAF4" stopOpacity="1" />
            <stop offset="68%" stopColor="#D8DCD6" stopOpacity="0.92" />
            <stop offset="92%" stopColor="#A8B5B1" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#A8B5B1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="puffRim" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#C8D0CC" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#A8B5B1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="puffCap" cx="40%" cy="32%" r="55%">
            <stop offset="0%" stopColor="#FFD89A" stopOpacity="1" />
            <stop offset="60%" stopColor="#FFE9C2" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFE9C2" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Golden-hour glow + pounamu mist — fixed behind, doesn't move with cursor */}
        <ellipse cx="500" cy="240" rx="300" ry="180" fill="url(#goldenCore)" />
        <ellipse cx="500" cy="270" rx="380" ry="200" fill="url(#pounamuMist)" />

        <g ref={cloudGroupRef}>
          {/* Layer -1 — soft cool SHADOW underneath the cloud body. This is what
              makes the white puffs read as VOLUME against the warm pearl canvas.
              Offset down + right to suggest sunlight from upper-left. */}
          <g filter="url(#cloudShadowBlur)" transform="translate(18 32)">
            {HERO_PUFFS.filter((p) => p.layer === 1).map((p, i) => (
              <ellipse
                key={`sh${i}`}
                cx={p.cx}
                cy={p.cy}
                rx={p.rx * 1.05}
                ry={p.ry * 1.05}
                fill="url(#cloudShadow)"
                opacity={p.op * 0.85}
              />
            ))}
          </g>

          {/* Layer 0 — cool back rim, heavily blurred */}
          <g filter="url(#cloudBlurSoft)">
            {HERO_PUFFS.filter((p) => p.layer === 0).map((p, i) => (
              <ellipse
                key={`r${i}`}
                cx={p.cx}
                cy={p.cy}
                rx={p.rx}
                ry={p.ry}
                fill="url(#puffRim)"
                opacity={p.op}
              >
                {!reduced && (
                  <animate
                    attributeName="rx"
                    values={`${p.rx};${p.rx * (1 + p.breath * 0.04)};${p.rx}`}
                    dur={`${14 + p.phase}s`}
                    repeatCount="indefinite"
                  />
                )}
              </ellipse>
            ))}
          </g>

          {/* Layer 1 — main warm pearl body */}
          <g filter="url(#cloudBlur)">
            {HERO_PUFFS.filter((p) => p.layer === 1).map((p, i) => (
              <ellipse
                key={`b${i}`}
                cx={p.cx}
                cy={p.cy}
                rx={p.rx}
                ry={p.ry}
                fill="url(#puffBody)"
                opacity={p.op}
              >
                {!reduced && (
                  <>
                    <animate
                      attributeName="rx"
                      values={`${p.rx};${p.rx * (1 + p.breath * 0.05)};${p.rx}`}
                      dur={`${13 + p.phase}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="ry"
                      values={`${p.ry};${p.ry * (1 + p.breath * 0.06)};${p.ry}`}
                      dur={`${15 + p.phase}s`}
                      repeatCount="indefinite"
                    />
                  </>
                )}
              </ellipse>
            ))}
          </g>

          {/* Layer 2 — sun-warmed highlight cap */}
          <g filter="url(#cloudBlur)" style={{ mixBlendMode: "screen" }}>
            {HERO_PUFFS.filter((p) => p.layer === 2).map((p, i) => (
              <ellipse
                key={`c${i}`}
                cx={p.cx}
                cy={p.cy}
                rx={p.rx}
                ry={p.ry}
                fill="url(#puffCap)"
                opacity={p.op}
              />
            ))}
          </g>

          {/* Candle-warm fairy lights INSIDE the cloud */}
          <g filter="url(#sparkleGlow)">
            {sparkles.map((s, i) => (
              <g key={`s${i}`} transform={`translate(${s.x} ${s.y})`}>
                {/* soft halo */}
                <circle
                  r={s.r * 4.5}
                  fill={CANDLE_WARM}
                  opacity={0.18 * (0.4 + s.surface * 0.6)}
                >
                  {!reduced && (
                    <animate
                      attributeName="opacity"
                      values={`${0.05};${0.45 * (0.4 + s.surface * 0.6)};${0.08}`}
                      dur={`${s.dur}s`}
                      begin={`${s.delay}s`}
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
                {/* tight bright core */}
                <circle r={s.r} fill="#FFFBE8" opacity={0.6 + s.surface * 0.4}>
                  {!reduced && (
                    <animate
                      attributeName="opacity"
                      values={`${0.3};${0.95 * (0.5 + s.surface * 0.5)};${0.35}`}
                      dur={`${s.dur}s`}
                      begin={`${s.delay}s`}
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ───────────────── Smaller wisp ───────────────── */

interface FluffyCloudSceneProps {
  intensity?: "subtle" | "soft" | "rich";
  tone?: "pounamu" | "warm" | "mixed";
  className?: string;
  style?: React.CSSProperties;
  height?: number;
  opacity?: number;
}

export default function FluffyCloudScene({
  intensity = "soft",
  className = "",
  style,
  height = 200,
  opacity = 0.85,
}: FluffyCloudSceneProps) {
  const sparkles = useMemo(() => {
    const n = intensity === "subtle" ? 8 : intensity === "rich" ? 24 : 14;
    return makeSparkles(n, 600, 220, 13);
  }, [intensity]);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height,
        opacity,
        position: "relative",
        pointerEvents: "none",
        ...style,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 600 220"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <filter id="wispBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="wispBlurSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <radialGradient id="wispBody" cx="42%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#FFFEF8" stopOpacity="1" />
            <stop offset="55%" stopColor="#FFFBF2" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFBF2" stopOpacity="0.4" />
          </radialGradient>
          <radialGradient id="wispRim" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#FFFBF2" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#EFF1EC" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wispCap" cx="42%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#FFE9C2" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFE9C2" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g>
          <g filter="url(#wispBlurSoft)">
            {WISP_PUFFS.filter((p) => p.layer === 0).map((p, i) => (
              <ellipse
                key={`wr${i}`}
                cx={p.cx}
                cy={p.cy}
                rx={p.rx}
                ry={p.ry}
                fill="url(#wispRim)"
                opacity={p.op}
              />
            ))}
          </g>
          <g filter="url(#wispBlur)">
            {WISP_PUFFS.filter((p) => p.layer === 1).map((p, i) => (
              <ellipse
                key={`wb${i}`}
                cx={p.cx}
                cy={p.cy}
                rx={p.rx}
                ry={p.ry}
                fill="url(#wispBody)"
                opacity={p.op}
              >
                <animate
                  attributeName="rx"
                  values={`${p.rx};${p.rx * (1 + p.breath * 0.04)};${p.rx}`}
                  dur={`${18 + p.phase * 2}s`}
                  repeatCount="indefinite"
                />
              </ellipse>
            ))}
          </g>
          <g filter="url(#wispBlur)" style={{ mixBlendMode: "screen" }}>
            {WISP_PUFFS.filter((p) => p.layer === 2).map((p, i) => (
              <ellipse
                key={`wc${i}`}
                cx={p.cx}
                cy={p.cy}
                rx={p.rx}
                ry={p.ry}
                fill="url(#wispCap)"
                opacity={p.op}
              />
            ))}
          </g>
          <g>
            {sparkles.map((s, i) => (
              <g key={`ws${i}`} transform={`translate(${s.x * 0.9 + 30} ${s.y * 0.85 + 10})`}>
                <circle
                  r={s.r * 3.5}
                  fill={CANDLE_WARM}
                  opacity={0.15}
                >
                  <animate
                    attributeName="opacity"
                    values="0.05;0.35;0.08"
                    dur={`${s.dur}s`}
                    begin={`${s.delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r={s.r * 0.8} fill="#FFFBE8" opacity={0.7}>
                  <animate
                    attributeName="opacity"
                    values="0.3;0.95;0.35"
                    dur={`${s.dur}s`}
                    begin={`${s.delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ───────────────── Fairy light strand ───────────────── */

export function FairyLightStrand({
  className = "",
  width = 320,
  height = 90,
  bulbs = 7,
  direction = "drape",
  style,
}: {
  className?: string;
  width?: number;
  height?: number;
  bulbs?: number;
  direction?: "drape" | "rise";
  style?: React.CSSProperties;
}) {
  const id = useMemo(() => `fl-${Math.random().toString(36).slice(2, 8)}`, []);
  const sag = direction === "drape" ? height * 0.55 : -height * 0.35;
  const startX = 4;
  const endX = width - 4;
  const midX = width / 2;
  const startY = 8;
  const endY = 8;
  const midY = startY + sag;

  const ptAt = (t: number) => {
    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;
    return { x, y };
  };

  const dots = useMemo(
    () =>
      Array.from({ length: bulbs }, (_, i) => {
        const t = (i + 0.5) / bulbs;
        const { x, y } = ptAt(t);
        return {
          x,
          y,
          delay: (Math.random() * 4).toFixed(2),
          dur: (2.5 + Math.random() * 3).toFixed(2),
          r: 1.4 + Math.random() * 0.8,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bulbs, width, height, direction]
  );

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ pointerEvents: "none", overflow: "visible", ...style }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-bulb`}>
          <stop offset="0%" stopColor="#FFFBE8" stopOpacity="1" />
          <stop offset="40%" stopColor={CANDLE_WARM} stopOpacity="0.85" />
          <stop offset="100%" stopColor={CANDLE_WARM} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
        stroke={POUNAMU}
        strokeWidth={0.6}
        strokeOpacity={0.22}
        fill="none"
        strokeLinecap="round"
      />
      {dots.map((d, i) => (
        <g key={i} transform={`translate(${d.x} ${d.y})`}>
          <circle r={d.r * 5} fill={`url(#${id}-bulb)`} opacity={0.55}>
            <animate
              attributeName="opacity"
              values="0.25;0.85;0.3;0.7;0.25"
              dur={`${d.dur}s`}
              begin={`${d.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
          <circle r={d.r} fill="#FFFBE8" opacity={0.95}>
            <animate
              attributeName="opacity"
              values="0.45;1;0.55;0.95;0.45"
              dur={`${d.dur}s`}
              begin={`${d.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
    </svg>
  );
}

// Suppress unused-warning for POUNAMU_GLOW (kept for future colour use)
void POUNAMU_GLOW;
