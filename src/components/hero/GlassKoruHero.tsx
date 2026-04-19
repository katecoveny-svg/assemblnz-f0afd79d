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

/* ─── Engraved Spiral Koru Disc (frosted glass relief) ─── */
function EngravedSpiralDisc() {
  // Build an Archimedean spiral as a thin ribbon extruded into a frosted disc
  const spiralGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const turns = 4.2;
    const steps = 360;
    const a = 0.05;
    const b = 0.16;
    const ribbon = 0.06;

    // Outer edge of spiral ribbon
    const outer: THREE.Vector2[] = [];
    const inner: THREE.Vector2[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * turns * Math.PI * 2;
      const r = a + b * t * 0.12;
      outer.push(new THREE.Vector2(Math.cos(t) * (r + ribbon), Math.sin(t) * (r + ribbon)));
      inner.push(new THREE.Vector2(Math.cos(t) * (r - ribbon * 0.4), Math.sin(t) * (r - ribbon * 0.4)));
    }
    shape.moveTo(outer[0].x, outer[0].y);
    outer.forEach((p) => shape.lineTo(p.x, p.y));
    for (let i = inner.length - 1; i >= 0; i--) shape.lineTo(inner[i].x, inner[i].y);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      curveSegments: 24,
    });
    geo.center();
    geo.scale(1.05, 1.05, 1);
    return geo;
  }, []);

  // Backing frosted disc
  const discGeometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(1.55, 1.55, 0.04, 96, 1);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);

  return (
    <group>
      {/* Frosted backing disc */}
      <mesh geometry={discGeometry} position={[0, 0, -0.05]}>
        <meshPhysicalMaterial
          color="#EAF6F5"
          roughness={0.55}
          metalness={0.05}
          transmission={0.4}
          thickness={0.5}
          ior={1.4}
          clearcoat={0.4}
          clearcoatRoughness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Spiral relief in frosted glass */}
      <mesh geometry={spiralGeometry}>
        <meshPhysicalMaterial
          color="#F4FBFA"
          roughness={0.4}
          metalness={0.1}
          clearcoat={0.6}
          clearcoatRoughness={0.25}
          emissive="#C8E8E6"
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}

/* ─── Hero Glass Orb (single, large, refractive) ─── */
function HeroGlassOrb() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.18;
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.08;
  });

  return (
    <group ref={groupRef}>
      {/* Glass shell */}
      <mesh>
        <sphereGeometry args={[2.5, 128, 128]} />
        <MeshTransmissionMaterial
          backside
          samples={10}
          thickness={1.2}
          chromaticAberration={0.12}
          anisotropy={0.4}
          distortion={0.25}
          distortionScale={0.5}
          temporalDistortion={0.08}
          roughness={0.0}
          ior={1.5}
          color="#F0FAF9"
          attenuationColor="#A8DDDB"
          attenuationDistance={4}
          transmission={1}
          envMapIntensity={1.8}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </mesh>

      {/* Specular crescent highlight (top-left bright spot) */}
      <mesh position={[-0.95, 1.25, 1.7]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.45} toneMapped={false} />
      </mesh>
      <mesh position={[-1.4, 0.4, 1.85]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} toneMapped={false} />
      </mesh>

      {/* Engraved spiral disc inside, slightly behind centre */}
      <group rotation={[0, 0, 0]}>
        <EngravedSpiralDisc />
      </group>
    </group>
  );
}

/* ─── Reflective floor with subtle sheen ─── */
function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.7, 0]} receiveShadow>
      <circleGeometry args={[8, 64]} />
      <meshPhysicalMaterial
        color="#EAF4F3"
        roughness={0.35}
        metalness={0.2}
        clearcoat={0.8}
        clearcoatRoughness={0.4}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

/* ─── Sparkle Bokeh (soft floating light particles) ─── */
function SparkleBokeh() {
  const ref = useRef<THREE.Points>(null);
  const count = 180;

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.2) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
      sizes[i] = Math.random() * 0.12 + 0.03;
    }
    return { positions, sizes };
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#FFFFFF"
        size={0.08}
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Main scene ─── */
function KoruScene() {
  return (
    <>
      <SparkleBokeh />
      <ReflectiveFloor />
      <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.18}>
        <HeroGlassOrb />
      </Float>
    </>
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

          {/* Icy sparkle aura behind the orb */}
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            style={{
              background:
                "radial-gradient(ellipse 70% 70% at 50% 45%, rgba(200,232,230,0.55) 0%, rgba(220,240,238,0.3) 30%, rgba(240,248,247,0.15) 55%, transparent 75%)",
              filter: "blur(8px)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            style={{
              background:
                "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.5) 0%, transparent 28%)",
              mixBlendMode: "screen",
            }}
          />
          {/* Reflected pool below */}
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none -z-10"
            style={{
              bottom: "8%",
              width: "70%",
              height: "120px",
              background:
                "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(168,221,219,0.35) 0%, transparent 70%)",
              filter: "blur(12px)",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default GlassKoruHero;
