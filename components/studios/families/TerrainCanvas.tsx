'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, type RootState } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import type { RendererProps } from '@/lib/generative-art/families';
import { TERRAIN_PALETTES, type TerrainPalette } from '@/lib/generative-art/families/terrain';
import { backgroundById } from '@/lib/generative-art/backgrounds';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';

interface TerrainR3F {
  gl: {
    setSize: (w: number, h: number, updateStyle?: boolean) => void;
    render: (scene: unknown, camera: unknown) => void;
    domElement: HTMLCanvasElement;
    getSize: (t: { width: number; height: number }) => { width: number; height: number };
    setPixelRatio: (pr: number) => void;
    getPixelRatio: () => number;
  };
  scene: unknown;
  camera: { aspect?: number; updateProjectionMatrix?: () => void };
}

interface GeoAttrs {
  attributes: {
    position: { array: Float32Array; needsUpdate: boolean; count: number };
    color?: { array: Float32Array; needsUpdate: boolean; count: number; setUsage?: (u: number) => void };
  };
  computeVertexNormals?: () => void;
  setAttribute?: (name: string, attr: unknown) => void;
}

interface MeshRef {
  rotation: { x: number; y: number; z: number };
  geometry?: GeoAttrs;
  userData: { basePositions?: Float32Array; heights?: Float32Array };
}

function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
}

/** Cheap 2D value noise — smooth enough for landscape heights. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeNoise(seed: number) {
  const rand = mulberry32(seed);
  const N = 128;
  const grid: number[][] = Array.from({ length: N }, () => Array.from({ length: N }, () => rand()));
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const g = (a: number, b: number) => grid[((a % N) + N) % N][((b % N) + N) % N];
    const u = smooth(xf);
    const v = smooth(yf);
    const a = g(xi, yi);
    const b = g(xi + 1, yi);
    const c = g(xi, yi + 1);
    const d = g(xi + 1, yi + 1);
    return a + u * (b - a) + v * (c - a) + u * v * (a - b - c + d);
  };
}

interface SurfaceProps {
  palette: TerrainPalette;
  amp: number;
  freq: number;
  octaves: number;
  ridge: number;
  tilt: number;
  spin: number;
  seed: number;
}

function Surface({ palette, amp, freq, octaves, ridge, tilt, spin, seed }: SurfaceProps) {
  const meshRef = useRef<MeshRef | null>(null);

  // Compute the heightmap once per (seed, amp, freq, octaves, ridge). Sample
  // FBM with an optional ridge fold — ridge=1 turns each octave into
  // (1 - |2n - 1|) which produces sharp mountain crests.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh?.geometry) return;
    const pos = mesh.geometry.attributes.position;
    if (!mesh.userData.basePositions) {
      mesh.userData.basePositions = new Float32Array(pos.array);
    }
    const base = mesh.userData.basePositions;
    const arr = pos.array;
    const noise = makeNoise(seed);
    const octaveCount = Math.max(1, Math.round(octaves));
    const heights = new Float32Array(pos.count);
    let hMin = Infinity, hMax = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3];
      const bz = base[i * 3 + 2];
      let h = 0;
      let f = freq;
      let a = 1;
      let sum = 0;
      for (let o = 0; o < octaveCount; o++) {
        const n = noise(bx * f + 100, bz * f + 100);
        const shaped = ridge > 0 ? (1 - Math.abs(2 * n - 1)) : n;
        const value = n * (1 - ridge) + shaped * ridge;
        h += value * a;
        sum += a;
        f *= 2.02;
        a *= 0.5;
      }
      h = (h / sum) * amp;
      arr[i * 3 + 1] = h;
      heights[i] = h;
      if (h < hMin) hMin = h;
      if (h > hMax) hMax = h;
    }
    pos.needsUpdate = true;
    mesh.userData.heights = heights;
    mesh.geometry.computeVertexNormals?.();

    // Vertex colouring — three-stop gradient by normalised height.
    const col = mesh.geometry.attributes.color;
    if (col && col.array) {
      const carr = col.array;
      const span = hMax - hMin || 1;
      const [lr, lg, lb] = hexToRgb01(palette.low);
      const [mr, mg, mb] = hexToRgb01(palette.mid);
      const [hr, hg, hb] = hexToRgb01(palette.high);
      for (let i = 0; i < pos.count; i++) {
        const t = (heights[i] - hMin) / span;
        let r = 0, g = 0, b = 0;
        if (t < 0.5) {
          const tt = t / 0.5;
          r = lr + (mr - lr) * tt; g = lg + (mg - lg) * tt; b = lb + (mb - lb) * tt;
        } else {
          const tt = (t - 0.5) / 0.5;
          r = mr + (hr - mr) * tt; g = mg + (hg - mg) * tt; b = mb + (hb - mb) * tt;
        }
        carr[i * 3] = r; carr[i * 3 + 1] = g; carr[i * 3 + 2] = b;
      }
      col.needsUpdate = true;
    }
  }, [seed, amp, freq, octaves, ridge, palette.low, palette.mid, palette.high]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.15 * spin;
  });

  return (
    <mesh ref={meshRef as unknown as never} rotation={[-Math.PI / 2 + tilt, 0, 0]} position={[0, -0.25, 0]}>
      <planeGeometry args={[5, 5, 180, 180]} />
      <meshStandardMaterial
        vertexColors
        metalness={palette.metalness}
        roughness={palette.roughness}
        flatShading={false}
      />
    </mesh>
  );
}

export function TerrainCanvas({ presetId, values, seed, background, onExportersReady }: RendererProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const r3fRef = useRef<TerrainR3F | null>(null);
  const basePalette = TERRAIN_PALETTES[presetId] ?? TERRAIN_PALETTES.sunrise;
  const bg = backgroundById(background);
  const palette: TerrainPalette = useMemo(
    () => (bg ? { ...basePalette, ground: bg.ground } : basePalette),
    [basePalette, bg],
  );

  const amp = values.amp ?? 0.65;
  const freq = values.freq ?? 1.2;
  const octaves = Math.max(1, Math.round(values.octaves ?? 4));
  const ridge = values.ridge ?? 0.55;
  const tilt = values.tilt ?? -0.05;
  const spin = values.spin ?? 0.15;

  const png = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasHostRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return null;
    const stamped = stampWatermarkOnCanvas(canvas, palette.ground);
    return await new Promise((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
  }, [palette.ground]);

  const renderAtSize = useCallback(
    async (w: number, h: number): Promise<Blob | null> => {
      const state = r3fRef.current;
      if (!state) return null;
      const { gl, scene, camera } = state;
      const size = { width: 0, height: 0 };
      gl.getSize(size);
      const prevRatio = gl.getPixelRatio();
      const prevAspect = camera.aspect ?? 1;
      try {
        gl.setPixelRatio(1);
        gl.setSize(w, h, false);
        if (camera.aspect !== undefined) camera.aspect = w / h;
        camera.updateProjectionMatrix?.();
        gl.render(scene, camera);
        const dom = gl.domElement;
        const blob: Blob | null = await new Promise((resolve) => dom.toBlob((b) => resolve(b), 'image/png'));
        if (!blob) return null;
        const img = new Image();
        const url = URL.createObjectURL(blob);
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = () => rej(new Error('render decode'));
          img.src = url;
        });
        URL.revokeObjectURL(url);
        const out = document.createElement('canvas');
        out.width = w; out.height = h;
        const ctx = out.getContext('2d');
        if (!ctx) return null;
        ctx.fillStyle = palette.ground;
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const stamped = stampWatermarkOnCanvas(out, palette.ground);
        return await new Promise((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
      } finally {
        gl.setPixelRatio(prevRatio);
        gl.setSize(size.width, size.height, false);
        if (camera.aspect !== undefined) camera.aspect = prevAspect;
        camera.updateProjectionMatrix?.();
        gl.render(scene, camera);
      }
    },
    [palette.ground],
  );

  useEffect(() => {
    onExportersReady?.({ png, renderAtSize });
  }, [onExportersReady, png, renderAtSize]);

  return (
    <div
      ref={canvasHostRef}
      className="relative ga-canvas w-full overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
      style={{
        background: `linear-gradient(180deg, ${palette.high}30 0%, ${palette.ground} 45%, ${palette.low}20 100%)`,
      }}
    >
      <Canvas
        camera={{ position: [0, 1.9, 3.6], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
        onCreated={(state: RootState & TerrainR3F) => {
          r3fRef.current = state;
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          {/* Low sun so ridges cast long shadows. */}
          <directionalLight position={[4, 2.4, 1.5]} intensity={1.5} color="#FFE7C7" />
          <directionalLight position={[-3, 1.2, -2]} intensity={0.5} color="#B4C7D9" />
          <Environment preset="sunset" background={false} />
          <Surface
            palette={palette}
            amp={amp}
            freq={freq}
            octaves={octaves}
            ridge={ridge}
            tilt={tilt}
            spin={spin}
            seed={seed}
          />
          <mesh position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[16, 16, 1, 1]} />
            <meshStandardMaterial color={palette.ground} roughness={1} metalness={0} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
}
