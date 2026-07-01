'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Torus } from '@react-three/drei';
import type { Group } from 'three';

/**
 * AIRONAUT hero — editorial engineering-blueprint scene keyed to the real
 * brand palette:
 *   Deep Navy    #0B1F3A — background (set by Brand3DHero wrapper)
 *   Burnt Orange #C8622A — orbit-trail torus (thin, low opacity)
 *   Steel Blue   #6E8FB3 — the four wireframe cargo silhouettes
 *
 * Four cargo objects (freight container, exotic car silhouette, yacht hull,
 * wine crate) orbit slowly around a shared centre (~60s full revolution),
 * each rotating on its own axis. All four drawn as thin Steel Blue
 * wireframes so the ops surface stays quiet behind the cargo motion.
 *
 * DOM overlay (Orbitron caption ticker + Burnt Orange CTA button) is rendered
 * by `<Brand3DHero>` above the canvas — cannot live inside the R3F scene.
 */

// Real Aironaut palette — reused across the four cargo materials.
const STEEL_BLUE = '#6E8FB3';
const BURNT_ORANGE = '#C8622A';

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

      {/* Burnt-orange orbit trail — a thin wireframe torus laid flat under the
          cargo objects, matching their orbit radius. Low opacity so it reads
          as a subtle suggestion of the orbit, not a hard ring. */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <Torus args={[1.05, 0.02, 8, 96]}>
          <meshBasicMaterial
            color={BURNT_ORANGE}
            wireframe
            transparent
            opacity={0.2}
          />
        </Torus>
      </group>

      {/* 1. Freight container — a plain rectangular box. */}
      <group ref={containerRef}>
        <Box args={[0.42, 0.22, 0.22]}>
          <meshBasicMaterial color={STEEL_BLUE} wireframe />
        </Box>
      </group>

      {/* 2. Exotic car silhouette — a low, flat, wider box for the body plus
          a smaller box on top for the roofline. Wireframe skeleton, kept
          deliberately simple. */}
      <group ref={carRef}>
        <Box args={[0.5, 0.12, 0.22]} position={[0, 0, 0]}>
          <meshBasicMaterial color={STEEL_BLUE} wireframe />
        </Box>
        <Box args={[0.24, 0.09, 0.18]} position={[0, 0.1, 0]}>
          <meshBasicMaterial color={STEEL_BLUE} wireframe />
        </Box>
      </group>

      {/* 3. Yacht hull — elongated cylinder rotated horizontal to read as a
          slender pointed hull skeleton. */}
      <group ref={yachtRef}>
        <Cylinder
          args={[0.06, 0.14, 0.55, 8]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshBasicMaterial color={STEEL_BLUE} wireframe />
        </Cylinder>
        {/* Mast hint — a short vertical strut. */}
        <Box args={[0.02, 0.28, 0.02]} position={[0, 0.16, 0]}>
          <meshBasicMaterial color={STEEL_BLUE} wireframe />
        </Box>
      </group>

      {/* 4. Wine crate — small squat box. */}
      <group ref={crateRef}>
        <Box args={[0.24, 0.18, 0.24]}>
          <meshBasicMaterial color={STEEL_BLUE} wireframe />
        </Box>
      </group>
    </group>
  );
}
