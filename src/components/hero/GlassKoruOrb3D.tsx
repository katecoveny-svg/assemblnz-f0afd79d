import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Lightformer, Environment } from "@react-three/drei";

/* ──────────────────────────────────────────────────────────
   Engraved koru — proper unfurling fern frond.
   Logarithmic spiral that tightens to a centre bulb (pītau).
   ────────────────────────────────────────────────────────── */
function KoruSpiral() {
  const groupRef = React.useRef<THREE.Group>(null);

  const tube = React.useMemo(() => {
    const points: THREE.Vector3[] = [];
    // Logarithmic koru spiral: r = a * e^(b*θ)
    const a = 0.045;
    const b = 0.18;
    const turns = 2.6;
    const steps = 260;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const theta = turns * Math.PI * 2 * t;
      const r = a * Math.exp(b * theta);
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      points.push(new THREE.Vector3(x, y, 0));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    // Tapered radius: thicker at outer end, fine at the centre
    const segs = 280;
    return new THREE.TubeGeometry(curve, segs, 0.038, 24, false);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.z = t * 0.06;
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.012;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh geometry={tube}>
        <meshPhysicalMaterial
          color="#FFFFFF"
          emissive="#E8F7F4"
          emissiveIntensity={0.35}
          roughness={0.35}
          metalness={0}
          clearcoat={0.4}
          clearcoatRoughness={0.4}
          transparent
          opacity={0.96}
        />
      </mesh>
      {/* Pītau — soft bulb at the centre of the koru */}
      <mesh position={[0, 0, 0.005]}>
        <sphereGeometry args={[0.055, 32, 32]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          emissive="#D9F1EC"
          emissiveIntensity={0.5}
          roughness={0.3}
          transparent
          opacity={0.95}
        />
      </mesh>
    </group>
  );
}

/* Pale translucent sea-glass orb */
function GlassOrb() {
  const orbRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (orbRef.current) {
      orbRef.current.rotation.y = Math.sin(t * 0.25) * 0.1;
      orbRef.current.rotation.x = Math.cos(t * 0.2) * 0.04;
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
        {/* Engraved koru inside */}
        <KoruSpiral />

        {/* Outer glass shell — pale translucent teal */}
        <mesh>
          <sphereGeometry args={[1.35, 128, 128]} />
          <MeshTransmissionMaterial
            backside
            samples={6}
            thickness={0.35}
            transmission={1}
            roughness={0.05}
            ior={1.28}
            chromaticAberration={0.015}
            anisotropy={0.05}
            distortion={0.01}
            distortionScale={0.1}
            temporalDistortion={0.01}
            color="#F0FAF8"
            attenuationColor="#E4F4F0"
            attenuationDistance={6}
          />
        </mesh>

        {/* Soft iridescent highlights */}
        <mesh position={[-0.45, 0.55, 0.9]}>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.22} />
        </mesh>
        <mesh position={[0.55, -0.4, 0.85]}>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshBasicMaterial color="#E4F4F0" transparent opacity={0.25} />
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
        {/* Bright, even lighting — keeps the orb pale, never dark */}
        <ambientLight intensity={1.3} />
        <directionalLight position={[3, 4, 5]} intensity={0.7} color="#FFFFFF" />
        <directionalLight position={[-4, -2, 3]} intensity={0.45} color="#F0FAF8" />
        <directionalLight position={[0, 5, -3]} intensity={0.35} color="#FFFFFF" />
        <pointLight position={[0, 0, 3]} intensity={0.5} color="#FFFFFF" />

        {/* Custom bright environment — no dark reflections */}
        <Environment resolution={256}>
          <Lightformer
            intensity={2}
            color="#FFFFFF"
            position={[0, 5, -2]}
            scale={[10, 10, 1]}
          />
          <Lightformer
            intensity={1.5}
            color="#F0FAF8"
            position={[5, 0, 2]}
            scale={[8, 8, 1]}
          />
          <Lightformer
            intensity={1.5}
            color="#FFFFFF"
            position={[-5, 0, 2]}
            scale={[8, 8, 1]}
          />
          <Lightformer
            intensity={1.2}
            color="#E4F4F0"
            position={[0, -5, 2]}
            scale={[10, 10, 1]}
          />
        </Environment>

        <GlassOrb />
      </Canvas>
    </div>
  );
}
