"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const World = dynamic(() => import("./PreparationWorld"), { ssr: false });
const chapters = [
  { title: "everything starts with someone.", text: "An enquiry. A decision. A customer who needs a clearer next step.", label: "01 / understand" },
  { title: "bring the right pieces together.", text: "Specialist agents prepare the information, questions and options. One coherent journey takes shape.", label: "02 / assemble" },
  { title: "ready for a person to say yes.", text: "A useful plan. A clear owner. The context to decide. Your team stays in control.", label: "03 / move forward" },
];

export default function CinematicJourney() {
  const section = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const [step, setStep] = useState(0);
  const [frozen, setFrozen] = useState(0);
  useEffect(() => {
    const media = matchMedia("(max-width: 800px), (prefers-reduced-motion: reduce)");
    const updateMode = () => setManual(media.matches);
    updateMode();
    media.addEventListener("change", updateMode);
    return () => media.removeEventListener("change", updateMode);
  }, []);
  useEffect(() => {
    if (manual || paused) return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = section.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const value = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight)));
        setProgress(value);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [manual, paused]);
  const position = manual ? step / 2 : paused ? frozen : progress;
  const active = Math.round(position * 2);
  function go(index: number) {
    setStep(index);
    setFrozen(index / 2);
    if (manual || paused || !section.current) return;
    const r = section.current.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.top + (r.height - innerHeight) * index / 2, behavior: "smooth" });
  }
  return (
    <section ref={section} className={`aw-cinema ${manual ? "aw-cinema-manual" : ""}`} aria-label="A customer journey, assembled">
      <div className="aw-cinema-sticky">
        <div className="aw-cinema-world" aria-hidden="true">
          <Image src="/images/assembl-preparation-world.webp" alt="" fill priority sizes="100vw" />
          <World stage={position * 3} choice={null} paused={paused} cinematic />
        </div>
        <div className="aw-cinema-top"><span>customer journeys, assembled</span><a href="#journey">skip to the working demo ↘</a></div>
        <div className="aw-cinema-window">
          <div className="aw-cinema-track" style={{ transform: `translate3d(${-position * 200}%,0,0)` }}>
            {chapters.map((chapter, i) => (
              <article key={chapter.label} className="aw-cinema-chapter" inert={active !== i}>
                <p className="aw-label">{chapter.label}</p>
                {i === 0 ? <h1>{chapter.title}</h1> : <h2>{chapter.title}</h2>}
                <p className="aw-cinema-description">{chapter.text}</p>
                {i === 0 && <p className="aw-cinema-service">We design and run agentic customer journeys.</p>}
                <a className="aw-button" href="#journey">{i === 2 ? "try a journey" : "experience assembl"} <span>↗</span></a>
              </article>
            ))}
          </div>
        </div>
        <div className="aw-cinema-bottom">
          <span>{manual ? "choose a chapter" : "scroll down. the story moves across."}</span>
          <nav aria-label="Journey chapters">{chapters.map((c, i) => <button key={c.label} onClick={() => go(i)} aria-label={c.label} aria-current={active === i ? "step" : undefined}>0{i + 1}</button>)}</nav>
          <button onClick={() => { setFrozen(position); setPaused(!paused); }} aria-pressed={paused}>{paused ? "resume motion" : "pause motion"}</button>
        </div>
        <div className="aw-cinema-progress" aria-hidden="true" style={{ transform: `scaleX(${(position + .06) / 1.06})` }} />
      </div>
    </section>
  );
}
