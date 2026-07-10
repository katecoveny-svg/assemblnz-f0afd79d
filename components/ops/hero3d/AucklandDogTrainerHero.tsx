'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  CatmullRomCurve3,
  DoubleSide,
  TubeGeometry,
  Vector3,
  type Group,
  type Mesh,
} from 'three';

/**
 * Harbourside Dog Training hero — method-first, not daycare.
 *
 * No Franklin, no Happy Tails photography. A training-field massing:
 * soft ground plane, a living leash arc, handler + dog silhouettes as
 * simple volumes, and floating "hand-signal" rings in navy / blush.
 * Inventive and editorial — calm, method-first, not pack-life daycare.
 */
const NAVY = '#1B2A4A';
const BLUSH = '#D4A5B0';
const FOAM = '#F7EEF1';
const GOLD = '#C4A574';

function LeashArc() {
  const mesh = useRef<Mesh>(null);
  const geom = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(-1.15, 0.35, 0.4),
      new Vector3(-0.45, 0.95, 0.1),
      new Vector3(0.35, 0.55, -0.2),
      new Vector3(1.05, 0.28, 0.15),
    ]);
    return new TubeGeometry(curve, 64, 0.018, 10, false);
  }, []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    mesh.current.position.y = Math.sin(t * 0.7) * 0.04;
    mesh.current.rotation.z = Math.sin(t * 0.35) * 0.04;
  });

  return (
    <mesh ref={mesh} geometry={geom}>
      <meshStandardMaterial color={BLUSH} metalness={0.15} roughness={0.45} />
    </mesh>
  );
}

function SignalRing({
  position,
  colour,
  delay = 0,
}: {
  position: [number, number, number];
  colour: string;
  delay?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + delay;
    ref.current.rotation.x = t * 0.6;
    ref.current.rotation.y = t * 0.35;
    ref.current.scale.setScalar(0.92 + Math.sin(t * 1.4) * 0.08);
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[0.22, 0.018, 12, 48]} />
      <meshStandardMaterial
        color={colour}
        emissive={colour}
        emissiveIntensity={0.25}
        metalness={0.2}
        roughness={0.35}
      />
    </mesh>
  );
}

function Silhouette({
  position,
  scale = 1,
  colour,
}: {
  position: [number, number, number];
  scale?: number;
  colour: string;
}) {
  return (
    <group position={position} scale={scale}>
      {/* body */}
      <mesh position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.16, 0.55, 6, 12]} />
        <meshStandardMaterial color={colour} roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshStandardMaterial color={colour} roughness={0.65} />
      </mesh>
    </group>
  );
}

function DogForm({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]} rotation={[0, 0.4, 0]}>
        <capsuleGeometry args={[0.12, 0.42, 6, 12]} />
        <meshStandardMaterial color={NAVY} roughness={0.75} />
      </mesh>
      <mesh position={[0.28, 0.32, 0.05]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color={NAVY} roughness={0.7} />
      </mesh>
      <mesh position={[-0.28, 0.18, -0.02]} rotation={[0.4, 0, 0.6]}>
        <capsuleGeometry args={[0.03, 0.22, 4, 8]} />
        <meshStandardMaterial color={BLUSH} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function AucklandDogTrainerHero() {
  const field = useRef<Group>(null);

  useFrame((_, delta) => {
    if (field.current) field.current.rotation.y += delta * 0.08;
  });

  return (
    <group>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 2]} intensity={0.55} color="#fff8f4" />
      <directionalLight position={[-2, 2, -1]} intensity={0.25} color={BLUSH} />

      <group ref={field} position={[0, -0.35, 0]}>
        {/* training field disc */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <circleGeometry args={[2.2, 64]} />
          <meshStandardMaterial
            color={FOAM}
            roughness={0.92}
            metalness={0}
            side={DoubleSide}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[1.55, 1.62, 64]} />
          <meshBasicMaterial color={NAVY} transparent opacity={0.35} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <ringGeometry args={[0.85, 0.9, 64]} />
          <meshBasicMaterial color={BLUSH} transparent opacity={0.45} />
        </mesh>

        <Silhouette position={[-0.95, 0, 0.35]} colour={NAVY} />
        <DogForm position={[0.95, 0, 0.2]} />
        <LeashArc />

        <SignalRing position={[-0.2, 1.35, 0.5]} colour={BLUSH} delay={0} />
        <SignalRing position={[0.55, 1.55, -0.2]} colour={GOLD} delay={0.8} />
        <SignalRing position={[-0.7, 1.7, -0.35]} colour={NAVY} delay={1.4} />
      </group>
    </group>
  );
}
