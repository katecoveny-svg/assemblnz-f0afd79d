'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Edges } from '@react-three/drei';

/**
 * The homepage hero — a wide white studio scene with real depth.
 *
 * A silk-wave floor rolls softly under a structure that ASSEMBLES from
 * parts: chrome core, glass knowledge cubes, frosted memory cube, ability
 * capsules, connector tile and an evaluation ring fly in on staggered
 * paths and lock into the shape of an assembled agent — the same anatomy
 * the studio (/studio) teaches.
 *
 * Composition notes (2026-07-19 fix):
 * - Glass cubes carry faint graphite Edges so they read on a white ground
 *   instead of dissolving into flat rectangles.
 * - Parts are arranged asymmetrically — deliberately NOT two capsules
 *   under the sphere (which read as a face).
 * - The whole structure is scaled + framed to fit the band with margin,
 *   so nothing clips at the fold and the headline below stays high.
 *
 * Decorative only: aria-hidden, no WebGL text, all page copy still comes
 * from COPY.md surfaces below.
 */

interface MeshLike {
  position: { x: number; y: number; z: number; set: (x: number, y: number, z: number) => void };
  rotation: { x: number; y: number; z: number };
  scale: { setScalar: (s: number) => void };
}
interface GroupLike {
  rotation: { x: number; y: number; z: number };
}
interface GeoLike {
  attributes: { position: { array: Float32Array; needsUpdate: boolean; count: number } };
  computeVertexNormals?: () => void;
}
interface WaveMeshLike extends MeshLike {
  geometry?: GeoLike;
  userData: { base?: Float32Array };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface PartSpec {
  id: string;
  from: [number, number, number];
  to: [number, number, number];
  rotation?: [number, number, number];
  delay: number;
  duration: number;
  kind: 'core' | 'cube-clear' | 'cube-frost' | 'capsule' | 'tile' | 'ring';
}

/**
 * Assembled layout — asymmetric on purpose. Core sits high-centre; the
 * knowledge cubes stagger down the left; memory floats behind-right;
 * one capsule stands vertical at front-left, the other lies low at
 * front-right; the tile leans in from the right; the ring underlines
 * the whole structure.
 */
const PARTS: PartSpec[] = [
  { id: 'core',   kind: 'core',       from: [0, 6.5, -2],     to: [0, 0.75, 0],        delay: 0.15, duration: 1.0 },
  { id: 'kn-1',   kind: 'cube-clear', from: [-7, 3.2, -3],    to: [-1.7, 0.15, 0.2],   delay: 0.55, duration: 0.9 },
  { id: 'kn-2',   kind: 'cube-clear', from: [-6.4, -2.2, 2],  to: [-2.25, -0.7, -0.6], delay: 0.75, duration: 0.9 },
  { id: 'memory', kind: 'cube-frost', from: [6.8, 3.8, -2.5], to: [1.9, 1.05, -0.95],  delay: 0.9,  duration: 0.9 },
  { id: 'ab-1',   kind: 'capsule',    from: [-4.5, -4, 3.5],  to: [-0.95, -0.6, 0.95], rotation: [0, 0, 0],            delay: 1.1,  duration: 0.85 },
  { id: 'ab-2',   kind: 'capsule',    from: [4.8, -3.6, 3.2], to: [1.3, -0.85, 0.7],   rotation: [0, 0.4, Math.PI / 2], delay: 1.25, duration: 0.85 },
  { id: 'tile',   kind: 'tile',       from: [7.5, -1.5, 1.5], to: [2.45, 0.05, 0.25],  rotation: [0, -0.5, 0],          delay: 1.45, duration: 0.85 },
  { id: 'ring',   kind: 'ring',       from: [0, -5.5, -1],    to: [0, -1.15, 0],       delay: 1.6,  duration: 0.95 },
];

function PartMesh({ spec, reducedMotion, t0 }: { spec: PartSpec; reducedMotion: boolean; t0: number }) {
  const ref = useRef<MeshLike | null>(null);
  const settled = useRef(reducedMotion);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    if (reducedMotion || settled.current) {
      mesh.position.set(spec.to[0], spec.to[1], spec.to[2]);
      return;
    }
    const elapsed = clock.getElapsedTime() - t0 - spec.delay;
    const t = Math.max(0, Math.min(1, elapsed / spec.duration));
    const e = easeOutCubic(t);
    mesh.position.set(
      spec.from[0] + (spec.to[0] - spec.from[0]) * e,
      spec.from[1] + (spec.to[1] - spec.from[1]) * e,
      spec.from[2] + (spec.to[2] - spec.from[2]) * e,
    );
    if (t >= 1) settled.current = true;
  });

  const rot = spec.rotation ?? [0, 0, 0];

  switch (spec.kind) {
    case 'core':
      return (
        <mesh ref={ref as unknown as never} position={spec.from} scale={0.82}>
          <sphereGeometry args={[0.95, 96, 96]} />
          <meshPhysicalMaterial
            color="#EDEFF1" metalness={1} roughness={0.05}
            clearcoat={1} clearcoatRoughness={0.05}
            iridescence={0.5} iridescenceIOR={1.3} iridescenceThicknessRange={[100, 600]}
            envMapIntensity={1.25}
          />
        </mesh>
      );
    case 'cube-clear':
      return (
        <mesh ref={ref as unknown as never} position={spec.from} scale={0.66}>
          <boxGeometry args={[0.85, 0.85, 0.85, 4, 4, 4]} />
          <meshPhysicalMaterial
            color="#EDF2F2" metalness={0} roughness={0.12}
            transmission={0.7} ior={1.5} thickness={0.8}
            clearcoat={1} envMapIntensity={1.1}
          />
          {/* Faint graphite edge so the cube reads on a white ground. */}
          <Edges scale={1.002} color="#9AA0A2" threshold={30} />
        </mesh>
      );
    case 'cube-frost':
      return (
        <mesh ref={ref as unknown as never} position={spec.from} scale={0.56}>
          <boxGeometry args={[0.85, 0.85, 0.85, 4, 4, 4]} />
          <meshPhysicalMaterial
            color="#EEF1F1" metalness={0} roughness={0.55}
            transmission={0.6} ior={1.45} thickness={0.7}
            clearcoat={1} envMapIntensity={1.05}
          />
          <Edges scale={1.002} color="#A8AEB0" threshold={30} />
        </mesh>
      );
    case 'capsule':
      return (
        <mesh ref={ref as unknown as never} position={spec.from} rotation={rot} scale={0.9}>
          <capsuleGeometry args={[0.2, 0.55, 12, 24]} />
          <meshPhysicalMaterial
            color="#DDE1E4" metalness={1} roughness={0.07}
            clearcoat={1} envMapIntensity={1.2}
          />
        </mesh>
      );
    case 'tile':
      return (
        <mesh ref={ref as unknown as never} position={spec.from} rotation={rot}>
          <boxGeometry args={[0.72, 0.5, 0.09]} />
          <meshPhysicalMaterial
            color="#D9C9A3" metalness={0.75} roughness={0.22}
            clearcoat={1} envMapIntensity={1.15}
          />
          <Edges scale={1.004} color="#B5A47C" threshold={30} />
        </mesh>
      );
    case 'ring':
      return (
        <mesh ref={ref as unknown as never} position={spec.from} rotation={[Math.PI / 2.25, 0, 0]}>
          <torusGeometry args={[1.7, 0.05, 20, 140]} />
          <meshPhysicalMaterial
            color="#93BBB4" metalness={0.85} roughness={0.12}
            clearcoat={1} envMapIntensity={1.2}
          />
        </mesh>
      );
  }
}

/** The silk floor — a broad plane with slow two-octave waves. White on
 *  white; depth comes from shading + fog, not colour. */
function WaveFloor({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<WaveMeshLike | null>(null);
  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh?.geometry || reducedMotion) return;
    const pos = mesh.geometry.attributes.position;
    if (!mesh.userData.base) mesh.userData.base = new Float32Array(pos.array);
    const base = mesh.userData.base;
    const t = clock.getElapsedTime() * 0.35;
    const arr = pos.array;
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const w1 = Math.sin(bx * 0.55 + t * 1.2) * Math.cos(by * 0.45 + t * 0.8);
      const w2 = Math.sin(bx * 1.3 + t * 0.55) * Math.cos(by * 1.1 + t * 0.5) * 0.35;
      arr[i * 3 + 2] = (w1 + w2) * 0.22;
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals?.();
  });
  return (
    <mesh ref={ref as unknown as never} rotation={[-Math.PI / 2.15, 0, 0]} position={[0, -1.75, -2]}>
      <planeGeometry args={[38, 26, 130, 90]} />
      <meshStandardMaterial color="#FAFAF7" metalness={0.08} roughness={0.75} />
    </mesh>
  );
}

/** Pointer parallax — the whole structure leans very slightly with the
 *  cursor so the scene reads deep, not printed. */
function ParallaxGroup({ children, reducedMotion }: { children: React.ReactNode; reducedMotion: boolean }) {
  const ref = useRef<GroupLike | null>(null);
  useFrame(({ pointer }) => {
    const g = ref.current;
    if (!g || reducedMotion) return;
    g.rotation.y += ((pointer.x * 0.07) - g.rotation.y) * 0.04;
    g.rotation.x += ((-pointer.y * 0.04) - g.rotation.x) * 0.04;
  });
  return <group ref={ref as unknown as never}>{children}</group>;
}

function SceneContents({ reducedMotion }: { reducedMotion: boolean }) {
  const t0 = useMemo(() => 0, []);
  return (
    <>
      <fog attach="fog" args={['#FBFAF6', 8, 22]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 7, 4]} intensity={1.25} color="#FFFFFF" />
      <directionalLight position={[-6, 3, -3]} intensity={0.7} color="#EDF3F8" />
      <directionalLight position={[0, -2, 5]} intensity={0.4} color="#FFF6EA" />
      <Environment preset="studio" background={false} />

      <WaveFloor reducedMotion={reducedMotion} />

      <ParallaxGroup reducedMotion={reducedMotion}>
        {/* Scaled + raised so the assembled structure fits the band with
            clear margin — nothing clips at the fold. */}
        <group scale={0.82} position={[0, 0.28, 0]}>
          {PARTS.map((p) => (
            <PartMesh key={p.id} spec={p} reducedMotion={reducedMotion} t0={t0} />
          ))}
        </group>
      </ParallaxGroup>
    </>
  );
}

export function AssemblHeroScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      if (!c.getContext('webgl2') && !c.getContext('webgl')) setWebglOk(false);
    } catch {
      setWebglOk(false);
    }
  }, []);

  if (!webglOk) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none relative h-[42vh] min-h-[300px] w-full overflow-hidden md:h-[50vh] md:max-h-[520px]"
      style={{ background: '#FBFAF6' }}
    >
      <Canvas
        camera={{ position: [0.5, 0.7, 6.6], fov: 36, rotation: [0.02, 0.04, 0] }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'auto' }}
      >
        <Suspense fallback={null}>
          <SceneContents reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
        style={{ background: 'linear-gradient(180deg, rgba(251,250,246,0) 0%, #fbfaf6 100%)' }}
      />
    </div>
  );
}
