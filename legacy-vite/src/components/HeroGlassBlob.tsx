import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * Glass "jack" / asterisk — 6 intersecting capsules meeting at a sphere.
 * Inspired by the crystalline glass asterisk Pinterest reference.
 */
function GlassJack() {
  const groupRef = useRef<THREE.Group>(null);
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const mouseCurrent = useRef(new THREE.Vector2(0, 0));

  const capsuleGeo = useMemo(() => new THREE.CapsuleGeometry(0.28, 1.8, 16, 32), []);
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.45, 32, 32), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseTarget.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.15 * delta;
    groupRef.current.rotation.x += 0.05 * delta;
    mouseCurrent.current.lerp(mouseTarget.current, 0.025);
    groupRef.current.rotation.z = mouseCurrent.current.x * 0.12;
    groupRef.current.rotation.x += mouseCurrent.current.y * 0.06;
  });

  const matProps = {
    backside: true,
    samples: 8,
    thickness: 0.8,
    chromaticAberration: 0.06,
    anisotropy: 0.2,
    distortion: 0.1,
    distortionScale: 0.2,
    temporalDistortion: 0.1,
    transmission: 1,
    roughness: 0.05,
    ior: 1.5,
    color: "#f0f8ff",
    attenuationColor: "#dff5f5",
    attenuationDistance: 3.5,
  };

  const arms: [number, number, number][] = [
    [0, 0, 0],
    [0, 0, Math.PI / 2],
    [Math.PI / 2, 0, 0],
    [Math.PI / 4, 0, Math.PI / 4],
    [-Math.PI / 4, 0, Math.PI / 4],
    [Math.PI / 4, Math.PI / 4, 0],
  ];

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.5} floatingRange={[-0.12, 0.12]}>
      <group ref={groupRef} scale={1.1}>
        <mesh geometry={sphereGeo}>
          <MeshTransmissionMaterial {...matProps} />
        </mesh>
        {arms.map((rot, i) => (
          <mesh key={i} geometry={capsuleGeo} rotation={rot}>
            <MeshTransmissionMaterial {...matProps} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default function HeroGlassBlob({ className = "" }: { className?: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`w-full h-full ${className}`}
      style={{ opacity: loaded ? 1 : 0, transition: "opacity 1.2s ease-out" }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onCreated={() => setTimeout(() => setLoaded(true), 300)}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-4, -2, 3]} intensity={0.4} color="#e8f4f4" />
        <directionalLight position={[0, 5, -3]} intensity={0.3} color="#f0f0ff" />
        <Environment preset="studio" />
        <GlassJack />
      </Canvas>
    </div>
  );
}
