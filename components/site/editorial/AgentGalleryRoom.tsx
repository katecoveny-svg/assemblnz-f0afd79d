'use client';

import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
} from '@react-three/drei';
import { RoundedBox } from '@react-three/drei/core/RoundedBox';
import { useCursor } from '@react-three/drei/web/useCursor';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import styles from './gallery-hero.module.css';

const PARTS = [
  {
    id: 'memory',
    label: 'memory',
    helper: 'Choose what it remembers between conversations.',
  },
  {
    id: 'knowledge',
    label: 'knowledge',
    helper: 'Choose the trusted sources it can look things up in.',
  },
  {
    id: 'intelligence',
    label: 'intelligence',
    helper: 'Give it the judgement and instructions for the job.',
  },
  {
    id: 'voice',
    label: 'voice',
    helper: 'Set how it sounds, responds and represents your business.',
  },
  {
    id: 'abilities',
    label: 'abilities',
    helper: 'Choose the useful work it is allowed to prepare.',
  },
  {
    id: 'boundaries',
    label: 'boundaries',
    helper: 'Make approvals and hard limits visible from the start.',
  },
] as const;

type PartId = (typeof PARTS)[number]['id'];

const POSITIONS: Record<PartId, [number, number, number]> = {
  memory: [-4.35, 0, 0.18],
  knowledge: [-2.62, 0, -0.18],
  intelligence: [-0.88, 0, 0.12],
  voice: [0.88, 0, 0.12],
  abilities: [2.62, 0, -0.18],
  boundaries: [4.35, 0, 0.18],
};

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function CameraRig({ active }: { active: PartId }) {
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());

  useFrame(() => {
    const portrait = size.width / size.height < 0.76;
    const activeX = POSITIONS[active][0];
    desired.current.set(portrait ? activeX : 0, portrait ? 0.5 : 0.85, portrait ? 7.4 : 12.6);
    target.current.set(portrait ? activeX : 0, 0.25, 0);
    camera.position.lerp(desired.current, 0.055);
    camera.lookAt(target.current);
  });

  return null;
}

function Sculpture({ id, active }: { id: PartId; active: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      active ? 0.16 : 0,
      0.08,
    );
    const scale = THREE.MathUtils.lerp(group.current.scale.x, active ? 1.1 : 1, 0.08);
    group.current.scale.setScalar(scale);
  });

  const silver = (
    <meshPhysicalMaterial
      color="#d9d6ce"
      metalness={0.88}
      roughness={0.12}
      clearcoat={1}
      clearcoatRoughness={0.08}
      envMapIntensity={1.5}
    />
  );

  const gold = (
    <meshPhysicalMaterial
      color="#b8964f"
      metalness={0.82}
      roughness={0.14}
      clearcoat={0.9}
      clearcoatRoughness={0.08}
      envMapIntensity={1.6}
    />
  );

  return (
    <group ref={group} position={[0, 0, 0]}>
      {id === 'memory' && (
        <group rotation={[0, -0.25, 0]}>
          <mesh position={[-0.12, 0.05, 0]} rotation={[0.04, 0.18, -0.03]}>
            <boxGeometry args={[0.5, 0.52, 0.5]} />
            {gold}
          </mesh>
          <mesh position={[0.12, 0.52, 0]} rotation={[0.05, -0.35, 0.08]}>
            <boxGeometry args={[0.42, 0.42, 0.42]} />
            {silver}
          </mesh>
        </group>
      )}

      {id === 'knowledge' && (
        <mesh position={[0, 0.23, 0]} rotation={[0.08, 0.2, -0.04]}>
          <octahedronGeometry args={[0.58, 0]} />
          {gold}
        </mesh>
      )}

      {id === 'intelligence' && (
        <mesh position={[0, 0.2, 0]} rotation={[0.35, 0.05, 0.25]}>
          <torusKnotGeometry args={[0.4, 0.14, 170, 28, 2, 3]} />
          <meshPhysicalMaterial
            color="#0b0c0d"
            metalness={0.48}
            roughness={0.06}
            clearcoat={1}
            clearcoatRoughness={0.03}
            envMapIntensity={1.8}
          />
        </mesh>
      )}

      {id === 'voice' && (
        <mesh position={[0, 0.24, 0]}>
          <sphereGeometry args={[0.48, 48, 48]} />
          {gold}
        </mesh>
      )}

      {id === 'abilities' && (
        <mesh position={[0, 0.24, 0]}>
          <capsuleGeometry args={[0.28, 0.62, 16, 32]} />
          {silver}
        </mesh>
      )}

      {id === 'boundaries' && (
        <mesh position={[0, 0.23, 0]} rotation={[Math.PI / 2, 0.08, 0]}>
          <torusGeometry args={[0.51, 0.12, 28, 96]} />
          {silver}
        </mesh>
      )}
    </group>
  );
}

function Exhibit({ id, active, onSelect }: { id: PartId; active: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group
      position={POSITIONS[id]}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox args={[1.14, 1.22, 1.08]} radius={0.08} smoothness={4} position={[0, -0.96, 0]}>
        <meshStandardMaterial color={active ? '#fffdf8' : '#f8f6f1'} roughness={0.72} />
      </RoundedBox>
      <mesh position={[0, -0.33, 0]}>
        <boxGeometry args={[0.9, 0.026, 0.84]} />
        <meshStandardMaterial color={active ? '#b8964f' : '#dedad1'} roughness={0.5} />
      </mesh>
      <Sculpture id={id} active={active} />
    </group>
  );
}

function GalleryScene({ active, onSelect }: { active: PartId; onSelect: (id: PartId) => void }) {
  return (
    <>
      <color attach="background" args={['#f4f1ea']} />
      <fog attach="fog" args={['#f4f1ea', 11, 24]} />
      <ambientLight intensity={0.8} />
      <hemisphereLight args={['#ffffff', '#c8c2b7', 1.15]} />
      <directionalLight position={[-5, 8, 7]} intensity={2.2} color="#fffaf0" />
      <directionalLight position={[5, 5, 2]} intensity={1.15} color="#e6eff2" />

      <Environment resolution={128}>
        <Lightformer intensity={4} position={[0, 6, 4]} scale={[10, 3, 1]} />
        <Lightformer intensity={2} position={[-5, 1, 2]} scale={[3, 7, 1]} />
        <Lightformer intensity={2} position={[5, 2, 1]} scale={[3, 6, 1]} />
      </Environment>

      <mesh position={[0, 2.35, -3.4]}>
        <planeGeometry args={[24, 9]} />
        <meshStandardMaterial color="#f7f4ee" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.58, 0]}>
        <planeGeometry args={[26, 24]} />
        <MeshReflectorMaterial
          color="#e6e2d9"
          blur={[180, 52]}
          resolution={512}
          mixBlur={1}
          mixStrength={0.34}
          roughness={0.78}
          depthScale={0.25}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.3}
          metalness={0.08}
        />
      </mesh>

      <mesh position={[0.1, 2.38, -1.85]}>
        <sphereGeometry args={[0.78, 56, 56]} />
        <meshPhysicalMaterial
          color="#c7ae7b"
          metalness={0.78}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.8}
        />
      </mesh>

      {PARTS.map((part) => (
        <Exhibit
          key={part.id}
          id={part.id}
          active={active === part.id}
          onSelect={() => onSelect(part.id)}
        />
      ))}

      <ContactShadows
        position={[0, -1.56, 0]}
        scale={15}
        far={4}
        blur={2.6}
        opacity={0.28}
        resolution={512}
        color="#413d36"
      />
      <CameraRig active={active} />
    </>
  );
}

export function AgentGalleryRoom() {
  const [active, setActive] = useState<PartId>('intelligence');
  const [webglReady, setWebglReady] = useState(false);
  const activePart = PARTS.find((part) => part.id === active) ?? PARTS[2];

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWebglReady(hasWebGL()));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={styles.galleryShell}>
      <div className={styles.galleryTitle}>
        <span>the assembl agent</span>
        <small>six visible parts · one useful role</small>
      </div>

      <div className={styles.fallbackRoom} aria-hidden>
        <div className={styles.fallbackOrb} />
        <div className={styles.fallbackPlinths}>
          {PARTS.map((part) => (
            <div key={part.id} className={styles.fallbackExhibit}>
              <span className={`${styles.fallbackObject} ${styles[`fallback_${part.id}`]}`} />
              <i />
            </div>
          ))}
        </div>
      </div>

      {webglReady ? (
        <Canvas
          className={styles.galleryCanvas}
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.85, 12.6], fov: 43, near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.08;
          }}
        >
          <GalleryScene active={active} onSelect={setActive} />
        </Canvas>
      ) : null}

      <div className={styles.plinthLabels} aria-hidden>
        {PARTS.map((part) => (
          <span key={part.id} data-active={active === part.id}>
            {part.label}
          </span>
        ))}
      </div>

      <div className={styles.galleryControls}>
        <div className={styles.galleryReadout} aria-live="polite">
          <span>{String(PARTS.findIndex((part) => part.id === active) + 1).padStart(2, '0')} / 06</span>
          <div>
            <strong>{activePart.label}</strong>
            <p>{activePart.helper}</p>
          </div>
        </div>

        <div className={styles.partSelector} aria-label="Explore the six parts of an assembl agent">
          {PARTS.map((part) => (
            <button
              key={part.id}
              type="button"
              aria-pressed={active === part.id}
              onClick={() => setActive(part.id)}
            >
              {part.label}
            </button>
          ))}
        </div>

        <Link href="/build-an-agent#intake" className={styles.galleryAction}>
          build yours <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
