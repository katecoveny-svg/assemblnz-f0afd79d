import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

/**
 * KeteOrbHero — Particles arranged in a woven kete basket shape
 * with orbital rings, constellation nodes, and breathing animation.
 * Mobile-optimised with reduced particle counts.
 */

const KETE_COLORS = ["#D4A843", "#3A7D6E", "#F0D078", "#E8E8E8", "#5AADA0"];

function useIsMobile() {
  return typeof window !== "undefined" && window.innerWidth < 640;
}

/* ── Particle kete basket ── */
function ParticleKete({ mobile }: { mobile: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const basePositions = useRef<Float32Array | null>(null);

  const BODY_COUNT = mobile ? 400 : 800;
  const HANDLE_COUNT = mobile ? 30 : 60;
  const totalCount = BODY_COUNT + HANDLE_COUNT;

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(totalCount * 3);
    const col = new Float32Array(totalCount * 3);
    const sz = new Float32Array(totalCount);
    const c = new THREE.Color();

    // Body — basket shape: cylinder with waist (tapered middle)
    for (let i = 0; i < BODY_COUNT; i++) {
      const t = Math.random(); // 0=bottom, 1=top of basket
      const angle = Math.random() * Math.PI * 2;
      const y = -0.8 + t * 1.6;

      // Basket profile: wide at top, narrower waist at ~40%, narrow base
      let radius: number;
      if (t < 0.15) {
        // Flat base
        radius = 0.3 + t * 2.0;
      } else if (t < 0.5) {
        // Taper in to waist
        const w = (t - 0.15) / 0.35;
        radius = 0.6 - w * 0.15;
      } else {
        // Flare out to rim
        const w = (t - 0.5) / 0.5;
        radius = 0.45 + w * 0.55;
      }

      // Add weave texture: slight sine wobble
      const weave = Math.sin(angle * 8 + y * 6) * 0.03;
      radius += weave;

      // Slight random scatter for organic feel
      const scatter = (Math.random() - 0.5) * 0.06;

      pos[i * 3] = Math.cos(angle) * (radius + scatter);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * (radius + scatter);

      const keteColor = KETE_COLORS[i % KETE_COLORS.length];
      c.set(keteColor);
      const hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);
      c.setHSL(hsl.h, hsl.s * (0.6 + Math.random() * 0.4), hsl.l * (0.7 + Math.random() * 0.5));
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      sz[i] = 1.0 + Math.random() * 1.2;
    }

    // Handle — arch over the top
    for (let i = 0; i < HANDLE_COUNT; i++) {
      const idx = BODY_COUNT + i;
      const t = i / (HANDLE_COUNT - 1);
      const a = -Math.PI * 0.35 + t * Math.PI * 0.7;
      const handleRadius = 0.5;
      const scatter = (Math.random() - 0.5) * 0.04;

      pos[idx * 3] = Math.sin(a) * handleRadius + scatter;
      pos[idx * 3 + 1] = 0.8 + Math.cos(a) * 0.45;
      pos[idx * 3 + 2] = scatter;

      c.set("#D4A843");
      col[idx * 3] = c.r;
      col[idx * 3 + 1] = c.g;
      col[idx * 3 + 2] = c.b;

      sz[idx] = 1.2 + Math.random() * 0.8;
    }

    return { positions: pos, colors: col, sizes: sz };
  }, [BODY_COUNT, HANDLE_COUNT, totalCount]);

  useMemo(() => {
    basePositions.current = new Float32Array(positions);
  }, [positions]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !basePositions.current) return;
    const t = clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const base = basePositions.current;

    for (let i = 0; i < totalCount; i++) {
      const i3 = i * 3;
      const bx = base[i3], by = base[i3 + 1], bz = base[i3 + 2];
      const breathe = 1 + Math.sin(t * 0.5 + i * 0.008) * 0.02;
      const ripple = Math.sin(t * 1.2 + by * 4.0) * 0.015;

      posAttr.array[i3] = bx * breathe + ripple;
      posAttr.array[i3 + 1] = by * breathe;
      posAttr.array[i3 + 2] = bz * breathe + ripple * 0.5;
    }
    posAttr.needsUpdate = true;

    pointsRef.current.rotation.y = t * 0.12;
    pointsRef.current.rotation.x = Math.sin(t * 0.06) * 0.08 + 0.15;
  });

  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (40.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.0, 0.45, d);
      gl_FragColor = vec4(vColor * 1.5, alpha * 0.55);
    }
  `;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={totalCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={totalCount} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={totalCount} array={sizes} itemSize={1} />
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

/* ── Orbital ring ── */
function OrbitalRing({ radius, color, speed, tilt }: { radius: number; color: string; speed: number; tilt: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.005, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

/* ── Orbiting kete nodes ── */
function OrbitingKeteNodes() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.12;
  });
  return (
    <group ref={groupRef}>
      {KETE_COLORS.map((color, i) => {
        const angle = (i / KETE_COLORS.length) * Math.PI * 2;
        const r = 1.8;
        return (
          <Float key={i} speed={2 + i * 0.3} floatIntensity={0.15}>
            <group position={[Math.cos(angle) * r, Math.sin(angle * 2) * 0.3, Math.sin(angle) * r]}>
              <mesh><sphereGeometry args={[0.08, 12, 12]} /><meshBasicMaterial color={color} transparent opacity={0.08} /></mesh>
              <mesh><sphereGeometry args={[0.05, 12, 12]} /><meshBasicMaterial color={color} /></mesh>
            </group>
          </Float>
        );
      })}
    </group>
  );
}

/* ── Ambient dust ── */
function AmbientDust({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 6;
      p[i * 3 + 1] = (Math.random() - 0.5) * 6;
      p[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return p;
  }, [count]);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.01; });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry>
      <pointsMaterial color="#D4A843" size={0.025} transparent opacity={0.3} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Main export ── */
const KeteOrbHero = ({ hideText = false }: { hideText?: boolean }) => {
  const mobile = useIsMobile();

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center mb-16"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="absolute w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(58,125,110,0.06) 0%, rgba(212,168,67,0.03) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative w-[280px] h-[280px] sm:w-[400px] sm:h-[400px]">
        <Suspense
          fallback={
            <div className="w-full h-full rounded-full animate-pulse" style={{ background: "rgba(58,125,110,0.06)" }} />
          }
        >
          <Canvas
            camera={{ position: [0, 0.3, 4], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
            dpr={[1, mobile ? 1.5 : 2]}
          >
            <ambientLight intensity={0.15} />
            <pointLight position={[4, 3, 4]} intensity={0.5} color="#D4A843" />
            <pointLight position={[-4, -2, 3]} intensity={0.3} color="#3A7D6E" />

            <ParticleKete mobile={mobile} />
            <OrbitingKeteNodes />
            <AmbientDust count={mobile ? 40 : 80} />

            <OrbitalRing radius={1.6} color="#3A7D6E" speed={0.08} tilt={0.3} />
            <OrbitalRing radius={1.9} color="#D4A843" speed={-0.05} tilt={-0.5} />
            {!mobile && <OrbitalRing radius={2.2} color="#5AADA0" speed={0.03} tilt={0.8} />}
          </Canvas>
        </Suspense>
      </div>

      {!hideText && (
        <div className="text-center mt-8 px-4">
          <p
            className="text-[10px] tracking-[4px] uppercase mb-3"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(212,168,67,0.6)" }}
          >
            Ngā Kete · 5 Industries · Tangible Outcomes
          </p>
          <h2
            className="text-2xl sm:text-4xl tracking-[0.02em] text-foreground mb-3"
            style={{ fontWeight: 300, fontFamily: "'Lato', sans-serif", textShadow: "0 0 40px rgba(212,168,67,0.15)" }}
          >
            More efficiency. Less admin. Real evidence.
          </h2>
          <p
            className="text-sm max-w-lg mx-auto leading-relaxed"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}
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
