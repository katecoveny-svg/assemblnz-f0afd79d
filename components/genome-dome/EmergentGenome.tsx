'use client';

import * as React from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

/**
 * The Emergent Genome — Kate's attractor study (2026-07-13 uploads), kept
 * equation-for-equation but dressed in the canon: Ming/Opal points with a
 * few gold surface nodes on the white page, normal blending, NO bloom,
 * no black void. Particles converge from noise toward a stable, evolving
 * structure — a business assembling itself around one source of truth.
 *
 * Reduced motion renders the converged structure once and holds still.
 */

const COUNT = 4200;
const GOLD_NODES = 10;
const SCALE = 0.9; // her scale 90 ÷ camera-space factor 100
const SPREAD = 1.0;
const FLOW = 0.8;
const MORPH = 0.45;

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float perspective = 140.0 / max(1.0, -mv.z);
    gl_PointSize = clamp(aSize * perspective, 1.0, 5.0);
    vFade = clamp(0.35 + 0.65 * perspective / 1.6, 0.25, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float a = smoothstep(0.5, 0.22, d) * vFade;
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

/** Kate's field, verbatim: spiral + three interference waves + bend + swirl. */
function fieldPoint(t: number, time: number, out: THREE.Vector3): void {
  const theta = t * Math.PI * 40.0;
  const r0 = 0.35 + 0.65 * Math.sqrt(t);
  const w1 = Math.sin(theta * 0.7 + time * 0.25);
  const w2 = Math.sin(theta * 1.9 - time * 0.17);
  const w3 = Math.cos(theta * 3.3 + time * 0.11);
  const attract = r0 * (1.0 + 0.25 * w1 + 0.12 * w2 * w3);
  const bend = 0.8 * Math.sin(theta * 0.5 + time * 0.2) + 0.3 * Math.sin(theta * 2.7 - time * 0.13);
  const x = SCALE * attract * Math.cos(theta + bend * SPREAD);
  const y = SCALE * attract * Math.sin(theta + bend * SPREAD);
  const z =
    SCALE *
    (0.55 * Math.sin(theta * 0.55) +
      0.28 * Math.sin(theta * 1.73 + time * 0.22) +
      0.15 * Math.cos(theta * 4.1));
  const swirl = FLOW * Math.sin(Math.sqrt(x * x + y * y) * 6.0 - time * 0.8);
  out.set(
    x + swirl * y * 0.12,
    y - swirl * x * 0.12,
    z + SCALE * MORPH * 0.18 * Math.sin(theta * 0.9 + time * 0.35),
  );
}

/** Deterministic PRNG so the swarm is stable frame to frame (lint-pure). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeSwarmBuffers(): { positions: Float32Array; colors: Float32Array; sizes: Float32Array } {
  const rand = mulberry32(20260713);
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const size = new Float32Array(COUNT);
  const c = new THREE.Color();
  const goldEvery = Math.floor(COUNT / GOLD_NODES);
  for (let i = 0; i < COUNT; i++) {
    const t = i / COUNT;
    // converge from quiet noise, not a black void
    pos[i * 3] = (rand() - 0.5) * 3;
    pos[i * 3 + 1] = (rand() - 0.5) * 3;
    pos[i * 3 + 2] = (rand() - 0.5) * 3;
    const theta = t * Math.PI * 40.0;
    if (i % goldEvery === goldEvery - 1) {
      // the surfaces: a handful of gold nodes, never a gold fill
      c.set('#b8964f');
      size[i] = 4.2;
    } else {
      // Kate's HSL logic constrained to the Ming/Opal family on white
      const sat = 0.28 + 0.22 * (0.5 + 0.5 * Math.sin(theta * 0.31));
      const light = 0.3 + 0.26 * Math.exp(-Math.abs(0.75 - (0.35 + 0.65 * Math.sqrt(t))));
      c.setHSL(0.48 + 0.03 * Math.sin(theta * 0.08), sat, light);
      size[i] = 1.4 + 1.2 * rand();
    }
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  return { positions: pos, colors: col, sizes: size };
}

function Swarm({ reducedMotion }: { reducedMotion: boolean }) {
  const geoRef = React.useRef<THREE.BufferGeometry>(null);
  const groupRef = React.useRef<THREE.Group>(null);
  const pointer = React.useRef({ x: 0, y: 0 });

  const { positions, colors, sizes } = React.useMemo(() => makeSwarmBuffers(), []);

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const target = React.useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const geo = geoRef.current;
    if (!geo) return;
    // reduced motion: the converged structure, held still
    const time = reducedMotion ? 12 : state.clock.getElapsedTime();
    const lerp = reducedMotion ? 1 : 0.08;
    const attr = geo.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      fieldPoint(i / COUNT, time, target);
      const j = i * 3;
      arr[j] += (target.x - arr[j]) * lerp;
      arr[j + 1] += (target.y - arr[j + 1]) * lerp;
      arr[j + 2] += (target.z - arr[j + 2]) * lerp;
    }
    attr.needsUpdate = true;

    const group = groupRef.current;
    if (group && !reducedMotion) {
      group.rotation.y += (pointer.current.x * 0.17 - group.rotation.y) * 0.04;
      group.rotation.x += (-0.35 + pointer.current.y * 0.12 - group.rotation.x) * 0.04;
      group.rotation.z += 0.0004; // the slow, continuous evolution
    } else if (group) {
      group.rotation.set(-0.35, 0, 0);
    }
  });

  return (
    <group ref={groupRef} rotation={[-0.35, 0, 0]}>
      <points frustumCulled={false}>
        <bufferGeometry ref={geoRef}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={FRAG}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
    </group>
  );
}

export default function EmergentGenome() {
  const reducedMotion = React.useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={reducedMotion ? 'demand' : 'always'}
      camera={{ position: [0, 0.4, 2.6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ background: 'transparent' }}
    >
      <Swarm reducedMotion={reducedMotion} />
    </Canvas>
  );
}
