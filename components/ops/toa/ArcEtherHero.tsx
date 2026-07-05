'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ArcEtherHero — TOA's luminous hero in the ethereal "glass + gold" direction,
 * with an architectural motif: a floating glass building massing (translucent
 * volumes edged in champagne gold), a drifting gold sparkle constellation and
 * a couple of glass ribbons, on TOA's pale sage. Auto-rotates; drag to spin.
 * Freezes calm under prefers-reduced-motion. Client-only via dynamic(ssr:false).
 *
 * Shares the visual language of Moana's EtherHero but swaps the snapper for a
 * massing model — the same reusable direction, a different subject.
 */

const PALE = '#eff1ee';
const GOLD = '#bfa37a';
const GOLD_BRIGHT = '#e7d3a2';
const INK = '#363a35';

// A small massing cluster: [x, z, height, footprint].
const BLOCKS: Array<[number, number, number, number]> = [
  [0, 0, 3.4, 1.1],
  [1.4, 0.3, 2.2, 0.9],
  [-1.3, 0.4, 1.7, 0.85],
  [0.5, -1.4, 2.7, 0.8],
  [-0.9, -1.2, 1.3, 0.75],
  [1.9, -1.1, 1.1, 0.7],
];

function Massing() {
  return (
    <group position={[0, -1, 0]}>
      {BLOCKS.map(([x, z, h, w], i) => (
        <group key={i} position={[x, h / 2, z]}>
          <mesh>
            <boxGeometry args={[w, h, w]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.16} roughness={0.1} metalness={0.1} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(w, h, w)]} />
            <lineBasicMaterial color={i % 2 ? GOLD_BRIGHT : GOLD} transparent opacity={0.9} />
          </lineSegments>
        </group>
      ))}
      {/* ground plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0, -0.4]}>
        <circleGeometry args={[3.2, 48]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

function Ribbon({ curve }: { curve: THREE.Curve<THREE.Vector3> }) {
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 100, 0.03, 10, true), [curve]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={GOLD} transparent opacity={0.7} roughness={0.2} />
    </mesh>
  );
}

function Sparkles() {
  const { geo, mat } = useMemo(() => {
    const n = 180;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7 + 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: GOLD_BRIGHT, size: 0.06, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    return { geo: g, mat: m };
  }, []);
  return <points geometry={geo} material={mat} />;
}

function Scene({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const rot = useRef({ y: 0.4, x: 0.05, dragging: false, px: 0, py: 0 });

  const curveA = useMemo(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.4, 1.6, -1), new THREE.Vector3(-1, 2.6, 1.2), new THREE.Vector3(2.2, 1.4, -0.6),
      new THREE.Vector3(3.2, -0.4, 1), new THREE.Vector3(0.4, -1.4, -0.8), new THREE.Vector3(-3, 0, 0.6),
    ], true), []);
  const curveB = useMemo(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(3, 2.4, 0.6), new THREE.Vector3(-0.4, 1.2, -1.2), new THREE.Vector3(-3, 1.6, 0.8),
      new THREE.Vector3(-2, -1, -0.6), new THREE.Vector3(1.6, -1.2, 0.8),
    ], true), []);

  useFrame(() => {
    const r = rot.current;
    if (animate && !r.dragging) r.y += 0.0016;
    if (group.current) {
      group.current.rotation.y = r.y;
      group.current.rotation.x = r.x;
    }
  });

  const onDown = (e: any) => { rot.current.dragging = true; rot.current.px = e.clientX; rot.current.py = e.clientY; e.target?.setPointerCapture?.(e.pointerId); };
  const onMove = (e: any) => {
    const r = rot.current; if (!r.dragging) return;
    r.y += (e.clientX - r.px) * 0.006; r.x = Math.min(0.4, Math.max(-0.1, r.x + (e.clientY - r.py) * 0.004));
    r.px = e.clientX; r.py = e.clientY;
  };
  const onUp = () => { rot.current.dragging = false; };

  return (
    <group ref={group}>
      <mesh onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} visible={false}>
        <sphereGeometry args={[8, 8, 8]} />
        <meshBasicMaterial />
      </mesh>
      <Massing />
      <Ribbon curve={curveA} />
      <Ribbon curve={curveB} />
      <Sparkles />
    </group>
  );
}

export default function ArcEtherHero({ animate = true }: { animate?: boolean }) {
  return (
    <Canvas camera={{ position: [4, 2.4, 6], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, alpha: false }} style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}>
      <color attach="background" args={[PALE]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 5]} intensity={1.05} color="#fff6e6" />
      <directionalLight position={[-5, 2, -3]} intensity={0.3} color={INK} />
      <Scene animate={animate} />
    </Canvas>
  );
}
