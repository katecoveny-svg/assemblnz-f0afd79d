'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AssemblyScene } from './AssemblyScene';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import type { PointerRef, ProgressRef } from './types';

/**
 * Fixed full-viewport WebGL stage. The HTML story scrolls over it;
 * progress + pointer refs are owned by the page shell.
 *
 * Hardened for preview: ErrorBoundary + no CDN Environment so a WebGL or
 * HDR failure cannot surface as a whole-page Vercel Application error.
 *
 * pointer-events:none on the wrapper (and canvas) is load-bearing — live
 * chat inputs in the HTML story must receive clicks; the field is visual only.
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted || !webglOk) {
    return <div className="cj-canvas cj-canvas-fallback" aria-hidden="true" />;
  }

  return (
    <CanvasErrorBoundary>
      <div className="cj-canvas" aria-hidden="true" style={{ pointerEvents: 'none' }}>
        <Canvas
          camera={{ position: [0.35, 0.55, 7.2], fov: 34, near: 0.1, far: 60 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          shadows
          style={{ pointerEvents: 'none' }}
          onCreated={({ gl }) => {
            gl.domElement.style.pointerEvents = 'none';
            gl.domElement.addEventListener('webglcontextlost', (e: Event) => {
              e.preventDefault();
            });
          }}
        >
          <Suspense fallback={null}>
            <AssemblyScene progress={progress} pointer={pointer} reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}
