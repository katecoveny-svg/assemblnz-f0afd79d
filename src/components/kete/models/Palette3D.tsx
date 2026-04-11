import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";

const PaletteMesh = ({ accentColor, accentLight }: { accentColor: string; accentLight: string }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.12;
    }
  });

  const { outlinePts, thumbHolePts } = useMemo(() => {
    // Palette outline - organic kidney shape
    const outline: [number, number, number][] = [];
    for (let i = 0; i <= 64; i++) {
      const t = (i / 64) * Math.PI * 2;
      const r = 0.55 + 0.15 * Math.cos(t * 2) + 0.08 * Math.sin(t * 3);
      outline.push([Math.cos(t) * r, 0, Math.sin(t) * r]);
    }
    // Thumb hole
    const thumb: [number, number, number][] = [];
    for (let i = 0; i <= 32; i++) {
      const t = (i / 32) * Math.PI * 2;
      thumb.push([0.25 + Math.cos(t) * 0.12, 0.01, -0.2 + Math.sin(t) * 0.12]);
    }
    return { outlinePts: outline, thumbHolePts: thumb };
  }, []);

  // Paint blob positions
  const blobs = [
    { pos: [-0.3, 0.02, 0.25] as [number, number, number], color: "#D4A843", r: 0.06 },
    { pos: [-0.05, 0.02, 0.35] as [number, number, number], color: "#3A7D6E", r: 0.055 },
    { pos: [0.2, 0.02, 0.3] as [number, number, number], color: "#7ECFC2", r: 0.05 },
    { pos: [-0.4, 0.02, 0.0] as [number, number, number], color: "#E8C76A", r: 0.05 },
    { pos: [-0.15, 0.02, -0.1] as [number, number, number], color: "#B8892A", r: 0.045 },
  ];

  return (
    <group ref={groupRef} rotation={[Math.PI * 0.15, 0, 0]}>
      <mesh>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
      <Line points={outlinePts} color={accentColor} lineWidth={2} transparent opacity={0.8} />
      <Line points={thumbHolePts} color={accentLight} lineWidth={1.5} transparent opacity={0.7} />
      {/* Cross-hatch surface lines */}
      {[-0.3, 0, 0.3].map((z, i) => {
        const pts: [number, number, number][] = [[-0.6, 0, z], [0.6, 0, z]];
        return <Line key={`hx-${i}`} points={pts} color={accentColor} lineWidth={0.4} transparent opacity={0.15} />;
      })}
      {/* Paint blobs */}
      {blobs.map((b, i) => (
        <mesh key={`blob-${i}`} position={b.pos}>
          <sphereGeometry args={[b.r, 12, 12]} />
          <meshBasicMaterial color={b.color} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
};

interface Props { accentColor: string; accentLight: string; size?: number; className?: string; }

const Palette3D: React.FC<Props> = ({ accentColor, accentLight, size = 140, className = "" }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`, filter: "blur(12px)" }} />
    <Canvas camera={{ position: [0, 1.2, 1.8], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 3, 2]} intensity={0.8} color={accentLight} />
      <pointLight position={[-2, -1, 2]} intensity={0.3} color={accentColor} />
      <Float speed={2} rotationIntensity={0.25} floatIntensity={0.35}>
        <PaletteMesh accentColor={accentColor} accentLight={accentLight} />
      </Float>
    </Canvas>
  </div>
);

export default Palette3D;
