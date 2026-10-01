'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Group, Path, Shape, MathUtils } from 'three';

function roundedRect(width: number, height: number, radius: number) {
  const s = new Shape(), x = -width / 2, y = -height / 2;
  s.moveTo(x + radius, y); s.lineTo(x + width - radius, y); s.quadraticCurveTo(x + width, y, x + width, y + radius);
  s.lineTo(x + width, y + height - radius); s.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  s.lineTo(x + radius, y + height); s.quadraticCurveTo(x, y + height, x, y + height - radius);
  s.lineTo(x, y + radius); s.quadraticCurveTo(x, y, x + radius, y);
  return s;
}
/** The canonical D outline and interior dot, modelled as bevelled solid geometry. */
function dShape() {
  const s = new Shape();
  s.moveTo(-.8, 1); s.lineTo(-.12, 1); s.bezierCurveTo(.73, 1, 1.08, .57, 1.08, 0); s.bezierCurveTo(1.08, -.57, .73, -1, -.12, -1); s.lineTo(-.8, -1); s.closePath();
  const hole = new Path(); hole.moveTo(-.43, .65); hole.lineTo(-.1, .65); hole.bezierCurveTo(.44, .65, .7, .4, .7, 0); hole.bezierCurveTo(.7, -.4, .44, -.65, -.1, -.65); hole.lineTo(-.43, -.65); hole.closePath(); s.holes.push(hole);
  return s;
}
function Objects({ finish, onReady, avatar }: { finish: 'plum' | 'paper'; onReady: () => void; avatar: string }) {
  const group = useRef<Group>(null);
  const target = useRef({ x: .1, y: -.2 });
  const settled = useRef(false);
  const { invalidate, pointer } = useThree();
  const shapes = useMemo(() => ({ tile: roundedRect(2.5, 2.45, .58), d: dShape(), circle: new Shape().absarc(0, 0, .8, 0, Math.PI * 2, false) }), []);
  const settings = useMemo(() => ({ depth: .16, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .06, bevelThickness: .07, curveSegments: 20 }), []);
  useEffect(() => { invalidate(); }, [invalidate]);
  useFrame((_, delta) => {
    if (!group.current) return;
    const g = group.current;
    g.rotation.x = MathUtils.damp(g.rotation.x, target.current.x, 7, Math.min(delta, .05));
    g.rotation.y = MathUtils.damp(g.rotation.y, target.current.y, 7, Math.min(delta, .05));
    if (!settled.current) { settled.current = true; onReady(); }
    if (Math.abs(g.rotation.x - target.current.x) + Math.abs(g.rotation.y - target.current.y) > .001) invalidate();
  });
  return <group ref={group} rotation={[.28, -.4, -.07]} onPointerMove={() => { target.current = { x: .1 - pointer.y * .09, y: -.2 + pointer.x * .16 }; invalidate(); }} onPointerOut={() => { target.current = { x: .1, y: -.2 }; invalidate(); }}>
    <mesh position={[-.18, .05, -.38]} rotation={[0, 0, .14]} castShadow receiveShadow><extrudeGeometry args={[shapes.tile, settings]} /><meshStandardMaterial color="#DAD2F4" roughness={.55} /></mesh>
    <mesh position={[1.09, -.6, -.22]} castShadow receiveShadow><extrudeGeometry args={[shapes.circle, { ...settings, depth: .11 }]} /><meshStandardMaterial color="#EAC8DF" roughness={.48} /></mesh>
    <mesh position={[-.15, .05, .07]} castShadow><extrudeGeometry args={[shapes.d, { ...settings, depth: .26, bevelSize: .045, bevelThickness: .045 }]} /><meshPhysicalMaterial color={finish === 'paper' ? '#FFFDFB' : '#240B21'} roughness={.27} metalness={.12} clearcoat={.65} clearcoatRoughness={.3} /></mesh>
    <mesh position={[-.09, .05, .43]} castShadow><sphereGeometry args={[.2, 24, 16]} /><meshPhysicalMaterial color="#F5E4E7" emissive="#EAC8DF" emissiveIntensity={.18} roughness={.22} metalness={.06} clearcoat={.7} /></mesh>
    {avatar === 'orbit' && <mesh position={[0, 0, .4]} rotation={[.85, -.1, -.45]}><torusGeometry args={[1.4, .012, 8, 64]} /><meshStandardMaterial color="#916A70" metalness={.7} roughness={.3} /></mesh>}
    {avatar === 'spark' && <group position={[1.05, 1.05, .3]}><mesh><boxGeometry args={[.04, .32, .04]} /><meshStandardMaterial color="#916A70" /></mesh><mesh><boxGeometry args={[.32, .04, .04]} /><meshStandardMaterial color="#916A70" /></mesh></group>}
    <pointLight position={[-.1, .08, .6]} intensity={.18} color="#EAC8DF" distance={1.8} />
  </group>;
}
function ContextLossWatcher({ onFailure }: { onFailure: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', onFailure);
    // R3F intentionally forces context loss after unmount. Remove the listener
    // first so offscreen/reduced-motion teardown does not disable later mounts.
    return () => canvas.removeEventListener('webglcontextlost', onFailure);
  }, [gl, onFailure]);
  return null;
}
export function DoObjectCanvas({ finish, avatar, onReady, onFailure }: { finish: 'plum' | 'paper'; avatar: string; onReady: () => void; onFailure: () => void }) {
  return <div style={{ position: 'absolute', inset: 0 }}>
    <Canvas frameloop="demand" dpr={[1, 1.5]} shadows camera={{ position: [0, .2, 7], fov: 36 }} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} fallback={<span />}>
      <ContextLossWatcher onFailure={onFailure} />
      <ambientLight intensity={1.55} />
      <directionalLight position={[-3, 4, 5]} intensity={3.5} color="#FFFDFB" castShadow shadow-mapSize={[512, 512]} shadow-bias={-.001} />
      <directionalLight position={[3, 1, 2]} intensity={1.4} color="#EAC8DF" />
      <Objects finish={finish} avatar={avatar} onReady={onReady} />
      <mesh position={[.12, -1.43, -.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[6, 4]} /><shadowMaterial transparent opacity={.12} /></mesh>
    </Canvas>
  </div>;
}
