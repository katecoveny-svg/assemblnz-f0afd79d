'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BoxGeometry, EdgesGeometry, type Group } from 'three';

/**
 * TOA ARCHITECTS hero — a slow-turning wireframe massing study.
 *
 * TOA's brand is monochrome charcoal + white with photography carrying the
 * colour; we can't lift their photography, so the hero speaks in the other
 * language architects trust: the massing model. Three stacked volumes read as
 * a concept sketch — edges only, no faces — in charcoal line with a single
 * champagne node marking ARC (the assembl crossover accent, DIRECTION-LOCKED
 * 2026-07-01). Deliberately quiet next to the busier brand heroes.
 */
const CHARCOAL = '#363a35';
const SAGE = '#e2e7e3';
const CHAMPAGNE = '#bfa37a';

function Massing({
  position,
  size,
  colour,
}: {
  position: [number, number, number];
  size: [number, number, number];
  colour: string;
}) {
  const edges = useMemo(
    () => new EdgesGeometry(new BoxGeometry(...size)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sizes are static literals per call site
    [size[0], size[1], size[2]],
  );
  return (
    <lineSegments position={position} geometry={edges}>
      <lineBasicMaterial color={colour} />
    </lineSegments>
  );
}

export function ToaArchitectsHero() {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.18;
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <group ref={group} rotation={[0.12, 0.6, 0]} position={[0, -0.25, 0]}>
        {/* Ground plate */}
        <Massing position={[0, -0.45, 0]} size={[2.6, 0.06, 1.8]} colour={SAGE} />
        {/* Three stepped volumes — a simple terraced massing */}
        <Massing position={[-0.7, 0, 0.2]} size={[0.9, 0.9, 0.9]} colour={CHARCOAL} />
        <Massing position={[0.25, 0.2, -0.15]} size={[0.9, 1.3, 0.9]} colour={CHARCOAL} />
        <Massing position={[1.0, -0.1, 0.35]} size={[0.6, 0.7, 0.6]} colour={CHARCOAL} />
        {/* ARC node — the operating brain, champagne, at the junction */}
        <mesh position={[0.25, 1.0, -0.15]}>
          <sphereGeometry args={[0.07, 24, 24]} />
          <meshStandardMaterial
            color={CHAMPAGNE}
            emissive={CHAMPAGNE}
            emissiveIntensity={0.35}
          />
        </mesh>
      </group>
    </>
  );
}
