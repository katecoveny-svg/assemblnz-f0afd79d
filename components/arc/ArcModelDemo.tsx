'use client';

import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls } from '@react-three/drei';
import { ARC_DEMO_VIOLATIONS, type ArcViolation } from '@/lib/arc/demo-violations';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';
import { CanvasErrorBoundary } from '@/components/site/cinematic-journey/CanvasErrorBoundary';

function BuildingMass() {
  const wall = '#654A4E';
  const roof = '#3a1f2a';
  const slab = '#4a3336';
  const glass = '#c9b4b7';

  return (
    <group position={[0, 0, 0]}>
      {/* ground plane hint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[4.2, 48]} />
        <meshStandardMaterial color="#1a0c18" roughness={1} />
      </mesh>

      {/* ground floor */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 1.1, 2.4]} />
        <meshStandardMaterial color={wall} roughness={0.88} metalness={0.05} />
      </mesh>

      {/* upper volume */}
      <mesh position={[-0.15, 1.55, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.95, 2.0]} />
        <meshStandardMaterial color="#5a4044" roughness={0.9} />
      </mesh>

      {/* roof plate */}
      <mesh position={[-0.15, 2.12, -0.1]} castShadow>
        <boxGeometry args={[2.85, 0.12, 2.25]} />
        <meshStandardMaterial color={roof} roughness={0.75} />
      </mesh>

      {/* deck */}
      <mesh position={[0, 1.05, 1.45]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.08, 1.0]} />
        <meshStandardMaterial color={slab} roughness={0.95} />
      </mesh>

      {/* stair block */}
      <mesh position={[1.35, 0.45, 0.95]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.9]} />
        <meshStandardMaterial color="#4e3539" roughness={0.92} />
      </mesh>

      {/* window bands */}
      <mesh position={[0, 0.7, 1.21]}>
        <boxGeometry args={[1.6, 0.42, 0.04]} />
        <meshStandardMaterial color={glass} roughness={0.25} metalness={0.2} transparent opacity={0.85} />
      </mesh>
      <mesh position={[-0.2, 1.55, 0.91]}>
        <boxGeometry args={[1.2, 0.38, 0.04]} />
        <meshStandardMaterial color={glass} roughness={0.25} metalness={0.2} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function ViolationPin({
  violation,
  active,
  onSelect,
}: {
  violation: ArcViolation;
  active: boolean;
  onSelect: (v: ArcViolation) => void;
}) {
  return (
    <Html position={violation.position} center distanceFactor={10} zIndexRange={[30, 0]}>
      <button
        type="button"
        className="arc-pin"
        data-active={active ? 'true' : 'false'}
        aria-label={`${ARC_PREVIEW.demoBadge} ${violation.code}: ${violation.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(violation);
        }}
      >
        <span className="arc-pin-core" />
        <span className="arc-pin-label arc-mono">{violation.code}</span>
      </button>
    </Html>
  );
}

function ModelScene({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (v: ArcViolation) => void;
}) {
  const pins = useMemo(() => ARC_DEMO_VIOLATIONS, []);

  return (
    <>
      <color attach="background" args={['#160812']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 7, 3]} intensity={1.15} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#916A70" />
      <BuildingMass />
      {pins.map((v) => (
        <ViolationPin key={v.id} violation={v} active={activeId === v.id} onSelect={onSelect} />
      ))}
      <ContactShadows position={[0, 0, 0]} opacity={0.45} scale={8} blur={2.4} far={4} />
      <OrbitControls
        enablePan={false}
        minPolarAngle={0.6}
        maxPolarAngle={1.35}
        minDistance={4.5}
        maxDistance={9}
        target={[0, 0.9, 0]}
      />
    </>
  );
}

function ModelFallback() {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        height: '100%',
        padding: '2rem',
        color: 'rgba(245,241,242,0.7)',
        textAlign: 'center',
      }}
    >
      <p>3D preview unavailable in this browser. Use the pin list beside this panel.</p>
    </div>
  );
}

export function ArcModelDemo() {
  const [active, setActive] = useState<ArcViolation | null>(ARC_DEMO_VIOLATIONS[0] ?? null);

  return (
    <div className="arc-model-shell">
      <div className="arc-canvas-wrap" id="arc-model">
        <CanvasErrorBoundary fallback={<ModelFallback />}>
          <Canvas
            shadows
            dpr={[1, 1.75]}
            camera={{ position: [4.6, 3.2, 5.2], fov: 38, near: 0.1, far: 60 }}
            gl={{ antialias: true, alpha: false }}
          >
            <ModelScene activeId={active?.id ?? null} onSelect={setActive} />
          </Canvas>
        </CanvasErrorBoundary>
        <p className="arc-canvas-hint arc-mono">Drag to orbit · click a pin</p>
      </div>

      <aside className="arc-violation-card" data-empty={active ? 'false' : 'true'} aria-live="polite">
        {active ? (
          <>
            <span className="arc-demo-pill arc-mono">{ARC_PREVIEW.demoBadge}</span>
            <p className="arc-violation-code arc-mono">{active.code}</p>
            <h3>{active.title}</h3>
            <p>{active.summary}</p>
            <p
              className="arc-mono"
              style={{
                fontSize: '0.68rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--arc-heather)',
              }}
            >
              {ARC_PREVIEW.evidenceLabel} · staged · not lodged
            </p>
          </>
        ) : (
          <p>Select a DEMO pin on the model.</p>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            marginTop: '0.5rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--arc-line)',
          }}
        >
          <p
            className="arc-mono"
            style={{
              margin: 0,
              fontSize: '0.65rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--arc-heather)',
            }}
          >
            DEMO pins
          </p>
          {ARC_DEMO_VIOLATIONS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setActive(v)}
              aria-pressed={active?.id === v.id}
              style={{
                textAlign: 'left',
                padding: '0.55rem 0.65rem',
                border: `1px solid ${active?.id === v.id ? 'var(--arc-rose)' : 'var(--arc-line)'}`,
                background: active?.id === v.id ? 'rgba(145,106,112,0.18)' : 'transparent',
                color: 'var(--arc-paper)',
                font: 'inherit',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <span className="arc-mono" style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--arc-rose)' }}>
                {v.code}
              </span>
              {v.title}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}