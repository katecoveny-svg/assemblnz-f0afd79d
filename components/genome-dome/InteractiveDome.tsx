'use client';

import * as React from 'react';
import type { DomeSurface } from './DomeScene';
import styles from './genome-dome.module.css';

/**
 * The liquid dome as Kate's actual renders — the pale-palette study, keyed
 * to transparency, presented exactly like her preview: mouse tilt (±10°
 * parallax), a slow float, and the gold network made clickable with pulsing
 * hotspot dots over the render's own nodes. This is the default experience;
 * the WebGL scene takes over only when the real GLB lands in /brand/genome.
 */

export const HERO_DOME = '/brand/genome/pale-hero-dome.png';
export const TOPDOWN_DOME = '/brand/genome/pale-topdown-dome.png';

export type DomeView = 'hero' | 'topdown';

/** Hotspot positions (percent of the frame) laid over each render's gold
 *  clusters — hero first, top-down second. */
const SPOTS: Record<DomeView, Array<[number, number]>> = {
  hero: [
    [24, 47], [31, 34], [41, 25], [52, 22], [62, 28],
    [71, 36], [77, 46], [67, 55], [45, 40], [71, 68],
  ],
  topdown: [
    [50, 30], [63, 36], [70, 48], [66, 62], [54, 70],
    [40, 66], [32, 54], [35, 41], [48, 48], [58, 55],
  ],
};

export function InteractiveDome({
  surfaces,
  view,
  onSelect,
  onHover,
}: {
  surfaces: DomeSurface[];
  view: DomeView;
  onSelect?: (s: DomeSurface) => void;
  onHover?: (s: DomeSurface | null) => void;
}) {
  const frameRef = React.useRef<HTMLDivElement>(null);

  // ±10° parallax toward the pointer, eased by the CSS transition.
  const onPointerMove = (e: React.PointerEvent) => {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    el.style.transform = `rotateX(${(-ny * 10).toFixed(2)}deg) rotateY(${(nx * 10).toFixed(2)}deg)`;
  };
  const onPointerLeave = () => {
    const el = frameRef.current;
    if (el) el.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  const spots = SPOTS[view];

  return (
    <div
      className={styles.tiltStage}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div ref={frameRef} className={styles.tiltFrame}>
        <div className={styles.floater}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={view === 'hero' ? HERO_DOME : TOPDOWN_DOME}
            alt="The Business Genome — a liquid glass dome holding the whole business"
            className={styles.domeImg}
            draggable={false}
          />
          {surfaces.slice(0, spots.length).map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={styles.nodeSpot}
              style={{ left: `${spots[i][0]}%`, top: `${spots[i][1]}%`, animationDelay: `${(i % 5) * 0.45}s` }}
              aria-label={`${s.name} — open the genome`}
              onClick={() => onSelect?.(s)}
              onMouseEnter={() => onHover?.(s)}
              onMouseLeave={() => onHover?.(null)}
              onFocus={() => onHover?.(s)}
              onBlur={() => onHover?.(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
