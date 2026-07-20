'use client';

import { Environment } from '@react-three/drei';
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
import { HorizonWaves } from './scene/HorizonWaves';
import { Kohatu } from './scene/Kohatu';

interface Props {
  onPartMove?: (id: string, position: [number, number, number]) => void;
  onPartDock?: (id: string, docked: boolean) => void;
  /** Live intelligence-core position — the magnetic docking hub. */
  corePosition?: [number, number, number];
  speaking?: boolean;
}

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
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.setClearColor('#FBFAF6', 1);
      }}
      style={{ touchAction: 'none', width: '100%', height: '100%', display: 'block' }}
    >
      {/* HDRI comes in when it's ready — the rest of the scene renders now,
          not held hostage by the CDN request. Skipped entirely on the lite
          tier — it's the single heaviest thing this scene does. */}
      {capability.showEnvironment && (
        <Suspense fallback={null}>
          <Environment preset="studio" background={false} environmentIntensity={0.9} />
        </Suspense>
      )}

      <hemisphereLight args={['#FFFFFF', '#E8E4D8', 0.7]} />
      <ambientLight intensity={capability.ambientIntensity} />
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

      <Ground />
      <HorizonWaves reduced={reduced} />
      <Kohatu reduced={reduced} count={capability.kohatuCount} />

      <ModelCore
        initialPosition={[0, 0.6, 0]}
        reduced={reduced}
        speaking={speaking}
        onMove={(p) => onPartMove?.('model', p)}
      />
      <Memory
        initialPosition={[-2.4, 0.55, -0.4]}
        reduced={reduced}
        corePosition={corePosition}
        dockAngle={DOCK_ANGLES.memory}
        onMove={(p) => onPartMove?.('memory', p)}
        onDock={(d) => onPartDock?.('memory', d)}
      />
      <Tools
        initialPosition={[2.4, 0.5, -0.4]}
        reduced={reduced}
        corePosition={corePosition}
        dockAngle={DOCK_ANGLES.tools}
        onMove={(p) => onPartMove?.('tools', p)}
        onDock={(d) => onPartDock?.('tools', d)}
      />
      <Knowledge
        initialPosition={[-1.4, 0.55, 1.6]}
        reduced={reduced}
        corePosition={corePosition}
        dockAngle={DOCK_ANGLES.knowledge}
        onMove={(p) => onPartMove?.('knowledge', p)}
        onDock={(d) => onPartDock?.('knowledge', d)}
      />
      <Voice
        initialPosition={[1.4, 0.55, 1.6]}
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
