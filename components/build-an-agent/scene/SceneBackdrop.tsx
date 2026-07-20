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
