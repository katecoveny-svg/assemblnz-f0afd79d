'use client';

import type { PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HomeGuidePhone } from '@/components/site/HomeGuidePhone';
import { HomeLiveData } from '@/components/site/HomeLiveData';
import { AgentCube } from '@/components/site/AgentCube';
import { HOME_AGENTS } from '@/lib/home/agent-roster';

const destinations = [
  ['start', 'Start'],
  ['live-agent', 'Live agent'],
  ['agents', 'Agents'],
  ['tools', 'Tools'],
  ['live-data', 'Live data'],
  ['contact', 'Contact'],
] as const;

/**
 * Where a panel sits along the track, in the track's own scroll coordinates.
 *
 * The panels carry a viewport-driven `zoom` (app/active-journey-home.css) so the
 * fixed-pixel artboards scale up on large displays. `offsetLeft` and
 * `offsetWidth` report a zoomed element's geometry in its own scaled-up
 * coordinate space, not the track's, so they under-report position by the zoom
 * factor. Rendered rectangles do not — measure with those instead.
 */
const trackOffset = (track: HTMLElement, target: HTMLElement) =>
  track.scrollLeft + target.getBoundingClientRect().left - track.getBoundingClientRect().left;

export function ActiveJourneyHome() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, x: 0, left: 0 });
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const desktop = window.matchMedia('(min-width: 761px)');

    const update = () => {
      const distance = track.scrollWidth - track.clientWidth;
      setProgress(distance > 0 ? track.scrollLeft / distance : 0);
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
      if (event.key === 'ArrowRight') track.scrollBy({ left: track.clientWidth * 0.6, behavior: 'smooth' });
      if (event.key === 'ArrowLeft') track.scrollBy({ left: -track.clientWidth * 0.6, behavior: 'smooth' });
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
    track.scrollTo({ left: trackOffset(track, target), behavior: 'smooth' });
  };

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // The cube does its own dragging and needs the pointer. If the track grabs it
    // first — it calls setPointerCapture — the canvas never sees the pointerup,
    // so turning the cube scrolls the page and tapping a tile does nothing.
    if (
      !window.matchMedia('(min-width: 761px)').matches ||
      (event.target as HTMLElement).closest('a,button,canvas,[data-owns-pointer]')
    ) {
      return;
    }
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
          <a href="/generative-studio">Generative studio <i>↗</i></a>
          <a href="mailto:assembl@assembl.co.nz?subject=One%20useful%20customer%20wait">Discuss one wait <i>↗</i></a>
          <a className="aj-operator" href="/admin/login" rel="nofollow">Operator <i>↗</i></a>
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
            <p>
              assembl turns a real wait into a useful part of the customer journey — one helpful
              action, the customer&rsquo;s permission, a named person who reviews it.{' '}
              <Link href="/how-it-works">See how it works <b>&#8599;</b></Link>
            </p>
            <a className="aj-studio-promo" href="/generative-studio">
              <strong>Describe it. Watch it assembl.</strong>
              <small>40 generative engines &middot; one brand</small>
              <i aria-hidden="true">&#8599;</i>
            </a>
          </div>
        </section>

        <section className="aj-panel aj-live" id="live-agent">
          <article className="aj-live-copy">
            <span>02 / TALK TO ONE</span>
            <h2>A real agent, on a real phone.</h2>
            <p>
              This one is live. Ask it what assembl is, or swap it for any of the{' '}
              {HOME_AGENTS.length} specialists and ask that one what it does.
            </p>
          </article>
          <div className="aj-phone-wrap">
            <HomeGuidePhone />
          </div>
        </section>

        <section className="aj-panel aj-agents" id="agents">
          <div className="aj-agents-copy">
            <span>03 / THE AGENTS</span>
            <h2>{HOME_AGENTS.length} agents. Turn it.</h2>
            <p>
              Specialists, not one assistant. Each states what it does and where a person stays in
              control. Every square is drawn from the agent&rsquo;s own record, so nothing here can
              drift from what it really does.
            </p>
            <small>DRAG THE CUBE &middot; PICK ONE &middot; IT TAKES OVER THE PHONE</small>
          </div>
          <AgentCube />
        </section>

        <section className="aj-panel aj-tools" id="tools">
          <div className="aj-tools-head">
            <span>04 / USE SOMETHING TODAY</span>
            <h2>Two you can use right now.</h2>
            <p>
              Both are free to try and neither needs a sales call. They exist because AI should be
              worth something to a business before anyone signs anything.
            </p>
          </div>

          <a className="aj-tool" href="/ai-ready">
            <span>FREE / FOR YOUR BUSINESS</span>
            <h3>AI-ready audit</h3>
            <p>
              A live agent reads your public website and drafts the customer journey it would build
              for you &mdash; your words, your colours, your gaps.
            </p>
            <b>Check your site <i aria-hidden="true">&#8599;</i></b>
          </a>

          <a className="aj-tool" href="/bills">
            <span>FREE / FOR YOUR HOUSEHOLD</span>
            <h3>assembl bills</h3>
            <p>
              Drop in a power, broadband or insurance bill and it reads what you actually pay, then
              finds cheaper NZ plans. It recommends. You decide whether to switch.
            </p>
            <b>Open assembl bills <i aria-hidden="true">&#8599;</i></b>
          </a>

          <div className="aj-tools-ask">
            <span>OR JUST TELL US</span>
            <a
              className="aj-ask-btn"
              href="mailto:assembl@assembl.co.nz?subject=What%20problem%20I%27d%20like%20solved&body=The%20problem%3A%0A%0AWhere%20my%20customers%20wait%3A%0A%0AMy%20name%20and%20organisation%3A%0A"
            >
              What problem would you like solved? <i aria-hidden="true">&#8599;</i>
            </a>
            <small>Goes straight to Kate at assembl@assembl.co.nz. A person reads every one.</small>
          </div>
        </section>

        <HomeLiveData />

        <section className="aj-panel aj-contact" id="contact">
          <div className="aj-contact-dot">&middot;</div><span>ASSEMBL / AOTEAROA NEW ZEALAND</span>
          <h2>Show us where customers wait.</h2>
          <p>We will turn one real wait into a useful agentic customer journey, with a prepared human handoff and a clear record of what happened.</p>
          <a href="mailto:assembl@assembl.co.nz?subject=One%20useful%20customer%20wait">Discuss one wait <i>&#8599;</i></a>
          <small>Demonstrators use simulated data. Production work requires agreed sources, permissions, security and human review.</small>
        </section>
      </div>

      <footer className="aj-footer">
        <nav aria-label="assembl story navigation">{destinations.map(([id, label], index) => <button key={id} onClick={() => goTo(id)}><span>0{index + 1}</span>{label}</button>)}</nav>
        <div className="aj-progress"><i style={{ transform: `scaleX(${progress})` }} /></div>
        <button className="aj-next" onClick={() => trackRef.current?.scrollBy({ left: (trackRef.current?.clientWidth ?? window.innerWidth) * (window.matchMedia('(min-width: 761px)').matches ? 0.7 : 1), behavior: 'smooth' })}>SIDE SCROLL <i>→</i></button>
      </footer>
    </div>
  );
}
