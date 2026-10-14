'use client';

import { useEffect, useRef } from 'react';
import { playVideoWhenAllowed } from './video-readiness';
import { chromeMarkup, footerMarkup, leadMarkup, trailMarkup } from './markup';
import { TryDo, type TryDoSignals } from './TryDo';
import './direction-4c.css';

type TideWorld = {
  ready: Promise<void>;
  api: { setKnock(value: number): void; setArrive(value: number): void; setLit(value: number): void; pulse(): void } | null;
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
    const final = kickers.get(el) ?? el.textContent ?? '';
    const n = final.length;
    // Settle on elapsed time, not on tick count: a busy GPU thread starves intervals, and a
    // frame-counted decode can keep scrambling for many seconds on a loaded machine.
    const began = Date.now(), duration = 520;
    const id = window.setInterval(() => {
      const settled = Math.floor(Math.min(1, (Date.now() - began) / duration) * n);
      let out = '';
      for (let i = 0; i < n; i++) out += i < settled || final[i] === ' ' || final[i] === '·' ? final[i] : 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)];
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
    const mobile = matchMedia('(max-width: 900px)');
    let startup: AbortController | undefined;
    let disposed = false, paused = false, initialized = false, frame = 0;
    let recovery: Promise<void> | undefined;
    const playbackListeners = new Set<() => void>();
    const playbackGate = {
      allowed: () => !paused && !media.matches && !document.hidden,
      subscribe: (listener: () => void) => { playbackListeners.add(listener); return () => { playbackListeners.delete(listener); }; },
    };
    let world: TideWorld | undefined;
    let lit = 0, stopReveal: (() => void) | undefined;
    signals.current = { setLit: value => { lit = value; world?.api?.setLit(value); }, pulse: () => world?.api?.pulse() };
    const video = root.querySelector<HTMLVideoElement>('[data-coastal-video]')!;
    video.muted = true; video.defaultMuted = true; video.playsInline = true; video.preload = 'auto';
    video.loop = true;
    const footage = `/direction-4c/assets/footage/bay-of-islands.${video.canPlayType('video/mp4; codecs="avc1.42E01E"') ? 'mp4' : 'webm'}`;
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
    const stop = () => { stopReveal?.(); stopReveal = undefined; initialized = false; recovery = undefined; startup?.abort(); startup = undefined; cancelAnimationFrame(frame); frame = 0; world?.dispose(); world = undefined; video.pause(); fallback(); };
    const updatePause = () => {
      root.toggleAttribute('data-paused', paused || media.matches);
      world?.setPaused(paused || media.matches || document.hidden);
      if (!playbackGate.allowed()) { video.pause(); stopReveal?.(); stopReveal = undefined; }
      if (paused) {
        // Finish a visible text fade before freezing it; never strand reading at partial opacity.
        for (const name of ['kickRef', 'cueRef', 'subRef', 'msgRef', 'markRef']) {
          const el = ref(name);
          if (el && Number(el.style.opacity || '1') > 0) set(name, 1);
        }
      }
      playbackListeners.forEach(listener => listener());
      if (initialized && playbackGate.allowed() && video.paused) void recover();
      // Engine has a document-wide pause switch; contain it to this page.
      document.documentElement.removeAttribute('data-paused');
      button.setAttribute('aria-pressed', String(paused || media.matches || !!root.dataset.static));
      button.textContent = media.matches ? 'Motion reduced' : paused || root.dataset.static ? 'Play motion' : 'Pause motion';
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
        // Phone scrolling can stop anywhere: reveal the reading block at full contrast.
        const card = 1 - smooth(p / .14), msg = mobile.matches ? (p >= .64 ? 1 : 0) : smooth((p - .64) / .18);
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
      // Footage is a backdrop, not a dependency: it starts alongside the engine, and the
      // flock still flies over the plum sky when playback is denied or the file is missing.
      video.src = footage;
      void playVideoWhenAllowed(video, signal, playbackGate).then(() => {
        if (disposed || current !== generation) return;
        initialized = true; root.dataset.videoReady = 'true';
      }).catch(() => { if (!disposed && current === generation && !signal.aborted) noFootage(); });
      try {
        if ('IntersectionObserver' in window) stopReveal = revealText(root);
        await loadScript('/direction-4c/vendor/three.min.js');
        await loadScript('/direction-4c/assembl-tide.js');
        if (disposed || current !== generation || media.matches) return;
        const engine = (window as Window & { AssemblTide?: Tide }).AssemblTide;
        if (!engine) throw new Error('Motion engine unavailable');
        const next = engine.attach({
          canvas: ref('canvasRef') as HTMLCanvasElement, plate: video, onFail: () => { if (!disposed && current === generation) lost(); },
          extra: { poster: root.querySelector('.clear-coastal-poster'), plateReady: () => root.dataset.videoReady === 'true', tone: 'film', gliders: false, knockZoom: true, outline: .7, glass: false,
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
    const toggle = () => {
      if (root.dataset.static && !media.matches) { paused = false; void start(); return; }
      paused = !paused; updatePause();
    };
    const visibility = () => updatePause();
    // Keep the frozen composition on resize; the renderer repaints its new buffer.
    const breakpoint = () => { if (playbackGate.allowed()) void start(); };
    const lost = () => {
      generation++; // A pending attach must never revive a failed scene.
      stop(); root.dataset.static = 'true';
      video.removeAttribute('src'); video.load();
      updatePause();
    };
    // Without footage the plate stays dark and the scene carries on; only a lost renderer goes static.
    const noFootage = () => { initialized = false; delete root.dataset.videoReady; if (video.src) { video.removeAttribute('src'); video.load(); } };
    const recover = () => {
      if (recovery || !initialized || !startup || startup.signal.aborted) return recovery;
      const current = generation;
      recovery = playVideoWhenAllowed(video, startup.signal, playbackGate).then(() => {
        if (disposed || current !== generation) return;
        root.dataset.videoReady = 'true';
        if (world?.api) root.dataset.ready = 'true';
      }).catch(() => { if (!disposed && current === generation) noFootage(); }).finally(() => {
        if (current === generation) recovery = undefined;
      });
      return recovery;
    };
    const waiting = () => {
      delete root.dataset.videoReady;
      // Wait for the next decoded frame directly: recovery need not emit playing.
      void recover();
    };
    const stalled = () => {
      // Fetch can stall while buffered footage is still playing normally.
      if (video.readyState < 2 || !video.videoWidth) waiting();
    };
    video.addEventListener('waiting', waiting);
    video.addEventListener('stalled', stalled);
    video.addEventListener('error', noFootage);
    ref('canvasRef')?.addEventListener('webglcontextlost', lost);
    button.addEventListener('click', toggle);
    media.addEventListener('change', start);
    mobile.addEventListener('change', breakpoint);
    document.addEventListener('visibilitychange', visibility);
    void start();
    return () => {
      disposed = true; generation++; stop(); signals.current = null; video.removeAttribute('src'); video.load();
      video.removeEventListener('waiting', waiting); video.removeEventListener('stalled', stalled);
      mobile.removeEventListener('change', breakpoint);
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
