'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere } from '@react-three/drei';
import type { Mesh, Group } from 'three';

/**
 * Lula Inn hero — a wine glass (approximated with a cone-ish cylinder + stem)
 * with slow-rising gold bubbles inside. Burgundy + gold palette.
 */
export function LulaInnHero() {
  const bubbles = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 0.3,
      speed: 0.35 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      size: 0.045 + Math.random() * 0.04,
    }));
  }, []);

  const bubbleRefs = useRef<Array<Mesh | null>>([]);
  const glass = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (glass.current) glass.current.rotation.y = Math.sin(t * 0.3) * 0.08;
    bubbleRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const b = bubbles[i];
      const y = ((t * b.speed + b.phase) % 1.2) - 0.4;
      mesh.position.set(b.x, y, 0);
    });
  });

  return (
    <group>
      <ambientLight intensity={0.55} />
      <pointLight position={[2, 3, 2]} intensity={0.9} color="#d4af57" />
      <group ref={glass}>
        {/* Bowl */}
        <Cylinder args={[0.5, 0.32, 0.7, 24, 1, true]} position={[0, 0.15, 0]}>
          <meshPhysicalMaterial
            color="#7a1d2a"
            transmission={0.6}
            thickness={0.4}
            roughness={0.15}
            transparent
            opacity={0.75}
          />
        </Cylinder>
        {/* Stem */}
        <Cylinder args={[0.05, 0.05, 0.5, 12]} position={[0, -0.35, 0]}>
          <meshStandardMaterial color="#f5e7d1" metalness={0.3} roughness={0.35} />
        </Cylinder>
        {/* Base */}
        <Cylinder args={[0.32, 0.32, 0.04, 24]} position={[0, -0.62, 0]}>
          <meshStandardMaterial color="#f5e7d1" metalness={0.3} roughness={0.35} />
        </Cylinder>
        {/* Bubbles */}
        {bubbles.map((b, i) => (
          <Sphere
            key={b.id}
            ref={(el: Mesh | null) => {
              bubbleRefs.current[i] = el;
            }}
            args={[b.size, 12, 12]}
          >
            <meshStandardMaterial
              color="#d4af57"
              emissive="#d4af57"
              emissiveIntensity={0.4}
            />
          </Sphere>
        ))}
      </group>
    </group>
  );
}
