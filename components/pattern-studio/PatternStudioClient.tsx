'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AssemblPatternStudio,
  ASSEMBL_PRESETS,
  type DotShape,
  type MouseMode,
  type ParticleShape,
  type PatternEffect,
  type PatternMode,
  type PatternSettings,
} from './AssemblPatternStudio';
import styles from './pattern-studio-page.module.css';

const MODES: Array<[PatternMode, string]> = [
  ['halftone', 'Halftone'],
  ['dither', 'Dither'],
  ['ascii', 'ASCII'],
  ['particles', 'Particles'],
  ['particleText', 'Particle text'],
];

const DOT_SHAPES: DotShape[] = ['circle', 'square', 'diamond', 'triangle'];
const PARTICLE_SHAPES: ParticleShape[] = ['circle', 'square', 'diamond', 'spark'];
const EFFECTS: PatternEffect[] = ['wave', 'pulse', 'ripple', 'spiral', 'noise', 'off'];
const MOUSE_MODES: MouseMode[] = ['repel', 'attract', 'connect'];

const INITIAL: PatternSettings = {
  mode: 'halftone',
  density: 35,
  size: 35,
  intensity: 65,
  speed: 1.2,
  dotShape: 'circle',
  animationEffect: 'wave',
  morphing: false,
  mouseInteractive: true,
  count: 150,
  particleShape: 'circle',
  connectLines: true,
  connectDistance: 120,
  mouseMode: 'repel',
  gravity: 0,
  glow: true,
  turbulence: 30,
  words: ['assembl', 'proof'],
  holdSeconds: 2.2,
  backgroundColor: '#ffffff',
  foregroundColor: '#3f7373',
  accentColor: '#b8964f',
  isAnimated: true,
};

const isGrid = (m: PatternMode) => m === 'halftone' || m === 'dither' || m === 'ascii';

export function PatternStudioClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const studioRef = useRef<AssemblPatternStudio | null>(null);
  const [s, setS] = useState<PatternSettings>(INITIAL);
  const [codeTab, setCodeTab] = useState<'react' | 'vanilla'>('react');
  const [status, setStatus] = useState('');

  // Construct the engine once; drive it via updateSettings after.
  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const studio = new AssemblPatternStudio(canvasRef.current, { ...INITIAL, isAnimated: !reduced });
    studioRef.current = studio;
    if (reduced) queueMicrotask(() => setS((prev) => ({ ...prev, isAnimated: false })));
    return () => {
      studio.destroy();
      studioRef.current = null;
    };
  }, []);

  useEffect(() => {
    studioRef.current?.updateSettings(s);
  }, [s]);

  const set = <K extends keyof PatternSettings>(key: K, value: PatternSettings[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));

  // Words need far more particles than a loose constellation to read — bump the
  // count when entering particleText if it's still low (mirrors the demo).
  const setMode = (m: PatternMode) =>
    setS((prev) => ({
      ...prev,
      mode: m,
      count: m === 'particleText' && prev.count < 900 ? 1200 : prev.count,
    }));

  const applyPreset = (name: string) => {
    const p = ASSEMBL_PRESETS[name];
    if (!p) return;
    setS((prev) => ({ ...prev, backgroundColor: p.backgroundColor, foregroundColor: p.foregroundColor }));
    setStatus(`Applied ${name}.`);
  };

  const downloadPNG = () => {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = `assembl-pattern-${s.mode}.png`;
    a.click();
    setStatus('Saved PNG frame.');
  };

  const downloadCode = () => {
    let code: string;
    let filename: string;
    if (codeTab === 'react') {
      code = [
        "import AssemblPatternStudioComponent from '@/components/pattern-studio/AssemblPatternStudioComponent';",
        '',
        'export function Generator() {',
        '  return (',
        "    <div style={{ position: 'relative', width: '100%', height: '60vh' }}>",
        '      <AssemblPatternStudioComponent',
        ...Object.entries(s).map(([k, v]) => `        ${k}={${JSON.stringify(v)}}`),
        '      />',
        '    </div>',
        '  );',
        '}',
      ].join('\n');
      filename = 'Generator.tsx';
    } else {
      code = [
        '<canvas id="assembl-pattern" style="width:100%;height:100%;"></canvas>',
        '<script src="AssemblPatternStudio.js"></scr' + 'ipt>',
        '<script>',
        `  new AssemblPatternStudio('assembl-pattern', ${JSON.stringify(s, null, 2)});`,
        '</scr' + 'ipt>',
      ].join('\n');
      filename = 'assembl-pattern-usage.html';
    }
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setStatus(`Downloaded ${filename}.`);
  };

  return (
    <div className={styles.studio}>
      <aside className={styles.panel}>
        <div className={styles.modes}>
          {MODES.map(([m, label]) => (
            <button
              key={m}
              type="button"
              className={s.mode === m ? styles.modeActive : styles.mode}
              onClick={() => setMode(m)}
            >
              {label}
            </button>
          ))}
        </div>

        {isGrid(s.mode) ? (
          <section className={styles.group}>
            <h3>Pattern</h3>
            <Slider label="Density" value={s.density} min={5} max={100} onChange={(v) => set('density', v)} />
            <Slider label="Dot / char size" value={s.size} min={5} max={100} onChange={(v) => set('size', v)} />
            <Slider label="Intensity" value={s.intensity} min={0} max={100} onChange={(v) => set('intensity', v)} />
            {s.mode !== 'ascii' && s.mode !== 'dither' ? (
              <Select
                label="Shape"
                value={s.dotShape}
                options={DOT_SHAPES}
                onChange={(v) => set('dotShape', v as DotShape)}
              />
            ) : null}
            <Select
              label="Effect"
              value={s.animationEffect}
              options={EFFECTS}
              onChange={(v) => set('animationEffect', v as PatternEffect)}
            />
            {s.mode === 'halftone' ? (
              <Toggle label="Morphing shapes" checked={s.morphing} onChange={(v) => set('morphing', v)} />
            ) : null}
          </section>
        ) : null}

        {s.mode === 'particles' ? (
          <section className={styles.group}>
            <h3>Particles</h3>
            <Slider label="Count" value={s.count} min={20} max={2000} step={10} onChange={(v) => set('count', v)} />
            <Select
              label="Shape"
              value={s.particleShape}
              options={PARTICLE_SHAPES}
              onChange={(v) => set('particleShape', v as ParticleShape)}
            />
            <Slider label="Turbulence" value={s.turbulence} min={0} max={100} step={5} onChange={(v) => set('turbulence', v)} />
            <Slider label="Gravity" value={s.gravity} min={-40} max={40} onChange={(v) => set('gravity', v)} />
            <Toggle label="Connecting lines" checked={s.connectLines} onChange={(v) => set('connectLines', v)} />
            <Toggle label="Glow" checked={s.glow} onChange={(v) => set('glow', v)} />
            <Select
              label="Mouse"
              value={s.mouseMode}
              options={MOUSE_MODES}
              onChange={(v) => set('mouseMode', v as MouseMode)}
            />
          </section>
        ) : null}

        {s.mode === 'particleText' ? (
          <section className={styles.group}>
            <h3>Particle text</h3>
            <label className={styles.field}>
              <span>Words (comma-separated)</span>
              <input
                type="text"
                value={s.words.join(', ')}
                onChange={(e) =>
                  set(
                    'words',
                    e.target.value
                      .split(',')
                      .map((w) => w.trim())
                      .filter(Boolean),
                  )
                }
              />
            </label>
            <Slider label="Count" value={s.count} min={200} max={2500} step={50} onChange={(v) => set('count', v)} />
            <Slider label="Turbulence" value={s.turbulence} min={0} max={100} step={5} onChange={(v) => set('turbulence', v)} />
            <Slider label="Hold (s)" value={s.holdSeconds} min={0.5} max={6} step={0.1} onChange={(v) => set('holdSeconds', v)} />
            <Select
              label="Shape"
              value={s.particleShape}
              options={PARTICLE_SHAPES}
              onChange={(v) => set('particleShape', v as ParticleShape)}
            />
            <Toggle label="Glow" checked={s.glow} onChange={(v) => set('glow', v)} />
          </section>
        ) : null}

        <section className={styles.group}>
          <h3>Speed &amp; motion</h3>
          <Slider label="Speed" value={s.speed} min={0.1} max={3} step={0.1} onChange={(v) => set('speed', v)} />
          <Toggle label="Animated" checked={s.isAnimated} onChange={(v) => set('isAnimated', v)} />
          <Toggle label="Mouse-interactive" checked={s.mouseInteractive} onChange={(v) => set('mouseInteractive', v)} />
        </section>

        <section className={styles.group}>
          <h3>Colours</h3>
          <div className={styles.presets}>
            {Object.keys(ASSEMBL_PRESETS).map((name) => (
              <button key={name} type="button" className={styles.preset} onClick={() => applyPreset(name)}>
                {name}
              </button>
            ))}
          </div>
          <div className={styles.swatches}>
            <label>
              <span>Background</span>
              <input type="color" value={s.backgroundColor} onChange={(e) => set('backgroundColor', e.target.value)} />
            </label>
            <label>
              <span>Marks</span>
              <input type="color" value={s.foregroundColor} onChange={(e) => set('foregroundColor', e.target.value)} />
            </label>
            <label>
              <span>Accent</span>
              <input type="color" value={s.accentColor} onChange={(e) => set('accentColor', e.target.value)} />
            </label>
          </div>
        </section>

        <section className={styles.group}>
          <h3>Export</h3>
          <button type="button" className={styles.action} onClick={downloadPNG}>
            Export PNG frame
          </button>
          <div className={styles.codeTabs}>
            <button
              type="button"
              className={codeTab === 'react' ? styles.codeTabActive : styles.codeTab}
              onClick={() => setCodeTab('react')}
            >
              React
            </button>
            <button
              type="button"
              className={codeTab === 'vanilla' ? styles.codeTabActive : styles.codeTab}
              onClick={() => setCodeTab('vanilla')}
            >
              Vanilla JS
            </button>
          </div>
          <button type="button" className={styles.action} onClick={downloadCode}>
            Download current settings as code
          </button>
          <p className={styles.status} aria-live="polite">
            {status}
          </p>
        </section>
      </aside>

      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-label={`Pattern Studio — ${s.mode} preview`} />
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className={styles.field}>
      <span>
        {label} <b>{value}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={styles.toggle}>
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
