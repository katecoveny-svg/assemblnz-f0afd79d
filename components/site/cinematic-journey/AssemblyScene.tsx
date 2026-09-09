'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';
import { RoundedBox } from '@react-three/drei/core/RoundedBox';
import { Edges } from '@react-three/drei/core/Edges';
import * as THREE from 'three';
import type { PointerRef, ProgressRef } from './types';

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Five manufacturable parts — the metaphor for assembling a customer journey.
 * Each flies from an offset pose into a locked assembly as scroll advances.
 */
const PARTS = [
  {
    id: 'intent',
    // progress window where this part settles
    start: 0.02,
    end: 0.18,
    from: [-3.8, 2.6, -1.2] as [number, number, number],
    to: [0, 0.85, 0] as [number, number, number],
    kind: 'core' as const,
  },
  {
    id: 'context',
    start: 0.14,
    end: 0.32,
    from: [-5.2, -0.4, 1.4] as [number, number, number],
    to: [-1.55, 0.15, 0.35] as [number, number, number],
    kind: 'glass' as const,
  },
  {
    id: 'rules',
    start: 0.28,
    end: 0.46,
    from: [4.8, 2.2, -0.8] as [number, number, number],
    to: [1.45, 0.55, -0.15] as [number, number, number],
    kind: 'plate' as const,
  },
  {
    id: 'agents',
    start: 0.42,
    end: 0.62,
    from: [3.6, -2.8, 2.2] as [number, number, number],
    to: [1.15, -0.55, 0.7] as [number, number, number],
    kind: 'capsule' as const,
    rotation: [0, 0.35, Math.PI / 2] as [number, number, number],
  },
  {
    id: 'evidence',
    start: 0.58,
    end: 0.82,
    from: [0, -4.2, -1.5] as [number, number, number],
    to: [0, -1.05, 0] as [number, number, number],
    kind: 'ring' as const,
  },
] as const;

type PartSpec = (typeof PARTS)[number];

function PartMesh({
  spec,
  progress,
  reducedMotion,
}: {
  spec: PartSpec;
  progress: ProgressRef;
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const p = reducedMotion ? 1 : clamp01((progress.current - spec.start) / (spec.end - spec.start));
    const e = easeOutCubic(p);
    g.position.set(
      spec.from[0] + (spec.to[0] - spec.from[0]) * e,
      spec.from[1] + (spec.to[1] - spec.from[1]) * e,
      spec.from[2] + (spec.to[2] - spec.from[2]) * e,
    );
    const s = 0.35 + 0.65 * e;
    g.scale.setScalar(s);
    g.visible = reducedMotion || progress.current > spec.start - 0.04;
  });

  const rot = 'rotation' in spec && spec.rotation ? spec.rotation : ([0, 0, 0] as [number, number, number]);

  return (
    <group ref={ref} position={spec.from} rotation={rot}>
      {spec.kind === 'core' && (
        <mesh castShadow>
          <sphereGeometry args={[0.72, 64, 64]} />
          <meshPhysicalMaterial
            color="#F5F1F2"
            metalness={0.95}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.06}
            iridescence={0.55}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[120, 480]}
            envMapIntensity={1.35}
          />
        </mesh>
      )}
      {spec.kind === 'glass' && (
        <mesh castShadow>
          <boxGeometry args={[0.95, 0.95, 0.95]} />
          <meshPhysicalMaterial
            color="#F5F1F2"
            metalness={0}
            roughness={0.12}
            transmission={0.72}
            ior={1.5}
            thickness={0.85}
            clearcoat={1}
            envMapIntensity={1.1}
          />
          <Edges scale={1.002} color="#654A4E" threshold={22} />
        </mesh>
      )}
      {spec.kind === 'plate' && (
        <RoundedBox args={[1.15, 0.72, 0.12]} radius={0.04} smoothness={4} castShadow>
          <meshPhysicalMaterial
            color="#916A70"
            metalness={0.55}
            roughness={0.28}
            clearcoat={0.7}
            envMapIntensity={1.05}
          />
        </RoundedBox>
      )}
      {spec.kind === 'capsule' && (
        <mesh castShadow>
          <capsuleGeometry args={[0.22, 0.7, 10, 24]} />
          <meshPhysicalMaterial
            color="#E8E0E2"
            metalness={1}
            roughness={0.07}
            clearcoat={1}
            envMapIntensity={1.25}
          />
        </mesh>
      )}
      {spec.kind === 'ring' && (
        <mesh rotation={[Math.PI / 2.2, 0, 0]} castShadow>
          <torusGeometry args={[1.55, 0.045, 24, 160]} />
          <meshPhysicalMaterial
            color="#654A4E"
            metalness={0.9}
            roughness={0.14}
            clearcoat={1}
            envMapIntensity={1.2}
          />
        </mesh>
      )}
    </group>
  );
}

/** Soft connector lines that fade in once neighbouring parts have locked. */
function Connectors({ progress, reducedMotion }: { progress: ProgressRef; reducedMotion: boolean }) {
  const line = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#916A70'),
      transparent: true,
      opacity: 0.55,
    });
    const points = [
      new THREE.Vector3(0, 0.85, 0),
      new THREE.Vector3(-1.55, 0.15, 0.35),
      new THREE.Vector3(1.45, 0.55, -0.15),
      new THREE.Vector3(1.15, -0.55, 0.7),
      new THREE.Vector3(0, -1.05, 0),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geo, mat);
  }, []);

  useFrame(() => {
    const o = reducedMotion ? 0.4 : clamp01((progress.current - 0.35) / 0.35) * 0.45;
    (line.material as THREE.LineBasicMaterial).opacity = o;
  });

  return <primitive object={line} />;
}

function DriftFloor({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const base = useRef<Float32Array | null>(null);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh || reducedMotion) return;
    const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
    if (!base.current) base.current = new Float32Array(pos.array as Float32Array);
    const t = clock.getElapsedTime() * 0.28;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < pos.count; i++) {
      const bx = base.current[i * 3];
      const by = base.current[i * 3 + 1];
      const w1 = Math.sin(bx * 0.45 + t) * Math.cos(by * 0.38 + t * 0.7);
      const w2 = Math.sin(bx * 1.1 + t * 0.5) * 0.28;
      arr[i * 3 + 2] = (w1 + w2) * 0.16;
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2.12, 0, 0.08]} position={[0.4, -1.85, -1.2]} receiveShadow>
      <planeGeometry args={[42, 28, 96, 64]} />
      <meshStandardMaterial color="#1a0c18" metalness={0.18} roughness={0.88} />
    </mesh>
  );
}

function CameraRig({
  progress,
  pointer,
  reducedMotion,
}: {
  progress: ProgressRef;
  pointer: PointerRef;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  useFrame(() => {
    if (!camera) return;
    const p = progress.current;
    // Dolly in + slight orbit as parts assemble; settle once evidence locks.
    const z = 7.2 - easeOutCubic(clamp01(p / 0.85)) * 1.8;
    const y = 0.55 + Math.sin(p * Math.PI) * 0.25;
    const x = 0.35 + (reducedMotion ? 0 : pointer.current.x * 0.35);
    const lookY = 0.05 + (reducedMotion ? 0 : pointer.current.y * 0.12);
    camera.position.x += (x - camera.position.x) * 0.045;
    camera.position.y += (y - camera.position.y) * 0.045;
    camera.position.z += (z - camera.position.z) * 0.045;
    camera.lookAt(0, lookY, 0);
  });
  return null;
}

function Atmosphere({ progress }: { progress: ProgressRef }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame(() => {
    if (!light.current) return;
    light.current.intensity = 0.45 + progress.current * 0.7;
  });
  return (
    <>
      <fog attach="fog" args={['#240B21', 8, 22]} />
      <color attach="background" args={['#240B21']} />
      <ambientLight intensity={0.28} />
      <directionalLight position={[5.5, 8, 4]} intensity={1.05} color="#F5F1F2" castShadow />
      <directionalLight position={[-5, 2.5, -3]} intensity={0.85} color="#916A70" />
      <directionalLight position={[0, -1, 4]} intensity={0.25} color="#654A4E" />
      <pointLight ref={light} position={[0, 1.2, 2.4]} color="#916A70" intensity={0.55} distance={14} />
      {/* No Environment HDR — CDN fetch has crashed Suspense on preview before. */}
    </>
  );
}

export function AssemblyScene({
  progress,
  pointer,
  reducedMotion,
}: {
  progress: ProgressRef;
  pointer: PointerRef;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = group.current;
    if (!g || reducedMotion) return;
    g.rotation.y += (pointer.current.x * 0.12 - g.rotation.y) * 0.035;
    g.rotation.x += (-pointer.current.y * 0.06 - g.rotation.x) * 0.035;
  });

  return (
    <>
      <Atmosphere progress={progress} />
      <CameraRig progress={progress} pointer={pointer} reducedMotion={reducedMotion} />
      <DriftFloor reducedMotion={reducedMotion} />
      <group ref={group} position={[0.2, 0.1, 0]} scale={1.05}>
        {PARTS.map((spec) => (
          <PartMesh key={spec.id} spec={spec} progress={progress} reducedMotion={reducedMotion} />
        ))}
        <Connectors progress={progress} reducedMotion={reducedMotion} />
      </group>
      <ContactShadows
        position={[0, -1.82, 0]}
        opacity={0.55}
        scale={18}
        blur={2.6}
        far={6}
        color="#0a0409"
      />
    </>
  );
}
