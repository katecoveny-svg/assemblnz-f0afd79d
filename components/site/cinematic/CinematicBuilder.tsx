'use client';

import { useEffect, useRef, useState } from 'react';
import { CineFooter } from './CineFooter';
import * as THREE from 'three';

/**
 * /build-an-agent — Kate's agent-builder.html prototype, ported 1:1.
 * A contained 3D vitrine: six clickable parts orbit a navy core with a brass
 * glow heart and two rings. Drag to rotate; click (or use the 01–06 selector)
 * to inspect a part; share copies an agent-recipe card. Her hot-env material
 * recipe (near-black env + very high envMapIntensity) kept as-is.
 */

const PARTS = [
  { n: 'memory', s: '01', q: 'What does it remember?', v: 'Customer preferences, past interactions, context that carries across sessions. Consent-based and data-minimised.', a: 'read/write · consent-based' },
  { n: 'knowledge', s: '02', q: 'What does it know?', v: 'Approved offers, prices, FAQs and business rules from the Blueprint. Reads only confirmed sources.', a: 'read only · confirmed sources' },
  { n: 'intelligence', s: '03', q: 'How does it reason?', v: 'Model selection, temperature, reasoning depth. Configurable per agent — tuned to the job.', a: 'configurable · testable' },
  { n: 'voice', s: '04', q: 'How does it speak?', v: 'Tone, formality, personality — warm, plain, helpful. Encoded from your business voice profile.', a: 'encoded · consistent' },
  { n: 'abilities', s: '05', q: 'What can it do?', v: 'Read, organise, compare and draft. Never sends, files, books or commits without approval.', a: 'bounded · visible' },
  { n: 'boundaries', s: '06', q: 'What stops it?', v: 'The operating limit — approval stays visible. The rule travels with the work.', a: 'enforced · traceable' },
];

export function CinematicBuilder() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const activeRef = useRef(active);
  activeRef.current = active;

  function copyCard() {
    const p = PARTS[activeRef.current];
    navigator.clipboard.writeText(
      `assembl agent recipe\n${p.s} — ${p.n} Agent\n\n${p.q}\n${p.v}\n\nAccess: ${p.a}\nnothing sends without approval\n\nassembl.co.nz`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups: Array<() => void> = [];
    const on = (t: EventTarget, e: string, fn: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) => {
      t.addEventListener(e, fn, opts);
      cleanups.push(() => t.removeEventListener(e, fn));
    };
    const onKey = (ev: Event) => { if ((ev as KeyboardEvent).key === 'Escape') setShareOpen(false); };
    on(document, 'keydown', onKey);

    const canvas = root.querySelector('#builder-canvas') as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FDFBF7');
    const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0.5, 10);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.background = new THREE.Color('#050505');
    let e1 = new THREE.DirectionalLight('#FFFFFF', 30); e1.position.set(5, 8, 5); env.add(e1);
    e1 = new THREE.DirectionalLight('#FFFFFF', 18); e1.position.set(-5, 3, 2); env.add(e1);
    scene.environment = pmrem.fromScene(env, 0.04).texture;
    scene.add(new THREE.AmbientLight('#FFFFFF', 0.35));
    const key = new THREE.DirectionalLight('#FFFFFF', 4); key.position.set(5, 8, 5); scene.add(key);

    const brass = new THREE.MeshStandardMaterial({ color: '#B8964F', metalness: 1, roughness: 0.06, envMapIntensity: 35 });
    const brassBright = new THREE.MeshStandardMaterial({ color: '#D4A843', metalness: 1, roughness: 0.04, envMapIntensity: 40 });
    const chrome = new THREE.MeshPhysicalMaterial({ color: '#C8CCD2', metalness: 1, roughness: 0.02, envMapIntensity: 35, clearcoat: 1 });
    const navy = new THREE.MeshStandardMaterial({ color: '#080D1A', metalness: 1, roughness: 0.05, envMapIntensity: 35, emissive: '#080D1A', emissiveIntensity: 0.1 });
    const navyDark = new THREE.MeshStandardMaterial({ color: '#050812', metalness: 1, roughness: 0.03, envMapIntensity: 40, emissive: '#050812', emissiveIntensity: 0.15 });

    const group = new THREE.Group();
    scene.add(group);
    group.position.y = -0.5;

    const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 64, 64), navy);
    group.add(core);
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.MeshStandardMaterial({ color: '#D4A843', metalness: 0.5, roughness: 0.1, emissive: '#D4A843', emissiveIntensity: 0.5, transparent: true, opacity: 0.95 }),
    );
    group.add(glow);
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.08, 16, 96), brassBright);
    ring1.rotation.x = Math.PI / 2.5; group.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.06, 12, 72), chrome);
    ring2.rotation.x = Math.PI / 2.8; ring2.rotation.y = Math.PI / 4; group.add(ring2);

    const partShapes = [
      { geo: new THREE.TorusGeometry(0.45, 0.12, 16, 40), mat: brass },
      { geo: new THREE.OctahedronGeometry(0.5, 0), mat: navyDark },
      { geo: new THREE.ConeGeometry(0.4, 0.85, 4), mat: chrome },
      { geo: new THREE.TorusGeometry(0.38, 0.1, 12, 32), mat: brass },
      { geo: new THREE.TetrahedronGeometry(0.48, 0), mat: navyDark },
      { geo: new THREE.IcosahedronGeometry(0.45, 0), mat: chrome },
    ];
    type PartMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    const partMeshes: PartMesh[] = partShapes.map((sh, i) => {
      const mesh = new THREE.Mesh(sh.geo, sh.mat.clone()) as PartMesh;
      mesh.userData = { index: i, baseR: 3.2, speed: 0.2 + i * 0.08, phase: i * 1.05, baseEmissive: (sh.mat as THREE.MeshStandardMaterial).emissiveIntensity || 0 };
      group.add(mesh);
      return mesh;
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false, dragged = false, prevX = 0, prevY = 0, hovered: number | null = null;

    on(canvas, 'mousedown', (ev) => { const e = ev as MouseEvent; isDragging = true; dragged = false; prevX = e.clientX; prevY = e.clientY; });
    on(canvas, 'mousemove', (ev) => {
      const e = ev as MouseEvent;
      if (isDragging) {
        const dx = e.clientX - prevX, dy = e.clientY - prevY;
        if (Math.abs(dx) + Math.abs(dy) > 2) dragged = true;
        group.rotation.y += dx * 0.005;
        group.rotation.x += dy * 0.003;
        prevX = e.clientX; prevY = e.clientY;
      }
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(partMeshes);
      hovered = hits.length > 0 ? (hits[0].object.userData.index as number) : null;
      canvas.style.cursor = hovered !== null ? 'pointer' : isDragging ? 'grabbing' : 'grab';
    });
    on(canvas, 'mouseup', () => { isDragging = false; });
    on(canvas, 'mouseleave', () => { isDragging = false; });
    on(canvas, 'click', (ev) => {
      if (dragged) return;
      const e = ev as MouseEvent;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(partMeshes);
      if (hits.length > 0) setActive(hits[0].object.userData.index as number);
    });

    let t = 0, raf = 0;
    function tick() {
      raf = requestAnimationFrame(tick);
      t += 0.016;
      core.rotation.y = t * 0.1;
      glow.rotation.y = -t * 0.15;
      ring1.rotation.z = t * 0.06;
      ring2.rotation.z = -t * 0.04;
      const act = activeRef.current;
      partMeshes.forEach((m, i) => {
        const d = m.userData;
        const a = d.phase + t * d.speed;
        m.position.set(Math.cos(a) * d.baseR, Math.sin(t * 0.3 + d.phase) * 0.8, Math.sin(a) * d.baseR);
        m.rotation.y = t * 0.25 + d.phase;
        m.rotation.x = Math.sin(t * 0.2 + d.phase) * 0.2;
        if (i === act) {
          m.material.emissive = new THREE.Color('#D4A843');
          m.material.emissiveIntensity = 0.3;
          m.scale.setScalar(1.15);
        } else if (i === hovered) {
          m.material.emissive = new THREE.Color('#D4A843');
          m.material.emissiveIntensity = 0.15 + Math.sin(t * 3) * 0.05;
          m.scale.setScalar(1);
        } else {
          m.material.emissive = new THREE.Color('#000000');
          m.material.emissiveIntensity = d.baseEmissive;
          m.scale.setScalar(1);
        }
      });
      renderer.render(scene, camera);
    }
    tick();
    cleanups.push(() => cancelAnimationFrame(raf));

    on(window, 'resize', () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    cleanups.push(() => { pmrem.dispose(); renderer.dispose(); });
    return () => { cleanups.forEach((fn) => fn()); };
  }, []);

  const p = PARTS[active];

  return (
    <div className="cine" ref={rootRef} style={{ cursor: 'auto' }}>
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

        <header className="page-header" style={{ paddingBottom: 24 }}>
          <div className="kicker">assemble an agent</div>
          <h1>Build intelligence<br /><span className="accent">you can see.</span></h1>
          <p className="lede" style={{ marginTop: 12 }}>Drag to rotate. Click a part to inspect what it does. Nothing sends without approval.</p>
        </header>

        <div className="page-body">
          <div className="builder-3d">
            <canvas id="builder-canvas" />
            <div className="builder-hint"><span className="live-dot" />interactive 3d — drag to rotate</div>
            <div className="part-selector">
              {PARTS.map((pp, i) => (
                <button key={pp.s} className={`part-btn-3d ${i === active ? 'active' : ''}`} onClick={() => setActive(i)}>{pp.s}</button>
              ))}
            </div>
            <div className="inspector-overlay show">
              <h3><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.48rem', color: 'var(--brass)' }}>{p.s}</span> {p.n}</h3>
              <dl>
                <dt>question</dt><dd>{p.q}</dd>
                <dt>configured value</dt><dd>{p.v}</dd>
                <dt>access</dt><dd>{p.a}</dd>
              </dl>
              <div className="proof-note">Approval stays visible. The rule travels with the work.</div>
            </div>
            <div className="builder-ui">
              <div>
                <div className="part-label">part {p.s} of 06</div>
                <div className="part-name">{p.n}</div>
                <div className="part-desc">{p.v}</div>
              </div>
              <div className="part-actions">
                <button className="btn btn-glass" onClick={() => setShareOpen(true)}>share ↗</button>
                <a className="btn btn-solid" href="mailto:assembl@assembl.co.nz">assemble →</a>
              </div>
            </div>
          </div>
        </div>

        <CineFooter />
      </div>

      {shareOpen ? (
        <div className="card-overlay show" onClick={(e) => { if (e.target === e.currentTarget) setShareOpen(false); }}>
          <div className="share-card">
            <button className="close-btn" onClick={() => setShareOpen(false)}>✕</button>
            <div className="sc-kicker">agent recipe · assembl</div>
            <div className="sc-title">{p.n} Agent</div>
            <div className="sc-parts">{PARTS.map((pp) => <span className="sc-p" key={pp.s}>{pp.s} {pp.n}</span>)}</div>
            <div className="sc-desc">{p.v}</div>
            <div className="sc-proof">nothing sends without approval · {p.a}</div>
            <div className="sc-actions">
              <button className="btn btn-solid" onClick={copyCard}>{copied ? 'copied!' : 'copy card'}</button>
              <button className="btn btn-glass" onClick={() => setShareOpen(false)}>close</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
