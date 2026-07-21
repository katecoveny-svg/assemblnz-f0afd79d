'use client';

import { MeshReflectorMaterial } from '@react-three/drei';

/**
 * A polished studio floor that reflects the assembly back at you — the
 * single strongest cue that the parts occupy a real space rather than
 * sitting on a page. Blur keeps it a suggestion, not a mirror; the warm
 * paper tint keeps it on-canon rather than turning the room into chrome.
 *
 * Full tier only — reflections cost a second render pass per frame.
 */
export function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[42, 42]} />
      <MeshReflectorMaterial
        resolution={512}
        mirror={0.34}
        mixBlur={5.5}
        mixStrength={2.2}
        blur={[420, 110]}
        depthScale={1.1}
        minDepthThreshold={0.35}
        maxDepthThreshold={1.35}
        color="#F3F0E8"
        metalness={0.42}
        roughness={0.88}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}
