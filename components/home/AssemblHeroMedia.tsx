'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * AssemblHeroMedia — the landing-page hero video band, adapted from the
 * microvisuals boomerang-hero reference with its dark art direction and
 * per-frame canvas capture REPLACED per the assembl design brief:
 *
 * - The source asset must be a pre-rendered SEAMLESS forward+reverse loop
 *   (encode the boomerang at render time — ffmpeg:
 *   `ffmpeg -i fwd.mp4 -filter_complex "[0:v]reverse[r];[0:v][r]concat" out.mp4`).
 *   No frame-grab canvases — the reference's per-frame capture holds
 *   hundreds of full-size canvases in memory and would sink mobile.
 * - prefers-reduced-motion → high-quality still (reducedMotionSrc).
 * - Pauses when the tab is hidden or the band scrolls out of view.
 * - Poster shows while loading; graceful null on error (callers provide
 *   a fallback — the R3F assembly scene today).
 *
 * SELF-ACTIVATING: on mount the component HEADs videoSrc. Until the
 * rendered animation exists in public/assets/, it reports "missing" and
 * the caller's fallback renders instead — so this can ship ahead of the
 * creative asset with zero visible change.
 */

export interface AssemblHeroMediaProps {
  videoSrc: string;
  posterSrc?: string;
  reducedMotionSrc?: string;
  /** Rendered while the asset is missing or on unrecoverable error. */
  fallback?: React.ReactNode;
  /** Text alternative for screen readers describing the animation. */
  alt?: string;
}

type MediaState = 'checking' | 'ready' | 'missing' | 'error';

export function AssemblHeroMedia({ videoSrc, posterSrc, reducedMotionSrc, fallback = null, alt }: AssemblHeroMediaProps) {
  const [state, setState] = useState<MediaState>('checking');
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const bandRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Asset presence check — the self-activation switch.
  useEffect(() => {
    let alive = true;
    fetch(videoSrc, { method: 'HEAD' })
      .then((r) => { if (alive) setState(r.ok ? 'ready' : 'missing'); })
      .catch(() => { if (alive) setState('missing'); });
    return () => { alive = false; };
  }, [videoSrc]);

  // Pause offscreen + on hidden tab; resume when visible again.
  useEffect(() => {
    if (state !== 'ready' || reducedMotion) return;
    const video = videoRef.current;
    const band = bandRef.current;
    if (!video || !band) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && document.visibilityState === 'visible') void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.1 },
    );
    io.observe(band);
    const onVis = () => {
      if (document.visibilityState === 'hidden') video.pause();
      else void video.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [state, reducedMotion]);

  if (state === 'checking' || state === 'missing' || state === 'error') {
    return <>{fallback}</>;
  }

  // Reduced motion: still frame, no video element at all.
  if (reducedMotion) {
    const still = reducedMotionSrc ?? posterSrc;
    if (!still) return <>{fallback}</>;
    return (
      <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden md:h-[50vh] md:max-h-[520px]" style={{ background: '#FBFAF6' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={still} alt={alt ?? ''} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      ref={bandRef}
      className="relative h-[42vh] min-h-[300px] w-full overflow-hidden md:h-[50vh] md:max-h-[520px]"
      style={{ background: '#FBFAF6' }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label={alt}
        onError={() => setState('error')}
        className="h-full w-full object-cover"
      />
      {/* Fade into the page ground so the band never hard-stops. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
        style={{ background: 'linear-gradient(180deg, rgba(251,250,246,0) 0%, #fbfaf6 100%)' }}
      />
    </div>
  );
}
