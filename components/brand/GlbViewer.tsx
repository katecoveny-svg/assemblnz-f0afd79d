'use client';

import { useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, DetailedHTMLProps, HTMLAttributes } from 'react';

import type { GlbMotionAsset } from '@/lib/brand/motion-assets';

/**
 * GlbViewer — renders a .glb model with Google's <model-viewer> custom
 * element. Loaded dynamically on the client so the ~290kB element script
 * never hits the SSR payload or the initial JS bundle.
 *
 * Honours the same conventions as HeroVideo / SplineScene:
 * - prefers-reduced-motion → static poster (or first frame), no auto-rotate.
 * - Intersection observer → element only mounts when scrolled into view.
 * - On load failure → falls back to the poster image.
 */

const ASPECT_CLASS: Record<GlbMotionAsset['aspect'], string> = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '21/9': 'aspect-[21/9]',
};

// model-viewer is a custom element; add the JSX intrinsic typing.
type ModelViewerJSX = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    src: string;
    poster?: string;
    'auto-rotate'?: boolean | '';
    'camera-controls'?: boolean | '';
    'shadow-intensity'?: string;
    'environment-image'?: string;
    exposure?: string;
    ar?: boolean | '';
    'auto-rotate-delay'?: string;
    'rotation-per-second'?: string;
    'interaction-prompt'?: 'auto' | 'when-focused' | 'none';
    'disable-zoom'?: boolean | '';
    loading?: 'auto' | 'lazy' | 'eager';
    reveal?: 'auto' | 'manual';
    style?: CSSProperties;
  },
  HTMLElement
>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerJSX;
    }
  }
}

export interface GlbViewerProps {
  asset: GlbMotionAsset;
  className?: string;
  forceMotion?: boolean;
}

export function GlbViewer({ asset, className, forceMotion = false }: GlbViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const allowMotion = forceMotion || !prefersReducedMotion;
  const [inView, setInView] = useState(false);
  const [elementReady, setElementReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

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

  useEffect(() => {
    if (!inView || elementReady) return;
    let cancelled = false;
    import('@google/model-viewer')
      .then(() => {
        if (!cancelled) setElementReady(true);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [inView, elementReady]);

  const background = asset.background ?? '#FFF7EC';
  const showViewer = elementReady && !loadFailed;

  return (
    <div
      ref={containerRef}
      className={
        className ??
        `relative w-full overflow-hidden rounded-md ${ASPECT_CLASS[asset.aspect]}`
      }
      style={{ background }}
      aria-label={`${asset.name} — interactive 3D model`}
    >
      {asset.posterSrc && (
        <Image
          src={asset.posterSrc}
          alt={asset.name}
          fill
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover"
          priority={false}
        />
      )}

      {showViewer && (
        <model-viewer
          src={asset.src}
          poster={asset.posterSrc}
          camera-controls=""
          auto-rotate={allowMotion ? '' : undefined}
          rotation-per-second="18deg"
          interaction-prompt="none"
          shadow-intensity="0.6"
          exposure="1"
          loading="lazy"
          reveal="auto"
          style={{
            width: '100%',
            height: '100%',
            background,
            // model-viewer renders block-level by default
            display: 'block',
          }}
        />
      )}
    </div>
  );
}
