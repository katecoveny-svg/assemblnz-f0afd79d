'use client';

import { createElement, useEffect, useRef, useState } from 'react';
import type { ModelViewerElement } from '@google/model-viewer';

const MEDIA = '/brand/watch';
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value: number) => value * value * (3 - 2 * value);
let runtime: Promise<void> | undefined;

function loadViewer() {
  runtime ??= new Promise<void>((resolve, reject) => {
    if (customElements.get('model-viewer')) { resolve(); return; }
    const script = document.createElement('script');
    script.type = 'module';
    script.src = `${MEDIA}/model-viewer.min.js`;
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => { script.remove(); reject(new Error('Watch viewer unavailable')); }, { once: true });
    document.head.appendChild(script);
  });
  return runtime;
}

type Controls = { load: () => void; reset: () => void; motion: () => void; play: () => void; resume: () => void };

/** The original 1,025-part watch; scroll scrubs its authored assembly animation. */
export function WatchScene({ home = false }: { home?: boolean }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<ModelViewerElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const controls = useRef<Controls>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lessMotion, setLessMotion] = useState(false);
  const [playing, setPlaying] = useState(home);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const scene = sceneRef.current;
    const model = modelRef.current;
    const root = scene?.closest<HTMLElement>('.watch-site');
    const art = scene?.querySelector<HTMLElement>('.watch-art');
    const poster = scene?.querySelector<HTMLImageElement>('.watch-still');
    if (!scene || !model || !root || !art || !poster) return;

    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 760px)');
    let reduced = preference.matches;
    let disposed = false, loaded = false, pending = false;
    let raf = 0, timeout = 0, target = 0, displayed = 0;
    let span = 1, start = 0, finish = 0, offset = 0, phi = 52, lastPose = -1;
    let timeline = 0, autoplay = home, lastTick = 0, lastScroll = scrollY, clock = 0;
    let keys: [number, number][] = [];
    let mobilePath: [number, number][] = [];
    let fadeBegin = 1, fadeEnd = 1;
    const caption = scene.querySelector<HTMLElement>('.watch-assembly-caption');

    function measure() {
      start = root!.getBoundingClientRect().top + scrollY;
      const phone = home ? root!.querySelector<HTMLElement>('.cj-live') : null;
      finish = phone
        ? phone.getBoundingClientRect().top + scrollY - start
        : root!.offsetHeight - 260;
      span = Math.max(innerHeight, finish - innerHeight);
      if (home) {
        const section = (selector: string) => root!.querySelector<HTMLElement>(selector);
        const at = (element: HTMLElement | null) => element ? clamp((element.getBoundingClientRect().top + scrollY - start - innerHeight * .15) / span) : 0;
        const wait = section('.cj-wait');
        const story = section('.cj-story-block');
        const hero = section('.cj-hero');
        const heroCopy = section('.cj-hero-copy');
        const waitMedia = section('.cj-wait-media');
        const industry = section('.cj-industries');
        const industryTop = industry ? industry.getBoundingClientRect().top + scrollY - start : finish;
        fadeBegin = clamp((industryTop - innerHeight * .65) / span);
        fadeEnd = clamp((industryTop - innerHeight * .1) / span);
        keys = [[0, 0], [at(section('.cj-story-block')), 2.4], [at(wait), 4.2],
          [fadeBegin, 8.2], [1, 9.4]];
        if (hero && heroCopy && story && wait && waitMedia) {
          const top = (element: HTMLElement) => element.getBoundingClientRect().top + scrollY - start;
          const heroY = top(heroCopy) + heroCopy.offsetHeight - art!.offsetHeight * .2;
          const storyY = top(story) + story.offsetHeight - art!.offsetHeight * .8;
          const waitY = top(waitMedia) - art!.offsetHeight * .15;
          // Use the real empty media spaces on narrow screens, not the text column.
          mobilePath = [[0, heroY], [top(hero) + hero.offsetHeight - innerHeight * .8, heroY + 50],
            [top(story) - innerHeight * .2, storyY], [top(wait) - innerHeight * .2, waitY], [finish, waitY]];
        }
      }
      lastPose = -1;
    }

    function storyTime(progress: number) {
      for (let i = 1; i < keys.length; i++) {
        const [end, endTime] = keys[i];
        if (progress <= end) {
          const [begin, beginTime] = keys[i - 1];
          return beginTime + (endTime - beginTime) * clamp((progress - begin) / Math.max(.0001, end - begin));
        }
      }
      return 9.4;
    }

    function pose(progress: number, force = false) {
      if (!loaded || reduced || (!home && !force && Math.abs(progress - lastPose) < 0.00005)) return;
      lastPose = progress;
      const time = home ? Math.max(0, timeline) : progress * 11.95;
      const open = time < 1 ? 0 : time < 4.5 ? (time - 1) / 3.5 : time < 7.5 ? 1 : 1 - clamp((time - 7.5) / 3.5);
      const amount = home ? time < 10 ? 1 - smooth(clamp((time - 2.4) / 5.4)) : smooth(clamp((time - 10) / 5.4)) : smooth(open);
      const radius = home ? (mobile.matches ? .15 : .14) + .174 * amount : (mobile.matches ? 0.16 : 0.145) + (mobile.matches ? 0.17 : 0.185) * amount;
      model!.currentTime = Math.min(time + (home ? 1 / 24 : 0), model!.duration || (home ? 18.041667 : 11.95));
      model!.cameraOrbit = `${35 + (home ? 0 : 13 * progress) + offset}deg ${phi}deg ${radius}m`;
      model!.cameraTarget = `0m ${0.072 + 0.022 * amount}m 0m`;
      model!.jumpCameraToGoal();
      scene!.dataset.timeline = time.toFixed(3);
      if (home && caption) {
        const label = time < 2.4 || time > 15.4 ? '01 / Floating parts' : time < 5.3 ? '02 / Mechanism and casing' : time < 7.8 ? '03 / Dial, hands and glass' : time < 10 ? '04 / Assembled' : '01 / Separating the parts';
        if (caption.textContent !== label) caption.textContent = label;
      }
    }

    function render(progress: number) {
      const drift = mobile.matches ? .40 + .05 * Math.sin(progress * Math.PI) : -.035 + .2 * progress;
      let travel = Math.max(0, Math.min(progress * span + innerHeight * drift, finish - art!.offsetHeight));
      if (home && mobile.matches && mobilePath.length) {
        const distance = progress * span;
        travel = mobilePath[mobilePath.length - 1][1];
        for (let i = 1; i < mobilePath.length; i++) {
          const [end, to] = mobilePath[i];
          if (distance <= end) {
            const [begin, from] = mobilePath[i - 1];
            travel = from + (to - from) * smooth(clamp((distance - begin) / Math.max(1, end - begin)));
            break;
          }
        }
      }
      art!.style.transform = reduced ? '' : `translate3d(0,${travel.toFixed(2)}px,0)`;
      art!.style.setProperty('--watch-drift', `${Math.sin(progress * Math.PI * 2) * 3}%`);
      if (home) art!.style.opacity = reduced ? '1' : String(1 - smooth(clamp((progress - fadeBegin) / Math.max(.001, fadeEnd - fadeBegin))));
      scene!.dataset.travel = reduced ? '0' : travel.toFixed(1);
      scene!.dataset.progress = progress.toFixed(4);
      const expanded = !reduced && (home ? progress < .65 : progress > 0.2 && progress < 0.8);
      const next = expanded ? `${MEDIA}/watch-exploded.jpg` : `${MEDIA}/watch-poster.jpg`;
      if (poster!.getAttribute('src') !== next && (!loaded || reduced)) poster!.src = next;
      pose(progress);
    }

    function tick(timestamp: number) {
      raf = 0;
      if (document.hidden || reduced || dialogRef.current?.open) { lastTick = 0; return; }
      // Cap rendering at 30fps; stop entirely below the watch or in a hidden tab.
      if (home && lastTick && timestamp - lastTick < 32) { raf = requestAnimationFrame(tick); return; }
      const delta = Math.min(.06, lastTick ? (timestamp - lastTick) / 1000 : 0);
      lastTick = timestamp;
      clock += delta;
      displayed += (target - displayed) * 0.19;
      if (Math.abs(displayed - target) < 0.00012) displayed = target;
      if (home) {
        const targetTime = storyTime(displayed);
        const breathe = targetTime < 7.8 ? Math.sin(clock * .6) * .12 : 0;
        timeline = autoplay ? (timeline + delta) % 18 : timeline + (targetTime + breathe - timeline) * .12;
        scene!.dataset.playback = autoplay ? 'playing' : 'scroll';
      }
      render(displayed);
      if ((home && loaded && displayed < fadeEnd && scrollY - start < finish - 60) || displayed !== target) raf = requestAnimationFrame(tick);
    }

    function onScroll() {
      target = clamp((scrollY - start) / span);
      if (home && ((Math.abs(scrollY - lastScroll) > 2) || (!loaded && target > .015))) {
        autoplay = false;
        setPlaying(false);
      }
      lastScroll = scrollY;
      scene!.dataset.controls = (home ? target < fadeEnd : scrollY - start < finish - innerHeight * 0.65) ? 'visible' : 'hidden';
      if (reduced || document.hidden) {
        displayed = target;
        render(target);
      } else if (!raf) raf = requestAnimationFrame(tick);
    }

    function fallback() {
      if (disposed) return;
      window.clearTimeout(timeout);
      loaded = false;
      pending = false;
      setLoading(false);
      setReady(false);
      setMessage('Still view · the film is also available');
    }

    async function load() {
      if (loaded || pending || reduced || disposed) return;
      pending = true;
      setLoading(true);
      setMessage('Preparing the 3D watch…');
      try {
        await loadViewer();
        const Viewer = customElements.get('model-viewer') as typeof ModelViewerElement;
        if (disposed || reduced) { pending = false; setLoading(false); return; }
        Viewer.dracoDecoderLocation = `${MEDIA}/draco/`;
        Viewer.minimumRenderScale = 1;
        if (model!.hasAttribute('src')) {
          model!.removeAttribute('src');
          await model!.updateComplete;
        }
        if (disposed || reduced) { pending = false; return; }
        timeout = window.setTimeout(fallback, 35000);
        model!.setAttribute('src', `${MEDIA}/${home ? 'watch-assembly-story' : 'assembl-watch'}.glb`);
      } catch { runtime = undefined; fallback(); }
    }

    function onLoad() {
      if (disposed) return;
      clearTimeout(timeout);
      loaded = true;
      pending = false;
      model!.animationName = model!.availableAnimations[0];
      model!.pause();
      if (home && !autoplay) timeline = storyTime(target);
      setReady(true);
      setLoading(false);
      setMessage('');
      pose(displayed, true);
      if (home && !raf) raf = requestAnimationFrame(tick);
    }

    function applyMotion(value: boolean) {
      reduced = value;
      setLessMotion(value);
      cancelAnimationFrame(raf);
      raf = 0;
      if (value) setMessage('');
      measure();
      onScroll();
      if (!value) { void load(); pose(displayed, true); }
    }
    function onPreference() { applyMotion(preference.matches); }
    function onResize() { measure(); onScroll(); pose(displayed, true); }
    function onVisibility() {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; lastTick = 0; filmRef.current?.pause(); }
      else onScroll();
    }
    function onCamera(event: Event) {
      const source = (event as CustomEvent<{ source: string }>).detail?.source;
      if (!loaded || source !== 'user-interaction') return;
      const orbit = model!.getCameraOrbit();
      offset = orbit.theta * 180 / Math.PI - (35 + (home ? 0 : 13 * displayed));
      phi = clamp(orbit.phi * 180 / Math.PI, 15, 155);
    }

    controls.current = {
      load: () => { void load(); },
      reset: () => { offset = 0; phi = 52; pose(displayed, true); },
      motion: () => applyMotion(!reduced),
      play: () => { autoplay = !autoplay; setPlaying(autoplay); lastTick = 0; if (!raf) raf = requestAnimationFrame(tick); },
      resume: onScroll,
    };
    model.addEventListener('load', onLoad);
    model.addEventListener('error', fallback);
    model.addEventListener('camera-change', onCamera);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    preference.addEventListener('change', onPreference);
    const observer = new ResizeObserver(onResize);
    observer.observe(root);
    // Start after the first layout so the initial viewport and motion preference
    // are reflected before the model begins loading.
    const startFrame = requestAnimationFrame(() => {
      if (disposed) return;
      measure();
      onScroll();
      setLessMotion(reduced);
      const dataSaver = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      if (!reduced && !dataSaver) void load();
      if (dataSaver) setMessage('Data saver · load 3D when ready');
    });

    return () => {
      disposed = true;
      controls.current = null;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(startFrame);
      clearTimeout(timeout);
      observer.disconnect();
      model.removeEventListener('load', onLoad);
      model.removeEventListener('error', fallback);
      model.removeEventListener('camera-change', onCamera);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      preference.removeEventListener('change', onPreference);
      model.pause?.();
    };
  }, [home]);

  function openFilm() {
    const film = filmRef.current;
    if (!film) return;
    if (!film.getAttribute('src')) {
      film.src = `${MEDIA}/${matchMedia('(max-width: 760px)').matches ? 'watch-mobile' : 'watch-desktop'}.mp4`;
      film.load();
    }
    dialogRef.current?.showModal();
    if (!lessMotion) void film.play().catch(() => {});
  }

  return (
    <div className="watch-scene" ref={sceneRef} data-ready={ready} data-reduced={lessMotion} data-assembly-story={home}>
      <div className="watch-art">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="watch-still" src={`${MEDIA}/${home ? 'watch-exploded' : 'watch-poster'}.jpg`} width={1920} height={1080} alt="Rose-gold and chrome watch" fetchPriority="high" />
        {createElement('model-viewer', {
          ref: modelRef,
          className: 'watch-model',
          alt: 'A watch made from 1,025 separate parts. Scroll to open and reassemble it. Drag or use the arrow keys to rotate.',
          'camera-controls': true,
          'disable-zoom': true,
          'disable-pan': true,
          'touch-action': 'pan-y',
          'camera-orbit': '35deg 52deg 0.145m',
          'camera-target': '0m 0.072m 0m',
          'field-of-view': '30deg',
          'min-camera-orbit': 'auto 15deg 0.12m',
          'max-camera-orbit': 'auto 155deg 0.8m',
          exposure: '1.1',
          'environment-image': `${MEDIA}/studio-lighting-final.hdr`,
          'skybox-image': `${MEDIA}/plum-backdrop.hdr`,
          'shadow-intensity': '0',
          'interaction-prompt': 'none',
          'interpolation-decay': '60',
        })}
        {home && <span className="watch-assembly-caption" aria-hidden="true">01 / Floating parts</span>}
      </div>
      <div className="watch-controls" aria-label="Watch viewing controls">
        <span className="watch-status" role="status">{message}</span>
        {!ready && !lessMotion && <button type="button" disabled={loading} onClick={() => controls.current?.load()}>Load 3D</button>}
        {ready && !lessMotion && <button type="button" onClick={() => controls.current?.reset()} aria-label="Reset the watch viewing angle">{home ? '⟳' : 'Recentre ⟳'}</button>}
        {home && ready && !lessMotion && <button type="button" aria-pressed={playing} onClick={() => controls.current?.play()}>{playing ? 'Follow scroll' : 'Play assembly'}</button>}
        <button type="button" ref={openerRef} onClick={openFilm}>Watch the film ▷</button>
        <button type="button" aria-pressed={lessMotion} onClick={() => controls.current?.motion()}>{lessMotion ? 'Enable motion' : 'Less motion'}</button>
      </div>
      <dialog ref={dialogRef} className="watch-film-dialog" aria-label="Watch assembly film" onClose={() => {
        filmRef.current?.pause();
        controls.current?.resume();
        openerRef.current?.focus({ preventScroll: true });
      }}>
        <button type="button" className="watch-film-close" onClick={() => dialogRef.current?.close()}>Close film ×</button>
        <video ref={filmRef} controls playsInline preload="none" poster={`${MEDIA}/watch-poster.jpg`} aria-label="The watch separates into its components, pauses, then reassembles" />
      </dialog>
    </div>
  );
}
