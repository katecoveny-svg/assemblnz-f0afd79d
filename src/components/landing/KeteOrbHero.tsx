import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

/**
 * KeteOrbHero — Matariki-style glowing star particles inside a
 * woven kete wireframe basket. No text labels. Pure visual.
 */

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";
const TEAL_LIGHT = "#5AADA0";
const GOLD_LIGHT = "#F0D078";

function useIsMobile() {
  return typeof window !== "undefined" && window.innerWidth < 640;
}

/* ── Matariki star cluster — glowing, twinkling particles ── */
function MatarikiStars({ mobile }: { mobile: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = mobile ? 300 : 700;

  const { positions, colors, sizes, twinklePhases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const phases = new Float32Array(count);
    const c = new THREE.Color();
    const palette = [KOWHAI, POUNAMU, TEAL_LIGHT, GOLD_LIGHT, "#FFFFFF"];

    for (let i = 0; i < count; i++) {
      // Fibonacci sphere distribution for even spread
      const phi = Math.acos(1 - 2 * (i + 0.5) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 0.85 + Math.random() * 0.25;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      c.set(palette[i % palette.length]);
      const hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);
      c.setHSL(hsl.h, hsl.s * (0.5 + Math.random() * 0.5), hsl.l * (0.6 + Math.random() * 0.6));
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      sz[i] = 0.8 + Math.random() * 2.5;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, colors: col, sizes: sz, twinklePhases: phases };
  }, [count]);

  const basePositions = useMemo(() => new Float32Array(positions), [positions]);
  const baseSizes = useMemo(() => new Float32Array(sizes), [sizes]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const sizeAttr = ref.current.geometry.attributes.size as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const phase = twinklePhases[i];

      // Gentle breathing
      const breathe = 1 + Math.sin(t * 0.4 + phase) * 0.03;
      posAttr.array[i3] = basePositions[i3] * breathe;
      posAttr.array[i3 + 1] = basePositions[i3 + 1] * breathe;
      posAttr.array[i3 + 2] = basePositions[i3 + 2] * breathe;

      // Twinkle — stars pulse in size
      const twinkle = 0.6 + Math.sin(t * 2.5 + phase * 3) * 0.4;
      const sparkle = Math.sin(t * 8 + phase * 7) > 0.92 ? 2.5 : 1.0;
      sizeAttr.array[i] = baseSizes[i] * twinkle * sparkle;
    }
    posAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;

    ref.current.rotation.y = t * 0.06;
    ref.current.rotation.x = Math.sin(t * 0.04) * 0.05;
  });

  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (50.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      // Bright core with soft glow falloff
      float core = 1.0 - smoothstep(0.0, 0.12, d);
      float glow = 1.0 - smoothstep(0.0, 0.5, d);
      float alpha = core * 0.9 + glow * 0.4;
      vec3 col = vColor * (1.0 + core * 1.5);
      gl_FragColor = vec4(col, alpha);
    }
  `;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
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

/* ── Kete wireframe basket ── */
function KeteWireframe() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.08;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.06) * 0.06;
    }
  });

  const lines = useMemo(() => {
    const result: { points: THREE.Vector3[]; color: string; opacity: number }[] = [];
    const scale = 1.0;

    // Horizontal weave rings
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const y = (-0.7 + t * 1.4) * scale;
      let radius: number;
      if (t < 0.15) radius = (0.3 + t * 2.5) * scale;
      else if (t < 0.45) radius = (0.65 - ((t - 0.15) / 0.3) * 0.12) * scale;
      else radius = (0.53 + ((t - 0.45) / 0.55) * 0.47) * scale;

      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2;
        const wobble = Math.sin(angle * 6 + i * 1.2) * 0.02 * scale;
        pts.push(new THREE.Vector3(
          Math.cos(angle) * (radius + wobble),
          y,
          Math.sin(angle) * (radius + wobble)
        ));
      }
      result.push({ points: pts, color: i % 2 === 0 ? KOWHAI : POUNAMU, opacity: 0.25 });
    }

    // Vertical weave strands
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 32; j++) {
        const t = j / 32;
        const y = (-0.7 + t * 1.4) * scale;
        let radius: number;
        if (t < 0.15) radius = (0.3 + t * 2.5) * scale;
        else if (t < 0.45) radius = (0.65 - ((t - 0.15) / 0.3) * 0.12) * scale;
        else radius = (0.53 + ((t - 0.45) / 0.55) * 0.47) * scale;
        const wobble = Math.sin(t * Math.PI * 4 + i) * 0.025 * scale;
        pts.push(new THREE.Vector3(
          Math.cos(angle) * (radius + wobble),
          y,
          Math.sin(angle) * (radius + wobble)
        ));
      }
      result.push({ points: pts, color: i % 3 === 0 ? TEAL_LIGHT : KOWHAI, opacity: 0.18 });
    }

    // Handle arch
    const handlePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const a = -Math.PI * 0.35 + t * Math.PI * 0.7;
      handlePts.push(new THREE.Vector3(
        Math.sin(a) * 0.5 * scale,
        (0.7 + Math.cos(a) * 0.4) * scale,
        0
      ));
    }
    result.push({ points: handlePts, color: KOWHAI, opacity: 0.4 });

    // Second handle (perpendicular)
    const handle2Pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const a = -Math.PI * 0.35 + t * Math.PI * 0.7;
      handle2Pts.push(new THREE.Vector3(
        0,
        (0.7 + Math.cos(a) * 0.4) * scale,
        Math.sin(a) * 0.5 * scale
      ));
    }
    result.push({ points: handle2Pts, color: POUNAMU, opacity: 0.3 });

    return result;
  }, []);

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <Line
          key={i}
          points={line.points.map(p => [p.x, p.y, p.z] as [number, number, number])}
          color={line.color}
          lineWidth={1}
          transparent
          opacity={line.opacity}
        />
      ))}
    </group>
  );
}

/* ── Glowing constellation nodes on the basket ── */
function KeteNodes({ mobile }: { mobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const nodeCount = mobile ? 8 : 14;

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.08;
  });

  const nodes = useMemo(() => {
    const result: { pos: [number, number, number]; color: string }[] = [];
    const palette = [KOWHAI, POUNAMU, TEAL_LIGHT, GOLD_LIGHT];
    for (let i = 0; i < nodeCount; i++) {
      const t = i / nodeCount;
      const angle = t * Math.PI * 2;
      const y = -0.5 + t * 1.2;
      let radius: number;
      const tn = (y + 0.7) / 1.4;
      if (tn < 0.15) radius = 0.3 + tn * 2.5;
      else if (tn < 0.45) radius = 0.65 - ((tn - 0.15) / 0.3) * 0.12;
      else radius = 0.53 + ((tn - 0.45) / 0.55) * 0.47;
      result.push({
        pos: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
        color: palette[i % palette.length],
      });
    }
    return result;
  }, [nodeCount]);

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <Float key={i} speed={1.5 + i * 0.2} floatIntensity={0.06}>
          <group position={n.pos}>
            <mesh>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshBasicMaterial color={n.color} transparent opacity={0.1} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.03, 12, 12]} />
              <meshBasicMaterial color={n.color} transparent opacity={0.85} />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  );
}

/* ── Ambient dust ── */
function AmbientDust({ count = 50 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 5;
      p[i * 3 + 1] = (Math.random() - 0.5) * 5;
      p[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return p;
  }, [count]);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.005;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={KOWHAI} size={0.018} transparent opacity={0.2} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Orbital rings ── */
function OrbitalRing({ radius, color, speed, tilt }: { radius: number; color: string; speed: number; tilt: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.003, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={0.12} />
    </mesh>
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
      {/* Ambient glow backdrop */}
      <div
        className="absolute w-[360px] h-[360px] sm:w-[520px] sm:h-[520px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(58,125,110,0.08) 0%, rgba(212,168,67,0.04) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative w-[320px] h-[320px] sm:w-[460px] sm:h-[460px]">
        <Suspense
          fallback={
            <div className="w-full h-full rounded-full animate-pulse" style={{ background: "rgba(58,125,110,0.06)" }} />
          }
        >
          <Canvas
            camera={{ position: [0, 0.2, 3.6], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
            dpr={[1, mobile ? 1.5 : 2]}
          >
            <ambientLight intensity={0.1} />
            <pointLight position={[3, 3, 3]} intensity={0.4} color={KOWHAI} />
            <pointLight position={[-3, -2, 2]} intensity={0.25} color={POUNAMU} />

            <MatarikiStars mobile={mobile} />
            <KeteWireframe />
            <KeteNodes mobile={mobile} />
            <AmbientDust count={mobile ? 25 : 50} />

            <OrbitalRing radius={1.5} color={POUNAMU} speed={0.05} tilt={0.3} />
            <OrbitalRing radius={1.8} color={KOWHAI} speed={-0.035} tilt={-0.5} />
            {!mobile && <OrbitalRing radius={2.1} color={TEAL_LIGHT} speed={0.02} tilt={0.8} />}
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
