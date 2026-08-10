'use client';

import type { PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const architecture = [
  { number: '01', title: 'Approved context', body: 'The organisation’s confirmed rules, services, language and sources.', href: '/genome', link: 'See the Business Genome' },
  { number: '02', title: 'Journey rules', body: 'The event that opens the wait, the useful action, permissions and handoff.', href: '/how-it-works', link: 'See how a journey is designed' },
  { number: '03', title: 'Process status', body: 'The state and timing of the real process.', href: '/journeys', link: 'Explore active journeys' },
  { number: '04', title: 'Specialist task', body: 'One bounded job with a stated purpose and limit.', href: '/agents', link: 'Meet the specialist agents' },
  { number: '05', title: 'Customer moment', body: 'Status, an optional choice, review and control.', href: '/experience', link: 'See the customer experience' },
  { number: '06', title: 'Evidence pack', body: 'A record of sources, permissions, changes, approval and handoff.', href: '/evidence-pack', link: 'Open the evidence pack' },
];

const destinations = [
  ['start', 'Start'],
  ['product', 'Product'],
  ['system', 'System'],
  ['pilot', 'Pilot'],
  ['contact', 'Contact'],
] as const;

const assemblyParts = [
  { key: 'trigger', label: 'Trigger', value: 'Application submitted', meta: '09:42 / confirmed', x: -330, y: -160, rotation: -12, left: 35, top: 29 },
  { key: 'permission', label: 'Permission', value: 'Check approved documents', meta: 'customer approved', x: 320, y: -170, rotation: 11, left: 65, top: 29 },
  { key: 'task', label: 'Prepared work', value: 'Missing item identified', meta: 'bounded task', x: -360, y: 45, rotation: 8, left: 35, top: 49 },
  { key: 'customer', label: 'Customer choice', value: 'Questions added', meta: 'editable', x: 355, y: 30, rotation: -9, left: 65, top: 49 },
  { key: 'review', label: 'Named review', value: 'Lending specialist', meta: 'person responsible', x: -280, y: 230, rotation: 13, left: 35, top: 69 },
  { key: 'evidence', label: 'Evidence', value: 'Sources and edits recorded', meta: 'proof attached', x: 290, y: 225, rotation: -14, left: 65, top: 69 },
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
        if (desktop.matches) {
          const start = signature.offsetLeft - track.clientWidth * 0.62;
          const end = signature.offsetLeft + signature.offsetWidth * 0.48;
          setAssemblyProgress(Math.max(0, Math.min(1, (track.scrollLeft - start) / Math.max(1, end - start))));
        } else {
          const rect = signature.getBoundingClientRect();
          const start = window.innerHeight * 0.82;
          const end = window.innerHeight * 0.08;
          setAssemblyProgress(Math.max(0, Math.min(1, (start - rect.top) / Math.max(1, start - end))));
        }
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
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('keydown', keyboard);
    window.addEventListener('resize', update, { passive: true });
    return () => {
      track.removeEventListener('scroll', update);
      track.removeEventListener('wheel', wheel);
      window.removeEventListener('scroll', update);
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
            <Image src="/img/home/assembl-journey-folio-flatlay.png" alt="Customer-approved journey pieces arranged beside one complete review folio" width={1536} height={960} priority />
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
            <Image src="/img/home/assembl-journey-folio-flatlay.png" alt="A prepared customer brief held inside its evidence folio" width={1536} height={960} />
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
          <figure className="aj-review-flatlay" aria-label="A customer-approved application is assembled into a reviewable brief">
            <Image src="/img/home/assembl-phone-journey-aperture.png" alt="Approved journey pieces move through one customer choice on a phone and emerge as a review folio" width={1536} height={960} />
            <figcaption>FROM CUSTOMER INPUT / THROUGH ONE CHOICE / TO HUMAN REVIEW</figcaption>
          </figure>
          <blockquote><span>CUSTOMER VALUE</span><p>Less uncertainty. Less repetition. A better-prepared next step.</p></blockquote>
        </section>

        <section className="aj-panel aj-signature" aria-label="The assembl interval signature object">
          <article className="aj-signature-copy"><span>THE SIX PARTS OF A USEFUL WAIT</span><h2>The wait,<br />assembled<span>·</span></h2><p>A real event opens the moment. The customer gives permission. assembl prepares one bounded piece of work. A named person reviews it. The result and evidence move into the next step.</p><div><i />ASSEMBL PREPARES / A PERSON DECIDES</div></article>
          <div className="aj-assembly-stage" aria-label="Six journey parts assembling into an application review brief">
            <div className="aj-assembly-grid" />
            <div className="aj-folio-shell" aria-hidden="true"><span>PREPARED FOR REVIEW</span><h3>Application review brief</h3><p>The information the customer approved, ready for the person responsible.</p><div><small>OWNER</small><b>Lending specialist</b></div></div>
            {assemblyParts.map((part, index) => {
              const lock = part.key === 'evidence' ? Math.max(0, Math.min(1, (assemblyProgress - 0.66) / 0.34)) : Math.max(0, Math.min(1, assemblyProgress / 0.78));
              return <div key={part.key} className={`aj-assembly-part part-${index + 1}`} style={{ left: `${part.left}%`, top: `${part.top}%`, transform: `translate3d(calc(-50% + ${part.x * (1 - lock)}px), calc(-50% + ${part.y * (1 - lock)}px), ${index * 7}px) rotate(${part.rotation * (1 - lock)}deg)` }}><span>{part.label}</span><strong>{part.value}</strong><small>{part.meta}</small></div>;
            })}
            <div className="aj-assembly-state"><span>{assemblyProgress > 0.95 ? 'READY FOR HUMAN REVIEW' : assemblyProgress > 0.66 ? 'ADDING THE EVIDENCE RECORD' : assemblyProgress > 0.12 ? 'PREPARING THE NEXT STEP' : 'SIX PARTS / ONE USEFUL WAIT'}</span><strong>{Math.round(assemblyProgress * 100).toString().padStart(2, '0')}%</strong></div>
          </div>
          <div className="aj-signature-marquee"><span>context</span><span>permission</span><span>status</span><span>task</span><span>customer</span><span>evidence</span></div>
        </section>

        <section className="aj-panel aj-system" id="system">
          <article className="aj-system-copy"><span>03 / HOW IT WORKS</span><h2>The same controls beneath every customer experience.</h2><p>The language and interface change for each organisation. The safeguards do not: approved context, clear permission, bounded work, named review and a visible evidence record.</p></article>
          <div className="aj-architecture">{architecture.map((item) => <Link key={item.title} href={item.href} aria-label={`${item.title}. ${item.link}`}><span>{item.number}</span><h3>{item.title}</h3><p>{item.body}</p><small>{item.link} <b>↗</b></small><i /></Link>)}</div>
          <div className="aj-system-marquee"><span>event</span><span>permission</span><span>preparation</span><span>review</span><span>handoff</span><span>evidence</span></div>
        </section>

        <section className="aj-panel aj-modes">
          <div className="aj-modes-title"><span>04 / THREE MODES</span><h2>Three ways to make a real wait useful.</h2></div>
          <article><span>01 / LIVE</span><h3>Prepare the next step while the process runs.</h3><p>Explain status, collect missing information or prepare a reviewable output. No reward or sponsor is needed.</p><b>CLEARER STATUS / BETTER HANDOFF / LESS REWORK</b></article>
          <article><span>02 / REWARDED</span><h3>Recognise useful, optional participation.</h3><p>The organisation may provide value when a customer completes something that helps their own next step.</p><b>OPTIONAL / FAIR / EASY TO DECLINE</b></article>
          <article><span>03 / SPONSORED</span><h3>A partner may fund the help, not the outcome.</h3><p>The sponsor is named, sharing is optional and the primary service does not change.</p><b>DISCLOSED / USEFUL / CUSTOMER-CONTROLLED</b></article>
          <div className="aj-mode-signal"><i /><span>THE WAIT IS REAL</span><strong>THE WORK MUST BE USEFUL</strong></div>
        </section>

        <section className="aj-panel aj-pilot" id="pilot">
          <figure className="aj-pilot-contact-sheet" aria-label="A four-step active journey sprint from wait to measured handoff"><div><span>01</span><b>REAL WAIT</b><p>Application under review</p></div><div><span>02</span><b>USEFUL TASK</b><p>Check one missing item</p></div><div><span>03</span><b>NAMED REVIEW</b><p>Lending specialist</p></div><div><span>04</span><b>VISIBLE PROOF</b><p>Sources and edits recorded</p></div><figcaption>ONE WAIT / ONE COMPLETE PILOT</figcaption></figure>
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
