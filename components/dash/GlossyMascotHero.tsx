'use client';

/**
 * GlossyMascotHero — the birdie-style hero: the new 3D/4D glossy white + canary
 * dachshund (a looping, muted video) inside a soft rounded panel, with a subtle
 * pointer-parallax tilt and playful floating reward chips.
 *
 * Reduced-motion: the video is paused (shows the poster frame) and the tilt is
 * disabled. See docs/dash-components-brief.md (GlossyMascotHero).
 */
import { useEffect, useRef } from 'react';

export function GlossyMascotHero() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reduced motion: hold the poster frame, no autoplay, no tilt.
    if (reduce) {
      const v = videoRef.current;
      if (v) {
        v.autoplay = false;
        v.pause();
        v.removeAttribute('autoplay');
      }
      return;
    }

    const stage = stageRef.current;
    const panel = panelRef.current;
    if (!stage || !panel) return;

    let raf = 0;
    function onMove(e: PointerEvent) {
      const r = stage!.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        panel!.style.transform = `perspective(1100px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
      });
    }
    function reset() {
      panel!.style.transform = 'perspective(1100px) rotateY(0deg) rotateX(0deg)';
    }
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', reset);
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', reset);
    };
  }, []);

  return (
    <div ref={stageRef} className="mascotStage">
      <div ref={panelRef} className="mascotPanel">
        <video
          ref={videoRef}
          className="mascotVid"
          autoPlay
          loop
          muted
          playsInline
          poster="/dash/dash-mascot-poster.jpg"
          aria-label="Assembling — a glossy white and canary-yellow dachshund mascot, slowly turning"
        >
          <source src="/dash/dash-mascot.webm" type="video/webm" />
          <source src="/dash/dash-mascot.mp4" type="video/mp4" />
        </video>
      </div>

      {/* floating reward chips — the imagination */}
      <span className="mascotChip mascotChip--a">+$0.04 → KiwiSaver</span>
      <span className="mascotChip mascotChip--b">✈ Airpoints</span>
      <span className="mascotChip mascotChip--c">♥ to charity</span>
    </div>
  );
}
