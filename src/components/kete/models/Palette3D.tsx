import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";

const MegaphoneMesh = ({ accentColor, accentLight }: { accentColor: string; accentLight: string }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.25;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.15) * 0.08;
    }
  });

  const { coneLines, ringLines, waveLines, handleLine } = useMemo(() => {
    // Megaphone cone — longitudinal kete weave strands
    const cone: [number, number, number][][] = [];
    const strands = 16;
    for (let s = 0; s < strands; s++) {
      const angle = (s / strands) * Math.PI * 2;
      const pts: [number, number, number][] = [];
      for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        const radius = 0.08 + t * 0.45;
        const x = -0.5 + t * 1.0;
        // Gentle weave wobble
        const wobble = Math.sin(t * Math.PI * 4 + s * 0.8) * 0.02;
        pts.push([
          x,
          Math.cos(angle + t * 0.4) * (radius + wobble),
          Math.sin(angle + t * 0.4) * (radius + wobble),
        ]);
      }
      cone.push(pts);
    }

    // Horizontal ring weave lines
    const rings: [number, number, number][][] = [];
    for (let r = 0; r < 8; r++) {
      const t = (r + 1) / 9;
      const radius = 0.08 + t * 0.45;
      const x = -0.5 + t * 1.0;
      const ringPts: [number, number, number][] = [];
      for (let i = 0; i <= 48; i++) {
        const angle = (i / 48) * Math.PI * 2;
        ringPts.push([x, Math.cos(angle) * radius, Math.sin(angle) * radius]);
      }
      rings.push(ringPts);
    }

    // Sound waves emanating from the bell
    const waves: [number, number, number][][] = [];
    for (let w = 0; w < 3; w++) {
      const offset = 0.6 + w * 0.18;
      const waveR = 0.2 + w * 0.12;
      const wavePts: [number, number, number][] = [];
      for (let i = 0; i <= 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        wavePts.push([offset, Math.cos(angle) * waveR, Math.sin(angle) * waveR]);
      }
      waves.push(wavePts);
    }

    // Handle
    const handle: [number, number, number][] = [
      [-0.5, -0.12, 0],
      [-0.65, -0.22, 0],
      [-0.72, -0.35, 0],
    ];

    return { coneLines: cone, ringLines: rings, waveLines: waves, handleLine: handle };
  }, []);

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI * 0.05]}>
      {/* Ambient glow sphere */}
      <mesh>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>

      {/* Cone weave strands */}
      {coneLines.map((pts, i) => (
        <Line key={`strand-${i}`} points={pts} color={accentColor} lineWidth={1.5} transparent opacity={0.7} />
      ))}

      {/* Ring weave lines */}
      {ringLines.map((pts, i) => (
        <Line key={`ring-${i}`} points={pts} color={accentLight} lineWidth={0.8} transparent opacity={0.25} />
      ))}

      {/* Sound waves */}
      {waveLines.map((pts, i) => (
        <Line key={`wave-${i}`} points={pts} color={accentColor} lineWidth={1} transparent opacity={0.15 - i * 0.03} />
      ))}

      {/* Handle */}
      <Line points={handleLine} color={accentColor} lineWidth={2} transparent opacity={0.6} />

      {/* Small accent nodes at intersections */}
      {[[-0.3, 0, 0], [0.0, 0, 0], [0.3, 0, 0]].map((pos, i) => (
        <mesh key={`node-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={accentLight} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

interface Props { accentColor: string; accentLight: string; size?: number; className?: string; }

const Palette3D: React.FC<Props> = ({ accentColor, accentLight, size = 140, className = "" }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`, filter: "blur(12px)" }} />
    <Canvas camera={{ position: [0, 0.3, 2.2], fov: 38 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 3, 2]} intensity={0.8} color={accentLight} />
      <pointLight position={[-2, -1, 2]} intensity={0.3} color={accentColor} />
      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.25}>
        <MegaphoneMesh accentColor={accentColor} accentLight={accentLight} />
      </Float>
    </Canvas>
  </div>
);

export default Palette3D;
