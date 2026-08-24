'use client';

import type { PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const architecture = [
  { number: '01', title: 'Approved sources', body: 'Only the organisation’s approved rules, service information and sources.', href: '/genome', link: 'See approved context' },
  { number: '02', title: 'Real wait', body: 'The event and live status that open the customer moment.', href: '/journeys', link: 'See example waits' },
  { number: '03', title: 'Customer permission', body: 'What the customer lets assembl use now, remember for later, save or share.', href: '/experience', link: 'See customer controls' },
  { number: '04', title: 'Prepared task', body: 'One limited job, such as checking a document or preparing questions.', href: '/agents', link: 'See prepared tasks' },
  { number: '05', title: 'Named reviewer', body: 'The person who receives the brief and remains responsible.', href: '/how-it-works', link: 'See the human handoff' },
  { number: '06', title: 'Evidence record', body: 'Sources, permissions, customer changes, reviewer and outcome.', href: '/evidence-pack', link: 'Open an evidence pack' },
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
  { key: 'customer', label: 'Customer choice', value: 'Preference and questions added', meta: 'approved and editable', x: 355, y: 30, rotation: -9, left: 65, top: 49 },
  { key: 'review', label: 'Named review', value: 'Lending specialist', meta: 'person responsible', x: -280, y: 230, rotation: 13, left: 35, top: 69 },
  { key: 'evidence', label: 'Evidence', value: 'Sources and edits recorded', meta: 'proof attached', x: 290, y: 225, rotation: -14, left: 65, top: 69 },
] as const;

export function ActiveJourneyHome() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, x: 0, left: 0 });
  const [progress, setProgress] = useState(0);
  // A completed proof is the truthful SSR/no-JavaScript baseline. Capable clients
  // progressively enhance it into the scroll-led assembly below.
  const [assemblyProgress, setAssemblyProgress] = useState(1);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const desktop = window.matchMedia('(min-width: 761px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => {
      const distance = track.scrollWidth - track.clientWidth;
      setProgress(distance > 0 ? track.scrollLeft / distance : 0);
      const signature = track.querySelector<HTMLElement>('.aj-signature');
      if (signature) {
        if (reducedMotion.matches) {
          setAssemblyProgress(1);
        } else {
          const start = signature.offsetLeft - track.clientWidth * 0.62;
          const end = signature.offsetLeft + signature.offsetWidth * 0.48;
          setAssemblyProgress(Math.max(0, Math.min(1, (track.scrollLeft - start) / Math.max(1, end - start))));
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
    track.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
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
        <nav aria-label="assembl tools and contact">
          <a href="https://make-with-assembl.katecoveny.chatgpt.site">assembl with assembl <i>↗</i></a>
          <a href="mailto:assembl@assembl.co.nz?subject=One%20useful%20customer%20wait">Discuss one wait <i>↗</i></a>
        </nav>
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
          <div className="aj-opening-label"><span>AGENTIC CUSTOMER JOURNEYS</span><strong>APPLICATIONS / ORDERS / CLAIMS</strong></div>
          <div className="aj-opening-signal"><span>A CUSTOMER IS WAITING</span><i /><p>Their next step can be prepared now.</p></div>
          <figure className="aj-photo aj-photo-opening" data-parallax>
            <Image src="/img/home/assembl-journey-folio-flatlay.png" alt="Customer-approved journey pieces arranged beside one complete review folio" width={1536} height={960} priority />
            <figcaption>TRIGGER / PERMISSION / PREPARATION / REVIEW / PROOF</figcaption>
          </figure>
          <h1><span>Make the wait</span><span>useful.</span></h1>
          <div className="aj-opening-note">
            <span>SCROLL / DRAG</span>
            <p>assembl turns a real wait into a useful part of the customer journey. The customer can complete one helpful action, receive agreed value where appropriate and approve what the service team uses next.</p>
            <a className="aj-studio-promo" href="https://make-with-assembl.katecoveny.chatgpt.site">
              <strong>Describe it. Watch it assembl.</strong>
              <small>one direction · living field · remix</small>
              <i aria-hidden="true">↗</i>
            </a>
          </div>
        </section>

        <section className="aj-panel aj-product" id="product">
          <div className="aj-plum-cell"><span>THIS IS</span><strong>assembl</strong><i>·</i></div>
          <article className="aj-product-copy">
            <span>01 / USEFUL AGENTIC CUSTOMER JOURNEYS</span>
            <h2>A useful wait can prepare better service.</h2>
            <p>The customer can check a document, add a preference or prepare questions. assembl turns that approved information into one brief and, where the customer agrees, knowledge the team can use to make future service more relevant.</p>
          </article>
          <figure className="aj-photo aj-photo-detail" data-parallax>
            <Image src="/img/home/assembl-journey-folio-flatlay.png" alt="A prepared customer brief held inside its evidence folio" width={1536} height={960} />
            <figcaption>APPROVED CONTEXT / PERMISSIONS / HANDOFF</figcaption>
          </figure>
          <div className="aj-boundary"><span>THE RESULT</span><strong>Relevant service. Ready for review.</strong><p>The customer sees what was used and can change, remove or limit what is remembered before anything is shared.</p></div>
          <div className="aj-proof-strip"><span>REAL WAIT</span><i>→</i><span>CUSTOMER CHOICE</span><i>→</i><span>PREPARED BRIEF</span><i>→</i><span>NAMED REVIEW</span><i>→</i><span>RECORD</span></div>
        </section>

        <section className="aj-panel aj-live">
          <article className="aj-live-copy">
            <span>02 / ONE WAIT IN ACTION</span>
            <h2>The team is reviewing the application.</h2>
            <p>The customer checks a missing document and adds questions. assembl puts both into one brief. The lending specialist reviews it.</p>
            <div><b>01</b> Check what is missing</div><div><b>02</b> Add the customer’s questions</div><div><b>03</b> Review and share one brief</div>
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
          <blockquote><span>CUSTOMER AND TEAM VALUE</span><p>Fewer follow-up calls. A better first conversation.</p></blockquote>
        </section>

        <section className="aj-panel aj-signature" aria-label="The assembl interval signature object">
          <article className="aj-signature-copy"><span>WHAT MOVES INTO THE NEXT STEP</span><h2>One brief.<br />Six checks<span>·</span></h2><p>assembl records the wait, customer permission, prepared work, customer changes, named reviewer and evidence. Nothing moves until the customer can review it.</p><div><i />ASSEMBL PREPARES / THE SPECIALIST REVIEWS</div></article>
          <div className="aj-assembly-stage" aria-label="Six journey parts assembling into an application review brief">
            <div className="aj-assembly-grid" />
            <div className="aj-folio-shell" aria-hidden="true"><span>PREPARED FOR REVIEW</span><h3>Application review brief</h3><p>The information the customer approved, ready for the person responsible.</p><div><small>OWNER</small><b>Lending specialist</b></div></div>
            {assemblyParts.map((part, index) => {
              const lock = part.key === 'evidence' ? Math.max(0, Math.min(1, (assemblyProgress - 0.66) / 0.34)) : Math.max(0, Math.min(1, assemblyProgress / 0.78));
              return <div key={part.key} className={`aj-assembly-part part-${index + 1}`} style={{ left: `${part.left}%`, top: `${part.top}%`, transform: `translate3d(calc(-50% + ${part.x * (1 - lock)}px), calc(-50% + ${part.y * (1 - lock)}px), ${index * 7}px) rotate(${part.rotation * (1 - lock)}deg)` }}><span>{part.label}</span><strong>{part.value}</strong><small>{part.meta}</small></div>;
            })}
            <div className="aj-assembly-state"><span>{assemblyProgress > 0.95 ? 'READY FOR HUMAN REVIEW' : assemblyProgress > 0.66 ? 'ADDING THE EVIDENCE RECORD' : assemblyProgress > 0.12 ? 'PREPARING THE NEXT STEP' : 'SIX PARTS / ONE USEFUL WAIT'}</span><strong>{Math.round(assemblyProgress * 100).toString().padStart(2, '0')}%</strong></div>
          </div>
          <div className="aj-signature-marquee"><span>wait</span><span>permission</span><span>task</span><span>customer review</span><span>named owner</span><span>record</span></div>
        </section>

        <section className="aj-panel aj-system" id="system">
          <article className="aj-system-copy"><span>03 / SIX CHECKS</span><h2>Six checks in every journey.</h2><p>The client experience can look different. The controls stay the same: approved sources, a real wait, customer permission, a limited task, a named reviewer and a record of what happened.</p></article>
          <div className="aj-architecture">{architecture.map((item) => <Link key={item.title} href={item.href} aria-label={`${item.title}. ${item.link}`}><span>{item.number}</span><h3>{item.title}</h3><p>{item.body}</p><small>{item.link} <b>↗</b></small><i /></Link>)}</div>
          <div className="aj-system-marquee"><span>event</span><span>permission</span><span>preparation</span><span>review</span><span>handoff</span><span>evidence</span></div>
        </section>

        <section className="aj-panel aj-modes">
          <div className="aj-modes-title"><span>04 / THREE OPTIONS</span><h2>Three ways to make a wait useful.</h2></div>
          <article><span>01 / LIVE</span><h3>Help the customer prepare.</h3><p>Explain the status, check missing information or learn one useful preference. Approved input helps the team provide a more personalised and relevant next step.</p><b>CLEAR STATUS / ONE TASK / NAMED HANDOFF</b></article>
          <article><span>02 / REWARDED</span><h3>Return value for useful input.</h3><p>With an agreed programme, an optional action can earn loyalty points, a credit on a bill or another clear benefit. Declining does not change the primary service.</p><b>OPTIONAL / AGREED VALUE / EASY TO DECLINE</b></article>
          <article><span>03 / SPONSORED</span><h3>Let a partner fund practical help.</h3><p>Name the partner and what it funds. Sharing is optional. The sponsor never controls the customer’s outcome.</p><b>DISCLOSED / USEFUL / CUSTOMER-CONTROLLED</b></article>
          <div className="aj-mode-signal"><i /><span>THE WAIT IS REAL</span><strong>VALUE FOR THE CUSTOMER / RELEVANCE FOR THE BUSINESS</strong></div>
        </section>

        <section className="aj-panel aj-pilot" id="pilot">
          <figure className="aj-pilot-contact-sheet" aria-label="A four-step active journey sprint from wait to measured handoff"><div><span>01</span><b>REAL WAIT</b><p>Application under review</p></div><div><span>02</span><b>USEFUL TASK</b><p>Check one missing item</p></div><div><span>03</span><b>NAMED REVIEW</b><p>Lending specialist</p></div><div><span>04</span><b>VISIBLE PROOF</b><p>Sources and edits recorded</p></div><figcaption>ONE WAIT / ONE COMPLETE PILOT</figcaption></figure>
          <article className="aj-pilot-copy"><span>05 / FIRST PILOT</span><h2>Start with one wait.</h2><p>Pick one customer wait and one useful task. We build the customer interaction, the reviewer handoff and the evidence record. Then we test whether it improves the journey.</p></article>
          <ol><li><span>01</span><strong>Name the wait</strong><p>Choose the process, trigger and usual duration.</p></li><li><span>02</span><strong>Choose the task</strong><p>Decide what assembl prepares and what it cannot do.</p></li><li><span>03</span><strong>Name the reviewer</strong><p>Choose the person responsible for the next step.</p></li><li><span>04</span><strong>Measure the result</strong><p>Compare clarity, completion, team effort and customer control.</p></li></ol>
          <div className="aj-commercial"><span>FIRST ENGAGEMENT</span><strong>A working customer interaction and pilot plan</strong><small>Two to four weeks / fixed scope / fixed price</small></div>
        </section>

        <section className="aj-panel aj-contact" id="contact">
          <div className="aj-contact-dot">·</div><span>ASSEMBL / AOTEAROA NEW ZEALAND</span>
          <h2>Show us where customers wait.</h2>
          <p>We will turn one real wait into a useful agentic customer journey, with an optional value exchange, a prepared human handoff and a clear record of what happened.</p>
          <a href="mailto:assembl@assembl.co.nz?subject=One%20useful%20customer%20wait">Discuss one wait <i>↗</i></a>
          <small>Demonstrators use simulated data. Production work requires agreed sources, permissions, security and human review.</small>
        </section>
      </div>

      <footer className="aj-footer">
        <nav aria-label="assembl story navigation">{destinations.map(([id, label], index) => <button key={id} onClick={() => goTo(id)}><span>0{index + 1}</span>{label}</button>)}</nav>
        <div className="aj-progress"><i style={{ transform: `scaleX(${progress})` }} /></div>
        <button className="aj-next" onClick={() => trackRef.current?.scrollBy({ left: window.matchMedia('(min-width: 761px)').matches ? Math.min(720, window.innerWidth * 0.65) : (trackRef.current?.clientWidth ?? window.innerWidth), behavior: 'smooth' })}>SIDE SCROLL <i>→</i></button>
      </footer>
    </div>
  );
}
