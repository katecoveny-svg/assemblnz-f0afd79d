import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { Suspense } from "react";
import { motion } from "framer-motion";

/**
 * The Assembl triangle constellation mark rendered as a slowly rotating 3D model.
 * Three nodes (Kowhai gold top, Pounamu dark bottom-left, Pounamu light bottom-right)
 * connected by subtle lines — matches the brand SVG mark.
 */

function TriangleConstellation() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.4;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.25) * 0.12;
    }
  });

  // Triangle vertices (normalised to fit a ~2 unit space)
  const top: [number, number, number] = [0, 0.7, 0];
  const botL: [number, number, number] = [-0.6, -0.5, 0];
  const botR: [number, number, number] = [0.6, -0.5, 0];

  return (
    <group ref={groupRef}>
      {/* Connecting lines */}
      <Line points={[top, botL]} color="white" lineWidth={1} transparent opacity={0.2} />
      <Line points={[top, botR]} color="white" lineWidth={1} transparent opacity={0.2} />
      <Line points={[botL, botR]} color="white" lineWidth={1} transparent opacity={0.2} />

      {/* Top node — Kowhai gold */}
      <group position={top}>
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#4AA5A8" transparent opacity={0.12} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#4AA5A8" emissive="#4AA5A8" emissiveIntensity={0.4} roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.14, 0.155, 32]} />
          <meshBasicMaterial color="white" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Bottom-left node — Pounamu dark */}
      <group position={botL}>
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#3A7D6E" transparent opacity={0.1} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#3A7D6E" emissive="#3A7D6E" emissiveIntensity={0.4} roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.14, 0.155, 32]} />
          <meshBasicMaterial color="white" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Bottom-right node — Pounamu light */}
      <group position={botR}>
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#5AADA0" transparent opacity={0.1} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#5AADA0" emissive="#5AADA0" emissiveIntensity={0.4} roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.14, 0.155, 32]} />
          <meshBasicMaterial color="white" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

export default function Nav3DKeteLogo({ size = 38 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Suspense
        fallback={
          <div
            className="rounded-full animate-pulse"
            style={{ width: size, height: size, background: "rgba(58,125,110,0.1)" }}
          />
        }
      >
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent", width: size, height: size }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[2, 2, 2]} intensity={0.5} color="#4AA5A8" />
          <pointLight position={[-2, -1, 2]} intensity={0.3} color="#6CBFC1" />
          <TriangleConstellation />
        </Canvas>
      </Suspense>
    </motion.div>
  );
}
