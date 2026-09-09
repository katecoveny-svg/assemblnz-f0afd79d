'use client';

import { useEffect, useRef, useState } from 'react';
import type { CinematicMediaSlotDef } from './media';

type Props = {
  slot: CinematicMediaSlotDef;
  className?: string;
  /** When true, video autoplays muted loop (if videoReady / file resolves). */
  autoPlay?: boolean;
  /** Optional scroll-tied opacity 0–1 from parent. */
  opacity?: number;
  /** Decorative atmosphere vs inline story beat. */
  mode?: 'atmosphere' | 'inline';
};

/**
 * Higgsfield drop-in frame: prefers muted looping `<video>` + poster when ready;
 * otherwise shows the Kate-approved still.
 */
export function CinematicMediaSlot({
  slot,
  className,
  autoPlay = true,
  opacity = 1,
  mode = 'inline',
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOk, setVideoOk] = useState(slot.videoReady);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!slot.videoReady || reduced) {
      setVideoOk(false);
      return;
    }
    let cancelled = false;
    fetch(slot.videoSrc, { method: 'HEAD' })
      .then((res) => {
        if (!cancelled) setVideoOk(res.ok);
      })
      .catch(() => {
        if (!cancelled) setVideoOk(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slot.videoReady, slot.videoSrc, reduced]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoOk || reduced) return;
    if (autoPlay) {
      v.play().catch(() => {
        /* autoplay may be blocked — poster remains via poster attr */
      });
    }
  }, [videoOk, autoPlay, reduced]);

  return (
    <figure
      className={['cj-media', mode === 'atmosphere' ? 'cj-media-atmosphere' : 'cj-media-inline', className]
        .filter(Boolean)
        .join(' ')}
      style={{ opacity }}
      data-slot={slot.id}
      data-job={slot.jobId ?? ''}
      data-video-ready={videoOk ? 'true' : 'false'}
    >
      {videoOk ? (
        <video
          ref={videoRef}
          className="cj-media-video"
          src={slot.videoSrc}
          poster={slot.posterSrc}
          muted
          loop
          playsInline
          autoPlay={autoPlay}
          preload="metadata"
          aria-label={slot.label}
          onError={() => setVideoOk(false)}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- vendored public/ stills for PREVIEW drop-in
        <img
          className="cj-media-poster"
          src={slot.posterSrc}
          alt=""
          width={1344}
          height={752}
          decoding="async"
          fetchPriority={slot.id === 'hero' ? 'high' : 'auto'}
        />
      )}
      <span className="cj-media-sr" aria-hidden="true">
        {slot.label}
      </span>
    </figure>
  );
}
