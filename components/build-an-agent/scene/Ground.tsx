'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Infinite white ground with a soft radial fade so the horizon dissolves.
 * Pure vertex-shader gradient; no textures, no HDRI bleed onto the floor.
 */
export function Ground() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uInner: { value: new THREE.Color('#FBFAF6') },
        uOuter: { value: new THREE.Color('#F0EEE7') },
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
        uniform vec3 uInner;
        uniform vec3 uOuter;
        void main() {
          float d = distance(vUv, vec2(0.5));
          float fade = smoothstep(0.05, 0.55, d);
          vec3 col = mix(uInner, uOuter, fade);
          float alpha = 1.0 - smoothstep(0.42, 0.6, d);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[120, 120, 1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
