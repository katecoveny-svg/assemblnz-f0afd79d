'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * The room the assembly stands in.
 *
 * The scene used to clear to a single flat paper colour, which is why it read
 * as objects floating in a white void rather than a place: with no vertical
 * value change there is nothing for the eye to read as "up", no horizon, and
 * no sense that space continues past the objects.
 *
 * This is a large inverted sphere carrying a vertical gradient — cool paper
 * overhead, warm sand toward the floor, with a slightly brighter band right at
 * eye level so a horizon reads. It stays firmly in the brand's paper range;
 * the point is depth, not colour.
 *
 * Deliberately a baked canvas texture on a basic material rather than a
 * shader: it never lights, never reflects, costs one draw call, and can't
 * interact with the tone mapping in surprising ways.
 */

/** Bottom → top. Positions are 0 at the floor, 1 overhead. */
const STOPS: Array<[number, string]> = [
  [0.0, '#C6BCA8'], // floor haze, warm and genuinely darker than the paper
  [0.26, '#DCD3C1'],
  [0.44, '#F1EADB'], // horizon lift — the band that reads as eye level
  [0.52, '#FCFBF7'],
  [0.72, '#EDEEEE'],
  [1.0, '#D9DEE3'], // cool overhead
];

function useGradientTexture(): THREE.CanvasTexture | null {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    // 2px wide: the gradient only varies vertically, so there's nothing to
    // gain from a wider texture.
    canvas.width = 2;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Canvas y runs top-down; our stops run bottom-up.
    const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
    for (const [at, color] of STOPS) grad.addColorStop(at, color);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/**
 * A soft bloom sitting BEHIND the assembly — the light source the composition
 * was missing. Reference heroes of this kind get their drama from one strong
 * light behind the subject; on a paper-white brand that can't be a neon glow,
 * so this is a wide, low-opacity champagne wash that lifts the objects off the
 * backdrop and gives the eye a centre.
 */
function useBloomTexture(): THREE.CanvasTexture | null {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255, 246, 226, 0.95)');
    g.addColorStop(0.35, 'rgba(243, 231, 208, 0.55)');
    g.addColorStop(0.68, 'rgba(226, 226, 224, 0.18)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

export function CoreBloom({
  position = [0, 0.6, 0],
  size = 7,
}: {
  position?: [number, number, number];
  size?: number;
}) {
  const texture = useBloomTexture();
  if (!texture) return null;
  return (
    <mesh position={[position[0], position[1], position[2] - 2.4]} renderOrder={-1}>
      <planeGeometry args={[size * 0.92, size * 1.7]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.9}
        depthWrite={false}
        fog={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export function SceneBackdrop() {
  const texture = useGradientTexture();
  if (!texture) return null;

  return (
    <mesh scale={[-1, 1, 1]} position={[0, 0, 0]} renderOrder={-1}>
      {/* Inverted (negative x scale) so we see the inside. Big enough to sit
          well outside the fog's far plane, so the fog does the blending. */}
      <sphereGeometry args={[60, 32, 24]} />
      <meshBasicMaterial map={texture} depthWrite={false} fog={false} toneMapped={false} />
    </mesh>
  );
}
