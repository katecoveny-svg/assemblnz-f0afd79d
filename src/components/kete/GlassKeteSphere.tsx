import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Environment, ContactShadows } from "@react-three/drei";
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
        radius: 0.35 + (i / count) * 0.4, // 0.35 → 0.75
        tube: 0.05 + Math.random() * 0.04,
        rotation: [
          (i / count) * Math.PI,
          (i * 1.7) % Math.PI,
          (i * 0.9) % Math.PI,
        ],
        opacity: 0.85 + Math.random() * 0.15,
      });
    }
    return out;
  }, [count]);

  return (
    <group ref={groupRef}>
      {/* Bright glow core — magnified by glass refraction */}
      <mesh>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshBasicMaterial color={accentLight} transparent opacity={0.75} />
      </mesh>

      {/* Volumetric ribbon swirls — thicker so they read clearly through the glass */}
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
      <sphereGeometry args={[1, 128, 128]} />
      <MeshTransmissionMaterial
        backside
        backsideThickness={1.2}
        samples={16}
        resolution={1024}
        thickness={3.2}
        chromaticAberration={0.12}
        anisotropy={0.4}
        distortion={0.15}
        distortionScale={0.5}
        temporalDistortion={0.04}
        transmission={1}
        roughness={0}
        ior={1.55}
        clearcoat={1}
        clearcoatRoughness={0}
        attenuationColor={accentColor}
        attenuationDistance={0.85}
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
      {/* Outer ambient halo — coloured glow leaking from glass */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor}40 0%, ${accentColor}15 40%, transparent 72%)`,
          filter: "blur(28px)",
          transform: "scale(1.35)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        style={{ background: "transparent" }}
      >
        {/* Studio lighting — bright key, cool fill, warm rim */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 3]} intensity={2.2} color="#ffffff" />
        <directionalLight position={[-4, -1, 2]} intensity={0.9} color={accentColor} />
        <directionalLight position={[0, -3, -2]} intensity={0.6} color={accentLight} />
        <pointLight position={[0, 0, 1.8]} intensity={0.8} color={accentLight} />
        {/* Top spotlight for that crisp specular hotspot */}
        <spotLight position={[0, 4, 2]} angle={0.5} penumbra={0.6} intensity={2.5} color="#ffffff" />
        <Environment preset="studio" />

        <Float speed={1.0} rotationIntensity={0.2} floatIntensity={0.4}>
          <group>
            <GlassShell accentColor={accentColor} />
            {/* Swirls sit slightly behind centre so refraction magnifies them */}
            <group position={[0, 0, -0.05]}>
              <InnerSwirls accentLight={accentLight} count={swirlCount} />
            </group>
          </group>
        </Float>

        {/* Tactile contact shadow on a virtual surface */}
        <ContactShadows
          position={[0, -1.05, 0]}
          opacity={0.55}
          scale={3}
          blur={2.4}
          far={2}
          color="#1a1d29"
        />
      </Canvas>
    </div>
  );
};

export default GlassKeteSphere;
