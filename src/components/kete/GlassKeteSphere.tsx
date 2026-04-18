import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface GlassKeteSphereProps {
  /** Tint colour for the glass (kete brand colour) */
  accentColor: string;
  /** Lighter highlight colour — used for the woven warp threads */
  accentLight: string;
  /** Render size in CSS pixels */
  size?: number;
  className?: string;
  /** Number of horizontal weave bands (default 9) */
  swirlCount?: number;
}

/**
 * Glass Kete — a woven basket sculpted from glass.
 *  • Tapered body (wider at the rim, narrower at the base) like a real kete
 *  • Flat oval rim with a thicker glass lip
 *  • Two arched handles (kawe)
 *  • Horizontal weave bands wrap the body (whatu — the cross-weave)
 *  • Vertical warp threads in accentLight (whenu)
 *  • Subtle base shadow + pulsing colour halo
 */

// Kete profile — radius at each height level, from base (-1) to rim (+1).
// Slightly tapered: narrow base, widening to a rim, with a small rim flare.
const buildKeteGeometry = () => {
  const points: THREE.Vector2[] = [];
  // (radius, y) — bottom to top
  points.push(new THREE.Vector2(0.0, -1.05));   // closed base centre
  points.push(new THREE.Vector2(0.55, -1.0));   // base edge
  points.push(new THREE.Vector2(0.72, -0.7));
  points.push(new THREE.Vector2(0.85, -0.3));
  points.push(new THREE.Vector2(0.93, 0.1));
  points.push(new THREE.Vector2(0.98, 0.5));
  points.push(new THREE.Vector2(1.0, 0.85));    // rim
  points.push(new THREE.Vector2(1.04, 0.92));   // rim flare out
  points.push(new THREE.Vector2(1.02, 0.96));   // rim lip top
  points.push(new THREE.Vector2(0.96, 0.96));   // back inside
  points.push(new THREE.Vector2(0.92, 0.85));   // inside wall
  points.push(new THREE.Vector2(0.86, 0.5));
  points.push(new THREE.Vector2(0.82, 0.0));
  points.push(new THREE.Vector2(0.7, -0.5));
  points.push(new THREE.Vector2(0.0, -0.85));   // closed inside base
  return new THREE.LatheGeometry(points, 96);
};

const KeteBody = ({ accentColor, accentLight, swirlCount = 9 }: { accentColor: string; accentLight: string; swirlCount?: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const brightColor = useMemo(() => new THREE.Color(accentColor).multiplyScalar(1.4), [accentColor]);
  const warpColor = useMemo(() => new THREE.Color(accentLight).multiplyScalar(1.2), [accentLight]);
  const keteGeo = useMemo(() => buildKeteGeometry(), []);

  // Horizontal weave band positions along the body height
  const bandHeights = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < swirlCount; i++) {
      // distribute from y=-0.85 (just above base) to y=0.78 (just below rim)
      const t = i / (swirlCount - 1);
      arr.push(-0.85 + t * 1.63);
    }
    return arr;
  }, [swirlCount]);

  // Approximate radius at a given y (matches buildKeteGeometry profile)
  const radiusAt = (y: number) => {
    if (y >= 0.85) return 1.0;
    if (y >= 0.5)  return 0.98 + (y - 0.5) * 0.057;
    if (y >= 0.1)  return 0.93 + (y - 0.1) * 0.125;
    if (y >= -0.3) return 0.85 + (y + 0.3) * 0.2;
    if (y >= -0.7) return 0.72 + (y + 0.7) * 0.325;
    return 0.55 + (y + 1.0) * 0.566;
  };

  // Vertical warp positions around the body (whenu)
  const warpAngles = useMemo(() => {
    const n = 16;
    return Array.from({ length: n }, (_, i) => (i / n) * Math.PI * 2);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.25;
      groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.08;
    }
    if (haloRef.current) {
      const sparkle = 0.6 + 0.4 * Math.sin(t * 2.5);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = sparkle * 0.22;
    }
  });

  return (
    <group>
      {/* Pulsing colour halo behind the kete */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.55, 32, 32]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.22} depthWrite={false} />
      </mesh>

      <group ref={groupRef}>
        {/* Glass kete body (lathed profile) */}
        <mesh geometry={keteGeo} castShadow>
          <MeshTransmissionMaterial
            color={brightColor}
            transmission={0.78}
            roughness={0.02}
            clearcoat={1}
            clearcoatRoughness={0.01}
            ior={1.55}
            samples={12}
            distortion={0.35}
            temporalDistortion={0.15}
            envMapIntensity={4.5}
            chromaticAberration={0.05}
            thickness={0.55}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Rim lip — a brighter ring on top */}
        <mesh position={[0, 0.96, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.0, 0.045, 16, 96]} />
          <meshStandardMaterial
            color={warpColor}
            metalness={0.4}
            roughness={0.25}
            emissive={accentLight}
            emissiveIntensity={0.35}
          />
        </mesh>

        {/* Horizontal weave bands (whatu) — slim torus rings hugging the body */}
        {bandHeights.map((y, i) => {
          const r = radiusAt(y) + 0.012; // sit just outside the surface
          return (
            <mesh key={`band-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[r, 0.022, 10, 80]} />
              <meshStandardMaterial
                color={brightColor}
                metalness={0.55}
                roughness={0.35}
                emissive={accentColor}
                emissiveIntensity={0.18}
                transparent
                opacity={0.92}
              />
            </mesh>
          );
        })}

        {/* Vertical warp threads (whenu) — thin curved strips */}
        {warpAngles.map((angle, i) => {
          // Build a curved strip along the body profile
          const points: THREE.Vector3[] = [];
          for (let s = 0; s <= 12; s++) {
            const ty = -0.85 + (s / 12) * 1.63;
            const r = radiusAt(ty) + 0.005;
            points.push(new THREE.Vector3(Math.cos(angle) * r, ty, Math.sin(angle) * r));
          }
          const curve = new THREE.CatmullRomCurve3(points);
          return (
            <mesh key={`warp-${i}`}>
              <tubeGeometry args={[curve, 24, 0.012, 6, false]} />
              <meshStandardMaterial
                color={warpColor}
                metalness={0.5}
                roughness={0.4}
                emissive={accentLight}
                emissiveIntensity={0.22}
                transparent
                opacity={0.75}
              />
            </mesh>
          );
        })}

        {/* Two arched handles (kawe) — front & back */}
        {[0, Math.PI].map((rot, i) => (
          <group key={`handle-${i}`} rotation={[0, rot, 0]}>
            <mesh position={[0, 1.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
              {/* half-torus arched above the rim */}
              <torusGeometry args={[0.32, 0.038, 12, 48, Math.PI]} />
              <meshStandardMaterial
                color={warpColor}
                metalness={0.45}
                roughness={0.3}
                emissive={accentLight}
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        ))}

        {/* Specular catch-light on the upper-left of the body */}
        <mesh position={[-0.42, 0.5, 0.65]}>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.55} />
        </mesh>

        {/* Smaller secondary highlight */}
        <mesh position={[0.35, -0.15, 0.7]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} />
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
  swirlCount = 9,
}) => {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* CSS ambient halo behind the kete */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor}40 0%, ${accentColor}15 40%, transparent 72%)`,
          filter: "blur(28px)",
          transform: "scale(1.4)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0.15, 3.4], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        {/* Studio lighting matched to GlassKoruHero */}
        <Environment preset="studio" environmentIntensity={0.85} />
        <ambientLight intensity={1.1} color="#F8F6F0" />
        <directionalLight position={[8, 8, 5]} intensity={2.0} color="#FFFFFF" />
        <directionalLight position={[-5, 3, 8]} intensity={1.0} color="#D4F0F0" />
        <directionalLight position={[3, -3, 6]} intensity={0.6} color="#FFFBE8" />
        <pointLight position={[0, 0, 6]} intensity={1.0} color="#FFFFFF" />

        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
            <KeteBody
              accentColor={accentColor}
              accentLight={accentLight}
              swirlCount={swirlCount}
            />
          </Float>

          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.45}
            scale={3.2}
            blur={2.6}
            far={2.2}
            color="#1a1d29"
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GlassKeteSphere;
