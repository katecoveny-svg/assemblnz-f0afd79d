import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Generate koru spiral points
function koruSpiral(turns = 2.5, points = 44, maxRadius = 4) {
  const positions: [number, number, number][] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const angle = t * turns * Math.PI * 2;
    const r = t * maxRadius;
    positions.push([
      Math.cos(angle) * r,
      Math.sin(angle) * r,
      Math.sin(t * Math.PI) * 0.8,
    ]);
  }
  return positions;
}

const KETE = [
  { index: 8, color: "#E8A090", name: "MANAAKI" },
  { index: 16, color: "#E8A948", name: "WAIHANGA" },
  { index: 24, color: "#B8A5D0", name: "AUAHA" },
  { index: 32, color: "#4AA5A8", name: "ARATAKI" },
  { index: 40, color: "#7BA88C", name: "PIKAU" },
];

function DataNode({
  position,
  isKete,
  color,
}: {
  position: [number, number, number];
  isKete: boolean;
  color: string;
  index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const speed = 0.5 + Math.random() * 0.5;
  const phase = Math.random() * Math.PI * 2;

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y =
        position[1] + Math.sin(clock.elapsedTime * speed + phase) * 0.08;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[isKete ? 0.22 : 0.08, 16, 16]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={isKete ? 0.9 : 0.5}
        roughness={0.1}
        transmission={isKete ? 0.3 : 0}
        thickness={0.5}
      />
    </mesh>
  );
}

function DataThread({
  start,
  end,
  index,
}: {
  start: [number, number, number];
  end: [number, number, number];
  index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current && ref.current.material) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity =
        0.15 + 0.2 * Math.sin(clock.elapsedTime * 2 + index * 0.3);
    }
  });

  const midPoint = useMemo(() => {
    return new THREE.Vector3(
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2,
      (start[2] + end[2]) / 2
    );
  }, [start, end]);

  const length = useMemo(() => {
    return new THREE.Vector3(...start).distanceTo(new THREE.Vector3(...end));
  }, [start, end]);

  const rotation = useMemo(() => {
    const dir = new THREE.Vector3(
      end[0] - start[0],
      end[1] - start[1],
      end[2] - start[2]
    ).normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    return [euler.x, euler.y, euler.z] as [number, number, number];
  }, [start, end]);

  return (
    <mesh ref={ref} position={[midPoint.x, midPoint.y, midPoint.z]} rotation={rotation}>
      <cylinderGeometry args={[0.008, 0.008, length, 4]} />
      <meshBasicMaterial color="#4AA5A8" transparent opacity={0.2} />
    </mesh>
  );
}

function DataPulse({
  start,
  end,
  index,
}: {
  start: [number, number, number];
  end: [number, number, number];
  index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const speed = 0.3 + Math.random() * 0.4;
  const offset = Math.random() * Math.PI * 2;

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = (Math.sin(clock.elapsedTime * speed + offset) + 1) / 2;
      ref.current.position.set(
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
        start[2] + (end[2] - start[2]) * t
      );
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.6 + 0.4 * Math.sin(clock.elapsedTime * 3 + index);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color="#E8A948" transparent opacity={0.8} />
    </mesh>
  );
}

function KoruScene() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const positions = useMemo(() => koruSpiral(2.5, 44, 4), []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.001;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        pointer.y * 0.15,
        0.05
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        pointer.x * 0.15,
        0.05
      );
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        {positions.map((pos, i) => {
          const kete = KETE.find((k) => k.index === i);
          return (
            <DataNode
              key={i}
              position={pos}
              isKete={!!kete}
              color={kete?.color || "#4AA5A8"}
              index={i}
            />
          );
        })}

        {positions.slice(0, -1).map((pos, i) => (
          <DataThread key={`t-${i}`} start={pos} end={positions[i + 1]} index={i} />
        ))}

        {positions.slice(0, -1).map(
          (pos, i) =>
            i % 3 === 0 && (
              <DataPulse key={`p-${i}`} start={pos} end={positions[i + 1]} index={i} />
            )
        )}
      </group>
    </Float>
  );
}

const GlassKoruHero = () => {
  const isMobile = useIsMobile();

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: text */}
        <div className="relative z-10 text-left">
          <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full mb-7"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.95)",
              boxShadow: "0 8px 24px rgba(74,165,168,0.12)",
            }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "#4AA5A8" }} />
            <span className="text-[10px] tracking-[3px] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#334155", fontWeight: 600 }}>
              Now onboarding NZ businesses
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? "2.2rem" : "4rem",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "#0F172A",
          }}>
            The operating<br />
            system for<br />
            NZ business
          </h1>

          <p className="mt-6 max-w-[480px] text-[15px] sm:text-[17px] leading-[1.75]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "#4B5563" }}>
            Specialist workflows that reduce admin, surface risk earlier, and
            keep your people in control.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link to="/how-it-works"
              className="group inline-flex items-center gap-3 px-8 py-4 text-[13px] font-semibold rounded-full transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: "linear-gradient(145deg, #55BFC1, #4AA5A8)",
                color: "#FFFFFF",
                boxShadow: "0 6px 24px rgba(74,165,168,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                fontFamily: "'Lato', sans-serif",
              }}>
              Start here <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/demos"
              className="group inline-flex items-center gap-3 px-8 py-4 text-[13px] font-semibold rounded-full transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(74,165,168,0.25)",
                color: "#4AA5A8",
                fontFamily: "'Lato', sans-serif",
                boxShadow: "4px 4px 10px rgba(166,166,180,0.3), -4px -4px 10px rgba(255,255,255,0.9)",
              }}>
              Run live demo <ArrowRight size={14} className="opacity-60 group-hover:opacity-90 transition-opacity" />
            </Link>
          </div>
        </div>

        {/* Right: 3D Koru */}
        <div className="relative w-full" style={{ height: isMobile ? "350px" : "600px" }}>
          <Canvas
            camera={{ position: [0, 0, 10], fov: 45 }}
            style={{ background: "transparent" }}
            gl={{ alpha: true, antialias: true }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <Environment preset="city" />
            <Suspense fallback={null}>
              <KoruScene />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </section>
  );
};

export default GlassKoruHero;
