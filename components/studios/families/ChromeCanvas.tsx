'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import type { RendererProps } from '@/lib/generative-art/families';
import { CHROME_FAMILY, CHROME_PALETTES, CHROME_SHAPES, type ChromePalette, type ChromeShape } from '@/lib/generative-art/families/chrome';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';

function paletteAt(index: number) {
  const clamped = Math.max(0, Math.min(CHROME_PALETTES.length - 1, Math.round(index)));
  return CHROME_PALETTES[clamped];
}

function shapeAt(index: number): ChromeShape {
  const clamped = Math.max(0, Math.min(CHROME_SHAPES.length - 1, Math.round(index)));
  return CHROME_SHAPES[clamped].id;
}

function GeometryFor({ shape }: { shape: ChromeShape }) {
  switch (shape) {
    case 'sphere':
    case 'wobble':
      return <sphereGeometry args={[1.2, 128, 128]} />;
    case 'icosahedron':
      return <icosahedronGeometry args={[1.3, 1]} />;
    case 'cube':
      return <boxGeometry args={[1.7, 1.7, 1.7, 24, 24, 24]} />;
    case 'torus-knot':
      return <torusKnotGeometry args={[0.95, 0.32, 200, 32]} />;
    case 'torus':
    default:
      return <torusGeometry args={[1.1, 0.45, 128, 256]} />;
  }
}

interface MeshRef {
  rotation: { x: number; y: number; z: number };
  geometry?: {
    attributes: { position: { array: Float32Array; needsUpdate: boolean; count: number } };
    computeVertexNormals?: () => void;
  };
  userData: { basePositions?: Float32Array };
}

function Piece({
  shape,
  palette,
  ior,
  roughness,
  dispersion,
  wobble,
  spin,
  seed,
}: {
  shape: ChromeShape;
  palette: ReturnType<typeof paletteAt>;
  ior: number;
  roughness: number;
  dispersion: number;
  wobble: number;
  spin: number;
  seed: number;
}) {
  const meshRef = useRef<MeshRef | null>(null);
  const initialRotation = useMemo(() => {
    const a = ((seed * 9301 + 49297) % 233280) / 233280;
    const b = ((seed * 4691 + 12345) % 233280) / 233280;
    return { x: a * Math.PI, y: b * Math.PI };
  }, [seed]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.35 * spin;
    meshRef.current.rotation.x += delta * 0.12 * spin;

    if (wobble > 0.01 && meshRef.current.geometry) {
      const geo = meshRef.current.geometry;
      const pos = geo.attributes.position;
      if (!meshRef.current.userData.basePositions) {
        meshRef.current.userData.basePositions = new Float32Array(pos.array);
      }
      const base = meshRef.current.userData.basePositions;
      const t = state.clock.getElapsedTime();
      const amp = wobble * 0.18;
      const n = pos.count;
      const arr = pos.array;
      for (let i = 0; i < n; i++) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        const bz = base[i * 3 + 2];
        const w = Math.sin(bx * 3.1 + t * 1.5) * Math.cos(by * 2.6 + t * 1.1) * Math.sin(bz * 2.2 + t * 0.9);
        const s = 1 + w * amp;
        arr[i * 3] = bx * s;
        arr[i * 3 + 1] = by * s;
        arr[i * 3 + 2] = bz * s;
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals?.();
    }
  });

  const scale = shape === 'cube' ? 0.85 : shape === 'icosahedron' ? 0.95 : 1;

  return (
    <mesh
      ref={meshRef as unknown as never}
      rotation={[initialRotation.x, initialRotation.y, 0]}
      scale={scale}
    >
      <GeometryFor shape={shape} />
      <meshPhysicalMaterial
        color={palette.color}
        metalness={palette.metalness}
        roughness={roughness}
        transmission={0}
        ior={ior}
        thickness={1.2}
        iridescence={palette.iridescence}
        iridescenceIOR={1.3}
        iridescenceThicknessRange={[100, 400 + dispersion * 4000]}
        clearcoat={palette.clearcoat}
        clearcoatRoughness={roughness}
        specularIntensity={1}
        envMapIntensity={palette.envIntensity}
      />
    </mesh>
  );
}

export function ChromeCanvas({ presetId, values, seed, onExportersReady }: RendererProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const shape = shapeAt(values.shape ?? 0);
  const palette = paletteAt(values.palette ?? 0);

  const png = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasHostRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return null;
    const stamped = stampWatermarkOnCanvas(canvas, palette.ground);
    return await new Promise<Blob | null>((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
  }, [palette.ground]);

  useEffect(() => {
    onExportersReady?.({ png });
  }, [onExportersReady, png]);

  return (
    <div
      ref={canvasHostRef}
      className="relative mx-auto aspect-[0.92/1] w-full max-w-[720px] overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
      style={{
        background: `radial-gradient(circle at 45% 40%, ${palette.ground}FF 0%, ${palette.ground} 55%, #DADCDE 100%)`,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[3, 4, 3]} intensity={1.4} color="#FFFFFF" />
          <directionalLight position={[-4, 2, -3]} intensity={0.9} color="#E7F0FF" />
          <directionalLight position={[0, -3, 2]} intensity={0.5} color="#FFF3E7" />
          <Environment preset="studio" background={false} />
          <Piece
            shape={shape}
            palette={palette}
            ior={values.ior ?? 1.5}
            roughness={values.roughness ?? 0.05}
            dispersion={values.dispersion ?? 0.05}
            wobble={values.wobble ?? 0}
            spin={values.spin ?? 0.5}
            seed={seed}
          />
          <OrbitControls enableZoom={false} enablePan={false} makeDefault />
        </Suspense>
      </Canvas>
    </div>
  );
}
