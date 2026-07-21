'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Group, Points } from 'three';
import * as THREE from 'three';

import styles from './editorial-home.module.css';

function makeParticles(count: number, radius: number, seed: number) {
  let value = seed;
  const random = () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };

  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const noise = 0.62 + random() * 0.58;
    const r = radius * noise;
    positions[index * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.82;
    positions[index * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

function BloomScene() {
  const group = useRef<Group>(null);
  const sparks = useRef<Points>(null);
  const outerParticles = useMemo(() => makeParticles(760, 1.65, 41), []);
  const emberParticles = useMemo(() => makeParticles(180, 0.92, 73), []);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.075;
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        state.pointer.y * 0.09,
        0.025,
      );
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        state.pointer.x * -0.11,
        0.025,
      );
    }
    if (sparks.current) sparks.current.rotation.y -= delta * 0.045;
  });

  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 5, 4]} intensity={1.6} color="#ffffff" />
      <pointLight position={[0.4, -0.1, 1.1]} intensity={18} distance={5} color="#ef9f55" />
      <pointLight position={[-0.9, 0.4, -0.4]} intensity={8} distance={4} color="#c97945" />

      <group ref={group} rotation={[0.06, -0.22, -0.1]}>
        <mesh scale={[1.32, 1.04, 1.18]}>
          <icosahedronGeometry args={[1.35, 5]} />
          <meshPhysicalMaterial
            color="#2e302f"
            roughness={0.28}
            metalness={0.72}
            transparent
            opacity={0.32}
            wireframe
          />
        </mesh>

        <mesh rotation={[0.8, 0.2, 0.5]} scale={[1.18, 0.88, 1.08]}>
          <torusKnotGeometry args={[0.98, 0.018, 230, 18, 3, 5]} />
          <meshStandardMaterial color="#777a77" metalness={0.72} roughness={0.3} transparent opacity={0.58} />
        </mesh>

        <mesh rotation={[0.2, -0.75, 1.1]} scale={[1.3, 1.1, 1.28]}>
          <torusKnotGeometry args={[0.86, 0.012, 210, 14, 2, 7]} />
          <meshStandardMaterial color="#b2b2ac" metalness={0.86} roughness={0.22} transparent opacity={0.46} />
        </mesh>

        <mesh scale={[0.8, 0.58, 0.72]} position={[0.22, -0.08, 0.16]}>
          <dodecahedronGeometry args={[1, 4]} />
          <meshPhysicalMaterial
            color="#5c4538"
            emissive="#a44d25"
            emissiveIntensity={1.35}
            roughness={0.4}
            metalness={0.15}
            transparent
            opacity={0.58}
          />
        </mesh>

        <points ref={sparks}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[outerParticles, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#5f625f" size={0.014} sizeAttenuation transparent opacity={0.78} />
        </points>

        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[emberParticles, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#f0a05f" size={0.032} sizeAttenuation transparent opacity={0.96} />
        </points>
      </group>
    </>
  );
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function GenerativeBloom() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(hasWebGL()));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={styles.bloomStage} aria-hidden>
      <div className={styles.bloomFallback}>
        <i />
        <i />
        <i />
        <span />
      </div>
      {ready ? (
        <Canvas
          className={styles.bloomCanvas}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0.08, 4.4], fov: 44 }}
        >
          <BloomScene />
        </Canvas>
      ) : null}
    </div>
  );
}
