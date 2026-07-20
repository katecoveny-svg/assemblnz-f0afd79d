'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
// drei's flat `@react-three/drei` .d.ts only re-exports Html. Every other
// component lives at a subpath; importing from the top hits a Vercel
// typecheck failure. Keep subpaths so future drei users don't repeat this.
import { Environment } from '@react-three/drei/core/Environment';
import { Lightformer } from '@react-three/drei/core/Lightformer';
import { OrbitControls } from '@react-three/drei/core/OrbitControls';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';
import { MeshReflectorMaterial } from '@react-three/drei/core/MeshReflectorMaterial';
import { Sparkles } from '@react-three/drei/core/Sparkles';
import { Html } from '@react-three/drei';
import type { Group } from 'three';
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
      // edges pushed back, centre pulled forward → concave toward camera
      const z = -2.4 - Math.abs(t) * 2.1;
      return { id, position: [x, 0, z] as [number, number, number] };
    });
  }, []);
}

function Plinth() {
  return (
    <mesh position={[0, 0.55, 0]} castShadow={false}>
      <boxGeometry args={[1.05, 1.1, 1.05]} />
      <meshStandardMaterial color="#f2efe8" roughness={0.9} metalness={0.02} />
    </mesh>
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
      <group ref={spin} position={[0, 1.55, 0]} scale={hover ? 0.92 : 0.86}>
        <PartMesh id={id} />
      </group>
      <Html position={[0, 2.5, 0]} center distanceFactor={9} occlude>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            transition: 'opacity 200ms ease',
            opacity: hover ? 1 : 0.72,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: '#1A1918',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
            }}
          >
            {part.label}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 9.5,
              color: 'rgba(26,25,24,0.55)',
              letterSpacing: '0.02em',
              opacity: hover ? 1 : 0,
              transition: 'opacity 200ms ease',
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
 * six parts it is made from. Recognisable at a glance as the only thing in
 * the hall that floats with no plinth and carries an orbiting ring.
 *
 * Deliberately clean polished chrome — NO glow, NO light shaft, NO
 * iridescence. All three were killed: the shaft blew out the top of the
 * frame, and the glow + iridescence threw pink/yellow/green across the
 * plinths and the reflective floor and drowned the other objects. The float
 * and the ring alone read it as "the agent".
 */
function AssemblAgent() {
  const bob = useRef<Group>(null!);
  const ring = useRef<Group>(null!);

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    if (bob.current) {
      bob.current.position.y = 2.7 + Math.sin(t * 0.7) * 0.12;
      bob.current.rotation.y += dt * 0.25;
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.4;
      ring.current.rotation.x = Math.PI / 2.6 + Math.sin(t * 0.5) * 0.08;
    }
  });

  return (
    <group position={[0, 0, -3.6]}>
      <group ref={bob} position={[0, 2.7, 0]}>
        {/* the agent — polished chrome identity core, same family as the
            chrome parts below, just larger and airborne */}
        <mesh>
          <sphereGeometry args={[0.72, 96, 96]} />
          <meshPhysicalMaterial
            color="#eceae6"
            metalness={1}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.04}
            envMapIntensity={2}
          />
        </mesh>

        {/* the assembled ring — boundaries made part of the whole */}
        <group ref={ring}>
          <mesh>
            <torusGeometry args={[1.12, 0.035, 24, 160]} />
            <meshPhysicalMaterial
              color="#c9ccd0"
              metalness={0.95}
              roughness={0.18}
              clearcoat={0.7}
              clearcoatRoughness={0.15}
              envMapIntensity={1.5}
            />
          </mesh>
        </group>

        <Html position={[0, 1.7, 0]} center distanceFactor={9}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                fontSize: 12.5,
                color: '#1A1918',
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
              }}
            >
              {GALLERY_AGENT.label}
            </div>
            <div style={{ marginTop: 4, fontSize: 9.5, color: 'rgba(26,25,24,0.6)' }}>
              {GALLERY_AGENT.helper}
            </div>
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
          color="#e7e3da"
          metalness={0.18}
          mirror={0.32}
        />
      </mesh>

      {/* back + side walls, warm matte white */}
      <mesh position={[0, 5, -8]}>
        <planeGeometry args={[40, 12]} />
        <meshStandardMaterial color="#f5f2eb" roughness={1} />
      </mesh>
      <mesh position={[-11, 5, -2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#efece5" roughness={1} />
      </mesh>
      <mesh position={[11, 5, -2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#efece5" roughness={1} />
      </mesh>

      {/* ceiling light bars — soft emissive fixtures. Kept gentle so the top
          of the frame doesn't blow out and wash the suspended agent to white. */}
      {[-4, 0, 4].map((x) => (
        <mesh key={x} position={[x, 7.4, -2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.1, 9]} />
          <meshBasicMaterial color="#efe7d5" />
        </mesh>
      ))}

      {/* champagne wordmark etched into the floor at the entry point */}
      <mesh position={[0, 0.006, 3.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 0.44]} />
        <meshStandardMaterial color="#BFA37A" transparent opacity={0.28} roughness={1} />
      </mesh>
    </>
  );
}

/**
 * The reflection environment — a small studio built from Lightformers on a
 * dark backdrop. This is what gives the chrome its bright softbox streaks and
 * deep gaps (how real polished metal reads), while the visible scene stays
 * the bright paper hall. resolution + one bake keep it cheap.
 */
function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Light base so the chrome reads as bright silver, not black. A dark
          env backdrop made the chrome parts mirror black and go nearly as dark
          as the obsidian core — the softboxes below add the bright streaks and
          warm/cool split on top of this. */}
      <color attach="background" args={['#e0dcd3']} />
      {/* big soft key overhead */}
      <Lightformer form="rect" intensity={2.3} position={[0, 6, -5]} scale={[14, 7, 1]} color="#ffffff" />
      {/* warm fill from the left, cool from the right — the two-tone that
          makes chrome look lit rather than painted */}
      <Lightformer
        form="rect"
        intensity={1.5}
        position={[-8, 2, 2]}
        rotation-y={Math.PI / 2}
        scale={[10, 9, 1]}
        color="#fff0d8"
      />
      <Lightformer
        form="rect"
        intensity={1.5}
        position={[8, 2, 2]}
        rotation-y={-Math.PI / 2}
        scale={[10, 9, 1]}
        color="#e4eeff"
      />
      {/* a soft ring in front for a catchlight */}
      <Lightformer form="ring" intensity={1.1} position={[0, 3, 6]} scale={5} color="#ffffff" />
    </Environment>
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
        <color attach="background" args={['#EFECE5']} />
        <fog attach="fog" args={['#EFECE5', 12, 30]} />

        {/* No hardware shadow maps — ContactShadows fakes floor contact without
            the render-pass cost. Scene lights sit alongside the studio env. */}
        <hemisphereLight args={['#ffffff', '#e6e1d6', 0.6]} />
        <ambientLight intensity={0.32} />
        <directionalLight position={[5, 10, 4]} intensity={1.1} color="#fff6e8" />
        <directionalLight position={[-6, 5, -2]} intensity={0.5} color="#e6efff" />

        <GalleryRoom />
        <AssemblAgent />
        {layout.map((inst) => (
          <Installation key={inst.id} id={inst.id} position={inst.position} />
        ))}
        <ContactShadows position={[0, 0.02, 0]} opacity={0.32} scale={22} blur={2.6} far={6} color="#2a2622" />
        <Sparkles count={36} scale={[14, 5, 10]} size={2.2} speed={0.2} color="#BFA37A" opacity={0.5} />

        <Suspense fallback={null}>
          <StudioEnvironment />
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
