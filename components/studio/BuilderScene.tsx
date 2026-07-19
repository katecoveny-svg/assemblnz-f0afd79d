'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Edges } from '@react-three/drei';
import type { BuilderPicks } from '@/lib/studio/builder-options';

/**
 * The builder's live 3D preview. Starts EMPTY. Every pick adds exactly
 * one part, which scales up into place — the agent assembles in layers,
 * never all at once. Removing a pick removes its part.
 *
 * Part vocabulary (same anatomy as /studio and the homepage hero):
 *   job        → chrome core (the agent itself)
 *   knowledge  → clear glass cubes, docking left
 *   abilities  → chrome capsules, docking front
 *   apps       → warm tiles, docking right
 *   safety     → sea-glass ring + boundary shell
 */

interface MeshLike {
  position: { x: number; y: number; z: number; set: (x: number, y: number, z: number) => void };
  rotation: { x: number; y: number; z: number };
  scale: { setScalar: (s: number) => void };
}

function easeOutBack(t: number): number {
  const c1 = 1.20158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Scale-in animation on mount; scale-to-zero handled by unmount (parts
 *  simply disappear — restrained, no drama). */
function GrowIn({ children, reducedMotion, targetScale = 1 }: { children: React.ReactNode; reducedMotion: boolean; targetScale?: number }) {
  const ref = useRef<MeshLike | null>(null);
  const born = useRef<number | null>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    if (reducedMotion) { g.scale.setScalar(targetScale); return; }
    if (born.current === null) born.current = clock.getElapsedTime();
    const t = Math.min(1, (clock.getElapsedTime() - born.current) / 0.5);
    g.scale.setScalar(Math.max(0.0001, easeOutBack(t) * targetScale));
  });
  return <group ref={ref as unknown as never}>{children}</group>;
}

const KNOWLEDGE_SLOTS: [number, number, number][] = [
  [-1.7, 0.15, 0.2], [-2.25, -0.7, -0.6], [-1.5, 1.05, -0.7], [-2.5, 0.35, 0.6], [-1.9, -1.2, 0.4],
];
const ABILITY_SLOTS: [number, number, number][] = [
  [-0.95, -0.6, 0.95], [1.3, -0.85, 0.7], [0.2, -1.0, 1.2], [-0.3, -0.75, 1.45], [0.9, -0.55, 1.3],
];
const APP_SLOTS: [number, number, number][] = [
  [2.45, 0.05, 0.25], [2.2, 0.9, -0.4], [2.65, -0.75, 0.6], [2.0, -0.2, 1.0], [2.9, 0.5, -0.1],
];

function BuilderParts({ picks, reducedMotion }: { picks: BuilderPicks; reducedMotion: boolean }) {
  const hasSafety = picks.safety.length > 0;
  return (
    <group>
      {/* Core appears the moment a job is chosen. */}
      {picks.job && (
        <GrowIn key={`core-${picks.job}`} reducedMotion={reducedMotion}>
          <mesh position={[0, 0.75, 0]} scale={0.82}>
            <sphereGeometry args={[0.95, 96, 96]} />
            <meshPhysicalMaterial
              color="#EDEFF1" metalness={1} roughness={0.05}
              clearcoat={1} clearcoatRoughness={0.05}
              iridescence={0.5} iridescenceIOR={1.3} iridescenceThicknessRange={[100, 600]}
              envMapIntensity={1.25}
            />
          </mesh>
        </GrowIn>
      )}

      {picks.knowledge.map((id, i) => (
        <GrowIn key={`kn-${id}`} reducedMotion={reducedMotion} targetScale={0.66}>
          <mesh position={KNOWLEDGE_SLOTS[i % KNOWLEDGE_SLOTS.length]}>
            <boxGeometry args={[0.85, 0.85, 0.85, 4, 4, 4]} />
            <meshPhysicalMaterial
              color="#EDF2F2" metalness={0} roughness={0.12}
              transmission={0.7} ior={1.5} thickness={0.8}
              clearcoat={1} envMapIntensity={1.1}
            />
            <Edges scale={1.002} color="#9AA0A2" threshold={30} />
          </mesh>
        </GrowIn>
      ))}

      {picks.abilities.map((id, i) => (
        <GrowIn key={`ab-${id}`} reducedMotion={reducedMotion} targetScale={0.9}>
          <mesh
            position={ABILITY_SLOTS[i % ABILITY_SLOTS.length]}
            rotation={i % 2 === 0 ? [0, 0, 0] : [0, 0.4, Math.PI / 2]}
          >
            <capsuleGeometry args={[0.2, 0.55, 12, 24]} />
            <meshPhysicalMaterial
              color="#DDE1E4" metalness={1} roughness={0.07}
              clearcoat={1} envMapIntensity={1.2}
            />
          </mesh>
        </GrowIn>
      ))}

      {picks.apps.map((id, i) => (
        <GrowIn key={`app-${id}`} reducedMotion={reducedMotion}>
          <mesh position={APP_SLOTS[i % APP_SLOTS.length]} rotation={[0, -0.5 + i * 0.2, 0]}>
            <boxGeometry args={[0.72, 0.5, 0.09]} />
            <meshPhysicalMaterial
              color="#D9C9A3" metalness={0.75} roughness={0.22}
              clearcoat={1} envMapIntensity={1.15}
            />
            <Edges scale={1.004} color="#B5A47C" threshold={30} />
          </mesh>
        </GrowIn>
      ))}

      {/* Safety: the sea-glass ring underlines everything; the boundary
          shell wraps it. One visual regardless of how many rules — safety
          reads as one layer, not clutter. */}
      {hasSafety && (
        <GrowIn key="safety" reducedMotion={reducedMotion}>
          <mesh position={[0, -1.15, 0]} rotation={[Math.PI / 2.25, 0, 0]}>
            <torusGeometry args={[1.7, 0.05, 20, 140]} />
            <meshPhysicalMaterial
              color="#93BBB4" metalness={0.85} roughness={0.12}
              clearcoat={1} envMapIntensity={1.2}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[2.8, 48, 48]} />
            <meshPhysicalMaterial
              color="#F5F1E8" metalness={0} roughness={0.18}
              transmission={0.92} ior={1.35} thickness={0.4}
              transparent opacity={0.22} side={2}
            />
          </mesh>
        </GrowIn>
      )}
    </group>
  );
}

export function BuilderScene({ picks }: { picks: BuilderPicks }) {
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

  const empty = !picks.job && picks.knowledge.length === 0;

  if (!webglOk) {
    return (
      <div className="flex h-full items-center justify-center rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[#FBFAF6] p-6 text-center">
        <p className="font-mono text-[11px] text-[color:var(--text-secondary)]">
          3D preview needs WebGL — your picks below still build the agent.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]" style={{ background: '#FBFAF6' }}>
      <Canvas camera={{ position: [0.5, 0.7, 6.6], fov: 36 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <fog attach="fog" args={['#FBFAF6', 8, 22]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 7, 4]} intensity={1.25} />
          <directionalLight position={[-6, 3, -3]} intensity={0.7} color="#EDF3F8" />
          <Environment preset="studio" background={false} />
          <BuilderParts picks={picks} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
      {empty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
            your agent appears here
          </p>
        </div>
      )}
    </div>
  );
}
