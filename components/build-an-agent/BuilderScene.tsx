'use client';

import { ContactShadows, Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import * as THREE from 'three';

import { useDeviceCapability } from './hooks/useDeviceCapability';
import { useReducedMotion3D } from './hooks/useReducedMotion3D';
import { useResponsiveCamera } from './hooks/useResponsiveCamera';
import { Knowledge } from './parts/Knowledge';
import { Memory } from './parts/Memory';
import { ModelCore } from './parts/ModelCore';
import { Tools } from './parts/Tools';
import { Voice } from './parts/Voice';
import { CameraParallax } from './scene/CameraParallax';
import { Ground } from './scene/Ground';
import { ReflectiveFloor } from './scene/ReflectiveFloor';
import { HorizonWaves } from './scene/HorizonWaves';
import { Kohatu } from './scene/Kohatu';

interface Props {
  onPartMove?: (id: string, position: [number, number, number]) => void;
  onPartDock?: (id: string, docked: boolean) => void;
  /** Live intelligence-core position — the magnetic docking hub. */
  corePosition?: [number, number, number];
  speaking?: boolean;
}

/**
 * Where each part rests before it's docked. Spread scales with the camera
 * bucket: the mobile/tablet cameras sit further back with a wider fov, so a
 * fixed x would push the outer parts off-frame. Everything stays right of
 * the hero copy, which occupies the left third.
 */
const REST_LAYOUT = {
  desktop: {
    memory: [1.35, 0.55, -1.15],
    tools: [2.4, 0.5, -0.3],
    knowledge: [1.75, 0.5, 0.55],
    voice: [2.25, 0.5, 1.15],
  },
  tablet: {
    memory: [1.15, 0.55, -1.0],
    tools: [2.0, 0.5, -0.25],
    knowledge: [1.5, 0.5, 0.5],
    voice: [1.95, 0.5, 1.0],
  },
  mobile: {
    // Portrait: stack around the core rather than beside it — the copy takes
    // the lower half, so the parts ring the knot up top.
    memory: [-1.15, 0.55, -0.9],
    tools: [1.25, 0.5, -0.9],
    knowledge: [-1.3, 0.5, 0.7],
    voice: [1.35, 0.5, 0.7],
  },
} as const;

// Port angles around the core, radians (0 = +x, π/2 = toward camera).
const DOCK_ANGLES = {
  memory: Math.PI, // left
  tools: 0, // right
  knowledge: Math.PI * 0.65, // front-left
  voice: Math.PI * 0.35, // front-right
} as const;

export function BuilderScene({
  onPartMove,
  onPartDock,
  corePosition = [0, 0.6, 0],
  speaking = false,
}: Props) {
  const reduced = useReducedMotion3D();
  const capability = useDeviceCapability();
  const cam = useResponsiveCamera();
  const rest = REST_LAYOUT[cam.bucket];

  // R3F's Canvas can miss the very first parent-size measurement when the
  // component is dynamically imported into a full-viewport container; nudging
  // a resize event once on mount forces react-use-measure to pick up the real
  // dimensions.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Canvas
      // Remounts the whole scene if the perf tier or the camera's width
      // bucket flips mid-session (a devtools viewport resize, a phone
      // rotation) — camera + gl settings below are read once at Canvas
      // construction, so a fresh key is the simplest way to make either
      // change actually take effect.
      key={`${capability.tier}-${cam.bucket}`}
      shadows={false}
      dpr={capability.dpr}
      gl={{
        antialias: capability.tier === 'full',
        alpha: false,
        powerPreference: capability.tier === 'full' ? 'high-performance' : 'low-power',
      }}
      camera={{ position: cam.position, fov: cam.fov, near: 0.1, far: 200 }}
      resize={{ debounce: 0, offsetSize: true, scroll: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.18;
        gl.setClearColor('#FBFAF6', 1);
      }}
      style={{ touchAction: 'none', width: '100%', height: '100%', display: 'block' }}
    >
      {/* HDRI comes in when it's ready — the rest of the scene renders now,
          not held hostage by the CDN request. Skipped entirely on the lite
          tier — it's the single heaviest thing this scene does. */}
      {/* Depth fog — distant kōhatu and the floor edge recede into paper,
          so the assembly reads as standing in a room with air in it. */}
      <fog attach="fog" args={['#F4F1E9', 9, 26]} />

      {capability.showEnvironment && (
        <Suspense fallback={null}>
          <Environment preset="studio" background={false} environmentIntensity={1.35} />
        </Suspense>
      )}

      <hemisphereLight args={['#FFFFFF', '#D9D5C8', 0.55]} />
      <ambientLight intensity={capability.ambientIntensity * 0.7} />
      {/* Rim light from behind-left: separates the dark parts from the paper
          and puts a bright edge on the obsidian knot. */}
      <directionalLight position={[-4, 3.5, -6]} intensity={1.5} color="#EAF2FF" />
      {/* Metallic parts rely on the HDRI for their specular highlights — with
          no environment map to reflect (lite tier), they go flat and dark.
          A stronger direct key + fill light gives them real specular pop
          without paying for realtime reflection convolution. */}
      <directionalLight
        position={[6, 8, 4]}
        intensity={capability.showEnvironment ? 1.1 : 1.7}
        color="#FFF7E4"
      />
      <directionalLight
        position={[-5, 3, -2]}
        intensity={capability.showEnvironment ? 0.45 : 0.85}
        color="#E8F1FF"
      />

      {capability.tier === 'full' ? <ReflectiveFloor /> : <Ground />}
      {/* Real contact shadows — parts stop floating and start sitting. */}
      {capability.tier === 'full' && (
        <ContactShadows
          position={[0, 0.005, 0]}
          scale={16}
          far={4}
          blur={2.4}
          opacity={0.42}
          resolution={1024}
          color="#2A2E30"
        />
      )}
      <HorizonWaves reduced={reduced} />
      <Kohatu reduced={reduced} count={capability.kohatuCount} />

      <ModelCore
        initialPosition={[0, 0.6, 0]}
        reduced={reduced}
        speaking={speaking}
        onMove={(p) => onPartMove?.('model', p)}
      />
      <Memory
        initialPosition={rest.memory as [number, number, number]}
        reduced={reduced}
        corePosition={corePosition}
        dockAngle={DOCK_ANGLES.memory}
        onMove={(p) => onPartMove?.('memory', p)}
        onDock={(d) => onPartDock?.('memory', d)}
      />
      <Tools
        initialPosition={rest.tools as [number, number, number]}
        reduced={reduced}
        corePosition={corePosition}
        dockAngle={DOCK_ANGLES.tools}
        onMove={(p) => onPartMove?.('tools', p)}
        onDock={(d) => onPartDock?.('tools', d)}
      />
      <Knowledge
        initialPosition={rest.knowledge as [number, number, number]}
        reduced={reduced}
        corePosition={corePosition}
        dockAngle={DOCK_ANGLES.knowledge}
        onMove={(p) => onPartMove?.('knowledge', p)}
        onDock={(d) => onPartDock?.('knowledge', d)}
      />
      <Voice
        initialPosition={rest.voice as [number, number, number]}
        reduced={reduced}
        corePosition={corePosition}
        dockAngle={DOCK_ANGLES.voice}
        onMove={(p) => onPartMove?.('voice', p)}
        onDock={(d) => onPartDock?.('voice', d)}
      />
      {/* Boundaries no longer floats loose — it's the precision ring around
          the intelligence core, rendered inside ModelCore so it follows the
          core wherever it's dragged (canon: ring = the clear outer shell). */}

      <CameraParallax reduced={reduced || !capability.allowParallax} base={cam.position} />
    </Canvas>
  );
}
