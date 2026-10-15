'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { LoopExportOptions, RendererProps } from '@/lib/generative-art/families';
import { formationAt } from '@/lib/generative-art/families/assembly';
import { engineSpecies, speciesById } from '@/lib/generative-art/species';
import { CANON, hexToRgb } from '@/lib/generative-art/canon';
import { encodeLoop } from '@/lib/generative-art/loop-export';
import type { BackgroundId } from '@/lib/generative-art/backgrounds';

/** The part of the tide engine's API the studio drives (public/direction-4c/assembl-tide.js). */
interface TideApi {
  step(dt?: number, draw?: boolean): void;
  setForm(f: number): void;
  jumpForm(f: number): void;
  setGround(rgb: number[] | null): void;
  setBeat(beat: number, amp: number): void;
  setSpin(v: number): void;
  setPaused(p: boolean): void;
  time(): number;
  dispose(): void;
}
type TideMount = (canvas: HTMLCanvasElement, opts: Record<string, unknown>) => Promise<TideApi>;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing?.dataset.loaded) return resolve();
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () => { script.dataset.loaded = 'true'; resolve(); }, { once: true });
    script.addEventListener('error', () => { script.remove(); reject(new Error(`Unable to load ${src}`)); }, { once: true });
    if (!existing) { script.src = src; document.head.appendChild(script); }
  });
}

let engine: Promise<TideMount> | null = null;
function loadEngine(): Promise<TideMount> {
  engine ??= (async () => {
    await loadScript('/direction-4c/vendor/three.min.js');
    await loadScript('/direction-4c/assembl-tide.js');
    const tide = (window as Window & { AssemblTide?: { mount: TideMount } }).AssemblTide;
    if (!tide) throw new Error('Tide engine unavailable');
    return tide.mount;
  })().catch((e) => { engine = null; throw e; });
  return engine;
}

/** Studio grounds on the canon: the shell's background chips map onto plum, paper and chalk. */
const GROUND: Record<string, string> = { plum: CANON.plum, paper: CANON.paper, chalk: CANON.chalk, ink: CANON.plum, seaFog: CANON.chalk };

export function groundFor(background: BackgroundId | null | undefined, speciesGround: string): string {
  return GROUND[background ?? speciesGround] ?? CANON.plum;
}

const FPS_STEP = 1 / 30, STILL_STEPS = 240;

export function TideCanvas({ presetId, values, seed, background, text, onExportersReady }: RendererProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<TideApi | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  const sp = speciesById(presetId);
  const formation = formationAt(values.formation ?? 0);
  const ground = groundFor(background, sp.ground);
  const light = ground !== CANON.plum;
  const count = Math.round(values.count ?? sp.flock.count);
  const size = values.size ?? sp.size.default;
  const beat = values.beat ?? sp.beat;
  const mill = values.mill ?? sp.flock.spin;
  const word = (text || '').trim() || 'assembl';

  // Everything that changes geometry or the formation targets needs a fresh mount.
  const options = useMemo(() => ({
    knock: false, gliders: false, centred: true, fitWidth: 8.4, exactCount: true, arrive: 1, silhouette: 0, tone: 'film',
    seed, count, birdScale: size, species: engineSpecies(sp, light),
    slots: ['cloud', formation], text: formation === 'text' ? word : undefined,
    ground: hexToRgb(ground), bloom: light ? 0 : 1, preserveDrawingBuffer: true,
  }), [seed, count, size, sp, light, formation, word, ground]);

  // Live preview mount, debounced so a dragged slider does not remount every frame.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false, api: TideApi | null = null;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    canvas.setAttribute('aria-hidden', 'true');
    const timer = setTimeout(async () => {
      try {
        const mount = await loadEngine();
        if (disposed) return;
        host.appendChild(canvas);
        api = await mount(canvas, { ...options, dprCap: 2 });
        if (disposed) { api.dispose(); return; }
        api.setBeat(beat, sp.amp); api.setSpin(mill);
        api.jumpForm(0); api.setForm(1);
        apiRef.current = api;
        // fade the previous mount out under the new one
        host.querySelectorAll('canvas').forEach((c) => { if (c !== canvas) c.remove(); });
        setStatus('ready');
      } catch {
        if (!disposed) setStatus('failed');
      }
    }, 220);
    return () => { disposed = true; clearTimeout(timer); if (api) { api.dispose(); if (apiRef.current === api) apiRef.current = null; } canvas.remove(); };
    // beat and mill update live below; they only seed the mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  useEffect(() => { apiRef.current?.setBeat(beat, sp.amp); }, [beat, sp.amp]);
  useEffect(() => { apiRef.current?.setSpin(mill); }, [mill]);

  // Exporters: an off-screen engine at the exact export size, stepped with a fixed dt.
  useEffect(() => {
    if (!onExportersReady) return;
    const offscreen = async (width: number, height: number) => {
      const mount = await loadEngine();
      const gl = document.createElement('canvas');
      const api = await mount(gl, { ...options, size: [width, height], dprCap: 1, manual: true });
      api.setBeat(beat, sp.amp); api.setSpin(mill);
      return { gl, api };
    };
    const still = async (width: number, height: number): Promise<Blob | null> => {
      const { gl, api } = await offscreen(width, height);
      try {
        // assembled, then a fixed eight seconds of flight, so the receipt regenerates the same still
        api.jumpForm(1);
        for (let i = 0; i < STILL_STEPS; i++) api.step(FPS_STEP, i === STILL_STEPS - 1);
        return await new Promise((resolve) => gl.toBlob((b) => resolve(b), 'image/png'));
      } finally { api.dispose(); }
    };
    const loop = async ({ format, width, height, seconds, fps, stamp, onProgress, signal }: LoopExportOptions): Promise<Blob> => {
      // even sizes: H.264 needs them
      const w = Math.max(2, Math.round(width / 2) * 2), h = Math.max(2, Math.round(height / 2) * 2);
      const { gl, api } = await offscreen(w, h);
      const out = document.createElement('canvas'); out.width = w; out.height = h;
      const ctx = out.getContext('2d')!;
      const frames = Math.max(1, Math.round(seconds * fps));
      try {
        // the loop shows the work: a cloud for the first eighth, then the flock assembles and holds
        api.jumpForm(0);
        return await encodeLoop({
          format, canvas: out, frames, fps, onProgress, signal,
          draw: (i) => {
            if (i === Math.round(frames / 8)) api.setForm(1);
            api.step(1 / fps);
            ctx.drawImage(gl, 0, 0, w, h);
            stamp(ctx, w, h);
          },
        });
      } finally { api.dispose(); }
    };
    onExportersReady({
      png: () => still(1600, 1000),
      renderAtSize: still,
      loop,
    });
  }, [onExportersReady, options, beat, mill, sp.amp]);

  return (
    <div
      ref={hostRef}
      className="relative mx-auto ga-canvas w-full overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
      style={{ background: ground }}
      role="img"
      aria-label={`${sp.name}, ${sp.gloss}, assembling into ${formation === 'text' ? `the word ${word}` : formation}`}
    >
      {status !== 'ready' && (
        <p className="absolute inset-x-0 bottom-4 text-center font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: light ? CANON.ink : CANON.chalk }}>
          {status === 'failed' ? 'this browser could not start WebGL' : 'gathering the flock'}
        </p>
      )}
    </div>
  );
}
