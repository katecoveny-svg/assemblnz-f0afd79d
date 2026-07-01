'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder } from '@react-three/drei';
import type { Group } from 'three';

/**
 * AIRONAUT hero — editorial engineering-blueprint feel. Four cargo objects
 * (freight container, exotic car silhouette, yacht hull, wine crate) orbit
 * slowly around a shared centre, each rotating on its own axis at a slightly
 * different rate. All four are drawn as thin wireframe skeletons in the
 * accent orange against the deep-navy background.
 *
 * Deliberate low-noise scene — one shared orbit (~60s round-trip), no
 * directional lighting (wireframes only), so the ops surface stays quiet
 * behind the cargo motion.
 */

// Orbit + spin metadata for each cargo. Radius chosen so all four sit
// comfortably inside the hero viewport at the default camera FOV. Phase
// offsets by 90° so the four are evenly spaced around the orbit.
type Cargo = {
  phase: number; // radians — position on the orbit at t=0
  spin: number; // radians per second, self-rotation
  radius: number;
  y: number;
};

const CARGOS: Cargo[] = [
  { phase: 0, spin: 0.35, radius: 1.05, y: 0.0 }, // container
  { phase: Math.PI * 0.5, spin: 0.28, radius: 1.05, y: 0.05 }, // car
  { phase: Math.PI, spin: 0.22, radius: 1.05, y: -0.05 }, // yacht
  { phase: Math.PI * 1.5, spin: 0.4, radius: 1.05, y: 0.0 }, // wine crate
];

// Shared orbit rate — ~60s per full revolution (2π radians / 60s).
const ORBIT_RATE = (Math.PI * 2) / 60;

export function AironautHero() {
  const containerRef = useRef<Group>(null);
  const carRef = useRef<Group>(null);
  const yachtRef = useRef<Group>(null);
  const crateRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const refs = [containerRef, carRef, yachtRef, crateRef];
    refs.forEach((ref, i) => {
      const g = ref.current;
      if (!g) return;
      const c = CARGOS[i];
      const angle = c.phase + t * ORBIT_RATE;
      g.position.x = Math.cos(angle) * c.radius;
      g.position.z = Math.sin(angle) * c.radius;
      g.position.y = c.y;
      g.rotation.y = t * c.spin;
    });
  });

  return (
    <group>
      {/* Low ambient — wireframes read fine without directional. */}
      <ambientLight intensity={0.6} />
      {/* Central low-opacity blueprint plane as a subtle base. Rotated flat
          under the orbit, kept quiet at low opacity via meshBasicMaterial. */}
      <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial
          color="#e67a2c"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* 1. Freight container — a plain rectangular box. */}
      <group ref={containerRef}>
        <Box args={[0.42, 0.22, 0.22]}>
          <meshBasicMaterial color="#e67a2c" wireframe />
        </Box>
      </group>

      {/* 2. Exotic car silhouette — a low, flat, wider box for the body plus
          a smaller box on top for the roofline. Wireframe skeleton, kept
          deliberately simple. */}
      <group ref={carRef}>
        <Box args={[0.5, 0.12, 0.22]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#e67a2c" wireframe />
        </Box>
        <Box args={[0.24, 0.09, 0.18]} position={[0, 0.1, 0]}>
          <meshBasicMaterial color="#e67a2c" wireframe />
        </Box>
      </group>

      {/* 3. Yacht hull — elongated cylinder rotated horizontal to read as a
          slender pointed hull skeleton. */}
      <group ref={yachtRef}>
        <Cylinder
          args={[0.06, 0.14, 0.55, 8]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshBasicMaterial color="#e67a2c" wireframe />
        </Cylinder>
        {/* Mast hint — a short vertical strut. */}
        <Box args={[0.02, 0.28, 0.02]} position={[0, 0.16, 0]}>
          <meshBasicMaterial color="#e67a2c" wireframe />
        </Box>
      </group>

      {/* 4. Wine crate — small squat box. */}
      <group ref={crateRef}>
        <Box args={[0.24, 0.18, 0.24]}>
          <meshBasicMaterial color="#e67a2c" wireframe />
        </Box>
      </group>
    </group>
  );
}
