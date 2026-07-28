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
          <p className="lede" style={{ marginTop: 16 }}>
            $1,500 gets one real thing running in your business in about two weeks. Not a demo,
            not a slide deck. After that it&rsquo;s $250 a month to keep it working.
          </p>
          <p className="lede" style={{ marginTop: 10, opacity: 0.72 }}>
            <a href="/build-an-agent" style={{ textDecoration: 'underline' }}>Paste your website first</a>
            {' '}— it&rsquo;s free, and you&rsquo;ll see what we&rsquo;d be working from.
          </p>
        </header>

        <div className="page-body">
          <div className="pricing-grid">
            <div className="price-card featured">
              <div className="price-badge">the install</div>
              <div className="price-tier">the install</div>
              <div className="price-amount">$1,500<span> +GST · once</span></div>
              <div className="price-desc">
                Two weeks. At the end you have three things, and honest numbers on whether they helped.
              </div>
              <ul className="price-list">
                <li><b>A written record of how your business works</b> — what you sell, how you talk,
                  what needs your sign-off. A real document you can read and change.</li>
                <li><b>One agent doing one real job</b> — drafting a quote, preparing a booking,
                  pulling a claim together. Not a chatbot.</li>
                <li><b>One customer journey, start to finish</b> — every step recorded, so you can
                  see what it read and what it did.</li>
                <li>First month of running included</li>
                <li>NZ-hosted, NZ Privacy Act compliant</li>
              </ul>
              <PilotSprintCheckout configured={checkoutConfigured} />
            </div>
            <div className="price-card">
              <div className="price-badge">after that</div>
              <div className="price-tier">keep it running</div>
              <div className="price-amount">$250<span>/mo +GST</span></div>
              <div className="price-desc">
                Nothing switches off at the end of the install. This keeps it hosted, running and
                accurate when your prices, staff or policies change — which is most of the work.
              </div>
              <ul className="price-list">
                <li>Hosting and running costs</li>
                <li>Your written record kept current</li>
                <li>The agent re-checked against it</li>
                <li>Cancel any time — you keep the written record either way</li>
              </ul>
              <a className="btn btn-solid" href="/ai-ready">start with your own journey</a>
            </div>
          </div>

          <div className="founding" style={{ marginTop: 44 }}>
            <h2>As you <span className="accent">grow</span></h2>
            <p style={{ marginBottom: 24 }}>
              More agents when you want them, not before. Most people start with one and add a second
              when a different job starts annoying them — and by then your business is already written
              down, so the second one is quicker to build.
            </p>
            <div className="pricing-grid">
              <div className="price-card">
                <div className="price-tier">team</div>
                <div className="price-amount">$800<span>/mo +GST</span></div>
                <div className="price-desc">A few agents covering one full journey, end to end.</div>
                <ul className="price-list">
                  <li>Everything in keep it running</li>
                  <li>Several agents, each with its own written limits</li>
                  <li>One complete customer journey</li>
                  <li>Shared drafts your team can see</li>
                </ul>
                <a className="btn btn-ghost" href="/ai-ready">start with your own journey</a>
              </div>
              <div className="price-card">
                <div className="price-tier">outcome</div>
                <div className="price-amount">talk to us</div>
                <div className="price-desc">
                  Priced on the work delivered rather than on seats — for when the job is bigger than
                  one journey.
                </div>
                <ul className="price-list">
                  <li>Scoped against a result you name</li>
                  <li>A scorecard agreed before we start</li>
                  <li>Fail a line of it and we change the design or stop</li>
                </ul>
                <a className="btn btn-ghost" href="/ai-ready">start with your own journey</a>
              </div>
            </div>
          </div>

          <div className="founding" style={{ marginTop: 44 }}>
            <h2>What the two weeks <span className="accent">look like</span></h2>
            <p>
              <b>Week one</b> — we sit down and write your business down properly, then build the
              agent around it.<br />
              <b>Week two</b> — it runs against your real work. You watch it. We fix what&rsquo;s wrong.<br />
              <b>At the end</b> — a working agent, and honest numbers on whether it saved anyone time.
              If it didn&rsquo;t, we&rsquo;ll tell you.
            </p>
          </div>

          <div className="founding" style={{ marginTop: 44 }}>
            <h2>Before you pay <span className="accent">anything</span></h2>
            <p>
              <b>Paste your website.</b> We read one page, build an agent that knows your business,
              and show you the questions your site leaves hanging. About ten seconds, nothing saved.<br />
              <b>Ask the live agent something.</b> It answers from a sample business on the home page.<br />
              <b>The free tools.</b> Meeting notes, a 9am brief, share cards — one task each, no account.
            </p>
          </div>

          <p style={{ marginTop: 34, fontSize: 13, opacity: 0.6 }}>All prices NZD, GST exclusive.</p>
        </div>

        <CineFooter />
      </div>
    </div>
  );
}
