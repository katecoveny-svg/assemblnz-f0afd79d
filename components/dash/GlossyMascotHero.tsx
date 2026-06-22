'use client';

/**
 * GlossyMascotHero — the birdie-style hero: the glossy 3D dachshund render
 * (public/dash/dash-mascot-hero.png) floating inside a soft rounded panel,
 * with pointer-parallax tilt and playful floating reward chips.
 *
 * Reduced-motion: holds a static, level pose with no float/parallax.
 * See docs/dash-components-brief.md (GlossyMascotHero).
 */
import { useEffect, useRef } from 'react';

export function GlossyMascotHero() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene) return;

    let raf = 0;
    function onMove(e: PointerEvent) {
      const r = stage!.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        scene!.style.transform = `perspective(1100px) rotateY(${x * 14}deg) rotateX(${-y * 12}deg)`;
      });
    }
    function reset() {
      scene!.style.transform = 'perspective(1100px) rotateY(0deg) rotateX(0deg)';
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
      <div className="mascotPanel">
        <span className="mascotGlow" aria-hidden />
        <div ref={sceneRef} className="mascotScene">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="mascotImg"
            src="/dash/dash-mascot-hero.png"
            alt="Dash — a glossy black dachshund whose long body glows with a golden loading bar"
          />
        </div>

        {/* floating reward chips — the imagination */}
        <span className="mascotChip mascotChip--a">+$0.04 → KiwiSaver</span>
        <span className="mascotChip mascotChip--b">✈ Airpoints</span>
        <span className="mascotChip mascotChip--c">♥ to charity</span>
      </div>
    </div>
  );
}
