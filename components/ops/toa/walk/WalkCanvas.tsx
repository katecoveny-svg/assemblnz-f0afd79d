'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { Vector3 } from 'three';
import { VillaModel } from './VillaModel';
import { PoiMarker } from './PoiMarker';
import type { Phase, PoiId } from './geometry';

export type WalkPoi = { id: PoiId; label: string; position: readonly [number, number, number] };

/** The framed resting shot — a 3/4 aerial off the south-east, entry side to us. */
const REST = new Vector3(10, 6.6, 13);
/** Where the cinematic push starts — further out and higher, then eases in. */
const START = new Vector3(15.5, 11, 19);
const TARGET = new Vector3(0, 1.4, 0);

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * IntroDolly — on load, pushes the camera from the high approach down into the
 * framed rest shot over ~1.7s, then hands control to OrbitControls. Skipped
 * entirely (camera starts at rest) when the intro is disabled (reduced motion).
 */
function IntroDolly({
  enabled,
  from,
  to,
  onDone,
}: {
  enabled: boolean;
  from: Vector3;
  to: Vector3;
  onDone: () => void;
}) {
  const { camera } = useThree();
  const t = useRef(0);
  const running = useRef(enabled);

  useFrame((_, dt) => {
    if (!running.current) return;
    t.current = Math.min(1, t.current + dt / 1.7);
    const e = easeOutCubic(t.current);
    camera.position.lerpVectors(from, to, e);
    camera.lookAt(TARGET);
    if (t.current >= 1) {
      running.current = false;
      onDone();
    }
  });
  return null;
}

/**
 * Golden-hour grade — a low, warm key raking from the right (sun in the trees),
 * a soft warm fill, a warm rim on the roof edge, and a cool sky fill so the
 * shadowed faces don't go muddy. Honey cedar, charcoal roof, long soft shadows.
 */
function Sun() {
  return (
    <>
      <ambientLight intensity={0.5} color="#fff2e0" />
      <hemisphereLight args={['#ffe9c8', '#cfd0c4', 0.65]} />
      <directionalLight
        position={[9, 6.5, 4]}
        intensity={1.7}
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
      <directionalLight position={[6, 3, -7]} intensity={0.55} color="#ffc79a" />
      {/* cool sky fill from the front-left so shadow faces read */}
      <directionalLight position={[-8, 5, 6]} intensity={0.4} color="#eaf0f4" />
    </>
  );
}

export function WalkCanvas({
  phase,
  cinematic,
  pois,
  activePoi,
  onOpenPoi,
}: {
  phase: Phase;
  cinematic: boolean;
  pois: WalkPoi[];
  activePoi: PoiId | null;
  onOpenPoi: (id: PoiId) => void;
}) {
  // controls stay off during the intro dolly so they don't fight the camera
  const [introDone, setIntroDone] = useState(!cinematic);

  // portrait/narrow viewports need the camera further back + a wider lens so the
  // wide single-storey building fits the frame instead of cropping at the sides
  const portrait =
    typeof window !== 'undefined' && window.innerWidth < 640;
  const rest = portrait ? new Vector3(13.5, 9, 17) : REST;
  const start = portrait ? new Vector3(19, 13.5, 23) : START;
  const fov = portrait ? 46 : 40;

  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: cinematic ? start.toArray() : rest.toArray(), fov }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Sun />
      <Environment preset="sunset" />

      {/* paper-white ground the building sits on */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color="#ece6d8" roughness={1} />
      </mesh>
      <ContactShadows position={[0, 0.0, 0]} opacity={0.4} scale={34} blur={2.6} far={10} color="#3a2f22" />

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

      <IntroDolly enabled={cinematic} from={start} to={rest} onDone={() => setIntroDone(true)} />

      <OrbitControls
        makeDefault
        enabled={introDone}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={26}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.3}
        autoRotate={false}
        target={TARGET}
      />
    </Canvas>
  );
}
