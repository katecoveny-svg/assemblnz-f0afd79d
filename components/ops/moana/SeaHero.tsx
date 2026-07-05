'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * SeaHero — a real WebGL 3D hero for the Moana dashboard (React Three Fiber).
 *
 * A faceted low-poly ocean whose vertices ripple on layered sines, with a
 * champagne-topped buoy bobbing on the swell. The scene slowly auto-rotates
 * and you can drag to spin it (no zoom, clamped so you can't dive under the
 * water). Drag + rotate are hand-rolled on a group — no drei — so it's robust
 * across versions. `animate=false` (prefers-reduced-motion) freezes it calm.
 * Rendered client-only via next/dynamic(ssr:false) from the dashboard.
 */

type Rot = { y: number; x: number; vy: number; dragging: boolean; px: number; py: number };

function Scene({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(18, 18, 56, 56), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);
  const buoy = useRef<THREE.Group>(null);
  const rot = useRef<Rot>({ y: 0, x: 0.05, vy: 0.0016, dragging: false, px: 0, py: 0 });

  const wave = (x: number, y: number, t: number) =>
    Math.sin(x * 0.55 + t) * 0.34 + Math.cos(y * 0.5 + t * 0.8) * 0.26 + Math.sin((x + y) * 0.3 + t * 0.6) * 0.16;

  useFrame((state) => {
    const t = animate ? state.clock.getElapsedTime() : 1.2;

    // ripple the ocean
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, wave(base[i * 3], base[i * 3 + 1], t));
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    // bob the buoy on the swell
    if (buoy.current) {
      buoy.current.position.y = 0.15 + Math.sin(t * 1.3) * 0.16;
      buoy.current.rotation.z = Math.sin(t * 0.9) * 0.12;
    }

    // auto-rotate + drag
    const r = rot.current;
    if (animate && !r.dragging) r.y += r.vy;
    if (group.current) {
      group.current.rotation.y = r.y;
      group.current.rotation.x = r.x;
    }
  });

  const onDown = (e: any) => {
    rot.current.dragging = true;
    rot.current.px = e.clientX;
    rot.current.py = e.clientY;
    e.target?.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: any) => {
    const r = rot.current;
    if (!r.dragging) return;
    r.y += (e.clientX - r.px) * 0.006;
    r.x = Math.min(0.5, Math.max(-0.15, r.x + (e.clientY - r.py) * 0.005));
    r.px = e.clientX;
    r.py = e.clientY;
  };
  const onUp = () => {
    rot.current.dragging = false;
  };

  return (
    <group ref={group}>
      {/* invisible catcher so the whole hero is draggable */}
      <mesh onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} visible={false}>
        <sphereGeometry args={[9, 8, 8]} />
        <meshBasicMaterial />
      </mesh>
      <mesh geometry={geo} rotation={[-Math.PI / 2.15, 0, 0]} position={[0, -0.4, 0]}>
        <meshStandardMaterial color="#1E7A8C" flatShading metalness={0.12} roughness={0.72} />
      </mesh>
      <group ref={buoy} position={[1.4, 0.15, 0.6]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.32, 0.6, 14]} />
          <meshStandardMaterial color="#E1622F" flatShading roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#BFA37A" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <coneGeometry args={[0.03, 0.16, 8]} />
          <meshStandardMaterial color="#F2EFE6" />
        </mesh>
      </group>
    </group>
  );
}

export default function SeaHero({ animate = true }: { animate?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 3.1, 6.2], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
    >
      <color attach="background" args={['#0A2A43']} />
      <fog attach="fog" args={['#0A2A43', 7, 17]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 3]} intensity={1.15} color="#f6ead7" />
      <directionalLight position={[-6, 3, -4]} intensity={0.3} color="#6E93A6" />
      <Scene animate={animate} />
    </Canvas>
  );
}
