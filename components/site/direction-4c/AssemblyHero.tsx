"use client";

import { useEffect, useRef, useState } from "react";

/** Seven image planes resolve into one whole; motion never controls copy visibility. */
export function AssemblyHero() {
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const motionBlocked = useRef(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [manual, setManual] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (reduced) { stage.current?.style.setProperty("--assembly", "1"); return; }
    if (paused || manual) return;
    let frame = 0, previous = 0, phase = progress.current;
    const tick = (now: number) => {
      if (motionBlocked.current) return;
      if (previous) phase += Math.min(now - previous, 50) / 12000;
      previous = now;
      progress.current = phase;
      const wave = (1 - Math.cos(phase * Math.PI * 2)) / 2;
      const amount = Math.min(1, wave * 1.35);
      stage.current?.style.setProperty("--assembly", amount.toFixed(4));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, reduced, manual]);
  useEffect(() => {
    const onScroll = () => {
      if (reduced || manual || !stage.current) return;
      const r = stage.current.getBoundingClientRect();
      stage.current.style.setProperty("--view-turn", `${Math.max(-8, Math.min(8, -r.top / 90))}deg`);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced, manual]);
  return <figure className="assembly-hero">
    <div ref={stage} className="assembly-stage" role="img" aria-label="Seven sculptural image planes move together to form a complete architectural studio scene">
      <div className="assembly-grid" />
      <div className="assembly-object" aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => <div className="assembly-plane" key={i} style={{ "--i": i, "--offset": i - 3 } as React.CSSProperties}><span /></div>)}
      </div>
      <span className="assembly-coordinate" aria-hidden="true">01 — 07 / ASSEMBLING</span>
      <span className="assembly-caption">Fragments. Preparation. A useful whole.</span>
    </div>
    <figcaption className="assembly-controls">
      <div><span>THE WORK TAKES SHAPE</span><small>assembl · interactive visual concept</small></div>
      <button type="button" disabled={reduced} onClick={() => { if (manual) {motionBlocked.current = false; setManual(false); setPaused(false);} else {motionBlocked.current = !paused; setPaused(!paused);} }} aria-pressed={paused || manual}>{reduced ? "Motion reduced" : manual || paused ? "Play motion" : "Pause motion"}</button>
      <label>Assemble it<input type="range" min="0" max="100" defaultValue="0" aria-label="Assembly progress" onChange={e => {motionBlocked.current = true; setManual(true); stage.current?.style.setProperty("--assembly", String(Number(e.target.value) / 100));}} /></label>
    </figcaption>
  </figure>;
}
