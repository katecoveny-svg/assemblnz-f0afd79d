'use client';

import * as React from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { Line } from '@react-three/drei/core/Line';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * The liquid glass dome — Kate's Business Genome spec, as real WebGL.
 *
 * An organic glass droplet (Kate's GLB when present in /assets, a
 * procedurally-irregular droplet otherwise) with transmission glass in the
 * Opal/Columbia palette, a wobble displacement in the vertex stage, the
 * city/map plane inside, and the gold network — nodes pulse, hairlines
 * connect, gold never fills. Mouse tilts the whole rig ±10°; the droplet
 * breathes on a slow float. Every visual constant here comes from the spec.
 */

const DOME_GLB = '/3d/assembl_liquid_dome.glb';
const CITY_PNG = '/brand/genome/pale-topdown-dome.png';
const CITY_FALLBACK = '/brand/genome/sphere-genome-alpha.png';

const OPAL = '#A8BDBF';
const GOLD = '#D4AF37';

export type DomeSurface = { id: string; name: string };

/* ── error boundary: asset missing → procedural/fallback child ────────── */
class AssetBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ── the liquid material — spec values, plus the wobble in vertex stage ── */
function useLiquidMaterial(uTimeRef: React.RefObject<{ value: number }>) {
  return React.useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(OPAL),
      transmission: 0.95,
      thickness: 0.9,
      ior: 1.33,
      roughness: 0.18,
      metalness: 0,
      transparent: true,
      opacity: 0.58,
      side: THREE.DoubleSide,
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uTimeRef.current;
      shader.vertexShader =
        'uniform float uTime;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          transformed += normal * (sin(uTime + (position.x + position.y + position.z) * 2.1) * 0.04);`,
        );
    };
    return mat;
  }, [uTimeRef]);
}

/* ── procedural organic droplet (no perfect sphere — spec) ─────────────── */
function makeDroplet(): THREE.BufferGeometry {
  let geo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1.25, 5);
  geo = mergeVertices(geo);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    n.copy(v).normalize();
    const bump =
      0.1 * Math.sin(3.1 * n.x + 1.7) * Math.sin(2.3 * n.y - 0.6) +
      0.06 * Math.sin(5.2 * n.y + 2.9) * Math.sin(4.1 * n.z + 1.2) +
      0.045 * Math.sin(7.3 * n.z + 0.4);
    v.addScaledVector(n, bump);
    v.y *= 0.86; // settle into a droplet
    if (v.y < -0.9) v.y = -0.9 + (v.y + 0.9) * 0.35; // soften the base
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function ProceduralDome({ material }: { material: THREE.Material }) {
  const geo = React.useMemo(() => makeDroplet(), []);
  return <mesh geometry={geo} material={material} />;
}

function GlbDome({ material }: { material: THREE.Material }) {
  const { scene } = useGLTF(DOME_GLB);
  const geo = React.useMemo(() => {
    let g: THREE.BufferGeometry | null = null;
    scene.traverse((o: THREE.Object3D) => {
      if (!g && (o as THREE.Mesh).isMesh) g = (o as THREE.Mesh).geometry;
    });
    if (!g) throw new Error('dome glb has no mesh');
    (g as THREE.BufferGeometry).computeBoundingSphere();
    return g as THREE.BufferGeometry;
  }, [scene]);
  const scale = 1.25 / (geo.boundingSphere?.radius ?? 1);
  return <mesh geometry={geo} material={material} scale={scale} />;
}

/* ── the city inside — top-down plate under the glass ──────────────────── */
function CityPlane({ url }: { url: string }) {
  const raw = useTexture(url);
  const tex = React.useMemo(() => {
    const t = raw.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [raw]);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.5, 0]}>
      <circleGeometry args={[1.02, 48]} />
      <meshBasicMaterial map={tex} transparent opacity={0.95} toneMapped={false} />
    </mesh>
  );
}

/* ── the gold network — nodes + hairlines only, never fill (spec) ──────── */
const HUB: [number, number, number] = [0, 0.06, 0];

function nodePosition(i: number, total: number): [number, number, number] {
  // golden-angle spiral climbing the inside of the droplet
  const t = (i + 1) / (total + 1);
  const ang = i * 2.399963;
  const r = 0.3 + 0.62 * Math.sqrt(1 - t * 0.72);
  const y = -0.34 + 0.95 * t;
  return [Math.cos(ang) * r, y, Math.sin(ang) * r];
}

function GoldNode({
  position,
  index,
  surface,
  onSelect,
  onHover,
}: {
  position: [number, number, number];
  index: number;
  surface?: DomeSurface;
  onSelect?: (s: DomeSurface) => void;
  onHover?: (s: DomeSurface | null) => void;
}) {
  const ref = React.useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const s = 1 + 0.22 * Math.sin(clock.getElapsedTime() * 2 + index * 1.3);
    ref.current?.scale.setScalar(s);
  });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[surface ? 0.038 : 0.022, 16, 16]} />
        <meshStandardMaterial
          color={GOLD}
          emissive={GOLD}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {surface ? (
        <mesh
          onClick={(e: { stopPropagation: () => void }) => {
            e.stopPropagation();
            onSelect?.(surface);
          }}
          onPointerOver={(e: { stopPropagation: () => void }) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
            onHover?.(surface);
          }}
          onPointerOut={() => {
            document.body.style.cursor = '';
            onHover?.(null);
          }}
        >
          <sphereGeometry args={[0.13, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
}

/* ── tilt + float rig ──────────────────────────────────────────────────── */
function Rig({ children }: { children: React.ReactNode }) {
  const group = React.useRef<THREE.Group>(null);
  const spin = React.useRef(0);
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    spin.current += dt * 0.0017; // ≈0.1°/s — the slow turn
    const tiltX = -state.pointer.y * 0.17; // ±10° parallax
    const tiltY = state.pointer.x * 0.17;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, tiltX, 0.06);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, spin.current + tiltY, 0.06);
    g.position.y = Math.sin(state.clock.getElapsedTime() * 0.6) * 0.08; // float
  });
  return <group ref={group}>{children}</group>;
}

function DomeContents({
  surfaces,
  onSelect,
  onHover,
}: {
  surfaces: DomeSurface[];
  onSelect?: (s: DomeSurface) => void;
  onHover?: (s: DomeSurface | null) => void;
}) {
  const uTimeRef = React.useRef({ value: 0 });
  useFrame(({ clock }) => {
    uTimeRef.current.value = clock.getElapsedTime();
  });
  const material = useLiquidMaterial(uTimeRef);

  const total = surfaces.length + 5; // 12–20 nodes: surfaces + decorative
  const nodes = React.useMemo(
    () =>
      Array.from({ length: total }, (_, i) => ({
        position: nodePosition(i, total),
        surface: i < surfaces.length ? surfaces[i] : undefined,
      })),
    [surfaces, total],
  );

  return (
    <Rig>
      {/* the network — inside the glass, gold hairlines only */}
      <CityFallbackChain />
      {nodes.map((n, i) => (
        <React.Fragment key={i}>
          <Line
            points={[HUB, n.position]}
            color={GOLD}
            transparent
            opacity={0.28}
            lineWidth={1}
          />
          <GoldNode
            position={n.position}
            index={i}
            surface={n.surface}
            onSelect={onSelect}
            onHover={onHover}
          />
        </React.Fragment>
      ))}
      <mesh position={HUB}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.6} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* the membrane — drawn last so the transmission reads everything */}
      <AssetBoundary fallback={<ProceduralDome material={material} />}>
        <React.Suspense fallback={<ProceduralDome material={material} />}>
          <GlbDome material={material} />
        </React.Suspense>
      </AssetBoundary>
    </Rig>
  );
}

function CityFallbackChain() {
  return (
    <AssetBoundary
      fallback={
        <AssetBoundary fallback={null}>
          <React.Suspense fallback={null}>
            <CityPlane url={CITY_FALLBACK} />
          </React.Suspense>
        </AssetBoundary>
      }
    >
      <React.Suspense fallback={null}>
        <CityPlane url={CITY_PNG} />
      </React.Suspense>
    </AssetBoundary>
  );
}

export default function DomeScene({
  surfaces,
  onSelect,
  onHover,
}: {
  surfaces: DomeSurface[];
  onSelect?: (s: DomeSurface) => void;
  onHover?: (s: DomeSurface | null) => void;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.55, 4], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      {/* cool daylight only — no warm night lighting (spec) */}
      <ambientLight intensity={0.95} />
      <directionalLight position={[3, 4, 5]} intensity={1.15} color="#ffffff" />
      <directionalLight position={[-4, 2, -3]} intensity={0.45} color="#C5D7D9" />
      <DomeContents surfaces={surfaces} onSelect={onSelect} onHover={onHover} />
    </Canvas>
  );
}
