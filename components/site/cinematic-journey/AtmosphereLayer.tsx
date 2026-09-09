'use client';

import { useEffect, useState } from 'react';
import { CinematicMediaSlot } from './CinematicMediaSlot';
import { CINEMATIC_MEDIA } from './media';
import type { ProgressRef } from './types';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function rangeOpacity(p: number, start: number, end: number) {
  const mid = (start + end) / 2;
  const half = (end - start) / 2 || 0.01;
  return clamp01(1 - Math.abs(p - mid) / half);
}

/**
 * Fixed, scroll-tied Higgsfield atmosphere — hero video/still early,
 * mid still (Kate-approved B) as the journey docks. Sits under the veil;
 * R3F canvas remains primary depth.
 */
export function AtmosphereLayer({ progress }: { progress: ProgressRef }) {
  const [heroOp, setHeroOp] = useState(1);
  const [midOp, setMidOp] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyMq = () => setReduce(mq.matches);
    applyMq();
    mq.addEventListener('change', applyMq);

    let raf = 0;
    const tick = () => {
      const p = progress.current;
      if (mq.matches) {
        setHeroOp(0.55);
        setMidOp(0.35);
      } else {
        setHeroOp(0.18 + rangeOpacity(p, 0, 0.34) * 0.72);
        setMidOp(rangeOpacity(p, 0.28, 0.88) * 0.78);
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      mq.removeEventListener('change', applyMq);
    };
  }, [progress]);

  return (
    <div className="cj-atmosphere" aria-hidden="true" data-reduced={reduce ? 'true' : 'false'}>
      <CinematicMediaSlot
        slot={CINEMATIC_MEDIA.hero}
        mode="atmosphere"
        className="cj-atmosphere-hero"
        opacity={heroOp}
        autoPlay
      />
      <CinematicMediaSlot
        slot={CINEMATIC_MEDIA.mid}
        mode="atmosphere"
        className="cj-atmosphere-mid"
        opacity={midOp}
        autoPlay={false}
      />
    </div>
  );
}
