'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Sphere } from '@react-three/drei';
import type { Group } from 'three';

/**
 * Happy Tails hero — a floating dachshund silhouette abstracted as a stretched
 * capsule, bobbing above a slowly spinning bone-coloured torus. Canary + warm
 * cream palette encoded as brand-owned hex (heroes are allowed to hardcode).
 */
export function HappyTailsHero() {
  const group = useRef<Group>(null);
  const platform = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.position.y = Math.sin(t * 1.1) * 0.15;
    }
    if (platform.current) {
      platform.current.rotation.y = t * 0.4;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={0.7} />
      <group ref={platform} position={[0, -0.6, 0]}>
        <Torus args={[0.9, 0.12, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#ffd447" roughness={0.4} metalness={0.1} />
        </Torus>
      </group>
      <group ref={group}>
        {/* body */}
        <Sphere args={[0.45, 24, 24]} position={[0, 0, 0]} scale={[1.8, 0.7, 0.9]}>
          <meshStandardMaterial color="#d99a1b" roughness={0.5} />
        </Sphere>
        {/* head */}
        <Sphere args={[0.28, 24, 24]} position={[0.85, 0.18, 0]}>
          <meshStandardMaterial color="#c48812" roughness={0.5} />
        </Sphere>
        {/* ear */}
        <Sphere args={[0.14, 16, 16]} position={[0.95, 0.35, 0.16]} scale={[0.6, 1.4, 0.4]}>
          <meshStandardMaterial color="#8a5f0d" roughness={0.5} />
        </Sphere>
      </group>
    </group>
  );
}
