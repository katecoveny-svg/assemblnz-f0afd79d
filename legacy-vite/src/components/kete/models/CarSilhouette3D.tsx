import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";

const CarMesh = ({ accentColor, accentLight }: { accentColor: string; accentLight: string }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.35;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.15) * 0.08;
    }
  });

  const { bodyLine, roofLine, wheelL, wheelR, windowLine } = useMemo(() => {
    // Side profile silhouette
    const body: [number, number, number][] = [
      [-0.7, -0.15, 0], [-0.65, -0.2, 0], [-0.35, -0.2, 0],
      [-0.3, -0.15, 0], [-0.15, -0.15, 0], [0.15, -0.15, 0],
      [0.3, -0.15, 0], [0.35, -0.2, 0], [0.65, -0.2, 0],
      [0.7, -0.15, 0], [0.7, 0, 0], [0.65, 0.05, 0],
      [0.4, 0.05, 0], [0.35, 0.25, 0], [0.1, 0.35, 0],
      [-0.15, 0.35, 0], [-0.35, 0.25, 0], [-0.55, 0.05, 0],
      [-0.65, 0.05, 0], [-0.7, 0, 0], [-0.7, -0.15, 0],
    ];

    const roof: [number, number, number][] = [
      [-0.35, 0.25, 0], [-0.15, 0.35, 0], [0.1, 0.35, 0], [0.35, 0.25, 0],
    ];

    // Wheels
    const wl: [number, number, number][] = [];
    const wr: [number, number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      wl.push([-0.42 + Math.cos(a) * 0.1, -0.2 + Math.sin(a) * 0.1, 0]);
      wr.push([0.42 + Math.cos(a) * 0.1, -0.2 + Math.sin(a) * 0.1, 0]);
    }

    // Window
    const win: [number, number, number][] = [
      [-0.3, 0.08, 0.01], [-0.12, 0.3, 0.01], [0.08, 0.3, 0.01], [0.3, 0.08, 0.01], [-0.3, 0.08, 0.01],
    ];

    return { bodyLine: body, roofLine: roof, wheelL: wl, wheelR: wr, windowLine: win };
  }, []);

  // Duplicate the body lines at different z-depths for 3D
  const depths = [-0.25, 0, 0.25];

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
      {depths.map((z, di) => {
        const offsetBody = bodyLine.map(([x, y]) => [x, y, z] as [number, number, number]);
        const offsetWin = windowLine.map(([x, y]) => [x, y, z + 0.01] as [number, number, number]);
        return (
          <group key={`depth-${di}`}>
            <Line points={offsetBody} color={accentColor} lineWidth={di === 1 ? 1.5 : 0.6} transparent opacity={di === 1 ? 0.8 : 0.3} />
            {di === 1 && <Line points={offsetWin} color={accentLight} lineWidth={1} transparent opacity={0.5} />}
          </group>
        );
      })}
      {/* Connect front/back at corners */}
      {[[-0.7, 0, 0], [0.7, 0, 0], [0.1, 0.35, 0], [-0.15, 0.35, 0]].map(([x, y], i) => (
        <Line key={`conn-${i}`} points={[[x, y, -0.25], [x, y, 0.25]]} color={accentColor} lineWidth={0.5} transparent opacity={0.3} />
      ))}
      {/* Wheels at z=0 */}
      <Line points={wheelL} color={accentLight} lineWidth={1.5} transparent opacity={0.9} />
      <Line points={wheelR} color={accentLight} lineWidth={1.5} transparent opacity={0.9} />
      {/* Headlight glow */}
      <mesh position={[0.68, 0.02, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color={accentLight} transparent opacity={0.9} />
      </mesh>
      <mesh position={[-0.68, 0.02, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#E84040" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

interface Props { accentColor: string; accentLight: string; size?: number; className?: string; }

const CarSilhouette3D: React.FC<Props> = ({ accentColor, accentLight, size = 140, className = "" }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`, filter: "blur(12px)" }} />
    <Canvas camera={{ position: [0, 0.2, 2.2], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 3, 2]} intensity={0.8} color={accentLight} />
      <pointLight position={[-2, -1, 2]} intensity={0.3} color={accentColor} />
      <Float speed={2} rotationIntensity={0.25} floatIntensity={0.35}>
        <CarMesh accentColor={accentColor} accentLight={accentLight} />
      </Float>
    </Canvas>
  </div>
);

export default CarSilhouette3D;
