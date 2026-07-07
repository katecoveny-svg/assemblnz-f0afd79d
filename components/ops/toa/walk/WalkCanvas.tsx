'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PointerLockControls, ContactShadows, Environment } from '@react-three/drei';
import { VillaModel } from './VillaModel';
import { PoiMarker } from './PoiMarker';
import { FOOTPRINT, type Phase, type PoiId } from './geometry';

export type WalkPoi = { id: PoiId; label: string; position: readonly [number, number, number] };

/** Minimal shape of the three PointerLockControls instance drei forwards. */
type LockControls = {
  isLocked: boolean;
  moveForward: (d: number) => void;
  moveRight: (d: number) => void;
};

/** First-person WASD rig — active only in 'walk' mode. Clamped to a walkable box. */
function WalkControls({ onLockChange }: { onLockChange: (locked: boolean) => void }) {
  const ref = useRef<LockControls | null>(null);
  const keys = useRef<Record<string, boolean>>({});
  const { camera } = useThree();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame((_, delta) => {
    const c = ref.current;
    if (!c || !c.isLocked) return;
    // considered dolly pace, matched to the brand film — no fast twitch
    const speed = 2.4 * delta;
    const k = keys.current;
    if (k['KeyW'] || k['ArrowUp']) c.moveForward(speed);
    if (k['KeyS'] || k['ArrowDown']) c.moveForward(-speed);
    if (k['KeyA'] || k['ArrowLeft']) c.moveRight(-speed);
    if (k['KeyD'] || k['ArrowRight']) c.moveRight(speed);
    // clamp to a walkable box around the site + hold eye height
    const lim = { x: FOOTPRINT.x / 2 + 6, z: FOOTPRINT.z / 2 + 7 };
    camera.position.x = Math.max(-lim.x, Math.min(lim.x, camera.position.x));
    camera.position.z = Math.max(-lim.z, Math.min(lim.z, camera.position.z));
    camera.position.y = 1.62;
  });

  return (
    <PointerLockControls
      ref={ref}
      onLock={() => onLockChange(true)}
      onUnlock={() => onLockChange(false)}
    />
  );
}

/**
 * Golden-hour grade — locked to brand-film scene 3: a low, warm key raking from
 * the right (the sun sitting in the trees), a soft warm fill, and a warm rim
 * that catches the roof edge. Honey cedar, charcoal roof, long soft shadows.
 */
function Sun() {
  return (
    <>
      <ambientLight intensity={0.58} color="#fff2e0" />
      <hemisphereLight args={['#ffe9c8', '#cfd0c4', 0.7]} />
      {/* the sun — low, right, slightly behind: backlit like the film */}
      <directionalLight
        position={[9, 4.2, -2]}
        intensity={1.65}
        color="#ffd7a0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      {/* warm rim from behind-right — the golden edge on the gable */}
      <directionalLight position={[5, 2.4, -7]} intensity={0.55} color="#ffc79a" />
      {/* cool sky fill from the front so the shadowed faces don't go muddy */}
      <directionalLight position={[-6, 5, 8]} intensity={0.35} color="#eaf0f4" />
    </>
  );
}

export function WalkCanvas({
  phase,
  mode,
  pois,
  activePoi,
  onOpenPoi,
  onLockChange,
}: {
  phase: Phase;
  mode: 'orbit' | 'walk';
  pois: WalkPoi[];
  activePoi: PoiId | null;
  onOpenPoi: (id: PoiId) => void;
  onLockChange: (locked: boolean) => void;
}) {
  const startCam = useMemo(() => [12.5, 3.3, 12.5] as [number, number, number], []);
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: mode === 'walk' ? [0, 1.62, 11] : startCam, fov: mode === 'walk' ? 70 : 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Sun />
      <Environment preset="sunset" />

      {/* paper-white ground the building sits on */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[26, 64]} />
        <meshStandardMaterial color="#ece6d8" roughness={1} />
      </mesh>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.36} scale={30} blur={2.6} far={9} color="#3a2f22" />

      <VillaModel phase={phase} />

      {pois.map((p, i) => (
        <PoiMarker
          key={p.id}
          id={p.id}
          index={i}
          position={p.position}
          label={p.label}
          active={activePoi === p.id}
          onOpen={onOpenPoi}
        />
      ))}

      {mode === 'walk' ? (
        <WalkControls onLockChange={onLockChange} />
      ) : (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={7}
          maxDistance={24}
          minPolarAngle={0.5}
          maxPolarAngle={Math.PI / 2.4}
          autoRotate={activePoi === null}
          autoRotateSpeed={0.42}
          target={[0, 1.5, 0]}
        />
      )}
    </Canvas>
  );
}
