'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box } from '@react-three/drei';
import type { Group } from 'three';

/**
 * Auckland Zoo hero — three layered animal silhouettes (kiwi, tuatara, tūī)
 * abstracted as stacked shapes at different Z depths, gently parallaxing
 * side-to-side. Earth-tone palette.
 */
export function AucklandZooHero() {
  const kiwi = useRef<Group>(null);
  const tuatara = useRef<Group>(null);
  const tui = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (kiwi.current) kiwi.current.position.x = Math.sin(t * 0.6) * 0.1;
    if (tuatara.current) tuatara.current.position.x = Math.sin(t * 0.6 + 1) * 0.14;
    if (tui.current) tui.current.position.x = Math.sin(t * 0.6 + 2) * 0.18;
  });

  return (
    <group>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 3, 3]} intensity={0.8} />
      {/* Back: tui silhouette */}
      <group ref={tui} position={[0, 0.3, -0.9]}>
        <Sphere args={[0.35, 24, 24]} scale={[1.2, 1, 0.8]}>
          <meshStandardMaterial color="#2b2416" />
        </Sphere>
        <Sphere args={[0.09, 16, 16]} position={[0.32, 0.08, 0]}>
          <meshStandardMaterial color="#f5f2e6" />
        </Sphere>
      </group>
      {/* Mid: tuatara — long low body */}
      <group ref={tuatara} position={[0, -0.15, 0]}>
        <Box args={[1.2, 0.28, 0.4]}>
          <meshStandardMaterial color="#4a6b3a" />
        </Box>
        <Sphere args={[0.2, 16, 16]} position={[0.65, 0.05, 0]}>
          <meshStandardMaterial color="#4a6b3a" />
        </Sphere>
      </group>
      {/* Front: kiwi — round body + beak */}
      <group ref={kiwi} position={[0, -0.5, 0.6]}>
        <Sphere args={[0.32, 20, 20]} scale={[1, 0.9, 1]}>
          <meshStandardMaterial color="#7a6a4e" />
        </Sphere>
        <Box args={[0.32, 0.04, 0.04]} position={[0.32, 0.02, 0]}>
          <meshStandardMaterial color="#c7a24a" />
        </Box>
      </group>
    </group>
  );
}
