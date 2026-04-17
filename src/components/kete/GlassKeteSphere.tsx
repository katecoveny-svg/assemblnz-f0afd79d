import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

interface GlassKeteSphereProps {
  /** Tint colour for the glass (kete brand colour) */
  accentColor: string;
  /** Lighter highlight colour used for the internal swirls */
  accentLight: string;
  /** Render size in CSS pixels */
  size?: number;
  className?: string;
  /** Number of internal swirl ribbons. Default 5 */
  swirlCount?: number;
}

/**
 * Internal swirls — soft volumetric ribbons of a lighter tint suspended
 * inside the marble. Each swirl is a thin torus rotated on a unique axis,
 * so as the marble turns the swirls drift through it like trapped smoke.
 */
const InnerSwirls = ({
  accentLight,
  count = 5,
}: {
  accentLight: string;
  count?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.18;
    groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.4;
  });

  const swirls = useMemo(() => {
    const out: {
      radius: number;
      tube: number;
      rotation: [number, number, number];
      opacity: number;
    }[] = [];
    for (let i = 0; i < count; i++) {
      out.push({
        radius: 0.45 + (i / count) * 0.25, // 0.45 → 0.7
        tube: 0.025 + Math.random() * 0.02,
        rotation: [
          (i / count) * Math.PI,
          (i * 1.7) % Math.PI,
          (i * 0.9) % Math.PI,
        ],
        opacity: 0.5 + Math.random() * 0.3,
      });
    }
    return out;
  }, [count]);

  return (
    <group ref={groupRef}>
      {/* Soft inner glow core */}
      <mesh>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color={accentLight} transparent opacity={0.18} />
      </mesh>

      {/* Volumetric ribbon swirls */}
      {swirls.map((s, i) => (
        <mesh key={`swirl-${i}`} rotation={s.rotation}>
          <torusGeometry args={[s.radius, s.tube, 16, 96]} />
          <meshBasicMaterial
            color={accentLight}
            transparent
            opacity={s.opacity}
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Glass shell — translucent tinted glass marble with refraction +
 * chromatic aberration. The internal swirls show through and are
 * magnified by the glass.
 */
const GlassShell = ({ accentColor }: { accentColor: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.06;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 96, 96]} />
      <MeshTransmissionMaterial
        backside
        samples={8}
        thickness={1.4}
        chromaticAberration={0.06}
        anisotropy={0.2}
        distortion={0.25}
        distortionScale={0.4}
        temporalDistortion={0.08}
        transmission={1}
        roughness={0.02}
        ior={1.5}
        color="#ffffff"
        attenuationColor={accentColor}
        attenuationDistance={1.4}
      />
    </mesh>
  );
};

const GlassKeteSphere: React.FC<GlassKeteSphereProps> = ({
  accentColor,
  accentLight,
  size = 200,
  className = "",
  swirlCount = 5,
}) => {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Soft halo behind the marble */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor}30 0%, ${accentColor}10 45%, transparent 70%)`,
          filter: "blur(20px)",
          transform: "scale(1.3)",
        }}
      />
      {/* Soft contact shadow under the marble */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "10%",
          right: "10%",
          bottom: "2%",
          height: "8%",
          background: `radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, transparent 70%)`,
          filter: "blur(8px)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 3]} intensity={1.2} />
        <directionalLight position={[-3, -2, 2]} intensity={0.5} color={accentColor} />
        <pointLight position={[0, 0, 1.5]} intensity={0.7} color={accentLight} />
        <Environment preset="studio" />

        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
          <group>
            <GlassShell accentColor={accentColor} />
            {/* Swirls sit slightly behind centre so refraction magnifies them */}
            <group position={[0, 0, -0.05]}>
              <InnerSwirls accentLight={accentLight} count={swirlCount} />
            </group>
          </group>
        </Float>
      </Canvas>
    </div>
  );
};

export default GlassKeteSphere;
