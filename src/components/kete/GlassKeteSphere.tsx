import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface GlassKeteSphereProps {
  /** Tint colour for the glass (kete brand colour) */
  accentColor: string;
  /** Lighter highlight colour (kept for API compat — not visually required) */
  accentLight: string;
  /** Render size in CSS pixels */
  size?: number;
  className?: string;
  /** Kept for API compat */
  swirlCount?: number;
}

/**
 * Single glass marble — visually matches the homepage GlassKoruHero spheres:
 *  • brightened tint via color × 1.5
 *  • MeshTransmissionMaterial with high envMapIntensity, very low roughness
 *  • white specular dots (top + bottom catch-light)
 *  • soft pulsing halo
 *  • studio environment + multi-directional lights
 *  • soft contact shadow
 */
const GlassMarble = ({ accentColor }: { accentColor: string }) => {
  const ref = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const brightColor = useMemo(
    () => new THREE.Color(accentColor).multiplyScalar(1.5),
    [accentColor]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.3;
      ref.current.rotation.x = Math.sin(t * 0.4) * 0.15;
    }
    if (haloRef.current) {
      const sparkle = 0.6 + 0.4 * Math.sin(t * 3);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = sparkle * 0.28;
    }
  });

  return (
    <group>
      {/* Outer glass shell — homepage-matched material */}
      <mesh ref={ref}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshTransmissionMaterial
          color={brightColor}
          transmission={0.82}
          roughness={0.005}
          clearcoat={1}
          clearcoatRoughness={0.005}
          ior={1.65}
          samples={16}
          distortion={0.5}
          temporalDistortion={0.25}
          envMapIntensity={5}
          chromaticAberration={0.06}
          thickness={0.6}
        />
      </mesh>

      {/* Pulsing colour halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.28} depthWrite={false} />
      </mesh>

      {/* Top-left specular catch-light */}
      <mesh position={[-0.32, 0.4, 0.5]}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.7} />
      </mesh>

      {/* Bottom-right secondary catch-light */}
      <mesh position={[0.28, -0.32, 0.45]}>
        <sphereGeometry args={[0.16, 18, 18]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.45} />
      </mesh>
    </group>
  );
};

const GlassKeteSphere: React.FC<GlassKeteSphereProps> = ({
  accentColor,
  size = 200,
  className = "",
}) => {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* CSS ambient halo behind the marble */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor}40 0%, ${accentColor}15 40%, transparent 72%)`,
          filter: "blur(28px)",
          transform: "scale(1.35)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 3.0], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        {/* Environment + lights MATCHED to GlassKoruHero */}
        <Environment preset="studio" environmentIntensity={0.8} />
        <ambientLight intensity={1.2} color="#F8F6F0" />
        <directionalLight position={[8, 8, 5]} intensity={2.0} color="#FFFFFF" />
        <directionalLight position={[-5, 3, 8]} intensity={1.0} color="#D4F0F0" />
        <directionalLight position={[3, -3, 6]} intensity={0.6} color="#FFFBE8" />
        <pointLight position={[0, 0, 6]} intensity={1.2} color="#FFFFFF" />

        <Suspense fallback={null}>
          <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.6}>
            <GlassMarble accentColor={accentColor} />
          </Float>

          <ContactShadows
            position={[0, -1.15, 0]}
            opacity={0.4}
            scale={3}
            blur={2.4}
            far={2}
            color="#1a1d29"
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GlassKeteSphere;
