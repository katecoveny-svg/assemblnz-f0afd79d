import { useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * PearlGlobe — a feathery, NZ-flavoured pearl orb.
 *
 * Layers, back to front:
 *  1. Soft caustic shader wash (CSS-driven motion field, sandbox-safe)
 *  2. Radiating white feather plumes (SVG, per-instance rotation)
 *  3. Sea-glass twinkly data nodes laid out in an Aotearoa silhouette
 *  4. WebGL transmission sphere with subtle continent silhouettes
 *  5. Specular highlight + outer pearl bloom
 */

/* ───────────────────────────────
   1. Aotearoa node constellation
   coords are normalised (-1..1) tracing North & South Island silhouettes
   ─────────────────────────────── */
const NZ_NODES: Array<{ x: number; y: number; size: number; delay: number }> = [
  // North Island
  { x: 0.32, y: -0.78, size: 3, delay: 0 },     // Cape Reinga
  { x: 0.40, y: -0.62, size: 2.5, delay: 0.4 },
  { x: 0.48, y: -0.50, size: 4, delay: 0.8 },   // Auckland
  { x: 0.55, y: -0.36, size: 2.5, delay: 1.2 },
  { x: 0.50, y: -0.20, size: 3, delay: 1.6 },   // Taupō
  { x: 0.62, y: -0.10, size: 2.5, delay: 2.0 },
  { x: 0.45, y: 0.02, size: 4, delay: 2.4 },    // Wellington
  // Cook Strait gap
  // South Island
  { x: 0.28, y: 0.18, size: 3, delay: 2.8 },    // Nelson
  { x: 0.10, y: 0.30, size: 2.5, delay: 3.2 },  // West Coast
  { x: 0.18, y: 0.46, size: 3.5, delay: 3.6 },  // Christchurch
  { x: -0.05, y: 0.58, size: 2.5, delay: 4.0 }, // Aoraki
  { x: 0.05, y: 0.74, size: 3, delay: 4.4 },    // Dunedin
  { x: -0.18, y: 0.86, size: 2.5, delay: 4.8 }, // Stewart Is / Bluff
];

/* ───────────────────────────────
   2. Sphere with subtle land silhouette (decorative — not literal map)
   ─────────────────────────────── */
function Sphere({ tint }: { tint: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.05;
    ref.current.rotation.x += dt * 0.015;
  });
  return (
    <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.3} floatingRange={[-0.06, 0.06]}>
      {/* Soft inner glow shell — gives the pearl its luminous core */}
      <mesh scale={1.04}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} />
      </mesh>
      {/* Pearl body — opaque physical material so it ALWAYS reads white */}
      <mesh ref={ref}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          roughness={0.28}
          metalness={0}
          clearcoat={0.6}
          clearcoatRoughness={0.35}
          sheen={1}
          sheenColor={tint}
          sheenRoughness={0.45}
          emissive={tint}
          emissiveIntensity={0.08}
        />
      </mesh>
    </Float>
  );
}

/* ───────────────────────────────
   3. SVG feather (single plume)
   ─────────────────────────────── */
const Feather = ({
  rotation,
  length,
  delay,
}: {
  rotation: number;
  length: number;
  delay: number;
}) => (
  <g
    transform={`rotate(${rotation} 100 100)`}
    style={{
      transformOrigin: "100px 100px",
      animation: `pearl-feather-sway 11s ease-in-out ${delay}s infinite alternate`,
    }}
  >
    {/* feather shaft */}
    <path
      d={`M 100 100 Q 100 ${100 - length * 0.5} 100 ${100 - length}`}
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="0.6"
      fill="none"
    />
    {/* barbs — rendered as a soft elongated diamond */}
    <path
      d={`M 100 100
          C ${100 - length * 0.18} ${100 - length * 0.35},
            ${100 - length * 0.06} ${100 - length * 0.85},
            100 ${100 - length}
          C ${100 + length * 0.06} ${100 - length * 0.85},
            ${100 + length * 0.18} ${100 - length * 0.35},
            100 100 Z`}
      fill="url(#featherGradient)"
      opacity="0.55"
    />
  </g>
);

interface PearlGlobeProps {
  size?: number;
  /** Inner attenuation tint — pale sea-glass by default */
  tint?: string;
  /** Outer feathery bloom colour */
  bloom?: string;
  drift?: "slow" | "med" | "none";
  className?: string;
  style?: React.CSSProperties;
  opacity?: number;
  /** Show the NZ data-node constellation (default true) */
  showNodes?: boolean;
  /** Show feather plumes (default true) */
  showFeathers?: boolean;
}

export default function PearlGlobe({
  size = 320,
  tint = "#C4D6D2",
  bloom = "#FFFFFF",
  drift = "slow",
  className = "",
  style,
  opacity = 0.82,
  showNodes = true,
  showFeathers = true,
}: PearlGlobeProps) {
  const [ready, setReady] = useState(false);
  const driftClass = drift === "none" ? "" : drift === "med" ? "pearl-drift-med" : "pearl-drift-slow";

  // Distribute feathers around the orb — varied length for organic, asymmetric plume
  const feathers = useMemo(() => {
    const count = 28;
    return Array.from({ length: count }, (_, i) => {
      const baseRot = (i / count) * 360;
      const lengthSeed = (Math.sin(i * 1.7) + 1) / 2;
      return {
        rotation: baseRot + (Math.sin(i * 3.1) * 8),
        length: 38 + lengthSeed * 32, // 38–70 (orb is 200 viewBox units, sits in centre 80–120)
        delay: (i % 7) * 0.4,
      };
    });
  }, []);

  return (
    <div
      className={`pointer-events-none ${driftClass} ${className}`}
      style={{
        width: size,
        height: size,
        opacity: ready ? opacity : 0,
        transition: "opacity 1.6s ease-out",
        position: "relative",
        ...style,
      }}
      aria-hidden="true"
    >
      {/* ── Layer 1: caustic shader wash (CSS conic + radial, slowly rotating) */}
      <div
        className="absolute inset-0 rounded-full pearl-caustic-wash"
        style={{
          background: `
            conic-gradient(from 0deg at 50% 50%,
              rgba(196,214,210,0.0) 0deg,
              rgba(196,214,210,0.18) 60deg,
              rgba(255,255,255,0.0) 130deg,
              rgba(196,214,210,0.22) 220deg,
              rgba(255,255,255,0.0) 300deg,
              rgba(196,214,210,0.0) 360deg),
            radial-gradient(circle at 50% 50%,
              rgba(255,255,255,0.55) 0%,
              rgba(255,255,255,0.0) 65%)
          `,
          filter: "blur(22px)",
          transform: "scale(1.9)",
        }}
      />

      {/* ── Layer 2: outer feathery white bloom */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%,
            #FFFFFF 0%,
            rgba(255,255,255,0.78) 24%,
            ${bloom}55 50%,
            ${tint}1A 72%,
            transparent 90%)`,
          filter: "blur(38px)",
          transform: "scale(1.7)",
        }}
      />

      {/* ── Layer 3: SVG feather plumes radiating outward */}
      {showFeathers && (
        <svg
          className="absolute inset-0"
          viewBox="0 0 200 200"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          <defs>
            <linearGradient id="featherGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="55%" stopColor="rgba(232,238,236,0.55)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          {feathers.map((f, i) => (
            <Feather key={i} rotation={f.rotation} length={f.length} delay={f.delay} />
          ))}
        </svg>
      )}

      {/* ── Layer 4: WebGL pearl sphere */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 3.2], fov: 38 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, premultipliedAlpha: true }}
            onCreated={() => setTimeout(() => setReady(true), 250)}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={1.4} color="#FFFFFF" />
            <hemisphereLight args={["#FFFFFF", "#E8EEEC", 0.9]} />
            <directionalLight position={[3, 4, 5]} intensity={1.6} color="#FFFFFF" />
            <directionalLight position={[-3, -2, 3]} intensity={0.6} color="#FFFFFF" />
            <directionalLight position={[0, 5, -3]} intensity={0.5} color="#F8FAF9" />
            <pointLight position={[2, 2, 3]} intensity={0.8} color={tint} />
            <Environment preset="studio" environmentIntensity={1.2} />
            <Sphere tint={tint} />
          </Canvas>
        </Suspense>
      </div>

      {/* ── Layer 5: NZ data-node constellation (sits in front, twinkling) */}
      {showNodes && (
        <svg
          className="absolute inset-0"
          viewBox="-1 -1 2 2"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="40%" stopColor="#C4D6D2" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#C4D6D2" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Faint connecting threads, North → South Island */}
          <path
            d={NZ_NODES.map((n, i) => `${i === 0 ? "M" : "L"} ${n.x * 0.55} ${n.y * 0.55}`).join(" ")}
            stroke="rgba(196,214,210,0.35)"
            strokeWidth="0.004"
            fill="none"
            strokeDasharray="0.012 0.018"
          />
          {NZ_NODES.map((n, i) => (
            <g key={i} transform={`translate(${n.x * 0.55} ${n.y * 0.55})`}>
              {/* outer glow */}
              <circle
                r={n.size * 0.012}
                fill="url(#nodeGlow)"
                style={{ animation: `pearl-node-twinkle 3.4s ease-in-out ${n.delay}s infinite` }}
              />
              {/* hot core */}
              <circle
                r={n.size * 0.0035}
                fill="#FFFFFF"
                style={{ animation: `pearl-node-twinkle 3.4s ease-in-out ${n.delay}s infinite` }}
              />
            </g>
          ))}
        </svg>
      )}

      {/* ── Layer 6: top-left specular catchlight */}
      <div
        className="absolute rounded-full"
        style={{
          top: "18%",
          left: "22%",
          width: "22%",
          height: "22%",
          background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(6px)",
        }}
      />
    </div>
  );
}
