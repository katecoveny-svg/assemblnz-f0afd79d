'use client';

import { useEffect, useRef } from 'react';
import { CineFooter } from './CineFooter';
import * as THREE from 'three';

/**
 * /agents — Kate's agents.html prototype, ported 1:1 (copy hers, 2026-07-24).
 * Same .cine system; its own 3D: the agents-orbit constellation — six
 * geometric specialists orbiting a navy core inside two rings, drifting
 * across the page with scroll (her Assembl3D.agentsOrbitGroup).
 * agent-builder.html links → /build-an-agent.
 */
export function CinematicAgents() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups: Array<() => void> = [];
    const on = (t: EventTarget, e: string, fn: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) => {
      t.addEventListener(e, fn, opts);
      cleanups.push(() => t.removeEventListener(e, fn));
    };

    const canvas = root.querySelector('#canvas-3d-agents') as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FDFBF7');
    const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100);

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
    const fill = new THREE.DirectionalLight('#FFF8EE', 1); fill.position.set(-3, 3, 3); scene.add(fill);

    const brass = new THREE.MeshPhysicalMaterial({ color: '#B8964F', metalness: 1, roughness: 0.12, envMapIntensity: 1.6, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    const chrome = new THREE.MeshPhysicalMaterial({ color: '#D6DADF', metalness: 1, roughness: 0.02, envMapIntensity: 2.4, clearcoat: 1, clearcoatRoughness: 0.03 });
    const navy = new THREE.MeshPhysicalMaterial({ color: '#0C1836', metalness: 0.85, roughness: 0.06, envMapIntensity: 2.0, clearcoat: 1, clearcoatRoughness: 0.05 });

    // agents orbit — her Assembl3D.agentsOrbitGroup
    const group = new THREE.Group();
    const shapes = [
      new THREE.TorusGeometry(0.5, 0.1, 12, 32), new THREE.OctahedronGeometry(0.5, 0),
      new THREE.ConeGeometry(0.4, 0.8, 4), new THREE.TetrahedronGeometry(0.5, 0),
      new THREE.IcosahedronGeometry(0.45, 0), new THREE.TorusGeometry(0.4, 0.08, 10, 24),
    ];
    const matsArr = [brass, navy, chrome, brass, navy, chrome];
    type Orb = { mesh: THREE.Mesh; r: number; speed: number; phase: number };
    const orbiters: Orb[] = shapes.map((geo, i) => {
      const m = new THREE.Mesh(geo, matsArr[i]);
      group.add(m);
      return { mesh: m, r: 3.2 + i * 0.5, speed: 0.25 + i * 0.06, phase: i * 1.05 };
    });
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.8, 48, 48), navy);
    group.add(center);
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.05, 16, 80), brass);
    ring1.rotation.x = Math.PI / 2.4; group.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.03, 12, 64), chrome);
    ring2.rotation.x = Math.PI / 2.7; ring2.rotation.y = Math.PI / 4; group.add(ring2);
    group.position.set(2.5, 0, 0);
    scene.add(group);

    camera.position.set(-2, 0.5, 9);
    camera.lookAt(0, 0, 0);

    let scroll = 0, mx = 0, my = 0, t = 0, raf = 0;
    on(window, 'scroll', () => { scroll = window.scrollY; }, { passive: true });
    on(document, 'mousemove', (ev) => {
      const e = ev as MouseEvent;
      mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2;
    });
    on(window, 'resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });

    function tick() {
      raf = requestAnimationFrame(tick);
      t += 0.016;
      const max = document.body.scrollHeight - innerHeight;
      const prog = max > 0 ? scroll / max : 0;
      group.rotation.y = t * 0.08 + prog * Math.PI * 0.2;
      group.position.y = Math.sin(prog * Math.PI * 2) * 0.5 + my * 0.3;
      group.position.x = 2.5 - prog * 4 + mx * 0.3;
      ring1.rotation.z = t * 0.06;
      ring2.rotation.z = -t * 0.04;
      orbiters.forEach((d) => {
        const a = d.phase + t * d.speed + prog * Math.PI * 1.5;
        d.mesh.position.set(Math.cos(a) * d.r, Math.sin(t * 0.3 + d.phase) * 0.8, Math.sin(a) * d.r);
        d.mesh.rotation.y = t * 0.25 + d.phase;
        d.mesh.rotation.x = Math.sin(t * 0.2 + d.phase) * 0.15;
      });
      camera.position.x = mx * 1.0;
      camera.position.y = 0.5 - my * 0.4;
      camera.lookAt(group.position.x * 0.5, group.position.y * 0.5, 0);
      renderer.render(scene, camera);
    }
    tick();
    cleanups.push(() => cancelAnimationFrame(raf));
    cleanups.push(() => { pmrem.dispose(); renderer.dispose(); });
    return () => { cleanups.forEach((fn) => fn()); };
  }, []);

  const agents = [
    { num: '01', shape: 'navy', h: 'Intent Agent', p: 'Understands what was meant. Classifies the enquiry, extracts the signal from the noise.', tags: ['memory', 'voice'] },
    { num: '02', shape: 'brass', h: 'Knowledge Agent', p: 'Reads from confirmed sources only. Offers, prices, FAQs and business rules from the Blueprint.', tags: ['knowledge', 'boundaries'] },
    { num: '03', shape: 'chrome', h: 'Planning Agent', p: 'Assembles the plan. Compares options, checks constraints, presents the decision.', tags: ['intelligence', 'abilities'] },
    { num: '04', shape: 'brass', h: 'Budget Agent', p: 'Guards the ceiling. Checks every recommendation against the budget before it reaches you.', tags: ['abilities', 'boundaries'] },
    { num: '05', shape: 'navy', h: 'Proof Agent', p: 'Records what changed. Every action traced. Every outcome measured against the baseline.', tags: ['memory', 'abilities'] },
    { num: '06', shape: 'chrome', h: 'Voice Agent', p: 'Speaks the way you do. Warm, plain, helpful — encoded from your business, not the internet.', tags: ['voice', 'knowledge'] },
  ];
  const parts = [
    { n: '01', h: 'memory', p: 'What it remembers — customer context, preferences, history across sessions.' },
    { n: '02', h: 'knowledge', p: 'Read only · confirmed sources — offers, prices, rules from the Blueprint.' },
    { n: '03', h: 'intelligence', p: 'How it reasons — model, temperature, depth. Configurable per agent.' },
    { n: '04', h: 'voice', p: 'How it speaks — tone, formality. Encoded from your business.' },
    { n: '05', h: 'abilities', p: 'What it can do — read, organise, compare, draft. Never sends.' },
    { n: '06', h: 'boundaries', p: 'The operating limit — approval stays visible with every action.' },
  ];

  return (
    <div className="cine" ref={rootRef} style={{ cursor: 'auto' }}>
      <canvas id="canvas-3d-agents" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
      <div className="content">
        <nav className="nav">
          <a className="wordmark" href="/">assembl</a>
          <div className="nav-links">
            <a href="/agents">agents</a>
            <a href="/pricing">pricing</a>
            <a href="/build-an-agent">build an agent</a>
          </div>
          <a className="nav-cta" href="/">← home</a>
        </nav>

        <header className="page-header">
          <div className="kicker">agents</div>
          <h1>Specialists,<br /><span className="accent">not one assistant.</span></h1>
          <p className="lede" style={{ marginTop: 16 }}>Give one clear job to a specialist and receive a draft with its review boundary. Each agent knows what it can do — and exactly where you stay in control.</p>
        </header>

        <div className="page-body">
          <div className="agent-grid">
            {agents.map((a) => (
              <a className="agent-card" key={a.num} href="/build-an-agent">
                <div className="num">{a.num}</div><div className={`m-shape ${a.shape}`}>{a.num}</div>
                <h3>{a.h}</h3><p>{a.p}</p>
                <div className="tags">{a.tags.map((tg) => <span className="tag" key={tg}>{tg}</span>)}</div>
              </a>
            ))}
          </div>

          <div className="parts-section">
            <div className="kicker">agent parts</div>
            <h2 style={{ marginBottom: 8 }}>Six parts. <span className="accent">One agent.</span></h2>
            <div className="parts-grid">
              {parts.map((p) => (
                <div className="part-card" key={p.n}>
                  <div className="pnum">{p.n}</div><h4>{p.h}</h4><p>{p.p}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="boundary">
            <h2>The <span className="accent">operating boundary</span></h2>
            <p>The system can read, organise, compare and draft. It does not send, file, book or make a commitment without the approval path the workflow names.</p>
            <div className="boundary-grid">
              <div className="boundary-item"><span className="dot" />Nothing sends without approval</div>
              <div className="boundary-item"><span className="dot" />Every decision has a named reviewer</div>
              <div className="boundary-item"><span className="dot" />Evidence stays attached</div>
            </div>
          </div>

          <div style={{ marginBottom: 60 }}><a className="btn btn-solid" href="/build-an-agent">build an agent →</a></div>
        </div>

        <CineFooter />
      </div>
    </div>
  );
}
