import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * PearlGlobe — frosted opal sphere with feathery outer bloom.
 * Pounamu inner glow. No metallic shine. Slow drift, never bouncy.
 *
 * Uses react-three-fiber + drei MeshTransmissionMaterial for refraction,
 * wrapped in CSS radial halos for the feathery white-fade.
 */
function Sphere({ tint }: { tint: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.06;
    ref.current.rotation.x += dt * 0.02;
  });
  return (
    <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.3} floatingRange={[-0.06, 0.06]}>
      <mesh ref={ref}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.8}
          chromaticAberration={0.015}
          anisotropy={0.08}
          distortion={0.18}
          distortionScale={0.3}
          temporalDistortion={0.05}
          transmission={1}
          roughness={0.32}
          ior={1.25}
          color="#FFFFFF"
          attenuationColor={tint}
          attenuationDistance={4.8}
        />
      </mesh>
    </Float>
  );
}

interface PearlGlobeProps {
  /** Pixel size of the globe canvas */
  size?: number;
  /** Inner attenuation tint — pounamu by default */
  tint?: string;
  /** Outer feathery bloom colour */
  bloom?: string;
  /** Drift speed: slow (22s) or med (16s) */
  drift?: "slow" | "med" | "none";
  /** Optional class for positioning */
  className?: string;
  /** Inline style overrides (top/left/right/bottom etc.) */
  style?: React.CSSProperties;
  /** Overall opacity — atmospheric pearls sit around 0.55–0.85 */
  opacity?: number;
}

/**
 * Place a luminous, feathery 3D pearl anywhere on the page.
 * Wraps the WebGL sphere in soft CSS halos to achieve the "moonstone in fog" feel.
 */
export default function PearlGlobe({
  size = 320,
  tint = "#C4D6D2",
  bloom = "#FFFFFF",
  drift = "slow",
  className = "",
  style,
  opacity = 0.78,
}: PearlGlobeProps) {
  const [ready, setReady] = useState(false);
  const driftClass = drift === "none" ? "" : drift === "med" ? "pearl-drift-med" : "pearl-drift-slow";

  return (
    <div
      className={`pointer-events-none ${driftClass} ${className}`}
      style={{
        width: size,
        height: size,
        opacity: ready ? opacity : 0,
        transition: "opacity 1.6s ease-out",
        ...style,
      }}
      aria-hidden="true"
    >
      {/* Outer feathery bloom — pure white fading into the canvas */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%,
            #FFFFFF 0%,
            rgba(255,255,255,0.85) 22%,
            ${bloom}66 48%,
            ${tint}1A 70%,
            transparent 88%)`,
          filter: "blur(36px)",
          transform: "scale(1.75)",
        }}
      />
      {/* Inner pearl sheen — soft sea-glass whisper, never neon */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 38% 36%,
            rgba(255,255,255,0.95) 0%,
            rgba(255,255,255,0.2) 38%,
            transparent 62%),
            radial-gradient(circle at 64% 68%,
            ${tint}33 0%,
            ${tint}10 38%,
            transparent 72%)`,
          filter: "blur(10px)",
          transform: "scale(1.08)",
        }}
      />
      {/* The actual transmission sphere */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 3.2], fov: 38 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, premultipliedAlpha: true }}
            onCreated={() => setTimeout(() => setReady(true), 250)}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.85} />
            <directionalLight position={[3, 4, 5]} intensity={1.0} color="#FFFFFF" />
            <directionalLight position={[-3, -2, 3]} intensity={0.25} color={tint} />
            <directionalLight position={[0, 5, -3]} intensity={0.3} color="#F8FAF9" />
            <Environment preset="studio" />
            <Sphere tint={tint} />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
