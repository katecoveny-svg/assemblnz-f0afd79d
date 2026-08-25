'use client';

import * as React from 'react';
import type { QualityProfile } from '@/lib/motion/capability';
import { defaultSceneConfig, type SceneConfig } from '@/lib/motion/scene-config';
import { useVisualState, type AssemblVisualState, type TargetForm } from '@/lib/motion/visual-state';

/**
 * Development-only scene tuner (Phase 3 seed). Rendered only when
 * NODE_ENV === 'development' AND the page carries ?motion-dev=1 — the
 * gate lives in MotionCanvas so production bundles drop this file.
 * Tune, then "copy scene JSON" to persist values into scene-config.ts.
 */

const STATES: AssemblVisualState[] = [
  'dormant', 'gathering', 'formed', 'listening', 'thinking', 'acting', 'complete', 'dispersing',
];
const FORMS: TargetForm[] = ['wing', 'network', 'agents'];

const SLIDERS: Array<{
  key: keyof Pick<
    SceneConfig,
    'density' | 'pointSize' | 'formScale' | 'assemblySeconds' | 'interactionStrength'
  >;
  label: string;
  min: number;
  max: number;
  step: number;
}> = [
  { key: 'density', label: 'particle density', min: 0.2, max: 2, step: 0.05 },
  { key: 'pointSize', label: 'point size', min: 0.4, max: 2.2, step: 0.05 },
  { key: 'formScale', label: 'form scale', min: 0.5, max: 1.6, step: 0.05 },
  { key: 'assemblySeconds', label: 'assembly seconds', min: 0.8, max: 6, step: 0.1 },
  { key: 'interactionStrength', label: 'interaction strength', min: 0, max: 1, step: 0.05 },
];

export function MotionDevPanel({
  config,
  overrides,
  onOverrides,
  profile,
}: {
  config: SceneConfig;
  overrides: Partial<SceneConfig>;
  onOverrides: (next: Partial<SceneConfig>) => void;
  profile: QualityProfile | null;
}) {
  const [open, setOpen] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const state = useVisualState((s) => s.state);
  const form = useVisualState((s) => s.form);
  const setVisualState = useVisualState((s) => s.setVisualState);
  const setForm = useVisualState((s) => s.setForm);
  const setCoherence = useVisualState((s) => s.setCoherence);

  const copyJson = () => {
    const scene = {
      config,
      quality: profile,
      state,
      form,
    };
    void navigator.clipboard?.writeText(JSON.stringify(scene, null, 2)).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: 10,
        bottom: 10,
        zIndex: 500,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid #ddd',
        borderRadius: 10,
        padding: open ? 12 : 6,
        maxWidth: 260,
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ cursor: 'pointer', border: 'none', background: 'none', fontWeight: 700 }}
      >
        motion tuner {open ? '—' : '+'}
      </button>
      {open ? (
        <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
          {SLIDERS.map((s) => (
            <label key={s.key} style={{ display: 'grid', gap: 2 }}>
              <span>
                {s.label}: {config[s.key]}
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={config[s.key]}
                onChange={(e) => onOverrides({ ...overrides, [s.key]: Number(e.target.value) })}
              />
            </label>
          ))}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {FORMS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setForm(f)}
                style={{ cursor: 'pointer', fontWeight: form === f ? 700 : 400 }}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {STATES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setVisualState(s)}
                style={{ cursor: 'pointer', fontWeight: state === s ? 700 : 400 }}
              >
                {s}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setCoherence(0.4)} style={{ cursor: 'pointer' }}>
            simulate coherence dip
          </button>
          <button
            type="button"
            onClick={() => onOverrides({})}
            style={{ cursor: 'pointer' }}
          >
            reset overrides
          </button>
          <button type="button" onClick={copyJson} style={{ cursor: 'pointer', fontWeight: 700 }}>
            {copied ? 'copied' : 'copy scene JSON'}
          </button>
          <span style={{ color: '#999' }}>
            tier: {profile?.tier ?? 'n/a'} · defaults in lib/motion/scene-config.ts
            {JSON.stringify(defaultSceneConfig) === JSON.stringify(config) ? ' (stock)' : ''}
          </span>
        </div>
      ) : null}
    </div>
  );
}
