'use client';

import { useEffect, useRef } from 'react';
import { directionMarkup } from './markup';
import './direction-4c.css';

type TideWorld = {
  api: { setKnock(value: number): void; setArrive(value: number): void } | null;
  setPaused(value: boolean): void;
  dispose(): void;
};
type Tide = { attach(options: {
  canvas: HTMLCanvasElement; plate: HTMLVideoElement; extra: Record<string, unknown>;
  onFail(): void;
}): Promise<TideWorld> };

// The supplied, locally hosted engine is loaded once; the document never evaluates the design DSL.
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

export function Direction4cHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, paused = false, frame = 0;
    let world: TideWorld | undefined;
    const video = document.createElement('video');
    video.muted = true; video.playsInline = true; video.preload = 'auto';
    const ref = (name: string) => root.querySelector<HTMLElement>(`[data-ref="${name}"]`);
    const button = root.querySelector<HTMLButtonElement>('[data-pause]')!;
    const clamp = (x: number) => Math.max(0, Math.min(1, x));
    const smooth = (x: number) => { x = clamp(x); return x * x * (3 - 2 * x); };
    const set = (name: string, opacity: number, transform?: string) => {
      const el = ref(name); if (!el) return;
      el.style.opacity = opacity.toFixed(3); el.style.visibility = opacity < .02 ? 'hidden' : 'visible';
      if (transform) el.style.transform = transform;
    };
    const fallback = () => {
      delete root.dataset.ready;
      root.querySelectorAll<HTMLElement>('[data-rv]').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    };
    const stop = () => { cancelAnimationFrame(frame); world?.dispose(); world = undefined; video.pause(); fallback(); };
    const updatePause = () => {
      root.toggleAttribute('data-paused', paused || media.matches);
      world?.setPaused(paused || document.hidden);
      // Engine has a document-wide pause switch; contain it to this page.
      document.documentElement.removeAttribute('data-paused');
      button.setAttribute('aria-pressed', String(paused || media.matches));
      button.textContent = media.matches ? 'Motion reduced' : paused ? 'Play motion' : 'Pause motion';
      button.disabled = media.matches;
    };
    const tick = () => {
      if (disposed || media.matches) return;
      frame = requestAnimationFrame(tick);
      if (paused || document.hidden) return;
      const hero = ref('heroRef');
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const p = clamp(-rect.top / Math.max(1, rect.height - innerHeight));
        world?.api?.setKnock(clamp((p - .1) / .62));
        world?.api?.setArrive(.22 + .78 * smooth((p - .48) / .34));
        const card = 1 - smooth(p / .14), msg = smooth((p - .64) / .18);
        set('kickRef', card); set('cueRef', card); set('subRef', card); set('markRef', smooth((p - .58) / .2));
        set('msgRef', msg, `translateY(calc(-50% + ${(1 - msg) * 48}px))`);
      }
      if (Number.isFinite(video.duration) && video.duration > 0) {
        const start = Math.min(6, video.duration * .25);
        const q = clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight));
        const idle = (1 - Math.min(1, q * 25)) * (1 - Math.cos(performance.now() * .0004)) * .9;
        const target = Math.min(video.duration - .05, start + idle + q * (video.duration - start - .05));
        if (!video.seeking && Math.abs(video.currentTime - target) > .03) video.currentTime += (target - video.currentTime) * .14;
      }
    };
    let generation = 0;
    const start = async () => {
      const current = ++generation;
      stop(); updatePause();
      if (media.matches) return;
      try {
        await loadScript('/direction-4c/vendor/three.min.js');
        await loadScript('/direction-4c/assembl-tide.js');
        if (disposed || current !== generation || media.matches) return;
        video.src = '/direction-4c/assets/footage/bay-of-islands.mp4';
        const engine = (window as Window & { AssemblTide?: Tide }).AssemblTide;
        if (!engine) throw new Error('Motion engine unavailable');
        const next = await engine.attach({
          canvas: ref('canvasRef') as HTMLCanvasElement, plate: video, onFail: fallback,
          extra: { tone: 'film', gliders: false, knockZoom: true, outline: .7, glass: false,
            count: 900, arrive: .22, birdScale: 1.2, silhouette: 1,
            slots: ['cloud', 'signal', 'pin', 'DO', 'bubble', 'tick', 'frame', 'sparkle', 'padlock', 'seal', 'amark', 'word'],
            onLayout: (layout: { cy: number; h: number }) => {
              const kick = ref('kickRef'), sub = ref('subRef');
              if (kick) kick.style.top = `${Math.round(layout.cy - layout.h / 2 - 50)}px`;
              if (sub) sub.style.top = `${Math.round(layout.cy + layout.h / 2 + 26)}px`;
            },
          },
        });
        if (disposed || current !== generation) { next.dispose(); return; }
        world = next;
        if (world.api) root.dataset.ready = 'true';
        updatePause(); tick();
      } catch { fallback(); tick(); }
    };
    const toggle = () => { paused = !paused; updatePause(); };
    const visibility = () => updatePause();
    const lost = () => { stop(); tick(); };
    video.addEventListener('error', lost);
    ref('canvasRef')?.addEventListener('webglcontextlost', lost);
    button.addEventListener('click', toggle);
    media.addEventListener('change', start);
    document.addEventListener('visibilitychange', visibility);
    void start();
    return () => {
      disposed = true; generation++; stop(); video.removeAttribute('src'); video.load();
      button.removeEventListener('click', toggle); media.removeEventListener('change', start);
      document.removeEventListener('visibilitychange', visibility); video.removeEventListener('error', lost);
      ref('canvasRef')?.removeEventListener('webglcontextlost', lost);
    };
  }, []);
  return <div ref={rootRef} className="direction-4c" dangerouslySetInnerHTML={{ __html: directionMarkup }} />;
}
