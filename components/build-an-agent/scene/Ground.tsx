'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * The studio floor — a warm paper plane that fades to fog at the horizon,
 * with a soft pool of light under the assembly. The gradient does the depth
 * work a flat colour can't: parts read as standing IN a room rather than
 * floating on a blank page.
 */
export function Ground() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        // Pool of light directly under the assembly.
        uPool: { value: new THREE.Color('#FFFEFB') },
        // The floor proper.
        uFloor: { value: new THREE.Color('#EFEBE0') },
        // Cool shadowed distance, so the horizon recedes.
        uFar: { value: new THREE.Color('#D6D6D2') },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform vec3 uPool;
        uniform vec3 uFloor;
        uniform vec3 uFar;
        void main() {
          float d = distance(vUv, vec2(0.5));
          // Bright pool → floor → cool distance.
          vec3 col = mix(uPool, uFloor, smoothstep(0.012, 0.13, d));
          col = mix(col, uFar, smoothstep(0.14, 0.42, d));
          // Fade out entirely before the plane's edge so there is no seam.
          float alpha = 1.0 - smoothstep(0.40, 0.5, d);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <planeGeometry args={[120, 120, 1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
