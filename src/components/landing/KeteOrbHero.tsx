import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Text } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

/**
 * KeteOrbHero — 6-layer cognitive stack visualised as a data network
 * radiating from a central kete wireframe basket.
 * Layers: Perception → Memory → Reasoning → Action → Explanation → Simulation
 */

const LAYERS = [
  { label: "Perception", color: "#D4A843", angle: 0 },
  { label: "Memory", color: "#3A7D6E", angle: Math.PI / 3 },
  { label: "Reasoning", color: "#5AADA0", angle: (2 * Math.PI) / 3 },
  { label: "Action", color: "#F0D078", angle: Math.PI },
  { label: "Explanation", color: "#E8E8E8", angle: (4 * Math.PI) / 3 },
  { label: "Simulation", color: "#D4A843", angle: (5 * Math.PI) / 3 },
];

function useIsMobile() {
  return typeof window !== "undefined" && window.innerWidth < 640;
}

/* ── Central kete wireframe basket ── */
function CentralKete() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.15;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.08;
    }
  });

  const { horizontalLines, verticalLines, handleLine } = useMemo(() => {
    const hLines: [number, number, number][][] = [];
    const vLines: [number, number, number][][] = [];
    const scale = 0.55;

    for (let i = 0; i < 7; i++) {
      const y = (-0.5 + i * 0.16) * scale;
      const radius = (0.4 + Math.sin((i / 6) * Math.PI) * 0.25) * scale;
      const pts: [number, number, number][] = [];
      for (let j = 0; j <= 48; j++) {
        const angle = (j / 48) * Math.PI * 2;
        pts.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
      }
      hLines.push(pts);
    }

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const pts: [number, number, number][] = [];
      for (let j = 0; j <= 24; j++) {
        const t = j / 24;
        const y = (-0.5 + t * 1.0) * scale;
        const baseRadius = (0.4 + Math.sin(t * Math.PI) * 0.25) * scale;
        const wobble = Math.sin(t * Math.PI * 3 + i) * 0.015 * scale;
        pts.push([Math.cos(angle) * (baseRadius + wobble), y, Math.sin(angle) * (baseRadius + wobble)]);
      }
      vLines.push(pts);
    }

    const hPts: [number, number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const a = -Math.PI * 0.3 + t * Math.PI * 0.6;
      hPts.push([Math.sin(a) * 0.35 * scale, (0.5 + Math.cos(a) * 0.28) * scale, 0]);
    }

    return { horizontalLines: hLines, verticalLines: vLines, handleLine: hPts };
  }, []);

  return (
    <group ref={groupRef}>
      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#3A7D6E" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
      {/* Core pulse */}
      <mesh>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#D4A843" transparent opacity={0.6} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#D4A843" transparent opacity={0.12} />
      </mesh>

      {horizontalLines.map((pts, i) => (
        <Line key={`h-${i}`} points={pts} color={i % 2 === 0 ? "#D4A843" : "#3A7D6E"} lineWidth={1} transparent opacity={0.5} />
      ))}
      {verticalLines.map((pts, i) => (
        <Line key={`v-${i}`} points={pts} color={i % 3 === 0 ? "#5AADA0" : "#D4A843"} lineWidth={0.6} transparent opacity={0.35} />
      ))}
      <Line points={handleLine} color="#D4A843" lineWidth={1.5} transparent opacity={0.7} />
    </group>
  );
}

/* ── Network connection lines from center to layer nodes ── */
function NetworkLines({ mobile }: { mobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const dataParticlesRef = useRef<THREE.Points>(null);
  const basePositions = useRef<Float32Array | null>(null);

  const nodeRadius = mobile ? 1.3 : 1.7;
  const particleCount = mobile ? 60 : 120;

  const nodePositions = useMemo(() => {
    return LAYERS.map((l) => {
      const y = Math.sin(l.angle * 0.5) * 0.3;
      return new THREE.Vector3(
        Math.cos(l.angle) * nodeRadius,
        y,
        Math.sin(l.angle) * nodeRadius
      );
    });
  }, [nodeRadius]);

  // Connection lines: center → each node, and node → next node (ring)
  const connectionLines = useMemo(() => {
    const lines: { points: [number, number, number][]; color: string; opacity: number }[] = [];
    const center: [number, number, number] = [0, 0, 0];

    // Radial lines from center to each node
    nodePositions.forEach((pos, i) => {
      const midY = pos.y + Math.sin(LAYERS[i].angle) * 0.15;
      const mid: [number, number, number] = [pos.x * 0.5, midY, pos.z * 0.5];
      lines.push({
        points: [center, mid, [pos.x, pos.y, pos.z]],
        color: LAYERS[i].color,
        opacity: 0.3,
      });
    });

    // Ring connections between adjacent nodes
    for (let i = 0; i < LAYERS.length; i++) {
      const next = (i + 1) % LAYERS.length;
      const p1 = nodePositions[i];
      const p2 = nodePositions[next];
      const mid: [number, number, number] = [
        (p1.x + p2.x) * 0.5,
        (p1.y + p2.y) * 0.5 + 0.15,
        (p1.z + p2.z) * 0.5,
      ];
      lines.push({
        points: [[p1.x, p1.y, p1.z], mid, [p2.x, p2.y, p2.z]],
        color: LAYERS[i].color,
        opacity: 0.15,
      });
    }

    return lines;
  }, [nodePositions]);

  // Data flow particles along connections
  const { positions: particlePositions, colors: particleColors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const c = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      const layerIdx = i % LAYERS.length;
      const t = Math.random();
      const target = nodePositions[layerIdx];
      pos[i * 3] = target.x * t;
      pos[i * 3 + 1] = target.y * t;
      pos[i * 3 + 2] = target.z * t;
      c.set(LAYERS[layerIdx].color);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [particleCount, nodePositions]);

  useMemo(() => {
    basePositions.current = new Float32Array(particlePositions);
  }, [particlePositions]);

  useFrame(({ clock }) => {
    if (!dataParticlesRef.current || !basePositions.current) return;
    const time = clock.getElapsedTime();
    const posAttr = dataParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < particleCount; i++) {
      const layerIdx = i % LAYERS.length;
      const target = nodePositions[layerIdx];
      // Animate t along the line
      const speed = 0.3 + (i % 5) * 0.08;
      const t = ((time * speed + i * 0.15) % 1.0);
      posAttr.array[i * 3] = target.x * t + Math.sin(time + i) * 0.02;
      posAttr.array[i * 3 + 1] = target.y * t + Math.cos(time * 0.7 + i) * 0.02;
      posAttr.array[i * 3 + 2] = target.z * t + Math.sin(time * 0.5 + i * 2) * 0.02;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      {connectionLines.map((line, i) => (
        <Line key={i} points={line.points} color={line.color} lineWidth={1} transparent opacity={line.opacity} />
      ))}

      {/* Data flow particles */}
      <points ref={dataParticlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={particlePositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={particleCount} array={particleColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          transparent
          opacity={0.6}
          vertexColors
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ── Layer node with label ── */
function LayerNode({ label, color, angle, radius, mobile }: {
  label: string; color: string; angle: number; radius: number; mobile: boolean;
}) {
  const y = Math.sin(angle * 0.5) * 0.3;
  const position: [number, number, number] = [
    Math.cos(angle) * radius,
    y,
    Math.sin(angle) * radius,
  ];

  return (
    <Float speed={1.5} floatIntensity={0.08}>
      <group position={position}>
        {/* Outer glow */}
        <mesh>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.06} />
        </mesh>
        {/* Inner node */}
        <mesh>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>
        {/* Bright core */}
        <mesh>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>

        {/* Label */}
        {!mobile && (
          <Text
            position={[0, -0.22, 0]}
            fontSize={0.09}
            color={color}
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHjxswWyWrFCbw7A.ttf"
            letterSpacing={0.12}
          >
            {label.toUpperCase()}
          </Text>
        )}
      </group>
    </Float>
  );
}

/* ── Ambient dust ── */
function AmbientDust({ count = 60 }: { count?: number }) {
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
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.008;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#D4A843" size={0.02} transparent opacity={0.25} sizeAttenuation blending={THREE.AdditiveBlending} />
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
      <torusGeometry args={[radius, 0.004, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={0.15} />
    </mesh>
  );
}

/* ── Main export ── */
const KeteOrbHero = ({ hideText = false }: { hideText?: boolean }) => {
  const mobile = useIsMobile();
  const nodeRadius = mobile ? 1.3 : 1.7;

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

      <div className="relative w-[320px] h-[320px] sm:w-[460px] sm:h-[460px]">
        <Suspense
          fallback={
            <div className="w-full h-full rounded-full animate-pulse" style={{ background: "rgba(58,125,110,0.06)" }} />
          }
        >
          <Canvas
            camera={{ position: [0, 0.8, 4.2], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
            dpr={[1, mobile ? 1.5 : 2]}
          >
            <ambientLight intensity={0.15} />
            <pointLight position={[4, 3, 4]} intensity={0.5} color="#D4A843" />
            <pointLight position={[-4, -2, 3]} intensity={0.3} color="#3A7D6E" />

            <CentralKete />
            <NetworkLines mobile={mobile} />

            {LAYERS.map((layer) => (
              <LayerNode
                key={layer.label}
                label={layer.label}
                color={layer.color}
                angle={layer.angle}
                radius={nodeRadius}
                mobile={mobile}
              />
            ))}

            <AmbientDust count={mobile ? 30 : 60} />
            <OrbitalRing radius={2.1} color="#3A7D6E" speed={0.04} tilt={0.3} />
            <OrbitalRing radius={2.4} color="#D4A843" speed={-0.03} tilt={-0.5} />
          </Canvas>
        </Suspense>
      </div>

      {!hideText && (
        <div className="text-center mt-8 px-4">
          <p
            className="text-[10px] tracking-[4px] uppercase mb-3"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(212,168,67,0.6)" }}
          >
            6-Layer Cognitive Stack · Ngā Kete · Tangible Outcomes
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
            Every agent operates through perception, memory, reasoning, action,
            explanation, and simulation — inside defined permissions and approval
            pathways.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default KeteOrbHero;
