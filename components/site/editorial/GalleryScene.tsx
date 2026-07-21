'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
// drei's flat `@react-three/drei` .d.ts only re-exports Html. Every other
// component lives at a subpath; importing from the top hits a Vercel
// typecheck failure. Keep subpaths so future drei users don't repeat this.
import { Environment } from '@react-three/drei/core/Environment';
import { OrbitControls } from '@react-three/drei/core/OrbitControls';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';
import { MeshReflectorMaterial } from '@react-three/drei/core/MeshReflectorMaterial';
import { MeshDistortMaterial } from '@react-three/drei/core/MeshDistortMaterial';
import { RoundedBox } from '@react-three/drei/core/RoundedBox';
import { Sparkles } from '@react-three/drei/core/Sparkles';
import { Html } from '@react-three/drei';
import { BackSide, type Group } from 'three';
import {
  AGENT_PARTS,
  GALLERY_PART_ORDER,
  GALLERY_AGENT,
  GALLERY_CAPTION,
  type PartId,
} from '@/lib/copy/editorial-home';
import { PartMesh } from './PartMesh';

/**
 * Where each part stands. A shallow arc that bows toward the camera at the
 * centre, so all six read at once and the edges recede into the hall.
 */
function useLayout() {
  return useMemo(() => {
    const n = GALLERY_PART_ORDER.length;
    const spread = 9.4; // total width across the arc
    return GALLERY_PART_ORDER.map((id, i) => {
      const t = n === 1 ? 0 : i / (n - 1) - 0.5; // -0.5 … 0.5
      const x = t * spread;
      // shallow concave arc — flattened so the plinths (and their placards)
      // read as more of a line than a deep curve.
      const z = -2.4 - Math.abs(t) * 1.2;
      return { id, position: [x, 0, z] as [number, number, number] };
    });
  }, []);
}

function Plinth() {
  return (
    <RoundedBox
      args={[1.05, 1.15, 1.05]}
      radius={0.16}
      smoothness={6}
      position={[0, 0.575, 0]}
      castShadow={false}
    >
      <meshStandardMaterial color="#f2efe8" roughness={0.9} metalness={0.02} />
    </RoundedBox>
  );
}

function Installation({
  id,
  position,
}: {
  id: PartId;
  position: [number, number, number];
}) {
  const spin = useRef<Group>(null!);
  const [hover, setHover] = useState(false);
  const part = AGENT_PARTS[id];

  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * (hover ? 0.4 : 0.16);
  });

  return (
    <group
      position={position}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'grab';
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <Plinth />
      {/* the part, floating just above the plinth top */}
      <group ref={spin} position={[0, 1.62, 0]} scale={hover ? 0.94 : 0.88}>
        <PartMesh id={id} />
      </group>
      {/* placard ON the plinth front face — frees the air above the parts and
          keeps the name + description together and readable. */}
      <Html position={[0, 0.66, 0.53]} center distanceFactor={7.5}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
            width: 150,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#1A1918',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {part.label}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 8,
              lineHeight: 1.45,
              color: 'rgba(26,25,24,0.6)',
              letterSpacing: '0.01em',
            }}
          >
            {part.helper}
          </div>
        </div>
      </Html>
    </group>
  );
}

/**
 * The centrepiece — the assembled agent itself, suspended mid-air above the
 * six parts it is made from.
 *
 * Reads as ALIVE, not a planet: the chrome surface flows and folds like
 * liquid mercury (MeshDistortMaterial), as though the parts are still
 * assembling into it. No ring, no glow — the fluid motion and the float are
 * what make it the agent. A slow scale-breath adds to the "coalescing" read.
 */
function AssemblAgent() {
  const bob = useRef<Group>(null!);
  const core = useRef<Group>(null!);

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    if (bob.current) {
      bob.current.position.y = 2.7 + Math.sin(t * 0.7) * 0.12;
      bob.current.rotation.y += dt * 0.18;
    }
    if (core.current) {
      const s = 1 + Math.sin(t * 0.9) * 0.04;
      core.current.scale.set(s, 1 / Math.sqrt(s), s);
    }
  });

  return (
    <group position={[0, 0, -3.6]}>
      <group ref={bob} position={[0, 2.7, 0]}>
        {/* the agent — a fluid chrome body, mercury mid-assembly */}
        <group ref={core}>
          <mesh>
            <sphereGeometry args={[0.82, 160, 160]} />
            {/* roughness a touch higher than the parts so the apartment HDRI
                smears into soft warm shine on the blob instead of a readable
                room, while still reading as polished liquid metal. */}
            <MeshDistortMaterial
              color="#edeae5"
              metalness={1}
              roughness={0.16}
              envMapIntensity={2.4}
              distort={0.6}
              speed={2.8}
            />
          </mesh>
        </group>

        <Html position={[0, 2.15, 0]} center distanceFactor={9}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 14,
              color: '#1A1918',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              textShadow:
                '0 0 14px rgba(250,249,246,0.95), 0 0 6px rgba(250,249,246,0.9), 0 1px 2px rgba(250,249,246,0.9)',
            }}
          >
            {GALLERY_AGENT.label}
          </div>
        </Html>
      </group>
    </group>
  );
}

/** The hall — polished reflective floor, warm-white walls, ceiling light bars. */
function GalleryRoom() {
  return (
    <>
      {/* polished concrete floor with real reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          resolution={1024}
          mixBlur={0.8}
          mixStrength={1.3}
          blur={[180, 60]}
          roughness={0.9}
          depthScale={0}
          color="#e4ddcd"
          metalness={0.2}
          mirror={0.4}
        />
      </mesh>

      {/* curved cyclorama — one seamless curved wall wrapping the hall instead
          of three flat planes. A photographer's infinity curve; reads as a
          soft, rounded room. Inner faces only (BackSide); open-ended so it
          never caps into a ceiling or floor over the reflective plane. */}
      <mesh position={[0, 6, -1.5]}>
        <cylinderGeometry args={[11.5, 11.5, 20, 96, 1, true]} />
        <meshStandardMaterial color="#efece4" roughness={1} side={BackSide} />
      </mesh>

      {/* champagne wordmark etched into the floor at the entry point */}
      <mesh position={[0, 0.006, 3.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 0.44]} />
        <meshStandardMaterial color="#BFA37A" transparent opacity={0.28} roughness={1} />
      </mesh>
    </>
  );
}

export function GalleryScene() {
  const layout = useLayout();

  return (
    <section
      aria-label="the assembl gallery — the six parts of an agent"
      className="relative w-full bg-[#EFECE5]"
      style={{ height: '100svh' }}
    >
      <Canvas
        frameloop="always"
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 2.5, 8.5], fov: 46, near: 0.1, far: 100 }}
      >
        <color attach="background" args={['#F1ECE1']} />
        <fog attach="fog" args={['#F1ECE1', 12, 30]} />

        {/* Kept deliberately LOW. The chrome's shine comes almost entirely
            from the apartment HDRI reflections below — a lot of flat fill light
            here washes out the reflection contrast and the objects fade into
            the pale hall. One warm key for a highlight, one cool rim, minimal
            ambient. */}
        <hemisphereLight args={['#fff3e0', '#e6dcc8', 0.28]} />
        <ambientLight intensity={0.16} color="#fff2df" />
        <directionalLight position={[5, 10, 4]} intensity={1.5} color="#fff0d4" />
        <directionalLight position={[-6, 5, -2]} intensity={0.5} color="#dfe8ff" />

        <GalleryRoom />
        <AssemblAgent />
        {layout.map((inst) => (
          <Installation key={inst.id} id={inst.id} position={inst.position} />
        ))}
        <ContactShadows position={[0, 0.02, 0]} opacity={0.32} scale={22} blur={2.6} far={6} color="#2a2622" />
        <Sparkles count={36} scale={[14, 5, 10]} size={2.2} speed={0.2} color="#BFA37A" opacity={0.5} />

        {/* apartment HDRI — the ONLY version that read crisp and shiny (every
            custom Lightformer studio I tried went soft and faded, because big
            soft area lights give low-contrast reflections). Its one flaw was
            the room showing in the big blob — fixed at the blob itself by
            softening its roughness, NOT by re-lighting the whole scene. */}
        <Suspense fallback={null}>
          <Environment preset="apartment" background={false} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={12}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 1.4, -2]}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-6 top-6 flex items-start justify-between text-[#1A1918]/75 sm:inset-x-10 lg:inset-x-16">
        <span
          className="text-[10px] uppercase tracking-[0.32em] sm:text-[11px]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {GALLERY_CAPTION.left}
        </span>
        <span
          className="hidden text-[10px] uppercase tracking-[0.32em] sm:inline sm:text-[11px]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {GALLERY_CAPTION.right}
        </span>
      </div>
    </section>
  );
}
