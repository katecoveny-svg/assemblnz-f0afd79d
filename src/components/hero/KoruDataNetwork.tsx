import React, { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ── Koru spiral path generator ── */
function generateKoruPath(turns = 2.5, points = 200): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const angle = t * turns * Math.PI * 2;
    const r = 0.3 + t * 2.8;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    const z = Math.sin(t * Math.PI) * 0.6;
    pts.push(new THREE.Vector3(x, y, z));
  }
  return pts;
}

/* ── Kete sphere colours ── */
const KETE_COLORS = [
  { name: "MANAAKI", color: "#E8A090", index: 8 },
  { name: "WAIHANGA", color: "#E8A948", index: 18 },
  { name: "AUAHA", color: "#B8A5D0", index: 28 },
  { name: "ARATAKI", color: "#4AA5A8", index: 36 },
  { name: "PIKAU", color: "#7BA88C", index: 42 },
];

const KETE_INDICES = new Set(KETE_COLORS.map((k) => k.index));

function getKeteColor(index: number): string | null {
  const k = KETE_COLORS.find((c) => c.index === index);
  return k ? k.color : null;
}

/* ── Single glass sphere ── */
function GlassSphere({
  position,
  color,
  radius,
  phase,
  bobSpeed,
}: {
  position: THREE.Vector3;
  color: string;
  radius: number;
  phase: number;
  bobSpeed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y =
      position.y + Math.sin(t * bobSpeed + phase) * 0.08;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <MeshTransmissionMaterial
        transmission={0.92}
        roughness={0.05}
        thickness={0.6}
        chromaticAberration={0.08}
        color={color}
        envMapIntensity={1.2}
        backside
      />
    </mesh>
  );
}

/* ── Data pulse travelling along a thread ── */
function DataPulse({
  start,
  end,
  delay,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  delay: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = ((clock.getElapsedTime() + delay) % 3) / 3;
    ref.current.position.lerpVectors(start, end, t);
    ref.current.material &&
      ((ref.current.material as THREE.MeshBasicMaterial).opacity =
        Math.sin(t * Math.PI) * 0.9);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshBasicMaterial color="#4AA5A8" transparent opacity={0.5} />
    </mesh>
  );
}

/* ── Thread between two nodes ── */
function Thread({
  start,
  end,
  phaseOffset,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  phaseOffset: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => {
    const curve = new THREE.LineCurve3(start, end);
    return new THREE.TubeGeometry(curve, 8, 0.008, 6, false);
  }, [start, end]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const osc = 0.3 + Math.sin(t * 2.1 + phaseOffset) * 0.2;
    (ref.current.material as THREE.MeshBasicMaterial).opacity = osc;
  });

  return (
    <mesh ref={ref} geometry={geom}>
      <meshBasicMaterial
        color="#4AA5A8"
        transparent
        opacity={0.4}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ── Mouse-follow tilt controller ── */
function SceneController({
  groupRef,
}: {
  groupRef: React.RefObject<THREE.Group>;
}) {
  const targetRotation = useRef({ x: 0, y: 0 });
  const { gl } = useThree();

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotation.current.y = nx * 0.14;
      targetRotation.current.x = -ny * 0.14;
    },
    [gl]
  );

  React.useEffect(() => {
    const el = gl.domElement;
    el.addEventListener("pointermove", handlePointerMove);
    return () => el.removeEventListener("pointermove", handlePointerMove);
  }, [gl, handlePointerMove]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    g.rotation.y += 0.0025; // slow auto-rotate
    g.rotation.x += (targetRotation.current.x - g.rotation.x) * 0.05;
    const targetY =
      g.rotation.y +
      (targetRotation.current.y - (g.rotation.y % (Math.PI * 2)));
    g.rotation.y += (targetY - g.rotation.y) * 0.02;
  });

  return null;
}

/* ── Main scene ── */
function KoruScene() {
  const groupRef = useRef<THREE.Group>(null!);
  const spiralPoints = useMemo(() => generateKoruPath(2.5, 200), []);

  // Place 44 spheres evenly along the spiral
  const spheres = useMemo(() => {
    const result: {
      position: THREE.Vector3;
      color: string;
      radius: number;
      phase: number;
      bobSpeed: number;
    }[] = [];
    for (let i = 0; i < 44; i++) {
      const idx = Math.floor((i / 43) * (spiralPoints.length - 1));
      const pos = spiralPoints[idx].clone();
      const isKete = KETE_INDICES.has(i);
      const keteColor = getKeteColor(i);
      result.push({
        position: pos,
        color: keteColor || "#4AA5A8",
        radius: isKete ? 0.12 : 0.07,
        phase: Math.random() * Math.PI * 2,
        bobSpeed: 0.6 + Math.random() * 0.8,
      });
    }
    return result;
  }, [spiralPoints]);

  // Threads connect consecutive spheres
  const threads = useMemo(() => {
    const result: { start: THREE.Vector3; end: THREE.Vector3; phase: number }[] = [];
    for (let i = 0; i < spheres.length - 1; i++) {
      result.push({
        start: spheres[i].position,
        end: spheres[i + 1].position,
        phase: i * 0.5,
      });
    }
    // Extra cross-connections for network feel
    for (let i = 0; i < spheres.length - 5; i += 4) {
      result.push({
        start: spheres[i].position,
        end: spheres[Math.min(i + 5, spheres.length - 1)].position,
        phase: i * 0.3,
      });
    }
    return result;
  }, [spheres]);

  // Data pulses
  const pulses = useMemo(() => {
    return threads
      .filter((_, i) => i % 3 === 0)
      .map((t, i) => ({
        start: t.start,
        end: t.end,
        delay: i * 0.7,
      }));
  }, [threads]);

  return (
    <>
      <SceneController groupRef={groupRef} />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[-4, 6, 3]}
        intensity={1.2}
        color="#FFF8F0"
      />
      <pointLight position={[3, -2, 4]} intensity={0.4} color="#4AA5A8" />

      <group ref={groupRef} scale={1}>
        {spheres.map((s, i) => (
          <GlassSphere key={i} {...s} />
        ))}
        {threads.map((t, i) => (
          <Thread key={`t-${i}`} start={t.start} end={t.end} phaseOffset={t.phase} />
        ))}
        {pulses.map((p, i) => (
          <DataPulse key={`p-${i}`} {...p} />
        ))}
      </group>

      <Environment preset="city" />
    </>
  );
}

/* ── Mobile SVG fallback ── */
function KoruSVGFallback() {
  const dots = useMemo(() => {
    const pts: { x: number; y: number; r: number; color: string; delay: number }[] = [];
    for (let i = 0; i < 44; i++) {
      const t = i / 43;
      const angle = t * 2.5 * Math.PI * 2;
      const radius = 30 + t * 120;
      const x = 200 + Math.cos(angle) * radius;
      const y = 200 + Math.sin(angle) * radius;
      const keteColor = getKeteColor(i);
      pts.push({
        x,
        y,
        r: keteColor ? 5 : 3,
        color: keteColor || "#4AA5A8",
        delay: i * 0.08,
      });
    }
    return pts;
  }, []);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" style={{ maxWidth: 320 }}>
      <defs>
        <filter id="koru-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Connecting lines */}
      {dots.slice(0, -1).map((d, i) => (
        <line
          key={`l-${i}`}
          x1={d.x}
          y1={d.y}
          x2={dots[i + 1].x}
          y2={dots[i + 1].y}
          stroke="#4AA5A8"
          strokeWidth="0.8"
          opacity="0.25"
        />
      ))}
      {/* Dots */}
      {dots.map((d, i) => (
        <circle
          key={`d-${i}`}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill={d.color}
          opacity="0.8"
          filter="url(#koru-glow)"
          style={{
            animation: `koruPulse 3s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes koruPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </svg>
  );
}

/* ── Export ── */
export default function KoruDataNetwork({
  isMobile = false,
}: {
  isMobile?: boolean;
}) {
  if (isMobile) {
    return (
      <div className="flex items-center justify-center w-full h-[320px]">
        <KoruSVGFallback />
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: "60vh", minHeight: 480 }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <KoruScene />
      </Canvas>
    </div>
  );
}
