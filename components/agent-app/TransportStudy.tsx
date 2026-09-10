'use client';

import { createElement, useEffect, useRef, useState } from 'react';
import type { ModelViewerElement } from '@google/model-viewer';
import Image from 'next/image';
import { Box, Film, Pause, Play, RotateCcw } from 'lucide-react';
import './transport-study.css';

type Subject = 'subaru' | 'boat' | 'plane';
const labels: Record<Subject, { title: string; parts: string; alt: string }> = {
  subaru: { title: 'Subaru WRX', parts: 'Bodywork · drivetrain · cabin · wheels', alt: 'Blue Subaru WRX concept separating into its bodywork and mechanical assemblies in a neutral studio.' },
  boat: { title: 'Sea freight', parts: 'Hull · deck · cargo · bridge', alt: 'Coastal cargo vessel with container tiers and bridge separating above its hull.' },
  plane: { title: 'Air freight', parts: 'Airframe · cargo · wings · engines', alt: 'Cargo aircraft with wings, engines and upper fuselage separating to reveal the airframe and cargo.' },
};
let runtime: Promise<void> | undefined;
function loadViewer() {
  if (customElements.get('model-viewer')) return Promise.resolve();
  runtime ??= new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="/brand/watch/model-viewer.min.js"]');
    if (existing) { customElements.whenDefined('model-viewer').then(() => resolve()); return; }
    const script = document.createElement('script'); script.type = 'module'; script.src = '/brand/watch/model-viewer.min.js';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => { script.remove(); runtime = undefined; reject(new Error('The 3D viewer could not load.')); }, { once: true });
    document.head.appendChild(script);
  });
  return runtime;
}

function AssemblyPlayer({ subject }: { subject: Subject }) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const model = useRef<ModelViewerElement>(null);
  const [mode, setMode] = useState<'film' | 'model'>('film');
  const [paused, setPaused] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [time, setTime] = useState(0);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const [followScroll, setFollowScroll] = useState(false);
  const visible = useRef(true);
  const [onscreen, setOnscreen] = useState(true);
  const state = useRef({ mode, paused, reduced, followScroll });
  useEffect(() => { state.current = { mode, paused, reduced, followScroll }; }, [mode, paused, reduced, followScroll]);
  const path = `/brand/transport/${subject}`;
  const data = labels[subject];

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => { setReduced(media.matches); setPaused(media.matches); };
    preference(); media.addEventListener('change', preference);
    return () => media.removeEventListener('change', preference);
  }, []);

  useEffect(() => {
    const el = root.current; if (!el) return;
    const sync = () => {
      const s = state.current;
      if (!visible.current || document.hidden || s.paused || s.reduced || s.followScroll) { video.current?.pause(); model.current?.pause?.(); }
      else if (s.mode === 'film') void video.current?.play().catch(() => { setPaused(true); });
      else if (model.current?.loaded) model.current.play();
    };
    const observer = new IntersectionObserver(entries => { visible.current = entries[0].isIntersecting; setOnscreen(visible.current); sync(); }, { threshold: .12 });
    observer.observe(el); document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);

  useEffect(() => {
    const film = video.current;
    if (mode === 'film' && !paused && !reduced && !followScroll && visible.current && !document.hidden) void film?.play().catch(() => setPaused(true));
    else film?.pause();
    if (mode === 'model' && ready && !paused && !reduced && !followScroll && visible.current && !document.hidden) model.current?.play();
    else model.current?.pause?.();
  }, [mode, paused, reduced, ready, followScroll]);

  useEffect(() => {
    if (mode !== 'model') return;
    let disposed = false; let timeout: ReturnType<typeof setTimeout> | undefined;
    const viewer = model.current; if (!viewer) return;
    const loaded = () => {
      if (disposed) return; clearTimeout(timeout); setReady(true); setMessage('');
      viewer.animationName = viewer.availableAnimations[0]; viewer.currentTime = time;
      const s = state.current;
      if (!s.paused && !s.reduced && !s.followScroll && visible.current) viewer.play(); else viewer.pause();
    };
    const failed = () => { if (!disposed) { setMessage('The 3D study could not load. The film and still view remain available.'); setReady(false); } };
    viewer.addEventListener('load', loaded); viewer.addEventListener('error', failed);
    setMessage('Loading the editable assembly…');
    void loadViewer().then(() => {
      if (disposed) return;
      const Viewer = customElements.get('model-viewer') as typeof ModelViewerElement;
      Viewer.dracoDecoderLocation = '/brand/watch/draco/';
      viewer.setAttribute('src', `${path}-assembly.glb`); timeout = setTimeout(failed, 35000);
      if (viewer.loaded) loaded();
    }).catch(failed);
    return () => { disposed = true; clearTimeout(timeout); viewer.pause?.(); viewer.removeEventListener('load', loaded); viewer.removeEventListener('error', failed); };
    // The current film time is used only when entering the 3D view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, path]);

  useEffect(() => {
    if (mode !== 'model' || !ready || paused || reduced || followScroll || !onscreen) return;
    let frame = 0; let last = 0;
    const tick = (now: number) => { if (now - last > 100 && visible.current && !document.hidden) { setTime(model.current?.currentTime || 0); last = now; } frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [mode, ready, paused, reduced, followScroll, onscreen]);

  useEffect(() => {
    if (!followScroll || reduced) return;
    const update = () => {
      const section = root.current?.closest('section'); if (!section) return;
      const bounds = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(200, bounds.height)));
      const next = progress * 11.95; setTime(next);
      if (mode === 'model' && model.current?.loaded) model.current.currentTime = next;
      else if (video.current && video.current.readyState >= 1) video.current.currentTime = next;
    };
    window.addEventListener('scroll', update, { passive: true }); update();
    return () => window.removeEventListener('scroll', update);
  }, [followScroll, reduced, mode, ready]);

  function seek(value: number) {
    setPaused(true); setFollowScroll(false); setTime(value);
    if (mode === 'film' && video.current) video.current.currentTime = value;
    if (mode === 'model' && model.current?.loaded) model.current.currentTime = value;
  }
  function play() { setReduced(false); setFollowScroll(false); setPaused(!paused); }
  function reset() { seek(0); if (model.current?.loaded) { model.current.cameraOrbit = '-42deg 64deg 85%'; model.current.jumpCameraToGoal(); } }
  const chapter = time < 1.5 ? 'Ready to begin' : time < 5 ? 'The parts separate' : time < 7 ? 'The construction, revealed' : time < 10.5 ? 'Coming together' : 'Ready for the next step';

  return (
    <div ref={root} className="transport-player" data-subject={subject} data-mode={mode}>
      <div className="transport-stage">
        {mode === 'film' ? <video ref={video} src={`${path}-film.mp4`} poster={`${path}-${subject === 'plane' ? 'assembled' : 'reference'}.webp`} muted loop playsInline preload="metadata" aria-label={data.alt} onTimeUpdate={() => setTime(video.current?.currentTime || 0)} onLoadedMetadata={() => { if (video.current) video.current.currentTime = time; }} onError={() => { setMessage('The film could not load. Try the 3D study.'); setPaused(true); }} />
          : <>
            {!ready && <Image src={`${path}-assembled.webp`} alt={data.alt} fill sizes="(max-width:760px) 100vw,60vw" className="transport-model-poster" />}
            {createElement('model-viewer', { ref: model, alt: data.alt, 'camera-controls': true, 'disable-zoom': true, 'camera-orbit': '-42deg 64deg 85%', 'camera-target': subject === 'subaru' ? '0m 1.2m 0m' : '0m 2.2m 0m', 'min-camera-orbit': 'auto 20deg auto', 'max-camera-orbit': 'auto 100deg auto', 'field-of-view': '30deg', 'shadow-intensity': '0.7', 'shadow-softness': '1', exposure: '0.9', 'environment-image': 'neutral', 'interaction-prompt': 'none', 'touch-action': 'pan-y', style: { opacity: ready ? 1 : 0 } })}
          </>}
        <div className="transport-scene-index aa-mono"><span>{subject === 'subaru' ? '01 / Forge' : subject === 'boat' ? '01 / Sea' : '02 / Air'}</span><span>{mode === 'model' ? 'Drag to rotate' : 'Assembly film'}</span></div>
      </div>
      <div className="transport-timeline">
        <div className="transport-chapter"><span className="aa-mono">{chapter}</span><span className="aa-mono">{Math.min(12, time).toFixed(1)} / 12s</span></div>
        <label className="transport-scrub"><span className="sr-only">Assembly progress</span><input type="range" min="0" max="11.95" step="0.05" value={Math.min(11.95, time)} onChange={e => seek(Number(e.target.value))} /></label>
        <div className="transport-controls">
          <div role="group" aria-label="Assembly view">
            <button type="button" aria-pressed={mode === 'film'} onClick={() => { setReady(false); setMode('film'); setMessage(''); }}><Film size={14} aria-hidden />Film</button>
            <button type="button" aria-pressed={mode === 'model'} onClick={() => setMode('model')}><Box size={14} aria-hidden />3D study</button>
          </div>
          <div><button type="button" onClick={play} aria-label={paused || reduced || followScroll ? 'Play assembly' : 'Pause assembly'}>{paused || reduced || followScroll ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}{paused || reduced || followScroll ? 'Play' : 'Pause'}</button><button type="button" onClick={reset} aria-label="Reset assembly"><RotateCcw size={14} aria-hidden /></button></div>
        </div>
        <div className="transport-detail"><p>{data.parts}</p><button type="button" aria-pressed={followScroll} onClick={() => { setFollowScroll(!followScroll); setPaused(true); setReduced(false); }}>{followScroll ? 'Following scroll' : 'Follow scroll'}</button></div>
        {message && <p className="transport-message" role="status">{message}</p>}
      </div>
    </div>
  );
}

export function TransportStudy({ agent }: { agent: 'forge' | 'customs' }) {
  const [subject, setSubject] = useState<Subject>(agent === 'forge' ? 'subaru' : 'boat');
  return (
    <figure className={`agent-study transport-study transport-study-${agent}`}>
      <div className="transport-heading"><span className="aa-mono">{agent === 'forge' ? 'Subaru WRX / assembly study' : 'Gateway / freight in motion'}</span>{agent === 'customs' && <div role="group" aria-label="Freight scene"><button type="button" aria-pressed={subject === 'boat'} onClick={() => setSubject('boat')}>Boat</button><button type="button" aria-pressed={subject === 'plane'} onClick={() => setSubject('plane')}>Plane</button></div>}</div>
      <AssemblyPlayer key={subject} subject={subject} />
      <figcaption className="transport-disclosure aa-mono">Illustrative assembly · not manufacturer CAD{agent === 'forge' ? ' · no marque affiliation implied' : ''}</figcaption>
    </figure>
  );
}
