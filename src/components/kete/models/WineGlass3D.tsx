import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";

const WineGlassMesh = ({ accentColor, accentLight }: { accentColor: string; accentLight: string }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.4;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.08;
    }
  });

  const { bowlLines, stemLine, baseLine, liquidLine } = useMemo(() => {
    const bowl: [number, number, number][][] = [];
    // Horizontal rings for the bowl
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const y = 0.15 + t * 0.7;
      // Wine glass bowl curve: wide at top, narrow at bottom
      const radius = 0.12 + Math.pow(t, 0.6) * 0.42;
      const pts: [number, number, number][] = [];
      for (let j = 0; j <= 48; j++) {
        const angle = (j / 48) * Math.PI * 2;
        pts.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
      }
      bowl.push(pts);
    }

    // Vertical ribs
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const pts: [number, number, number][] = [];
      for (let j = 0; j <= 24; j++) {
        const t = j / 24;
        const y = 0.15 + t * 0.7;
        const radius = 0.12 + Math.pow(t, 0.6) * 0.42;
        pts.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
      }
      bowl.push(pts);
    }

    // Stem
    const stem: [number, number, number][] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const y = -0.55 + t * 0.7;
      stem.push([0, y, 0]);
    }

    // Base disc
    const base: [number, number, number][] = [];
    for (let j = 0; j <= 48; j++) {
      const angle = (j / 48) * Math.PI * 2;
      base.push([Math.cos(angle) * 0.3, -0.55, Math.sin(angle) * 0.3]);
    }

    // Liquid level line
    const liquid: [number, number, number][] = [];
    for (let j = 0; j <= 48; j++) {
      const angle = (j / 48) * Math.PI * 2;
      const r = 0.12 + Math.pow(0.55, 0.6) * 0.42;
      liquid.push([Math.cos(angle) * r * 0.95, 0.55, Math.sin(angle) * r * 0.95]);
    }

    return { bowlLines: bowl, stemLine: stem, baseLine: base, liquidLine: liquid };
  }, []);

  return (
    <group ref={groupRef}>
      {/* Glow sphere */}
      <mesh>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>

      {bowlLines.map((pts, i) => (
        <Line key={`b-${i}`} points={pts} color={i < 10 ? accentLight : accentColor} lineWidth={i < 10 ? 1.0 : 0.6} transparent opacity={i < 10 ? 0.7 : 0.4} />
      ))}
      <Line points={stemLine} color={accentColor} lineWidth={1.5} transparent opacity={0.8} />
      <Line points={baseLine} color={accentColor} lineWidth={1.2} transparent opacity={0.7} />
      <Line points={liquidLine} color={accentLight} lineWidth={1.8} transparent opacity={0.9} />

      {/* Liquid surface glow dots */}
      {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((a, i) => {
        const r = 0.12 + Math.pow(0.55, 0.6) * 0.42 * 0.6;
        return (
          <mesh key={`liq-${i}`} position={[Math.cos(a) * r, 0.54, Math.sin(a) * r]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={accentLight} transparent opacity={0.9} />
          </mesh>
        );
      })}
    </group>
  );
};

interface Props { accentColor: string; accentLight: string; size?: number; className?: string; }

const WineGlass3D: React.FC<Props> = ({ accentColor, accentLight, size = 140, className = "" }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`, filter: "blur(12px)" }} />
    <Canvas camera={{ position: [0, 0.1, 2.4], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 3, 2]} intensity={0.8} color={accentLight} />
      <pointLight position={[-2, -1, 2]} intensity={0.3} color={accentColor} />
      <Float speed={2} rotationIntensity={0.25} floatIntensity={0.35}>
        <WineGlassMesh accentColor={accentColor} accentLight={accentLight} />
      </Float>
    </Canvas>
  </div>
);

export default WineGlass3D;
