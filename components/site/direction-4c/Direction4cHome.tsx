'use client';

import { useEffect, useRef } from 'react';
import { waitForVideoFrame } from './video-readiness';
import { directionMarkup } from './markup';
import './direction-4c.css';

type TideWorld = {
  ready: Promise<void>;
  api: { setKnock(value: number): void; setArrive(value: number): void } | null;
  setPaused(value: boolean): void;
  dispose(): void;
};
type Tide = { attach(options: {
  canvas: HTMLCanvasElement; plate: HTMLVideoElement; extra: Record<string, unknown>;
  onFail(): void;
}): TideWorld };

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
    const mobile = matchMedia('(max-width: 900px)');
    let startup: AbortController | undefined;
    let disposed = false, paused = false, frame = 0;
    let world: TideWorld | undefined;
    const video = root.querySelector<HTMLVideoElement>('[data-coastal-video]')!;
    video.muted = true; video.defaultMuted = true; video.playsInline = true; video.preload = 'auto';
    video.loop = true;
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
      delete root.dataset.ready; delete root.dataset.videoReady;
      root.querySelectorAll<HTMLElement>('[data-rv]').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    };
    const stop = () => { startup?.abort(); startup = undefined; cancelAnimationFrame(frame); frame = 0; world?.dispose(); world = undefined; video.pause(); fallback(); };
    const updatePause = () => {
      root.toggleAttribute('data-paused', paused || media.matches);
      world?.setPaused(paused || media.matches || document.hidden);
      if (paused || media.matches || document.hidden) video.pause();
      else if (video.src) void video.play().catch(() => { delete root.dataset.videoReady; });
      // Engine has a document-wide pause switch; contain it to this page.
      document.documentElement.removeAttribute('data-paused');
      button.setAttribute('aria-pressed', String(paused || media.matches));
      button.textContent = media.matches ? 'Motion reduced' : paused ? 'Play motion' : 'Pause motion';
      button.disabled = media.matches;
    };
    const tick = () => {
      if (disposed || media.matches || !world?.api) return;
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;
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

    };
    let generation = 0;
    const start = async () => {
      const current = ++generation;
      stop(); delete root.dataset.static; updatePause();
      if (media.matches) return;
      startup = new AbortController();
      const signal = startup.signal;
      try {
        video.src = '/direction-4c/assets/footage/bay-of-islands.mp4';
        const decoded = waitForVideoFrame(video, signal);
        await Promise.all([decoded, video.play()]);
        if (disposed || current !== generation || media.matches) return;
        root.dataset.videoReady = 'true';
        if (mobile.matches) { updatePause(); return; }
        await loadScript('/direction-4c/vendor/three.min.js');
        await loadScript('/direction-4c/assembl-tide.js');
        if (disposed || current !== generation || media.matches) return;
        const engine = (window as Window & { AssemblTide?: Tide }).AssemblTide;
        if (!engine) throw new Error('Motion engine unavailable');
        const next = engine.attach({
          canvas: ref('canvasRef') as HTMLCanvasElement, plate: video, onFail: () => { if (!disposed && current === generation) lost(); },
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
        world = next;
        updatePause();
        await next.ready;
        if (disposed || current !== generation) { next.dispose(); return; }
        if (!world.api) { lost(); return; }
        root.dataset.ready = 'true';
        updatePause(); tick();
      } catch { if (!disposed && current === generation) lost(); }
    };
    const toggle = () => {
      if (root.dataset.static && !media.matches) { paused = false; void start(); return; }
      paused = !paused; updatePause();
    };
    const visibility = () => updatePause();
    const lost = () => {
      generation++; // A pending attach must never revive a failed scene.
      stop(); root.dataset.static = 'true';
      video.removeAttribute('src'); video.load();
      button.textContent = 'Play motion';
    };
    const waiting = () => { delete root.dataset.videoReady; delete root.dataset.ready; };
    const playing = async () => {
      if (!startup || startup.signal.aborted) return;
      const current = generation;
      try {
        await waitForVideoFrame(video, startup.signal);
        if (disposed || current !== generation) return;
        root.dataset.videoReady = 'true';
        if (world?.api) root.dataset.ready = 'true';
      } catch { /* The coastal poster remains visible. */ }
    };
    video.addEventListener('waiting', waiting);
    video.addEventListener('stalled', waiting);
    video.addEventListener('playing', playing);
    video.addEventListener('error', lost);
    ref('canvasRef')?.addEventListener('webglcontextlost', lost);
    button.addEventListener('click', toggle);
    media.addEventListener('change', start);
    mobile.addEventListener('change', start);
    document.addEventListener('visibilitychange', visibility);
    void start();
    return () => {
      disposed = true; generation++; stop(); video.removeAttribute('src'); video.load();
      video.removeEventListener('waiting', waiting); video.removeEventListener('stalled', waiting);
      video.removeEventListener('playing', playing); mobile.removeEventListener('change', start);
      button.removeEventListener('click', toggle); media.removeEventListener('change', start);
      document.removeEventListener('visibilitychange', visibility); video.removeEventListener('error', lost);
      ref('canvasRef')?.removeEventListener('webglcontextlost', lost);
    };
  }, []);
  return <div ref={rootRef} className="direction-4c" dangerouslySetInnerHTML={{ __html: directionMarkup }} />;
}
