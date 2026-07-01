'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Sphere } from '@react-three/drei';
import type { Group, Mesh } from 'three';

/**
 * Air NZ hero — a silver-fern koru (approximated as a coiled torus + sphere)
 * inside a translucent teal glass sphere. A subtle wave ripple applied to the
 * outer sphere scale.
 */
export function AirNZHero() {
  const koru = useRef<Group>(null);
  const glass = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (koru.current) {
      koru.current.rotation.y = t * 0.5;
    }
    if (glass.current) {
      const s = 1 + Math.sin(t * 0.8) * 0.02;
      glass.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 3, 2]} intensity={0.8} color="#a8ecf3" />
      <Sphere ref={glass} args={[1.05, 32, 32]}>
        <meshPhysicalMaterial
          color="#0f3944"
          transmission={0.75}
          thickness={0.8}
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </Sphere>
      <group ref={koru}>
        <Torus args={[0.42, 0.06, 12, 48]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#c9d6d8" metalness={0.7} roughness={0.25} />
        </Torus>
        <Sphere args={[0.12, 16, 16]} position={[0.42, 0, 0]}>
          <meshStandardMaterial color="#c9d6d8" metalness={0.7} roughness={0.25} />
        </Sphere>
      </group>
    </group>
  );
}
