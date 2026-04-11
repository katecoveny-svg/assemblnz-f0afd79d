import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

/**
 * KeteOrbHero — Real Three.js 3D glowing sphere with assembl constellation
 * and orbiting kete node particles.
 */

const KETE_NODES = [
  { color: "#D4A843", angle: 0 },
  { color: "#3A7D6E", angle: 72 },
  { color: "#F0D078", angle: 144 },
  { color: "#E8E8E8", angle: 216 },
  { color: "#5AADA0", angle: 288 },
];

/* Assembl constellation triangle inside the orb */
function ConstellationMark() {
  const points: [number, number, number][] = useMemo(() => [
    [0, 0.5, 0],
    [0.45, -0.3, 0],
    [-0.45, -0.3, 0],
    [0, 0.5, 0],
  ], []);

  return (
    <group>
      <Line points={points} color="#D4A843" lineWidth={1} transparent opacity={0.4} />
      {/* Constellation nodes */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#D4A843" />
      </mesh>
      <mesh position={[0.45, -0.3, 0]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#3A7D6E" />
      </mesh>
      <mesh position={[-0.45, -0.3, 0]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#5AADA0" />
      </mesh>
      {/* Center node */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#D4A843" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/* Orbiting kete dots */
function OrbitingNodes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.15;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {KETE_NODES.map((node, i) => {
        const rad = (node.angle * Math.PI) / 180;
        const r = 1.8;
        const x = Math.cos(rad) * r;
        const z = Math.sin(rad) * r;
        const y = Math.sin(rad * 2) * 0.3;
        return (
          <group key={i} position={[x, y, z]}>
            {/* Glow sphere */}
            <mesh>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshBasicMaterial color={node.color} transparent opacity={0.15} />
            </mesh>
            {/* Core dot */}
            <mesh>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color={node.color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* Main glowing sphere */
function GlowingSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.08;
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 0.8) * 0.03;
      glowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      {/* Outer glow shell */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial
          color="#3A7D6E"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Mid glow */}
      <mesh>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshBasicMaterial
          color="#D4A843"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main sphere surface */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 48, 48]} />
        <meshStandardMaterial
          color="#0A0A18"
          emissive="#1A2A3A"
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[1.21, 24, 24]} />
        <meshBasicMaterial
          color="#3A7D6E"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Inner constellation */}
      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.1}>
        <ConstellationMark />
      </Float>
    </group>
  );
}

const KeteOrbHero = () => {
  return (
    <motion.div
      className="relative flex flex-col items-center justify-center mb-16"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Ambient glow behind canvas */}
      <div
        className="absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,168,67,0.12) 0%, rgba(58,125,110,0.06) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* 3D Canvas — square aspect ratio = perfect sphere */}
      <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]">
        <Suspense
          fallback={
            <div className="w-full h-full rounded-full animate-pulse" style={{ background: "rgba(58,125,110,0.08)" }} />
          }
        >
          <Canvas
            camera={{ position: [0, 0, 4.5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.4} />
            <pointLight position={[3, 3, 3]} intensity={0.6} color="#D4A843" />
            <pointLight position={[-3, -1, 3]} intensity={0.3} color="#3A7D6E" />
            <pointLight position={[0, -3, 2]} intensity={0.2} color="#5AADA0" />

            <GlowingSphere />
            <OrbitingNodes />
          </Canvas>
        </Suspense>
      </div>

      {/* Text below orb */}
      <div className="text-center mt-8">
        <p
          className="text-[10px] tracking-[4px] uppercase mb-3"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "rgba(212,168,67,0.6)",
          }}
        >
          Ngā Kete · 5 Industries · Tangible Outcomes
        </p>
        <h2
          className="text-2xl sm:text-4xl tracking-[0.02em] text-foreground mb-3"
          style={{
            fontWeight: 300,
            fontFamily: "'Lato', sans-serif",
            textShadow: "0 0 40px rgba(212,168,67,0.15)",
          }}
        >
          More efficiency. Less admin. Real evidence.
        </h2>
        <p
          className="text-sm max-w-lg mx-auto leading-relaxed"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Five industry kete that run your compliance, operations, and reporting
          — then hand you a signed pack your auditor can read and your lawyer can
          rely on.
        </p>
      </div>
    </motion.div>
  );
};

export default KeteOrbHero;
