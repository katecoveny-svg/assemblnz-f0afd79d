'use client';

import { useSyncExternalStore } from 'react';

/**
 * FilmHero — the 16A brand film as an autoplay muted loop at the top of the
 * demo hub. Kate's render of the finished house: timber weatherboards, dark
 * roof, native planting, golden-hour light. Poster = still 04 (house centred,
 * warm dusk). prefers-reduced-motion gets the static poster only.
 */
const FILM = '/brand/toa-architects/16a-hubert-henderson/16a-brand-film-scene-3.mp4';
const POSTER = '/brand/toa-architects/16a-hubert-henderson/16a-hero-still-04.jpg';

const MQ = '(prefers-reduced-motion: reduce)';
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(MQ);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

export function FilmHero() {
  // SSR snapshot: assume motion is fine; the client corrects before paint.
  const reduceMotion = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MQ).matches,
    () => false,
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-[#161516]">
      {reduceMotion ? (
        // eslint-disable-next-line @next/next/no-img-element -- full-bleed film poster; next/image fill adds nothing
        <img
          src={POSTER}
          alt="16A Hubert Henderson Place — the finished unit at dusk: timber weatherboards, dark roof, native planting"
          className="block aspect-video w-full object-cover"
        />
      ) : (
        <video
          className="block aspect-video w-full object-cover"
          src={FILM}
          poster={POSTER}
          autoPlay
          muted
          loop
          playsInline
          aria-label="16A Hubert Henderson Place brand film — the finished unit at golden hour"
        />
      )}
      <span
        className="absolute bottom-3 right-4 rounded-full px-3 py-1 text-[12px] uppercase tracking-[0.18em]"
        style={{ backgroundColor: 'rgba(22,21,22,0.65)', color: '#bfa37a' }}
      >
        16A · brand film · concept
      </span>
    </div>
  );
}
