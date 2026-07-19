'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type RootState } from '@react-three/fiber';
import { Environment, Html, OrbitControls } from '@react-three/drei';
import { useStudioStore } from '@/lib/studio/store';
import type { AgentDefinition } from '@/lib/studio/schema';

/**
 * The koro agent scene.
 *
 * Every 3D object corresponds to a real component in the agent schema.
 * No arbitrary shapes; no floating decoration. Labels are DOM overlays
 * via `<Html>` so essential text is readable + accessible.
 *
 * Layout: the chrome core sits at (0, 0, 0). Modules attach at fixed
 * "ports" arranged in a horseshoe around the core. Connections are
 * drawn as thin lines between the port positions.
 */

/** Fixed anchor points around the core. Every module in the scene sits at
 *  one of these; the connection lines are traced between anchors, not
 *  arbitrary positions. */
interface Anchor { position: [number, number, number]; }

interface ModuleSpec {
  componentId: string;   // matches an ID in the agent definition
  label: string;
  role: 'instruction' | 'knowledge' | 'memory' | 'ability' | 'connector' | 'approval' | 'evaluation' | 'boundary';
  anchor: Anchor;
}

/** Compose the scene layout from the current agent definition — no hard-coded
 *  strings duplicated across components. */
function useSceneModules(agent: AgentDefinition): ModuleSpec[] {
  return useMemo(() => {
    const modules: ModuleSpec[] = [];
    // Instruction capsule above the core.
    modules.push({
      componentId: 'instructions',
      label: 'Instructions',
      role: 'instruction',
      anchor: { position: [0, 2.4, 0] },
    });
    // Memory frosted cube to the right of the core.
    modules.push({
      componentId: 'memory',
      label: 'Memory',
      role: 'memory',
      anchor: { position: [1.8, 0.6, -0.8] },
    });
    // Knowledge cubes on the left.
    agent.knowledge.slice(0, 2).forEach((k, i) => {
      modules.push({
        componentId: k.id,
        label: k.title,
        role: 'knowledge',
        anchor: { position: [-2.3, 0.8 - i * 1.4, i === 0 ? -0.4 : 0.4] },
      });
    });
    // Gmail connector tile — front-right.
    const gmail = agent.connectors.find((c) => c.type === 'connector-gmail');
    if (gmail) {
      modules.push({
        componentId: gmail.id,
        label: 'Gmail',
        role: 'connector',
        anchor: { position: [2.4, -0.8, 0.9] },
      });
    }
    // Ability capsules — front.
    agent.abilities.slice(0, 2).forEach((a, i) => {
      modules.push({
        componentId: a.id,
        label: a.title,
        role: 'ability',
        anchor: { position: [-0.9 + i * 1.8, -1.0, 1.6] },
      });
    });
    // Approval block sitting between send-ability and Gmail.
    const approval = agent.approvals[0];
    if (approval) {
      modules.push({
        componentId: approval.id,
        label: 'Approval',
        role: 'approval',
        anchor: { position: [1.4, -0.9, 1.2] },
      });
    }
    // Evaluation ring — an orbit around the core.
    const evalNode = agent.evaluations[0];
    if (evalNode) {
      modules.push({
        componentId: evalNode.id,
        label: 'Evaluations',
        role: 'evaluation',
        anchor: { position: [0, -1.9, 0] },
      });
    }
    // Boundary shell — invisible transparent sphere around the whole scene,
    // rendered separately (no anchor line goes to it).
    return modules;
  }, [agent]);
}

interface MeshLike {
  rotation: { x: number; y: number };
  scale: { set: (x: number, y: number, z: number) => void };
  position: { x: number; y: number; z: number };
}

function Core({ selectedId, reducedMotion }: { selectedId: string; reducedMotion: boolean }) {
  const meshRef = useRef<MeshLike | null>(null);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (reducedMotion) return;
    meshRef.current.rotation.y += delta * 0.08;
  });
  const active = selectedId === 'instructions' || selectedId === 'intelligence' || selectedId === 'memory';
  const scale = active ? 1.05 : 1;
  return (
    <mesh ref={meshRef as unknown as never} scale={scale}>
      <sphereGeometry args={[1.15, 96, 96]} />
      <meshPhysicalMaterial
        color="#EDEFF1"
        metalness={1}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.05}
        iridescence={0.7}
        iridescenceIOR={1.3}
        iridescenceThicknessRange={[100, 700]}
        envMapIntensity={1.3}
      />
    </mesh>
  );
}

function InstructionCapsule({ position, selected, hovered, onSelect, onHover }: {
  position: [number, number, number];
  selected: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
}) {
  return (
    <mesh position={position}
      onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onHover(true); }}
      onPointerOut={() => onHover(false)}
      scale={selected ? 1.08 : hovered ? 1.04 : 1}
    >
      <capsuleGeometry args={[0.34, 0.9, 16, 32]} />
      <meshPhysicalMaterial
        color={selected ? '#2B6B57' : '#DDE1E4'}
        metalness={selected ? 0.4 : 1.0}
        roughness={selected ? 0.30 : 0.06}
        clearcoat={1}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

function GlassCube({ position, tone, selected, hovered, onSelect, onHover }: {
  position: [number, number, number];
  tone: 'clear' | 'frost';
  selected: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
}) {
  return (
    <mesh position={position}
      onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onHover(true); }}
      onPointerOut={() => onHover(false)}
      scale={selected ? 0.98 : hovered ? 0.95 : 0.92}
    >
      <boxGeometry args={[0.9, 0.9, 0.9, 8, 8, 8]} />
      <meshPhysicalMaterial
        color={selected ? '#79A6B2' : '#F0F3F5'}
        metalness={0.0}
        roughness={tone === 'frost' ? 0.55 : 0.05}
        transmission={tone === 'frost' ? 0.85 : 1.0}
        ior={1.5}
        thickness={0.8}
        iridescence={0.15}
        clearcoat={1}
        envMapIntensity={1.1}
      />
    </mesh>
  );
}

function ConnectorTile({ position, selected, hovered, onSelect, onHover }: {
  position: [number, number, number];
  selected: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
}) {
  return (
    <mesh position={position}
      onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onHover(true); }}
      onPointerOut={() => onHover(false)}
      scale={selected ? 1.05 : hovered ? 1.02 : 1}
    >
      <boxGeometry args={[1.05, 0.75, 0.14]} />
      <meshPhysicalMaterial
        color={selected ? '#2B6B57' : '#F4CE7A'}
        metalness={0.75}
        roughness={0.20}
        clearcoat={1}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

function ApprovalBlock({ position, selected, hovered, onSelect, onHover }: {
  position: [number, number, number];
  selected: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
}) {
  return (
    <mesh position={position}
      onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onHover(true); }}
      onPointerOut={() => onHover(false)}
      scale={selected ? 1.06 : hovered ? 1.03 : 1}
    >
      <cylinderGeometry args={[0.32, 0.32, 0.5, 24, 1]} />
      <meshPhysicalMaterial
        color={selected ? '#2B6B57' : '#D4A853'}
        metalness={0.5}
        roughness={0.35}
        clearcoat={1}
      />
    </mesh>
  );
}

interface EvaluationRingRef { rotation: { x: number; y: number; z: number }; }
function EvaluationRing({ position, selected, hovered, onSelect, onHover, reducedMotion }: {
  position: [number, number, number];
  selected: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
  reducedMotion: boolean;
}) {
  const ref = useRef<EvaluationRingRef | null>(null);
  useFrame((_, delta) => {
    if (!ref.current || reducedMotion) return;
    ref.current.rotation.z += delta * 0.35;
  });
  return (
    <mesh ref={ref as unknown as never} position={position} rotation={[Math.PI / 2, 0, 0]}
      onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onHover(true); }}
      onPointerOut={() => onHover(false)}
      scale={selected ? 1.06 : hovered ? 1.03 : 1}
    >
      <torusGeometry args={[1.55, 0.055, 24, 128]} />
      <meshPhysicalMaterial
        color={selected ? '#2B6B57' : '#79A6B2'}
        metalness={1.0}
        roughness={0.08}
        clearcoat={1}
      />
    </mesh>
  );
}

function BoundaryShell({ selected }: { selected: boolean }) {
  return (
    <mesh>
      <sphereGeometry args={[3.15, 64, 64]} />
      <meshPhysicalMaterial
        color={selected ? '#2B6B57' : '#F5F1E8'}
        metalness={0}
        roughness={0.15}
        transmission={0.94}
        ior={1.4}
        thickness={0.6}
        clearcoat={1}
        transparent
        opacity={0.35}
        side={2}
      />
    </mesh>
  );
}

/** Thin line between two anchor points, drawn as a stretched cylinder so it
 *  reads on both light + dark grounds. */
function ConnectionLine({ from, to, colour }: { from: [number, number, number]; to: [number, number, number]; colour: string }) {
  const dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
  const length = Math.hypot(dx, dy, dz);
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  // Rotation so the cylinder Y axis aligns with the vector from→to.
  const axis: [number, number, number] = [dx / length, dy / length, dz / length];
  const yAxis: [number, number, number] = [0, 1, 0];
  const cross: [number, number, number] = [
    yAxis[1] * axis[2] - yAxis[2] * axis[1],
    yAxis[2] * axis[0] - yAxis[0] * axis[2],
    yAxis[0] * axis[1] - yAxis[1] * axis[0],
  ];
  const dot = yAxis[0] * axis[0] + yAxis[1] * axis[1] + yAxis[2] * axis[2];
  const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
  const norm = Math.hypot(cross[0], cross[1], cross[2]);
  const rotAxis: [number, number, number] = norm > 0.0001 ? [cross[0] / norm, cross[1] / norm, cross[2] / norm] : [1, 0, 0];
  // three.js expects euler; we'll use a quaternion via `setFromAxisAngle` if
  // available. Simpler: rotate the mesh by feeding a rotation array with the
  // Rodrigues axis-angle collapsed to XYZ Euler is complex — use a group
  // with `matrixAutoUpdate={false}` and set the matrix directly.
  return (
    <group position={mid} rotation={rotAxis[0] ? [rotAxis[0] * angle, rotAxis[1] * angle, rotAxis[2] * angle] : [angle, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.018, 0.018, length, 8, 1]} />
        <meshBasicMaterial color={colour} transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

function OverlayLabel({ position, text, active, selected, onSelect }: {
  position: [number, number, number];
  text: string;
  active: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Html position={position} center distanceFactor={9} zIndexRange={[0, 40]} occlude={false}>
      <button
        type="button"
        onClick={onSelect}
        className={[
          'select-none rounded-[2px] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur-sm transition',
          selected
            ? 'border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu)] text-[color:var(--assembl-paper)]'
            : active
              ? 'border-[color:var(--assembl-gold-thread)] bg-[color:var(--assembl-paper)]/90 text-[color:var(--text-primary)]'
              : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)]/85 text-[color:var(--text-primary)] hover:border-[color:var(--text-primary)]',
        ].join(' ')}
      >
        {text}
      </button>
    </Html>
  );
}

interface ResetHandle { reset: () => void; }

function SceneContents({ resetRequestRef }: { resetRequestRef: React.RefObject<ResetHandle | null> }) {
  const agent = useStudioStore((s) => s.agent);
  const selectedId = useStudioStore((s) => s.selectedId);
  const hoveredId = useStudioStore((s) => s.hoveredId);
  const setHover = useStudioStore((s) => s.hover);
  const select = useStudioStore((s) => s.select);
  const reducedMotion = useStudioStore((s) => s.reducedMotion);
  const testActivity = useStudioStore((s) => s.test.activity);
  const testActive = useMemo(
    () => testActivity[testActivity.length - 1]?.active ?? [],
    [testActivity],
  );
  const modules = useSceneModules(agent);

  const boundaryId = agent.boundaries[0]?.id ?? '';
  const CORE_ANCHOR: [number, number, number] = [0, 0.4, 0];

  const relationshipColour: Record<string, string> = {
    'informs': '#5B5049',
    'enables': '#3C7FA0',
    'requires-approval': '#C79B1F',
    'protects': '#2B6B57',
    'evaluates': '#79A6B2',
  };

  // Expose a reset handle for the DOM reset button.
  const cameraRef = useRef<{ reset?: () => void } | null>(null);
  useEffect(() => {
    resetRequestRef.current = {
      reset: () => cameraRef.current?.reset?.(),
    };
  }, [resetRequestRef]);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 3]} intensity={1.35} color="#FFFFFF" />
      <directionalLight position={[-4, 2, -2]} intensity={0.75} color="#E7F0FF" />
      <directionalLight position={[0, -3, 3]} intensity={0.5} color="#FFF3E7" />
      <Environment preset="studio" background={false} />

      {/* Transparent boundary shell. */}
      <group>
        <mesh onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); if (boundaryId) select(boundaryId); }}>
          <sphereGeometry args={[3.15, 64, 64]} />
          <meshPhysicalMaterial
            color={selectedId === boundaryId ? '#2B6B57' : '#F5F1E8'}
            metalness={0}
            roughness={0.18}
            transmission={0.9}
            ior={1.35}
            thickness={0.4}
            transparent
            opacity={0.28}
            side={2}
          />
        </mesh>
      </group>

      {/* Central chrome core — instructions/intelligence/memory anchor here. */}
      <group position={CORE_ANCHOR}>
        <Core selectedId={selectedId} reducedMotion={reducedMotion} />
      </group>

      {/* Modules. */}
      {modules.map((m) => {
        const selected = selectedId === m.componentId;
        const hovered = hoveredId === m.componentId;
        const active = testActive.includes(m.componentId);
        const onSelect = () => select(m.componentId);
        const onHover = (h: boolean) => setHover(h ? m.componentId : null);
        const p = m.anchor.position;
        let node: React.ReactNode = null;
        switch (m.role) {
          case 'instruction':
            node = <InstructionCapsule position={p} selected={selected} hovered={hovered} onSelect={onSelect} onHover={onHover} />;
            break;
          case 'memory':
            node = <GlassCube position={p} tone="frost" selected={selected} hovered={hovered} onSelect={onSelect} onHover={onHover} />;
            break;
          case 'knowledge':
            node = <GlassCube position={p} tone="clear" selected={selected} hovered={hovered} onSelect={onSelect} onHover={onHover} />;
            break;
          case 'ability':
            node = <InstructionCapsule position={p} selected={selected} hovered={hovered} onSelect={onSelect} onHover={onHover} />;
            break;
          case 'connector':
            node = <ConnectorTile position={p} selected={selected} hovered={hovered} onSelect={onSelect} onHover={onHover} />;
            break;
          case 'approval':
            node = <ApprovalBlock position={p} selected={selected} hovered={hovered} onSelect={onSelect} onHover={onHover} />;
            break;
          case 'evaluation':
            node = <EvaluationRing position={p} selected={selected} hovered={hovered} onSelect={onSelect} onHover={onHover} reducedMotion={reducedMotion} />;
            break;
        }
        return (
          <group key={m.componentId}>
            {node}
            <OverlayLabel position={[p[0], p[1] + 0.9, p[2]]} text={m.label} active={active} selected={selected} onSelect={onSelect} />
          </group>
        );
      })}

      {/* Connections — one per edge in the agent schema. */}
      {agent.connections.map((edge) => {
        const src = modules.find((m) => m.componentId === edge.sourceId);
        const dst = modules.find((m) => m.componentId === edge.targetId);
        const fromPos = src?.anchor.position ?? CORE_ANCHOR;
        const toPos = dst?.anchor.position ?? CORE_ANCHOR;
        return (
          <ConnectionLine key={edge.id} from={fromPos} to={toPos} colour={relationshipColour[edge.relationship]} />
        );
      })}

      <OrbitControls
        enableZoom
        minPolarAngle={0.6}
        maxPolarAngle={Math.PI - 0.7}
        minDistance={4}
        maxDistance={10}
        enablePan={false}
        makeDefault
        ref={(ctrl: { reset?: () => void } | null) => {
          if (ctrl) {
            cameraRef.current = { reset: () => ctrl.reset?.() };
          }
        }}
      />
    </>
  );
}

interface Props {
  onWebGLFailed?: () => void;
}

export function AgentScene({ onWebGLFailed }: Props) {
  const [webglOk, setWebglOk] = useState(true);
  const resetRef = useRef<ResetHandle | null>(null);

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) {
        setWebglOk(false);
        onWebGLFailed?.();
      }
    } catch {
      setWebglOk(false);
      onWebGLFailed?.();
    }
  }, [onWebGLFailed]);

  if (!webglOk) {
    return (
      <div className="flex h-full items-center justify-center bg-[color:var(--assembl-paper)] p-8">
        <div className="max-w-[420px] rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-6 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">3d unavailable</div>
          <h3 className="mt-2 font-display text-[24px] font-light lowercase text-[color:var(--text-primary)]">the scene needs webgl.</h3>
          <p className="mt-2 text-[13px] text-[color:var(--text-secondary)]">
            The build view can&rsquo;t render without WebGL, but the whole agent is still editable in the panels on either side. Try the x-ray view for a text-first tour of the wiring.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 1.6, 6], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onCreated={(state: RootState) => {
          // no-op; ready hook
          void state;
        }}
      >
        <Suspense fallback={null}>
          <SceneContents resetRequestRef={resetRef} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute right-3 top-3 flex gap-2">
        <button
          type="button"
          onClick={() => resetRef.current?.reset?.()}
          className="pointer-events-auto rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)]/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-primary)] backdrop-blur-sm hover:border-[color:var(--text-primary)]"
        >
          reset camera
        </button>
      </div>
    </div>
  );
}
