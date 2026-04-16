import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Environment, Line } from "@react-three/drei";
import * as THREE from "three";

interface GlassKeteSphereProps {
  /** Tint colour for the glass (kete brand colour) */
  accentColor: string;
  /** Lighter highlight colour for the inner filigree glow */
  accentLight: string;
  /** Render size in CSS pixels */
  size?: number;
  className?: string;
  /** Density of the inner woven filigree pattern. Default 6 */
  patternDensity?: number;
}

/**
 * Inner luminous filigree — concentric glowing rings + radial spokes,
 * suspended inside the glass sphere. Inspired by the Veo glass orb video.
 */
const InnerFiligree = ({
  accentColor,
  accentLight,
  density = 6,
}: {
  accentColor: string;
  accentLight: string;
  density?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = clock.getElapsedTime() * 0.15;
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.3;
    }
  });

  const { rings, spokes, particles } = useMemo(() => {
    const r: [number, number, number][][] = [];
    // Concentric rings of varying radius
    for (let i = 1; i <= density; i++) {
      const radius = (i / density) * 0.6;
      const pts: [number, number, number][] = [];
      for (let j = 0; j <= 64; j++) {
        const a = (j / 64) * Math.PI * 2;
        pts.push([Math.cos(a) * radius, Math.sin(a) * radius, 0]);
      }
      r.push(pts);
    }

    // Radial spokes (mandala rays)
    const s: [number, number, number][][] = [];
    const spokeCount = density * 4;
    for (let i = 0; i < spokeCount; i++) {
      const a = (i / spokeCount) * Math.PI * 2;
      const inner = 0.05;
      const outer = 0.62;
      s.push([
        [Math.cos(a) * inner, Math.sin(a) * inner, 0],
        [Math.cos(a) * outer, Math.sin(a) * outer, 0],
      ]);
    }

    // Floating particle nodes
    const p: { pos: [number, number, number]; size: number }[] = [];
    for (let i = 0; i < density * 3; i++) {
      const a = (i / (density * 3)) * Math.PI * 2;
      const radius = 0.3 + Math.sin(i * 1.7) * 0.25;
      p.push({
        pos: [Math.cos(a) * radius, Math.sin(a) * radius, (Math.random() - 0.5) * 0.1],
        size: 0.012 + Math.random() * 0.015,
      });
    }

    return { rings: r, spokes: s, particles: p };
  }, [density]);

  return (
    <group ref={groupRef}>
      {/* Central glow core */}
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={accentLight} transparent opacity={0.95} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color={accentLight} transparent opacity={0.25} />
      </mesh>

      {/* Concentric rings */}
      {rings.map((pts, i) => (
        <Line
          key={`r-${i}`}
          points={pts}
          color={i % 2 === 0 ? accentLight : accentColor}
          lineWidth={1}
          transparent
          opacity={0.85 - (i / rings.length) * 0.4}
        />
      ))}

      {/* Radial spokes */}
      {spokes.map((pts, i) => (
        <Line
          key={`s-${i}`}
          points={pts}
          color={accentLight}
          lineWidth={0.6}
          transparent
          opacity={0.55}
        />
      ))}

      {/* Floating particle nodes */}
      {particles.map((p, i) => (
        <mesh key={`p-${i}`} position={p.pos}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial color={accentLight} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Glass shell — translucent tinted glass sphere using
 * MeshTransmissionMaterial for refraction + chromatic aberration.
 */
const GlassShell = ({ accentColor }: { accentColor: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshTransmissionMaterial
        backside
        samples={6}
        thickness={1.2}
        chromaticAberration={0.08}
        anisotropy={0.3}
        distortion={0.15}
        distortionScale={0.3}
        temporalDistortion={0.05}
        transmission={1}
        roughness={0.05}
        ior={1.45}
        color="#ffffff"
        attenuationColor={accentColor}
        attenuationDistance={1.8}
      />
    </mesh>
  );
};

const GlassKeteSphere: React.FC<GlassKeteSphereProps> = ({
  accentColor,
  accentLight,
  size = 180,
  className = "",
  patternDensity = 6,
}) => {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Soft halo behind the sphere */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor}30 0%, ${accentColor}10 45%, transparent 70%)`,
          filter: "blur(20px)",
          transform: "scale(1.3)",
        }}
      />
      {/* Soft contact shadow under the sphere */}
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
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 3]} intensity={1.1} />
        <directionalLight position={[-3, -2, 2]} intensity={0.4} color={accentColor} />
        <pointLight position={[0, 0, 1.5]} intensity={0.6} color={accentLight} />
        <Environment preset="studio" />

        <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
          <group>
            <GlassShell accentColor={accentColor} />
            {/* Filigree sits slightly behind centre so refraction magnifies it */}
            <group position={[0, 0, -0.1]}>
              <InnerFiligree
                accentColor={accentColor}
                accentLight={accentLight}
                density={patternDensity}
              />
            </group>
          </group>
        </Float>
      </Canvas>
    </div>
  );
};

export default GlassKeteSphere;
