'use client';

import { useEffect, useRef, useState } from 'react';
import { CineFooter } from './CineFooter';
import { BlueprintStart } from './BlueprintStart';
import { AgentAssembler } from './AgentAssembler';
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
    const sections = ['#top', '#genome', '#journey', '#knows', '#agents', '#wait', '#proof', '#demo', '#begin'].map((s) => $(s)!);
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

    // ── WAIT STATE SIMULATION ──
    const waitTimers: ReturnType<typeof setTimeout>[] = [];
    (function initWait() {
      const steps = $$('.w-step'), fill = $('#cine-w-fill')!, note = $('#cine-w-note')!;
      let i = 0;
      function tick() {
        steps.forEach((s, idx) => { s.classList.toggle('on', idx === i); s.classList.toggle('done', idx < i); });
        const pct = Math.round(((i + 1) / steps.length) * 100);
        fill.style.width = pct + '%'; note.textContent = 'assembling — ' + pct + '%';
        i++;
        if (i > steps.length) {
          waitTimers.push(setTimeout(() => { i = 0; fill.style.width = '0%'; waitTimers.push(setTimeout(tick, 800)); }, 3000));
        } else waitTimers.push(setTimeout(tick, 1600));
      }
      const wIO = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) { tick(); wIO.disconnect(); } }); }, { threshold: 0.4 });
      wIO.observe($('#wait')!);
      cleanups.push(() => { wIO.disconnect(); waitTimers.forEach(clearTimeout); });
    })();

    // ════ 3D — THE AGENT, ASSEMBLED (Kate's assembl3d.js, ported) ════
    const canvas = $('#canvas-3d') as unknown as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FDFBF7');
    const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100);

    // Env — studio softboxes baked into the env map (her shiny-chrome recipe).
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.background = new THREE.Color('#0A0A0D');
    const softbox = (color: string, w: number, h: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    };
    softbox('#FFFFFF', 14, 5, 0, 9, 0);
    softbox('#FFF6E8', 8, 12, -10, 2, 4);
    softbox('#E9EEF4', 8, 10, 10, 1, -3);
    softbox('#FFFFFF', 3, 14, 5, 2, 8);
    softbox('#D9DEE6', 16, 3, 0, -7, 0);
    scene.environment = pmrem.fromScene(env, 0.02).texture;

    scene.add(new THREE.AmbientLight('#FFFFFF', 0.5));
    const key = new THREE.DirectionalLight('#FFFFFF', 2.5); key.position.set(5, 8, 5); scene.add(key);
    const fillLight = new THREE.DirectionalLight('#FFF8EE', 1); fillLight.position.set(-3, 3, 3); scene.add(fillLight);

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

    // agent identity — piano-gloss navy core, chrome identity band, clear boundary shell
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.3, 96, 96), mats.navyDark);
    group.add(core);
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.085, 24, 128), mats.chrome);
    band.rotation.x = Math.PI / 2.4; band.rotation.z = Math.PI / 9;
    group.add(band);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1.95, 64, 64), mats.glass.clone());
    shell.material.opacity = 0.22; shell.material.transmission = 0.98;
    group.add(shell);

    // components — each meaningful, each labelled
    const knowledge = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mats.glass.clone());
    const ability = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.85, 12, 32), mats.brassBright.clone());
    const appTile = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.16), mats.chrome.clone());
    const approval = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), mats.navy.clone());
    type Comp = { mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>; key: string; r: number; sp: number; ph: number; y: number };
    const components: Comp[] = [
      { mesh: knowledge as Comp['mesh'], key: 'knowledge', r: 3.3, sp: 0.16, ph: 0.4, y: 0.6 },
      { mesh: ability as Comp['mesh'],   key: 'ability',   r: 3.8, sp: 0.13, ph: 2.4, y: -0.3 },
      { mesh: appTile as Comp['mesh'],   key: 'app',       r: 4.2, sp: 0.10, ph: 4.2, y: 0.2 },
      { mesh: approval as Comp['mesh'],  key: 'approval',  r: 3.0, sp: 0.19, ph: 5.4, y: -0.7 },
    ];
    components.forEach((c) => group.add(c.mesh));

    const evalRing = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.035, 16, 160), mats.brassBright.clone());
    evalRing.rotation.x = Math.PI / 2.3;
    group.add(evalRing);

    // luminous connector lines — component → core
    const connectors = components.map((c) => {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#B8964F', transparent: true, opacity: 0.18 }));
      scene.add(line); return { line, c };
    });

    // restrained particles
    const N = 90, pGeo = new THREE.BufferGeometry(), pp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pp[i * 3] = (Math.random() - 0.5) * 20; pp[i * 3 + 1] = (Math.random() - 0.5) * 14; pp[i * 3 + 2] = (Math.random() - 0.5) * 20; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    const parts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: '#D4A843', size: 0.045, transparent: true, opacity: 0.35 }));
    scene.add(parts);

    // labels — project 3D positions to screen
    const labels: Record<string, HTMLElement> = {};
    $$('.obj-label').forEach((el) => { labels[el.dataset.obj!] = el; });
    const v = new THREE.Vector3();
    function placeLabel(key: string, obj3d: { getWorldPosition: (out: THREE.Vector3) => THREE.Vector3 }, yOffset = 0.55, lit = false) {
      const el = labels[key]; if (!el) return;
      obj3d.getWorldPosition(v); v.y += yOffset; v.project(camera);
      const x = (v.x * 0.5 + 0.5) * innerWidth, y = (-v.y * 0.5 + 0.5) * innerHeight;
      const onScreen = v.z < 1 && x > 40 && x < innerWidth - 40 && y > 80 && y < innerHeight - 40;
      el.classList.toggle('visible', onScreen);
      el.classList.toggle('lit', lit);
      el.style.left = x + 'px'; el.style.top = y + 'px';
    }

    const stageMap: Record<number, THREE.Mesh> = { 1: knowledge, 2: ability, 3: appTile, 4: approval };

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
      { s: 0.95, x:  3.9, y: -0.2, z:  0.0, ry: 0.15, rx:  0.00, cz:  9.2, cy: 0.4 }, // intro — big, clear of the headline
      { s: 0.95, x: -3.0, y:  0.3, z: -0.6, ry: 1.05, rx:  0.05, cz:  8.6, cy: 0.5 }, // blueprint — swings left
      { s: 1.00, x:  3.1, y: -0.5, z: -1.4, ry: 1.95, rx: -0.06, cz:  8.2, cy: 0.2 }, // journey — right, deeper
      { s: 1.15, x: -2.9, y:  0.4, z: -0.4, ry: 2.85, rx:  0.04, cz:  8.0, cy: 0.5 }, // who — left, leans in
      { s: 1.45, x:  2.9, y:  0.0, z:  0.8, ry: 3.70, rx:  0.08, cz:  7.2, cy: 0.4 }, // agents — close-up right
      { s: 0.90, x: -2.8, y:  1.1, z: -1.0, ry: 4.55, rx:  0.30, cz:  8.6, cy: 0.9 }, // wait — rises, tilts
      { s: 0.78, x:  2.7, y: -0.6, z: -2.2, ry: 5.35, rx: -0.10, cz: 10.4, cy: 0.3 }, // proof — pulls wide
      { s: 1.35, x: -2.6, y: -0.1, z:  0.6, ry: 6.10, rx:  0.05, cz:  7.4, cy: 0.4 }, // demo — leans in beside the live panel
      { s: 1.60, x:  0.0, y:  0.1, z:  1.2, ry: 6.90, rx:  0.00, cz:  7.6, cy: 0.5 }, // finale — centre, massive
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

      core.rotation.y = tt * 0.12;
      core.scale.setScalar(1 + Math.sin(tt * 0.4) * 0.03);
      band.rotation.z = Math.PI / 9 + tt * 0.08 + spin * 2;
      shell.rotation.y = -tt * 0.04;

      components.forEach((c) => {
        const a = c.ph + tt * c.sp + prog * Math.PI * 1.4 + spin;
        c.mesh.position.set(Math.cos(a) * c.r * 0.75 + 0.7, c.y + Math.sin(tt * 0.3 + c.ph) * 0.25, Math.sin(a) * c.r * 0.45);
        c.mesh.rotation.y = tt * 0.2 + c.ph;
        const lit = stageMap[currentStage] === c.mesh;
        c.mesh.material.emissive = new THREE.Color('#D4A843');
        c.mesh.material.emissiveIntensity = lit ? 0.3 + Math.sin(tt * 2.5) * 0.12 : 0;
      });

      const proofLit = currentStage === 5;
      evalRing.rotation.z = tt * 0.05 + spin;
      evalRing.material.emissive = new THREE.Color('#D4A843');
      evalRing.material.emissiveIntensity = proofLit ? 0.35 + Math.sin(tt * 2) * 0.14 : 0.05;

      connectors.forEach(({ line, c }) => {
        const pos = line.geometry.attributes.position as THREE.BufferAttribute;
        const wp = new THREE.Vector3(); c.mesh.getWorldPosition(wp);
        const cp = new THREE.Vector3(); core.getWorldPosition(cp);
        pos.setXYZ(0, cp.x, cp.y, cp.z); pos.setXYZ(1, wp.x, wp.y, wp.z);
        pos.needsUpdate = true;
        (line.material as THREE.LineBasicMaterial).opacity = stageMap[currentStage] === c.mesh ? 0.5 : 0.14;
      });

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

      placeLabel('core', core, 2.4, currentStage === 0);
      components.forEach((c) => placeLabel(c.key, c.mesh, 0.8, stageMap[currentStage] === c.mesh));
      v.set(3.6, 0, 0).applyMatrix4(evalRing.matrixWorld);
      const ringAnchor = v.clone();
      placeLabel('evalring', { getWorldPosition: (out) => out.copy(ringAnchor) }, 0.4, proofLit);

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
    <div className="cine" ref={rootRef}>
      <div className="custom-cursor" id="cine-cursor" />
      <div className="scene-glow" id="cine-scene-glow" />
      <div className="progress-hairline" id="cine-progress" />
      <canvas id="canvas-3d" />

      {/* projected labels for the 3D assembly — meaningful 3D, everything named */}
      <div className="obj-label" data-obj="core">agent — identity</div>
      <div className="obj-label" data-obj="knowledge">knowledge</div>
      <div className="obj-label" data-obj="ability">ability</div>
      <div className="obj-label" data-obj="app">connected app</div>
      <div className="obj-label" data-obj="approval">approval</div>
      <div className="obj-label" data-obj="evalring">tests — passing</div>

      <div className="timeline">
        <div className="timeline-dot active" data-label="intro" data-target="#top" />
        <div className="timeline-dot" data-label="blueprint" data-target="#genome" />
        <div className="timeline-dot" data-label="journey" data-target="#journey" />
        <div className="timeline-dot" data-label="who" data-target="#knows" />
        <div className="timeline-dot" data-label="agents" data-target="#agents" />
        <div className="timeline-dot" data-label="wait" data-target="#wait" />
        <div className="timeline-dot" data-label="proof" data-target="#proof" />
        <div className="timeline-dot" data-label="demo" data-target="#demo" />
        <div className="timeline-dot" data-label="begin" data-target="#begin" />
      </div>

      <div className="content">
        <nav className="nav">
          <a className="wordmark" href="#top">assembl</a>
          <div className="nav-links">
            <a href="/concepts">concepts</a>
            <a href="#genome">blueprint</a>
            <a href="#journey">journey</a>
            <a href="#agents">agents</a>
            <a href="#wait">wait</a>
            <a href="#proof">proof</a>
          </div>
          <a className="nav-cta" href="#begin">begin</a>
        </nav>

        <section className="hero" id="top">
          <div className="hero-index"><span className="scramble-text" id="cine-scramble-1">001 — agentic customer journeys — aotearoa new zealand</span></div>
          <h1>
            <span className="hero-line"><span className="hero-word" style={{ animationDelay: '0.25s' }}>Agentic customer</span></span>
            <span className="hero-line"><span className="hero-word" style={{ animationDelay: '0.45s' }}>journeys, assembled</span></span>
            <span className="hero-line"><span className="hero-word accent" style={{ animationDelay: '0.65s' }}>one agent at a time.</span></span>
          </h1>
          <p className="lede hero-sub-cinema" style={{ marginTop: 28 }}>Specialist agents sit inside your business, read the signals your systems already hold, and prepare the next thing for every customer — the first quote through to the tenth year. Each one drafts. A person approves.</p>
          {/* The demo is the product, so it leads. The seven sections below
              are the how-it-works for anyone who has to explain this to a
              boss — they earn their place, they just should not be in front
              of the thing they describe. */}
          <div className="bp-invite">
            <div className="bp-invite-tag"><i />live · reads one page · about ten seconds</div>
            <div className="bp-invite-head">Watch one assemble itself out of your business.</div>
            <p className="bp-invite-sub">
              Paste your web address. It reads one page, builds a specialist that knows what you sell and how you
              talk, takes on your own colours, and shows you the questions your site leaves hanging. Then ask it
              something — it answers from your business, and tells you plainly when your site never said.
            </p>
            <BlueprintStart />
          </div>
          <div className="hero-cta hero-cta-cinema">
            <a className="btn btn-glass" href="#genome">or read how it works ↓</a>
          </div>
        </section>

        <section className="section" id="genome">
          <span className="ghost right" aria-hidden="true">01</span>
          <span className="editorial">business blueprint · living source · connected</span>
          <div className="section-copy reveal-left">
            <div className="kicker">01 — Business Blueprint</div>
            <h2>They work from<br /><span className="accent">your rules, not theirs.</span></h2>
            <p>What you sell. What you charge. What you would never agree to without checking first. Written down once, in one place, and every agent reads it before it does anything.</p>
            <p style={{ marginTop: 14 }}>Change the spend limit here and every agent uses the new number from that moment. This is the part that makes it sound like you.</p>
          </div>
          <div className="panel reveal-right" data-delay="200">
            <div className="panel-header">Your business, written down <span className="live">in use</span></div>
            <div className="d-row"><div className="m-shape brass">01</div><div className="d-name">What you sell</div><div className="d-tag">your list</div></div>
            <div className="d-row"><div className="m-shape navy">02</div><div className="d-name">What you charge for it</div><div className="d-tag">your prices</div></div>
            <div className="d-row"><div className="m-shape chrome">03</div><div className="d-name">How you talk to people</div><div className="d-tag">your words</div></div>
            <div className="d-row"><div className="m-shape brass">04</div><div className="d-name">What you&rsquo;d never agree to</div><div className="d-tag">your rules</div></div>
            <div className="d-row"><div className="m-shape navy">05</div><div className="d-name">Who has to sign it off</div><div className="d-tag">your people</div></div>
          </div>
        </section>

        <section className="section" id="journey">
          <span className="ghost left" aria-hidden="true">02</span>
          <span className="editorial left">journey composer · assembled · traced</span>
          <div className="section-copy reveal-right">
            <div className="kicker">02 — Journey Composer</div>
            <h2>A customer isn&rsquo;t<br />an enquiry.<br /><span className="accent">They&rsquo;re twenty years.</span></h2>
            <p>The first quote. The job itself. The follow-up nobody got round to. The warranty that ran out quietly. The call they made to somebody else three years later, because you had gone quiet.</p>
            <p style={{ marginTop: 14 }}>Every one of those moments is already recorded somewhere in your business. They just sit in different places and never reach anyone in time to matter.</p>
            <p style={{ marginTop: 14 }}>assembl joins them up and prepares the next one, so the relationship stops depending on whoever happens to remember.</p>
          </div>
          <div className="panel reveal-left" data-delay="200">
            <div className="panel-header">The five steps <span className="live">running</span></div>
            <div className="d-row"><div className="m-shape navy">01</div><div className="d-name">Someone asks</div><div className="d-tag">&ldquo;can you do this?&rdquo;</div></div>
            <div className="d-row"><div className="m-shape brass">02</div><div className="d-name">Work out what they mean</div><div className="d-tag">reads the request</div></div>
            <div className="d-row"><div className="m-shape chrome">03</div><div className="d-name">Check a couple of things</div><div className="d-tag">your prices · your rules</div></div>
            <div className="d-row"><div className="m-shape navy">04</div><div className="d-name">Write it up</div><div className="d-tag">draft ready</div></div>
            <div className="d-row"><div className="m-shape brass">05</div><div className="d-name">You say yes</div><div className="d-tag">then it goes</div></div>
          </div>
        </section>

        <section className="section" id="knows">
          <span className="ghost right" aria-hidden="true">03</span>
          <span className="editorial">intent · history · what you offer</span>
          <div className="section-copy reveal-left">
            <div className="kicker">03 — Who&rsquo;s asking</div>
            <h2>It reads what<br /><span className="accent">already happened.</span></h2>
            <p>Someone who has ordered the same thing every Friday for a year should not be asked what they like. Someone who has never dealt with you before should be asked properly, and asked well.</p>
            <p style={{ marginTop: 14 }}>Every agent reads the whole history before it says anything — what they bought, what went wrong once, what they were promised. Usually there is one question left to ask.</p>
          </div>
          <div className="panel reveal-right" data-delay="200">
            <div className="panel-header">&ldquo;Can you do Thursday?&rdquo; <span className="live">two people</span></div>
            <div className="d-row"><div className="m-shape brass">A</div><div className="d-name">Dealt with them nine times</div><div className="d-tag">asks nothing</div></div>
            <div className="w-step"><div className="w-dot" /><div className="w-text">&ldquo;Thursday works — same as last time, and I&rsquo;ve put you down for the morning.&rdquo;</div></div>
            <div className="d-row" style={{ marginTop: 18 }}><div className="m-shape navy">B</div><div className="d-name">First time here</div><div className="d-tag">asks three things</div></div>
            <div className="w-step"><div className="w-dot" /><div className="w-text">&ldquo;Happy to. Whereabouts are you, what&rsquo;s the job, and does morning or afternoon suit?&rdquo;</div></div>
          </div>
        </section>

        <section className="section" id="agents">
          <span className="ghost left" aria-hidden="true">04</span>
          <span className="editorial left">agent harness · specialists · contracts</span>
          <div className="section-copy reveal-left">
            <div className="kicker">04 — Agent Harness</div>
            <h2>Specialist team members,<br /><span className="accent">not one big brain.</span></h2>
            <p>One watches for work coming due. One watches what is about to lapse. One notices a customer who has gone quiet. One drafts the message and one checks it against your rules before you ever see it.</p>
            <p style={{ marginTop: 14 }}>Each has a single job, a written list of what it may touch, and an authority level that says how far it can go on its own. Nothing that commits money or reaches a customer gets past &ldquo;draft&rdquo; without a named person.</p>
            <a className="btn btn-glass" href="/build-an-agent" style={{ marginTop: 28 }}>assemble an agent →</a>
          </div>
          <div className="panel reveal-right" data-delay="200">
            <div className="panel-header">Build one <span className="live">click a part</span></div>
            <AgentAssembler />
          </div>
          <div className="panel reveal-right" data-delay="320" style={{ marginTop: 22 }}>
            <div className="panel-header">How far each one may go <span className="live">authority</span></div>
            <div className="d-row"><div className="m-shape navy">01</div><div className="d-name">Observe</div><div className="d-tag">watches, says nothing</div></div>
            <div className="d-row"><div className="m-shape chrome">02</div><div className="d-name">Draft</div><div className="d-tag">writes it, holds it</div></div>
            <div className="d-row"><div className="m-shape brass">03</div><div className="d-name">Recommend</div><div className="d-tag">puts options to you</div></div>
            <div className="d-row"><div className="m-shape navy">04</div><div className="d-name">Act with approval</div><div className="d-tag">your click, then it goes</div></div>
            <div className="d-row"><div className="m-shape chrome">05</div><div className="d-name">Anything with a cost</div><div className="d-tag">never past draft alone</div></div>
          </div>
        </section>

        <section className="section" id="wait">
          <span className="ghost right" aria-hidden="true">05</span>
          <span className="editorial">the wait · a credit · one question back</span>
          <div className="section-copy reveal-right">
            <div className="kicker">05 — Assembling · The Wait</div>
            <h2>A fair trade<br /><span className="accent">for the wait.</span></h2>
            <p>While an agent works, your customer watches it happen and earns a credit toward what they&rsquo;re buying. In return it asks one optional question — how they&rsquo;ll use it, when suits, who else it&rsquo;s for.</p>
            <p style={{ marginTop: 14 }}>By the time the work is ready you know something about them you didn&rsquo;t, and they have something back for the wait. Neither of you spent anything extra.</p>
            <p style={{ marginTop: 14 }}>One line of code to add.</p>
          </div>
          <div className="panel reveal-left" data-delay="200">
            <div className="panel-header">While you wait <span className="live">both getting something</span></div>
            <div className="w-step"><div className="w-dot" /><div className="w-text">Reading what they asked for</div><div className="w-reward">+ credit</div></div>
            <div className="w-step"><div className="w-dot" /><div className="w-text">&ldquo;Anything we should know about the site?&rdquo;</div><div className="w-reward">optional</div></div>
            <div className="w-step"><div className="w-dot" /><div className="w-text">Checking it against your prices</div><div className="w-reward">+ credit</div></div>
            <div className="w-step"><div className="w-dot" /><div className="w-text">&ldquo;Does morning or afternoon suit?&rdquo;</div><div className="w-reward">optional</div></div>
            <div className="w-step"><div className="w-dot" /><div className="w-text">Putting the draft in front of you</div><div className="w-reward">credit banked</div></div>
            <div className="w-bar"><div className="w-fill" id="cine-w-fill" /></div>
            <div className="w-note" id="cine-w-note">assembling — 0%</div>
          </div>
        </section>

        <section className="section" id="proof">
          <span className="ghost left" aria-hidden="true">06</span>
          <span className="editorial left">proof · evidence · measured</span>
          <div className="section-copy reveal-left">
            <div className="kicker">06 — Assembl Proof</div>
            <h2>A flight log,<br /><span className="accent">not a dashboard.</span></h2>
            <p>Every job finishes with a record you can actually read. What each specialist looked at, what it wrote, who approved it, and how long the same job used to take you before.</p>
            <p style={{ marginTop: 14 }}>Measured numbers and calculated ones are kept apart, and labelled. If we worked something out rather than counted it, the log says so.</p>
          </div>
          <div className="panel reveal-right" data-delay="200">
            <div className="panel-header">Flight log — this job <span className="live">certified</span></div>
            <div className="d-row"><div className="m-shape brass">01</div><div className="d-name">What each one read</div><div className="d-tag">every source, in order</div></div>
            <div className="d-row"><div className="m-shape navy">02</div><div className="d-name">What it wrote</div><div className="d-tag">the draft, kept</div></div>
            <div className="d-row"><div className="m-shape chrome">03</div><div className="d-name">Who approved it</div><div className="d-tag">named, and when</div></div>
            <div className="d-row"><div className="m-shape brass">04</div><div className="d-name">Time taken</div><div className="d-tag">measured</div></div>
            <div className="d-row"><div className="m-shape navy">05</div><div className="d-name">Time saved</div><div className="d-tag">calculated · labelled</div></div>
          </div>
        </section>

        <section className="section" id="demo">
          <span className="ghost right" aria-hidden="true">07</span>
          <span className="editorial">live demo · a real agent · drafting</span>
          <div className="section-copy reveal-right">
            <div className="kicker">07 — Live Demo</div>
            <h2>Ask it<br /><span className="accent">something.</span></h2>
            <p>A real agent, answering from a sample business. It writes drafts. It doesn&rsquo;t send them.</p>
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

        <CineFooter />
      </div>
    </div>
  );
}
