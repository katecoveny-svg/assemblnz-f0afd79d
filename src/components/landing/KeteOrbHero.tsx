import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

/**
 * KeteOrbHero — A woven kete basket inside a translucent glass orb,
 * with the six cognitive layers (Perception, Memory, Reasoning, Action,
 * Explanation, Simulation) orbiting as floating labels — the knowledge
 * woven into the basket.
 */

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";
const TEAL_LIGHT = "#5AADA0";
const GOLD_LIGHT = "#F0D078";

function useIsMobile() {
  return typeof window !== "undefined" && window.innerWidth < 640;
}

/* ── Basket profile helper ── */
function keteRadius(t: number): number {
  if (t < 0.1) return 0.25 + t * 3.5;
  if (t < 0.4) return 0.6 - ((t - 0.1) / 0.3) * 0.1;
  return 0.5 + ((t - 0.4) / 0.6) * 0.5;
}

/* ── Matariki stars on the kete surface ── */
function MatarikiStars({ mobile }: { mobile: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = mobile ? 250 : 550;

  const { positions, colors, sizes, twinklePhases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const phases = new Float32Array(count);
    const c = new THREE.Color();
    const palette = [KOWHAI, POUNAMU, TEAL_LIGHT, GOLD_LIGHT, "#FFFFFF"];

    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const y = -0.7 + t * 1.4;
      const r = keteRadius(t);
      const wobble = Math.sin(angle * 6 + t * 8) * 0.02;
      const scatter = (Math.random() - 0.5) * 0.04;

      pos[i * 3] = Math.cos(angle) * (r + wobble + scatter);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * (r + wobble + scatter);

      c.set(palette[i % palette.length]);
      const hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);
      c.setHSL(hsl.h, hsl.s * (0.5 + Math.random() * 0.5), hsl.l * (0.7 + Math.random() * 0.5));
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      sz[i] = 0.6 + Math.random() * 1.8;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const handleCount = mobile ? 20 : 40;
    for (let i = 0; i < Math.min(handleCount, count); i++) {
      const t = i / handleCount;
      const a = -Math.PI * 0.35 + t * Math.PI * 0.7;
      const idx = count - 1 - i;
      if (idx < 0) break;
      pos[idx * 3] = Math.sin(a) * 0.5 + (Math.random() - 0.5) * 0.03;
      pos[idx * 3 + 1] = 0.7 + Math.cos(a) * 0.4;
      pos[idx * 3 + 2] = (Math.random() - 0.5) * 0.03;
      c.set(KOWHAI);
      col[idx * 3] = c.r;
      col[idx * 3 + 1] = c.g;
      col[idx * 3 + 2] = c.b;
      sz[idx] = 1.0 + Math.random() * 1.5;
    }

    return { positions: pos, colors: col, sizes: sz, twinklePhases: phases };
  }, [count, mobile]);

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
      const breathe = 1 + Math.sin(t * 0.25 + phase) * 0.015;
      posAttr.array[i3] = basePositions[i3] * breathe;
      posAttr.array[i3 + 1] = basePositions[i3 + 1] * breathe;
      posAttr.array[i3 + 2] = basePositions[i3 + 2] * breathe;

      const twinkle = 0.75 + Math.sin(t * 0.4 + phase * 2) * 0.25;
      const sparkle = Math.sin(t * 0.8 + phase * 5) > 0.98 ? 1.4 : 1.0;
      sizeAttr.array[i] = baseSizes[i] * twinkle * sparkle;
    }
    posAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;

    ref.current.rotation.y = t * 0.05;
    ref.current.rotation.x = Math.sin(t * 0.03) * 0.04;
  });

  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (45.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float core = 1.0 - smoothstep(0.0, 0.15, d);
      float glow = 1.0 - smoothstep(0.0, 0.5, d);
      float alpha = core * 0.85 + glow * 0.35;
      vec3 col = vColor * (1.0 + core * 1.2);
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
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.03) * 0.04;
    }
  });

  const lineData = useMemo(() => {
    const result: { points: [number, number, number][]; color: string; opacity: number; width: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const y = -0.7 + t * 1.4;
      const r = keteRadius(t);
      const pts: [number, number, number][] = [];
      for (let j = 0; j <= 72; j++) {
        const angle = (j / 72) * Math.PI * 2;
        const wobble = Math.sin(angle * 8 + i * 1.5) * 0.018;
        pts.push([Math.cos(angle) * (r + wobble), y, Math.sin(angle) * (r + wobble)]);
      }
      result.push({ points: pts, color: i % 2 === 0 ? KOWHAI : POUNAMU, opacity: 0.35, width: 1.2 });
    }

    for (let i = 0; i < 20; i++) {
      const baseAngle = (i / 20) * Math.PI * 2;
      const pts: [number, number, number][] = [];
      for (let j = 0; j <= 36; j++) {
        const t = j / 36;
        const y = -0.7 + t * 1.4;
        const r = keteRadius(t);
        const angle = baseAngle + t * 0.4 * (i % 2 === 0 ? 1 : -1);
        const wobble = Math.sin(t * Math.PI * 5 + i) * 0.02;
        pts.push([Math.cos(angle) * (r + wobble), y, Math.sin(angle) * (r + wobble)]);
      }
      result.push({ points: pts, color: i % 3 === 0 ? TEAL_LIGHT : KOWHAI, opacity: 0.25, width: 0.8 });
    }

    const h1: [number, number, number][] = [];
    for (let i = 0; i <= 36; i++) {
      const t = i / 36;
      const a = -Math.PI * 0.38 + t * Math.PI * 0.76;
      h1.push([Math.sin(a) * 0.5, 0.7 + Math.cos(a) * 0.42, 0]);
    }
    result.push({ points: h1, color: KOWHAI, opacity: 0.5, width: 1.8 });

    const h2: [number, number, number][] = [];
    for (let i = 0; i <= 36; i++) {
      const t = i / 36;
      const a = -Math.PI * 0.38 + t * Math.PI * 0.76;
      h2.push([0, 0.7 + Math.cos(a) * 0.42, Math.sin(a) * 0.5]);
    }
    result.push({ points: h2, color: POUNAMU, opacity: 0.4, width: 1.5 });

    return result;
  }, []);

  return (
    <group ref={groupRef}>
      {lineData.map((line, i) => (
        <Line key={i} points={line.points} color={line.color} lineWidth={line.width} transparent opacity={line.opacity} />
      ))}
    </group>
  );
}

/* ── Glass orb sphere enclosing the kete ── */
function GlassOrb() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = 0.04 + Math.sin(clock.getElapsedTime() * 0.3) * 0.015;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.35, 64, 64]} />
      <meshPhysicalMaterial
        color="#5AADA0"
        transparent
        opacity={0.04}
        roughness={0.1}
        metalness={0.0}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={0.5}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

/* ── Orb rim ring — glass edge highlight ── */
function OrbRimRing({ radius, color, tilt, speed }: { radius: number; color: string; tilt: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.004, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={0.12} />
    </mesh>
  );
}

/* ── Data nodes on the kete surface ── */
function DataNodes({ mobile }: { mobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const nodeCount = mobile ? 9 : 16;

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  const nodes = useMemo(() => {
    const result: { pos: [number, number, number]; color: string }[] = [];
    const palette = [KOWHAI, POUNAMU, TEAL_LIGHT, GOLD_LIGHT];
    for (let i = 0; i < nodeCount; i++) {
      const t = (i + 0.5) / nodeCount;
      const angle = t * Math.PI * 2 + (i % 2) * 0.3;
      const y = -0.5 + t * 1.1;
      const tn = (y + 0.7) / 1.4;
      const r = keteRadius(tn);
      result.push({ pos: [Math.cos(angle) * r, y, Math.sin(angle) * r], color: palette[i % palette.length] });
    }
    return result;
  }, [nodeCount]);

  const connections = useMemo(() => {
    const conns: { from: [number, number, number]; to: [number, number, number]; color: string }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let d = 1; d <= 2; d++) {
        const j = (i + d) % nodes.length;
        conns.push({ from: nodes[i].pos, to: nodes[j].pos, color: nodes[i].color });
      }
    }
    return conns;
  }, [nodes]);

  return (
    <group ref={groupRef}>
      {connections.map((conn, i) => (
        <Line key={`conn-${i}`} points={[conn.from, conn.to]} color={conn.color} lineWidth={0.5} transparent opacity={0.12} />
      ))}
      {nodes.map((n, i) => (
        <Float key={i} speed={1.2 + i * 0.15} floatIntensity={0.04}>
          <group position={n.pos}>
            <mesh><sphereGeometry args={[0.055, 12, 12]} /><meshBasicMaterial color={n.color} transparent opacity={0.08} /></mesh>
            <mesh><sphereGeometry args={[0.025, 12, 12]} /><meshBasicMaterial color={n.color} transparent opacity={0.9} /></mesh>
          </group>
        </Float>
      ))}
    </group>
  );
}

/* ── Data pulse particles ── */
function DataPulse({ mobile }: { mobile: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = mobile ? 30 : 60;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c = new THREE.Color();
    const palette = [KOWHAI, POUNAMU, TEAL_LIGHT];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
      c.set(palette[i % palette.length]);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const speed = 0.15 + (i % 7) * 0.03;
      const phase = (i / count) * Math.PI * 2;
      const progress = (t * speed + phase) % 1;
      const y = -0.7 + progress * 1.4;
      const r = keteRadius(progress);
      const angle = phase + t * 0.2 + i * 0.4;
      posAttr.array[i * 3] = Math.cos(angle) * r;
      posAttr.array[i * 3 + 1] = y;
      posAttr.array[i * 3 + 2] = Math.sin(angle) * r;
    }
    posAttr.needsUpdate = true;
    ref.current.rotation.y = t * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} transparent opacity={0.5} vertexColors sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Ambient dust ── */
function AmbientDust({ count = 40 }: { count?: number }) {
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
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.004;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={KOWHAI} size={0.015} transparent opacity={0.18} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Six cognitive layers — visual data network around the orb ── */
const LAYERS = [
  { name: "Perceive", icon: "◎", color: POUNAMU, angle: -30, radius: 48, yOff: -6 },
  { name: "Memory", icon: "◈", color: TEAL_LIGHT, angle: 30, radius: 50, yOff: -12 },
  { name: "Reason", icon: "◇", color: "#FFFFFF", angle: 90, radius: 46, yOff: 0 },
  { name: "Action", icon: "▸", color: GOLD_LIGHT, angle: 150, radius: 50, yOff: 12 },
  { name: "Explain", icon: "◌", color: KOWHAI, angle: 210, radius: 48, yOff: 6 },
  { name: "Simulate", icon: "⬡", color: "#7BA8C4", angle: 270, radius: 46, yOff: -4 },
];

/* Network edge pairs — which nodes connect to form the data mesh */
const NETWORK_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], // outer ring
  [0, 3], [1, 4], [2, 5], // cross connections
];

function CognitiveLayerLabels({ size }: { size: number }) {
  const cx = size / 2;
  const cy = size / 2;

  /* Compute pixel positions for each node */
  const nodePositions = LAYERS.map((layer) => {
    const rPx = (size * layer.radius) / 100;
    const rad = (layer.angle * Math.PI) / 180;
    return {
      x: cx + Math.cos(rad) * rPx,
      y: cy + Math.sin(rad) * rPx * 0.55 + layer.yOff,
    };
  });

  /* Inner hub points — smaller radius for secondary mesh lines to orb centre */
  const hubR = size * 0.18;
  const hubPositions = LAYERS.map((layer) => {
    const rad = (layer.angle * Math.PI) / 180;
    return {
      x: cx + Math.cos(rad) * hubR,
      y: cy + Math.sin(rad) * hubR * 0.55,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ width: size, height: size }}>
      {/* SVG network layer */}
      <svg width={size} height={size} className="absolute inset-0" style={{ overflow: "visible" }}>
        <defs>
          {LAYERS.map((layer, i) => (
            <linearGradient key={`grad-${i}`} id={`edge-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={layer.color} stopOpacity="0.25" />
              <stop offset="50%" stopColor={layer.color} stopOpacity="0.08" />
              <stop offset="100%" stopColor={LAYERS[(i + 1) % LAYERS.length].color} stopOpacity="0.25" />
            </linearGradient>
          ))}
          {/* Animated pulse circle */}
          <filter id="glow-net">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Network edges — outer mesh */}
        {NETWORK_EDGES.map(([a, b], i) => {
          const pA = nodePositions[a];
          const pB = nodePositions[b];
          return (
            <g key={`edge-${i}`}>
              <line
                x1={pA.x} y1={pA.y} x2={pB.x} y2={pB.y}
                stroke={LAYERS[a].color}
                strokeWidth="0.5"
                strokeOpacity="0.15"
                strokeDasharray="4 6"
              >
                <animate attributeName="stroke-dashoffset" from="0" to="-20" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
              </line>
              {/* Travelling data pulse */}
              <circle r="1.5" fill={LAYERS[a].color} opacity="0.6" filter="url(#glow-net)">
                <animateMotion
                  dur={`${2.5 + i * 0.3}s`}
                  repeatCount="indefinite"
                  path={`M${pA.x},${pA.y} L${pB.x},${pB.y}`}
                />
                <animate attributeName="opacity" values="0;0.7;0.7;0" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Radial spokes — node to hub (inner orb edge) */}
        {LAYERS.map((layer, i) => {
          const outer = nodePositions[i];
          const inner = hubPositions[i];
          return (
            <g key={`spoke-${i}`}>
              <line
                x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y}
                stroke={layer.color}
                strokeWidth="0.6"
                strokeOpacity="0.12"
              />
              {/* Inward data pulse */}
              <circle r="1" fill={layer.color} opacity="0.5">
                <animateMotion
                  dur={`${3 + i * 0.5}s`}
                  repeatCount="indefinite"
                  path={`M${outer.x},${outer.y} L${inner.x},${inner.y}`}
                />
                <animate attributeName="opacity" values="0;0.6;0.6;0" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Node circles — visual anchors */}
        {LAYERS.map((layer, i) => {
          const pos = nodePositions[i];
          return (
            <g key={`node-dot-${i}`}>
              {/* Outer ring */}
              <circle cx={pos.x} cy={pos.y} r="16" fill="none" stroke={layer.color} strokeWidth="0.5" strokeOpacity="0.2">
                <animate attributeName="r" values="14;17;14" dur={`${5 + i}s`} repeatCount="indefinite" />
              </circle>
              {/* Core dot */}
              <circle cx={pos.x} cy={pos.y} r="3" fill={layer.color} opacity="0.5" filter="url(#glow-net)">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Label overlays — minimal, positioned at nodes */}
      {LAYERS.map((layer, i) => {
        const pos = nodePositions[i];
        return (
          <motion.div
            key={layer.name}
            className="absolute flex flex-col items-center pointer-events-auto"
            style={{
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="flex flex-col items-center gap-0.5"
              animate={{ y: [0, -2, 0, 1.5, 0] }}
              transition={{ duration: 7 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            >
              {/* Icon */}
              <span
                className="text-sm sm:text-base leading-none"
                style={{ color: layer.color, opacity: 0.7, textShadow: `0 0 10px ${layer.color}40` }}
              >
                {layer.icon}
              </span>
              {/* Label */}
              <span
                className="text-[8px] sm:text-[9px] tracking-[2.5px] uppercase whitespace-nowrap"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: layer.color,
                  fontWeight: 500,
                  opacity: 0.65,
                  textShadow: `0 0 8px ${layer.color}25`,
                }}
              >
                {layer.name}
              </span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Main export ── */
const KeteOrbHero = ({ hideText = false }: { hideText?: boolean }) => {
  const mobile = useIsMobile();
  const canvasSize = mobile ? 420 : 600;

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center mb-16"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Ambient glow */}
      <div
        className="absolute w-[480px] h-[480px] sm:w-[680px] sm:h-[680px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(58,125,110,0.08) 0%, rgba(212,168,67,0.04) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Orb container with floating labels */}
      <div className="relative" style={{ width: canvasSize, height: canvasSize }}>
        {/* Cognitive layer labels orbiting outside */}
        <CognitiveLayerLabels size={canvasSize} />

        {/* 3D Canvas */}
        <Suspense
          fallback={
            <div className="w-full h-full rounded-full animate-pulse" style={{ background: "rgba(58,125,110,0.06)" }} />
          }
        >
          <Canvas
            camera={{ position: [0, 0.3, 3.4], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
            dpr={[1, mobile ? 1.5 : 2]}
          >
            <ambientLight intensity={0.1} />
            <pointLight position={[3, 3, 3]} intensity={0.4} color={KOWHAI} />
            <pointLight position={[-3, -2, 2]} intensity={0.25} color={POUNAMU} />

            <GlassOrb />
            <KeteWireframe />
            <MatarikiStars mobile={mobile} />
            <DataNodes mobile={mobile} />
            <DataPulse mobile={mobile} />
            <AmbientDust count={mobile ? 20 : 40} />

            <OrbRimRing radius={1.35} color={POUNAMU} speed={0.02} tilt={0.15} />
            <OrbRimRing radius={1.35} color={KOWHAI} speed={-0.015} tilt={-1.2} />
            <OrbRimRing radius={1.35} color={TEAL_LIGHT} speed={0.01} tilt={0.8} />
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
