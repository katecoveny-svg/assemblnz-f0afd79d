'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus } from '@react-three/drei';
import type { Group } from 'three';

/**
 * Everyday Rewards hero — an orbiting orange leaf-`r` (a torus arc with a nib)
 * with a soft glow bloom (fake bloom via emissive material + inner sphere).
 */
export function EverydayRewardsHero() {
  const orbit = useRef<Group>(null);
  const leaf = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (orbit.current) {
      orbit.current.rotation.y = t * 0.6;
    }
    if (leaf.current) {
      leaf.current.rotation.z = Math.sin(t * 1.2) * 0.1;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.7} />
      <pointLight position={[2, 2, 2]} intensity={1.1} color="#ffb87a" />
      <Sphere args={[0.35, 24, 24]}>
        <meshStandardMaterial color="#fd6400" emissive="#fd6400" emissiveIntensity={0.4} />
      </Sphere>
      <group ref={orbit}>
        <group ref={leaf} position={[0.95, 0.1, 0]}>
          <Torus args={[0.28, 0.09, 12, 40, Math.PI * 1.3]} rotation={[0, 0, Math.PI * 0.35]}>
            <meshStandardMaterial color="#fd6400" roughness={0.35} />
          </Torus>
          <Sphere args={[0.11, 16, 16]} position={[0.18, -0.22, 0]}>
            <meshStandardMaterial color="#fd6400" roughness={0.35} />
          </Sphere>
        </group>
      </group>
    </group>
  );
}
