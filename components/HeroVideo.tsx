'use client';

import { useEffect, useState } from 'react';

/**
 * HeroVideo — full-bleed background video for page heroes.
 *
 * Renders an autoplaying, muted, looped, inline-playing background video
 * with a poster image fallback. Children of the page hero render on top
 * (this component intentionally lays itself out at `absolute inset-0 -z-10`
 * inside its parent — the parent must be `relative`).
 *
 * Hard rules honoured:
 * - Always muted. Never autoplays sound (browsers block autoplay-with-sound
 *   anyway, and Kate's brief explicitly forbids it).
 * - `playsInline` so iOS doesn't take the video fullscreen.
 * - `prefers-reduced-motion: reduce` → renders the poster image instead.
 *   Detected client-side via matchMedia. SSR renders the img so the user
 *   never sees the video flash before reduced-motion kicks in.
 * - Mobile gate: the `<source>` element carries `media="(min-width: 768px)"`
 *   so the video file is not downloaded on phones. On <768px the video
 *   element shows the poster; no video bytes hit the wire. This is the
 *   simplest cross-browser way to honour "no >5 MB on mobile".
 * - On video load error, the `onError` handler swaps to the poster image.
 */
export interface HeroVideoProps {
  /** MP4 URL — typically a pub.hyperagent.com asset. */
  src: string;
  /** Static image URL — used for prefers-reduced-motion, mobile, load-error, and as the poster while video buffers. */
  posterSrc: string;
  /** Optional ARIA label for the video element. */
  label?: string;
  /** className passed to the wrapper. Defaults to absolute-fill behind content. */
  className?: string;
  /** Override the default cream-tint overlay (Mārama Whenua paper at 0.45 alpha). */
  overlayClassName?: string;
}

const WRAPPER_DEFAULT = 'pointer-events-none absolute inset-0 -z-10 overflow-hidden';
// Mārama Whenua paper at 0.45 alpha — keeps text legible over busy vessel imagery.
const OVERLAY_DEFAULT =
  'pointer-events-none absolute inset-0 bg-[rgba(250,247,242,0.45)]';

export function HeroVideo({
  src,
  posterSrc,
  label,
  className,
  overlayClassName,
}: HeroVideoProps) {
  // SSR-safe defaults: assume reduced-motion is on so the poster renders
  // initially. The effect below relaxes this on the client when the user
  // has not set reduced-motion. This avoids a flash of video for users who
  // do prefer reduced motion.
  const [allowMotion, setAllowMotion] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setAllowMotion(!mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const wrapperClass = className ?? WRAPPER_DEFAULT;
  const overlayClass = overlayClassName ?? OVERLAY_DEFAULT;

  const showVideo = allowMotion && !videoFailed;

  return (
    <div className={wrapperClass} aria-hidden>
      {showVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={posterSrc}
          aria-label={label}
          onError={() => setVideoFailed(true)}
        >
          {/*
            media query gates the source so the video file is not downloaded
            on phones. On <768px the video element shows the poster image
            instead — no MP4 bytes on mobile.
          */}
          <source src={src} type="video/mp4" media="(min-width: 768px)" />
        </video>
      ) : (
        <img
          src={posterSrc}
          alt={label ?? ''}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
      )}
      <div className={overlayClass} />
    </div>
  );
}
