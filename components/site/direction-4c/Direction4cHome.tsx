'use client';

import { useEffect, useRef } from 'react';
import { chromeMarkup, footerMarkup, leadMarkup, trailMarkup } from './markup';
import { TryDo, type TryDoSignals } from './TryDo';
import './direction-4c.css';

type TideApi = {
  setKnock(value: number): void;
  setArrive(value: number): void;
  setLit(value: number): void;
  pulse(): void;
};
type TideWorld = {
  ready: Promise<void>;
  api: TideApi | null;
  setPaused(value: boolean): void;
  dispose(): void;
};
type Tide = { attach(options: {
  canvas: HTMLCanvasElement; plate: HTMLVideoElement; extra: Record<string, unknown>;
  onFail(): void;
}): TideWorld };

const FOOTAGE = '/direction-4c/assets/footage/bay-of-islands';

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

// Static, server-rendered design markup. `display: contents` keeps the design's layout tree intact.
function Static({ html }: { html: string }) {
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}

// Headlines gather word by word out of a blur; mono kickers decode into place. Returns cleanup.
function revealText(root: HTMLElement): () => void {
  const timers: number[] = [];
  const words = (el: Element) => Array.from(el.querySelectorAll<HTMLElement>('[data-w]'));
  // The real copy is captured before any decode runs, so cleanup can restore it mid-scramble.
  const kickers = new Map<HTMLElement, string>(Array.from(root.querySelectorAll<HTMLElement>('[data-scramble]'), el => [el, el.textContent ?? '']));
  const scramble = (el: HTMLElement) => {
    const final = kickers.get(el) ?? el.textContent ?? '', n = final.length, pool = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let frame = 0;
    const id = window.setInterval(() => {
      frame++;
      const settled = Math.floor((frame * n) / 16);
      let out = '';
      for (let i = 0; i < n; i++) out += i < settled || final[i] === ' ' || final[i] === '·' ? final[i] : pool[Math.floor(Math.random() * pool.length)];
      el.textContent = out;
      if (settled >= n) { clearInterval(id); el.textContent = final; }
    }, 34);
    timers.push(id);
  };
  const show = (w: HTMLElement) => { w.style.opacity = '1'; w.style.transform = 'none'; w.style.filter = 'none'; };
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target as HTMLElement;
    io.unobserve(el);
    if (el.hasAttribute('data-split')) words(el).forEach((w, i) => {
      const d = i * 70;
      w.style.transition = `opacity .9s ease ${d}ms, transform 1.1s cubic-bezier(.16,1,.3,1) ${d}ms, filter 1s ease ${d}ms`;
      show(w);
    });
    if (el.hasAttribute('data-scramble') && !root.hasAttribute('data-paused')) scramble(el);
  }), { rootMargin: '0px 0px -12% 0px' });
  const split = Array.from(root.querySelectorAll<HTMLElement>('[data-split]'));
  split.forEach(el => {
    words(el).forEach(w => { w.style.opacity = '0'; w.style.transform = 'translateY(.45em) rotate(4deg)'; w.style.transformOrigin = '0 100%'; w.style.filter = 'blur(14px)'; });
    io.observe(el);
  });
  kickers.forEach((_, el) => io.observe(el));
  return () => {
    io.disconnect();
    timers.forEach(id => clearInterval(id));
    split.forEach(el => words(el).forEach(w => { w.style.transition = 'none'; show(w); }));
    kickers.forEach((text, el) => { el.textContent = text; });
  };
}

export function Direction4cHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const signals = useRef<TryDoSignals | null>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, paused = false, frame = 0, lit = 0, stopReveal: (() => void) | undefined;
    let world: TideWorld | undefined;
    const video = document.createElement('video');
    video.muted = true; video.playsInline = true; video.preload = 'auto';
    // H.264 where available (Safari, Chrome); VP9 for browsers shipped without it.
    const footage = `${FOOTAGE}.${video.canPlayType('video/mp4; codecs="avc1.42E01E"') ? 'mp4' : 'webm'}`;
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
    const stop = () => { cancelAnimationFrame(frame); frame = 0; world?.dispose(); world = undefined; video.pause(); fallback(); };
    // The Try DO job lights the flock as it progresses and pulses it on the receipt.
    signals.current = {
      setLit: value => { lit = value; world?.api?.setLit(value); },
      pulse: () => world?.api?.pulse(),
    };
    const updatePause = () => {
      root.toggleAttribute('data-paused', paused || media.matches);
      world?.setPaused(paused || media.matches || document.hidden);
      // Engine has a document-wide pause switch; contain it to this page.
      document.documentElement.removeAttribute('data-paused');
      button.setAttribute('aria-pressed', String(paused || media.matches));
      button.textContent = media.matches ? 'Motion reduced' : paused ? 'Play motion' : 'Pause motion';
      button.disabled = media.matches;
    };
    const tick = () => {
      if (disposed || media.matches || !world?.api) return;
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
      stop(); stopReveal?.(); stopReveal = undefined;
      delete root.dataset.static; updatePause();
      if (media.matches) return;
      if ('IntersectionObserver' in window) stopReveal = revealText(root);
      try {
        await loadScript('/direction-4c/vendor/three.min.js');
        await loadScript('/direction-4c/assembl-tide.js');
        if (disposed || current !== generation || media.matches) return;
        video.src = footage;
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
        world.api.setLit(lit);
        root.dataset.ready = 'true';
        updatePause(); tick();
      } catch { if (!disposed && current === generation) lost(); }
    };
    const toggle = () => { paused = !paused; updatePause(); };
    const visibility = () => updatePause();
    // Only a lost renderer drops the page to its static composition.
    const lost = () => {
      generation++; // A pending attach must never revive a failed scene.
      stop(); stopReveal?.(); stopReveal = undefined; root.dataset.static = 'true';
      video.removeAttribute('src'); video.load();
    };
    // Footage is a backdrop, not a dependency: without it the flock still flies over the plum sky.
    const noFootage = () => { if (video.getAttribute('src')) { video.removeAttribute('src'); video.load(); } };
    video.addEventListener('error', noFootage);
    ref('canvasRef')?.addEventListener('webglcontextlost', lost);
    button.addEventListener('click', toggle);
    media.addEventListener('change', start);
    document.addEventListener('visibilitychange', visibility);
    void start();
    return () => {
      disposed = true; generation++; stop(); stopReveal?.(); signals.current = null;
      video.removeAttribute('src'); video.load();
      button.removeEventListener('click', toggle); media.removeEventListener('change', start);
      document.removeEventListener('visibilitychange', visibility); video.removeEventListener('error', noFootage);
      ref('canvasRef')?.removeEventListener('webglcontextlost', lost);
    };
  }, []);
  return (
    <div ref={rootRef} className="direction-4c">
      <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'clip', background: '#0E040D' }}>
        <Static html={chromeMarkup} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Static html={leadMarkup} />
          <TryDo signals={signals} />
          <Static html={trailMarkup} />
        </div>
        <Static html={footerMarkup} />
      </div>
    </div>
  );
}
