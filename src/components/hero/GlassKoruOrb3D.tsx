import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Lightformer, Environment } from "@react-three/drei";

const orbPalette = {
  filament: "#4AA5A8",      // soft teal — visible filaments
  filamentSoft: "#A8DDDB",  // ice mist halo
  core: "#FFFFFF",          // bright white core
  shell: "#D4ECEA",         // tinted glass shell — visible against white bg
  shellTint: "#7FC8C2",     // deeper teal for sheen
  rim: "#5FB8B5",           // rim accent
};

/* ──────────────────────────────────────────────────────────
   Luminous filament koru — delicate glowing energy spiral
   suspended inside the orb, like the reference image.
   ────────────────────────────────────────────────────────── */
function LuminousFilament() {
  const groupRef = React.useRef<THREE.Group>(null);
  const coreRef = React.useRef<THREE.Mesh>(null);

  // Build several thin glowing spiral filaments
  const filaments = React.useMemo(() => {
    const tubes: THREE.BufferGeometry[] = [];
    const filamentCount = 5;

    for (let f = 0; f < filamentCount; f++) {
      const points: THREE.Vector3[] = [];
      const turns = 2.4 + f * 0.15;
      const phaseOffset = (f / filamentCount) * Math.PI * 2;
      const a = 0.04;
      const b = 0.19;
      const steps = 220;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const theta = turns * Math.PI * 2 * t + phaseOffset;
        const r = a * Math.exp(b * theta);
        // gentle 3D wobble out of plane
        const z = Math.sin(theta * 1.2 + f) * 0.04 * t;
        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r;
        points.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      tubes.push(new THREE.TubeGeometry(curve, 240, 0.006, 10, false));
    }
    return tubes;
  }, []);

  // Particle cloud surrounding the filament — gives the misty glow
  const particles = React.useMemo(() => {
    const count = 800;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // distribute in a flattened disc inside the orb
      const r = Math.pow(Math.random(), 0.6) * 0.7;
      const theta = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 0.18;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = Math.sin(theta) * r;
      positions[i * 3 + 2] = z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.z = t * 0.08;
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(t * 1.6) * 0.08;
      coreRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Spiral filaments */}
      {filaments.map((geo, i) => (
        <mesh key={i} geometry={geo}>
            <meshPhysicalMaterial
              color={orbPalette.filament}
            transparent
              opacity={0.72}
              roughness={0.14}
              metalness={0}
              clearcoat={1}
              clearcoatRoughness={0.08}
              emissive={orbPalette.filamentSoft}
              emissiveIntensity={0.1}
              toneMapped={false}
          />
        </mesh>
      ))}

      {/* Particle haze */}
      <points geometry={particles}>
        <pointsMaterial
          color={orbPalette.filamentSoft}
          size={0.012}
          sizeAttenuation
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>

      {/* Bright pulsing core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.04, 32, 32]} />
        <meshBasicMaterial color={orbPalette.core} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.09, 32, 32]} />
        <meshBasicMaterial
          color={orbPalette.filament}
          transparent
          opacity={0.18}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
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
        <LuminousFilament />

        {/* Outer crystal shell — tinted teal so it's visible on white bg */}
        <mesh>
          <sphereGeometry args={[1.35, 128, 128]} />
          <meshPhysicalMaterial
            color={orbPalette.shell}
            transparent
            opacity={0.55}
            transmission={0.7}
            thickness={0.4}
            roughness={0.05}
            metalness={0}
            ior={1.18}
            clearcoat={1}
            clearcoatRoughness={0.02}
            reflectivity={0.18}
            sheen={0.5}
            sheenColor={orbPalette.shellTint}
          />
        </mesh>

        {/* Inner teal glow layer */}
        <mesh>
          <sphereGeometry args={[1.16, 64, 64]} />
          <meshBasicMaterial color={orbPalette.shellTint} transparent opacity={0.22} toneMapped={false} />
        </mesh>

        {/* Outer rim glow — defines the sphere edge */}
        <mesh scale={[1.04, 1.04, 1.04]}>
          <sphereGeometry args={[1.35, 64, 64]} />
          <meshBasicMaterial color={orbPalette.rim} transparent opacity={0.15} toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Soft white specular highlights */}
        <mesh position={[-0.5, 0.6, 0.85]}>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshBasicMaterial color={orbPalette.core} transparent opacity={0.6} toneMapped={false} />
        </mesh>
        <mesh position={[0.55, -0.45, 0.85]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshBasicMaterial color={orbPalette.core} transparent opacity={0.4} toneMapped={false} />
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
