import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* ─── Glowing Orb ─── */
function GlowOrb({ position, color, size = 0.3, speed = 1 }: { position: [number, number, number]; color: string; size?: number; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(t) * 0.15;
      meshRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
    }
    if (glowRef.current) {
      glowRef.current.position.y = position[1] + Math.sin(t) * 0.15;
      glowRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.12);
    }
  });

  return (
    <group>
      <mesh ref={glowRef} position={position}>
        <sphereGeometry args={[size * 3, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ─── Robot Body ─── */
function RobotBody() {
  const groupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Mesh>(null);
  const antennaRef = useRef<THREE.Group>(null!);

  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0a3d3d",
    metalness: 0.85,
    roughness: 0.15,
    emissive: "#00FF88",
    emissiveIntensity: 0.15,
    transparent: true,
    opacity: 0.85,
  }), []);

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0d4040",
    metalness: 0.2,
    roughness: 0.05,
    transmission: 0.5,
    thickness: 0.5,
    emissive: "#00E5FF",
    emissiveIntensity: 0.1,
    transparent: true,
    opacity: 0.85,
  }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15 + Math.sin(t * 0.3) * 0.3;
    }
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    }
    if (antennaRef.current) {
      antennaRef.current.rotation.z = Math.sin(t * 2) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Head */}
        <mesh ref={headRef} position={[0, 1.2, 0]} material={glassMaterial}>
          <boxGeometry args={[1.4, 1.1, 1]} />
        </mesh>

        {/* Visor — brighter */}
        <mesh position={[0, 1.25, 0.51]}>
          <boxGeometry args={[1.0, 0.25, 0.02]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={5} toneMapped={false} />
        </mesh>

        {/* Left eye */}
        <mesh position={[-0.25, 1.25, 0.52]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color="#00FF88" emissive="#00FF88" emissiveIntensity={6} toneMapped={false} />
        </mesh>

        {/* Right eye */}
        <mesh position={[0.25, 1.25, 0.52]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color="#FF2D9B" emissive="#FF2D9B" emissiveIntensity={6} toneMapped={false} />
        </mesh>

        {/* Antenna */}
        <group ref={antennaRef}>
          <mesh position={[0, 1.9, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
            <meshStandardMaterial color="#444" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 2.15, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#00FF88" emissive="#00FF88" emissiveIntensity={5} toneMapped={false} />
          </mesh>
        </group>

        {/* Neck */}
        <mesh position={[0, 0.55, 0]} material={bodyMaterial}>
          <cylinderGeometry args={[0.2, 0.3, 0.2, 8]} />
        </mesh>

        {/* Torso */}
        <mesh position={[0, -0.1, 0]} material={bodyMaterial}>
          <boxGeometry args={[1.6, 1.2, 0.8]} />
        </mesh>

        {/* Chest nexus orbs — brighter */}
        <GlowOrb position={[0, 0.15, 0.45]} color="#00E5FF" size={0.12} speed={1.2} />
        <GlowOrb position={[-0.15, -0.1, 0.45]} color="#B388FF" size={0.12} speed={0.9} />
        <GlowOrb position={[0.15, -0.1, 0.45]} color="#FF2D9B" size={0.12} speed={1.1} />

        {/* AI badge on chest */}
        <mesh position={[0, 0.0, 0.41]}>
          <ringGeometry args={[0.2, 0.25, 6]} />
          <meshStandardMaterial color="#00FF88" emissive="#00FF88" emissiveIntensity={2} toneMapped={false} transparent opacity={0.4} />
        </mesh>

        {/* Left arm */}
        <mesh position={[-1.05, 0.0, 0]} material={bodyMaterial}>
          <boxGeometry args={[0.3, 0.9, 0.4]} />
        </mesh>
        <mesh position={[-1.05, -0.6, 0]} material={bodyMaterial}>
          <boxGeometry args={[0.25, 0.4, 0.35]} />
        </mesh>

        {/* Right arm */}
        <mesh position={[1.05, 0.0, 0]} material={bodyMaterial}>
          <boxGeometry args={[0.3, 0.9, 0.4]} />
        </mesh>
        <mesh position={[1.05, -0.6, 0]} material={bodyMaterial}>
          <boxGeometry args={[0.25, 0.4, 0.35]} />
        </mesh>

        {/* Edge glow lines — brighter */}
        <mesh position={[0, -0.1, 0.41]}>
          <planeGeometry args={[1.5, 0.015]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={4} toneMapped={false} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0.3, 0.41]}>
          <planeGeometry args={[1.5, 0.015]} />
          <meshStandardMaterial color="#00FF88" emissive="#00FF88" emissiveIntensity={4} toneMapped={false} transparent opacity={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

/* ─── Particle Ring ─── */
function ParticleRing() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 300;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2.5 + Math.random() * 0.6;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#00E5FF" size={0.04} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

/* ─── Main Scene ─── */
const NexusHero3D = () => {
  return (
    <div className="w-full h-[340px] sm:h-[420px] lg:h-[480px] relative">
      {/* Layered radial glows behind */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,229,255,0.12) 0%, rgba(0,255,136,0.06) 30%, transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none animate-pulse-glow"
        style={{
          background: "radial-gradient(ellipse at center, rgba(179,136,255,0.08) 0%, transparent 50%)",
        }}
      />
      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <directionalLight position={[-3, 3, -3]} intensity={0.5} color="#00E5FF" />
        <pointLight position={[0, 2, 3]} intensity={1.2} color="#00FF88" distance={10} />
        <pointLight position={[-2, -1, 2]} intensity={0.6} color="#FF2D9B" distance={8} />
        <pointLight position={[2, 0, 2]} intensity={0.6} color="#B388FF" distance={8} />
        <pointLight position={[0, 0, 4]} intensity={0.5} color="#00E5FF" distance={6} />

        <Suspense fallback={null}>
          <RobotBody />
          <ParticleRing />
        </Suspense>

        {/* Background orbs */}
        <GlowOrb position={[-2.5, 1.5, -1]} color="#00E5FF" size={0.18} speed={0.7} />
        <GlowOrb position={[2.8, -0.5, -2]} color="#FF2D9B" size={0.15} speed={0.5} />
        <GlowOrb position={[1.5, 2, -1.5]} color="#B388FF" size={0.13} speed={0.8} />
        <GlowOrb position={[-1.8, -1.2, -1]} color="#00FF88" size={0.16} speed={0.6} />
      </Canvas>
    </div>
  );
};

export default NexusHero3D;
