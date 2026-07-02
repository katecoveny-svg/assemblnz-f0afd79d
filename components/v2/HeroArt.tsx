'use client';

import { useEffect, useState } from 'react';
import { Constellation, ParticulateLandscape } from '@assembl/canvas';
import styles from './v2.module.css';

/**
 * The living-painting hero video (Kate's approved motion clip, ping-pong
 * looped so it never jumps, wordmark band cropped, 3.2MB) plays ONLY on wide
 * screens with motion allowed — phones and prefers-reduced-motion keep the
 * static poster, which also paints first everywhere while the video streams.
 */
function useHeroVideo() {
  const [showVideo, setShowVideo] = useState(false);
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 900px)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setShowVideo(wide.matches && !still.matches);
    update();
    wide.addEventListener('change', update);
    still.addEventListener('change', update);
    return () => {
      wide.removeEventListener('change', update);
      still.removeEventListener('change', update);
    };
  }, []);
  return showVideo;
}

/**
 * The right-half hero art from DIRECTION-LOCKED-2026-07-01: the silvery-gold
 * particulate mountain-and-wave landscape with a gold constellation cluster
 * in the top corner.
 *
 * The BASE layer is the signed-off poster art itself
 * (public/brand/v2/hero-landscape.jpg, cropped from
 * public/brand/direction/hero-poster-mountains-wing.png) so the hero reads
 * poster-grade on every viewport. The generated SVG landscape + constellation
 * ride on top as the motion layer (60s drift, 1.5s pulse) and hold still
 * under prefers-reduced-motion.
 */
export function HeroArt({
  seed,
  constellation = true,
  video = true,
  className,
}: {
  seed?: number;
  constellation?: boolean;
  /** set false to force the static poster even on wide screens */
  video?: boolean;
  className?: string;
}) {
  const showVideo = useHeroVideo() && video;
  return (
    <div
      aria-hidden
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {/* the feather-into-paper mask lives in .heroArtMask and only applies
          ≥900px — on phones the art is its own block and shows full-bleed */}
      <div className={styles.heroArtMask} style={{ position: 'absolute', inset: 0 }}>
        <picture>
          <source media="(max-width: 899px)" srcSet="/brand/v2/hero-landscape-mobile.jpg" />
          <img
            src="/brand/v2/hero-landscape.jpg"
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
          />
        </picture>
        {showVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/brand/v2/hero-landscape.jpg"
            src="/brand/v2/hero-landscape.mp4"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
          />
        ) : null}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
          <ParticulateLandscape seed={seed} />
        </div>
      </div>
      {constellation ? (
        <Constellation
          size={150}
          style={{ position: 'absolute', top: '6%', right: '7%', opacity: 0.9 }}
        />
      ) : null}
    </div>
  );
}

/** Full-bleed backdrop variant — the landscape behind floating cards. */
export function LandscapeBackdrop({ seed, opacity = 1 }: { seed?: number; opacity?: number }) {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}>
      <img
        src="/brand/v2/hero-landscape.jpg"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 65%',
          opacity: 0.55,
        }}
      />
      <ParticulateLandscape seed={seed} />
    </div>
  );
}
