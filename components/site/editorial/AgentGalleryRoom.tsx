'use client';

import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
} from '@react-three/drei';
import { OrbitControls, Sparkles } from '@react-three/drei/core';
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

export type AgentGalleryPartId = (typeof PARTS)[number]['id'];
type PartId = AgentGalleryPartId;

const POSITIONS: Record<PartId, [number, number, number]> = {
  memory: [-4.35, 0, 0.18],
  knowledge: [-2.62, 0, -0.18],
  intelligence: [-0.88, 0, 0.12],
  voice: [0.88, 0, 0.12],
  abilities: [2.62, 0, -0.18],
  boundaries: [4.35, 0, 0.18],
};

const MOTION_PHASE: Record<PartId, number> = {
  memory: 0,
  knowledge: 0.9,
  intelligence: 1.8,
  voice: 2.7,
  abilities: 3.6,
  boundaries: 4.5,
};

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function CameraRig({ active, focus }: { active: PartId; focus: boolean }) {
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!focus) return;
    const portrait = size.width / size.height < 0.76;
    const activeX = POSITIONS[active][0];
    desired.current.set(activeX, portrait ? 0.65 : 1.05, portrait ? 7.4 : 7.1);
    target.current.set(activeX, 0.15, 0);
    camera.position.lerp(desired.current, 0.055);
    camera.lookAt(target.current);
  });

  return null;
}

function Sculpture({ id, active }: { id: PartId; active: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const time = clock.getElapsedTime();
    const phase = MOTION_PHASE[id];
    const float = Math.sin(time * 0.72 + phase) * 0.075;
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      (active ? 0.16 : 0) + float,
      0.08,
    );
    group.current.rotation.y = time * (active ? 0.34 : 0.2) + phase;
    group.current.rotation.z = Math.sin(time * 0.4 + phase) * 0.035;
    const scale = THREE.MathUtils.lerp(group.current.scale.x, active ? 1.1 : 1, 0.08);
    group.current.scale.setScalar(scale);
  });

  const silver = (
    <meshPhysicalMaterial
      color="#e6ece8"
      metalness={0.94}
      roughness={0.075}
      clearcoat={1}
      clearcoatRoughness={0.035}
      envMapIntensity={2.4}
    />
  );

  const gold = (
    <meshPhysicalMaterial
      color="#d2b36e"
      metalness={0.9}
      roughness={0.085}
      clearcoat={1}
      clearcoatRoughness={0.035}
      envMapIntensity={2.5}
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
            color="#171b1a"
            metalness={0.72}
            roughness={0.045}
            clearcoat={1}
            clearcoatRoughness={0.03}
            envMapIntensity={2.6}
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

function AmbientOrb() {
  const orb = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!orb.current) return;
    const time = clock.getElapsedTime();
    orb.current.position.y = 2.38 + Math.sin(time * 0.46) * 0.16;
    orb.current.position.x = 0.1 + Math.sin(time * 0.23) * 0.22;
    orb.current.rotation.y = time * 0.16;
  });

  return (
    <group ref={orb} position={[0.1, 2.38, -1.85]}>
      <mesh>
        <sphereGeometry args={[0.78, 56, 56]} />
        <meshPhysicalMaterial
          color="#d7c9aa"
          metalness={0.94}
          roughness={0.055}
          clearcoat={1}
          clearcoatRoughness={0.035}
          envMapIntensity={3.1}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.2, 0]}>
        <torusGeometry args={[0.95, 0.018, 12, 96]} />
        <meshPhysicalMaterial color="#f5efe2" metalness={0.9} roughness={0.12} />
      </mesh>
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
      <mesh position={[0, -0.96, 0]}>
        <cylinderGeometry args={[0.49, 0.61, 1.22, 32]} />
        <meshStandardMaterial color={active ? '#fffdf8' : '#f8f6f1'} roughness={0.72} />
      </mesh>
      <mesh position={[0, -0.34, 0]}>
        <cylinderGeometry args={[0.53, 0.53, 0.045, 32]} />
        <meshStandardMaterial color={active ? '#b8964f' : '#dedad1'} roughness={0.5} />
      </mesh>
      <pointLight position={[0, 2.7, 1.15]} intensity={active ? 0.82 : 0.34} distance={5.5} color="#fff0d2" />
      <Sculpture id={id} active={active} />
    </group>
  );
}

function DataFlow() {
  const group = useRef<THREE.Group>(null);
  const count = 15;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const time = clock.getElapsedTime();
    group.current.children.forEach((child, index) => {
      const progress = (time * 0.075 + index / count) % 1;
      child.position.x = THREE.MathUtils.lerp(-4.7, 4.7, progress);
      child.position.y = -0.2 + Math.sin(progress * Math.PI * 5) * 0.055;
      child.position.z = -0.42 + Math.cos(progress * Math.PI * 3) * 0.045;
      const pulse = 0.6 + Math.sin(time * 2.2 + index) * 0.25;
      child.scale.setScalar(pulse);
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: count }, (_, index) => (
        <mesh key={index}>
          <sphereGeometry args={[0.026, 10, 10]} />
          <meshBasicMaterial color={index % 3 === 0 ? '#fff8df' : '#b8964f'} transparent opacity={0.68} />
        </mesh>
      ))}
    </group>
  );
}

function GalleryScene({ active, focus, onSelect }: { active: PartId; focus: boolean; onSelect: (id: PartId) => void }) {
  return (
    <>
      <color attach="background" args={['#efece5']} />
      <fog attach="fog" args={['#efece5', 12, 28]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#c7c0b5', 0.78]} />
      <directionalLight position={[-5, 9, 7]} intensity={2.4} color="#fff8e8" />
      <directionalLight position={[6, 5, 3]} intensity={1.55} color="#dfecef" />
      <spotLight position={[0, 7, 3]} angle={0.58} penumbra={0.82} intensity={1.2} color="#fff0d0" />

      <Environment resolution={256}>
        <Lightformer form="rect" intensity={7} color="#fffdf6" position={[0, 6, 4]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={4.5} color="#ffe6a8" position={[-5, 1, 2]} scale={[3, 8, 1]} />
        <Lightformer form="rect" intensity={4} color="#d7edf0" position={[5, 2, 1]} scale={[3, 7, 1]} />
        <Lightformer form="ring" intensity={3} color="#ffffff" position={[0, 1, -4]} scale={[5, 5, 1]} />
      </Environment>

      <mesh position={[0, 2.55, -4.8]}>
        <planeGeometry args={[25, 10]} />
        <meshStandardMaterial color="#f6f3ed" roughness={1} />
      </mesh>
      <mesh position={[-7.8, 2.55, -0.2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#eeeae2" roughness={1} />
      </mesh>
      <mesh position={[7.8, 2.55, -0.2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#eeeae2" roughness={1} />
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

      <AmbientOrb />

      {PARTS.map((part) => (
        <Exhibit
          key={part.id}
          id={part.id}
          active={active === part.id}
          onSelect={() => onSelect(part.id)}
        />
      ))}

      <DataFlow />

      <ContactShadows
        position={[0, -1.56, 0]}
        scale={15}
        far={4}
        blur={2.6}
        opacity={0.28}
        resolution={512}
        color="#413d36"
      />
      <Sparkles
        count={34}
        scale={[11, 3.8, 5]}
        size={1.7}
        speed={0.18}
        color="#bfa37a"
        opacity={0.38}
      />
      <CameraRig active={active} focus={focus} />
      <OrbitControls
        enabled={!focus}
        enablePan={false}
        enableZoom
        minDistance={8.8}
        maxDistance={14.2}
        minPolarAngle={Math.PI / 2.8}
        maxPolarAngle={Math.PI / 1.95}
        minAzimuthAngle={-0.34}
        maxAzimuthAngle={0.34}
        target={[0, 0.05, 0]}
        enableDamping
        dampingFactor={0.075}
        autoRotate
        autoRotateSpeed={0.18}
      />
    </>
  );
}

interface AgentGalleryRoomProps {
  activePart?: PartId;
  embedded?: boolean;
  focus?: boolean;
  onActivePartChange?: (part: PartId) => void;
}

export function AgentGalleryRoom({
  activePart,
  embedded = false,
  focus = false,
  onActivePartChange,
}: AgentGalleryRoomProps = {}) {
  const [internalActive, setInternalActive] = useState<PartId>('intelligence');
  const [webglReady, setWebglReady] = useState(false);
  const active = activePart ?? internalActive;
  const activeDefinition = PARTS.find((part) => part.id === active) ?? PARTS[2];

  const selectPart = (part: PartId) => {
    setInternalActive(part);
    onActivePartChange?.(part);
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWebglReady(hasWebGL()));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={styles.galleryShell} data-embedded={embedded ? 'true' : undefined}>
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
          camera={{ position: [0, 1.35, 11.8], fov: 43, near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.22;
          }}
        >
          <GalleryScene active={active} focus={focus} onSelect={selectPart} />
        </Canvas>
      ) : null}

      <div className={styles.plinthLabels} aria-hidden>
        {PARTS.map((part) => (
          <span key={part.id} data-active={active === part.id}>
            {part.label}
          </span>
        ))}
      </div>

      {!embedded ? <div className={styles.galleryControls}>
        <div className={styles.galleryReadout} aria-live="polite">
          <span>{String(PARTS.findIndex((part) => part.id === active) + 1).padStart(2, '0')} / 06</span>
          <div>
            <strong>{activeDefinition.label}</strong>
            <p>{activeDefinition.helper}</p>
          </div>
        </div>

        <div className={styles.partSelector} aria-label="Explore the six parts of an assembl agent">
          {PARTS.map((part) => (
            <button
              key={part.id}
              type="button"
              aria-pressed={active === part.id}
              onClick={() => selectPart(part.id)}
            >
              {part.label}
            </button>
          ))}
        </div>

        <Link href="/a" className={styles.galleryAction}>
          build yours <span aria-hidden>→</span>
        </Link>
      </div> : null}
    </div>
  );
}
