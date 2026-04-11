import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";

const HardHatMesh = ({ accentColor, accentLight }: { accentColor: string; accentLight: string }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.35;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.15) * 0.1;
    }
  });

  const { domeLines, brimLine, ridgeLine } = useMemo(() => {
    const dome: [number, number, number][][] = [];
    // Horizontal rings for dome
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const y = -0.1 + t * 0.6;
      const radius = 0.55 * Math.cos(t * Math.PI * 0.45);
      const pts: [number, number, number][] = [];
      for (let j = 0; j <= 48; j++) {
        const angle = (j / 48) * Math.PI * 2;
        pts.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
      }
      dome.push(pts);
    }
    // Vertical ribs
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const pts: [number, number, number][] = [];
      for (let j = 0; j <= 20; j++) {
        const t = j / 20;
        const y = -0.1 + t * 0.6;
        const radius = 0.55 * Math.cos(t * Math.PI * 0.45);
        pts.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
      }
      dome.push(pts);
    }

    // Brim
    const brim: [number, number, number][] = [];
    for (let j = 0; j <= 64; j++) {
      const angle = (j / 64) * Math.PI * 2;
      brim.push([Math.cos(angle) * 0.65, -0.1, Math.sin(angle) * 0.65]);
    }

    // Top ridge
    const ridge: [number, number, number][] = [];
    for (let j = 0; j <= 32; j++) {
      const t = j / 32;
      const angle = -Math.PI * 0.35 + t * Math.PI * 0.7;
      ridge.push([Math.sin(angle) * 0.15, 0.52, Math.cos(angle) * 0.02]);
    }

    return { domeLines: dome, brimLine: brim, ridgeLine: ridge };
  }, []);

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
      {domeLines.map((pts, i) => (
        <Line key={`d-${i}`} points={pts} color={i < 8 ? accentLight : accentColor} lineWidth={i < 8 ? 1.0 : 0.6} transparent opacity={i < 8 ? 0.7 : 0.4} />
      ))}
      <Line points={brimLine} color={accentColor} lineWidth={2} transparent opacity={0.9} />
      <Line points={ridgeLine} color={accentLight} lineWidth={2} transparent opacity={0.8} />
      {/* Glow nodes on brim */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={`n-${i}`} position={[Math.cos(a) * 0.65, -0.1, Math.sin(a) * 0.65]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={accentLight} transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
};

interface Props { accentColor: string; accentLight: string; size?: number; className?: string; }

const HardHat3D: React.FC<Props> = ({ accentColor, accentLight, size = 140, className = "" }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`, filter: "blur(12px)" }} />
    <Canvas camera={{ position: [0, 0.3, 2.2], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 3, 2]} intensity={0.8} color={accentLight} />
      <pointLight position={[-2, -1, 2]} intensity={0.3} color={accentColor} />
      <Float speed={2} rotationIntensity={0.25} floatIntensity={0.35}>
        <HardHatMesh accentColor={accentColor} accentLight={accentLight} />
      </Float>
    </Canvas>
  </div>
);

export default HardHat3D;
