'use client';

/**
 * home-v3 — "see what your AI is made of"
 *
 * Direct port of the assembl-3d-gallery homepage exploration (2026-07-24):
 * clean minimalism + expressive glossy 3D. Upright Inter Tight display,
 * Lato body, huge whitespace, and a single meaningful 3D assembly where
 * every object represents a real agent component and lights up with its
 * section (brand rule: 3D is never decorative).
 *
 * The scene, reveals, cursor, magnetic buttons and panel tilt are driven
 * imperatively inside one effect against DOM refs — a deliberate 1:1 port
 * of the vanilla implementation rather than an R3F rewrite.
 */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Inter_Tight } from 'next/font/google';
import * as THREE from 'three';
import styles from './home-v3.module.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  variable: '--font-inter-tight',
});

const SECTION_IDS = ['top', 'genome', 'journey', 'agents', 'wait', 'proof', 'begin'] as const;

export function HomeV3() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasHover = matchMedia('(hover: hover)').matches;
    const cleanups: Array<() => void> = [];
    const on = (target: EventTarget, type: string, fn: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) => {
      target.addEventListener(type, fn, opts);
      cleanups.push(() => target.removeEventListener(type, fn, opts));
    };

    // ── custom cursor + pointer glow ──
    const cursor = root.querySelector<HTMLElement>(`.${styles.customCursor}`);
    const glow = root.querySelector<HTMLElement>(`.${styles.sceneGlow}`);
    if (hasHover && cursor && glow) {
      document.body.classList.add(styles.noCursor);
      cleanups.push(() => document.body.classList.remove(styles.noCursor));
      on(document, 'mousemove', (e) => {
        const ev = e as MouseEvent;
        cursor.style.left = `${ev.clientX}px`; cursor.style.top = `${ev.clientY}px`;
        glow.style.left = `${ev.clientX}px`; glow.style.top = `${ev.clientY}px`;
      });
      root.querySelectorAll<HTMLElement>('a, button').forEach((el) => {
        on(el, 'mouseenter', () => cursor.classList.add(styles.hovering));
        on(el, 'mouseleave', () => cursor.classList.remove(styles.hovering));
      });
    } else {
      cursor?.remove();
    }

    // ── magnetic buttons ──
    if (!reducedMotion && hasHover) {
      root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
        on(btn, 'mousemove', (e) => {
          const ev = e as MouseEvent;
          const r = btn.getBoundingClientRect();
          const dx = ev.clientX - r.left - r.width / 2;
          const dy = ev.clientY - r.top - r.height / 2;
          btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.3}px)`;
        });
        on(btn, 'mouseleave', () => { btn.style.transform = ''; });
      });

      // glass panels tilt toward the pointer
      root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((p) => {
        on(p, 'mousemove', (e) => {
          const ev = e as MouseEvent;
          const r = p.getBoundingClientRect();
          const rx = ((ev.clientY - r.top) / r.height - 0.5) * -6;
          const ry = ((ev.clientX - r.left) / r.width - 0.5) * 8;
          p.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        });
        on(p, 'mouseleave', () => { p.style.transform = ''; });
      });
    }

    // ── text scramble ──
    const scrambleEl = root.querySelector<HTMLElement>('[data-scramble]');
    const scrambleFinal = scrambleEl?.dataset.scramble ?? '';
    let scrambleRaf = 0;
    if (scrambleEl) {
      if (reducedMotion) {
        scrambleEl.textContent = scrambleFinal;
      } else {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let frame = 0;
        const queue = scrambleFinal.split('').map((char, i) => ({ char, start: i * 2, end: i * 2 + 20 }));
        const update = () => {
          let output = '';
          let complete = 0;
          queue.forEach((q) => {
            if (frame >= q.end) { output += q.char; complete++; }
            else if (frame >= q.start) output += chars[Math.floor(Math.random() * chars.length)];
            else output += ' ';
          });
          scrambleEl.textContent = output;
          if (complete < queue.length) { frame++; scrambleRaf = requestAnimationFrame(update); }
        };
        const timer = setTimeout(update, 400);
        cleanups.push(() => { clearTimeout(timer); cancelAnimationFrame(scrambleRaf); });
      }
    }

    // ── scroll reveals ──
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.delay ?? 0);
          setTimeout(() => el.classList.add(styles.in), delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.1 });
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      const delay = el.dataset.delay;
      if (delay) el.style.transitionDelay = `${delay}ms`;
      io.observe(el);
    });
    cleanups.push(() => io.disconnect());

    // finale word entrance
    const finale = root.querySelector<HTMLElement>('#begin');
    if (finale) {
      const finIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { finale.classList.add(styles.inView); finIO.unobserve(finale); }
        });
      }, { threshold: 0.4 });
      finIO.observe(finale);
      cleanups.push(() => finIO.disconnect());
    }

    // ── timeline + stage tracking + progress hairline ──
    const sections = SECTION_IDS.map((id) => root.querySelector<HTMLElement>(`#${id}`)).filter(Boolean) as HTMLElement[];
    const dots = Array.from(root.querySelectorAll<HTMLElement>('[data-target]'));
    const progressBar = root.querySelector<HTMLElement>(`.${styles.progressHairline}`);
    let currentStage = 0;
    const updateStage = () => {
      sections.forEach((s, i) => {
        const rect = s.getBoundingClientRect();
        if (rect.top < innerHeight * 0.5 && rect.bottom > innerHeight * 0.5 && currentStage !== i) {
          currentStage = i;
          dots.forEach((d, di) => d.classList.toggle(styles.active, di === i));
        }
      });
      if (progressBar) {
        const max = document.body.scrollHeight - innerHeight;
        progressBar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
      }
    };
    on(window, 'scroll', updateStage, { passive: true });
    dots.forEach((dot) => {
      on(dot, 'click', () => {
        root.querySelector(`#${dot.dataset.target}`)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    });

    // ── wait-state simulation ──
    const waitSection = root.querySelector<HTMLElement>('#wait');
    const steps = Array.from(root.querySelectorAll<HTMLElement>(`.${styles.wStep}`));
    const fill = root.querySelector<HTMLElement>(`.${styles.wFill}`);
    const note = root.querySelector<HTMLElement>(`.${styles.wNote}`);
    const waitTimers: ReturnType<typeof setTimeout>[] = [];
    if (waitSection && fill && note && steps.length) {
      let i = 0;
      const tick = () => {
        steps.forEach((s, idx) => { s.classList.toggle(styles.on, idx === i); s.classList.toggle(styles.done, idx < i); });
        const pct = Math.round(((i + 1) / steps.length) * 100);
        fill.style.width = `${pct}%`;
        note.textContent = `assembling — ${pct}%`;
        i++;
        if (i > steps.length) {
          waitTimers.push(setTimeout(() => { i = 0; fill.style.width = '0%'; waitTimers.push(setTimeout(tick, 800)); }, 3000));
        } else {
          waitTimers.push(setTimeout(tick, 1600));
        }
      };
      const wIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) { tick(); wIO.disconnect(); } });
      }, { threshold: 0.4 });
      wIO.observe(waitSection);
      cleanups.push(() => { wIO.disconnect(); waitTimers.forEach(clearTimeout); });
    }

    // ══ 3D — the agent, assembled ══
    // Every object is a real agent component with a projected label:
    //   navy core + chrome band + glass shell = identity + boundaries (hero)
    //   glass cube = knowledge (blueprint) · brass capsule = ability (journey)
    //   chrome tile = connected app (agents) · navy cube = approval (wait)
    //   brass ring = evaluation (proof)
    const canvas = root.querySelector<HTMLCanvasElement>(`.${styles.canvas3d}`);
    let renderRaf = 0;
    if (canvas) {
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#FAF7F2');
      const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100);
      camera.position.set(0, 0.4, 10);

      // studio softboxes baked into the env map — bright emissive panels are
      // what give chrome its long specular streaks (lights alone bake to ~0)
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

      const mat = {
        brassBright: new THREE.MeshPhysicalMaterial({ color: '#D4A843', metalness: 1, roughness: 0.07, envMapIntensity: 2.0, clearcoat: 0.8, clearcoatRoughness: 0.1 }),
        chrome: new THREE.MeshPhysicalMaterial({ color: '#D6DADF', metalness: 1, roughness: 0.02, envMapIntensity: 2.4, clearcoat: 1, clearcoatRoughness: 0.03 }),
        navy: new THREE.MeshPhysicalMaterial({ color: '#0C1836', metalness: 0.85, roughness: 0.06, envMapIntensity: 2.0, clearcoat: 1, clearcoatRoughness: 0.05 }),
        navyDark: new THREE.MeshPhysicalMaterial({ color: '#081026', metalness: 0.9, roughness: 0.04, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: 0.04 }),
        glass: new THREE.MeshPhysicalMaterial({ color: '#E8EAEC', metalness: 0.1, roughness: 0.02, transmission: 0.95, thickness: 2, transparent: true, opacity: 0.85, envMapIntensity: 1.5 }),
      };

      const group = new THREE.Group();
      scene.add(group);

      const core = new THREE.Mesh(new THREE.SphereGeometry(1.3, 96, 96), mat.navyDark);
      group.add(core);
      const band = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.085, 24, 128), mat.chrome);
      band.rotation.x = Math.PI / 2.4; band.rotation.z = Math.PI / 9;
      group.add(band);
      const shell = new THREE.Mesh(new THREE.SphereGeometry(1.95, 64, 64), mat.glass.clone());
      (shell.material as THREE.MeshPhysicalMaterial).opacity = 0.22;
      (shell.material as THREE.MeshPhysicalMaterial).transmission = 0.98;
      group.add(shell);

      const knowledge = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mat.glass.clone());
      const ability = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.85, 12, 32), mat.brassBright.clone());
      const appTile = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.16), mat.chrome.clone());
      const approval = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), mat.navy.clone());
      const components = [
        { mesh: knowledge, key: 'knowledge', r: 3.3, sp: 0.16, ph: 0.4, y: 0.6 },
        { mesh: ability, key: 'ability', r: 3.8, sp: 0.13, ph: 2.4, y: -0.3 },
        { mesh: appTile, key: 'app', r: 4.2, sp: 0.1, ph: 4.2, y: 0.2 },
        { mesh: approval, key: 'approval', r: 3.0, sp: 0.19, ph: 5.4, y: -0.7 },
      ];
      components.forEach((c) => group.add(c.mesh));

      const evalRing = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.035, 16, 160), mat.brassBright.clone());
      evalRing.rotation.x = Math.PI / 2.3;
      group.add(evalRing);

      const connectors = components.map((c) => {
        const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#B8964F', transparent: true, opacity: 0.18 }));
        scene.add(line);
        return { line, c };
      });

      const N = 90;
      const pGeo = new THREE.BufferGeometry();
      const pp = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) { pp[i * 3] = (Math.random() - 0.5) * 20; pp[i * 3 + 1] = (Math.random() - 0.5) * 14; pp[i * 3 + 2] = (Math.random() - 0.5) * 20; }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
      const parts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: '#D4A843', size: 0.045, transparent: true, opacity: 0.35 }));
      scene.add(parts);

      // projected labels
      const labels: Record<string, HTMLElement> = {};
      root.querySelectorAll<HTMLElement>('[data-obj]').forEach((el) => { labels[el.dataset.obj!] = el; });
      const v = new THREE.Vector3();
      const placeLabel = (labelKey: string, obj: { getWorldPosition: (out: THREE.Vector3) => THREE.Vector3 }, yOffset: number, lit: boolean) => {
        const el = labels[labelKey];
        if (!el) return;
        obj.getWorldPosition(v); v.y += yOffset; v.project(camera);
        const x = (v.x * 0.5 + 0.5) * innerWidth;
        const y = (-v.y * 0.5 + 0.5) * innerHeight;
        const onScreen = v.z < 1 && x > 40 && x < innerWidth - 40 && y > 80 && y < innerHeight - 40;
        el.classList.toggle(styles.visible, onScreen);
        el.classList.toggle(styles.lit, lit);
        el.style.left = `${x}px`; el.style.top = `${y}px`;
      };

      const stageMap: Record<number, THREE.Mesh> = { 1: knowledge, 2: ability, 3: appTile, 4: approval };
      let mx = 0, my = 0, prevScroll = 0, spin = 0, t = 0;
      on(window, 'mousemove', (e) => {
        const ev = e as MouseEvent;
        mx = (ev.clientX / innerWidth - 0.5) * 2;
        my = (ev.clientY / innerHeight - 0.5) * 2;
      });

      const glowGold = new THREE.Color('#D4A843');
      const animate = () => {
        renderRaf = requestAnimationFrame(animate);
        if (!reducedMotion) t += 0.016;
        const max = document.body.scrollHeight - innerHeight;
        const prog = max > 0 ? scrollY / max : 0;

        spin += (scrollY - prevScroll) * 0.00045;
        prevScroll = scrollY;
        spin *= 0.93;

        core.rotation.y = t * 0.12;
        core.scale.setScalar(1 + Math.sin(t * 0.4) * 0.03);
        band.rotation.z = Math.PI / 9 + t * 0.08 + spin * 2;
        shell.rotation.y = -t * 0.04;

        components.forEach((c) => {
          const a = c.ph + t * c.sp + prog * Math.PI * 1.4 + spin;
          c.mesh.position.set(Math.cos(a) * c.r * 0.75 + 0.7, c.y + Math.sin(t * 0.3 + c.ph) * 0.25, Math.sin(a) * c.r * 0.45);
          c.mesh.rotation.y = t * 0.2 + c.ph;
          const lit = stageMap[currentStage] === c.mesh;
          const m = c.mesh.material as THREE.MeshPhysicalMaterial;
          m.emissive = glowGold;
          m.emissiveIntensity = lit ? 0.3 + Math.sin(t * 2.5) * 0.12 : 0;
        });

        const proofLit = currentStage === 5;
        evalRing.rotation.z = t * 0.05 + spin;
        (evalRing.material as THREE.MeshPhysicalMaterial).emissive = glowGold;
        (evalRing.material as THREE.MeshPhysicalMaterial).emissiveIntensity = proofLit ? 0.35 + Math.sin(t * 2) * 0.14 : 0.05;

        connectors.forEach(({ line, c }) => {
          const pos = line.geometry.attributes.position as THREE.BufferAttribute;
          const wp = new THREE.Vector3(); c.mesh.getWorldPosition(wp);
          const cp = new THREE.Vector3(); core.getWorldPosition(cp);
          pos.setXYZ(0, cp.x, cp.y, cp.z); pos.setXYZ(1, wp.x, wp.y, wp.z);
          pos.needsUpdate = true;
          (line.material as THREE.LineBasicMaterial).opacity = stageMap[currentStage] === c.mesh ? 0.5 : 0.14;
        });

        parts.rotation.y = t * 0.008;

        const narrow = innerWidth < 900;
        const fit = Math.min(1, innerWidth / 1400);
        group.scale.setScalar(narrow ? 0.55 : 0.7 + fit * 0.2);
        group.position.x = (narrow ? 0.4 : 3.1) + mx * 0.3 - Math.sin(prog * Math.PI) * (narrow ? 0.4 : 1.0);
        group.position.y = (narrow ? 1.6 : 0) + my * 0.2 + Math.sin(prog * Math.PI * 2) * 0.4;
        group.rotation.y = prog * Math.PI * 0.35 + mx * 0.08 + spin * 3;
        group.rotation.z = Math.sin(prog * Math.PI * 1.6) * 0.03 + spin * 0.6;
        camera.position.x = mx * 0.9;
        camera.position.y = 0.4 - my * 0.45;
        camera.position.z = 10 - prog * 1.8;
        camera.lookAt(group.position.x * 0.35, group.position.y * 0.4, 0);

        placeLabel('core', core, 2.4, currentStage === 0);
        components.forEach((c) => placeLabel(c.key, c.mesh, 0.8, stageMap[currentStage] === c.mesh));
        v.set(3.6, 0, 0).applyMatrix4(evalRing.matrixWorld);
        const ringAnchor = { getWorldPosition: (out: THREE.Vector3) => out.copy(v) };
        placeLabel('evalring', ringAnchor, 0.4, proofLit);

        renderer.render(scene, camera);
      };
      animate();

      on(window, 'resize', () => {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
      });

      cleanups.push(() => {
        cancelAnimationFrame(renderRaf);
        pmrem.dispose();
        renderer.dispose();
        scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
          if (Array.isArray(material)) material.forEach((mm) => mm.dispose());
          else material?.dispose();
        });
      });
    }

    return () => { cleanups.forEach((fn) => fn()); };
  }, []);

  return (
    <div ref={rootRef} className={`${interTight.variable} ${styles.root}`}>
      <div className={styles.customCursor} aria-hidden="true" />
      <div className={styles.sceneGlow} aria-hidden="true" />
      <div className={styles.progressHairline} aria-hidden="true" />
      <canvas className={styles.canvas3d} aria-hidden="true" />

      {/* projected labels — meaningful 3D, everything named */}
      <div className={styles.objLabel} data-obj="core">agent — identity</div>
      <div className={styles.objLabel} data-obj="knowledge">knowledge</div>
      <div className={styles.objLabel} data-obj="ability">ability</div>
      <div className={styles.objLabel} data-obj="app">connected app</div>
      <div className={styles.objLabel} data-obj="approval">approval</div>
      <div className={styles.objLabel} data-obj="evalring">tests — passing</div>

      <div className={styles.timeline} aria-label="page sections">
        {(
          [
            ['intro', 'top'],
            ['blueprint', 'genome'],
            ['journey', 'journey'],
            ['agents', 'agents'],
            ['wait', 'wait'],
            ['proof', 'proof'],
            ['begin', 'begin'],
          ] as const
        ).map(([label, target], i) => (
          <button
            key={target}
            type="button"
            className={`${styles.timelineDot} ${i === 0 ? styles.active : ''}`}
            data-label={label}
            data-target={target}
            aria-label={`go to ${label}`}
          />
        ))}
      </div>

      <div className={styles.content}>
        <nav className={styles.nav} aria-label="assembl">
          <a className={styles.wordmark} href="#top">assembl</a>
          <div className={styles.navLinks}>
            <a href="#genome">blueprint</a>
            <a href="#journey">journey</a>
            <a href="#agents">agents</a>
            <a href="#wait">wait</a>
            <a href="#proof">proof</a>
          </div>
          <Link className={styles.navCta} href="/contact">begin</Link>
        </nav>

        <section className={styles.hero} id="top">
          <div className={styles.heroIndex}>
            <span data-scramble="001 — agentic customer journeys — aotearoa new zealand" />
          </div>
          <h1>
            <span className={styles.heroLine}><span className={styles.heroWord} style={{ animationDelay: '0.25s' }}>See what</span></span>
            <span className={styles.heroLine}><span className={styles.heroWord} style={{ animationDelay: '0.45s' }}>your AI is</span></span>
            <span className={styles.heroLine}><span className={`${styles.heroWord} ${styles.accent}`} style={{ animationDelay: '0.65s' }}>made of.</span></span>
          </h1>
          <p className={`${styles.lede} ${styles.heroSub}`} style={{ marginTop: 36 }}>
            assembl runs specialist operational workflows for real NZ businesses. We reduce admin,
            surface risk earlier, and keep people in control. Every workflow ends in an evidence
            pack you can file, forward, or footnote.
          </p>
          <div className={styles.heroCta}>
            <a className={`${styles.btn} ${styles.btnSolid}`} data-magnetic href="#genome">walk the platform</a>
            <Link className={`${styles.btn} ${styles.btnGlass}`} data-magnetic href="/agents">build an agent</Link>
          </div>
        </section>

        <section className={styles.section} id="genome">
          <span className={`${styles.ghost} ${styles.ghostRight}`} aria-hidden="true">01</span>
          <span className={styles.editorial}>business blueprint · living source · connected</span>
          <div className={styles.sectionCopy} data-reveal="left">
            <div className={styles.kicker}>01 — Business Blueprint</div>
            <h2>Your business,<br /><span className={styles.accent}>understood.</span></h2>
            <p>Not a database. A living model of what you sell, how you speak, what you allow. The Blueprint is the source of truth for every journey. Change it once — every journey updates.</p>
          </div>
          <div className={styles.panel} data-reveal="right" data-delay="200" data-tilt>
            <div className={styles.panelHeader}>Blueprint — live <span className={styles.live}>connected</span></div>
            {(
              [
                ['01', styles.mBrass, 'Weekly shop template', 'v2.4'],
                ['02', styles.mNavy, 'Dietary exclusions', 'enforced'],
                ['03', styles.mChrome, 'Budget ceiling — $220', 'active'],
                ['04', styles.mBrass, 'Voice — warm, plain', 'encoded'],
                ['05', styles.mNavy, 'Approval matrix', '6 levels'],
              ] as const
            ).map(([n, shade, name, tag]) => (
              <div className={styles.dRow} key={name}>
                <div className={`${styles.mShape} ${shade}`}>{n}</div>
                <div className={styles.dName}>{name}</div>
                <div className={styles.dTag}>{tag}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} id="journey">
          <span className={`${styles.ghost} ${styles.ghostLeft}`} aria-hidden="true">02</span>
          <span className={`${styles.editorial} ${styles.editorialLeft}`}>journey composer · assembled · traced</span>
          <div className={styles.sectionCopy} data-reveal="right">
            <div className={styles.kicker}>02 — Journey Composer</div>
            <h2>Every journey,<br /><span className={styles.accent}>composed.</span></h2>
            <p>Entry, intent, context, recommendation, commitment, action, wait, fulfilment, resolution. The same architecture for every industry. Only the configuration changes.</p>
          </div>
          <div className={styles.panel} data-reveal="left" data-delay="200" data-tilt>
            <div className={styles.panelHeader}>Journey — everyday, assembled <span className={styles.live}>running</span></div>
            {(
              [
                ['01', styles.mNavy, 'Intent received', '"the week, please"'],
                ['02', styles.mBrass, 'Context selected', 'household · calendar'],
                ['03', styles.mChrome, 'Plan assembled', '7 meals · constraints'],
                ['04', styles.mNavy, 'Approval requested', 'one decision'],
                ['05', styles.mBrass, 'Proof recorded', '47 min saved'],
              ] as const
            ).map(([n, shade, name, tag]) => (
              <div className={styles.dRow} key={name}>
                <div className={`${styles.mShape} ${shade}`}>{n}</div>
                <div className={styles.dName}>{name}</div>
                <div className={styles.dTag}>{tag}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} id="agents">
          <span className={`${styles.ghost} ${styles.ghostRight}`} aria-hidden="true">03</span>
          <span className={styles.editorial}>agent harness · specialists · contracts</span>
          <div className={styles.sectionCopy} data-reveal="left">
            <div className={styles.kicker}>03 — Agent Harness</div>
            <h2>Specialists,<br /><span className={styles.accent}>not one assistant.</span></h2>
            <p>Each agent has a contract — purpose, inputs, outputs, authority, limitations. They collaborate through the Runtime. They never improvise. You stay in control.</p>
            <Link className={`${styles.btn} ${styles.btnGlass}`} data-magnetic href="/agents" style={{ marginTop: 28 }}>assemble an agent →</Link>
          </div>
          <div className={styles.panel} data-reveal="right" data-delay="200" data-tilt>
            <div className={styles.panelHeader}>Agent team — this journey <span className={styles.live}>active</span></div>
            {(
              [
                ['01', styles.mNavy, 'Intent Agent', 'v1.2 · passed'],
                ['02', styles.mChrome, 'Context Agent', 'v1.0 · passed'],
                ['03', styles.mBrass, 'Planning Agent', 'v2.1 · passed'],
                ['04', styles.mNavy, 'Budget Agent', 'v1.4 · resolved'],
                ['05', styles.mChrome, 'Proof Agent', 'v1.0 · recording'],
              ] as const
            ).map(([n, shade, name, tag]) => (
              <div className={styles.dRow} key={name}>
                <div className={`${styles.mShape} ${shade}`}>{n}</div>
                <div className={styles.dName}>{name}</div>
                <div className={styles.dTag}>{tag}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} id="wait">
          <span className={`${styles.ghost} ${styles.ghostLeft}`} aria-hidden="true">04</span>
          <span className={`${styles.editorial} ${styles.editorialLeft}`}>monetised wait · reward layer · earning</span>
          <div className={styles.sectionCopy} data-reveal="right">
            <div className={styles.kicker}>04 — Assembling · Monetised Wait</div>
            <h2>Waiting,<br /><span className={styles.accent}>made useful.</span></h2>
            <p>Every wait state in every customer journey is a monetised moment. While the agent works, the user earns — charity at launch, with more rewards rolling out. One line of code. You keep 55%.</p>
          </div>
          <div className={styles.panel} data-reveal="left" data-delay="200" data-tilt>
            <div className={styles.panelHeader}>While you wait — live <span className={styles.live}>assembling</span></div>
            {(
              [
                ['Reading the household rhythm', '+$0.14'],
                ['Checking the calendar for pressure points', '+$0.08'],
                ['Balancing nutrition against the budget', '+$0.22'],
                ['Preparing your approval — one decision', '+$0.31'],
              ] as const
            ).map(([text, reward]) => (
              <div className={styles.wStep} key={text}>
                <div className={styles.wDot} />
                <div className={styles.wText}>{text}</div>
                <div className={styles.wReward}>{reward}</div>
              </div>
            ))}
            <div className={styles.wBar}><div className={styles.wFill} /></div>
            <div className={styles.wNote}>assembling — 0%</div>
          </div>
        </section>

        <section className={styles.section} id="proof">
          <span className={`${styles.ghost} ${styles.ghostRight}`} aria-hidden="true">05</span>
          <span className={styles.editorial}>proof · evidence · measured</span>
          <div className={styles.sectionCopy} data-reveal="left">
            <div className={styles.kicker}>05 — Assembl Proof</div>
            <h2>Evidence,<br /><span className={styles.accent}>not analytics.</span></h2>
            <p>Every journey leaves a trace. Every decision is recorded. Every outcome is measured against the baseline. No black box. No approximations. Just evidence packs.</p>
          </div>
          <div className={styles.panel} data-reveal="right" data-delay="200" data-tilt>
            <div className={styles.panelHeader}>Evidence pack — this journey <span className={styles.live}>recorded</span></div>
            {(
              [
                ['01', styles.mBrass, 'Time saved', '47 min'],
                ['02', styles.mNavy, 'Customer satisfaction', '94% ↑'],
                ['03', styles.mChrome, 'Agent calls avoided', '1 saved'],
                ['04', styles.mBrass, 'Revenue impact', '+$2.40'],
              ] as const
            ).map(([n, shade, name, tag]) => (
              <div className={styles.dRow} key={name}>
                <div className={`${styles.mShape} ${shade}`}>{n}</div>
                <div className={styles.dName}>{name}</div>
                <div className={styles.dTag}>{tag}</div>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.statsStrip}>
          <div data-reveal="fade">
            <div className={styles.statNum}>47<span className={styles.statUnit}>min</span></div>
            <span className={styles.statCap}>returned per journey</span>
          </div>
          <div data-reveal="fade" data-delay="150">
            <div className={styles.statNum}>94<span className={styles.statUnit}>%</span></div>
            <span className={styles.statCap}>customer satisfaction</span>
          </div>
          <div data-reveal="fade" data-delay="300">
            <div className={styles.statNum}>55<span className={styles.statUnit}>%</span></div>
            <span className={styles.statCap}>wait revenue — yours</span>
          </div>
        </div>

        <section className={styles.finale} id="begin">
          <h2>
            <span className={styles.finaleWord} style={{ animationDelay: '0.15s' }}>Build</span>{' '}
            <span className={styles.finaleWord} style={{ animationDelay: '0.3s' }}>intelligence</span><br />
            <span className={styles.finaleWord} style={{ animationDelay: '0.45s' }}>you can</span>{' '}
            <span className={`${styles.finaleWord} ${styles.accent}`} style={{ animationDelay: '0.6s' }}>understand.</span>
          </h2>
          <div className={styles.finaleRow} data-reveal="fade" data-delay="900">
            <Link className={`${styles.btn} ${styles.btnSolid}`} data-magnetic href="/contact">begin a conversation</Link>
            <Link className={`${styles.btn} ${styles.btnGlass}`} data-magnetic href="/pricing">see pricing</Link>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>assembl · mahi that earns its proof · built in aotearoa · © 2026</span>
          <nav className={styles.footerLinks} aria-label="assembl footer">
            <Link href="/genome">business genome</Link>
            <Link href="/trust">trust</Link>
            <Link href="/pricing">pricing</Link>
            <Link href="/contact">contact</Link>
            <Link href="/legal/privacy">privacy</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
