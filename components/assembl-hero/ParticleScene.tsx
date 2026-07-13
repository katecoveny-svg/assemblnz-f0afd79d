'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  FORMATION_ORDER,
  GENOME_CLUSTER_POSITIONS,
  createLivingGenomeFormations,
} from '@/lib/formations/living-genome';

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

function getQuality() {
  if (typeof window === 'undefined') return { count: 2200, dpr: 1.25 };
  const memory = (navigator as NavigatorWithMemory).deviceMemory ?? 8;
  if (window.innerWidth < 620 || memory <= 4) return { count: 1250, dpr: 1 };
  if (window.innerWidth < 1100) return { count: 2200, dpr: 1.25 };
  return { count: 3600, dpr: 1.5 };
}

function ease(value: number) {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function LivingParticles({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const startedAt = useRef<number | null>(null);
  const [seed, setSeed] = useState(2707);
  useEffect(() => {
    queueMicrotask(() => {
      const stored = window.sessionStorage.getItem('assembl-genome-seed');
      if (stored) {
        setSeed(Number(stored));
        return;
      }
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      const created = (values[0] % 900_000) + 10_000;
      window.sessionStorage.setItem('assembl-genome-seed', String(created));
      setSeed(created);
    });
  }, []);
  const formations = useMemo(() => createLivingGenomeFormations(count, seed), [count, seed]);
  const colours = useMemo(() => {
    const output = new Float32Array(count * 3);
    const silver = new THREE.Color('#93a2aa');
    const opal = new THREE.Color('#b9d0d2');
    const gold = new THREE.Color('#d4af37');
    for (let index = 0; index < count; index += 1) {
      const colour = index % 31 === 0 ? gold : index % 4 === 0 ? opal : silver;
      output[index * 3] = colour.r;
      output[index * 3 + 1] = colour.g;
      output[index * 3 + 2] = colour.b;
    }
    return output;
  }, [count]);
  const geometry = useMemo(() => {
    const output = new THREE.BufferGeometry();
    output.setAttribute('position', new THREE.BufferAttribute(new Float32Array(formations.signal), 3));
    output.setAttribute('color', new THREE.BufferAttribute(colours, 3));
    return output;
  }, [colours, formations.signal]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    if (!pointsRef.current || document.hidden) return;
    const now = state.clock.getElapsedTime();
    if (startedAt.current === null) startedAt.current = now;
    const elapsed = reducedMotion ? 99 : now - (startedAt.current ?? now);
    const narrative = Math.max(0, elapsed - 0.7) / 2.05;
    const index = reducedMotion ? FORMATION_ORDER.length - 1 : Math.min(FORMATION_ORDER.length - 1, Math.floor(narrative));
    const nextIndex = Math.min(FORMATION_ORDER.length - 1, index + 1);
    const progress = reducedMotion ? 1 : ease(narrative - Math.floor(narrative));
    const from = formations[FORMATION_ORDER[index]];
    const to = formations[FORMATION_ORDER[nextIndex]];
    const pointerX = state.pointer.x * 2.65;
    const pointerY = state.pointer.y * 1.85;
    const influence = reducedMotion ? 0 : index === 2 ? 0.12 : 0.045;
    const settle = Math.min(1, delta * 8.5);
    const attribute = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const positions = attribute.array as Float32Array;

    for (let particle = 0; particle < count; particle += 1) {
      const offset = particle * 3;
      let x = THREE.MathUtils.lerp(from[offset], to[offset], progress);
      let y = THREE.MathUtils.lerp(from[offset + 1], to[offset + 1], progress);
      const z = THREE.MathUtils.lerp(from[offset + 2], to[offset + 2], progress);
      const dx = x - pointerX;
      const dy = y - pointerY;
      const distance = dx * dx + dy * dy;
      if (distance < 0.34 && distance > 0.001) {
        const force = influence * (0.34 - distance) / distance;
        x += dx * force;
        y += dy * force;
      }
      positions[offset] = THREE.MathUtils.lerp(positions[offset], x, settle);
      positions[offset + 1] = THREE.MathUtils.lerp(positions[offset + 1], y, settle);
      positions[offset + 2] = THREE.MathUtils.lerp(positions[offset + 2], z, settle);
    }
    attribute.needsUpdate = true;
    pointsRef.current.rotation.z = Math.sin(elapsed * 0.13) * 0.018;
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        vertexColors
        size={0.024}
        sizeAttenuation
        transparent
        opacity={0.82}
        depthWrite={false}
      />
    </points>
  );
}

function GenomeConnections({ reducedMotion }: { reducedMotion: boolean }) {
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const geometry = useMemo(() => {
    const positions: number[] = [];
    for (let index = 1; index < GENOME_CLUSTER_POSITIONS.length; index += 1) {
      const from = GENOME_CLUSTER_POSITIONS[index - 1];
      const to = GENOME_CLUSTER_POSITIONS[index];
      positions.push(...from, ...to);
    }
    const center = GENOME_CLUSTER_POSITIONS[5];
    [0, 2, 3, 7, 8].forEach((index) => positions.push(...center, ...GENOME_CLUSTER_POSITIONS[index]));
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return buffer;
  }, []);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const elapsed = clock.getElapsedTime();
    const reveal = reducedMotion ? 1 : THREE.MathUtils.smoothstep(elapsed, 10.2, 12.5);
    materialRef.current.opacity = reveal * (0.16 + Math.sin(elapsed * 0.8) * 0.025);
  });

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial ref={materialRef} color="#b8964f" transparent opacity={0} />
    </lineSegments>
  );
}

function AucklandUnderGlass({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const glassRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const city = useMemo(() => {
    const buildings: Array<{ x: number; z: number; height: number; width: number }> = [];
    for (let row = -3; row <= 3; row += 1) {
      for (let column = -5; column <= 5; column += 1) {
        if ((row + column) % 3 === 0 || Math.abs(column) > 4) continue;
        const distance = Math.sqrt(row * row + column * column);
        buildings.push({
          x: column * 0.22 + Math.sin(row * 2.1) * 0.04,
          z: row * 0.22,
          width: 0.07 + ((row * row + column * column) % 3) * 0.016,
          height: Math.max(0.08, 0.42 - distance * 0.047 + ((row - column + 9) % 4) * 0.035),
        });
      }
    }
    return buildings;
  }, []);
  const dataNodes = useMemo(
    () => [
      [-0.96, 0.23, -0.26],
      [-0.68, 0.34, 0.34],
      [-0.38, 0.27, -0.48],
      [0.35, 0.4, 0.36],
      [0.66, 0.31, -0.2],
      [0.92, 0.2, 0.28],
      [0.05, 0.26, 0.55],
    ] as Array<[number, number, number]>,
    [],
  );

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const reveal = reducedMotion ? 1 : THREE.MathUtils.smoothstep(elapsed, 10.1, 12.2);
    if (groupRef.current) {
      groupRef.current.scale.setScalar(0.82 + reveal * 0.18);
      groupRef.current.position.y = -0.7 + reveal * 0.2 + Math.sin(elapsed * 0.42) * 0.015;
      groupRef.current.rotation.y = Math.sin(elapsed * 0.16) * 0.045;
    }
    if (glassRef.current) glassRef.current.opacity = reveal * 0.22;
  });

  return (
    <group ref={groupRef} position={[0, -0.5, -0.08]} rotation-x={-0.16}>
      <mesh position={[0, -0.13, 0]} scale={[1.55, 0.06, 1]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshStandardMaterial color="#eef4f1" transparent opacity={0.82} roughness={0.78} />
      </mesh>
      {city.map((building, index) => (
        <mesh key={`${building.x}-${building.z}`} position={[building.x, building.height / 2 - 0.08, building.z]}>
          <boxGeometry args={[building.width, building.height, building.width]} />
          <meshStandardMaterial
            color={index % 7 === 0 ? '#d7e5e1' : '#e8edef'}
            metalness={0.16}
            roughness={0.42}
          />
        </mesh>
      ))}
      {dataNodes.map(([x, height, z], index) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, height / 2 - 0.05, 0]}>
            <cylinderGeometry args={[0.006, 0.006, height, 8]} />
            <meshBasicMaterial color="#d4af37" transparent opacity={0.58} />
          </mesh>
          <mesh position={[0, height - 0.05, 0]}>
            <sphereGeometry args={[index % 3 === 0 ? 0.032 : 0.023, 14, 10]} />
            <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={0.28} metalness={0.55} roughness={0.26} />
          </mesh>
        </group>
      ))}
      <group position={[0.08, 0.12, -0.05]}>
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.017, 0.028, 0.72, 12]} />
          <meshStandardMaterial color="#899aa0" metalness={0.62} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.075, 18, 14]} />
          <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={0.16} />
        </mesh>
      </group>
      <mesh position={[0, 0.18, 0]} scale={[1.58, 0.86, 1.04]}>
        <sphereGeometry args={[1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          ref={glassRef}
          color="#c5d7d9"
          transmission={0.96}
          thickness={0.42}
          ior={1.22}
          roughness={0.12}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Scene({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  return (
    <>
      <ambientLight intensity={1.85} />
      <directionalLight position={[3, 4, 5]} intensity={2.1} color="#ffffff" />
      <directionalLight position={[-4, 1, 2]} intensity={0.72} color="#dcebed" />
      <LivingParticles count={count} reducedMotion={reducedMotion} />
      <GenomeConnections reducedMotion={reducedMotion} />
      <AucklandUnderGlass reducedMotion={reducedMotion} />
    </>
  );
}

export default function ParticleScene({ reducedMotion }: { reducedMotion: boolean }) {
  const quality = useMemo(() => getQuality(), []);
  return (
    <Canvas
      dpr={[1, quality.dpr]}
      camera={{ position: [0, 0.1, 6.7], fov: 42 }}
      gl={{ alpha: true, antialias: quality.count > 1500, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
      aria-hidden
    >
      <Scene count={quality.count} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
