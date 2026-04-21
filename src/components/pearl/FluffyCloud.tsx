import { useRef, useMemo, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * FluffyCloud — interactive sparkly cotton-cloud system.
 * - Volumetric puff: dozens of overlapping soft sprites, additively blended,
 *   gives a warm pearl "cotton" silhouette without any heavy raymarching.
 * - Internal twinkles: tiny pinprick fairy lights tucked inside the cloud
 *   volume that blink at 3.5–8 Hz with sharp-attack pulses.
 * - Cursor-reactive: pointer pushes individual puffs gently outward
 *   ("puff-and-sparkle") and seeds a brief sparkle burst at the cursor.
 *
 * Designed to drop in anywhere a section needs atmosphere. The default
 * `<FluffyCloudScene />` mirrors the old DataRibbons API (intensity, tone,
 * height, opacity) so it can be a 1:1 replacement.
 *
 * The `<HeroCloud />` variant is a giant centered cloud bank for the
 * homepage hero — denser, bigger, with stronger interaction.
 */

/* ───────────────── Sprite textures ───────────────── */

/** Soft cotton-puff sprite — feathery, no hard edge. */
function makePuffTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  // Layered soft gradients to give a fluffy, slightly irregular puff
  for (let i = 0; i < 5; i++) {
    const cx = 64 + (Math.random() - 0.5) * 14;
    const cy = 64 + (Math.random() - 0.5) * 14;
    const r = 50 + Math.random() * 14;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, "rgba(255,255,255,0.55)");
    g.addColorStop(0.4, "rgba(255,255,255,0.18)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/** Tight bright pinprick star with faint diffraction spikes. */
function makeStarTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  // halo
  const halo = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  halo.addColorStop(0, "rgba(255,255,255,0.95)");
  halo.addColorStop(0.18, "rgba(255,255,255,0.4)");
  halo.addColorStop(0.5, "rgba(255,255,255,0.08)");
  halo.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, 64, 64);
  // tight core
  const core = ctx.createRadialGradient(32, 32, 0, 32, 32, 5);
  core.addColorStop(0, "rgba(255,255,255,1)");
  core.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, 64, 64);
  // cross spikes
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, 4); ctx.lineTo(32, 60);
  ctx.moveTo(4, 32); ctx.lineTo(60, 32);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/* ───────────────── Cloud body (puffs) ───────────────── */

interface CloudBodyProps {
  count: number;
  /** half-extent of the cloud bank along x */
  width: number;
  /** half-extent along y */
  height: number;
  /** half-extent along z (depth scatter) */
  depth: number;
  /** average puff radius */
  puffSize: number;
  /** drift speed along x (world units / sec) */
  drift: number;
  /** how strongly the cursor pushes puffs (0..1) */
  reactivity: number;
  tint: string;
}

function CloudBody({
  count,
  width,
  height,
  depth,
  puffSize,
  drift,
  reactivity,
  tint,
}: CloudBodyProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const tRef = useRef(0);
  const { mouse, viewport } = useThree();
  const mouseWorld = useRef(new THREE.Vector2(9999, 9999));

  // Per-puff base parameters
  const puffs = useMemo(() => {
    return Array.from({ length: count }, () => {
      // Cluster more density toward the centre — gaussian-ish via avg of 2 randoms
      const gx = (Math.random() + Math.random() - 1);
      const gy = (Math.random() + Math.random() - 1) * 0.8;
      const gz = (Math.random() + Math.random() - 1);
      return {
        bx: gx * width,
        by: gy * height,
        bz: gz * depth,
        size: puffSize * (0.55 + Math.random() * 0.95),
        bobPhase: Math.random() * Math.PI * 2,
        bobAmp: 0.05 + Math.random() * 0.12,
        bobHz: 0.25 + Math.random() * 0.45,
        // baseline opacity per puff
        op: 0.5 + Math.random() * 0.5,
      };
    });
  }, [count, width, height, depth, puffSize]);

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
      blending: THREE.AdditiveBlending,
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
          gl_PointSize = aSize * 280.0 * uPixelRatio / -mvPosition.z;
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
  }, [tint, sprite]);

  useFrame((_, dt) => {
    tRef.current += dt;
    const t = tRef.current;

    // Convert NDC mouse → world coords on the cloud z=0 plane
    mouseWorld.current.set(
      (mouse.x * viewport.width) / 2,
      (mouse.y * viewport.height) / 2
    );

    const tmp = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const p = puffs[i];
      // Gentle bob + slow horizontal drift (with wrap)
      let x = p.bx + t * drift;
      // wrap horizontally so the cloud feels endless
      const span = width * 2.4;
      x = ((x + span / 2) % span + span) % span - span / 2;
      const y = p.by + Math.sin(t * p.bobHz + p.bobPhase) * p.bobAmp;
      const z = p.bz + Math.cos(t * p.bobHz * 0.6 + p.bobPhase) * p.bobAmp * 0.4;

      // Cursor push — radial impulse, falls off with distance
      tmp.set(x, y, 0);
      const dx = x - mouseWorld.current.x;
      const dy = y - mouseWorld.current.y;
      const d2 = dx * dx + dy * dy;
      const influence = Math.exp(-d2 / 1.4) * reactivity; // tight gaussian
      const push = influence * 0.5;
      const nrm = Math.sqrt(d2) + 0.0001;

      positions[i * 3] = x + (dx / nrm) * push;
      positions[i * 3 + 1] = y + (dy / nrm) * push;
      positions[i * 3 + 2] = z;

      // Slight breathe in opacity & size from cursor warmth
      sizes[i] = p.size * (1 + influence * 0.35);
      opacities[i] = p.op * (1 + influence * 0.25);
    }

    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const sAttr = geometry.getAttribute("aSize") as THREE.BufferAttribute;
    const oAttr = geometry.getAttribute("aOpacity") as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
    sAttr.needsUpdate = true;
    oAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

/* ───────────────── Sparkles ───────────────── */

interface SparklesProps {
  count: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  size: number;
  /** how much the cursor seeds extra brightness */
  reactivity: number;
}

function Sparkles({
  count,
  width,
  height,
  depth,
  color,
  size,
  reactivity,
}: SparklesProps) {
  const ref = useRef<THREE.Points>(null);
  const tRef = useRef(0);
  const { mouse, viewport } = useThree();
  const mouseWorld = useRef(new THREE.Vector2(9999, 9999));

  const params = useMemo(() => {
    return Array.from({ length: count }, () => ({
      bx: (Math.random() * 2 - 1) * width * 0.95,
      by: (Math.random() * 2 - 1) * height * 0.85,
      bz: (Math.random() * 2 - 1) * depth,
      phase: Math.random() * Math.PI * 2,
      hz: 3.5 + Math.random() * 4.5, // 3.5–8 Hz
      jitter: 0.5 + Math.random() * 1.1,
      // Some stars stay dark longer (rare bright pulses)
      sparkBias: Math.random() < 0.4 ? 4.0 : 1.5,
    }));
  }, [count, width, height, depth]);

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
          gl_PointSize = aSize * 380.0 * uPixelRatio / -mvPosition.z;
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
    mouseWorld.current.set(
      (mouse.x * viewport.width) / 2,
      (mouse.y * viewport.height) / 2
    );

    for (let i = 0; i < count; i++) {
      const p = params[i];
      // Sparkles barely drift — feel stationary, like real fairy lights
      const x = p.bx + Math.sin(t * 0.18 + p.phase) * 0.03;
      const y = p.by + Math.cos(t * 0.22 + p.phase) * 0.03;
      const z = p.bz;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Twinkle: sharp-attack pulse
      const raw = 0.5 + 0.5 * Math.sin(t * p.hz + p.phase);
      const tw = Math.pow(raw, p.sparkBias);

      // Cursor halo — sparkles near the cursor get a brightness boost
      const dx = x - mouseWorld.current.x;
      const dy = y - mouseWorld.current.y;
      const halo = Math.exp(-(dx * dx + dy * dy) / 1.2) * reactivity;

      opacities[i] = Math.min(1, 0.05 + tw * 0.95 + halo * 0.6);
      sizes[i] = size * p.jitter * (0.55 + tw * 0.55 + halo * 0.4);
    }

    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const sAttr = geometry.getAttribute("aSize") as THREE.BufferAttribute;
    const oAttr = geometry.getAttribute("aOpacity") as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
    sAttr.needsUpdate = true;
    oAttr.needsUpdate = true;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

/* ───────────────── Public Scene wrappers ───────────────── */

const POUNAMU_GLOW = "#3A8077";
const SEAGLASS = "#E5EFEC";
const WARM_WHITE = "#FFF8EC";

interface FluffyCloudSceneProps {
  /** "subtle" | "soft" | "rich" — controls puff/sparkle density */
  intensity?: "subtle" | "soft" | "rich";
  /** Tint of sparkles (cloud body always warm white) */
  tone?: "pounamu" | "seaglass" | "mixed";
  className?: string;
  style?: React.CSSProperties;
  height?: number;
  opacity?: number;
  /** How responsive to the cursor (0 = none, 1 = full physics) */
  reactivity?: number;
}

export default function FluffyCloudScene({
  intensity = "soft",
  tone = "mixed",
  className = "",
  style,
  height = 360,
  opacity = 0.85,
  reactivity = 0.8,
}: FluffyCloudSceneProps) {
  const cfg = useMemo(() => {
    if (intensity === "subtle")
      return { puffs: 60, sparkles: 70, w: 5, h: 1.4, d: 0.8, puffSize: 0.55, sparkSize: 0.05 };
    if (intensity === "rich")
      return { puffs: 180, sparkles: 200, w: 6.5, h: 2, d: 1.2, puffSize: 0.7, sparkSize: 0.06 };
    return { puffs: 110, sparkles: 130, w: 5.8, h: 1.7, d: 1, puffSize: 0.6, sparkSize: 0.055 };
  }, [intensity]);

  const sparkColor =
    tone === "pounamu" ? POUNAMU_GLOW : tone === "seaglass" ? SEAGLASS : WARM_WHITE;

  return (
    <div
      className={`pointer-events-auto ${className}`}
      style={{ width: "100%", height, opacity, position: "relative", ...style }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, premultipliedAlpha: true }}
          style={{ background: "transparent" }}
        >
          <CloudBody
            count={cfg.puffs}
            width={cfg.w}
            height={cfg.h}
            depth={cfg.d}
            puffSize={cfg.puffSize}
            drift={0.08}
            reactivity={reactivity}
            tint={WARM_WHITE}
          />
          {/* Pounamu under-glow on the body, very faint, gives depth */}
          <CloudBody
            count={Math.round(cfg.puffs * 0.35)}
            width={cfg.w * 0.85}
            height={cfg.h * 0.7}
            depth={cfg.d}
            puffSize={cfg.puffSize * 0.85}
            drift={-0.05}
            reactivity={reactivity * 0.6}
            tint={POUNAMU_GLOW}
          />
          <Sparkles
            count={cfg.sparkles}
            width={cfg.w * 0.95}
            height={cfg.h * 0.85}
            depth={cfg.d * 0.9}
            color={sparkColor}
            size={cfg.sparkSize}
            reactivity={reactivity}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

/**
 * HeroCloud — a giant, centred, interactive fluffy cloud bank for the
 * homepage hero. Cursor push is dialed up; sparkle density is dense.
 */
export function HeroCloud({
  height = 720,
  opacity = 0.95,
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

  return (
    <div
      className={`pointer-events-auto ${className}`}
      style={{ width: "100%", height, opacity, position: "relative", ...style }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, premultipliedAlpha: true }}
          style={{ background: "transparent" }}
        >
          {/* Main warm cotton body */}
          <CloudBody
            count={reduced ? 140 : 260}
            width={7.5}
            height={2.4}
            depth={1.6}
            puffSize={0.85}
            drift={reduced ? 0 : 0.04}
            reactivity={reduced ? 0 : 1.2}
            tint={WARM_WHITE}
          />
          {/* Sea-glass under-shadow — gives the cloud a cool underbelly */}
          <CloudBody
            count={reduced ? 60 : 110}
            width={7}
            height={1.8}
            depth={1.4}
            puffSize={0.78}
            drift={reduced ? 0 : -0.03}
            reactivity={reduced ? 0 : 0.9}
            tint={SEAGLASS}
          />
          {/* Pounamu glow at the heart — like sun behind the cloud */}
          <CloudBody
            count={reduced ? 30 : 60}
            width={3.6}
            height={1.2}
            depth={0.9}
            puffSize={0.6}
            drift={0}
            reactivity={reduced ? 0 : 0.6}
            tint={POUNAMU_GLOW}
          />
          {/* Sparkles tucked inside */}
          <Sparkles
            count={reduced ? 120 : 280}
            width={6.8}
            height={2.1}
            depth={1.4}
            color={WARM_WHITE}
            size={0.07}
            reactivity={reduced ? 0 : 1.4}
          />
          {/* Pounamu accent sparkles, fewer */}
          <Sparkles
            count={reduced ? 20 : 50}
            width={4.5}
            height={1.6}
            depth={1.0}
            color={POUNAMU_GLOW}
            size={0.06}
            reactivity={reduced ? 0 : 1.0}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
