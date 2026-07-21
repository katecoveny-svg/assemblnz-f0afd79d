'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Edges, OrbitControls } from '@react-three/drei';
import type { BuilderPicks } from '@/lib/studio/builder-options';

/**
 * The builder's live 3D preview. Starts EMPTY. Every pick adds exactly one
 * part, which scales up into place — the agent assembles in layers.
 *
 * Interactive: orbit the whole scene (drag the background), and DRAG any
 * piece to move it and make your own shape. "Reset layout" returns the
 * default arrangement. Positions are per-part overrides in local state.
 *
 * Part vocabulary (same anatomy as /studio and the homepage hero):
 *   job → chrome core · knowledge → glass cubes · abilities → chrome
 *   capsules · apps → warm tiles · safety → sea-glass ring + boundary shell
 */

type Vec3 = [number, number, number];

interface MeshLike {
  scale: { setScalar: (s: number) => void };
}

function easeOutBack(t: number): number {
  const c1 = 1.20158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

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

const KNOWLEDGE_SLOTS: Vec3[] = [
  [-1.7, 0.15, 0.2], [-2.25, -0.7, -0.6], [-1.5, 1.05, -0.7], [-2.5, 0.35, 0.6], [-1.9, -1.2, 0.4],
  [-2.7, 1.15, 0.1], [-1.35, -0.1, 1.0], [-3.0, -0.4, -0.3], [-2.1, 1.7, -0.4],
];
const ABILITY_SLOTS: Vec3[] = [
  [-0.95, -0.6, 0.95], [1.3, -0.85, 0.7], [0.2, -1.0, 1.2], [-0.3, -0.75, 1.45], [0.9, -0.55, 1.3],
  [-1.5, -1.05, 0.6], [1.7, -1.1, 0.3], [0.5, -1.35, 0.9], [-0.9, -1.3, 1.1],
];
const APP_SLOTS: Vec3[] = [
  [2.45, 0.05, 0.25], [2.2, 0.9, -0.4], [2.65, -0.75, 0.6], [2.0, -0.2, 1.0], [2.9, 0.5, -0.1],
  [2.35, 1.5, 0.2], [3.1, -0.2, -0.4], [2.6, -1.4, 0.3], [3.3, 0.9, 0.4],
];

interface PartProps {
  id: string;
  base: Vec3;
  positions: Record<string, Vec3>;
  onGrab: (id: string, base: Vec3) => void;
  reducedMotion: boolean;
  targetScale?: number;
  rotation?: Vec3;
  children: React.ReactNode;
}

function Part({ id, base, positions, onGrab, reducedMotion, targetScale = 1, rotation, children }: PartProps) {
  const pos = positions[id] ?? base;
  return (
    <GrowIn key={id} reducedMotion={reducedMotion} targetScale={targetScale}>
      {/* eslint-disable @typescript-eslint/no-explicit-any */}
      <mesh
        position={pos}
        rotation={rotation as unknown as never}
        onPointerDown={(e: any) => { e.stopPropagation(); onGrab(id, positions[id] ?? base); }}
        onPointerOver={() => { document.body.style.cursor = 'grab'; }}
        onPointerOut={() => { document.body.style.cursor = ''; }}
      >
        {children}
      </mesh>
      {/* eslint-enable @typescript-eslint/no-explicit-any */}
    </GrowIn>
  );
}

function BuilderParts({
  picks, reducedMotion, positions, onGrab, dragging, onDrag, onDrop,
}: {
  picks: BuilderPicks;
  reducedMotion: boolean;
  positions: Record<string, Vec3>;
  onGrab: (id: string, base: Vec3) => void;
  dragging: string | null;
  onDrag: (p: Vec3) => void;
  onDrop: () => void;
}) {
  const hasSafety = picks.safety.length > 0;
  return (
    <group>
      {/* Invisible drag-plane — only while dragging, so it never blocks
          clicks or orbit otherwise. Maps the pointer to a world point. */}
      {dragging && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <mesh position={[0, 0, 0]} onPointerMove={(e: any) => onDrag([e.point.x, e.point.y, positions[dragging]?.[2] ?? 0])} onPointerUp={onDrop}>
          <planeGeometry args={[120, 120]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {picks.job && (
        <Part id={`core-${picks.job}`} base={[0, 0.75, 0]} positions={positions} onGrab={onGrab} reducedMotion={reducedMotion} targetScale={0.82}>
          <sphereGeometry args={[0.95, 96, 96]} />
          <meshPhysicalMaterial
            color="#EDEFF1" metalness={1} roughness={0.05}
            clearcoat={1} clearcoatRoughness={0.05}
            iridescence={0.5} iridescenceIOR={1.3} iridescenceThicknessRange={[100, 600]}
            envMapIntensity={1.25}
          />
        </Part>
      )}

      {picks.knowledge.map((id, i) => (
        <Part key={`kn-${id}`} id={`kn-${id}`} base={KNOWLEDGE_SLOTS[i % KNOWLEDGE_SLOTS.length]} positions={positions} onGrab={onGrab} reducedMotion={reducedMotion} targetScale={0.66}>
          <boxGeometry args={[0.85, 0.85, 0.85, 4, 4, 4]} />
          <meshPhysicalMaterial color="#EDF2F2" metalness={0} roughness={0.12} transmission={0.7} ior={1.5} thickness={0.8} clearcoat={1} envMapIntensity={1.1} />
          <Edges scale={1.002} color="#9AA0A2" threshold={30} />
        </Part>
      ))}

      {picks.abilities.map((id, i) => (
        <Part key={`ab-${id}`} id={`ab-${id}`} base={ABILITY_SLOTS[i % ABILITY_SLOTS.length]} positions={positions} onGrab={onGrab} reducedMotion={reducedMotion} targetScale={0.9} rotation={i % 2 === 0 ? [0, 0, 0] : [0, 0.4, Math.PI / 2]}>
          <capsuleGeometry args={[0.2, 0.55, 12, 24]} />
          <meshPhysicalMaterial color="#DDE1E4" metalness={1} roughness={0.07} clearcoat={1} envMapIntensity={1.2} />
        </Part>
      ))}

      {picks.apps.map((id, i) => (
        <Part key={`app-${id}`} id={`app-${id}`} base={APP_SLOTS[i % APP_SLOTS.length]} positions={positions} onGrab={onGrab} reducedMotion={reducedMotion} rotation={[0, -0.5 + i * 0.2, 0]}>
          <boxGeometry args={[0.72, 0.5, 0.09]} />
          <meshPhysicalMaterial color="#D9C9A3" metalness={0.75} roughness={0.22} clearcoat={1} envMapIntensity={1.15} />
          <Edges scale={1.004} color="#B5A47C" threshold={30} />
        </Part>
      ))}

      {/* Safety stays anchored — the boundary shell reads as one calm layer,
          not a draggable piece. */}
      {hasSafety && (
        <GrowIn key="safety" reducedMotion={reducedMotion}>
          <mesh position={[0, -1.15, 0]} rotation={[Math.PI / 2.25, 0, 0]}>
            <torusGeometry args={[1.7, 0.05, 20, 140]} />
            <meshPhysicalMaterial color="#93BBB4" metalness={0.85} roughness={0.12} clearcoat={1} envMapIntensity={1.2} />
          </mesh>
          <mesh>
            <sphereGeometry args={[2.8, 48, 48]} />
            <meshPhysicalMaterial color="#F5F1E8" metalness={0} roughness={0.18} transmission={0.92} ior={1.35} thickness={0.4} transparent opacity={0.22} side={2} />
          </mesh>
        </GrowIn>
      )}
    </group>
  );
}

export function BuilderScene({ picks }: { picks: BuilderPicks }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const [positions, setPositions] = useState<Record<string, Vec3>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [moved, setMoved] = useState(false);

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

  // End a drag even if the pointer is released outside the canvas.
  useEffect(() => {
    if (!dragging) return;
    const up = () => { setDragging(null); document.body.style.cursor = ''; };
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, [dragging]);

  const onGrab = useCallback((id: string, base: Vec3) => {
    setPositions((p) => ({ ...p, [id]: p[id] ?? base }));
    setDragging(id);
    document.body.style.cursor = 'grabbing';
  }, []);
  const onDrag = useCallback((p: Vec3) => {
    setMoved(true);
    setDragging((d) => { if (d) setPositions((prev) => ({ ...prev, [d]: p })); return d; });
  }, []);
  const onDrop = useCallback(() => { setDragging(null); document.body.style.cursor = ''; }, []);
  const reset = useCallback(() => { setPositions({}); setMoved(false); }, []);

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
          <fog attach="fog" args={['#FBFAF6', 9, 24]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 7, 4]} intensity={1.25} />
          <directionalLight position={[-6, 3, -3]} intensity={0.7} color="#EDF3F8" />
          <Environment preset="studio" background={false} />
          <BuilderParts
            picks={picks} reducedMotion={reducedMotion}
            positions={positions} onGrab={onGrab}
            dragging={dragging} onDrag={onDrag} onDrop={onDrop}
          />
          <OrbitControls
            makeDefault
            enabled={!dragging}
            enablePan={false}
            minDistance={4}
            maxDistance={12}
            enableDamping
            dampingFactor={0.08}
          />
        </Suspense>
      </Canvas>

      {!empty && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-2.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
            drag a piece to move it · drag the background to orbit
          </span>
          {moved && (
            <button
              type="button"
              onClick={reset}
              className="pointer-events-auto rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)] hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]"
            >
              reset layout
            </button>
          )}
        </div>
      )}

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
