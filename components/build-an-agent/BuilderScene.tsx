'use client';

import { ContactShadows, Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
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
import { SceneBackdrop } from './scene/SceneBackdrop';
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
 * The assembly sits RIGHT of the hero copy: the intelligence core at the
 * centre, the four parts arranged around it in an X.
 *
 * This is a DESIGNED composition, not a procedural orbit. A ring generated
 * from evenly-spaced angles looks correct in plan view and reads terribly
 * through a near-level camera — opposite angles collapse onto the same screen
 * x, so the far part just hides behind the near one, and the whole thing
 * flattens into a horizontal smear. Placing the four by hand gives every part
 * its own x AND its own height, so all five silhouettes stay legible at once.
 *
 * Offsets are relative to the core, so the assembly moves and scales as one
 * when the viewport bucket changes.
 */
/*
 * aimBias / aimY control FRAMING, and they exist because the camera aims at
 * the assembly now rather than at the world origin.
 *
 * aimBias is how far along the line from origin to core the camera looks:
 * 0 aims at the origin (the old behaviour — the assembly ends up in the
 * distorted corner of the frustum), 1 aims dead at the core (which centres it
 * and puts it behind the hero copy). The value in between is what buys the
 * "assembly sits right of the copy" composition WITHOUT the off-axis blowout.
 *
 * aimY biases the aim vertically: aiming below the core lifts the assembly in
 * frame, which is how portrait clears the hero copy — done with the camera
 * rather than by shoving the objects into the sky.
 */
const LAYOUT = {
  desktop: {
    core: [1.15, 0.62, 0] as const,
    scale: 1,
    aimBias: 0.46,
    aimY: -0.12,
  },
  tablet: {
    core: [0.62, 0.62, 0] as const,
    scale: 0.74,
    aimBias: 0.4,
    aimY: -0.12,
  },
  // Portrait: the hero copy owns the lower ~60% of the viewport, so the
  // assembly has to clear it entirely — hence the high core. The camera looks
  // at the origin from y 1.92, so world-y has to climb a long way before the
  // assembly lands in the top third of a tall phone frame.
  mobile: {
    core: [0, 0.7, 0] as const,
    scale: 0.62,
    aimBias: 0,
    aimY: -1.75,
  },
} as const;

// Offsets from the core — [x, y, z]. High-left, low-left, high-right,
// low-right: an X, so no part sits directly in front of another.
const PART_OFFSET = {
  knowledge: [-1.16, 0.42, 0.30] as const,
  memory: [-0.74, -0.36, -0.42] as const,
  tools: [1.14, 0.44, 0.12] as const,
  voice: [0.82, -0.38, 0.46] as const,
} as const;

type PartKey = keyof typeof PART_OFFSET;

function partPos(
  layout: { core: readonly [number, number, number]; scale: number },
  key: PartKey,
): [number, number, number] {
  const [ox, oy, oz] = PART_OFFSET[key];
  const { core, scale } = layout;
  return [core[0] + ox * scale, core[1] + oy * scale, core[2] + oz * scale];
}

/**
 * Where a part docks back to — derived from its own offset, so a dragged part
 * always returns to the port it came from rather than a hard-coded angle that
 * could drift out of sync with the layout above.
 */
function dockAngle(key: PartKey): number {
  const [ox, , oz] = PART_OFFSET[key];
  return Math.atan2(oz, ox);
}

export function BuilderScene({
  onPartMove,
  onPartDock,
  corePosition,
  speaking = false,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion3D();
  const capability = useDeviceCapability();
  const cam = useResponsiveCamera(hostRef);
  const layout = LAYOUT[cam.bucket];
  // The core itself slides toward centre on a narrow frame — an off-centre
  // core plus a narrow horizontal field is exactly how it used to walk off
  // the edge.
  const core: [number, number, number] = [
    layout.core[0] * cam.fit,
    layout.core[1],
    layout.core[2],
  ];
  const fitted = { core, scale: layout.scale };
  // A narrow frame gets the SAME composition, from further back — squeezing
  // the layout instead just piles the parts on top of each other, and a
  // camera operator short on width steps back rather than rearranging the
  // subject. fov is vertical, so pulling z is what buys horizontal room.
  const base: [number, number, number] = [
    cam.position[0],
    cam.position[1],
    cam.position[2] / cam.fit,
  ];
  const corePos = corePosition ?? ([...core] as [number, number, number]);
  // Aim tracks the LAYOUT core, not the live dragged one — the framing
  // shouldn't swing around every time someone picks the knot up.
  const aim: [number, number, number] = [
    core[0] * layout.aimBias,
    core[1] + layout.aimY,
    0,
  ];

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
    <div ref={hostRef} style={{ position: 'absolute', inset: 0 }}>
    <Canvas
      // Remounts the whole scene if the perf tier or the camera's width
      // bucket flips mid-session (a devtools viewport resize, a phone
      // rotation) — camera + gl settings below are read once at Canvas
      // construction, so a fresh key is the simplest way to make either
      // change actually take effect.
      key={`${capability.tier}-${cam.bucket}-${cam.fit.toFixed(2)}`}
      shadows={false}
      dpr={capability.dpr}
      gl={{
        antialias: capability.tier === 'full',
        alpha: false,
        powerPreference: capability.tier === 'full' ? 'high-performance' : 'low-power',
      }}
      camera={{ position: base, fov: cam.fov, near: 0.1, far: 200 }}
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
      {/* The room. Renders behind everything and ignores fog — the fog then
          blends the actual world INTO it, which is what gives distance. */}
      <SceneBackdrop />

      <fog attach="fog" args={['#EFE9DC', 8, 30]} />

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
        initialPosition={[...core] as [number, number, number]}
        reduced={reduced}
        speaking={speaking}
        onMove={(p) => onPartMove?.('model', p)}
      />
      <Memory
        initialPosition={partPos(fitted, 'memory')}
        reduced={reduced}
        corePosition={corePos}
        dockAngle={dockAngle('memory')}
        onMove={(p) => onPartMove?.('memory', p)}
        onDock={(d) => onPartDock?.('memory', d)}
      />
      <Tools
        initialPosition={partPos(fitted, 'tools')}
        reduced={reduced}
        corePosition={corePos}
        dockAngle={dockAngle('tools')}
        onMove={(p) => onPartMove?.('tools', p)}
        onDock={(d) => onPartDock?.('tools', d)}
      />
      <Knowledge
        initialPosition={partPos(fitted, 'knowledge')}
        reduced={reduced}
        corePosition={corePos}
        dockAngle={dockAngle('knowledge')}
        onMove={(p) => onPartMove?.('knowledge', p)}
        onDock={(d) => onPartDock?.('knowledge', d)}
      />
      <Voice
        initialPosition={partPos(fitted, 'voice')}
        reduced={reduced}
        corePosition={corePos}
        dockAngle={dockAngle('voice')}
        onMove={(p) => onPartMove?.('voice', p)}
        onDock={(d) => onPartDock?.('voice', d)}
      />
      {/* Boundaries no longer floats loose — it's the precision ring around
          the intelligence core, rendered inside ModelCore so it follows the
          core wherever it's dragged (canon: ring = the clear outer shell). */}

      <CameraParallax reduced={reduced || !capability.allowParallax} base={base} aim={aim} />
    </Canvas>
    </div>
  );
}
