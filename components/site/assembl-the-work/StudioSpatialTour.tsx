'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { WorldAtelierStage, useAtelierMotionGate, useAtelierVisibility } from './WorldAtelierStage';
import styles from './studio-spatial-tour.module.css';

/** Reuses the actual owned atelier model and camera path; loads only on request. */
export function StudioSpatialTour() {
  const mount = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [entered, setEntered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [position, setPosition] = useState(0);
  const reduced = useAtelierMotionGate();
  const visible = useAtelierVisibility(mount);
  const fail = useCallback(() => { setFailed(true); setPlaying(false); }, []);

  useEffect(() => {
    if (!entered || ready || failed || reduced || !visible) return;
    const timeout = setTimeout(fail, 20000);
    return () => clearTimeout(timeout);
  }, [entered, ready, failed, reduced, visible, fail]);

  useEffect(() => {
    if (!playing || !ready || !visible || reduced || failed) return;
    let raf = 0;
    let last = performance.now();
    let lastUi = 0;
    const tick = (now: number) => {
      progress.current = Math.min(1, progress.current + Math.min(now - last, 80) / 24000);
      last = now;
      if (now - lastUi > 150 || progress.current === 1) { setPosition(Math.round(progress.current * 100)); lastUi = now; }
      if (progress.current < 1) raf = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, ready, visible, reduced, failed]);

  function play() {
    if (progress.current >= 1) { progress.current = 0; setPosition(0); }
    setEntered(true); setPlaying(v => !v);
  }
  const chapter = position < 34 ? 'Pursuit / the opening' : position < 67 ? 'DO / the worktable' : 'Studio / the possibility';
  return <div ref={mount} className={styles.tour}>
    {entered && !reduced ? <WorldAtelierStage progress={progress} playhead={position} paused={false} reduced={reduced} visible={visible} failed={failed} onReady={setReady} onFailure={fail} /> : <Image src="/do/world/atelier-poster.png" alt="Assembl’s imagined atelier, built as an interactive 3D scene" fill sizes="(max-width:760px) 100vw, 75vw" />}
    <div className={styles.top}><span>AN IMAGINED WORKSPACE · 3D STUDY</span><strong>{chapter}</strong></div>
    <div className={styles.controls}>
      {failed ? <p role="status">The 3D scene could not load. The still view is available.</p> : reduced ? <p>Still view · reduced motion is on</p> : <>
        <button type="button" onClick={play} disabled={entered && !ready} aria-pressed={playing}>{playing ? <Pause size={17} /> : position === 100 ? <RotateCcw size={17} /> : <Play size={17} />}{entered && !ready ? 'Opening the space…' : playing ? 'Pause tour' : position === 100 ? 'Replay tour' : 'Play spatial tour'}</button>
        {entered && ready && <label>Tour position<input type="range" min={0} max={100} value={position} onChange={e => { const value = Number(e.target.value); setPlaying(false); progress.current = value / 100; setPosition(value); }} /></label>}
        <span>24 seconds · no sound</span>
      </>}
    </div>
  </div>;
}
