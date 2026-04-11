import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";

const ContainerMesh = ({ accentColor, accentLight }: { accentColor: string; accentLight: string }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.15) * 0.08;
    }
  });

  const edges = useMemo(() => {
    const w = 0.7, h = 0.35, d = 0.3;
    // 8 corners of the box
    const c = [
      [-w, -h, -d], [w, -h, -d], [w, h, -d], [-w, h, -d],
      [-w, -h, d], [w, -h, d], [w, h, d], [-w, h, d],
    ] as [number, number, number][];

    const lines: [number, number, number][][] = [
      // Bottom
      [c[0], c[1]], [c[1], c[5]], [c[5], c[4]], [c[4], c[0]],
      // Top
      [c[3], c[2]], [c[2], c[6]], [c[6], c[7]], [c[7], c[3]],
      // Verticals
      [c[0], c[3]], [c[1], c[2]], [c[5], c[6]], [c[4], c[7]],
    ];

    // Corrugated ridges on front face
    const ridges: [number, number, number][][] = [];
    for (let i = 1; i < 6; i++) {
      const x = -w + (i / 6) * 2 * w;
      ridges.push([[x, -h, d + 0.005], [x, h, d + 0.005]]);
    }

    // Door lines on front
    const door: [number, number, number][][] = [
      [[0, -h, d + 0.01], [0, h, d + 0.01]],
    ];

    return { lines, ridges, door };
  }, []);

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
      {edges.lines.map((pts, i) => (
        <Line key={`e-${i}`} points={pts} color={accentColor} lineWidth={1.5} transparent opacity={0.8} />
      ))}
      {edges.ridges.map((pts, i) => (
        <Line key={`r-${i}`} points={pts} color={accentLight} lineWidth={0.6} transparent opacity={0.4} />
      ))}
      {edges.door.map((pts, i) => (
        <Line key={`d-${i}`} points={pts} color={accentLight} lineWidth={1.2} transparent opacity={0.7} />
      ))}
      {/* Corner glow nodes */}
      {[[-0.7, 0.35, 0.3], [0.7, 0.35, 0.3], [0.7, -0.35, 0.3], [-0.7, -0.35, 0.3]].map((pos, i) => (
        <mesh key={`gn-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color={accentLight} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

interface Props { accentColor: string; accentLight: string; size?: number; className?: string; }

const Container3D: React.FC<Props> = ({ accentColor, accentLight, size = 140, className = "" }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`, filter: "blur(12px)" }} />
    <Canvas camera={{ position: [0.5, 0.3, 2.2], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 3, 2]} intensity={0.8} color={accentLight} />
      <pointLight position={[-2, -1, 2]} intensity={0.3} color={accentColor} />
      <Float speed={2} rotationIntensity={0.25} floatIntensity={0.35}>
        <ContainerMesh accentColor={accentColor} accentLight={accentLight} />
      </Float>
    </Canvas>
  </div>
);

export default Container3D;
