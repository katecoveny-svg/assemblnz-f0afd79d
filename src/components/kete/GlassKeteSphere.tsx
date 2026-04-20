import React, { useRef, useMemo, Suspense, forwardRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

interface GlassKeteSphereProps {
  /** Tint colour for the glass (kete brand colour) — typically soft teal */
  accentColor: string;
  /** Lighter highlight colour — used for the bright catch-light */
  accentLight: string;
  /** Render size in CSS pixels */
  size?: number;
  className?: string;
  /** kept for API compat */
  swirlCount?: number;
}

/**
 * Calm Glass Kete Orb (refined 2026-04-20)
 *
 * Replaces the previous "koru spiral inside a sphere" treatment with a
 * single clean luminescent glass orb — the same vocabulary as the new
 * /next hero. No internal filaments, no orbiting secondary, no
 * contact shadow. Just a tinted glass sphere with soft highlights and
 * a CSS halo behind it.
 */

const GlassOrb = ({
  accentColor,
  accentLight,
}: {
  accentColor: string;
  accentLight: string;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const tintedGlass = useMemo(
    () => new THREE.Color(accentColor).lerp(new THREE.Color("#FFFFFF"), 0.55),
    [accentColor]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.12;
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.05;
    }
    if (haloRef.current) {
      const pulse = 0.16 + 0.08 * Math.sin(t * 1.2);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer luminescent halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.55, 32, 32]} />
        <meshBasicMaterial
          color={accentLight}
          transparent
          opacity={0.18}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* The glass orb itself */}
      <mesh>
        <sphereGeometry args={[1.2, 96, 96]} />
        <MeshTransmissionMaterial
          color={tintedGlass}
          transmission={0.98}
          roughness={0.03}
          clearcoat={1}
          clearcoatRoughness={0.02}
          ior={1.42}
          samples={8}
          distortion={0.12}
          temporalDistortion={0.05}
          envMapIntensity={2.0}
          chromaticAberration={0.025}
          thickness={0.7}
          attenuationColor={new THREE.Color(accentColor)}
          attenuationDistance={2.6}
          anisotropy={0.1}
        />
      </mesh>

      {/* Bright specular catch-light */}
      <mesh position={[-0.42, 0.5, 0.78]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.55} toneMapped={false} />
      </mesh>

      {/* Smaller secondary highlight */}
      <mesh position={[0.38, -0.18, 0.85]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.32} toneMapped={false} />
      </mesh>
    </group>
  );
};

const GlassKeteSphere = forwardRef<HTMLDivElement, GlassKeteSphereProps>(({
  accentColor,
  accentLight,
  size = 200,
  className = "",
}, ref) => {
  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* CSS ambient halo behind the sphere — soft teal bloom */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentLight}40 0%, ${accentColor}1A 38%, transparent 72%)`,
          filter: "blur(28px)",
          transform: "scale(1.4)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0.1, 3.6], fov: 36 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Environment preset="studio" environmentIntensity={0.85} />
        <ambientLight intensity={0.85} color="#F4FBFB" />
        <directionalLight position={[6, 8, 5]} intensity={1.4} color="#FFFFFF" />
        <directionalLight position={[-6, 2, 6]} intensity={0.95} color="#CFEFEE" />
        <pointLight position={[0, 0, 5]} intensity={0.7} color={accentLight} />

        <Suspense fallback={null}>
          <Float speed={1.0} rotationIntensity={0.12} floatIntensity={0.35}>
            <GlassOrb accentColor={accentColor} accentLight={accentLight} />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
});

GlassKeteSphere.displayName = "GlassKeteSphere";

export default GlassKeteSphere;
