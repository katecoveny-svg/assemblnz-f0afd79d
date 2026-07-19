'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import type { RendererProps } from '@/lib/generative-art/families';
import { CHROME_FAMILY } from '@/lib/generative-art/families/chrome';

interface MaterialSpec {
  ior: number;
  roughness: number;
  dispersion: number;
  spin: number;
  transmission: number;
  metalness: number;
  iridescence: number;
  color: string;
}

function specFor(presetId: string, values: Record<string, number>): MaterialSpec {
  const base = {
    ior: values.ior ?? 1.5,
    roughness: values.roughness ?? 0.05,
    dispersion: values.dispersion ?? 0.05,
    spin: values.spin ?? 0.5,
  };
  if (presetId === 'frost') {
    // Frosted glass — real transmission needs a strong env, so keep this one
    // subtle-transmissive with a hint of milky base colour so it always reads.
    return {
      ...base,
      transmission: 0.85,
      metalness: 0.0,
      iridescence: 0.15,
      color: '#F1F3F4',
    };
  }
  if (presetId === 'mercury') {
    return {
      ...base,
      transmission: 0.0,
      metalness: 1.0,
      iridescence: 0.9,
      color: '#DDE1E4',
    };
  }
  // torus (chrome mirror with iridescent dispersion — matches Kate's ref)
  return {
    ...base,
    transmission: 0.0,
    metalness: 1.0,
    iridescence: 1.0,
    color: '#EDEFF1',
  };
}

function GeometryFor({ presetId }: { presetId: string }) {
  if (presetId === 'frost') return <sphereGeometry args={[1.2, 128, 128]} />;
  if (presetId === 'mercury') return <sphereGeometry args={[1.2, 128, 128]} />;
  return <torusGeometry args={[1.1, 0.45, 128, 256]} />;
}

function Piece({ presetId, values, seed }: { presetId: string; values: Record<string, number>; seed: number }) {
  const meshRef = useRef<{ rotation: { x: number; y: number; z: number } } | null>(null);
  const spec = useMemo(() => specFor(presetId, values), [presetId, values]);
  const initialRotation = useMemo(() => {
    // Deterministic per seed so "new seed" gives a different starting angle.
    const a = ((seed * 9301 + 49297) % 233280) / 233280;
    const b = ((seed * 4691 + 12345) % 233280) / 233280;
    return { x: a * Math.PI, y: b * Math.PI };
  }, [seed]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.35 * spec.spin;
    meshRef.current.rotation.x += delta * 0.12 * spec.spin;
  });

  return (
    <mesh ref={meshRef as unknown as never} rotation={[initialRotation.x, initialRotation.y, 0]}>
      <GeometryFor presetId={presetId} />
      <meshPhysicalMaterial
        color={spec.color}
        metalness={spec.metalness}
        roughness={spec.roughness}
        transmission={spec.transmission}
        ior={spec.ior}
        thickness={1.2}
        iridescence={spec.iridescence}
        iridescenceIOR={1.3}
        iridescenceThicknessRange={[100, 400 + spec.dispersion * 4000]}
        clearcoat={1}
        clearcoatRoughness={spec.roughness}
        specularIntensity={1}
        envMapIntensity={1.2}
        attenuationDistance={2.5}
        attenuationColor={spec.color}
      />
    </mesh>
  );
}

export function ChromeCanvas({ presetId, values, seed, onExportersReady }: RendererProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);

  const png = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasHostRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return null;
    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    );
  }, []);

  useEffect(() => {
    onExportersReady?.({ png });
  }, [onExportersReady, png]);

  return (
    <div
      ref={canvasHostRef}
      className="relative mx-auto aspect-[0.92/1] w-full max-w-[720px] overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
      style={{
        background: `radial-gradient(circle at 45% 40%, #F3F4F5 0%, ${CHROME_FAMILY.ground} 55%, #DADCDE 100%)`,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.0], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[3, 4, 3]} intensity={1.4} color="#FFFFFF" />
          <directionalLight position={[-4, 2, -3]} intensity={0.9} color="#E7F0FF" />
          <directionalLight position={[0, -3, 2]} intensity={0.5} color="#FFF3E7" />
          <Environment preset="studio" background={false} />
          <Piece presetId={presetId} values={values} seed={seed} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            makeDefault
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
