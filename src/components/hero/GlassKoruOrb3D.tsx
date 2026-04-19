import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial } from "@react-three/drei";

/* Engraved koru spiral suspended inside the orb */
function KoruSpiral() {
  const groupRef = React.useRef<THREE.Group>(null);

  const spiralPoints = React.useMemo(() => {
    const points: THREE.Vector3[] = [];
    const turns = 3.1;
    const maxR = 0.62;

    for (let i = 0; i < 240; i++) {
      const t = i / 239;
      const angle = turns * Math.PI * 2 * t;
      const radius = maxR * (1 - t) * 0.95 + 0.06;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      points.push(new THREE.Vector3(x, y, 0));
    }

    return points.reverse();
  }, []);

  const curve = React.useMemo(
    () => new THREE.CatmullRomCurve3(spiralPoints),
    [spiralPoints]
  );
  const tube = React.useMemo(
    () => new THREE.TubeGeometry(curve, 240, 0.045, 32, false),
    [curve]
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.z = t * 0.08;
      groupRef.current.position.y = Math.sin(t * 0.9) * 0.015;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={tube} position={[0, 0, 0.01]}>
        <meshPhysicalMaterial
          color="#F3FFFD"
          roughness={0.18}
          transmission={0.2}
          thickness={0.3}
          transparent
          opacity={0.95}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          ior={1.35}
        />
      </mesh>
      {/* Soft inner bulb at the spiral centre */}
      <mesh position={[0, 0, 0.02]}>
        <sphereGeometry args={[0.07, 32, 32]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          roughness={0.25}
          transmission={0.3}
          thickness={0.2}
          transparent
          opacity={0.85}
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
      orbRef.current.rotation.y = Math.sin(t * 0.25) * 0.12;
      orbRef.current.rotation.x = Math.cos(t * 0.2) * 0.05;
    }
  });

  return (
    <Float
      speed={0.9}
      rotationIntensity={0.05}
      floatIntensity={0.25}
      floatingRange={[-0.04, 0.04]}
    >
      <group ref={orbRef}>
        {/* Engraved koru inside */}
        <KoruSpiral />

        {/* Outer glass shell */}
        <mesh>
          <sphereGeometry args={[1.35, 128, 128]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.55}
            transmission={1}
            roughness={0.08}
            ior={1.32}
            chromaticAberration={0.025}
            anisotropy={0.1}
            distortion={0.02}
            distortionScale={0.15}
            temporalDistortion={0.02}
            color="#E8F7F4"
            attenuationColor="#BFE4DD"
            attenuationDistance={4.5}
          />
        </mesh>

        {/* Soft iridescent highlight */}
        <mesh position={[-0.45, 0.55, 0.9]}>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.18} />
        </mesh>
        <mesh position={[0.55, -0.4, 0.85]}>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshBasicMaterial color="#D8F2EC" transparent opacity={0.22} />
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
        {/* Soft, even lighting — no harsh reflections */}
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 4, 5]} intensity={0.55} color="#FFFFFF" />
        <directionalLight position={[-4, -2, 3]} intensity={0.3} color="#E0F2EE" />
        <directionalLight position={[0, 5, -3]} intensity={0.2} color="#F4FBF9" />
        <pointLight position={[0, 0, 3]} intensity={0.35} color="#FFFFFF" />
        <Environment preset="apartment" />
        <GlassOrb />
      </Canvas>
    </div>
  );
}
