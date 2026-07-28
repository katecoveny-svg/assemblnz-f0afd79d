'use client';

import { useEffect, useRef, useState } from 'react';
import { CineFooter } from './CineFooter';
import * as THREE from 'three';

/**
 * /concepts — the public, name-free answer to "does this only work for
 * groceries?"
 *
 * Five industries, one architecture. A single 3D vitrine re-assembles into an
 * object that belongs to whichever industry is selected — a trolley basket, a
 * delta wing, a meter dial, a village roof, a stack of quotes — all built from
 * the same navy core, brass and chrome the rest of the site uses. That IS the
 * argument: the skeleton never changes, only the configuration does.
 *
 * Every named client is redacted here on purpose. The signed concept sites stay
 * private to the person they were prepared for.
 */

type Shape = 'trolley' | 'wing' | 'meter' | 'roof' | 'quote';

interface Journey {
  id: Shape;
  n: string;
  sector: string;
  wait: string;
  assembled: string;
  boundary: string;
  measured: string;
}

const JOURNEYS: Journey[] = [
  {
    id: 'trolley',
    n: '01',
    sector: 'Grocery & loyalty',
    wait: 'A shopper opens the app to plan the weekly shop and spends anywhere between five and forty minutes browsing. The app gives nothing back for that time.',
    assembled: 'The week ahead read from the household calendar, a basket drafted against the usual brands and the dietary rules, and one approval to review — not thirty decisions.',
    boundary: 'It can prepare a basket. It cannot buy, substitute or redeem. The retailer keeps the ledger and every consequential action.',
    measured: 'Minutes returned per shopper per week, completion of the wait, basket-review rate, and zero unapproved actions.',
  },
  {
    id: 'wing',
    n: '02',
    sector: 'Airline & travel',
    wait: 'A flight is delayed and several hundred people reach for their phones at once. The wait is spent in a queue, and it is where loyalty is won or lost.',
    assembled: 'Three ranked rebooking options prepared before the passenger reaches the desk — seat preference held, connection risk checked, the reason for the ranking written in plain words.',
    boundary: 'It can prepare options and stage them. It cannot rebook, refund or override an operations decision. Nothing is confirmed without the passenger and the airline both saying yes.',
    measured: 'Calls deflected, option-review rate, confirmed in-app rebookings, and zero unapproved actions.',
  },
  {
    id: 'meter',
    n: '03',
    sector: 'Energy & utilities',
    wait: 'The bill is being assembled and the customer does not know yet whether it is going to hurt. The first they hear of a bad month is the number itself.',
    assembled: 'The rise explained before it lands — this month against last, the weather that drove it, whether the meter looks normal, and one adjustment staged for review.',
    boundary: 'It can explain and stage. It cannot switch a plan, apply a credit or change a payment arrangement. The retailer approves anything that touches money.',
    measured: 'Bill-understanding uplift, calls asking "why is my bill this?", opt-in rate, and zero unapproved changes.',
  },
  {
    id: 'roof',
    n: '04',
    sector: 'Retirement living & care',
    wait: 'A family asks for the information pack about moving a parent, and what arrives is the same pack everyone gets. The hardest part — working out whether it is affordable and whether she would be happy — is left to them.',
    assembled: 'The same published guides, opened at the parts that apply to this family: her town, her price range, what the fees actually mean, and what happens if her needs change.',
    boundary: 'It can prepare reading and answer from published information. It touches no care record, no clinical system and no resident data. An advisor decides what is sent.',
    measured: 'Enquiry-to-visit rate, time to a first useful answer, and zero unapproved sends.',
  },
  {
    id: 'quote',
    n: '05',
    sector: 'Trades & professional services',
    wait: 'Someone asks for a quote on a Friday afternoon. It sits in an inbox until Monday, by which time two competitors have replied.',
    assembled: 'A draft quote built from the last job like it, the current rates and the questions still unanswered — ready for the owner to check on the phone and send in a minute.',
    boundary: 'It can draft and price from your own rate card. It cannot send, commit to a date or discount. You read it before the customer does.',
    measured: 'Time to first reply, quotes sent per week, win rate against the baseline, and zero unapproved sends.',
  },
];

/**
 * How many sectors we have actually mapped end to end. The homepage counts
 * this rather than quoting a number, so the two can never disagree.
 */
export const CONCEPT_SECTOR_COUNT = JOURNEYS.length;

export function CinematicConcepts() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const canvas = root.querySelector('#concepts-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const cleanups: Array<() => void> = [];
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0.6, 9.4);
    camera.lookAt(0, 0, 0);

    // Kate's softbox recipe — emissive panels baked into the env map are what
    // give chrome its specular streaks. Directional lights alone bake to black.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.background = new THREE.Color('#0A0A0D');
    const softbox = (color: string, w: number, h: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color }));
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    softbox('#FFFFFF', 14, 5, 0, 9, 0);
    softbox('#FFF6E8', 8, 12, -10, 2, 4);
    softbox('#E9EEF4', 8, 10, 10, 1, -3);
    softbox('#FFFFFF', 3, 14, 5, 2, 8);
    softbox('#D9DEE6', 16, 3, 0, -7, 0);
    scene.environment = pmrem.fromScene(env, 0.02).texture;
    scene.add(new THREE.AmbientLight('#FFFFFF', 0.5));
    const key = new THREE.DirectionalLight('#FFFFFF', 2.5);
    key.position.set(5, 8, 5);
    scene.add(key);

    // assembl's own palette — never the client's.
    const brass = new THREE.MeshPhysicalMaterial({ color: '#B8964F', metalness: 1, roughness: 0.12, envMapIntensity: 1.6, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    const brassBright = new THREE.MeshPhysicalMaterial({ color: '#D4A843', metalness: 1, roughness: 0.07, envMapIntensity: 2.0, clearcoat: 0.8, clearcoatRoughness: 0.1 });
    const chrome = new THREE.MeshPhysicalMaterial({ color: '#D6DADF', metalness: 1, roughness: 0.02, envMapIntensity: 2.4, clearcoat: 1, clearcoatRoughness: 0.03 });
    const navy = new THREE.MeshPhysicalMaterial({ color: '#0C1836', metalness: 0.85, roughness: 0.06, envMapIntensity: 2.0, clearcoat: 1, clearcoatRoughness: 0.05 });
    // Matte ceramic — the canon's material for volume. Flat metal faces mirror
    // the dark env and read as black holes; ceramic holds the light.
    const ceramic = new THREE.MeshPhysicalMaterial({ color: '#F1EFEA', metalness: 0, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: 0.9 });
    const ceramicDeep = new THREE.MeshPhysicalMaterial({ color: '#1B2436', metalness: 0.1, roughness: 0.34, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 1.1 });

    // Shared skeleton, present in every industry: the navy core and the two
    // rings. Only the industry form above changes.
    const group = new THREE.Group();
    scene.add(group);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 48), navy);
    group.add(core);
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.045, 16, 96), brass);
    ring1.rotation.x = Math.PI / 2.4;
    group.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.15, 0.03, 12, 72), chrome);
    ring2.rotation.x = Math.PI / 2.75;
    ring2.rotation.y = Math.PI / 4;
    group.add(ring2);

    /** The industry form. Rebuilt whenever the selection changes. */
    const form = new THREE.Group();
    group.add(form);

    const disposables: Array<THREE.BufferGeometry> = [];
    function clearForm() {
      [...form.children].forEach((c) => form.remove(c));
      disposables.forEach((g) => g.dispose());
      disposables.length = 0;
    }
    function add(geo: THREE.BufferGeometry, mat: THREE.Material, pos: [number, number, number], rot?: [number, number, number], scale?: [number, number, number]) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(...pos);
      if (rot) m.rotation.set(...rot);
      if (scale) m.scale.set(...scale);
      disposables.push(geo);
      form.add(m);
      return m;
    }

    function buildForm(shape: Shape) {
      clearForm();
      if (shape === 'trolley') {
        // basket + wheels + handle, with produce riding inside
        add(new THREE.BoxGeometry(2.1, 1.15, 1.25), ceramic, [0, 0.5, 0], [0, 0, 0.06]);
        add(new THREE.TorusGeometry(0.24, 0.075, 12, 28), ceramicDeep, [-0.66, -0.34, 0.52], [0, 0, 0]);
        add(new THREE.TorusGeometry(0.24, 0.075, 12, 28), ceramicDeep, [0.72, -0.34, 0.52], [0, 0, 0]);
        add(new THREE.TorusGeometry(0.62, 0.05, 12, 36, Math.PI), brassBright, [1.28, 1.06, 0], [0, 0, -0.5]);
        add(new THREE.SphereGeometry(0.3, 32, 32), brassBright, [-0.44, 1.2, 0.1]);
        add(new THREE.BoxGeometry(0.42, 0.42, 0.42), brass, [0.28, 1.24, -0.08], [0.3, 0.5, 0.1]);
        add(new THREE.CylinderGeometry(0.17, 0.17, 0.62, 24), ceramic, [0.92, 1.22, 0.14], [0, 0, 0.22]);
      } else if (shape === 'wing') {
        // delta wing + route ring + ranked options
        add(new THREE.ConeGeometry(0.95, 3.0, 3), ceramic, [0, 0.35, 0], [Math.PI / 2, 0, Math.PI], [1, 1, 0.34]);
        add(new THREE.BoxGeometry(0.24, 0.6, 1.5), ceramicDeep, [0, 0.72, -0.1], [0.25, 0, 0]);
        add(new THREE.TorusGeometry(1.85, 0.035, 12, 80), brassBright, [0, 0.3, 0], [Math.PI / 2.1, 0.4, 0]);
        [-1, 0, 1].forEach((i) => add(new THREE.OctahedronGeometry(0.2, 0), brass, [i * 0.86, -1.1, 0.35]));
      } else if (shape === 'meter') {
        // dial face + needle + usage bars
        add(new THREE.TorusGeometry(1.55, 0.11, 20, 72), chrome, [0, 0.35, 0], [0, 0, 0]);
        add(new THREE.CylinderGeometry(1.42, 1.42, 0.12, 48), ceramic, [0, 0.35, -0.06], [Math.PI / 2, 0, 0]);
        add(new THREE.BoxGeometry(0.09, 1.25, 0.09), brassBright, [0, 0.9, 0.1], [0, 0, -0.55]);
        add(new THREE.SphereGeometry(0.17, 24, 24), brassBright, [0, 0.35, 0.14]);
        [0, 1, 2, 3].forEach((i) => add(new THREE.BoxGeometry(0.26, 0.34 + i * 0.34, 0.26), i === 3 ? brass : ceramic, [-1.2 + i * 0.8, -1.5 + (0.34 + i * 0.34) / 2, 0.4]));
      } else if (shape === 'roof') {
        // a home, with the care continuum nested around it
        add(new THREE.BoxGeometry(1.6, 1.15, 1.35), ceramic, [0, -0.1, 0]);
        add(new THREE.ConeGeometry(1.35, 0.95, 4), brassBright, [0, 1.0, 0], [0, Math.PI / 4, 0]);
        add(new THREE.BoxGeometry(0.36, 0.66, 0.1), ceramicDeep, [0, -0.34, 0.7]);
        [1.95, 2.5, 3.05].forEach((r, i) =>
          add(new THREE.TorusGeometry(r, 0.028, 10, 64, Math.PI * 1.25), i === 1 ? brass : chrome, [0, -0.1, 0], [Math.PI / 2, 0, -0.5 + i * 0.4]),
        );
      } else {
        // a stack of drafts, clipped — the quote waiting to be checked
        [0, 1, 2].forEach((i) =>
          add(new THREE.BoxGeometry(1.75 - i * 0.06, 0.075, 2.35 - i * 0.06), i === 0 ? brassBright : ceramic, [i * 0.11, -0.35 + i * 0.3, -i * 0.12], [0, i * 0.07, 0]),
        );
        add(new THREE.TorusGeometry(0.34, 0.055, 12, 30, Math.PI * 1.5), brass, [0.2, 0.62, 0.9], [Math.PI / 2, 0, 0]);
        add(new THREE.SphereGeometry(0.22, 28, 28), ceramicDeep, [-0.62, 0.66, -0.5]);
      }
      form.position.y = 0.15;
    }

    buildForm(JOURNEYS[activeRef.current].id);
    let builtFor = activeRef.current;

    let t = 0;
    let raf = 0;
    let swap = 1; // 1 = settled, drops to 0 while the form re-assembles
    function tick() {
      raf = requestAnimationFrame(tick);
      t += 0.016;

      // Selection changed → shrink out, rebuild at the bottom, grow back in.
      if (builtFor !== activeRef.current) {
        swap -= 0.09;
        if (swap <= 0) {
          buildForm(JOURNEYS[activeRef.current].id);
          builtFor = activeRef.current;
          swap = 0.001;
        }
      } else if (swap < 1) {
        swap = Math.min(1, swap + 0.05);
      }

      const eased = swap * swap * (3 - 2 * swap);
      form.scale.setScalar(Math.max(0.001, eased));
      form.rotation.y = t * 0.28 + (1 - eased) * 1.4;

      core.rotation.y = t * 0.12;
      core.scale.setScalar(1 + Math.sin(t * 0.9) * 0.03);
      ring1.rotation.z = t * 0.05;
      ring2.rotation.z = -t * 0.035;
      group.rotation.y = Math.sin(t * 0.12) * 0.22;
      group.position.y = Math.sin(t * 0.5) * 0.09;

      renderer.render(scene, camera);
    }
    tick();
    cleanups.push(() => cancelAnimationFrame(raf));

    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
    cleanups.push(() => window.removeEventListener('resize', onResize));
    cleanups.push(() => {
      clearForm();
      pmrem.dispose();
      renderer.dispose();
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  const j = JOURNEYS[active];

  return (
    <div className="cine" ref={rootRef}>
      <div className="content">
        <nav className="nav">
          <a className="wordmark" href="/">assembl</a>
          <div className="nav-links">
            <a href="/concepts">concepts</a>
            <a href="/agents">agents</a>
            <a href="/pricing">pricing</a>
            <a href="/build-an-agent">build an agent</a>
          </div>
          <a className="nav-cta" href="/">← home</a>
        </nav>

        <header className="page-header" style={{ paddingBottom: 20 }}>
          <div className="kicker">concepts · how it works</div>
          <h1>Five industries.<br /><span className="accent">One architecture.</span></h1>
          <p className="lede" style={{ marginTop: 12 }}>
            The first of these was built for a grocery loyalty programme, so people ask whether it only works for groceries.
            It doesn&rsquo;t. Every one of these is the same shape: a moment your customer spends waiting, work prepared inside it,
            and a person who says yes before anything happens. Only the configuration changes — pick an industry and watch the
            object rebuild.
          </p>
        </header>

        <div className="page-body">
          <div className="concept-grid">
            <div className="concept-stage">
              <canvas id="concepts-canvas" />
              <div className="builder-hint"><span className="live-dot" />{j.sector.toLowerCase()}</div>
            </div>

            <div className="concept-read">
              <div className="concept-tabs">
                {JOURNEYS.map((x, i) => (
                  <button
                    key={x.id}
                    className={`concept-tab ${i === active ? 'active' : ''}`}
                    onClick={() => setActive(i)}
                  >
                    <span className="ct-n">{x.n}</span>
                    <span className="ct-s">{x.sector}</span>
                  </button>
                ))}
              </div>

              <div className="concept-detail">
                <dl>
                  <dt>the wait</dt><dd>{j.wait}</dd>
                  <dt>what gets assembled</dt><dd>{j.assembled}</dd>
                  <dt>the boundary</dt><dd>{j.boundary}</dd>
                  <dt>what gets measured</dt><dd>{j.measured}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="glass-panel concept-note">
            <div className="panel-header">the same four questions <span className="live">every industry</span></div>
            <p>
              Where does your customer already wait? What could be ready by the time they look? Who signs it off? And how would
              you know it worked? Answer those four and the journey is most of the way built — the industry only decides what
              gets prepared.
            </p>
            <p style={{ marginTop: 14 }}>
              Working versions of these exist, prepared for named businesses and shared privately with the person they were
              written for. The versions here are stripped of every client name on purpose.
            </p>
            <div className="concept-cta">
              <a className="btn btn-solid" href="/build-an-agent">assemble one from your website →</a>
              <a className="btn btn-glass" href="/ai-ready">see your industry's journey, drafted</a>
            </div>
          </div>
        </div>

        <CineFooter />
      </div>
    </div>
  );
}
