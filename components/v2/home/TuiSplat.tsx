'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * The tui — Kate's real SAM 3D Objects reconstruction (Gaussian splat),
 * rendered as depth-sorted gaussian point sprites inside the hero's existing
 * canvas. Data ships as `/3d/tui-splat.splat` (32 bytes/splat: xyz f32,
 * scale xyz f32, rgba u8, quat u8×4 — antimatter15 layout, converted from the
 * uploaded `sam3d-splat.ply`).
 *
 * A full anisotropic-covariance splat rasteriser is overkill for a 17k-splat
 * hero object; isotropic sprites with a gaussian falloff + periodic
 * back-to-front sorting read faithfully at hero scale and cost no extra deps.
 */

// The v3 bake shipped 180° off about X (bird still inverted); the runtime
// `orient` correction below fixes it without touching the binary.
const SPLAT_URL = '/3d/tui-splat.splat?v=3';
const BYTES_PER_SPLAT = 32;

type SplatData = {
  count: number;
  positions: Float32Array;
  colors: Float32Array; // rgba 0..1
  sizes: Float32Array; // world-space std dev (mean of axes)
};

function parseSplat(buffer: ArrayBuffer): SplatData {
  const count = Math.floor(buffer.byteLength / BYTES_PER_SPLAT);
  const f32 = new Float32Array(buffer);
  const u8 = new Uint8Array(buffer);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 4);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const fo = i * 8; // 8 floats per row (pos3 + scale3 + 2×packed u8 words)
    const bo = i * BYTES_PER_SPLAT;
    positions[i * 3] = f32[fo];
    positions[i * 3 + 1] = f32[fo + 1];
    positions[i * 3 + 2] = f32[fo + 2];
    const sx = f32[fo + 3];
    const sy = f32[fo + 4];
    const sz = f32[fo + 5];
    sizes[i] = (sx + sy + sz) / 3;
    colors[i * 4] = u8[bo + 24] / 255;
    colors[i * 4 + 1] = u8[bo + 25] / 255;
    colors[i * 4 + 2] = u8[bo + 26] / 255;
    colors[i * 4 + 3] = u8[bo + 27] / 255;
  }
  return { count, positions, colors, sizes };
}

const VERT = /* glsl */ `
  attribute vec4 aColor;
  attribute float aSize;
  uniform float uFocal;
  uniform float uFade;
  varying vec4 vColor;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // ~3 standard deviations of visual extent per gaussian
    float px = aSize * 3.0 * uFocal / max(0.1, -mv.z);
    gl_PointSize = clamp(px, 1.0, 42.0);
    gl_Position = projectionMatrix * mv;
    vColor = vec4(aColor.rgb, aColor.a * uFade);
  }
`;

const FRAG = /* glsl */ `
  varying vec4 vColor;

  void main() {
    vec2 d = (gl_PointCoord - 0.5) * 2.0;
    float r2 = dot(d, d);
    if (r2 > 1.0) discard;
    float a = exp(-4.0 * r2) * vColor.a;
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor.rgb, a);
  }
`;

function useSplatData(): SplatData | null {
  const [data, setData] = React.useState<SplatData | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch(SPLAT_URL)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${r.status}`))))
      .then((buf) => {
        if (!cancelled) setData(parseSplat(buf));
      })
      .catch(() => {
        /* hero still works without the tui */
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return data;
}

export function TuiSplat({
  position = [4.35, 1.55, 1.6],
  scale = 3.1,
  orient = [(130 * Math.PI) / 180, 0, 0],
  frozen = false,
}: {
  position?: [number, number, number];
  scale?: number;
  /** Inner corrective rotation (radians) that makes the bird's up-axis +Y,
   *  so the outer turntable/pointer yaw never tumbles it. */
  orient?: [number, number, number];
  /** Debug: skip all animation (turntable, pointer, bob). */
  frozen?: boolean;
}) {
  const data = useSplatData();
  const group = React.useRef<THREE.Group>(null);
  const inner = React.useRef<THREE.Group>(null);
  const matRef = React.useRef<THREE.ShaderMaterial>(null);
  const geoRef = React.useRef<THREE.BufferGeometry>(null);
  const sortTimer = React.useRef(0);
  const fadeIn = React.useRef(0);
  const baseYaw = React.useRef(0.4);
  const wasActive = React.useRef(false);
  // Pointer interactivity — the hero art layer is pointer-events:none, so we
  // listen on the window: the tui turns toward the cursor and tilts with it.
  const pointer = React.useRef({ x: 0, y: 0, lastMove: 0 });
  const { size, camera } = useThree();

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.current.lastMove = performance.now();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const uniforms = React.useMemo(
    () => ({ uFocal: { value: 1000 }, uFade: { value: 0 } }),
    [],
  );

  // Scratch buffers for periodic back-to-front reordering.
  const scratch = React.useMemo(() => {
    if (!data) return null;
    return {
      order: new Uint32Array(data.count),
      depths: new Float32Array(data.count),
      positions: new Float32Array(data.count * 3),
      colors: new Float32Array(data.count * 4),
      sizes: new Float32Array(data.count),
    };
  }, [data]);

  const resort = React.useCallback(() => {
    if (!data || !scratch || !geoRef.current || !inner.current) return;
    const { order, depths, positions, colors, sizes } = scratch;
    const mv = new THREE.Matrix4()
      .multiplyMatrices(camera.matrixWorldInverse, inner.current.matrixWorld)
      .elements;
    for (let i = 0; i < data.count; i++) {
      const x = data.positions[i * 3];
      const y = data.positions[i * 3 + 1];
      const z = data.positions[i * 3 + 2];
      depths[i] = mv[2] * x + mv[6] * y + mv[10] * z; // view-space z
      order[i] = i;
    }
    // back-to-front: most negative view z (farthest) first
    order.sort((a, b) => depths[a] - depths[b]);
    for (let k = 0; k < data.count; k++) {
      const i = order[k];
      positions[k * 3] = data.positions[i * 3];
      positions[k * 3 + 1] = data.positions[i * 3 + 1];
      positions[k * 3 + 2] = data.positions[i * 3 + 2];
      colors[k * 4] = data.colors[i * 4];
      colors[k * 4 + 1] = data.colors[i * 4 + 1];
      colors[k * 4 + 2] = data.colors[i * 4 + 2];
      colors[k * 4 + 3] = data.colors[i * 4 + 3];
      sizes[k] = data.sizes[i];
    }
    const geo = geoRef.current;
    (geo.attributes.position as THREE.BufferAttribute).copyArray(positions);
    (geo.attributes.aColor as THREE.BufferAttribute).copyArray(colors);
    (geo.attributes.aSize as THREE.BufferAttribute).copyArray(sizes);
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aColor.needsUpdate = true;
    geo.attributes.aSize.needsUpdate = true;
  }, [data, scratch, camera]);

  React.useEffect(() => {
    if (data) resort();
  }, [data, resort]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g || !data) return;
    if (frozen) {
      const m = matRef.current;
      if (m) {
        const persp = camera as THREE.PerspectiveCamera;
        const focal =
          (size.height * state.gl.getPixelRatio()) /
          (2 * Math.tan(THREE.MathUtils.degToRad(persp.fov) / 2));
        m.uniforms.uFocal.value = focal * scale;
        m.uniforms.uFade.value = 1;
      }
      sortTimer.current += delta;
      if (sortTimer.current > 0.4) {
        sortTimer.current = 0;
        resort();
      }
      return;
    }
    // Interactive: while the pointer moves, the bird turns toward the cursor
    // within a clamped front-facing range (so it never shows awkward back-on
    // angles), then eases back into its slow idle turntable.
    const p = pointer.current;
    const active = performance.now() - p.lastMove < 2500;
    if (active && !wasActive.current) {
      // wrap the accumulated turntable yaw so damping takes the short path
      g.rotation.y =
        THREE.MathUtils.euclideanModulo(g.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
    }
    if (!active && wasActive.current) {
      baseYaw.current = g.rotation.y; // resume the turntable from here
    }
    wasActive.current = active;
    if (active) {
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, 0.4 + p.x * 0.9, 2.5, delta);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, p.y * 0.12, 2.5, delta);
    } else {
      baseYaw.current += delta * 0.35;
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, baseYaw.current, 2.5, delta);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0, 2.5, delta);
    }
    // gentle bob
    g.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.6) * 0.06;

    const mat = matRef.current;
    if (mat) {
      const persp = camera as THREE.PerspectiveCamera;
      const focal =
        (size.height * state.gl.getPixelRatio()) /
        (2 * Math.tan(THREE.MathUtils.degToRad(persp.fov) / 2));
      mat.uniforms.uFocal.value = focal * scale;
      fadeIn.current = Math.min(1, fadeIn.current + delta * 0.8);
      mat.uniforms.uFade.value = fadeIn.current;
    }

    sortTimer.current += delta;
    if (sortTimer.current > 0.4) {
      sortTimer.current = 0;
      resort();
    }
  });

  if (!data || !scratch) return null;

  return (
    <group
      ref={group}
      position={position}
      scale={scale}
      // Yaw/tilt animate on this outer group; the upright correction lives on
      // the inner `orient` group so the turntable never tumbles the bird.
      rotation={[0, 0.4, 0]}
    >
      <group ref={inner} rotation={orient}>
        <points frustumCulled={false}>
          <bufferGeometry ref={geoRef}>
            <bufferAttribute attach="attributes-position" args={[scratch.positions, 3]} />
            <bufferAttribute attach="attributes-aColor" args={[scratch.colors, 4]} />
            <bufferAttribute attach="attributes-aSize" args={[scratch.sizes, 1]} />
          </bufferGeometry>
          <shaderMaterial
            ref={matRef}
            vertexShader={VERT}
            fragmentShader={FRAG}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            depthTest
          />
        </points>
      </group>
    </group>
  );
}
