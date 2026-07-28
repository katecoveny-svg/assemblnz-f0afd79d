'use client';

import { useEffect, useRef } from 'react';
import { CineFooter } from './CineFooter';
import * as THREE from 'three';

/**
 * The creative subpages — /about, /pilots, /field-notes — one shared shell in
 * the cinematic system (Kate's design language; copy written to her register
 * under her "be creative" licence, flagged for her word-check).
 *
 * Each page gets its own small 3D signature so no two pages feel the same:
 *   about       → the blueprint heart: brass glow icosahedron + wire + rings
 *   pilots      → a compass of journey shapes circling a navy core
 *   field-notes → a quiet stack of glass "pages" slowly fanning
 */

export type SubpageSpec = {
  kicker: string;
  h1a: string;
  h1b: string; // accent line
  lede: string;
  panels: Array<{ n: string; h: string; p: string }>;
  cta: { label: string; href: string };
  scene: 'about' | 'pilots' | 'notes';
};

export function CinematicSubpage({ spec }: { spec: SubpageSpec }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups: Array<() => void> = [];
    const on = (t: EventTarget, e: string, fn: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) => {
      t.addEventListener(e, fn, opts);
      cleanups.push(() => t.removeEventListener(e, fn));
    };

    const canvas = root.querySelector('.subpage-canvas') as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FDFBF7');
    const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 0.6, 9);

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
    scene.environment = pmrem.fromScene(env, 0.02).texture;
    scene.add(new THREE.AmbientLight('#FFFFFF', 0.5));
    const key = new THREE.DirectionalLight('#FFFFFF', 2.5); key.position.set(5, 8, 5); scene.add(key);

    const brass = new THREE.MeshPhysicalMaterial({ color: '#B8964F', metalness: 1, roughness: 0.12, envMapIntensity: 1.6, clearcoat: 0.6 });
    const brassBright = new THREE.MeshPhysicalMaterial({ color: '#D4A843', metalness: 1, roughness: 0.07, envMapIntensity: 2.0, clearcoat: 0.8 });
    const chrome = new THREE.MeshPhysicalMaterial({ color: '#D6DADF', metalness: 1, roughness: 0.02, envMapIntensity: 2.4, clearcoat: 1 });
    const navy = new THREE.MeshPhysicalMaterial({ color: '#0C1836', metalness: 0.85, roughness: 0.06, envMapIntensity: 2.0, clearcoat: 1 });
    const glass = new THREE.MeshPhysicalMaterial({ color: '#E8EAEC', metalness: 0.1, roughness: 0.02, transmission: 0.95, thickness: 1.5, transparent: true, opacity: 0.8, envMapIntensity: 1.5 });

    const group = new THREE.Group();
    scene.add(group);
    const spinners: Array<{ m: THREE.Object3D; fn: (t: number) => void }> = [];

    if (spec.scene === 'about') {
      const heart = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), new THREE.MeshStandardMaterial({ color: '#D4A843', metalness: 0.5, roughness: 0.1, emissive: '#D4A843', emissiveIntensity: 0.4 }));
      group.add(heart);
      const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.16, 1), new THREE.MeshBasicMaterial({ color: '#D4A843', wireframe: true, transparent: true, opacity: 0.3 }));
      group.add(wire);
      const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.045, 16, 96), brassBright); r1.rotation.x = Math.PI / 2.5; group.add(r1);
      const r2 = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.03, 12, 72), chrome); r2.rotation.x = Math.PI / 2.8; r2.rotation.y = Math.PI / 4; group.add(r2);
      spinners.push({ m: heart, fn: (t) => { heart.rotation.y = t * 0.15; } });
      spinners.push({ m: wire, fn: (t) => { wire.rotation.y = -t * 0.1; wire.rotation.x = t * 0.05; } });
      spinners.push({ m: r1, fn: (t) => { r1.rotation.z = t * 0.06; } });
      spinners.push({ m: r2, fn: (t) => { r2.rotation.z = -t * 0.04; } });
    } else if (spec.scene === 'pilots') {
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.85, 48, 48), navy);
      group.add(core);
      const stops = [brass, chrome, brassBright, navy, chrome];
      const journeys: Array<{ m: THREE.Mesh; ph: number; r: number; sp: number }> = [];
      for (let i = 0; i < 5; i++) {
        const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), stops[i]);
        group.add(m);
        journeys.push({ m, ph: (i / 5) * Math.PI * 2, r: 2.6 + (i % 2) * 0.5, sp: 0.18 + i * 0.04 });
      }
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.035, 16, 96), brass); ring.rotation.x = Math.PI / 2.4; group.add(ring);
      spinners.push({ m: core, fn: (t) => { core.rotation.y = t * 0.1; } });
      spinners.push({ m: ring, fn: (t) => { ring.rotation.z = t * 0.05; } });
      journeys.forEach((j) => spinners.push({
        m: j.m,
        fn: (t) => {
          const a = j.ph + t * j.sp;
          j.m.position.set(Math.cos(a) * j.r, Math.sin(t * 0.35 + j.ph) * 0.6, Math.sin(a) * j.r);
          j.m.rotation.y = t * 0.3 + j.ph;
        },
      }));
    } else {
      // field notes — glass pages fanning
      for (let i = 0; i < 6; i++) {
        const page = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.06), i === 2 ? brassBright : glass.clone());
        page.position.z = -i * 0.35;
        page.rotation.z = (i - 2.5) * 0.06;
        group.add(page);
        const ii = i;
        spinners.push({ m: page, fn: (t) => { page.rotation.z = (ii - 2.5) * 0.06 + Math.sin(t * 0.4 + ii) * 0.03; } });
      }
    }
    group.position.set(2.8, 0, 0);

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
      spinners.forEach((s) => s.fn(t));
      group.rotation.y = t * 0.05 + prog * Math.PI * 0.25;
      group.position.x = 2.8 - prog * 4.5 + mx * 0.35;
      group.position.y = Math.sin(prog * Math.PI * 1.6) * 0.5 + my * 0.25;
      camera.position.x = mx * 0.8;
      camera.position.y = 0.6 - my * 0.35;
      camera.lookAt(group.position.x * 0.4, group.position.y * 0.4, 0);
      renderer.render(scene, camera);
    }
    tick();
    cleanups.push(() => cancelAnimationFrame(raf));
    cleanups.push(() => { pmrem.dispose(); renderer.dispose(); });
    return () => { cleanups.forEach((fn) => fn()); };
  }, [spec.scene]);

  return (
    <div className="cine" ref={rootRef} style={{ cursor: 'auto' }}>
      <canvas className="subpage-canvas" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
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
          <div className="kicker">{spec.kicker}</div>
          <h1>{spec.h1a}<br /><span className="accent">{spec.h1b}</span></h1>
          <p className="lede" style={{ marginTop: 16 }}>{spec.lede}</p>
        </header>

        <div className="page-body">
          <div className="sub-panels">
            {spec.panels.map((pn) => (
              <div className="part-card" key={pn.n}>
                <div className="pnum">{pn.n}</div><h4>{pn.h}</h4><p>{pn.p}</p>
              </div>
            ))}
          </div>
          <div className="sub-cta">
            <a className="btn btn-solid" href={spec.cta.href}>{spec.cta.label}</a>
            <a className="btn btn-glass" href="/ai-ready">begin — our agents read your site first</a>
          </div>
        </div>

        <CineFooter />
      </div>
    </div>
  );
}
