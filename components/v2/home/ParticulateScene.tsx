'use client';

import * as React from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { palette } from '@assembl/canvas/tokens';
import { gauss, mulberry32 } from '@assembl/canvas';
import { TuiSplat } from './TuiSplat';

/**
 * The silvery-gold particulate mountain-and-wave landscape from
 * DIRECTION-LOCKED-2026-07-01, lifted into a real 3D point field.
 *
 * Three live behaviours (all within the locked motion spec's spirit):
 *  - the field breathes — per-particle drift on a slow sine, gold flecks sparse
 *  - pointer parallax — the whole scene leans a few degrees toward the cursor
 *  - scroll dissolve — particles lift off and thin out as the hero scrolls away
 *
 * Deterministic (seeded PRNG at module scope) so every visit renders the same
 * landscape. prefers-reduced-motion never reaches this file — the wrapper
 * (Hero3D) falls back to the static poster + SVG before loading the canvas.
 */

const SEED = 20260701; // the day the direction locked

// ── landscape maths (3D re-projection of the canvas package's 2D field) ─────

/** Mountain ridge height at x ∈ [-9, 9] — two overlapping peaks left-of-centre. */
function ridgeHeight(x: number): number {
  const peak1 = 2.3 * Math.exp(-(((x + 2.2) / 2.5) ** 2));
  const peak2 = 1.35 * Math.exp(-(((x - 1.6) / 3.3) ** 2));
  const swell = 0.22 * Math.sin(x / 1.35);
  return -0.6 + peak1 + peak2 + swell;
}

/** Wave flow — a band curling up from mid-frame to the right edge. */
function waveHeight(x: number): number {
  const t = (x - 0.5) / 8.5;
  return -0.75 + 1.55 * t + 0.4 * Math.sin(t * Math.PI * 2.2);
}

type Field = {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  alphas: Float32Array;
  phases: Float32Array;
  lifts: Float32Array;
  count: number;
};

const COLOR_POOL = [
  palette.silver,
  palette.silverDeep,
  palette.cream,
  palette.blueUndertone,
  palette.gold,
  palette.goldSoft,
].map((hex) => new THREE.Color(hex));

function pickColor(rand: () => number): THREE.Color {
  const t = rand();
  if (t < 0.34) return COLOR_POOL[0]; // silver
  if (t < 0.6) return COLOR_POOL[1]; // silver deep
  if (t < 0.76) return COLOR_POOL[2]; // cream
  if (t < 0.92) return COLOR_POOL[3]; // blue undertone
  return rand() < 0.5 ? COLOR_POOL[4] : COLOR_POOL[5]; // gold flecks — sparse
}

function buildField(count: number): Field {
  const rand = mulberry32(SEED);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);
  const phases = new Float32Array(count);
  const lifts = new Float32Array(count);

  let i = 0;
  const push = (
    x: number,
    y: number,
    z: number,
    color: THREE.Color,
    size: number,
    alpha: number,
  ) => {
    if (i >= count) return;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    sizes[i] = size;
    alphas[i] = alpha;
    phases[i] = rand() * Math.PI * 2;
    lifts[i] = 0.4 + rand() * 1.8;
    i += 1;
  };

  const mountainN = Math.floor(count * 0.46);
  const crestN = Math.floor(count * 0.16);
  const waveN = Math.floor(count * 0.26);
  const driftN = count - mountainN - crestN - waveN;

  // Mountain body — dots cluster at the crest, thin out beneath it.
  for (let k = 0; k < mountainN; k++) {
    const x = -9 + rand() * 18;
    const z = -3.5 + rand() * 4.2;
    const spread = 0.25 + rand() * 1.4;
    const y = ridgeHeight(x) - Math.abs(gauss(rand)) * spread;
    if (y < -2.4) continue;
    push(x, y, z, pickColor(rand), 0.5 + rand() * 1.3, 0.1 + rand() * 0.5);
  }

  // Crest sparkle — a finer, brighter dust line right on the ridge.
  for (let k = 0; k < crestN; k++) {
    const x = -9 + rand() * 18;
    const z = -2.4 + rand() * 2.6;
    const y = ridgeHeight(x) + gauss(rand) * 0.09;
    const goldish = rand() < 0.16;
    push(
      x,
      y,
      z,
      goldish ? COLOR_POOL[4] : COLOR_POOL[0],
      0.45 + rand() * 0.85,
      0.28 + rand() * 0.5,
    );
  }

  // Wave flow — breaking over the mountains toward the top right.
  for (let k = 0; k < waveN; k++) {
    const x = 0.5 + rand() * 8.5;
    const z = -2.8 + rand() * 3.4;
    const y = waveHeight(x) + gauss(rand) * 0.28;
    if (y < -2 || y > 3.4) continue;
    push(x, y, z, pickColor(rand), 0.5 + rand() * 1.2, 0.12 + rand() * 0.48);
  }

  // Sparse high drift — particles lifting off into the paper.
  for (let k = 0; k < driftN; k++) {
    const x = -9 + rand() * 18;
    const z = -4 + rand() * 4.5;
    const y = ridgeHeight(x) + 0.5 + rand() * 2.6;
    push(
      x,
      y,
      z,
      rand() < 0.22 ? COLOR_POOL[5] : COLOR_POOL[0],
      0.35 + rand() * 0.75,
      0.06 + rand() * 0.26,
    );
  }

  return { positions, colors, sizes, alphas, phases, lifts, count: i };
}

// ── shaders ──────────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPhase;
  attribute float aLift;
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // slow breathing drift — each particle on its own phase
    p.y += sin(uTime * 0.32 + aPhase) * 0.055;
    p.x += cos(uTime * 0.21 + aPhase * 1.7) * 0.045;
    // scroll dissolve — the field lifts off and scatters as the hero leaves
    p.y += uScroll * aLift;
    p.x += uScroll * sin(aPhase * 3.1) * 0.9;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixelRatio * (46.0 / -mv.z);
    gl_Position = projectionMatrix * mv;

    vColor = aColor;
    vAlpha = aAlpha * (1.0 - uScroll * 0.75);
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.14, d) * vAlpha;
    if (a < 0.015) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

// ── matariki constellation (nine stars, gold, top right) ────────────────────

const STARS: Array<[number, number, number, number]> = [
  // x, y, z, radius — hand-placed to echo the canvas package's 2D cluster
  [4.6, 2.5, -0.5, 0.075],
  [3.9, 2.95, -0.6, 0.05],
  [5.15, 3.1, -0.4, 0.058],
  [5.7, 2.6, -0.55, 0.045],
  [5.4, 1.95, -0.5, 0.052],
  [4.65, 1.6, -0.6, 0.042],
  [3.85, 1.8, -0.5, 0.056],
  [3.45, 2.4, -0.62, 0.042],
  [4.35, 3.3, -0.45, 0.038],
];

const LINKS: Array<[number, number]> = [
  [0, 1], [0, 2], [0, 4], [0, 6], [1, 8], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 1], [8, 2],
];

const LINK_POSITIONS: Float32Array = (() => {
  const pts: number[] = [];
  for (const [a, b] of LINKS) {
    pts.push(STARS[a][0], STARS[a][1], STARS[a][2], STARS[b][0], STARS[b][1], STARS[b][2]);
  }
  return new Float32Array(pts);
})();

function ConstellationLayer() {
  const starsRef = React.useRef<THREE.Group>(null);
  const lineMatRef = React.useRef<THREE.LineBasicMaterial>(null);

  useFrame(({ clock }) => {
    // soft pulse — 1.5s ease, ~40% opacity range (locked motion spec)
    const t = clock.getElapsedTime();
    const group = starsRef.current;
    if (group) {
      group.children.forEach((star, idx) => {
        const mesh = star as THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
        mesh.material.opacity = 0.62 + 0.28 * Math.sin((t / 1.5) * Math.PI + idx * 0.9);
      });
    }
    const lineMat = lineMatRef.current;
    if (lineMat) {
      lineMat.opacity = 0.3 + 0.12 * Math.sin((t / 3) * Math.PI);
    }
  });

  return (
    <group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[LINK_POSITIONS, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMatRef}
          color={palette.goldSoft}
          transparent
          opacity={0.4}
        />
      </lineSegments>
      <group ref={starsRef}>
        {STARS.map(([x, y, z, r], idx) => (
          <mesh key={idx} position={[x, y, z]}>
            <sphereGeometry args={[r, 12, 12]} />
            <meshBasicMaterial
              color={idx % 3 === 0 ? palette.gold : palette.goldSoft}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ── the gold thread — one fine line tracing the wave crest ──────────────────

function GoldThread() {
  const line = React.useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let x = 0.5; x <= 9; x += 0.5) {
      pts.push(new THREE.Vector3(x, waveHeight(x), -1.2));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(140));
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(palette.goldSoft),
      transparent: true,
      opacity: 0.32,
    });
    return new THREE.Line(geo, mat);
  }, []);
  return <primitive object={line} />;
}

// ── the particle field + parallax rig ────────────────────────────────────────

function Field({ count }: { count: number }) {
  const rig = React.useRef<THREE.Group>(null);
  const matRef = React.useRef<THREE.ShaderMaterial>(null);
  const field = React.useMemo(() => buildField(count), [count]);

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPixelRatio: { value: 1 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (mat) {
      mat.uniforms.uTime.value = state.clock.getElapsedTime();
      mat.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
      // scroll dissolve — progress over ~90% of a viewport height
      const target = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      mat.uniforms.uScroll.value = THREE.MathUtils.damp(
        mat.uniforms.uScroll.value,
        target,
        4,
        delta,
      );
    }
    // pointer parallax — the whole scene leans gently toward the cursor
    const group = rig.current;
    if (group) {
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, state.pointer.x * 0.075, 3, delta);
      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, -state.pointer.y * 0.045, 3, delta);
    }
  });

  return (
    <group ref={rig}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[field.positions, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[field.colors, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[field.sizes, 1]} />
          <bufferAttribute attach="attributes-aAlpha" args={[field.alphas, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[field.phases, 1]} />
          <bufferAttribute attach="attributes-aLift" args={[field.lifts, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
      <GoldThread />
      <ConstellationLayer />
      {/* the tui — Kate's SAM 3D reconstruction, perched over the wave */}
      <TuiSplat position={[2.7, 0.95, 1.2]} scale={2.15} />
    </group>
  );
}

// ── canvas root ──────────────────────────────────────────────────────────────

export default function ParticulateScene({ fallback }: { fallback?: React.ReactNode }) {
  // This module only loads client-side (next/dynamic ssr:false), so window is
  // available at first render — fewer particles on small screens.
  const [count] = React.useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 900 ? 5200 : 10500,
  );

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.55, 8.4], fov: 38 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      fallback={fallback}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      <fog attach="fog" args={['#FBFAF6', 9, 16.5]} />
      <Field count={count} />
    </Canvas>
  );
}
