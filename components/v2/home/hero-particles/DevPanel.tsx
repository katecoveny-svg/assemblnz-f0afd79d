'use client';

import * as React from 'react';
import { FORMATIONS, type FormationName, type HeroParticleSettings } from './config';

/**
 * Development-only tuning panel for the hero sculpture. Never rendered in
 * production (KineticHero gates on NODE_ENV). Tune here, then persist the
 * final values into config.ts.
 */

const SLIDERS: Array<{
  key: keyof HeroParticleSettings;
  label: string;
  min: number;
  max: number;
  step: number;
}> = [
  { key: 'particleCount', label: 'particles', min: 400, max: 12000, step: 100 },
  { key: 'pointSize', label: 'point size', min: 0.5, max: 3, step: 0.05 },
  { key: 'formationWidth', label: 'width', min: 2, max: 9, step: 0.1 },
  { key: 'formationHeight', label: 'height', min: 1, max: 6, step: 0.1 },
  { key: 'depthSpread', label: 'depth', min: 0.2, max: 4, step: 0.1 },
  { key: 'atmosphericSpread', label: 'atmo spread', min: 1, max: 8, step: 0.1 },
  { key: 'cameraZ', label: 'camera z', min: 5, max: 16, step: 0.5 },
  { key: 'fov', label: 'fov', min: 24, max: 48, step: 1 },
];

export function DevPanel({
  cfg,
  overrides,
  onOverrides,
  formation,
  onFormation,
  progress,
  onProgress,
}: {
  cfg: HeroParticleSettings;
  overrides: Partial<HeroParticleSettings>;
  onOverrides: (o: Partial<HeroParticleSettings>) => void;
  formation: FormationName | null;
  onFormation: (f: FormationName | null) => void;
  progress: number;
  onProgress: (p: number) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      style={{
        position: 'fixed',
        right: 10,
        bottom: 10,
        zIndex: 500,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        background: 'rgba(255,255,255,0.94)',
        border: '1px solid #ddd',
        borderRadius: 10,
        padding: open ? 12 : 6,
        maxWidth: 240,
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      }}
    >
      <button type="button" onClick={() => setOpen(!open)} style={{ cursor: 'pointer', border: 'none', background: 'none', fontWeight: 700 }}>
        ◇ hero tuner {open ? '—' : '+'}
      </button>
      {open ? (
        <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
          {SLIDERS.map((s) => (
            <label key={s.key} style={{ display: 'grid', gap: 2 }}>
              <span>
                {s.label}: {cfg[s.key]}
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={cfg[s.key]}
                onChange={(e) => onOverrides({ ...overrides, [s.key]: Number(e.target.value) })}
              />
            </label>
          ))}
          <label style={{ display: 'grid', gap: 2 }}>
            <span>progress: {Number.isNaN(progress) ? 'auto' : progress.toFixed(2)}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={Number.isNaN(progress) ? 1 : progress}
              onChange={(e) => onProgress(Number(e.target.value))}
            />
            <button type="button" onClick={() => onProgress(NaN)} style={{ cursor: 'pointer' }}>
              release scrub
            </button>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <button type="button" onClick={() => onFormation(null)} style={{ cursor: 'pointer', fontWeight: formation === null ? 700 : 400 }}>
              cycle
            </button>
            {FORMATIONS.map((f) => (
              <button key={f} type="button" onClick={() => onFormation(f)} style={{ cursor: 'pointer', fontWeight: formation === f ? 700 : 400 }}>
                {f}
              </button>
            ))}
          </div>
          <span style={{ color: '#999' }}>bloom: off (by design)</span>
        </div>
      ) : null}
    </div>
  );
}
