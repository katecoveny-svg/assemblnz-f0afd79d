'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, type RootState } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import type { RendererProps } from '@/lib/generative-art/families';
import { WAVES_PALETTES, type WavesPalette } from '@/lib/generative-art/families/waves';
import { backgroundById } from '@/lib/generative-art/backgrounds';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';

interface WavesR3F {
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
  attributes: { position: { array: Float32Array; needsUpdate: boolean; count: number } };
  computeVertexNormals?: () => void;
}
interface MeshRef {
  rotation: { x: number; y: number; z: number };
  geometry?: GeoAttrs;
  userData: { basePositions?: Float32Array };
}

interface SheetProps {
  palette: WavesPalette;
  amp: number;
  freq: number;
  speed: number;
  tilt: number;
  roughness: number;
  seed: number;
}

function Sheet({ palette, amp, freq, speed, tilt, roughness, seed }: SheetProps) {
  const meshRef = useRef<MeshRef | null>(null);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh?.geometry) return;
    const pos = mesh.geometry.attributes.position;
    if (!mesh.userData.basePositions) {
      mesh.userData.basePositions = new Float32Array(pos.array);
    }
    const base = mesh.userData.basePositions;
    const t = state.clock.getElapsedTime() * speed + seed * 0.03;
    const n = pos.count;
    const arr = pos.array;
    for (let i = 0; i < n; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      // Two-octave wave for a silkier feel than a single sin.
      const w1 = Math.sin(bx * freq * 1.8 + t * 1.4) * Math.cos(by * freq * 1.5 + t * 0.9);
      const w2 = Math.sin(bx * freq * 3.6 + t * 0.7) * Math.cos(by * freq * 3.1 + t * 0.6) * 0.4;
      arr[i * 3 + 2] = (w1 + w2) * amp;
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals?.();
  });

  const midColor = useMemo(() => palette.high, [palette.high]);

  return (
    <mesh ref={meshRef as unknown as never} rotation={[-Math.PI / 2 + tilt, 0, 0]} position={[0, -0.4, 0]}>
      <planeGeometry args={[6, 6, 200, 200]} />
      <meshPhysicalMaterial
        color={midColor}
        metalness={palette.metalness}
        roughness={roughness}
        iridescence={palette.iridescence}
        iridescenceIOR={1.3}
        iridescenceThicknessRange={[100, 600]}
        clearcoat={0.7}
        clearcoatRoughness={roughness}
        envMapIntensity={1.1}
        side={2}
      />
    </mesh>
  );
}

export function WavesCanvas({ presetId, values, seed, background, onExportersReady }: RendererProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const r3fRef = useRef<WavesR3F | null>(null);
  const basePalette = WAVES_PALETTES[presetId] ?? WAVES_PALETTES.silk;
  const bg = backgroundById(background);
  const palette: WavesPalette = useMemo(
    () => (bg ? { ...basePalette, ground: bg.ground } : basePalette),
    [basePalette, bg],
  );

  const amp = values.amp ?? 0.32;
  const freq = values.freq ?? 1.2;
  const speed = values.speed ?? 0.35;
  const tilt = values.tilt ?? -0.15;
  const roughness = values.roughness ?? palette.roughness;

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
          img.onerror = () => rej(new Error('render decode failed'));
          img.src = url;
        });
        URL.revokeObjectURL(url);
        const out = document.createElement('canvas');
        out.width = w;
        out.height = h;
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
      className="relative mx-auto aspect-[0.92/1] w-full max-w-[720px] overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
      style={{
        background: `radial-gradient(circle at 50% 30%, ${palette.high}22 0%, ${palette.ground} 60%, ${palette.low}22 100%)`,
      }}
    >
      <Canvas
        camera={{ position: [0, 1.6, 3.6], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
        onCreated={(state: RootState & WavesR3F) => {
          r3fRef.current = state;
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 5, 2]} intensity={1.2} color="#FFFFFF" />
          <directionalLight position={[-3, 3, -2]} intensity={0.6} color="#E7F0FF" />
          <Environment preset="studio" background={false} />
          <Sheet palette={palette} amp={amp} freq={freq} speed={speed} tilt={tilt} roughness={roughness} seed={seed} />
        </Suspense>
      </Canvas>
    </div>
  );
}
