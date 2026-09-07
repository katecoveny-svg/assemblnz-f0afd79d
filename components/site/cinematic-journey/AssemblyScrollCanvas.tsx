'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AssemblyScene, type PointerRef, type ProgressRef } from './AssemblyScene';

/**
 * Fixed full-viewport WebGL stage. The HTML story scrolls over it;
 * progress + pointer refs are owned by the page shell.
 */
export function AssemblyScrollCanvas({
  progress,
  pointer,
}: {
  progress: ProgressRef;
  pointer: PointerRef;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      if (!c.getContext('webgl2') && !c.getContext('webgl')) setWebglOk(false);
    } catch {
      setWebglOk(false);
    }
  }, []);

  if (!webglOk) {
    return <div className="cj-canvas cj-canvas-fallback" aria-hidden="true" />;
  }

  return (
    <div className="cj-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0.35, 0.55, 7.2], fov: 34, near: 0.1, far: 60 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        shadows
      >
        <Suspense fallback={null}>
          <AssemblyScene progress={progress} pointer={pointer} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
