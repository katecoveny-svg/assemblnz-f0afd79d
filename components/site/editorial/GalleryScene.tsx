'use client';

import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
// drei's flat `@react-three/drei` .d.ts only re-exports Html. Every other
// component lives at a subpath; importing from the top hits a Vercel
// typecheck failure. Keep subpaths so future drei users don't repeat this.
import { Environment } from '@react-three/drei/core/Environment';
import { OrbitControls } from '@react-three/drei/core/OrbitControls';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';
import { Sparkles } from '@react-three/drei/core/Sparkles';
import { Html } from '@react-three/drei';
import type { Group, Mesh } from 'three';
import { CONCEPT_VIGNETTES } from '@/lib/copy/editorial-home';

type VignetteId = keyof typeof CONCEPT_VIGNETTES;

const INSTALLATIONS: Array<{ id: VignetteId; position: [number, number, number] }> = [
  { id: 'woolworths', position: [-3.4, 0, -1.5] },
  { id: 'contact', position: [0, 0, -2.6] },
  { id: 'airnz', position: [3.4, 0, -1.5] },
];

function Plinth() {
  return (
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[1.3, 1.2, 1.3]} />
      <meshStandardMaterial color="#f0ede6" roughness={0.85} metalness={0.02} />
    </mesh>
  );
}

function InstallationForm({ id }: { id: VignetteId }) {
  const ref = useRef<Mesh>(null!);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.12;
  });
  const shape = CONCEPT_VIGNETTES[id].shape;

  if (shape === 'sphere') {
    return (
      <mesh ref={ref}>
        <sphereGeometry args={[0.5, 96, 96]} />
        <meshPhysicalMaterial
          color="#f6f6f6"
          metalness={1}
          roughness={0.06}
          clearcoat={1}
          clearcoatRoughness={0.04}
        />
      </mesh>
    );
  }

  if (shape === 'block') {
    // Native three.js physical material with transmission — same warm-lit
    // translucent block look as drei's MeshTransmissionMaterial, without
    // the .d.ts export gap that broke the Vercel typecheck.
    return (
      <mesh ref={ref}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshPhysicalMaterial
          color="#ffd28a"
          transmission={1}
          thickness={0.6}
          roughness={0.05}
          ior={1.42}
          attenuationColor="#ff8f4a"
          attenuationDistance={1.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    );
  }

  return (
    <mesh ref={ref}>
      <torusGeometry args={[0.45, 0.16, 48, 128]} />
      <meshPhysicalMaterial
        color="#eae8e3"
        metalness={1}
        roughness={0.14}
        iridescence={1}
        iridescenceIOR={1.55}
        iridescenceThicknessRange={[120, 900]}
      />
    </mesh>
  );
}

function Installation({
  id,
  position,
  onOpen,
}: {
  id: VignetteId;
  position: [number, number, number];
  onOpen: (id: VignetteId) => void;
}) {
  const group = useRef<Group>(null!);
  const [hover, setHover] = useState(false);
  const vig = CONCEPT_VIGNETTES[id];

  return (
    <group
      ref={group}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHover(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <Plinth />
      <group position={[0, 1.7, 0]} scale={hover ? 1.05 : 1}>
        <InstallationForm id={id} />
      </group>
      <Html position={[0, 2.55, 0]} center distanceFactor={7} occlude>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#1A1918',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: hover ? 1 : 0.7,
          }}
        >
          {vig.label}
        </span>
      </Html>
    </group>
  );
}

function GalleryRoom() {
  return (
    <>
      {/* polished concrete floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 4, -6]}>
        <planeGeometry args={[24, 8]} />
        <meshStandardMaterial color="#f4f1ea" roughness={1} />
      </mesh>
      {/* side walls */}
      <mesh position={[-8, 4, -1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#efece5" roughness={1} />
      </mesh>
      <mesh position={[8, 4, -1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#efece5" roughness={1} />
      </mesh>
      {/* champagne wordmark etched into the floor at the entry point */}
      <mesh position={[0, 0.005, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 0.42]} />
        <meshStandardMaterial color="#BFA37A" transparent opacity={0.32} roughness={1} />
      </mesh>
    </>
  );
}

function DemoLightbox({ id, onClose }: { id: VignetteId; onClose: () => void }) {
  const vig = CONCEPT_VIGNETTES[id];
  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-[#1A1918]/85 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 text-[#FBFAF6]">
        <span
          className="text-[11px] uppercase tracking-[0.22em]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Concept demo · {vig.label} · independent concept, not endorsed by the named organisation
        </span>
        <button
          onClick={onClose}
          className="rounded-full border border-white/25 px-4 py-1 text-[12px] transition-colors hover:bg-white/10"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Close
        </button>
      </div>
      <iframe
        src={vig.href}
        title={`${vig.label} concept demo`}
        className="flex-1 w-full border-0 bg-white"
        allow="fullscreen; clipboard-write"
      />
    </div>
  );
}

export function GalleryScene() {
  const [open, setOpen] = useState<VignetteId | null>(null);

  return (
    <section
      id="gallery"
      aria-label="assembl gallery — walkable installations of the three concept demos"
      className="relative w-full bg-[#EFECE5]"
      style={{ height: '100svh' }}
    >
      <Canvas
        frameloop="always"
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 2.2, 4.8], fov: 44 }}
      >
        <color attach="background" args={['#EFECE5']} />

        {/* No hardware shadows — ContactShadows below fakes floor contact
            without the shadow-map memory + render-pass cost that seemed to
            wedge R3F at desktop viewport sizes. */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 10, 3]} intensity={1.6} />
        <spotLight position={[0, 6, 2]} angle={0.55} penumbra={0.8} intensity={1.0} color="#fff2d8" />

        <GalleryRoom />
        {INSTALLATIONS.map((inst) => (
          <Installation
            key={inst.id}
            id={inst.id}
            position={inst.position}
            onOpen={setOpen}
          />
        ))}
        <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={16} blur={2.2} far={5} />
        <Sparkles count={40} scale={[10, 4, 8]} size={2.5} speed={0.25} color="#BFA37A" opacity={0.55} />

        <Suspense fallback={null}>
          <Environment preset="apartment" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={3.5}
          maxDistance={9}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 1.6, -1.5]}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-6 top-6 flex items-start justify-between text-[#1A1918]/75 sm:inset-x-10 lg:inset-x-16">
        <span className="text-[10px] uppercase tracking-[0.32em] sm:text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>
          The Gallery · Three concept installations · drag to look, tap an object to open
        </span>
        <span className="hidden text-[10px] uppercase tracking-[0.32em] sm:inline sm:text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>
          Independent concepts · not endorsed by the named organisations
        </span>
      </div>

      {open ? <DemoLightbox id={open} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}
