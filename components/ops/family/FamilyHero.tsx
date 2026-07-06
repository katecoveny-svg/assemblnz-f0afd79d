'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * FamilyHero — a warm luminous WebGL hero for Family OS (R3F). Soft glowing
 * "family" orbs drift over gold glass ribbons and a warm sparkle
 * constellation, on cream — the "glass + gold" direction, warmed up. Slowly
 * rotates; drag to spin. Freezes calm under prefers-reduced-motion.
 */

const CREAM = '#FBF6EE';
const GOLD = '#BFA37A';
const GOLD_BRIGHT = '#E7D3A2';
const CORAL = '#E08A6B';
const SAGE = '#7A8B6F';

// Soft "family" orbs — warm, glowing, gently bobbing.
const ORBS: Array<[number, number, number, number, string]> = [
  [0, 0.2, 0, 0.9, CORAL],
  [1.9, 0.6, -0.6, 0.62, GOLD_BRIGHT],
  [-1.8, -0.2, 0.5, 0.68, SAGE],
  [1.1, -1.3, 0.4, 0.5, '#d9a86f'],
  [-1.2, 1.4, -0.3, 0.44, CORAL],
];

function Orb({ x, y, z, r, color, animate, i }: { x: number; y: number; z: number; r: number; color: string; animate: boolean; i: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = animate ? s.clock.getElapsedTime() : 1.0;
    ref.current.position.y = y + Math.sin(t * 0.8 + i) * 0.14;
  });
  return (
    <mesh ref={ref} position={[x, y, z]}>
      <sphereGeometry args={[r, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} emissive={color} emissiveIntensity={0.12} />
    </mesh>
  );
}

function Ribbon({ curve }: { curve: THREE.Curve<THREE.Vector3> }) {
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 100, 0.03, 10, true), [curve]);
  return <mesh geometry={geo}><meshStandardMaterial color={GOLD} transparent opacity={0.75} roughness={0.2} /></mesh>;
}

function Sparkles() {
  const { geo, mat } = useMemo(() => {
    const n = 200; const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i*3]=(Math.random()-0.5)*11; pos[i*3+1]=(Math.random()-0.5)*7; pos[i*3+2]=(Math.random()-0.5)*7; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: GOLD_BRIGHT, size: 0.06, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    return { geo: g, mat: m };
  }, []);
  return <points geometry={geo} material={mat} />;
}

function Scene({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const rot = useRef({ y: 0.2, x: 0.04, dragging: false, px: 0, py: 0 });
  const curveA = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.6,1.8,-1), new THREE.Vector3(-1,2.6,1), new THREE.Vector3(2,1,-0.6),
    new THREE.Vector3(3.2,-0.8,1), new THREE.Vector3(0.4,-2.4,-0.4), new THREE.Vector3(-3,-0.4,0.7),
  ], true), []);
  const curveB = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(3.2,2.2,0.6), new THREE.Vector3(-0.4,1.2,-1), new THREE.Vector3(-3,1.6,0.8),
    new THREE.Vector3(-1.8,-1.2,-0.5), new THREE.Vector3(1.6,-1.4,0.7),
  ], true), []);

  useFrame(() => {
    const r = rot.current;
    if (animate && !r.dragging) r.y += 0.0013;
    if (group.current) { group.current.rotation.y = r.y; group.current.rotation.x = r.x; }
  });
  const onDown = (e: any) => { rot.current.dragging = true; rot.current.px = e.clientX; rot.current.py = e.clientY; e.target?.setPointerCapture?.(e.pointerId); };
  const onMove = (e: any) => { const r = rot.current; if (!r.dragging) return; r.y += (e.clientX-r.px)*0.006; r.x = Math.min(0.35, Math.max(-0.2, r.x + (e.clientY-r.py)*0.004)); r.px=e.clientX; r.py=e.clientY; };
  const onUp = () => { rot.current.dragging = false; };

  return (
    <group ref={group}>
      <mesh onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} visible={false}>
        <sphereGeometry args={[8, 8, 8]} /><meshBasicMaterial />
      </mesh>
      <Ribbon curve={curveA} /><Ribbon curve={curveB} />
      {ORBS.map(([x,y,z,r,c], i) => <Orb key={i} x={x} y={y} z={z} r={r} color={c} animate={animate} i={i} />)}
      <Sparkles />
    </group>
  );
}

export default function FamilyHero({ animate = true }: { animate?: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0.4, 8], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, alpha: false }} style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}>
      <color attach="background" args={[CREAM]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 6]} intensity={1.05} color="#fff2df" />
      <directionalLight position={[-5, -2, 2]} intensity={0.3} color={CORAL} />
      <Scene animate={animate} />
    </Canvas>
  );
}
