'use client';

import type { RefObject } from 'react';
import type { Mesh } from 'three';
import { AGENT_PARTS, type PartId, type PartMaterial } from '@/lib/copy/editorial-home';

/**
 * One agent part as a mesh — the single source of truth for what each part
 * LOOKS like, shared by the inline poster vignettes and the gallery
 * installations so a part is the same object everywhere.
 *
 * Geometry per shape, material per family:
 *   obsidian → deep black, high clearcoat (Intelligence — the odd one out)
 *   chrome   → polished metal in the part's tint (Memory / Knowledge /
 *              Abilities / Voice)
 *   brushed  → softer metal, a little rougher (Boundaries ring)
 *
 * The mesh is unrotated; callers spin it. `scale` sizes it for its context
 * (small inline, larger on a plinth).
 */

function materialProps(material: PartMaterial, tint: string) {
  if (material === 'obsidian') {
    return {
      color: tint,
      metalness: 0.5,
      roughness: 0.04,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 2.2,
    };
  }
  if (material === 'brushed') {
    return {
      color: tint,
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.6,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.7,
    };
  }
  // chrome — punchier: more reflection, sharper
  return {
    color: tint,
    metalness: 1,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 2.7,
  };
}

export function PartMesh({
  id,
  meshRef,
  scale = 1,
}: {
  id: PartId;
  meshRef?: RefObject<Mesh | null>;
  scale?: number;
}) {
  const part = AGENT_PARTS[id];
  const mat = materialProps(part.material, part.tint);

  // Memory is two stacked cubes, so it's a group; everything else is a single
  // mesh carrying the spin ref.
  if (part.shape === 'cubes') {
    return (
      <group ref={meshRef as never} scale={scale}>
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[0.62, 0.62, 0.62]} />
          <meshPhysicalMaterial {...mat} />
        </mesh>
        <mesh position={[0.05, 0.36, 0.05]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.44, 0.44, 0.44]} />
          <meshPhysicalMaterial {...mat} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh ref={meshRef} scale={scale}>
      {part.shape === 'knot' && <torusKnotGeometry args={[0.44, 0.15, 220, 36, 2, 3]} />}
      {part.shape === 'octahedron' && <octahedronGeometry args={[0.62, 0]} />}
      {part.shape === 'capsule' && <capsuleGeometry args={[0.3, 0.66, 16, 32]} />}
      {part.shape === 'sphere' && <sphereGeometry args={[0.55, 64, 64]} />}
      {part.shape === 'ring' && <torusGeometry args={[0.5, 0.11, 24, 140]} />}
      <meshPhysicalMaterial {...mat} />
    </mesh>
  );
}
