'use client';

import { useEffect, useRef } from 'react';
import { CineFooter } from './CineFooter';
import * as THREE from 'three';
import { PilotSprintCheckout } from '@/components/billing/PilotSprintCheckout';

/**
 * /pricing — Kate's pricing.html prototype, ported 1:1 (copy + tiers hers,
 * 2026-07-24). Same .cine design system as the homepage; its own small 3D
 * scene: two brass/chrome pricing crystals + ring drifting with scroll
 * (her Assembl3D.pricingGroup).
 *
 * NOTE FOR REVIEW: this REPLACES the live pilot-sprint Stripe checkout page.
 * Flagged to Kate before any merge.
 */
export function CinematicPricing({ checkoutConfigured }: { checkoutConfigured: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups: Array<() => void> = [];
    const on = (t: EventTarget, e: string, fn: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) => {
      t.addEventListener(e, fn, opts);
      cleanups.push(() => t.removeEventListener(e, fn));
    };

    const canvas = root.querySelector('#canvas-3d-pricing') as HTMLCanvasElement;
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

    const group = new THREE.Group();
    const c1 = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), brass);
    c1.position.set(-2, 0, 0); group.add(c1);
    const c2 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 0), chrome);
    c2.position.set(2, 0.5, 0); group.add(c2);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.04, 16, 96), brass);
    ring.rotation.x = Math.PI / 2.5; group.add(ring);
    group.position.set(3, 0, 0);
    scene.add(group);

    camera.position.set(0, 1, 8);
    camera.lookAt(0, 0, 0);

    let scroll = 0, mx = 0, my = 0, t = 0, raf = 0;
    on(window, 'scroll', () => { scroll = window.scrollY; }, { passive: true });
    on(document, 'mousemove', (ev) => {
      const e = ev as MouseEvent;
      mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2;
    });
    const onResize = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    };
    on(window, 'resize', onResize);

    function tick() {
      raf = requestAnimationFrame(tick);
      t += 0.016;
      const max = document.body.scrollHeight - innerHeight;
      const prog = max > 0 ? scroll / max : 0;
      group.rotation.y = t * 0.06 + prog * Math.PI * 0.15;
      group.position.y = Math.sin(prog * Math.PI * 1.8) * 0.4 + my * 0.2;
      group.position.x = 3 - prog * 5 + mx * 0.4;
      c1.rotation.y = t * 0.12; c1.rotation.x = Math.sin(t * 0.1) * 0.1;
      c2.rotation.y = -t * 0.1; c2.rotation.x = Math.sin(t * 0.08) * 0.08;
      ring.rotation.z = t * 0.05;
      camera.position.x = mx * 0.8;
      camera.position.y = 1 - my * 0.3;
      camera.lookAt(group.position.x * 0.4, group.position.y * 0.4, 0);
      renderer.render(scene, camera);
    }
    tick();
    cleanups.push(() => cancelAnimationFrame(raf));
    cleanups.push(() => { pmrem.dispose(); renderer.dispose(); });
    return () => { cleanups.forEach((fn) => fn()); };
  }, []);

  return (
    <div className="cine" ref={rootRef} style={{ cursor: 'auto' }}>
      <canvas id="canvas-3d-pricing" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
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
          <div className="kicker">pricing</div>
          <h1>Agents prepare.<br /><span className="accent">People decide.</span></h1>
          <p className="lede" style={{ marginTop: 16 }}>Start with something that gives you a result: build a small agent, make a moving visual, or see a Business Blueprint ripple through a fictional company.</p>
        </header>

        <div className="page-body">
          <div className="pricing-grid">
            <div className="price-card featured">
              <div className="price-badge">founding offer</div>
              <div className="price-tier">founding offer</div>
              <div className="price-amount">$1,500<span> +GST · one-off</span></div>
              <div className="price-desc">Your Business Blueprint and a working agent with a real customer journey — built with you, measured honestly.</div>
              <ul className="price-list">
                <li>Business Blueprint — your living source of truth</li>
                <li>One working agent — built around your facts</li>
                <li>One customer journey — end to end, traced</li>
                <li>Approval workflow — people stay in control</li>
                <li>Named support — direct line to the team</li>
                <li>NZ-hosted, NZ Privacy Act compliant</li>
              </ul>
              <PilotSprintCheckout configured={checkoutConfigured} />
            </div>
            <div className="price-card">
              <div className="price-badge">coming</div>
              <div className="price-tier">team</div>
              <div className="price-amount">$899<span>/mo</span></div>
              <div className="price-desc">For teams managing multiple customer journeys. More agents. Multiple surfaces. Shared evidence.</div>
              <ul className="price-list">
                <li>Everything in founding pilot</li>
                <li>Up to 5 agents — specialist team</li>
                <li>Multiple business surfaces</li>
                <li>Team inbox with shared drafts</li>
                <li>Proof lineage across all journeys</li>
                <li>Priority support</li>
              </ul>
              <a className="btn btn-solid" href="mailto:assembl@assembl.co.nz">join the waitlist</a>
            </div>
          </div>

          <div className="founding">
            <h2>The <span className="accent">founding offer</span></h2>
            <p>We&rsquo;re working closely with a small group of New Zealand businesses to replace one real repeat task with a supervised agent — and to measure the result honestly. If you have a job that costs time or creates avoidable risk, we&rsquo;d like to hear about it.</p>
          </div>
        </div>

        <CineFooter />
      </div>
    </div>
  );
}
