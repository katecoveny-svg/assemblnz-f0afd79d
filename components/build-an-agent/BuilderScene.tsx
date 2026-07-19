'use client';

import { Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import * as THREE from 'three';

import { useReducedMotion3D } from './hooks/useReducedMotion3D';
import { Guardrails } from './parts/Guardrails';
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
}

export function BuilderScene({ onPartMove }: Props) {
  const reduced = useReducedMotion3D();

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
      shadows={false}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 1.8, 5.4], fov: 42, near: 0.1, far: 200 }}
      resize={{ debounce: 0, offsetSize: true, scroll: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.setClearColor('#FBFAF6', 1);
      }}
      style={{ touchAction: 'none', width: '100%', height: '100%', display: 'block' }}
    >
      {/* HDRI comes in when it's ready — the rest of the scene renders now,
          not held hostage by the CDN request. */}
      <Suspense fallback={null}>
        <Environment preset="studio" background={false} environmentIntensity={0.9} />
      </Suspense>

      <hemisphereLight args={['#FFFFFF', '#E8E4D8', 0.7]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 8, 4]} intensity={1.1} color="#FFF7E4" />
      <directionalLight position={[-5, 3, -2]} intensity={0.45} color="#E8F1FF" />

      <Ground />
      <HorizonWaves reduced={reduced} />
      <Kohatu reduced={reduced} />

      <ModelCore
        initialPosition={[0, 0.6, 0]}
        reduced={reduced}
        onMove={(p) => onPartMove?.('model', p)}
      />
      <Memory
        initialPosition={[-2.4, 0.55, -0.4]}
        reduced={reduced}
        onMove={(p) => onPartMove?.('memory', p)}
      />
      <Tools
        initialPosition={[2.4, 0.5, -0.4]}
        reduced={reduced}
        onMove={(p) => onPartMove?.('tools', p)}
      />
      <Knowledge
        initialPosition={[-1.4, 0.55, 1.6]}
        reduced={reduced}
        onMove={(p) => onPartMove?.('knowledge', p)}
      />
      <Voice
        initialPosition={[1.4, 0.55, 1.6]}
        reduced={reduced}
        onMove={(p) => onPartMove?.('voice', p)}
      />
      <Guardrails
        initialPosition={[0, 0.5, 2.2]}
        reduced={reduced}
        onMove={(p) => onPartMove?.('guardrails', p)}
      />

      <CameraParallax reduced={reduced} />
    </Canvas>
  );
}
