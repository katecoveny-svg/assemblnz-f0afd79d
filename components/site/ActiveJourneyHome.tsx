'use client';

import type { PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const architecture = [
  ['01', 'Business Genome', 'The approved rules, services, language and evidence this journey may use.'],
  ['02', 'Journey Composer', 'The trigger, useful work, permission boundaries and human gates.'],
  ['03', 'Runtime', 'The live state and clock of the process underneath.'],
  ['04', 'Specialist agents', 'Small, bounded jobs with visible scope and clear limits.'],
  ['05', 'Active wait state', 'The customer-facing moment for choice, progress and preparation.'],
  ['06', 'Evidence pack', 'Sources, actions, approvals, ownership and the resulting handoff.'],
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
  ['runtime', -255, 40, 24],
  ['specialists', 255, 42, -28],
  ['active wait', -170, 185, 36],
  ['proof', 175, 188, -34],
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
        <a href="mailto:assembl@assembl.co.nz?subject=An%20active%20customer%20journey">Build one journey <i>↗</i></a>
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
          <div className="aj-opening-label"><span>THE ORCHESTRATION LAYER FOR</span><strong>ACTIVE CUSTOMER JOURNEYS</strong></div>
          <div className="aj-opening-signal"><span>ASSEMBL / 01</span><i /><p>The business is working.<br />The customer should feel it.</p></div>
          <figure className="aj-photo aj-photo-opening" data-parallax>
            <Image src="https://journeys.assembl.co.nz/assembl-car-flatlay.png" alt="Precisely arranged classic car components" width={1600} height={1000} unoptimized />
            <figcaption>ONE SYSTEM / EVERY PART VISIBLE</figcaption>
          </figure>
          <h1><span>Every customer journey</span><span>has moments in between.</span></h1>
          <div className="aj-opening-note"><span>SCROLL / DRAG</span><p>Turn a real delay into useful, permissioned progress.</p><i>→</i></div>
        </section>

        <section className="aj-panel aj-product" id="product">
          <div className="aj-plum-cell"><span>THIS IS</span><strong>assembl</strong><i>·</i></div>
          <article className="aj-product-copy">
            <span>01 / THE PRODUCT</span>
            <h2>The moment between intent and outcome becomes a working surface.</h2>
            <p>assembl appears when something real is underway: an assessment, search, service, claim, transition or handoff. It explains the clock, prepares useful work and carries an approved object into the next step.</p>
          </article>
          <figure className="aj-photo aj-photo-detail" data-parallax>
            <Image src="https://journeys.assembl.co.nz/assembl-car-flatlay.png" alt="A close crop of an ordered mechanical flat-lay" width={1600} height={1000} unoptimized />
            <figcaption>CONTEXT / PARTS / DEPENDENCIES</figcaption>
          </figure>
          <div className="aj-boundary"><span>NOT A CHATBOT</span><strong>Not a better spinner.</strong><p>A bounded product moment with a real trigger, customer control and a named human owner.</p></div>
          <div className="aj-proof-strip"><span>CONTEXT</span><i>→</i><span>PERMISSION</span><i>→</i><span>USEFUL WORK</span><i>→</i><span>HUMAN REVIEW</span><i>→</i><span>PROOF</span></div>
        </section>

        <section className="aj-panel aj-live">
          <article className="aj-live-copy">
            <span>02 / AN ACTIVE WAIT STATE</span>
            <h2>Useful work inside a real wait.</h2>
            <p>Not a general assistant. Each agent receives one organisation’s approved language, evidence and decision boundaries. It prepares. The named person remains responsible.</p>
            <div><b>01</b> Ask what is useful now</div><div><b>02</b> Shape a reviewable object</div><div><b>03</b> Hand it to the right person</div>
          </article>
          <div className="aj-phone-wrap">
            <div className="aj-phone" aria-label="Proposed simulated active wait interaction">
              <i /><span>PROPOSED / SIMULATED</span><small>ASSESSMENT IN PROGRESS</small>
              <h3>While the serious work happens</h3>
              <p>I can explain the open question, prepare your next conversation, or simply keep you updated.</p>
              <div className="aj-phone-choice">Prepare my questions <i>↗</i></div>
              <div className="aj-phone-choice">Explain what happens next <i>↗</i></div>
              <div className="aj-phone-input">Ask what can happen while you wait… <b>↑</b></div>
            </div>
          </div>
          <figure className="aj-photo aj-photo-parts" data-parallax><Image src="https://journeys.assembl.co.nz/assembl-car-flatlay.png" alt="Classic car parts arranged as a complete system" width={1600} height={1000} unoptimized /><figcaption>SCATTERED INPUTS / ONE REVIEWABLE OBJECT</figcaption></figure>
          <blockquote><span>THE CUSTOMER PROMISE</span><p>“Do something useful with this moment, without taking the moment away from me.”</p></blockquote>
        </section>

        <section className="aj-panel aj-signature" aria-label="The assembl interval signature object">
          <article className="aj-signature-copy"><span>THE ASSEMBL SIGNATURE / INTERVAL 01</span><h2>The<br />interval<span>·</span></h2><p>Context, permission, runtime, specialists and the active wait assemble around an intentionally open human centre. Proof lands last.</p><div><i />THE SYSTEM MOVES / THE PERSON REMAINS IN CONTROL</div></article>
          <div className="aj-assembly-stage">
            <div className="aj-assembly-grid" />
            <div className="aj-assembly-orbits"><i /><i /><i /></div>
            {assemblyParts.map(([label, x, y, rotation], index) => {
              const lock = label === 'proof' ? Math.max(0, Math.min(1, (assemblyProgress - 0.66) / 0.34)) : Math.max(0, Math.min(1, assemblyProgress / 0.78));
              return <div key={label} className={`aj-assembly-part part-${index + 1}`} style={{ transform: `translate3d(${x * (1 - lock)}px, ${y * (1 - lock)}px, ${index * 7}px) rotate(${rotation * (1 - lock)}deg)` }}><span>{label}</span><i /></div>;
            })}
            <div className="aj-assembly-core"><span>CUSTOMER</span><b>OPEN</b></div>
            <div className="aj-assembly-state"><span>{assemblyProgress > 0.95 ? 'PROOF LOCKED / HUMAN CENTRE OPEN' : assemblyProgress > 0.66 ? 'PROOF ARRIVING LAST' : assemblyProgress > 0.12 ? 'ASSEMBLING THE INTERVAL' : 'SIX COMPONENTS LAID OUT'}</span><strong>{Math.round(assemblyProgress * 100).toString().padStart(2, '0')}%</strong></div>
          </div>
          <div className="aj-signature-marquee"><span>CONTEXT</span><span>PERMISSION</span><span>RUNTIME</span><span>SPECIALISTS</span><span>ACTIVE WAIT</span><span>PROOF</span></div>
        </section>

        <section className="aj-panel aj-system" id="system">
          <article className="aj-system-copy"><span>03 / THE WORKING SYSTEM</span><h2>Everything needed.<br />Nothing magical.</h2><p>One reusable architecture underneath. A distinctly client-native product on the surface.</p></article>
          <div className="aj-architecture">{architecture.map(([number, title, body]) => <article key={title}><span>{number}</span><h3>{title}</h3><p>{body}</p><i /></article>)}</div>
          <div className="aj-system-marquee"><span>ASSEMBLE</span><span>EXPLAIN</span><span>PREPARE</span><span>PROVE</span></div>
        </section>

        <section className="aj-panel aj-modes">
          <div className="aj-modes-title"><span>04 / THREE MODES</span><h2>Value inside a real wait.</h2></div>
          <article><span>01 / LIVE</span><h3>Useful work while the process runs.</h3><p>Explain, gather, compare and prepare. No reward required.</p><b>COMPLETION / CLARITY / LOWER SERVICE LOAD</b></article>
          <article><span>02 / REWARDED</span><h3>Value back for useful participation.</h3><p>Reward comprehension or readiness, never pressured attention or disclosure.</p><b>OPTIONAL / PROPORTIONATE / DECISION-NEUTRAL</b></article>
          <article><span>03 / SPONSORED</span><h3>A partner funds the help, never the answer.</h3><p>Labelled utility, structurally separated from the customer outcome.</p><b>GOVERNED / RELEVANT / CUSTOMER-CONTROLLED</b></article>
          <div className="aj-mode-signal"><i /><span>THE WAIT IS REAL</span><strong>THE VALUE SHOULD BE TOO</strong></div>
        </section>

        <section className="aj-panel aj-pilot" id="pilot">
          <figure className="aj-photo aj-photo-pilot" data-parallax><Image src="https://journeys.assembl.co.nz/assembl-car-flatlay.png" alt="An ordered field of mechanical parts ready to become a whole" width={1600} height={1000} unoptimized /><figcaption>START WITH ONE COMPLETE SYSTEM</figcaption></figure>
          <article className="aj-pilot-copy"><span>05 / ACTIVE JOURNEY SPRINT</span><h2>Begin with one wait that matters.</h2><p>Build the smallest emotionally complete journey. Use demonstration data, put named people at every consequential gate and measure whether the next step becomes faster, clearer and better evidenced.</p></article>
          <ol><li><span>01</span><strong>Find the moment</strong><p>One trigger, owner, clock and customer harm.</p></li><li><span>02</span><strong>Compose the work</strong><p>Permitted context, bounded jobs and human gates.</p></li><li><span>03</span><strong>Run in shadow</strong><p>Compare prepared work with real team decisions.</p></li><li><span>04</span><strong>Prove the change</strong><p>Time, clarity, completion, trust and evidence quality.</p></li></ol>
          <div className="aj-commercial"><span>FIRST OFFER</span><strong>A branded demonstrator and evidence-backed pilot plan</strong><small>Two to four weeks / fixed scope / fixed price</small></div>
        </section>

        <section className="aj-panel aj-contact" id="contact">
          <div className="aj-contact-dot">·</div><span>ASSEMBL / AOTEAROA NEW ZEALAND</span>
          <h2>Choose the journey your customer should not have to endure.</h2>
          <p>We will turn one real interval into a working, permissioned product demonstrator and a measurable enterprise pilot.</p>
          <a href="mailto:assembl@assembl.co.nz?subject=An%20active%20customer%20journey%20pilot">Start with one journey <i>↗</i></a>
          <small>Client concepts remain separate, direct-link proposals until implemented and verified.</small>
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
