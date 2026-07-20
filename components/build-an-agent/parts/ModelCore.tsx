'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';
import { useDrag3D } from '../hooks/useDrag3D';
import { PartLabel } from './PartLabel';

interface Props {
  initialPosition?: [number, number, number];
  reduced?: boolean;
  speaking?: boolean;
  onMove?: (position: [number, number, number]) => void;
}

// Active-state accent (new canon): restrained sea-glass, not gold.
const SEAGLASS = '#7FA8A0';

/**
 * The intelligence core — a polished black obsidian torus knot (the form Kate
 * asked to bring back). Interwoven = reasoning; obsidian gloss + studio
 * reflections make it the sharpest object in the scene. The boundaries ring
 * orbits AROUND it (canon: ring = the clear outer shell), so boundaries
 * follow the core wherever it's dragged instead of floating loose.
 *
 * Dragging happens on an invisible proxy sphere — grabbing a thin knot tube
 * is fiddly; a fat hit-target isn't.
 *
 * While `speaking` is true (a real Claude answer is streaming below), the
 * knot spins faster, bobs harder, pulses in scale, and a sea-glass halo
 * fades in.
 */
export function ModelCore({
  initialPosition = [0, 0.6, 0],
  reduced = false,
  speaking = false,
  onMove,
}: Props) {
  const knotRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const drag = useDrag3D(initialPosition, 0.6);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (knotRef.current) {
      if (reduced) {
        knotRef.current.rotation.set(0, 0, 0);
      } else {
        const spin = speaking ? 0.55 : 0.2;
        knotRef.current.rotation.y = t * spin;
        knotRef.current.rotation.x = Math.sin(t * 0.35) * 0.1;
      }
      if (!drag.isDragging && !reduced) {
        const bobAmp = speaking ? 0.07 : 0.03;
        const bobFreq = speaking ? 2.2 : 0.8;
        knotRef.current.position.y = drag.position[1] + Math.sin(t * bobFreq) * bobAmp;
      } else {
        knotRef.current.position.y = drag.position[1];
      }
      const scale = speaking && !reduced ? 1 + Math.sin(t * 3) * 0.035 : 1;
      knotRef.current.scale.setScalar(scale);
      if (onMove) onMove(drag.position);
    }
    if (ringRef.current && !reduced) {
      ringRef.current.rotation.z = t * 0.12;
    }
    if (haloRef.current) {
      const targetOpacity = speaking ? 0.3 + (Math.sin(t * 2.4) + 1) * 0.12 : 0;
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity += (targetOpacity - m.opacity) * 0.12;
    }
  });

  return (
    <group position={[drag.position[0], 0, drag.position[2]]}>
      {/* Invisible drag proxy — the fat hit-target that carries all pointer
          handling for the core. */}
      <mesh
        position={[0, drag.position[1], 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = drag.isDragging ? 'grabbing' : 'grab';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
        {...drag.handlers}
      >
        <sphereGeometry args={[0.72, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* The obsidian knot — glossy black, crisp studio reflections. */}
      <mesh ref={knotRef} position={[0, drag.position[1], 0]}>
        <torusKnotGeometry args={[0.34, 0.115, 220, 36, 2, 3]} />
        <meshPhysicalMaterial
          color="#0B0B0D"
          metalness={0.35}
          roughness={0.06}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.7}
        />
      </mesh>

      {/* Boundaries — the precision hoop around the core (brushed silver).
          No pointer handlers: it never blocks dragging the core. */}
      <mesh
        ref={ringRef}
        position={[0, drag.position[1], 0]}
        rotation={[Math.PI / 2 + 0.14, 0, 0]}
      >
        <torusGeometry args={[0.92, 0.02, 20, 140]} />
        <meshPhysicalMaterial
          color="#C9CCD0"
          metalness={0.92}
          roughness={0.24}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Shadow disc under the assembly. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.72, 48]} />
        <meshBasicMaterial color="#1A1918" transparent opacity={drag.isDragging ? 0.16 : 0.1} />
      </mesh>

      {/* Speaking halo — sea-glass active state, faded in while streaming. */}
      <mesh ref={haloRef} position={[0, drag.position[1], 0]}>
        <sphereGeometry args={[0.6, 48, 48]} />
        <meshBasicMaterial
          color={SEAGLASS}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      <PartLabel text={BUILD_AN_AGENT.parts.modelCore.label} />
      <PartLabel text={BUILD_AN_AGENT.parts.guardrails.label} x={1.18} y={0.55} />
    </group>
  );
}
