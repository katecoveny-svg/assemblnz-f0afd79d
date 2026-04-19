import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Lightformer, Environment } from "@react-three/drei";

const orbPalette = {
  etch: "#FFFFFF",          // frosted etched koru line
  etchSoft: "#E8F6F3",      // soft halo around etch
  shell: "#A8DDDB",         // ice-teal glass shell
  shellTint: "#7FC8C2",     // teal sheen
  rim: "#4AA5A8",           // teal rim accent
};

/* ──────────────────────────────────────────────────────────
   Etched koru — a single frosted spiral engraved on the
   inner surface of the glass sphere (like sandblasted glass).
   ────────────────────────────────────────────────────────── */
function EtchedKoru() {
  const groupRef = React.useRef<THREE.Group>(null);

  // Build a single graceful koru spiral (logarithmic) that ends with
  // a small unfurling bulb tip — projected onto the inner sphere surface.
  const { mainCurve, bulbPosition } = React.useMemo(() => {
    const points: THREE.Vector3[] = [];
    const turns = 2.2;
    const a = 0.05;
    const b = 0.24;
    const steps = 320;
    const sphereR = 1.18; // sit just inside the glass shell

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const theta = turns * Math.PI * 2 * t;
      const r = a * Math.exp(b * theta);
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      // project onto front hemisphere of sphere
      const z2 = Math.max(0, sphereR * sphereR - x * x - y * y);
      const z = Math.sqrt(z2);
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return { mainCurve: curve, bulbPosition: points[points.length - 1] };
  }, []);

  const tubeGeo = React.useMemo(
    () => new THREE.TubeGeometry(mainCurve, 320, 0.012, 12, false),
    [mainCurve]
  );
  const tubeGlowGeo = React.useMemo(
    () => new THREE.TubeGeometry(mainCurve, 320, 0.022, 12, false),
    [mainCurve]
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // very subtle drift, like floating engraved glass
      groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.06;
      groupRef.current.rotation.z = Math.sin(t * 0.18) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Soft frosted halo around the etched line — gives the sandblasted look */}
      <mesh geometry={tubeGlowGeo}>
        <meshBasicMaterial
          color={orbPalette.etchSoft}
          transparent
          opacity={0.35}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* The crisp etched koru line — frosted white */}
      <mesh geometry={tubeGeo}>
        <meshStandardMaterial
          color={orbPalette.etch}
          roughness={0.85}
          metalness={0}
          emissive={orbPalette.etch}
          emissiveIntensity={0.25}
          toneMapped={false}
        />
      </mesh>

      {/* Koru tip bulb — the unfurling pith */}
      <mesh position={bulbPosition}>
        <sphereGeometry args={[0.05, 24, 24]} />
        <meshStandardMaterial
          color={orbPalette.etch}
          roughness={0.7}
          emissive={orbPalette.etch}
          emissiveIntensity={0.3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* Crystal-clear glass orb (not tinted — like the reference) */
function GlassOrb() {
  const orbRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (orbRef.current) {
      orbRef.current.rotation.y = Math.sin(t * 0.25) * 0.08;
      orbRef.current.rotation.x = Math.cos(t * 0.2) * 0.03;
    }
  });

  return (
    <Float
      speed={0.9}
      rotationIntensity={0.04}
      floatIntensity={0.22}
      floatingRange={[-0.04, 0.04]}
    >
      <group ref={orbRef}>
        <EtchedKoru />

        {/* Outer crystal shell — saturated teal so it's clearly visible on white bg */}
        <mesh>
          <sphereGeometry args={[1.35, 128, 128]} />
          <meshPhysicalMaterial
            color={orbPalette.shell}
            transparent
            opacity={0.45}
            transmission={0.78}
            thickness={0.45}
            roughness={0.08}
            metalness={0}
            ior={1.35}
            clearcoat={1}
            clearcoatRoughness={0.02}
            reflectivity={0.5}
            sheen={1}
            sheenColor={orbPalette.shellTint}
          />
        </mesh>

        {/* Outer rim glow — defines the sphere edge clearly */}
        <mesh scale={[1.06, 1.06, 1.06]}>
          <sphereGeometry args={[1.35, 64, 64]} />
          <meshBasicMaterial color={orbPalette.rim} transparent opacity={0.22} toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Soft white specular highlights */}
        <mesh position={[-0.5, 0.6, 0.85]}>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshBasicMaterial color={orbPalette.etch} transparent opacity={0.55} toneMapped={false} />
        </mesh>
        <mesh position={[0.55, -0.45, 0.85]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshBasicMaterial color={orbPalette.etch} transparent opacity={0.4} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

export default function GlassKoruOrb3D({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 38 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={2.4} />
        <hemisphereLight args={["#FCFFFE", "#E8F1EE", 1.15]} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} color="#FCFFFE" />
        <directionalLight position={[-4, -2, 3]} intensity={0.8} color="#F0F8F5" />
        <pointLight position={[0, 0, 3]} intensity={1} color="#FCFFFE" />

        {/* Bright white studio environment — keeps glass crystal-clear */}
        <Environment resolution={256}>
          <Lightformer intensity={4.4} color="#FCFFFE" position={[0, 5, -2]} scale={[14, 14, 1]} />
          <Lightformer intensity={3.2} color="#FCFFFE" position={[5, 0, 2]} scale={[12, 12, 1]} />
          <Lightformer intensity={3.2} color="#FCFFFE" position={[-5, 0, 2]} scale={[12, 12, 1]} />
          <Lightformer intensity={2.8} color="#F0F8F5" position={[0, -5, 2]} scale={[14, 14, 1]} />
          <Lightformer intensity={2.6} color="#FCFFFE" position={[0, 0, 6]} scale={[10, 10, 1]} />
        </Environment>

        <GlassOrb />
      </Canvas>
    </div>
  );
}
