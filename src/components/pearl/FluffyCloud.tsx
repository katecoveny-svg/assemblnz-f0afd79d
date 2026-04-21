import { useRef, useMemo, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * FluffyCloud — interactive sparkly cumulus, lit from inside.
 *
 * The brief: a cumulus cloud at golden hour, spun-sugar volume, no hard edges.
 * Warm pearl with a subtle pounamu glow filtering through, candle-warm fairy
 * lights (#F8E9C4) twinkling INSIDE the mass. Cursor follow with 300–500ms
 * lag. Scroll parallax drifts the cloud upward. Ambient breathing on a
 * 12–18s cycle. Calm and present, never bouncy.
 *
 * Public API:
 *   <HeroCloud />          giant interactive hero cloud
 *   <FluffyCloudScene />   small atmospheric wisp (no interactivity by default)
 *   <FairyLightStrand />   hairline fairy-light strand (CSS/SVG, no canvas)
 */

/* ───────────────── Palette ───────────────── */
const CANDLE_WARM = "#F8E9C4";   // candle-warm sparkles
const POUNAMU = "#1F4D47";        // deep pounamu glow inside cloud
const POUNAMU_GLOW = "#3A8077";   // softer pounamu, secondary accent
const CLOUD_WARM = "#FFFBF2";     // warm pearl cloud body
const CLOUD_COOL = "#EFF1EC";     // very subtle cool underbelly wash
const SUNLIT_CORE = "#FFE6B8";    // golden-hour heart of the cloud

/* ───────────────── Sprite textures ───────────────── */

/** Soft cumulus puff — warm white body with a sun-warmed core highlight and
 *  a faint cool underbelly. Reads as VOLUME against the warm pearl canvas. */
function makePuffTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;

  // 1) Faint cool underbelly (down-right) — gives volume against pearl
  const shadow = ctx.createRadialGradient(140, 158, 0, 140, 158, 100);
  shadow.addColorStop(0, "rgba(196,210,205,0.35)");
  shadow.addColorStop(0.6, "rgba(210,220,215,0.15)");
  shadow.addColorStop(1, "rgba(210,220,215,0)");
  ctx.fillStyle = shadow;
  ctx.fillRect(0, 0, 256, 256);

  // 2) Warm pearl cloud body, soft falloff
  const body = ctx.createRadialGradient(122, 116, 0, 122, 116, 110);
  body.addColorStop(0, "rgba(255,251,242,1.00)");
  body.addColorStop(0.32, "rgba(255,251,242,0.92)");
  body.addColorStop(0.62, "rgba(255,250,238,0.5)");
  body.addColorStop(0.88, "rgba(255,248,232,0.1)");
  body.addColorStop(1, "rgba(255,248,232,0)");
  ctx.fillStyle = body;
  ctx.fillRect(0, 0, 256, 256);

  // 3) Sun-warmed specular highlight — golden hour catching the puff top
  const hi = ctx.createRadialGradient(102, 92, 0, 102, 92, 38);
  hi.addColorStop(0, "rgba(255,228,170,0.55)");
  hi.addColorStop(0.6, "rgba(255,228,170,0.18)");
  hi.addColorStop(1, "rgba(255,228,170,0)");
  ctx.fillStyle = hi;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/** Candle-warm fairy light — soft halo + tight core, no diffraction spikes
 *  (those read cool/electric — we want warm wax-candle glow). */
function makeStarTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  // soft warm halo
  const halo = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  halo.addColorStop(0, "rgba(255,240,200,0.95)");
  halo.addColorStop(0.2, "rgba(255,235,190,0.45)");
  halo.addColorStop(0.55, "rgba(255,230,170,0.1)");
  halo.addColorStop(1, "rgba(255,230,170,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, 64, 64);
  // tight bright core
  const core = ctx.createRadialGradient(32, 32, 0, 32, 32, 6);
  core.addColorStop(0, "rgba(255,255,250,1)");
  core.addColorStop(0.6, "rgba(255,250,225,0.6)");
  core.addColorStop(1, "rgba(255,250,225,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/* ───────────────── Cloud body (puffs) ───────────────── */

interface CloudBodyProps {
  count: number;
  width: number;
  height: number;
  depth: number;
  puffSize: number;
  drift: number;
  reactivity: number;
  /** Cursor target in world units (lagged), shared with sparkles. */
  cursorRef: React.MutableRefObject<THREE.Vector2>;
  /** Scroll parallax y offset (world units), shared. */
  parallaxRef: React.MutableRefObject<number>;
  /** Group-level breathing scale & morph offset. */
  breatheRef: React.MutableRefObject<{ scale: number; morph: number }>;
  tint: string;
  /** 0..1 — how oval/cumulus the body is (1 = full ellipsoid clustering) */
  clustering?: number;
}

function CloudBody({
  count,
  width,
  height,
  depth,
  puffSize,
  drift,
  reactivity,
  cursorRef,
  parallaxRef,
  breatheRef,
  tint,
  clustering = 1,
}: CloudBodyProps) {
  const tRef = useRef(0);

  const puffs = useMemo(() => {
    return Array.from({ length: count }, () => {
      // Cluster toward centre with a cumulus-shaped distribution:
      // top is rounded/dense, bottom flattens slightly.
      const r1 = Math.random() + Math.random() - 1; // -1..1, centre-weighted
      const r2 = Math.random() + Math.random() - 1;
      const r3 = Math.random() + Math.random() - 1;
      // Cumulus cap: pull the top up, flatten the bottom
      const yShape = clustering * (r2 * 0.75 + Math.abs(r2) * 0.25);
      return {
        bx: r1 * width,
        by: yShape * height,
        bz: r3 * depth,
        size: puffSize * (0.5 + Math.random() * 1.05),
        bobPhase: Math.random() * Math.PI * 2,
        bobAmp: 0.05 + Math.random() * 0.14,
        bobHz: 0.18 + Math.random() * 0.4,
        // Per-puff breathing morph weight (some puffs swell more than others)
        morphWeight: 0.4 + Math.random() * 0.9,
        op: 0.55 + Math.random() * 0.45,
      };
    });
  }, [count, width, height, depth, puffSize, clustering]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const sizes = useMemo(() => new Float32Array(count), [count]);
  const opacities = useMemo(() => new Float32Array(count), [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1));
    return g;
  }, [positions, sizes, opacities]);

  const sprite = useMemo(() => makePuffTexture(), []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uColor: { value: new THREE.Color(tint) },
        uTexture: { value: sprite },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aOpacity;
        varying float vOpacity;
        uniform float uPixelRatio;
        void main() {
          vOpacity = aOpacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * 540.0 * uPixelRatio / -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform sampler2D uTexture;
        varying float vOpacity;
        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          gl_FragColor = vec4(tex.rgb * uColor, tex.a * vOpacity);
        }
      `,
    });
  }, [tint, sprite]);

  useFrame((_, dt) => {
    tRef.current += dt;
    const t = tRef.current;
    const cursor = cursorRef.current;
    const parallaxY = parallaxRef.current;
    const breathe = breatheRef.current;

    for (let i = 0; i < count; i++) {
      const p = puffs[i];
      // Slow horizontal drift, wrapped — like real cloud motion
      let x = p.bx + t * drift;
      const span = width * 2.4;
      x = ((x + span / 2) % span + span) % span - span / 2;

      // Apply group breathing (12–18s morph) + per-puff bob
      const morph = breathe.morph * p.morphWeight;
      const y =
        p.by +
        morph * 0.35 +
        Math.sin(t * p.bobHz + p.bobPhase) * p.bobAmp +
        parallaxY;
      const z =
        p.bz +
        Math.cos(t * p.bobHz * 0.6 + p.bobPhase) * p.bobAmp * 0.4;

      // Cursor lagged push — gentle, never snappy
      const dx = x - cursor.x;
      const dy = y - cursor.y;
      const d2 = dx * dx + dy * dy;
      const influence = Math.exp(-d2 / 2.0) * reactivity;
      const push = influence * 0.35;
      const nrm = Math.sqrt(d2) + 0.0001;

      positions[i * 3] = x + (dx / nrm) * push;
      positions[i * 3 + 1] = y + (dy / nrm) * push;
      positions[i * 3 + 2] = z;

      sizes[i] =
        p.size * breathe.scale * (1 + influence * 0.3 + morph * 0.08);
      opacities[i] = p.op * (1 + influence * 0.15);
    }

    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const sAttr = geometry.getAttribute("aSize") as THREE.BufferAttribute;
    const oAttr = geometry.getAttribute("aOpacity") as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
    sAttr.needsUpdate = true;
    oAttr.needsUpdate = true;
  });

  return <points geometry={geometry} material={material} />;
}

/* ───────────────── Sparkles (fairy lights) ───────────────── */

interface SparklesProps {
  count: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  size: number;
  reactivity: number;
  cursorRef: React.MutableRefObject<THREE.Vector2>;
  parallaxRef: React.MutableRefObject<number>;
  /** Multiplier on twinkle period — sparkles twinkle every 2–6s, no pattern */
  slow?: boolean;
}

function Sparkles({
  count,
  width,
  height,
  depth,
  color,
  size,
  reactivity,
  cursorRef,
  parallaxRef,
  slow = true,
}: SparklesProps) {
  const tRef = useRef(0);

  const params = useMemo(() => {
    return Array.from({ length: count }, () => {
      // Mix of "deep inside" (dimmer, foggier) and "near surface" (brighter)
      const depthClass = Math.random();
      const deepInside = depthClass < 0.55;
      return {
        bx: (Math.random() * 2 - 1) * width * 0.95,
        by: (Math.random() * 2 - 1) * height * 0.85,
        bz: (Math.random() * 2 - 1) * depth,
        phase: Math.random() * Math.PI * 2,
        // Twinkle period 2–6s ⇒ Hz 1/6..1/2 = 0.166..0.5
        // For a sharp-attack pulse we use Math.pow(sin, bias)
        hz: slow
          ? 0.16 + Math.random() * 0.34   // 2–6s twinkle
          : 1.5 + Math.random() * 2.5,     // hover-burst sparkles
        // Surface lights are brighter & sharper, deep ones are dim & foggy
        baseOp: deepInside ? 0.18 : 0.55,
        peakOp: deepInside ? 0.45 : 1.0,
        sizeMul: deepInside ? 0.7 : 1.1,
        sparkBias: 3.5 + Math.random() * 3.5,
        // Each sparkle gets its own phase offset (no pattern)
        startDelay: Math.random() * 6,
      };
    });
  }, [count, width, height, depth, slow]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const sizes = useMemo(() => new Float32Array(count), [count]);
  const opacities = useMemo(() => new Float32Array(count), [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1));
    return g;
  }, [positions, sizes, opacities]);

  const sprite = useMemo(() => makeStarTexture(), []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uTexture: { value: sprite },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aOpacity;
        varying float vOpacity;
        uniform float uPixelRatio;
        void main() {
          vOpacity = aOpacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * 420.0 * uPixelRatio / -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform sampler2D uTexture;
        varying float vOpacity;
        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          gl_FragColor = vec4(uColor, tex.a * vOpacity);
        }
      `,
    });
  }, [color, sprite]);

  useFrame((_, dt) => {
    tRef.current += dt;
    const t = tRef.current;
    const cursor = cursorRef.current;
    const parallaxY = parallaxRef.current;

    for (let i = 0; i < count; i++) {
      const p = params[i];
      // Sparkles barely drift — they feel stationary, like real fairy lights
      const x = p.bx + Math.sin(t * 0.12 + p.phase) * 0.025;
      const y = p.by + Math.cos(t * 0.16 + p.phase) * 0.025 + parallaxY;
      const z = p.bz;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Sharp-attack twinkle (sin shaped by power) — slow, no rhythm
      const raw = 0.5 + 0.5 * Math.sin((t + p.startDelay) * Math.PI * 2 * p.hz + p.phase);
      const tw = Math.pow(raw, p.sparkBias);

      // Cursor halo — lights near the (lagged) cursor get a brief warmth boost
      const dx = x - cursor.x;
      const dy = y - cursor.y;
      const halo = Math.exp(-(dx * dx + dy * dy) / 1.0) * reactivity;

      const op =
        p.baseOp + (p.peakOp - p.baseOp) * tw + halo * 0.6;
      opacities[i] = Math.min(1, op);
      sizes[i] = size * p.sizeMul * (0.55 + tw * 0.6 + halo * 0.5);
    }

    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const sAttr = geometry.getAttribute("aSize") as THREE.BufferAttribute;
    const oAttr = geometry.getAttribute("aOpacity") as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
    sAttr.needsUpdate = true;
    oAttr.needsUpdate = true;
  });

  return <points geometry={geometry} material={material} />;
}

/* ───────────────── Cursor + scroll + breathe driver ───────────────── */

interface DriverProps {
  cursorTargetRef: React.MutableRefObject<THREE.Vector2>;
  cursorLaggedRef: React.MutableRefObject<THREE.Vector2>;
  parallaxRef: React.MutableRefObject<number>;
  breatheRef: React.MutableRefObject<{ scale: number; morph: number }>;
  /** 0..1 — disables interactivity when 0 */
  interactive: number;
  /** parallax intensity in world units per pixel */
  parallaxStrength: number;
}

/** Inside-Canvas component that lerps the cursor toward its raw target with
 *  a 300–500ms feel, drives scroll parallax, and breathes the cloud on a
 *  12–18s cycle. Lives inside <Canvas> so it can use useFrame. */
function CloudDriver({
  cursorTargetRef,
  cursorLaggedRef,
  parallaxRef,
  breatheRef,
  interactive,
  parallaxStrength,
}: DriverProps) {
  const tRef = useRef(0);
  // ~350ms feel: lerp factor ≈ 1 - exp(-dt/τ) with τ ≈ 0.35s
  useFrame((_, dt) => {
    tRef.current += dt;
    const t = tRef.current;

    // Cursor lag — only when interactive
    if (interactive > 0) {
      const k = 1 - Math.exp(-dt / 0.38);
      cursorLaggedRef.current.lerp(cursorTargetRef.current, k);
    } else {
      cursorLaggedRef.current.set(9999, 9999);
    }

    // Scroll parallax — read from window once per frame
    parallaxRef.current = -window.scrollY * parallaxStrength;

    // Cloud breathing: ~14s morph cycle + tiny scale wobble
    const morph =
      Math.sin(t * (Math.PI * 2 / 14)) * 0.5 +
      Math.sin(t * (Math.PI * 2 / 19) + 1.3) * 0.4;
    const scale = 1 + Math.sin(t * (Math.PI * 2 / 16)) * 0.025;
    breatheRef.current.morph = morph;
    breatheRef.current.scale = scale;
  });
  return null;
}

/** Captures pointer in world units on the parent div, writes into ref. */
function usePointerWorld(
  containerRef: React.RefObject<HTMLDivElement>,
  cursorTargetRef: React.MutableRefObject<THREE.Vector2>,
  worldHalfWidth: number,
  worldHalfHeight: number,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;
    const handleMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      cursorTargetRef.current.set(nx * worldHalfWidth, ny * worldHalfHeight);
    };
    const handleLeave = () => {
      cursorTargetRef.current.set(9999, 9999);
    };
    window.addEventListener("pointermove", handleMove, { passive: true });
    el.addEventListener("pointerleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", handleLeave);
    };
  }, [containerRef, cursorTargetRef, worldHalfWidth, worldHalfHeight, enabled]);
}

/* ───────────────── Public Scene wrappers ───────────────── */

interface FluffyCloudSceneProps {
  intensity?: "subtle" | "soft" | "rich";
  tone?: "pounamu" | "warm" | "mixed";
  className?: string;
  style?: React.CSSProperties;
  height?: number;
  opacity?: number;
  /** 0 = no cursor / parallax. Default 0 (small wisps are non-interactive). */
  reactivity?: number;
  /** Enable subtle scroll parallax (small wisps usually drift without it). */
  parallax?: boolean;
}

/** Smaller atmospheric wisp — non-interactive by default per brief. */
export default function FluffyCloudScene({
  intensity = "soft",
  tone = "mixed",
  className = "",
  style,
  height = 320,
  opacity = 0.85,
  reactivity = 0,
  parallax = false,
}: FluffyCloudSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorTargetRef = useRef(new THREE.Vector2(9999, 9999));
  const cursorLaggedRef = useRef(new THREE.Vector2(9999, 9999));
  const parallaxRef = useRef(0);
  const breatheRef = useRef({ scale: 1, morph: 0 });

  const cfg = useMemo(() => {
    if (intensity === "subtle")
      return { puffs: 90, sparkles: 35, w: 4.2, h: 1.3, d: 0.6, puffSize: 0.85, sparkSize: 0.05 };
    if (intensity === "rich")
      return { puffs: 260, sparkles: 130, w: 6.0, h: 1.9, d: 0.95, puffSize: 1.08, sparkSize: 0.06 };
    return { puffs: 170, sparkles: 75, w: 5.0, h: 1.55, d: 0.78, puffSize: 0.95, sparkSize: 0.055 };
  }, [intensity]);

  usePointerWorld(containerRef, cursorTargetRef, cfg.w, cfg.h, reactivity > 0);

  const sparkColor =
    tone === "pounamu" ? POUNAMU_GLOW : tone === "warm" ? CANDLE_WARM : CANDLE_WARM;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height,
        opacity,
        position: "relative",
        pointerEvents: reactivity > 0 ? "auto" : "none",
        ...style,
      }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
          style={{ background: "transparent" }}
        >
          <CloudDriver
            cursorTargetRef={cursorTargetRef}
            cursorLaggedRef={cursorLaggedRef}
            parallaxRef={parallaxRef}
            breatheRef={breatheRef}
            interactive={reactivity}
            parallaxStrength={parallax ? 0.0015 : 0}
          />
          <CloudBody
            count={cfg.puffs}
            width={cfg.w}
            height={cfg.h}
            depth={cfg.d}
            puffSize={cfg.puffSize}
            drift={0.04}
            reactivity={reactivity}
            cursorRef={cursorLaggedRef}
            parallaxRef={parallaxRef}
            breatheRef={breatheRef}
            tint={CLOUD_WARM}
            clustering={1}
          />
          <Sparkles
            count={cfg.sparkles}
            width={cfg.w * 0.95}
            height={cfg.h * 0.85}
            depth={cfg.d * 0.9}
            color={sparkColor}
            size={cfg.sparkSize}
            reactivity={reactivity}
            cursorRef={cursorLaggedRef}
            parallaxRef={parallaxRef}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

/**
 * HeroCloud — the signature visual. Giant interactive cumulus cloud, lit
 * from inside with a golden-hour pounamu core, candle-warm fairy lights
 * twinkling through the mass, cursor follow with a 350ms lag, and gentle
 * scroll parallax that drifts it upward as the visitor scrolls.
 */
export function HeroCloud({
  height = 760,
  opacity = 0.97,
  className = "",
  style,
}: {
  height?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const cursorTargetRef = useRef(new THREE.Vector2(9999, 9999));
  const cursorLaggedRef = useRef(new THREE.Vector2(9999, 9999));
  const parallaxRef = useRef(0);
  const breatheRef = useRef({ scale: 1, morph: 0 });

  const W_HALF = 7.5;
  const H_HALF = 2.4;

  usePointerWorld(containerRef, cursorTargetRef, W_HALF, H_HALF, !reduced);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height,
        opacity,
        position: "relative",
        pointerEvents: reduced ? "none" : "auto",
        ...style,
      }}
      aria-hidden="true"
    >
      {/* CSS golden-hour glow behind the cloud — the "lit from inside" feel.
          A warm sun-core radial + a faint pounamu mist. Sits behind the canvas. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 35% 30% at 50% 52%, rgba(255,230,184,0.55) 0%, rgba(255,230,184,0) 70%),
            radial-gradient(ellipse 60% 45% at 50% 50%, rgba(31,77,71,0.10) 0%, rgba(31,77,71,0) 70%)
          `,
          filter: "blur(4px)",
        }}
      />
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
          style={{ background: "transparent" }}
        >
          <CloudDriver
            cursorTargetRef={cursorTargetRef}
            cursorLaggedRef={cursorLaggedRef}
            parallaxRef={parallaxRef}
            breatheRef={breatheRef}
            interactive={reduced ? 0 : 1}
            parallaxStrength={reduced ? 0 : 0.003}
          />
          {/* Layer 1 — main warm pearl body (densest, slow drift right) */}
          <CloudBody
            count={reduced ? 280 : 480}
            width={W_HALF}
            height={H_HALF}
            depth={1.2}
            puffSize={1.35}
            drift={reduced ? 0 : 0.022}
            reactivity={reduced ? 0 : 1.0}
            cursorRef={cursorLaggedRef}
            parallaxRef={parallaxRef}
            breatheRef={breatheRef}
            tint={CLOUD_WARM}
            clustering={1}
          />
          {/* Layer 2 — sun-warmed inner core (smaller, brighter) */}
          <CloudBody
            count={reduced ? 100 : 180}
            width={W_HALF * 0.55}
            height={H_HALF * 0.6}
            depth={0.9}
            puffSize={1.1}
            drift={reduced ? 0 : 0.018}
            reactivity={reduced ? 0 : 0.8}
            cursorRef={cursorLaggedRef}
            parallaxRef={parallaxRef}
            breatheRef={breatheRef}
            tint={SUNLIT_CORE}
            clustering={0.8}
          />
          {/* Layer 3 — cool dissolving outer rim (drifts the other way) */}
          <CloudBody
            count={reduced ? 90 : 160}
            width={W_HALF * 1.1}
            height={H_HALF * 1.05}
            depth={1.0}
            puffSize={1.2}
            drift={reduced ? 0 : -0.014}
            reactivity={reduced ? 0 : 0.7}
            cursorRef={cursorLaggedRef}
            parallaxRef={parallaxRef}
            breatheRef={breatheRef}
            tint={CLOUD_COOL}
            clustering={1.05}
          />
          {/* Candle-warm fairy lights INSIDE the cloud — slow twinkle */}
          <Sparkles
            count={reduced ? 180 : 360}
            width={W_HALF * 0.95}
            height={H_HALF * 0.9}
            depth={1.2}
            color={CANDLE_WARM}
            size={0.075}
            reactivity={reduced ? 0 : 1.4}
            cursorRef={cursorLaggedRef}
            parallaxRef={parallaxRef}
            slow
          />
          {/* A few pounamu pinpricks for depth — very rare */}
          <Sparkles
            count={reduced ? 16 : 36}
            width={W_HALF * 0.7}
            height={H_HALF * 0.75}
            depth={1.0}
            color={POUNAMU_GLOW}
            size={0.05}
            reactivity={reduced ? 0 : 0.8}
            cursorRef={cursorLaggedRef}
            parallaxRef={parallaxRef}
            slow
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

/* ───────────────── Fairy light strand (CSS/SVG) ───────────────── */

/**
 * FairyLightStrand — hairline strand of warm-white sparkles connected by a
 * barely-visible pounamu thread. Pure CSS/SVG (no canvas) so it composites
 * cheaply over sections. Underdone by design — a few per page is plenty.
 */
export function FairyLightStrand({
  className = "",
  width = 320,
  height = 90,
  bulbs = 7,
  /** "drape" curves down (between sections), "rise" curves up */
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
  // Build a smooth quadratic curve and sample bulb positions along it
  const sag = direction === "drape" ? height * 0.55 : -height * 0.35;
  const startX = 4;
  const endX = width - 4;
  const midX = width / 2;
  const startY = 8;
  const endY = 8;
  const midY = startY + sag;

  // Quadratic Bezier point at t
  const ptAt = (t: number) => {
    const x =
      (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
    const y =
      (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;
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
      {/* Pounamu thread — barely visible */}
      <path
        d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
        stroke={POUNAMU}
        strokeWidth={0.6}
        strokeOpacity={0.22}
        fill="none"
        strokeLinecap="round"
      />
      {/* Bulbs — soft warm halos */}
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
