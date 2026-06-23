'use client';

import { useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import type { SplineMotionAsset } from '@/lib/brand/motion-assets';

/**
 * Lazy-loaded, accessible wrapper around @splinetool/react-spline.
 *
 * - Client-only — the runtime + scene file are downloaded on demand.
 * - prefers-reduced-motion → renders the poster, never mounts the runtime.
 * - Intersection observer → the scene only mounts when scrolled into view,
 *   so a gallery of N scenes does not download N runtimes on page load.
 * - Placeholder scenes (no real prod URL yet) render the poster + a note
 *   instead of attempting to load.
 */

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => null,
});

const ASPECT_CLASS: Record<SplineMotionAsset['aspect'], string> = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '21/9': 'aspect-[21/9]',
};

export interface SplineSceneProps {
  asset: SplineMotionAsset;
  className?: string;
  forceMotion?: boolean;
}

export function SplineScene({ asset, className, forceMotion = false }: SplineSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const allowMotion = forceMotion || !prefersReducedMotion;
  const [inView, setInView] = useState(false);
  const [runtimeFailed, setRuntimeFailed] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const showRuntime = allowMotion && inView && !runtimeFailed && !asset.placeholder;

  return (
    <div
      ref={containerRef}
      className={
        className ??
        `relative w-full overflow-hidden rounded-md bg-[#F4EFE7] ${ASPECT_CLASS[asset.aspect]}`
      }
      aria-label={`${asset.name} — interactive 3D scene`}
    >
      {asset.posterSrc ? (
        <Image
          src={asset.posterSrc}
          alt={asset.name}
          fill
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover"
          priority={false}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-center font-mono text-eyebrow uppercase text-[color:var(--text-secondary,#5C6273)]">
          {asset.placeholder ? 'Scene preview — awaiting export' : 'Loading 3D scene…'}
        </div>
      )}

      {showRuntime && (
        <div className="absolute inset-0">
          <Spline
            scene={asset.sceneUrl}
            onError={() => setRuntimeFailed(true)}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}

      {asset.placeholder && (
        <div className="absolute bottom-3 left-3 right-3 rounded-sm bg-[rgba(35,33,31,0.78)] px-3 py-2 font-mono text-eyebrow uppercase text-[#FFF7EC]">
          Awaiting prod.spline.design export — see lib/brand/motion-assets.ts
        </div>
      )}
    </div>
  );
}
