'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import type { Mesh, Group, Texture } from 'three';
import { RepeatWrapping, SRGBColorSpace } from 'three';

const PATTERN_PRIMARY = '/brand/happy-tails/pattern-tails-and-paws.png';
const PATTERN_SECONDARY = '/brand/happy-tails/pattern-dogs-mixed.png';
const FRANKLIN = '/brand/happy-tails/franklin-black-longhair-rear.png';

/**
 * Happy Tails hero — editorial magazine feel, minimal motion. Two parallax
 * pattern planes drift slowly at different depths (like layered magazine
 * pages). Franklin's studio portrait floats on a foreground "card" with a soft
 * bob. A thin canary-yellow hairline sits behind him at the assembl crossover
 * point. Warm-white ambient light; no harsh shadows. NEVER colour-fills the
 * line patterns and NEVER composites Franklin onto a coloured background.
 */
export function HappyTailsHero() {
  const backPlane = useRef<Mesh>(null);
  const midPlane = useRef<Mesh>(null);
  const franklinGroup = useRef<Group>(null);

  // Load textures. useTexture suspends the scene until they're ready; if any
  // fail the Suspense boundary in <Brand3DHero> falls through to <StaticFallback>.
  const [patternPrimaryTex, patternSecondaryTex, franklinTex] = useTexture([
    PATTERN_PRIMARY,
    PATTERN_SECONDARY,
    FRANKLIN,
  ]) as unknown as [Texture, Texture, Texture];

  // Configure pattern tiling — repeat, wrap, correct colour space. Memoized so
  // we don't re-mutate the shared texture every frame.
  useMemo(() => {
    for (const tex of [patternPrimaryTex, patternSecondaryTex]) {
      tex.wrapS = RepeatWrapping;
      tex.wrapT = RepeatWrapping;
      tex.repeat.set(4, 2);
      tex.colorSpace = SRGBColorSpace;
      tex.needsUpdate = true;
    }
    franklinTex.colorSpace = SRGBColorSpace;
    franklinTex.needsUpdate = true;
  }, [patternPrimaryTex, patternSecondaryTex, franklinTex]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Parallax drift in opposite directions, different speeds (layered pages).
    if (backPlane.current) {
      const mat = backPlane.current.material as { map?: Texture };
      if (mat.map) mat.map.offset.x = (t * 0.008) % 1;
    }
    if (midPlane.current) {
      const mat = midPlane.current.material as { map?: Texture };
      if (mat.map) mat.map.offset.x = (-t * 0.012) % 1;
    }
    // Tiny amplitude, slow period — a gentle bob, not a bounce.
    if (franklinGroup.current) {
      franklinGroup.current.position.y = Math.sin(t * 0.4) * 0.05;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 2]} intensity={0.4} />

      {/* Back pattern plane — deepest, slowest drift */}
      <mesh ref={backPlane} position={[0, 0, -8]}>
        <planeGeometry args={[18, 9]} />
        <meshBasicMaterial
          map={patternSecondaryTex}
          transparent
          opacity={0.35}
          toneMapped={false}
        />
      </mesh>

      {/* Mid pattern plane — closer, opposite direction */}
      <mesh ref={midPlane} position={[0, 0, -4]}>
        <planeGeometry args={[12, 6]} />
        <meshBasicMaterial
          map={patternPrimaryTex}
          transparent
          opacity={0.55}
          toneMapped={false}
        />
      </mesh>

      {/* Foreground Franklin card + canary hairline behind him */}
      <group ref={franklinGroup} position={[0, 0, 0]}>
        {/* Canary hairline underline — thin, sits BEHIND Franklin at the
            assembl crossover point. Very subtle. */}
        <mesh position={[0, -1.05, -0.05]}>
          <planeGeometry args={[1.6, 0.012]} />
          <meshBasicMaterial color="#FFD42A" toneMapped={false} />
        </mesh>

        {/* Soft drop shadow beneath the card */}
        <mesh position={[0.04, -0.06, -0.02]}>
          <planeGeometry args={[2.05, 3.05]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.08} toneMapped={false} />
        </mesh>

        {/* Franklin's photo as a texture on the foreground card. Aspect roughly
            2:3, sized ~2x3 units. Warm-white behind (via wrapper div bg), not
            a coloured overlay. */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2, 3]} />
          <meshBasicMaterial map={franklinTex} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
