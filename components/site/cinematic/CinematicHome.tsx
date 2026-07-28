'use client';

import { useEffect, useRef, useState } from 'react';
import { CineFooter } from './CineFooter';
import { BlueprintStart } from './BlueprintStart';
import { WaitState } from './WaitState';
import { HOME_FAQ } from './faq';
import { mountJourneyScene, JOURNEY_STAGES } from './journey-scene';

/**
 * assembl homepage — Kate's cinematic prototype, ported 1:1.
 *
 * Source of truth: ~/assembl-3d-gallery/index.html + assembl3d.js
 * (Kate's own build, 2026-07-24). All copy is hers, verbatim. The three.js
 * scene is kept IMPERATIVE, not translated to R3F, so it renders exactly as
 * her prototype does: one persistent assembly (navy identity core, chrome
 * band, glass boundary shell, orbiting components, brass evaluation ring,
 * luminous connectors) fixed behind the page; every scroll section lights
 * its own component.
 *
 * Link mapping from the prototype's flat files to app routes:
 *   agent-builder.html → /build-an-agent
 *   pricing.html       → /pricing
 *   mailto kiaora@     → assembl@assembl.co.nz (canonical reply inbox)
 */
export type HomeStats = {
  /** every agent on the live roster */
  agents: number;
  /** industry packs on /agents */
  packs: number;
  /** sectors walked end to end on /concepts */
  sectors: number;
};

export function CinematicHome({ stats }: { stats: HomeStats }) {
  const rootRef = useRef<HTMLDivElement>(null);

  // ── LIVE AGENT DEMO ── a real Claude call via /api/build-agent, streamed.
  // Drafts only; nothing sends. The config is a sensible default agent.
  const [demoQ, setDemoQ] = useState('');
  const [demoA, setDemoA] = useState('');
  const [demoBusy, setDemoBusy] = useState(false);
  async function askAgent() {
    const question = demoQ.trim();
    if (!question || demoBusy) return;
    setDemoBusy(true);
    setDemoA('');
    try {
      const res = await fetch('/api/build-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          config: {
            name: 'assembl demo agent',
            business: 'a New Zealand small business',
            modelTier: 'mid',
            memoryScope: 'session',
            tools: ['calendar', 'web-search'],
            knowledge: [],
            voice: 'Warm, plain-spoken. Never invents prices.',
            guardrails: ['cite-sources', 'no-personal-data'],
          },
        }),
      });
      if (!res.ok || !res.body) {
        setDemoA('The agent is resting — try again in a moment.');
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setDemoA(acc);
      }
    } catch {
      setDemoA('The agent is resting — try again in a moment.');
    } finally {
      setDemoBusy(false);
    }
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasHover = matchMedia('(hover: hover)').matches;
    const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel);
    const $$ = <T extends HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));
    const cleanups: Array<() => void> = [];
    const on = (t: EventTarget, e: string, fn: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) => {
      t.addEventListener(e, fn, opts);
      cleanups.push(() => t.removeEventListener(e, fn));
    };

    // ── CUSTOM CURSOR + POINTER GLOW ──
    const cursor = $('#cine-cursor')!;
    const sceneGlow = $('#cine-scene-glow')!;
    on(document, 'mousemove', (ev) => {
      const e = ev as MouseEvent;
      cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px';
      sceneGlow.style.left = e.clientX + 'px'; sceneGlow.style.top = e.clientY + 'px';
    });
    $$('a, button, .timeline-dot').forEach((el) => {
      on(el, 'mouseenter', () => cursor.classList.add('hovering'));
      on(el, 'mouseleave', () => cursor.classList.remove('hovering'));
    });

    // ── MAGNETIC BUTTONS ──
    if (!reducedMotion && hasHover) {
      $$('.btn, .nav-cta').forEach((btn) => {
        on(btn, 'mousemove', (ev) => {
          const e = ev as MouseEvent;
          const r = btn.getBoundingClientRect();
          const dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
          btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.3}px)`;
        });
        on(btn, 'mouseleave', () => { btn.style.transform = ''; });
      });
    }

    // ── PANEL TILT ──
    if (!reducedMotion && hasHover) {
      $$('.panel').forEach((p) => {
        on(p, 'mousemove', (ev) => {
          const e = ev as MouseEvent;
          const r = p.getBoundingClientRect();
          const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
          const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
          p.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        });
        on(p, 'mouseleave', () => { p.style.transform = ''; });
      });
    }

    // ── TEXT SCRAMBLE ──
    function scrambleText(el: HTMLElement, finalText: string) {
      if (reducedMotion) { el.textContent = finalText; return; }
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      let frame = 0;
      const queue = finalText.split('').map((char, i) => ({ char, start: i * 2, end: i * 2 + 20 }));
      (function update() {
        let output = '', complete = 0;
        queue.forEach((q) => {
          if (frame >= q.end) { output += q.char; complete++; }
          else if (frame >= q.start) output += chars[Math.floor(Math.random() * chars.length)];
          else output += ' ';
        });
        el.textContent = output;
        if (complete < queue.length) { frame++; requestAnimationFrame(update); }
      })();
    }
    const scrambleTimer = setTimeout(
      () => scrambleText($('#cine-scramble-1')!, '001 — agentic customer journeys — aotearoa new zealand'),
      400,
    );
    cleanups.push(() => clearTimeout(scrambleTimer));

    // ── VISUAL-QA JUMP ── ?jump=wait|demo|begin pulls a stage into the frame
    // for screenshot tooling. It does NOT scroll: any scrolled capture of this
    // page composites as a blank frame (headless and pane alike — the fixed
    // canvas plus a programmatic scroll defeats the rasteriser), and #hash
    // anchors additionally leave every reveal unfired. Pulling the body up
    // with a negative margin keeps scrollY at 0, which every capture engine
    // handles. Cost: the 3D reads scroll 0, so stills show the hero pose.
    const jump = new URLSearchParams(location.search).get('jump');
    if (jump) {
      const go = () => {
        $$('.reveal-left,.reveal-right,.reveal-fade').forEach((el) => el.classList.add('in'));
        $('#begin')?.classList.add('in-view');   // the finale words gate on their own observer
        const target = $(`#${jump}`);
        if (target) document.body.style.marginTop = `-${Math.max(0, target.offsetTop - 40)}px`;
      };
      setTimeout(go, 600);
      setTimeout(go, 1600);
    }

    // ── SCROLL REVEALS ──
    const io = new IntersectionObserver((es) => { es.forEach((e) => {
      if (e.isIntersecting) {
        const d = Number((e.target as HTMLElement).dataset.delay || 0);
        setTimeout(() => e.target.classList.add('in'), d);
        io.unobserve(e.target);
      }
    }); }, { threshold: 0.1 });
    $$('.reveal-left,.reveal-right,.reveal-fade').forEach((el) => {
      const d = el.dataset.delay || '';
      if (d) el.style.transitionDelay = d + 'ms';
      io.observe(el);
    });
    cleanups.push(() => io.disconnect());

    const finIO = new IntersectionObserver((es) => { es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); finIO.unobserve(e.target); }
    }); }, { threshold: 0.4 });
    finIO.observe($('#begin')!);
    cleanups.push(() => finIO.disconnect());

    // ── TIMELINE + PROGRESS HAIRLINE ──
    // This array and the timeline dots in the markup must stay the same
    // length. The 3D no longer indexes into it — journey-scene.ts reads scroll
    // progress directly — so a mismatch now only mis-lights a dot.
    const sections = ['#top', '#journey', '#wait', '#demo', '#begin'].map((s) => $(s)!);
    const dots = $$('.timeline-dot');
    const progressBar = $('#cine-progress')!;
    let currentStage = 0;
    function updateStage() {
      sections.forEach((s, i) => {
        const rect = s.getBoundingClientRect();
        if (rect.top < innerHeight * 0.5 && rect.bottom > innerHeight * 0.5 && currentStage !== i) {
          currentStage = i;
          dots.forEach((d, di) => d.classList.toggle('active', di === i));
        }
      });
      const max = document.body.scrollHeight - innerHeight;
      progressBar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    }
    on(window, 'scroll', updateStage, { passive: true });
    dots.forEach((dot) => on(dot, 'click', () =>
      $(dot.dataset.target!)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })));

    // The wait used to be a canned loop driven from here, against #cine-w-fill
    // and #cine-w-note. It is now <WaitState />, which owns its own timing and
    // is driven by the visitor rather than on a timer, so this ran on for a
    // while throwing on every tick against elements that no longer exist.

    // ════ 3D — THE JOURNEY ════════════════════════════════════════════════
    // The route through six stages of an agentic customer journey. Scroll
    // drives the camera down it; the scene owns everything else. See
    // journey-scene.ts for what it is made of.
    const canvas = $('#canvas-3d') as unknown as HTMLCanvasElement;
    const labelLayer = $('#journey-labels')!;

    let mx = 0, my = 0;
    on(document, 'mousemove', (ev) => {
      const e = ev as MouseEvent;
      mx = (e.clientX / innerWidth - 0.5) * 2;
      my = (e.clientY / innerHeight - 0.5) * 2;
    });

    // ?prog=0…1 pins the camera at a point on the route without scrolling.
    // Same reason ?jump exists: any scrolled capture of this page composites
    // as a blank frame, because the canvas is fixed. This is the only way to
    // photograph a stage other than the first.
    const progOverride = (() => {
      const raw = new URLSearchParams(location.search).get('prog');
      if (raw === null) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : null;
    })();

    const stageEls = $$('[data-journey-stage]');
    const unmountScene = mountJourneyScene({
      canvas,
      labelLayer,
      getProgress: () => {
        if (progOverride !== null) return progOverride;
        const max = document.body.scrollHeight - innerHeight;
        return max > 0 ? scrollY / max : 0;
      },
      getPointer: () => ({ x: mx, y: my }),
      onStage: (i) => {
        stageEls.forEach((el, ei) => el.classList.toggle('on', ei === i));
      },
    });
    cleanups.push(unmountScene);

    updateStage();

    return () => { cleanups.forEach((fn) => fn()); };
  }, []);


  return (
    <div className="cine inst" ref={rootRef}>
      <div className="custom-cursor" id="cine-cursor" />
      <div className="scene-glow" id="cine-scene-glow" />
      <div className="progress-hairline" id="cine-progress" />
      <canvas id="canvas-3d" />
      {/* the stage labels the scene projects onto the route, in screen space */}
      <div className="journey-labels" id="journey-labels" aria-hidden />

      <div className="timeline">
        <div className="timeline-dot active" data-label="intro" data-target="#top" />
        <div className="timeline-dot" data-label="the journey" data-target="#journey" />
        <div className="timeline-dot" data-label="the wait" data-target="#wait" />
        <div className="timeline-dot" data-label="ask it" data-target="#demo" />
        <div className="timeline-dot" data-label="begin" data-target="#begin" />
      </div>

      <div className="content">
        <nav className="nav">
          <a className="wordmark" href="#top">
            assembl<span className="nav-tag">intuitive agentic customer journeys</span>
          </a>
          <div className="nav-links">
            <a href="/concepts">concepts</a>
            <a href="#wait">the wait</a>
            <a href="#demo">ask it</a>
            <a href="/build-an-agent">assemble</a>
            <a href="/ai-ready">ai ready?</a>
          </div>
          <a className="nav-cta" href="#begin">begin</a>
        </nav>

        <section className="hero" id="top">
          <div className="hero-index"><span className="scramble-text" id="cine-scramble-1">001 — agentic customer journeys — aotearoa new zealand</span></div>
          {/* Kate, 2026-07-28: "play on the word Assembl". So the word does the
              thing it names — the seven letters fly in from scatter, each on its
              own delay, and dock into the wordmark. Then the rest of the line
              arrives. Every letter carries BOTH keyframes it needs: setting
              `animation` on a child once silently replaced the inherited
              shorthand and line two never appeared. */}
          {/* The line was "Assembled intuitive / agentic customer journeys."
              which is not a sentence — it is the brand descriptor jammed into
              a headline slot, and it read as word salad. Two short lines
              instead, so the type can actually be display-sized, and the
              wordplay lands where it means something: the brand name is
              already sitting inside the word "assembled", so the seven letters
              of Assembl fly in and dock, then "ed." arrives and completes it.
              Every letter carries BOTH keyframes it needs — setting
              `animation` on a child once silently replaced the inherited
              shorthand and line two never appeared. */}
          <h1>
            <span className="hero-line">
              <span className="hero-word" style={{ animationDelay: '0.1s' }}>Agentic customer journeys,</span>
            </span>
            <span className="hero-line">
              <span className="hero-assembling" aria-label="assembled.">
                {'assembl'.split('').map((ch, i) => (
                  <span
                    key={i}
                    className="hero-char"
                    aria-hidden
                    style={{ animationDelay: `${0.42 + i * 0.075}s` }}
                  >
                    {ch}
                  </span>
                ))}
                <span className="hero-char hero-char-tail" aria-hidden style={{ animationDelay: '1.02s' }}>e</span>
                <span className="hero-char hero-char-tail" aria-hidden style={{ animationDelay: '1.08s' }}>d</span>
                <span className="hero-char hero-char-tail" aria-hidden style={{ animationDelay: '1.14s' }}>.</span>
              </span>
            </span>
          </h1>
          <p className="lede hero-sub-cinema" style={{ marginTop: 28 }}>
            Intuitive agentic customer journeys, built in Aotearoa — every enquiry,
            handover and follow-up designed to earn its keep. Including the waiting,
            which is the part everybody else writes off.
          </p>
          {/* The demo is the product, so it leads. The seven sections below
              are the how-it-works for anyone who has to explain this to a
              boss — they earn their place, they just should not be in front
              of the thing they describe. */}
          <div className="bp-invite">
            <div className="bp-invite-tag"><i />live · reads one page · about ten seconds</div>
            <div className="bp-invite-head">Watch one assemble itself out of your business.</div>
            <p className="bp-invite-sub">Paste your web address. Then ask it something.</p>
            <BlueprintStart />
          </div>
          <div className="hero-cta hero-cta-cinema">
            <a className="btn btn-glass" href="/build-an-agent">or assemble one in the gallery →</a>
          </div>
        </section>

        {/* ── THE WALKTHROUGH ──────────────────────────────────────────────
            Scrolling this section is what moves the camera down the route
            outside. One panel per stage, each lit by the scene as its own
            node comes into frame. Kate: "scrolling becomes a walkthrough". */}
        <section className="journey" id="journey">
          <span className="editorial">the monetised wait state · four steps · one loop</span>
          <div className="journey-intro reveal-fade">
            <div className="kicker">01 — The monetised wait state</div>
            {/* Kate's own line, 2026-07-28. "Dead time" was mine and she did not
                want it — the point is not that the time is dead, it is that the
                time is designable. The wipe reveal is on-topic on purpose: the
                line fills like something completing. */}
            <h2 className="wipe-in">
              The wait state is<br />no longer idle time.<br />
              <span className="accent">It&rsquo;s designable, measurable, monetisable.</span>
            </h2>
            <p>
              Value is created not just by outcomes, but by how intelligently we use
              the in-between moments. The monetised wait state is the intentional
              design and orchestration of moments where users are waiting for a
              process, response or outcome — turning that time into value for both
              the user and the business, through agentic systems.
            </p>
          </div>
          {/* Kate, 2026-07-28: "less text heavy and more of a part of the 3d
              feature". The prose used to be duplicated here and on the floating
              3D label, which made this a wall of text competing with the thing
              it describes. The card is now a rail: number, name, and a bar that
              fills when its stage is the one in frame. The sentence lives on
              the 3D label only, where it belongs. */}
          <ol className="journey-steps">
            {JOURNEY_STAGES.map((s, i) => (
              <li className="journey-step" key={s.key} data-journey-stage={i}>
                <span className="js-n">{s.n}</span>
                <h3>{s.label}</h3>
                <span className="js-bar" aria-hidden="true"><i /></span>
              </li>
            ))}
          </ol>

          {/* Kate's own three-beat line and pull-quote, 2026-07-28. The quote
              is the thesis in one sentence, so it gets the biggest editorial
              setting on the page and nothing competes with it. */}
          <figure className="creed reveal-fade" data-delay="200">
            <blockquote>
              In the agentic economy, attention is earned <em>in the wait</em>,
              not just in the win.
            </blockquote>
            <div className="creed-beats">
              <span>Design the wait.</span>
              <span>Deliver the value.</span>
              <span>Monetise the moment.</span>
            </div>
          </figure>
        </section>

        <section className="section" id="wait">
          <span className="ghost right" aria-hidden="true">03</span>
          <span className="editorial">the wait · loyalty earned · one question back</span>
          <div className="section-copy reveal-right">
            <div className="kicker">02 — The Wait</div>
            <h2>The wait is everywhere.<br /><span className="accent">The value is unlocked by design.</span></h2>
            <p>
              Kiwis wait every day — checkouts, deliveries, hold lines, traffic lights,
              loading screens. In an agentic future those moments aren&rsquo;t wasted.
              They&rsquo;re designed, measured and monetised for value.
            </p>
            <p className="wait-tier">
              Tier one of three, live — <a href="/assembling">the monetisation framework →</a>
            </p>
          </div>
          <div className="wsp-hold reveal-left" data-delay="200">
            <WaitState />
          </div>
        </section>


        <section className="section" id="demo">
          <span className="ghost right" aria-hidden="true">03</span>
          <span className="editorial">live demo · a real agent · drafting</span>
          <div className="section-copy reveal-right">
            <div className="kicker">03 — Ask it</div>
            <h2>Ask it<br /><span className="accent">something.</span></h2>
            <p>A real agent. It drafts, it never sends.</p>
          </div>
          <div className="panel reveal-left" data-delay="200">
            <div className="panel-header">Agent — live <span className="live">{demoBusy ? 'drafting' : 'ready'}</span></div>
            <textarea
              className="demo-input"
              rows={3}
              maxLength={600}
              placeholder="It's Monday morning. My biggest customer wants to move tomorrow's job to today — what would you draft?"
              value={demoQ}
              onChange={(e) => setDemoQ(e.target.value)}
            />
            <button className="btn btn-solid demo-btn" onClick={askAgent} disabled={demoBusy || !demoQ.trim()}>
              {demoBusy ? 'drafting…' : 'ask the agent'}
            </button>
            {demoA ? <div className="demo-answer">{demoA}</div> : null}
          </div>
        </section>

        {/* Counted, not claimed. These three read off the actual roster and
            journey definitions at build time (see app/page.tsx), so they can
            only ever say what is really in the repo. The numbers that used to
            sit here — 47 minutes returned, 94% satisfaction, 55% wait revenue
            — were invented, and we have not run a pilot that measured any of
            them. Kate, 2026-07-28. */}
        <div className="stats-strip">
          <div className="stat reveal-fade">
            <div className="num">{stats.agents}</div>
            <span className="cap">specialist agents built</span>
          </div>
          <div className="stat reveal-fade" data-delay="150">
            <div className="num">{stats.packs}</div>
            <span className="cap">industry packs</span>
          </div>
          <div className="stat reveal-fade" data-delay="300">
            <div className="num">{stats.sectors}</div>
            <span className="cap">sectors mapped end to end</span>
          </div>
        </div>

        <section className="finale" id="begin">
          <h2>
            <span className="finale-word" style={{ animationDelay: '0.15s' }}>Build</span>{' '}
            <span className="finale-word" style={{ animationDelay: '0.3s' }}>intelligence</span><br />
            <span className="finale-word" style={{ animationDelay: '0.45s' }}>you can</span>{' '}
            <span className="finale-word accent" style={{ animationDelay: '0.6s' }}>see.</span>
          </h2>
          <p className="finale-creed reveal-fade" data-delay="750">
            assembl helps New&nbsp;Zealand businesses turn every wait into a win —
            for customers, communities and Aotearoa.
          </p>
          <div className="finale-row reveal-fade" data-delay="900">
            <a className="btn btn-solid" href="mailto:assembl@assembl.co.nz">begin a conversation</a>
            <a className="btn btn-glass" href="/pricing">see pricing</a>
          </div>
        </section>

        {/* The page's crawlable prose — same text app/page.tsx emits as
            FAQPage JSON-LD. Quiet on purpose: it is for the person who wants
            the words, and for the engines that can only read words. */}
        <section className="faq" id="faq" aria-label="What assembl does, in plain words">
          <div className="faq-kick kicker">05 — in plain words</div>
          <dl>
            {HOME_FAQ.map((f) => (
              <div className="faq-item" key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <CineFooter />
      </div>
    </div>
  );
}
