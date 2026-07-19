'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { CHROME_PALETTES } from '@/lib/generative-art/families/chrome';
import { avatarSpecFor } from '@/lib/agents/avatar-mapping';

interface AgentAvatarProps {
  slug: string;
  /** Pixel size of the square avatar. Default 96. */
  size?: number;
  /** Round the ground plate — sensible for chip / card avatars. Default true. */
  round?: boolean;
  className?: string;
}

interface MeshRef {
  rotation: { x: number; y: number; z: number };
}

function GeometryFor({ shape }: { shape: string }) {
  switch (shape) {
    case 'sphere':
    case 'wobble':
      return <sphereGeometry args={[1.2, 96, 96]} />;
    case 'icosahedron':
      return <icosahedronGeometry args={[1.3, 1]} />;
    case 'cube':
      return <boxGeometry args={[1.7, 1.7, 1.7, 12, 12, 12]} />;
    case 'torus-knot':
      return <torusKnotGeometry args={[0.95, 0.32, 160, 24]} />;
    default:
      return <torusGeometry args={[1.1, 0.45, 96, 128]} />;
  }
}

function AvatarMesh({ shape, palette, seed, spin }: { shape: string; palette: (typeof CHROME_PALETTES)[number]; seed: number; spin: number }) {
  const meshRef = useRef<MeshRef | null>(null);
  const initialRotation = useMemo(() => {
    const a = ((seed * 9301 + 49297) % 233280) / 233280;
    const b = ((seed * 4691 + 12345) % 233280) / 233280;
    return { x: a * Math.PI, y: b * Math.PI };
  }, [seed]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.35 * spin;
    meshRef.current.rotation.x += delta * 0.12 * spin;
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
        roughness={0.06}
        transmission={0}
        ior={1.5}
        thickness={1.2}
        iridescence={palette.iridescence}
        iridescenceIOR={1.3}
        iridescenceThicknessRange={[100, 640]}
        clearcoat={palette.clearcoat}
        clearcoatRoughness={0.06}
        envMapIntensity={palette.envIntensity}
      />
    </mesh>
  );
}

/**
 * Small 3D avatar for an agent. No orbit controls, just a gentle autospin.
 * Deterministic per slug via {@link avatarSpecFor}.
 */
export function AgentAvatar({ slug, size = 96, round = true, className }: AgentAvatarProps) {
  const spec = useMemo(() => avatarSpecFor(slug), [slug]);
  const palette = CHROME_PALETTES.find((p) => p.id === spec.palette) ?? CHROME_PALETTES[0];

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: round ? '999px' : '3px',
        overflow: 'hidden',
        background: `radial-gradient(circle at 42% 38%, #F3F4F5 0%, ${palette.ground} 55%, #DADCDE 100%)`,
        border: '1px solid rgba(35, 33, 31, 0.08)',
      }}
      aria-label={`avatar for ${slug}`}
    >
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[3, 4, 3]} intensity={1.4} color="#FFFFFF" />
          <directionalLight position={[-4, 2, -3]} intensity={0.9} color="#E7F0FF" />
          <Environment preset="studio" background={false} />
          <AvatarMesh shape={spec.shape} palette={palette} seed={spec.seed} spin={spec.spin} />
        </Suspense>
      </Canvas>
    </div>
  );
}
