'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  reduced?: boolean;
}

/**
 * Aotearoa long-white-cloud horizon — three low-alpha white sine ribbons
 * that drift slowly across the far distance. Sits behind the parts, in front
 * of the ground fade, so the scene reads "cloud country" not "empty studio".
 */
export function HorizonWaves({ reduced }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const bands = [
      { z: -22, amp: 0.55, freq: 0.28, y: 1.4, alpha: 0.16, phase: 0 },
      { z: -18, amp: 0.4, freq: 0.35, y: 0.9, alpha: 0.22, phase: 1.2 },
      { z: -14, amp: 0.28, freq: 0.48, y: 0.5, alpha: 0.3, phase: 2.4 },
    ];
    return bands.map((band) => {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 240; i++) {
        const x = -30 + (i / 240) * 60;
        points.push(new THREE.Vector3(x, band.y, band.z));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return { geometry, band };
    });
  }, []);

  useFrame(({ clock }) => {
    if (reduced || !groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, idx) => {
      const line = child as THREE.Line;
      const band = lines[idx].band;
      const geom = line.geometry as THREE.BufferGeometry;
      const attr = geom.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i <= 240; i++) {
        const x = attr.getX(i);
        const y = band.y + Math.sin(x * band.freq + t * 0.35 + band.phase) * band.amp;
        attr.setY(i, y);
      }
      attr.needsUpdate = true;
    });
  });

  return (
    <group ref={groupRef}>
      {lines.map(({ geometry, band }, i) => (
        <line key={i}>
          <primitive object={geometry} attach="geometry" />
          <lineBasicMaterial
            color="#1A1918"
            transparent
            opacity={band.alpha}
            depthWrite={false}
          />
        </line>
      ))}
    </group>
  );
}
