'use client';

import type { PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const architecture = [
  ['01', 'Approved context', 'The organisation’s confirmed rules, services, language and sources.'],
  ['02', 'Journey rules', 'The event that opens the wait, the useful action, permissions and handoff.'],
  ['03', 'Process status', 'The state and timing of the real process.'],
  ['04', 'Specialist task', 'One bounded job with a stated purpose and limit.'],
  ['05', 'Customer moment', 'Status, an optional choice, review and control.'],
  ['06', 'Evidence pack', 'A record of sources, permissions, changes, approval and handoff.'],
];

const destinations = [
  ['start', 'Start'],
  ['product', 'Product'],
  ['system', 'System'],
  ['pilot', 'Pilot'],
  ['contact', 'Contact'],
] as const;

const assemblyParts = [
  ['context', -220, -130, -32],
  ['permission', 220, -128, 35],
  ['status', -255, 40, 24],
  ['task', 255, 42, -28],
  ['customer', -170, 185, 36],
  ['evidence', 175, 188, -34],
] as const;

export function ActiveJourneyHome() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, x: 0, left: 0 });
  const [progress, setProgress] = useState(0);
  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const desktop = window.matchMedia('(min-width: 761px)');

    const update = () => {
      const distance = track.scrollWidth - track.clientWidth;
      setProgress(distance > 0 ? track.scrollLeft / distance : 0);
      const signature = track.querySelector<HTMLElement>('.aj-signature');
      if (signature) {
        const start = signature.offsetLeft - track.clientWidth * 0.62;
        const end = signature.offsetLeft + signature.offsetWidth * 0.48;
        setAssemblyProgress(Math.max(0, Math.min(1, (track.scrollLeft - start) / Math.max(1, end - start))));
      }
      const centre = track.clientWidth / 2;
      track.querySelectorAll<HTMLElement>('[data-parallax]').forEach((item) => {
        const rect = item.getBoundingClientRect();
        const offset = Math.max(-32, Math.min(32, ((rect.left + rect.width / 2 - centre) / track.clientWidth) * -26));
        item.style.setProperty('--parallax-x', `${offset}px`);
      });
    };

    const wheel = (event: WheelEvent) => {
      if (!desktop.matches || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      track.scrollLeft += event.deltaY;
    };
    const keyboard = (event: KeyboardEvent) => {
      if (!desktop.matches) return;
      if (event.key === 'ArrowRight') track.scrollBy({ left: Math.min(620, window.innerWidth * 0.58), behavior: 'smooth' });
      if (event.key === 'ArrowLeft') track.scrollBy({ left: -Math.min(620, window.innerWidth * 0.58), behavior: 'smooth' });
    };

    update();
    track.addEventListener('scroll', update, { passive: true });
    track.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('keydown', keyboard);
    window.addEventListener('resize', update, { passive: true });
    return () => {
      track.removeEventListener('scroll', update);
      track.removeEventListener('wheel', wheel);
      window.removeEventListener('keydown', keyboard);
      window.removeEventListener('resize', update);
    };
  }, []);

  const goTo = (id: string) => {
    const track = trackRef.current;
    const target = document.getElementById(id);
    if (!track || !target) return;
    if (window.matchMedia('(min-width: 761px)').matches) track.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia('(min-width: 761px)').matches || (event.target as HTMLElement).closest('a,button')) return;
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = { active: true, x: event.clientX, left: track.scrollLeft };
    setDragging(true);
    track.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !dragRef.current.active) return;
    track.scrollLeft = dragRef.current.left - (event.clientX - dragRef.current.x);
  };

  const pointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current.active = false;
    setDragging(false);
    if (trackRef.current?.hasPointerCapture(event.pointerId)) trackRef.current.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="active-journey-home">
      <header className="aj-header">
        <button className="aj-wordmark" onClick={() => goTo('start')} aria-label="Return to the start">assembl<span>·</span></button>
        <p>MAHI THAT EARNS ITS PROOF.</p>
        <a href="mailto:assembl@assembl.co.nz?subject=One%20useful%20customer%20wait">Discuss one wait <i>↗</i></a>
      </header>

      <div
        className={`aj-track ${dragging ? 'is-dragging' : ''}`}
        ref={trackRef}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        tabIndex={0}
        aria-label="assembl horizontal story. Scroll, drag, or use the arrow keys."
      >
        <section className="aj-panel aj-opening" id="start">
          <div className="aj-opening-label"><span>ACTIVE CUSTOMER JOURNEYS</span><strong>THE WAIT BECOMES USEFUL</strong></div>
          <div className="aj-opening-signal"><span>A REAL PROCESS IS UNDERWAY</span><i /><p>The customer can use the wait.</p></div>
          <figure className="aj-photo aj-photo-opening" data-parallax>
            <Image src="https://journeys.assembl.co.nz/assembl-car-flatlay.png" alt="Precisely arranged classic car components" width={1600} height={1000} unoptimized />
            <figcaption>TRIGGER / PERMISSION / PREPARATION / REVIEW / PROOF</figcaption>
          </figure>
          <h1><span>Put necessary waiting</span><span>to work.</span></h1>
          <div className="aj-opening-note"><span>SCROLL / DRAG</span><p>assembl helps organisations turn necessary customer waiting into useful, permissioned preparation—with a named person in control and evidence of what happened.</p><i>→</i></div>
        </section>

        <section className="aj-panel aj-product" id="product">
          <div className="aj-plum-cell"><span>THIS IS</span><strong>assembl</strong><i>·</i></div>
          <article className="aj-product-copy">
            <span>01 / WHY IT EXISTS</span>
            <h2>Most digital journeys stop when the work begins.</h2>
            <p>An application is being assessed. An order is being packed. A claim is under review. assembl uses that natural wait to explain what is happening, collect one useful input and prepare a reviewable next step.</p>
          </article>
          <figure className="aj-photo aj-photo-detail" data-parallax>
            <Image src="https://journeys.assembl.co.nz/assembl-car-flatlay.png" alt="A close crop of an ordered mechanical flat-lay" width={1600} height={1000} unoptimized />
            <figcaption>APPROVED CONTEXT / PERMISSIONS / HANDOFF</figcaption>
          </figure>
          <div className="aj-boundary"><span>WHAT ASSEMBL DOES</span><strong>It prepares what comes next.</strong><p>The visible loader is only the interface. Behind it sit the trigger, permission, task, human review, handoff and evidence.</p></div>
          <div className="aj-proof-strip"><span>REAL EVENT</span><i>→</i><span>PERMISSION</span><i>→</i><span>PREPARATION</span><i>→</i><span>REVIEW</span><i>→</i><span>EVIDENCE</span></div>
        </section>

        <section className="aj-panel aj-live">
          <article className="aj-live-copy">
            <span>02 / AN ACTIVE WAIT STATE</span>
            <h2>Useful work during a real wait.</h2>
            <p>The customer chooses a useful task. assembl prepares the work using approved information. The customer can review it, change it or leave it. A named person owns the next step.</p>
            <div><b>01</b> Choose one useful action</div><div><b>02</b> Prepare a clear output</div><div><b>03</b> Review before it moves</div>
          </article>
          <div className="aj-phone-wrap">
            <div className="aj-phone" aria-label="Proposed simulated active wait interaction">
              <i /><span>SIMULATED EXAMPLE</span><small>APPLICATION REVIEW / IN PROGRESS</small>
              <h3>Your application is with the team.</h3>
              <p>While they review it, I can check what is missing, prepare your questions or keep you updated.</p>
              <div className="aj-phone-choice">Check my documents <i>↗</i></div>
              <div className="aj-phone-choice">Prepare questions for my adviser <i>↗</i></div>
              <div className="aj-phone-input">Ask about this application… <b>↑</b></div>
            </div>
          </div>
          <figure className="aj-photo aj-photo-parts" data-parallax><Image src="https://journeys.assembl.co.nz/assembl-car-flatlay.png" alt="Classic car parts arranged as a complete system" width={1600} height={1000} unoptimized /><figcaption>APPROVED CONTEXT / REVIEWABLE OUTPUT</figcaption></figure>
          <blockquote><span>CUSTOMER VALUE</span><p>Less uncertainty. Less repetition. A better-prepared next step.</p></blockquote>
        </section>

        <section className="aj-panel aj-signature" aria-label="The assembl interval signature object">
          <article className="aj-signature-copy"><span>THE SIX PARTS OF A USEFUL WAIT</span><h2>The wait,<br />assembled<span>·</span></h2><p>A real event opens the moment. The customer gives permission. assembl prepares one bounded piece of work. A named person reviews it. The result and evidence move into the next step.</p><div><i />ASSEMBL PREPARES / A PERSON DECIDES</div></article>
          <div className="aj-assembly-stage">
            <div className="aj-assembly-grid" />
            <div className="aj-assembly-orbits"><i /><i /><i /></div>
            {assemblyParts.map(([label, x, y, rotation], index) => {
              const lock = label === 'evidence' ? Math.max(0, Math.min(1, (assemblyProgress - 0.66) / 0.34)) : Math.max(0, Math.min(1, assemblyProgress / 0.78));
              return <div key={label} className={`aj-assembly-part part-${index + 1}`} style={{ transform: `translate3d(${x * (1 - lock)}px, ${y * (1 - lock)}px, ${index * 7}px) rotate(${rotation * (1 - lock)}deg)` }}><span>{label}</span><i /></div>;
            })}
            <div className="aj-assembly-core"><span>PERSON</span><b>IN CONTROL</b></div>
            <div className="aj-assembly-state"><span>{assemblyProgress > 0.95 ? 'READY FOR HUMAN REVIEW' : assemblyProgress > 0.66 ? 'ADDING THE EVIDENCE RECORD' : assemblyProgress > 0.12 ? 'PREPARING THE NEXT STEP' : 'SIX PARTS / ONE USEFUL WAIT'}</span><strong>{Math.round(assemblyProgress * 100).toString().padStart(2, '0')}%</strong></div>
          </div>
          <div className="aj-signature-marquee"><span>CONTEXT</span><span>PERMISSION</span><span>STATUS</span><span>TASK</span><span>CUSTOMER</span><span>EVIDENCE</span></div>
        </section>

        <section className="aj-panel aj-system" id="system">
          <article className="aj-system-copy"><span>03 / HOW IT WORKS</span><h2>The same controls beneath every customer experience.</h2><p>The language and interface change for each organisation. The safeguards do not: approved context, clear permission, bounded work, named review and a visible evidence record.</p></article>
          <div className="aj-architecture">{architecture.map(([number, title, body]) => <article key={title}><span>{number}</span><h3>{title}</h3><p>{body}</p><i /></article>)}</div>
          <div className="aj-system-marquee"><span>EVENT</span><span>PERMISSION</span><span>PREPARATION</span><span>REVIEW</span><span>HANDOFF</span><span>EVIDENCE</span></div>
        </section>

        <section className="aj-panel aj-modes">
          <div className="aj-modes-title"><span>04 / THREE MODES</span><h2>Three ways to make a real wait useful.</h2></div>
          <article><span>01 / LIVE</span><h3>Prepare the next step while the process runs.</h3><p>Explain status, collect missing information or prepare a reviewable output. No reward or sponsor is needed.</p><b>CLEARER STATUS / BETTER HANDOFF / LESS REWORK</b></article>
          <article><span>02 / REWARDED</span><h3>Recognise useful, optional participation.</h3><p>The organisation may provide value when a customer completes something that helps their own next step.</p><b>OPTIONAL / FAIR / EASY TO DECLINE</b></article>
          <article><span>03 / SPONSORED</span><h3>A partner may fund the help, not the outcome.</h3><p>The sponsor is named, sharing is optional and the primary service does not change.</p><b>DISCLOSED / USEFUL / CUSTOMER-CONTROLLED</b></article>
          <div className="aj-mode-signal"><i /><span>THE WAIT IS REAL</span><strong>THE WORK MUST BE USEFUL</strong></div>
        </section>

        <section className="aj-panel aj-pilot" id="pilot">
          <figure className="aj-photo aj-photo-pilot" data-parallax><Image src="https://journeys.assembl.co.nz/assembl-car-flatlay.png" alt="An ordered field of mechanical parts ready to become a whole" width={1600} height={1000} unoptimized /><figcaption>START WITH ONE COMPLETE SYSTEM</figcaption></figure>
          <article className="aj-pilot-copy"><span>05 / ACTIVE JOURNEY SPRINT</span><h2>Start with one customer wait worth improving.</h2><p>Choose one real wait, one useful task and one named reviewer. We build a branded demonstrator with simulated data, then define how a safe pilot would measure clarity, completion, team effort and customer control.</p></article>
          <ol><li><span>01</span><strong>Choose the wait</strong><p>Name the trigger, usual duration, customer problem and human owner.</p></li><li><span>02</span><strong>Define the task</strong><p>Set the approved context, permissions, limits, output and review point.</p></li><li><span>03</span><strong>Test safely</strong><p>Use simulated or approved data before the journey affects a live customer.</p></li><li><span>04</span><strong>Measure the result</strong><p>Compare time, comprehension, completion, corrections and trust.</p></li></ol>
          <div className="aj-commercial"><span>FIRST ENGAGEMENT</span><strong>A working demonstrator and an evidence-backed pilot plan</strong><small>Two to four weeks / fixed scope / fixed price</small></div>
        </section>

        <section className="aj-panel aj-contact" id="contact">
          <div className="aj-contact-dot">·</div><span>ASSEMBL / AOTEAROA NEW ZEALAND</span>
          <h2>Where are your customers waiting today?</h2>
          <p>We will map the wait, write the customer interaction, build a branded demonstrator and define a safe, measurable pilot. Your team keeps approval over every consequential step.</p>
          <a href="mailto:assembl@assembl.co.nz?subject=One%20useful%20customer%20wait">Discuss one wait <i>↗</i></a>
          <small>Demonstrators use simulated data. Production work requires agreed sources, permissions, security and human review.</small>
        </section>
      </div>

      <footer className="aj-footer">
        <nav aria-label="assembl story navigation">{destinations.map(([id, label], index) => <button key={id} onClick={() => goTo(id)}><span>0{index + 1}</span>{label}</button>)}</nav>
        <div className="aj-progress"><i style={{ transform: `scaleX(${progress})` }} /></div>
        <button className="aj-next" onClick={() => trackRef.current?.scrollBy({ left: Math.min(720, window.innerWidth * 0.65), behavior: 'smooth' })}>SIDE SCROLL <i>→</i></button>
      </footer>
    </div>
  );
}
