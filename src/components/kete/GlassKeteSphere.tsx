import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface GlassKeteSphereProps {
  /** Tint colour for the glass (kete brand colour) — typically soft teal */
  accentColor: string;
  /** Lighter highlight colour — used for the koru filaments */
  accentLight: string;
  /** Render size in CSS pixels */
  size?: number;
  className?: string;
  /** kept for API compat */
  swirlCount?: number;
}

/**
 * Glass Koru Sphere
 *  • Outer luminescent teal glass orb (transmission material, soft inner glow)
 *  • A 3D koru (unfurling fern frond) spiral suspended inside, glowing from within
 *  • Slow rotation, gentle pulse, secondary smaller koru orbiting for depth
 */

/** Build a 3D koru curve — logarithmic spiral that unfurls outward and lifts in Z. */
const buildKoruCurve = (turns = 2.4, startRadius = 0.06, growth = 1.42, samples = 220) => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const angle = t * Math.PI * 2 * turns;
    // logarithmic / equiangular spiral — natural koru proportions
    const r = startRadius * Math.pow(growth, angle / (Math.PI / 2));
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    // gentle lift out of the plane so it reads as 3D inside the sphere
    const z = Math.sin(t * Math.PI) * 0.18 - t * 0.08;
    points.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
};

const Koru = ({
  accentColor,
  accentLight,
  scale = 1,
  rotation = [0, 0, 0] as [number, number, number],
  thicknessStart = 0.055,
  thicknessEnd = 0.012,
}: {
  accentColor: string;
  accentLight: string;
  scale?: number;
  rotation?: [number, number, number];
  thicknessStart?: number;
  thicknessEnd?: number;
}) => {
  // We build TWO tubes with slightly different radii so the frond tapers naturally.
  // Three.js TubeGeometry uses a constant radius, so we approximate by stacking two passes.
  const curve = useMemo(() => buildKoruCurve(), []);
  const segments = 180;

  // Build a custom tapered tube manually using ParametricBuffer-like approach via TubeGeometry
  // with multiple segments at different radii is overkill; use one tube + a small bulb at the start (the unfurled tip).
  const radius = (thicknessStart + thicknessEnd) / 2;

  return (
    <group scale={scale} rotation={rotation}>
      {/* Main koru filament — the frond */}
      <mesh>
        <tubeGeometry args={[curve, segments, radius, 16, false]} />
        <meshStandardMaterial
          color={accentLight}
          emissive={accentLight}
          emissiveIntensity={1.4}
          metalness={0.2}
          roughness={0.25}
          toneMapped={false}
        />
      </mesh>

      {/* Inner brighter core for luminescence */}
      <mesh>
        <tubeGeometry args={[curve, segments, radius * 0.45, 12, false]} />
        <meshBasicMaterial color="#F4FFFE" toneMapped={false} />
      </mesh>

      {/* The pītau — the unfurled bulb at the spiral's centre */}
      <mesh position={curve.getPoint(0).toArray()}>
        <sphereGeometry args={[thicknessStart * 1.55, 24, 24]} />
        <meshStandardMaterial
          color={accentLight}
          emissive={accentLight}
          emissiveIntensity={1.6}
          roughness={0.2}
          metalness={0.1}
          toneMapped={false}
        />
      </mesh>

      {/* Outer-tip taper cap */}
      <mesh position={curve.getPoint(1).toArray()}>
        <sphereGeometry args={[thicknessEnd * 1.4, 16, 16]} />
        <meshBasicMaterial color={accentLight} transparent opacity={0.85} toneMapped={false} />
      </mesh>
    </group>
  );
};

const KoruSphere = ({
  accentColor,
  accentLight,
}: {
  accentColor: string;
  accentLight: string;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const innerKoruRef = useRef<THREE.Group>(null);
  const secondaryKoruRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);

  const tintedGlass = useMemo(() => new THREE.Color(accentColor).lerp(new THREE.Color("#FFFFFF"), 0.35), [accentColor]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18;
      groupRef.current.rotation.x = Math.sin(t * 0.35) * 0.08;
    }
    if (innerKoruRef.current) {
      innerKoruRef.current.rotation.z = t * 0.45;
      const breathe = 1 + Math.sin(t * 1.2) * 0.04;
      innerKoruRef.current.scale.setScalar(breathe);
    }
    if (secondaryKoruRef.current) {
      secondaryKoruRef.current.rotation.z = -t * 0.3;
      secondaryKoruRef.current.rotation.y = t * 0.6;
    }
    if (haloRef.current) {
      const pulse = 0.18 + 0.12 * Math.sin(t * 1.5);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
    if (innerGlowRef.current) {
      const pulse = 0.55 + 0.25 * Math.sin(t * 1.8);
      (innerGlowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
  });

  return (
    <group>
      {/* Outer luminescent halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.65, 32, 32]} />
        <meshBasicMaterial color={accentLight} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
      </mesh>

      <group ref={groupRef}>
        {/* The koru living inside the sphere */}
        <group ref={innerKoruRef}>
          <Koru
            accentColor={accentColor}
            accentLight={accentLight}
            scale={1.05}
            rotation={[0, 0, 0]}
          />
        </group>

        {/* Secondary smaller koru, orbiting for depth & life */}
        <group ref={secondaryKoruRef}>
          <Koru
            accentColor={accentColor}
            accentLight={accentLight}
            scale={0.55}
            rotation={[Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.4]}
            thicknessStart={0.038}
            thicknessEnd={0.008}
          />
        </group>

        {/* Soft inner glow ball at the heart of the koru */}
        <mesh ref={innerGlowRef}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshBasicMaterial color="#EAFFFD" transparent opacity={0.7} toneMapped={false} />
        </mesh>

        {/* Outer glass sphere — soft teal luminescent shell */}
        <mesh>
          <sphereGeometry args={[1.25, 96, 96]} />
          <MeshTransmissionMaterial
            color={tintedGlass}
            transmission={0.96}
            roughness={0.04}
            clearcoat={1}
            clearcoatRoughness={0.02}
            ior={1.42}
            samples={10}
            distortion={0.18}
            temporalDistortion={0.08}
            envMapIntensity={2.4}
            chromaticAberration={0.04}
            thickness={0.85}
            attenuationColor={new THREE.Color(accentColor)}
            attenuationDistance={2.1}
            anisotropy={0.15}
          />
        </mesh>

        {/* Bright specular catch-light */}
        <mesh position={[-0.45, 0.55, 0.78]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.65} toneMapped={false} />
        </mesh>

        {/* Smaller secondary highlight */}
        <mesh position={[0.4, -0.2, 0.85]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

const GlassKeteSphere: React.FC<GlassKeteSphereProps> = ({
  accentColor,
  accentLight,
  size = 200,
  className = "",
}) => {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* CSS ambient teal halo behind the sphere */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentLight}55 0%, ${accentColor}25 38%, transparent 72%)`,
          filter: "blur(32px)",
          transform: "scale(1.5)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0.1, 3.6], fov: 36 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Environment preset="studio" environmentIntensity={0.9} />
        <ambientLight intensity={0.9} color="#F4FBFB" />
        <directionalLight position={[6, 8, 5]} intensity={1.6} color="#FFFFFF" />
        <directionalLight position={[-6, 2, 6]} intensity={1.1} color="#CFEFEE" />
        <directionalLight position={[2, -4, 4]} intensity={0.45} color="#E6FBFA" />
        <pointLight position={[0, 0, 5]} intensity={0.9} color={accentLight} />
        <pointLight position={[0, 0, -2]} intensity={0.6} color={accentColor} />

        <Suspense fallback={null}>
          <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.45}>
            <KoruSphere accentColor={accentColor} accentLight={accentLight} />
          </Float>

          <ContactShadows
            position={[0, -1.35, 0]}
            opacity={0.32}
            scale={3.0}
            blur={2.8}
            far={2.4}
            color="#0e3a3a"
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GlassKeteSphere;
