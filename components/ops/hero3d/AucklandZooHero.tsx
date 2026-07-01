'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import type { Mesh, Group, Texture, MeshBasicMaterial } from 'three';
import { RepeatWrapping, SRGBColorSpace } from 'three';

const PATTERN = '/brand/auckland-zoo/pattern-safari-animals.png';
const PORTRAITS = [
  '/brand/auckland-zoo/portrait-giraffe.png',
  '/brand/auckland-zoo/portrait-red-panda.png',
  '/brand/auckland-zoo/portrait-lionesses.png',
  '/brand/auckland-zoo/portrait-squirrel-monkey.png',
] as const;

// Full carousel cycle length in seconds. Each of the 4 portrait cards holds
// centre-stage for CARD_CYCLE / PORTRAITS.length seconds before fading to the
// next; the trailing card fades out as the leading card fades in.
const CARD_CYCLE = 8 * PORTRAITS.length; // 32s round-trip, ~8s per card

// Blue hairline colour — pulled from the small dots in the safari pattern.
// Used sparingly, at the assembl crossover corner only.
const HAIRLINE_BLUE = '#2A5FE0';

/**
 * Auckland Zoo hero — editorial magazine feel.
 *
 * Warm safari-orange background is set on the wrapper div in <Brand3DHero>
 * via var(--brand-bg). Behind everything a single slow-rotating plane carries
 * the ink-line safari pattern at low opacity — the orange field still reads
 * dominant. In front, a carousel of four editorial studio portraits (giraffe,
 * red panda, lionesses, squirrel monkey) fades in and out on an 8s cadence per
 * card so the surface always shows one animal in the frame.
 *
 * Cultural rule: this hero used to layer taonga-species silhouettes in
 * parallax. Those species are kaumātua-hold. They have been removed from this
 * scene and must not be reintroduced without sign-off.
 *
 * Reduced motion — StaticFallback handles it (giraffe portrait over CSS
 * pattern on the safari-orange bg).
 */
export function AucklandZooHero() {
  const patternPlane = useRef<Mesh>(null);
  const portraitRefs = useRef<Array<Mesh | null>>([null, null, null, null]);

  // Load every texture up-front. useTexture suspends until all are ready; any
  // failure bubbles up to the Suspense boundary in <Brand3DHero> which falls
  // through to <StaticFallback>.
  const textures = useTexture([PATTERN, ...PORTRAITS]) as unknown as Texture[];
  const patternTex = textures[0];
  const portraitTextures = textures.slice(1);

  // Configure textures once. Pattern tiles + repeats; portraits are single
  // images so we just fix colour space.
  useMemo(() => {
    patternTex.wrapS = RepeatWrapping;
    patternTex.wrapT = RepeatWrapping;
    patternTex.repeat.set(4, 2);
    patternTex.colorSpace = SRGBColorSpace;
    patternTex.needsUpdate = true;
    for (const tex of portraitTextures) {
      tex.colorSpace = SRGBColorSpace;
      tex.needsUpdate = true;
    }
  }, [patternTex, portraitTextures]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Very slow rotation — full turn every ~120s. The pattern reads as a
    // subtle drifting watermark, never as a spinning object.
    if (patternPlane.current) {
      patternPlane.current.rotation.z = (t * (Math.PI * 2)) / 120;
    }

    // Cross-fade the 4 portrait cards. Each card owns a slot of length
    // CARD_CYCLE / n; the two cards involved in a transition ramp opacity
    // on/off with a smooth sine curve so nothing snaps.
    const slot = CARD_CYCLE / PORTRAITS.length; // 8s
    for (let i = 0; i < portraitRefs.current.length; i += 1) {
      const mesh = portraitRefs.current[i];
      if (!mesh) continue;
      // Phase in [0, CARD_CYCLE), where each card i peaks at t = i * slot.
      const phase = (((t - i * slot) % CARD_CYCLE) + CARD_CYCLE) % CARD_CYCLE;
      // Distance from the centre of this card's window, wrapped so 0 == peak.
      const centred = Math.min(phase, CARD_CYCLE - phase);
      // Convert distance -> opacity: full at centre, 0 outside 1.5 slots.
      const opacity = Math.max(
        0,
        Math.cos(Math.min(centred / slot, 1.5) * (Math.PI / 2)),
      );
      const mat = mesh.material as MeshBasicMaterial;
      mat.opacity = opacity;
      // Small vertical bob only on the currently visible card, tiny amplitude.
      mesh.position.y = Math.sin(t * 0.3 + i) * 0.03;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.95} />
      <directionalLight position={[2, 3, 2]} intensity={0.35} />

      {/* Slow-rotating pattern plane, deep behind everything. Sized wider than
          the frame so rotation never exposes an edge. Low opacity so the
          safari-orange field (wrapper div) still dominates. */}
      <mesh ref={patternPlane} position={[0, 0, -4]}>
        <planeGeometry args={[22, 22]} />
        <meshBasicMaterial
          map={patternTex}
          transparent
          opacity={0.35}
          toneMapped={false}
        />
      </mesh>

      {/* Foreground carousel — 4 portrait cards, all centred at (0, 0, 0). At
          any moment only one is at full opacity; adjacent slots cross-fade
          via useFrame above. */}
      {portraitTextures.map((tex, i) => (
        <group key={PORTRAITS[i]} position={[0, 0, 0]}>
          {/* Soft drop shadow — a hair below and behind. */}
          <mesh position={[0.04, -0.06, -0.02]}>
            <planeGeometry args={[2.05, 2.75]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={0.1}
              toneMapped={false}
            />
          </mesh>
          <mesh
            ref={(el: Mesh | null) => {
              portraitRefs.current[i] = el;
            }}
            position={[0, 0, 0]}
          >
            <planeGeometry args={[2, 2.7]} />
            <meshBasicMaterial
              map={tex}
              transparent
              opacity={i === 0 ? 1 : 0}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* Assembl crossover hairline — a single tiny blue ring in the
          bottom-right corner. Very subtle; pulled from the pattern's blue
          dot accent. */}
      <mesh position={[2.3, -1.35, -0.1]}>
        <ringGeometry args={[0.06, 0.075, 32]} />
        <meshBasicMaterial
          color={HAIRLINE_BLUE}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
