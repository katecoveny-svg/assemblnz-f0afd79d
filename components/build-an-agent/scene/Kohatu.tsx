'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  count?: number;
  reduced?: boolean;
}

/**
 * Drifting kōhatu — soft white river-stones floating around the studio.
 * Not physics — a lightweight sine-based drift on Y with a slow spin,
 * seeded per stone so it stays deterministic across renders.
 */
export function Kohatu({ count = 22, reduced = false }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const stones = useMemo(() => {
    const out: Array<{
      base: THREE.Vector3;
      scale: number;
      driftAmp: number;
      driftSpeed: number;
      phase: number;
      spinAxis: THREE.Vector3;
      spinSpeed: number;
    }> = [];
    for (let i = 0; i < count; i++) {
      // Push all stones behind the parts (z < -3) and spread laterally so
      // nothing near the camera dwarfs the model core in perspective.
      const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.4;
      const radius = 5.5 + (i % 5) * 1.2;
      const zBias = -3.5 - (i % 4) * 1.2;
      out.push({
        base: new THREE.Vector3(
          Math.cos(angle) * radius,
          0.6 + (i % 4) * 0.35,
          zBias - Math.abs(Math.sin(angle)) * 1.4,
        ),
        scale: 0.07 + (i % 4) * 0.018,
        driftAmp: 0.07 + (i % 3) * 0.03,
        driftSpeed: 0.2 + (i % 5) * 0.05,
        phase: (i * 0.7) % (Math.PI * 2),
        spinAxis: new THREE.Vector3(
          (i % 2 === 0 ? 1 : -0.7),
          1,
          (i % 3 === 0 ? 0.6 : -0.4),
        ).normalize(),
        spinSpeed: 0.1 + (i % 4) * 0.04,
      });
    }
    return out;
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    stones.forEach((stone, i) => {
      const y = reduced
        ? stone.base.y
        : stone.base.y + Math.sin(t * stone.driftSpeed + stone.phase) * stone.driftAmp;
      dummy.position.set(stone.base.x, y, stone.base.z);
      const spin = reduced ? 0 : t * stone.spinSpeed;
      dummy.quaternion.setFromAxisAngle(stone.spinAxis, spin);
      dummy.scale.setScalar(stone.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow={false}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#FBFAF6" roughness={0.75} metalness={0.05} />
    </instancedMesh>
  );
}
