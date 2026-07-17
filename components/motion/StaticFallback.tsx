'use client';

import * as React from 'react';
import { getParticleBuffers, getTargets, rolesFor } from '@/lib/motion/targets';

/**
 * Static HTML/CSS fallback when WebGL context creation fails: the completed
 * wing rendered once as an inline SVG from the SAME cached, seeded target
 * data the shader uses — so the fallback is recognisably the sculpture, not
 * a stand-in illustration. Purely decorative; no motion, no script.
 */

const FALLBACK_COUNT = 1300;
const PARTICLE_COLOR = '#79878e';

function buildDots() {
  const targets = getTargets('wing', FALLBACK_COUNT, 1);
  const { styles } = getParticleBuffers(FALLBACK_COUNT);
  const roles = rolesFor(FALLBACK_COUNT);
  // Structural + supporting points only — the atmospheric halo would read
  // as noise at this scale, and the still image must stay a clear wing.
  const drawn = roles.structural + roles.supporting;
  const dots: Array<{ cx: number; cy: number; r: number; o: number }> = [];
  for (let i = 0; i < drawn; i++) {
    const x = targets[i * 3];
    const y = targets[i * 3 + 1];
    // world → viewBox (x −3.8…3.8, y −2.4…2.4 → 760 × 480)
    dots.push({
      cx: (x + 3.8) * 100,
      cy: (2.4 - y) * 100,
      r: 0.7 + styles[i * 2] * 0.5,
      o: Math.min(1, styles[i * 2 + 1] + 0.08),
    });
  }
  return dots;
}

let cachedDots: ReturnType<typeof buildDots> | null = null;

export function StaticFallback() {
  const dots = (cachedDots ??= buildDots());
  return (
    <svg
      viewBox="0 0 760 480"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={PARTICLE_COLOR} fillOpacity={d.o * 0.9} />
      ))}
    </svg>
  );
}
