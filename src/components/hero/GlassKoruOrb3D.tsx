import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

/* Engraved Archimedean koru spiral disc */
function EngravedSpiralDisc() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const a = 0.05;
    const b = 0.11;
    const ribbon = 0.055;
    const turns = 3.4;
    const steps = 260;

    const outer: THREE.Vector2[] = [];
    const inner: THREE.Vector2[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2 * turns;
      const r = a + b * t * 0.12;
      outer.push(new THREE.Vector2(Math.cos(t) * (r + ribbon), Math.sin(t) * (r + ribbon)));
      inner.push(new THREE.Vector2(Math.cos(t) * Math.max(r - ribbon, 0.01), Math.sin(t) * Math.max(r - ribbon, 0.01)));
    }

    shape.moveTo(outer[0].x, outer[0].y);
    outer.forEach((p) => shape.lineTo(p.x, p.y));
    for (let i = inner.length - 1; i >= 0; i--) shape.lineTo(inner[i].x, inner[i].y);
    shape.lineTo(outer[0].x, outer[0].y);

    const bulb = new THREE.Path();
    bulb.absarc(0, 0, 0.085, 0, Math.PI * 2, false);
    shape.holes.push(bulb);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 4,
      curveSegments: 64,
    });
    geo.center();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[0, 0, -Math.PI / 6]} scale={1.4}>
      <MeshTransmissionMaterial
        backside
        samples={6}
        thickness={0.5}
        transmission={0.95}
        roughness={0.18}
        ior={1.42}
        chromaticAberration={0.05}
        distortion={0.06}
        distortionScale={0.2}
        temporalDistortion={0.05}
        color="#e8f6f5"
        attenuationColor="#a8ddd9"
        attenuationDistance={2.2}
      />
    </mesh>
  );
}

/* Refractive glass orb wrapping the engraved disc */
function GlassOrb() {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.18;
  });

  return (
    <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.5} floatingRange={[-0.12, 0.12]}>
      <group ref={group}>
        <EngravedSpiralDisc />
        <mesh>
          <sphereGeometry args={[1.55, 96, 96]} />
          <MeshTransmissionMaterial
            backside
            samples={10}
            thickness={1.2}
            transmission={1}
            roughness={0.04}
            ior={1.5}
            chromaticAberration={0.12}
            distortion={0.08}
            distortionScale={0.25}
            temporalDistortion={0.05}
            color="#f3fbfa"
            attenuationColor="#cdeae8"
            attenuationDistance={3.6}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
        </mesh>
      </group>
    </Float>
  );
}

/* Sparkle bokeh particles */
function SparkleBokeh({ count = 110 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.2 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      positions[i * 3 + 2] = r * Math.cos(phi) - 1.2;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    pointsRef.current.rotation.y = t * 0.04;
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = 0.55 + Math.sin(t * 1.4) * 0.15;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        sizeAttenuation
        color="#ffffff"
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function GlassKoruOrb3D({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 38 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} />
        <directionalLight position={[-4, -2, 3]} intensity={0.45} color="#cdeae8" />
        <directionalLight position={[0, 6, -3]} intensity={0.35} color="#ffffff" />
        <pointLight position={[0, 0, 3]} intensity={0.6} color="#ffffff" />
        <Environment preset="studio" />
        <SparkleBokeh count={110} />
        <GlassOrb />
      </Canvas>
    </div>
  );
}
