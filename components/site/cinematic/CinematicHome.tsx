'use client';

import { useEffect, useRef, useState } from 'react';
import { CineFooter } from './CineFooter';
import { BlueprintStart } from './BlueprintStart';
import { WaitState } from './WaitState';
import { Showroom } from './Showroom';
import { HOME_FAQ } from './faq';
import * as THREE from 'three';

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
export function CinematicHome() {
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
    // Five stages. This array, KEYS below and the timeline dots in the markup
    // must stay the same length — a mismatch silently renders the next stage's
    // pose at every step below the gap.
    const sections = ['#top', '#showroom', '#wait', '#demo', '#begin'].map((s) => $(s)!);
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

    // ════ 3D — THE AGENT, ASSEMBLED (Kate's assembl3d.js, ported) ════
    const canvas = $('#canvas-3d') as unknown as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030B1F');   // super deep navy — Kate's call: navy, not black
    // Atmospheric depth: things further away sink into the navy, which is what
    // sells the page as a space rather than a backdrop.
    scene.fog = new THREE.FogExp2('#030B1F', 0.026);
    const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100);

    // Env — studio softboxes baked into the env map (her shiny-chrome recipe).
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.background = new THREE.Color('#0A0A0D');
    // Hairline metal on a near-black page needs a much hotter softbox than the
    // paper page did, or the threads go to mud — same recipe, boosted.
    const BOOST = 2.6;
    const softbox = (color: string, w: number, h: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(BOOST) }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    };
    softbox('#FFFFFF', 14, 5, 0, 9, 0);
    softbox('#FFF6E8', 8, 12, -10, 2, 4);
    softbox('#E9EEF4', 8, 10, 10, 1, -3);
    softbox('#FFFFFF', 3, 14, 5, 2, 8);
    softbox('#D4A843', 16, 3, 0, -7, 0);
    scene.environment = pmrem.fromScene(env, 0.02).texture;

    scene.add(new THREE.AmbientLight('#FFFFFF', 0.3));
    const key = new THREE.DirectionalLight('#FFFFFF', 1.9); key.position.set(5, 8, 5); scene.add(key);
    // the knot's own footlight — gold from below-left so the dark side of
    // every thread still carries an edge against the navy
    const rim = new THREE.PointLight('#D4A843', 40, 26, 1.6); rim.position.set(-4, -2, 5); scene.add(rim);

    const mats = {
      brassBright: new THREE.MeshPhysicalMaterial({ color: '#D4A843', metalness: 1, roughness: 0.07, envMapIntensity: 2.0, clearcoat: 0.8, clearcoatRoughness: 0.1 }),
      chrome: new THREE.MeshPhysicalMaterial({ color: '#D6DADF', metalness: 1, roughness: 0.02, envMapIntensity: 2.4, clearcoat: 1, clearcoatRoughness: 0.03 }),
      navy: new THREE.MeshPhysicalMaterial({ color: '#0C1836', metalness: 0.85, roughness: 0.06, envMapIntensity: 2.0, clearcoat: 1, clearcoatRoughness: 0.05 }),
      navyDark: new THREE.MeshPhysicalMaterial({ color: '#081026', metalness: 0.9, roughness: 0.04, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: 0.04 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#E8EAEC', metalness: 0.1, roughness: 0.02, transmission: 0.95, thickness: 2, transparent: true, opacity: 0.85, envMapIntensity: 1.5 }),
    };

    let scroll = 0, mx = 0, my = 0;
    on(window, 'scroll', () => { scroll = window.scrollY; }, { passive: true });
    on(document, 'mousemove', (ev) => {
      const e = ev as MouseEvent;
      mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2;
    });

    camera.position.set(0, 0.4, 10);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    // ── THE FILAMENT ── Kate's pick from /lab/directions ("Instrument on
    // navy"). A chrome thread wound through a gold one, a hairline horizon
    // ring, a gold seed at the centre. Nothing thicker than 0.02 — the old
    // assembly's 0.085 band is precisely what read as clunky.
    const threadA = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.02, 700, 20, 2, 3), mats.chrome);
    const threadB = new THREE.Mesh(new THREE.TorusKnotGeometry(1.9, 0.013, 700, 16, 3, 5), mats.brassBright.clone());
    // piano-black third winding — the black taurus of the gallery language;
    // on navy it reads by its highlights, which is what the footlight is for
    const threadC = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.2, 0.024, 600, 20, 2, 5),
      new THREE.MeshPhysicalMaterial({ color: '#050608', metalness: 0.9, roughness: 0.05, envMapIntensity: 2.6, clearcoat: 1, clearcoatRoughness: 0.03 }),
    );
    const horizon = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.008, 10, 300), mats.chrome.clone());
    horizon.rotation.x = Math.PI / 2.1;
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.2, 48, 48), mats.brassBright.clone());
    group.add(threadA, threadB, threadC, horizon, seed);

    // restrained particles
    const N = 90, pGeo = new THREE.BufferGeometry(), pp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pp[i * 3] = (Math.random() - 0.5) * 20; pp[i * 3 + 1] = (Math.random() - 0.5) * 14; pp[i * 3 + 2] = (Math.random() - 0.5) * 20; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    const parts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: '#D4A843', size: 0.04, transparent: true, opacity: 0.5 }));
    scene.add(parts);

    // The filament carries no per-component labels — the parts story lives on
    // /build-an-agent now, where the parts are actually clickable.

    // One keyframe per section: intro, blueprint, journey, agents, wait,
    // proof, finale. s=scale, x/y/z=assembly position, ry/rx=rotation,
    // cz/cy=camera. Alternates sides with the copy, dives near for agents,
    // rises for wait, pulls wide for proof, lands centre-stage huge for the
    // finale — one full slow turn across the whole page.
    // One keyframe per section — intro, blueprint, journey, who, agents, wait,
    // proof, demo, finale. There must be exactly as many of these as there are
    // entries in `sections` above: the scroll position indexes straight into
    // this array, so adding a section without adding a pose silently shifts
    // every stage after it onto the wrong one.
    // s=scale, x/y/z=assembly position, ry/rx=rotation, cz/cy=camera.
    // Sides alternate with the copy, dives near for agents, rises for wait,
    // pulls wide for proof, lands centre-stage for the finale.
    const KEYS = [
      { s: 1.08, x:  3.9, y: -0.2, z:  0.0, ry: 0.15, rx:  0.00, cz:  9.2, cy: 0.4 }, // intro — big, clear of the headline
      { s: 0.50, x:  0.0, y:  0.3, z: -3.0, ry: 1.20, rx:  0.00, cz: 11.0, cy: 0.4 }, // showroom — parked small; its canvas covers the frame
      { s: 0.85, x: -3.2, y:  0.9, z: -1.2, ry: 2.60, rx:  0.28, cz:  9.0, cy: 0.8 }, // the wait — rises and clears the phone
      { s: 1.30, x:  3.0, y: -0.1, z:  0.6, ry: 4.30, rx:  0.05, cz:  7.6, cy: 0.4 }, // ask — leans in beside the live panel
      { s: 1.60, x:  0.0, y:  0.1, z:  1.2, ry: 6.20, rx:  0.00, cz:  7.6, cy: 0.5 }, // finale — centre, massive
    ];

    let prevScroll = 0, spin = 0, t = 0, raf = 0;

    function tick() {
      raf = requestAnimationFrame(tick);
      t += 0.016;
      const tt = reducedMotion ? 0 : t;
      const max = document.body.scrollHeight - innerHeight;
      const prog = max > 0 ? scroll / max : 0;

      spin += (scroll - prevScroll) * 0.00045;
      prevScroll = scroll;
      spin *= 0.93;

      // Per-part life, so it reads as alive rather than as one spinning still.
      threadA.rotation.y = tt * 0.1;
      threadA.rotation.x = Math.sin(tt * 0.13) * 0.16;
      threadB.rotation.y = -tt * 0.07;
      threadB.rotation.z = tt * 0.05 + spin * 2;
      threadC.rotation.y = tt * 0.055;
      threadC.rotation.x = -tt * 0.04 + Math.sin(tt * 0.2) * 0.1;
      horizon.rotation.z = tt * 0.04 + spin;
      const finaleLit = currentStage === KEYS.length - 1;
      seed.scale.setScalar(1 + Math.sin(tt * 0.9) * 0.05 + prog * 1.4);
      (seed.material as THREE.MeshPhysicalMaterial).emissive = new THREE.Color('#D4A843');
      (seed.material as THREE.MeshPhysicalMaterial).emissiveIntensity = finaleLit ? 0.4 + Math.sin(tt * 2) * 0.15 : 0.08;

      parts.rotation.y = tt * 0.008;

      // ── SCROLL CHOREOGRAPHY ──────────────────────────────────────────
      // The assembly is the co-star of the whole page: FAR larger than the
      // prototype's drift, and it travels — side to side, toward and away
      // from the camera, rising and diving, completing a full slow turn —
      // keyframed per section and eased between them. `stageFloat` is a
      // continuous section index (2.4 = 40% through section 2), so motion
      // direction and depth genuinely change as you move down the page.
      let sf = 0;
      for (let i = 0; i < sections.length; i++) {
        const r = sections[i].getBoundingClientRect();
        const mid = innerHeight * 0.5;
        if (r.top > mid) break;
        if (r.bottom <= mid) { sf = i + 1; continue; }
        sf = i + (mid - r.top) / Math.max(1, r.height);
      }
      sf = Math.min(sf, KEYS.length - 1);
      const i0 = Math.floor(sf), i1 = Math.min(i0 + 1, KEYS.length - 1);
      const f = sf - i0, e = f * f * (3 - 2 * f); // smoothstep between stages
      const k = (a: number, b: number) => a + (b - a) * e;
      const A = KEYS[i0], B = KEYS[i1];

      // Continuous width blend (0 at ≤700px … 1 at ≥1400px) — the old binary
      // <900px switch left mid-width windows with full desktop placement and
      // the assembly parked on top of the headline.
      const wide = Math.min(1, Math.max(0, (innerWidth - 700) / 700));

      // The keyframes place the assembly in world units, but the camera's
      // vertical FOV is fixed — so a wider window shows more world, and a fixed
      // x offset drifts the object back over the copy. On a 1750px screen the
      // intro sat on top of the headline. Push it out in proportion to how much
      // wider than the reference frame we actually are, and ease the scale back
      // so it stops overflowing on short, wide windows.
      const REFERENCE_ASPECT = 1.6;
      const aspect = innerWidth / Math.max(1, innerHeight);
      const spread = Math.min(1.9, Math.max(1, aspect / REFERENCE_ASPECT));
      const roomy = Math.min(1, Math.max(0.78, 1 - (aspect - REFERENCE_ASPECT) * 0.22));

      const baseScale = k(A.s, B.s) * (0.74 + 0.26 * wide) * roomy;
      group.scale.setScalar(baseScale);
      // narrower window → pushed further to its side + lifted above the copy
      group.position.x = k(A.x, B.x) * (1 + (1 - wide) * 0.45) * spread + mx * 0.3;
      group.position.y = k(A.y, B.y) + (1 - wide) * 1.4 + my * 0.2;
      group.position.z = k(A.z, B.z);
      group.rotation.y = k(A.ry, B.ry) + mx * 0.08 + spin * 3;
      group.rotation.x = k(A.rx, B.rx) + spin * 0.4;
      group.rotation.z = Math.sin(sf * 1.1) * 0.04 + spin * 0.6;
      camera.position.x = mx * 0.9;
      camera.position.y = k(A.cy, B.cy) - my * 0.45;
      camera.position.z = k(A.cz, B.cz);
      camera.lookAt(group.position.x * 0.35, group.position.y * 0.4, group.position.z * 0.5);

      renderer.render(scene, camera);
    }
    tick();
    cleanups.push(() => cancelAnimationFrame(raf));

    const onResize = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    };
    on(window, 'resize', onResize);

    cleanups.push(() => { pmrem.dispose(); renderer.dispose(); });
    updateStage();

    return () => { cleanups.forEach((fn) => fn()); };
  }, []);

  return (
    <div className="cine inst" ref={rootRef}>
      <div className="custom-cursor" id="cine-cursor" />
      <div className="scene-glow" id="cine-scene-glow" />
      <div className="progress-hairline" id="cine-progress" />
      <canvas id="canvas-3d" />

      <div className="timeline">
        <div className="timeline-dot active" data-label="intro" data-target="#top" />
        <div className="timeline-dot" data-label="showroom" data-target="#showroom" />
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
            <a href="#showroom">showroom</a>
            <a href="#wait">the wait</a>
            <a href="#demo">ask it</a>
            <a href="/build-an-agent">build one</a>
            <a href="/ai-ready">ai ready?</a>
          </div>
          <a className="nav-cta" href="#begin">begin</a>
        </nav>

        <section className="hero" id="top">
          <div className="hero-index"><span className="scramble-text" id="cine-scramble-1">001 — agentic customer journeys — aotearoa new zealand</span></div>
          {/* Kate's, 2026-07-26. Two lines and a subhead — the four-line version
              took too long to land. */}
          <h1>
            <span className="hero-line"><span className="hero-word" style={{ animationDelay: '0.25s' }}>Assembled intuitive</span></span>
            <span className="hero-line"><span className="hero-word accent" style={{ animationDelay: '0.45s' }}>customer journeys.</span></span>
          </h1>
          <p className="lede hero-sub-cinema" style={{ marginTop: 28 }}>Agentic business solutions for Aotearoa.</p>
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
            <a className="btn btn-glass" href="/build-an-agent">or build one in 3D →</a>
          </div>
        </section>




        <section id="showroom" aria-label="The showroom — six parts of an agent">
          <Showroom />
        </section>

        <section className="section" id="wait">
          <span className="ghost right" aria-hidden="true">04</span>
          <span className="editorial">the wait · a credit · one question back</span>
          <div className="section-copy reveal-right">
            <div className="kicker">03 — The Wait</div>
            <h2>The only part<br /><span className="accent">nobody else builds.</span></h2>
            <p>Tap through it.</p>
          </div>
          <div className="wsp-hold reveal-left" data-delay="200">
            <WaitState />
          </div>
        </section>


        <section className="section" id="demo">
          <span className="ghost right" aria-hidden="true">04</span>
          <span className="editorial">live demo · a real agent · drafting</span>
          <div className="section-copy reveal-right">
            <div className="kicker">04 — Ask it</div>
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

        <div className="stats-strip">
          <div className="stat reveal-fade"><div className="num">47<span className="unit">min</span></div><span className="cap">returned per journey</span></div>
          <div className="stat reveal-fade" data-delay="150"><div className="num">94<span className="unit">%</span></div><span className="cap">customer satisfaction</span></div>
          <div className="stat reveal-fade" data-delay="300"><div className="num">55<span className="unit">%</span></div><span className="cap">wait revenue — yours</span></div>
        </div>

        <section className="finale" id="begin">
          <h2>
            <span className="finale-word" style={{ animationDelay: '0.15s' }}>Build</span>{' '}
            <span className="finale-word" style={{ animationDelay: '0.3s' }}>intelligence</span><br />
            <span className="finale-word" style={{ animationDelay: '0.45s' }}>you can</span>{' '}
            <span className="finale-word accent" style={{ animationDelay: '0.6s' }}>understand.</span>
          </h2>
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
