import { useRef, useMemo, Suspense, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

/**
 * KeteOrbHero — High-impact 3D particle sphere with orbital rings,
 * constellation nodes, and dynamic particle drift.
 */

const PARTICLE_COUNT = 2400;
const ORBIT_RING_COUNT = 3;

const KETE_COLORS = ["#D4A843", "#3A7D6E", "#F0D078", "#E8E8E8", "#5AADA0"];

/* ── Particle sphere: thousands of points forming a breathing sphere ── */
function ParticleSphere() {
  const pointsRef = useRef<THREE.Points>(null);
  const basePositions = useRef<Float32Array | null>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_COUNT);
    const c = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Fibonacci sphere distribution for even coverage
      const phi = Math.acos(1 - (2 * (i + 0.5)) / PARTICLE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 1.6 + (Math.random() - 0.5) * 0.15;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Color from kete palette with variation
      const keteColor = KETE_COLORS[i % KETE_COLORS.length];
      c.set(keteColor);
      const hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);
      c.setHSL(hsl.h, hsl.s * (0.6 + Math.random() * 0.4), hsl.l * (0.7 + Math.random() * 0.5));

      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      sz[i] = 1.5 + Math.random() * 3;
    }

    return { positions: pos, colors: col, sizes: sz };
  }, []);

  // Store base positions for animation
  useMemo(() => {
    basePositions.current = new Float32Array(positions);
  }, [positions]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !basePositions.current) return;
    const t = clock.getElapsedTime();
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const base = basePositions.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const bx = base[i3], by = base[i3 + 1], bz = base[i3 + 2];

      // Breathing effect
      const breathe = 1 + Math.sin(t * 0.6 + i * 0.003) * 0.04;
      // Ripple wave from top
      const wave = Math.sin(t * 1.2 + by * 2) * 0.03;

      posAttr.array[i3] = bx * breathe + wave;
      posAttr.array[i3 + 1] = by * breathe;
      posAttr.array[i3 + 2] = bz * breathe + wave * 0.5;
    }
    posAttr.needsUpdate = true;

    // Slow rotation
    pointsRef.current.rotation.y = t * 0.06;
    pointsRef.current.rotation.x = Math.sin(t * 0.08) * 0.08;
  });

  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (200.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.1, 0.5, d);
      gl_FragColor = vec4(vColor * 1.4, alpha);
    }
  `;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={PARTICLE_COUNT} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={PARTICLE_COUNT} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ── Orbital ring — a thin glowing torus ring ── */
function OrbitalRing({ radius, color, speed, tilt }: { radius: number; color: string; speed: number; tilt: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
  });

  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.005, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={0.45} />
    </mesh>
  );
}

/* ── Orbiting kete nodes — larger glowing spheres on paths ── */
function OrbitingKeteNodes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      {KETE_COLORS.map((color, i) => {
        const angle = (i / KETE_COLORS.length) * Math.PI * 2;
        const r = 2.2;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const y = Math.sin(angle * 2) * 0.4;
        return (
          <Float key={i} speed={2 + i * 0.3} floatIntensity={0.15}>
            <group position={[x, y, z]}>
              {/* Glow */}
              <mesh>
                <sphereGeometry args={[0.16, 12, 12]} />
                <meshBasicMaterial color={color} transparent opacity={0.12} />
              </mesh>
              {/* Core */}
              <mesh>
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshBasicMaterial color={color} />
              </mesh>
            </group>
          </Float>
        );
      })}
    </group>
  );
}

/* ── Inner wireframe sphere for depth ── */
function InnerWireframe() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = -clock.getElapsedTime() * 0.04;
      ref.current.rotation.x = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.0, 1]} />
      <meshBasicMaterial color="#3A7D6E" wireframe transparent opacity={0.06} />
    </mesh>
  );
}

/* ── Ambient floating dust ── */
function AmbientDust() {
  const count = 120;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 8;
      p[i * 3 + 1] = (Math.random() - 0.5) * 8;
      p[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return p;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#D4A843" size={0.015} transparent opacity={0.3} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Main export ── */
const KeteOrbHero = ({ hideText = false }: { hideText?: boolean }) => {
  return (
    <motion.div
      className="relative flex flex-col items-center justify-center mb-16"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Multi-layer ambient glow */}
      <div
        className="absolute w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(58,125,110,0.25) 0%, rgba(212,168,67,0.12) 35%, rgba(90,173,160,0.06) 60%, transparent 80%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,168,67,0.2) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* 3D Canvas */}
      <div className="relative w-[320px] h-[320px] sm:w-[440px] sm:h-[440px]">
        <Suspense
          fallback={
            <div
              className="w-full h-full rounded-full animate-pulse"
              style={{ background: "rgba(58,125,110,0.06)" }}
            />
          }
        >
          <Canvas
            camera={{ position: [0, 0, 5], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={0.15} />
            <pointLight position={[4, 3, 4]} intensity={0.5} color="#D4A843" />
            <pointLight position={[-4, -2, 3]} intensity={0.3} color="#3A7D6E" />
            <pointLight position={[0, -4, 2]} intensity={0.2} color="#5AADA0" />

            <ParticleSphere />
            <InnerWireframe />
            <OrbitingKeteNodes />
            <AmbientDust />

            {/* Orbital rings */}
            <OrbitalRing radius={2.0} color="#3A7D6E" speed={0.08} tilt={0.3} />
            <OrbitalRing radius={2.4} color="#D4A843" speed={-0.05} tilt={-0.5} />
            <OrbitalRing radius={2.7} color="#5AADA0" speed={0.03} tilt={0.8} />
          </Canvas>
        </Suspense>
      </div>

      {/* Text below orb — optional */}
      {!hideText && (
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
      )}
    </motion.div>
  );
};

export default KeteOrbHero;
