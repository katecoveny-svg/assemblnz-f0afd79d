import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

/* ─── Golden spiral generator ─── */
function koruSpiral(turns = 2.5, points = 44, maxRadius = 3.5): [number, number, number][] {
  const positions: [number, number, number][] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const angle = t * turns * Math.PI * 2;
    const r = t * maxRadius;
    positions.push([
      Math.cos(angle) * r,
      Math.sin(angle) * r,
      Math.sin(t * Math.PI) * 0.6,
    ]);
  }
  return positions;
}

/* ─── 5 Kete colours ─── */
const KETE = [
  { index: 8, color: "#E8A090", name: "Manaaki" },
  { index: 16, color: "#E8A948", name: "Waihanga" },
  { index: 24, color: "#B8A5D0", name: "Auaha" },
  { index: 32, color: "#4AA5A8", name: "Arataki" },
  { index: 40, color: "#7BA88C", name: "Pikau" },
];

/* ─── Glass Sphere ─── */
function GlassSphere({
  position,
  radius,
  color,
  index,
  isKete,
}: {
  position: [number, number, number];
  radius: number;
  color: string;
  index: number;
  isKete: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const speed = 0.4 + (index * 0.037) % 0.6;
  const phase = index * 0.7;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.06;
    ref.current.position.x = position[0] + Math.cos(t * speed * 0.7 + phase) * 0.02;
    // Sparkle pulse on the glow shell
    if (glowRef.current) {
      glowRef.current.position.copy(ref.current.position);
      const sparkle = 0.6 + 0.4 * Math.sin(t * 4 + index * 1.3);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = isKete ? sparkle * 0.35 : sparkle * 0.15;
    }
  });

  const brightColor = useMemo(() => new THREE.Color(color).multiplyScalar(1.5), [color]);

  return (
    <group>
      {/* Outer glass shell — shinier, more reflective */}
      <mesh ref={ref} position={position}>
        <sphereGeometry args={[radius, 48, 48]} />
        <MeshTransmissionMaterial
          color={brightColor}
          transmission={isKete ? 0.8 : 0.88}
          roughness={0.005}
          clearcoat={1}
          clearcoatRoughness={0.005}
          ior={1.65}
          samples={16}
          distortion={0.5}
          temporalDistortion={0.25}
          envMapIntensity={5}
          chromaticAberration={0.06}
          thickness={0.6}
        />
      </mesh>
      {/* Sparkle glow halo — pulsing outer ring */}
      <mesh ref={glowRef} position={position}>
        <sphereGeometry args={[radius * 1.5, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} depthWrite={false} />
      </mesh>
      {/* Inner bright core — specular highlight */}
      <mesh position={[position[0] - radius * 0.2, position[1] + radius * 0.35, position[2] + radius * 0.35]}>
        <sphereGeometry args={[radius * 0.35, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={isKete ? 0.7 : 0.45} />
      </mesh>
      {/* Secondary specular — bottom edge catch light */}
      <mesh position={[position[0] + radius * 0.15, position[1] - radius * 0.25, position[2] + radius * 0.2]}>
        <sphereGeometry args={[radius * 0.15, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={isKete ? 0.4 : 0.2} />
      </mesh>
    </group>
  );
}

/* ─── Is kete helper ─── */
const isKeteIndex = (i: number) => KETE.some(k => k.index === i);

function Thread({
  start,
  end,
  index,
}: {
  start: [number, number, number];
  end: [number, number, number];
  index: number;
}) {
  const lineRef = useRef<THREE.Line>(null);

  const lineObj = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2 + Math.sin(index) * 0.15,
        (start[1] + end[1]) / 2 + Math.cos(index) * 0.15,
        (start[2] + end[2]) / 2 + 0.1,
      ),
      new THREE.Vector3(...end),
    ]);
    const pts = curve.getPoints(20);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: "#7DD4D6",
      transparent: true,
      opacity: 0.3,
    });
    return new THREE.Line(geo, mat);
  }, [start, end, index]);

  useFrame(({ clock }) => {
    if (lineObj) {
      (lineObj.material as THREE.LineBasicMaterial).opacity =
        0.25 + 0.15 * Math.sin(clock.elapsedTime * 1.5 + index * 0.4);
    }
  });

  return <primitive ref={lineRef} object={lineObj} />;
}

/* ─── Data pulse traveling along a thread ─── */
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
  const trailRef = useRef<THREE.Mesh>(null);
  const speed = 0.25 + (index * 0.05) % 0.3;
  const offset = index * 1.3;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (Math.sin(clock.elapsedTime * speed + offset) + 1) / 2;
    const x = start[0] + (end[0] - start[0]) * t;
    const y = start[1] + (end[1] - start[1]) * t;
    const z = start[2] + (end[2] - start[2]) * t;
    ref.current.position.set(x, y, z);
    // Pulse glow
    const scale = 1.0 + 0.5 * Math.sin(clock.elapsedTime * 4 + index);
    ref.current.scale.setScalar(scale);
    // Trail follows slightly behind
    if (trailRef.current) {
      const tt = Math.max(0, t - 0.08);
      trailRef.current.position.set(
        start[0] + (end[0] - start[0]) * tt,
        start[1] + (end[1] - start[1]) * tt,
        start[2] + (end[2] - start[2]) * tt,
      );
      trailRef.current.scale.setScalar(scale * 0.6);
    }
  });

  return (
    <group>
      {/* Main pulse — brighter, larger */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={1} />
      </mesh>
      {/* Glow halo around pulse */}
      <mesh ref={trailRef}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color="#7DD4D6" transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ─── Outer Containment Sphere — the big glass orb ─── */
function ContainmentSphere() {
  const ref = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.y = t * 0.05;
      ref.current.rotation.x = Math.sin(t * 0.2) * 0.05;
    }
    if (haloRef.current) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.2);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + pulse * 0.1;
      haloRef.current.scale.setScalar(1 + pulse * 0.04);
    }
  });

  return (
    <group>
      {/* Big outer glass shell */}
      <mesh ref={ref}>
        <sphereGeometry args={[4.4, 96, 96]} />
        <MeshTransmissionMaterial
          color="#E8FBFC"
          transmission={0.98}
          roughness={0.02}
          clearcoat={1}
          clearcoatRoughness={0.01}
          ior={1.45}
          samples={10}
          distortion={0.2}
          temporalDistortion={0.1}
          envMapIntensity={3.5}
          chromaticAberration={0.08}
          thickness={1.2}
          attenuationColor="#B8EAEC"
          attenuationDistance={6}
          backside
        />
      </mesh>
      {/* Outer glow halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[4.7, 48, 48]} />
        <meshBasicMaterial color="#7DD4D6" transparent opacity={0.15} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      {/* Soft inner luminance */}
      <mesh>
        <sphereGeometry args={[4.35, 48, 48]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.04} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      {/* Specular highlight on top-left */}
      <mesh position={[-1.6, 2.2, 2.5]}>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
      </mesh>
      {/* Bottom catch-light */}
      <mesh position={[1.4, -2.4, 2.0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Orbiting Data Nodes around the sphere ─── */
function OrbitingNode({ radius, speed, phase, tilt, color, size = 0.08 }: {
  radius: number; speed: number; phase: number; tilt: number; color: string; size?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed + phase;
    ref.current.position.set(
      Math.cos(t) * radius,
      Math.sin(t * 0.7) * radius * 0.3 + Math.sin(tilt) * radius * 0.2,
      Math.sin(t) * radius,
    );
    const pulse = 0.7 + 0.3 * Math.sin(clock.elapsedTime * 3 + phase);
    ref.current.scale.setScalar(pulse);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[size, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * 2.5, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ─── Main spiral scene ─── */
function KoruScene() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const positions = useMemo(() => koruSpiral(2.5, 44, 2.6), []);
  const orbitNodes = useMemo(
    () => [
      { radius: 4.4, speed: 0.35, phase: 0, tilt: 0.3, color: "#4AA5A8" },
      { radius: 4.4, speed: 0.28, phase: 1.2, tilt: -0.4, color: "#E8A948" },
      { radius: 4.4, speed: 0.42, phase: 2.4, tilt: 0.6, color: "#B8A5D0" },
      { radius: 4.4, speed: 0.31, phase: 3.6, tilt: -0.2, color: "#E8A090" },
      { radius: 4.4, speed: 0.38, phase: 4.8, tilt: 0.5, color: "#7BA88C" },
      { radius: 4.4, speed: 0.45, phase: 0.7, tilt: -0.6, color: "#7DD4D6" },
      { radius: 4.4, speed: 0.26, phase: 2.0, tilt: 0.1, color: "#FFFFFF" },
      { radius: 4.4, speed: 0.33, phase: 4.0, tilt: -0.3, color: "#7DD4D6" },
    ],
    [],
  );

  useFrame(() => {
    if (!groupRef.current) return;
    // Slow auto-rotation
    groupRef.current.rotation.z += 0.0008;
    // Mouse-follow tilt
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      pointer.y * 0.12,
      0.03,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.12,
      0.03,
    );
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
      {/* Outer glass containment sphere */}
      <ContainmentSphere />

      {/* Orbiting data nodes (outside the inner spiral, drifting around the sphere edge) */}
      {orbitNodes.map((n, i) => (
        <OrbitingNode key={`orb-${i}`} {...n} />
      ))}

      <group ref={groupRef}>
        {/* Spheres */}
        {positions.map((pos, i) => {
          const kete = KETE.find((k) => k.index === i);
          return (
            <GlassSphere
              key={`s-${i}`}
              position={pos}
              radius={kete ? 0.28 : 0.1}
              color={kete ? kete.color : "#8DD8DA"}
              index={i}
              isKete={!!kete}
            />
          );
        })}

        {/* Threads */}
        {positions.slice(0, -1).map((pos, i) => (
          <Thread key={`t-${i}`} start={pos} end={positions[i + 1]} index={i} />
        ))}

        {/* Cross-connections from kete nodes to nearby nodes */}
        {KETE.map((k) => {
          const connections: JSX.Element[] = [];
          for (let d = -3; d <= 3; d++) {
            const target = k.index + d;
            if (target >= 0 && target < positions.length && d !== 0) {
              connections.push(
                <Thread
                  key={`cross-${k.index}-${target}`}
                  start={positions[k.index]}
                  end={positions[target]}
                  index={k.index + target}
                />,
              );
            }
          }
          return connections;
        })}

        {/* Data pulses on every 3rd connection */}
        {positions.slice(0, -1).map(
          (pos, i) =>
            i % 3 === 0 && (
              <DataPulse key={`p-${i}`} start={pos} end={positions[i + 1]} index={i} />
            ),
        )}

        {/* Extra pulses along cross-connections */}
        {KETE.map((k, ki) => {
          const target = Math.min(k.index + 2, positions.length - 1);
          return (
            <DataPulse
              key={`kp-${ki}`}
              start={positions[k.index]}
              end={positions[target]}
              index={k.index * 7}
            />
          );
        })}
      </group>
    </Float>
  );
}

/* ─── Hero component ─── */
const GlassKoruHero = () => {
  const isMobile = useIsMobile();
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    // Small delay to let Canvas initialize
    const timer = setTimeout(() => setCanvasReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
        {/* Left 2/5: text */}
        <div className="relative z-10 lg:col-span-2 text-left">
          <div
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full mb-7"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.95)",
              boxShadow: "0 8px 24px rgba(74,165,168,0.12)",
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: "#4AA5A8" }} />
            <span
              className="text-[10px] tracking-[3px] uppercase"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#334155",
                fontWeight: 600,
              }}
            >
              Now onboarding NZ businesses
            </span>
          </div>

          <h1
            className="font-sans text-6xl text-left text-secondary-foreground"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 400,
              fontSize: isMobile ? "2.2rem" : "3.6rem",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#0F172A",
            }}
          >
            The intelligent operating
            <br />
            system for
            <br />
            NZ business
          </h1>

          <p
            className="mt-6 max-w-[420px] text-[15px] sm:text-[17px] leading-[1.75]"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 500,
              color: "#4B5563",
            }}
          >
            Specialist workflows that reduce admin, surface risk earlier, and
            keep your people in control.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              to="/how-it-works"
              className="group inline-flex items-center gap-3 px-8 py-4 text-[13px] font-semibold rounded-full transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: "linear-gradient(145deg, #55BFC1, #4AA5A8)",
                color: "#FFFFFF",
                boxShadow:
                  "0 6px 24px rgba(74,165,168,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              Start here{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              to="/demos"
              className="group inline-flex items-center gap-3 px-8 py-4 text-[13px] font-semibold rounded-full transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(74,165,168,0.25)",
                color: "#4AA5A8",
                fontFamily: "'Lato', sans-serif",
                boxShadow:
                  "4px 4px 10px rgba(166,166,180,0.3), -4px -4px 10px rgba(255,255,255,0.9)",
              }}
            >
              Run live demo{" "}
              <ArrowRight
                size={14}
                className="opacity-60 group-hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>
        </div>

        {/* Right 3/5: 3D Koru */}
        <div
          className="relative lg:col-span-3 w-full"
          style={{ height: isMobile ? "380px" : "680px" }}
        >
          {canvasReady && (
            <Canvas
              camera={{ position: [0, 0, 11], fov: 48 }}
              gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
              style={{ background: "transparent" }}
              dpr={[1, 2]}
            >
              <Environment preset="studio" environmentIntensity={1.0} />

              <ambientLight intensity={1.4} color="#F8F6F0" />
              <directionalLight position={[8, 8, 5]} intensity={2.4} color="#FFFFFF" />
              <directionalLight position={[-5, 3, 8]} intensity={1.2} color="#D4F0F0" />
              <directionalLight position={[3, -3, 6]} intensity={0.8} color="#FFFBE8" />
              <pointLight position={[0, 0, 6]} intensity={1.6} color="#FFFFFF" />
              <pointLight position={[-3, 2, 4]} intensity={1.2} color="#7DD4D6" distance={14} />
              <pointLight position={[3, -2, 4]} intensity={1.0} color="#E8A948" distance={14} />

              <Suspense fallback={null}>
                <KoruScene />
              </Suspense>
            </Canvas>
          )}

          {/* Vibrant radial aura behind the orb */}
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            style={{
              background:
                "radial-gradient(ellipse 75% 75% at 50% 45%, rgba(74,165,168,0.22) 0%, rgba(125,212,214,0.14) 25%, rgba(232,169,72,0.08) 50%, transparent 75%)",
              filter: "blur(8px)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none -z-10 animate-pulse"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(125,212,214,0.18) 0%, transparent 55%)",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default GlassKoruHero;
