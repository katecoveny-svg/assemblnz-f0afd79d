'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * EtherHero — the luminous "glass + gold + pāua" marine hero (React Three
 * Fiber), in the ethereal NZ-marine direction: translucent glass ribbons
 * threaded with gold filigree and a drifting sparkle constellation, a
 * stylised NZ snapper floating at the centre, pāua-shell shimmer discs, all
 * on warm pearl. Auto-rotates; drag to spin (hand-rolled group, no drei).
 * `animate=false` (prefers-reduced-motion) freezes it calm. Client-only via
 * next/dynamic(ssr:false).
 *
 * The 3D marine motifs are drawn to canvas textures at mount (no external
 * assets), so nothing 404s and it stays self-contained.
 */

const PEARL = '#F5F1E8';
const GOLD = '#BFA37A';
const GOLD_BRIGHT = '#E7D3A2';
const CORAL = '#C97B63';

// ── Canvas-drawn NZ snapper texture ─────────────────────────────────────────
function makeSnapperTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 360;
  const x = c.getContext('2d')!;
  x.clearRect(0, 0, 640, 360);
  x.translate(320, 185);

  // tail (forked)
  x.fillStyle = '#c98f78';
  x.beginPath();
  x.moveTo(150, 0);
  x.lineTo(255, -60);
  x.lineTo(225, 0);
  x.lineTo(255, 60);
  x.closePath();
  x.fill();

  // dorsal spines
  x.strokeStyle = '#bd7d68';
  x.lineWidth = 3;
  for (let i = -120; i < 60; i += 16) {
    x.beginPath();
    x.moveTo(i, -62 + Math.abs(i) * 0.06);
    x.lineTo(i + 6, -104 + Math.abs(i) * 0.08);
    x.stroke();
  }

  // body — coral top fading to silver belly
  const g = x.createLinearGradient(0, -80, 0, 90);
  g.addColorStop(0, '#c97b63');
  g.addColorStop(0.5, '#dba48f');
  g.addColorStop(1, '#ece5da');
  x.fillStyle = g;
  x.beginPath();
  x.ellipse(20, 0, 155, 80, 0, 0, Math.PI * 2);
  x.fill();

  // head taper (snout to the left)
  x.beginPath();
  x.moveTo(-120, -46);
  x.quadraticCurveTo(-215, -8, -205, 6);
  x.quadraticCurveTo(-200, 40, -120, 52);
  x.closePath();
  x.fillStyle = '#d69a86';
  x.fill();

  // pectoral fin
  x.fillStyle = 'rgba(201,123,99,0.7)';
  x.beginPath();
  x.moveTo(-40, 30);
  x.lineTo(-5, 95);
  x.lineTo(25, 40);
  x.closePath();
  x.fill();

  // the characteristic pale-blue snapper spots
  x.fillStyle = 'rgba(150,180,200,0.55)';
  for (let i = 0; i < 22; i++) {
    const px = -90 + Math.random() * 190;
    const py = -55 + Math.random() * 55;
    x.beginPath();
    x.arc(px, py, 2.4, 0, Math.PI * 2);
    x.fill();
  }

  // eye
  x.fillStyle = '#2a2620';
  x.beginPath();
  x.arc(-150, -6, 12, 0, Math.PI * 2);
  x.fill();
  x.strokeStyle = GOLD_BRIGHT;
  x.lineWidth = 3;
  x.stroke();
  x.fillStyle = 'rgba(255,255,255,0.9)';
  x.beginPath();
  x.arc(-154, -10, 3.5, 0, Math.PI * 2);
  x.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

// ── Canvas-drawn pāua shimmer texture ───────────────────────────────────────
function makePauaTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(128, 128, 8, 128, 128, 120);
  g.addColorStop(0, '#3a6b8c');
  g.addColorStop(0.35, '#2e7d74');
  g.addColorStop(0.6, '#4f8f7a');
  g.addColorStop(0.8, '#8a7b4a');
  g.addColorStop(1, 'rgba(191,163,122,0)');
  x.fillStyle = g;
  x.beginPath();
  x.arc(128, 128, 120, 0, Math.PI * 2);
  x.fill();
  // nacre streaks
  x.globalAlpha = 0.35;
  for (let i = 0; i < 14; i++) {
    x.strokeStyle = i % 2 ? '#bfe0d6' : '#e7d3a2';
    x.lineWidth = 2;
    x.beginPath();
    const a = (i / 14) * Math.PI * 2;
    x.arc(128, 128, 40 + i * 5, a, a + 1.6);
    x.stroke();
  }
  x.globalAlpha = 1;
  return new THREE.CanvasTexture(c);
}

function Ribbon({ curve, radius, color, opacity }: { curve: THREE.Curve<THREE.Vector3>; radius: number; color: string; opacity: number }) {
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 120, radius, 12, false), [curve, radius]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.15} metalness={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Sparkles({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const { geo, mat } = useMemo(() => {
    const n = 220;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: GOLD_BRIGHT, size: 0.07, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    return { geo: g, mat: m };
  }, []);
  useFrame((s) => {
    if (ref.current && animate) ref.current.rotation.y = s.clock.getElapsedTime() * 0.04;
  });
  return <points ref={ref} geometry={geo} material={mat} />;
}

function Paua({ position, scale, texture }: { position: [number, number, number]; scale: number; texture: THREE.Texture }) {
  return (
    <mesh position={position} scale={scale}>
      <circleGeometry args={[0.5, 32]} />
      <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

function Scene({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const snapper = useRef<THREE.Mesh>(null);
  const rot = useRef({ y: 0, x: 0.02, dragging: false, px: 0, py: 0 });

  const snapperTex = useMemo(() => makeSnapperTexture(), []);
  const pauaTex = useMemo(() => makePauaTexture(), []);

  // Two flowing glass ribbons that loop through the scene.
  const curveA = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(-4, 2.4, -1),
          new THREE.Vector3(-1.4, 3.1, 1),
          new THREE.Vector3(1.8, 1.2, -0.6),
          new THREE.Vector3(3.6, -0.6, 1),
          new THREE.Vector3(1.2, -2.8, -0.4),
          new THREE.Vector3(-2.6, -2.2, 0.8),
          new THREE.Vector3(-3.8, 0.2, -0.8),
        ],
        true,
      ),
    [],
  );
  const curveB = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(3.4, 2.6, 0.6),
          new THREE.Vector3(0.6, 1.4, -1),
          new THREE.Vector3(-2.8, 1.8, 0.8),
          new THREE.Vector3(-3.4, -1.4, -0.6),
          new THREE.Vector3(0.2, -3, 0.6),
          new THREE.Vector3(3.2, -1.2, -0.8),
        ],
        true,
      ),
    [],
  );

  useFrame((s) => {
    const t = animate ? s.clock.getElapsedTime() : 1.0;
    if (snapper.current) {
      snapper.current.position.y = Math.sin(t * 0.9) * 0.12;
      snapper.current.rotation.z = Math.sin(t * 0.7) * 0.04;
    }
    const r = rot.current;
    if (animate && !r.dragging) r.y += 0.0014;
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
    r.x = Math.min(0.35, Math.max(-0.25, r.x + (e.clientY - r.py) * 0.004));
    r.px = e.clientX;
    r.py = e.clientY;
  };
  const onUp = () => {
    rot.current.dragging = false;
  };

  return (
    <group ref={group}>
      <mesh onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} visible={false}>
        <sphereGeometry args={[8, 8, 8]} />
        <meshBasicMaterial />
      </mesh>

      {/* glass ribbons + gold filigree tracing each */}
      <Ribbon curve={curveA} radius={0.16} color="#ffffff" opacity={0.22} />
      <Ribbon curve={curveA} radius={0.03} color={GOLD} opacity={0.85} />
      <Ribbon curve={curveB} radius={0.13} color="#ffffff" opacity={0.18} />
      <Ribbon curve={curveB} radius={0.028} color={GOLD_BRIGHT} opacity={0.8} />

      {/* the NZ snapper, centre */}
      <mesh ref={snapper} position={[0, 0, 0.2]} scale={2.5}>
        <planeGeometry args={[1.6, 0.9]} />
        <meshBasicMaterial map={snapperTex} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* pāua shimmer accents */}
      <Paua position={[2.7, 1.5, 0]} scale={0.9} texture={pauaTex} />
      <Paua position={[-2.9, -1.7, 0.4]} scale={1.15} texture={pauaTex} />
      <Paua position={[1.6, -2.4, -0.4]} scale={0.7} texture={pauaTex} />

      <Sparkles animate={animate} />
    </group>
  );
}

export default function EtherHero({ animate = true }: { animate?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 8], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
    >
      <color attach="background" args={[PEARL]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} color="#fff6e6" />
      <directionalLight position={[-5, -2, 2]} intensity={0.35} color={CORAL} />
      <Scene animate={animate} />
    </Canvas>
  );
}
