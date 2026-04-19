import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

/* ─────────────────────────────────────────────────────────
   ENGRAVED KORU ORB — A pounamu-inspired koru silhouette
   suspended inside a luminous glass orb, surrounded by
   orbiting data nodes and energy rings.
   ───────────────────────────────────────────────────────── */

/* ─── Engraved Koru silhouette (extruded 2D shape) ─── */
function EngravedKoru({ color = "#4AA5A8" }: { color?: string }) {
  const geometry = useMemo(() => {
    const s = new THREE.Shape();
    // Outer spiral arc
    s.moveTo(0.92, 0);
    s.absarc(0, 0, 0.92, 0, Math.PI * 1.72, false);
    s.lineTo(-0.55, 0.55);
    s.absarc(-0.18, 0.18, 0.55, Math.PI * 1.72, Math.PI * 0.4, true);
    s.lineTo(0.92, 0);

    // Inner hole (the koru's open eye)
    const hole = new THREE.Path();
    hole.absarc(0.05, 0.05, 0.35, 0, Math.PI * 2, true);
    s.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 12,
      steps: 2,
      bevelSize: 0.04,
      bevelThickness: 0.04,
      curveSegments: 32,
    });
    geo.center();
    geo.rotateZ(-0.6);
    geo.scale(1.35, 1.35, 1.35);
    return geo;
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color={color}
        metalness={0.85}
        roughness={0.18}
        clearcoat={1}
        clearcoatRoughness={0.05}
        emissive={color}
        emissiveIntensity={0.45}
        envMapIntensity={1.6}
      />
    </mesh>
  );
}

/* ─── Inner glow shell behind the koru ─── */
function InnerGlow() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      const pulse = 0.6 + Math.sin(t * 1.3) * 0.25;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.18 + pulse * 0.12;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.8, 48, 48]} />
      <meshBasicMaterial color="#7DD4D6" transparent opacity={0.22} toneMapped={false} />
    </mesh>
  );
}

/* ─── The big glass orb encasing the koru ─── */
function GlassOrb({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.18;
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.08;
  });

  return (
    <group>
      {/* Outer transmissive glass shell */}
      <mesh>
        <sphereGeometry args={[2.6, 96, 96]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.6}
          chromaticAberration={0.08}
          anisotropy={0.3}
          distortion={0.15}
          distortionScale={0.4}
          temporalDistortion={0.05}
          roughness={0.02}
          ior={1.45}
          color="#E8F8F7"
          attenuationColor="#A8E0DE"
          attenuationDistance={3}
          transmission={1}
          envMapIntensity={1.4}
        />
      </mesh>

      {/* Specular highlight cap */}
      <mesh position={[-0.7, 1.1, 1.4]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} toneMapped={false} />
      </mesh>

      {/* Suspended koru inside */}
      <group ref={groupRef}>
        <InnerGlow />
        <EngravedKoru color="#4AA5A8" />
      </group>
    </group>
  );
}

/* ─── Orbital energy ring ─── */
function OrbitalRing({
  radius,
  color,
  speed,
  rotation,
  opacity = 0.5,
  thickness = 0.012,
}: {
  radius: number;
  color: string;
  speed: number;
  rotation: [number, number, number];
  opacity?: number;
  thickness?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.getElapsedTime() * speed;
    }
  });
  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, thickness, 16, 128]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.5}
        transparent
        opacity={opacity}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ─── Orbiting data node (small glowing sphere) ─── */
function OrbitingNode({
  radius,
  speed,
  phase,
  color,
  size,
  axis,
}: {
  radius: number;
  speed: number;
  phase: number;
  color: string;
  size: number;
  axis: "x" | "y" | "z";
}) {
  const ref = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + phase;
    let x = 0, y = 0, z = 0;
    if (axis === "y") {
      x = Math.cos(t) * radius;
      z = Math.sin(t) * radius;
      y = Math.sin(t * 0.7) * 0.4;
    } else if (axis === "x") {
      y = Math.cos(t) * radius;
      z = Math.sin(t) * radius;
      x = Math.cos(t * 0.6) * 0.5;
    } else {
      x = Math.cos(t) * radius;
      y = Math.sin(t) * radius;
      z = Math.sin(t * 0.8) * 0.5;
    }
    if (ref.current) ref.current.position.set(x, y, z);
    if (haloRef.current) haloRef.current.position.set(x, y, z);
    const pulse = 0.5 + Math.sin(t * 3) * 0.5;
    if (haloRef.current) {
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + pulse * 0.25;
    }
  });

  return (
    <group>
      <mesh ref={haloRef}>
        <sphereGeometry args={[size * 2.8, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} toneMapped={false} />
      </mesh>
      <mesh ref={ref}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ─── Main scene ─── */
function KoruScene() {
  const orbitNodes = useMemo(
    () => [
      { radius: 3.4, speed: 0.6, phase: 0, color: "#7DD4D6", size: 0.09, axis: "y" as const },
      { radius: 3.6, speed: -0.5, phase: 1.2, color: "#E8A948", size: 0.08, axis: "y" as const },
      { radius: 3.8, speed: 0.4, phase: 2.5, color: "#B8A5D0", size: 0.07, axis: "x" as const },
      { radius: 3.5, speed: -0.7, phase: 0.8, color: "#4AA5A8", size: 0.085, axis: "z" as const },
      { radius: 3.7, speed: 0.55, phase: 3.4, color: "#E8A090", size: 0.075, axis: "y" as const },
      { radius: 3.9, speed: -0.45, phase: 4.1, color: "#7BA88C", size: 0.08, axis: "x" as const },
      { radius: 3.45, speed: 0.65, phase: 5.0, color: "#7DD4D6", size: 0.07, axis: "z" as const },
      { radius: 3.75, speed: -0.35, phase: 1.7, color: "#E8A948", size: 0.08, axis: "y" as const },
      { radius: 3.55, speed: 0.5, phase: 2.8, color: "#B8A5D0", size: 0.075, axis: "x" as const },
    ],
    []
  );

  return (
    <Float speed={0.9} rotationIntensity={0.12} floatIntensity={0.25}>
      {/* Energy rings around the orb */}
      <OrbitalRing radius={3.2} color="#7DD4D6" speed={0.12} rotation={[Math.PI / 2.2, 0, 0]} opacity={0.55} />
      <OrbitalRing radius={3.35} color="#E8A948" speed={-0.08} rotation={[Math.PI / 1.6, 0.4, 0]} opacity={0.4} />
      <OrbitalRing radius={3.55} color="#B8A5D0" speed={0.06} rotation={[Math.PI / 3, -0.5, 0]} opacity={0.32} />
      <OrbitalRing radius={3.8} color="#4AA5A8" speed={-0.04} rotation={[Math.PI / 2, Math.PI / 4, 0]} opacity={0.26} />

      {/* Orbiting data nodes */}
      {orbitNodes.map((n, i) => (
        <OrbitingNode key={`orb-${i}`} {...n} />
      ))}

      {/* The hero — engraved koru in glass orb */}
      <GlassOrb>{null}</GlassOrb>
    </Float>
  );
}

/* ─── Hero ─── */
const GlassKoruHero = () => {
  const isMobile = useIsMobile();
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanvasReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
        {/* Left: text */}
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

        {/* Right: 3D Koru */}
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
                "radial-gradient(ellipse 80% 80% at 50% 45%, rgba(74,165,168,0.32) 0%, rgba(125,212,214,0.2) 22%, rgba(232,169,72,0.12) 48%, rgba(184,165,208,0.08) 65%, transparent 78%)",
              filter: "blur(10px)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none -z-10 animate-pulse"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(125,212,214,0.28) 0%, transparent 55%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.18) 0%, transparent 18%)",
              mixBlendMode: "screen",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default GlassKoruHero;
