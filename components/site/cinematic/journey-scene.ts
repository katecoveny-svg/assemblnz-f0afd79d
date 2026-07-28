import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * THE JOURNEY — the homepage's 3D hero.
 *
 * Kate, 2026-07-28: "make this a literal customer agentic journey". So the
 * object is no longer an abstract knot; it is the route itself. A
 * CatmullRomCurve3 runs through six named stages of an agentic customer
 * journey. Work flows along it as travelling light. The camera rides a
 * parallel dolly path, so scrolling the page walks you down the route and each
 * stage explains itself in an HTML label pinned to its own 3D position.
 *
 * What it is made of, and why:
 *   · CatmullRomCurve3 + getPointAt(t)  — the route, and everything that moves
 *                                          on it. Closed, so the loop is
 *                                          literal: loyalty feeds the next
 *                                          enquiry.
 *   · TubeGeometry                       — the route made solid.
 *   · procedural albedo/normal/roughness — brushed metal generated onto a
 *                                          canvas at runtime. Real PBR maps
 *                                          with no asset bytes to ship, which
 *                                          is why there is nothing here for
 *                                          DRACO or KTX2 to compress: the
 *                                          geometry and the textures are both
 *                                          computed in the browser.
 *   · sine waves                          — stage rings breathe, the seed
 *                                          pulses, the whole route swells.
 *   · project()                           — each stage's world position is
 *                                          projected to screen space every
 *                                          frame and drives an HTML label.
 *   · GTAO + UnrealBloom                  — ambient occlusion so the parts sit
 *                                          in real contact, bloom so the brass
 *                                          reads as light.
 *
 * Guardrails learned the hard way: never fade the canvas (it is the page's
 * floor), always guard webglcontextlost, and hold a still frame under
 * prefers-reduced-motion rather than stopping dead.
 */

export type JourneyStage = {
  key: string;
  /** folio number shown on the label */
  n: string;
  /** the label itself */
  label: string;
  /** one plain line about what happens here */
  note: string;
};

export const JOURNEY_STAGES: JourneyStage[] = [
  { key: 'enquiry', n: '01', label: 'first enquiry', note: 'Someone arrives with a question.' },
  { key: 'wait', n: '02', label: 'the wait', note: 'Agents research, draft and check — in the open.' },
  { key: 'assembled', n: '03', label: 'assembled', note: 'The answer arrives already prepared.' },
  { key: 'boundary', n: '04', label: 'the boundary', note: 'What it may do, and what it may never do.' },
  { key: 'approval', n: '05', label: 'a person approves', note: 'A named human says yes. Nothing sends itself.' },
  { key: 'loyalty', n: '06', label: 'loyalty kept', note: 'The relationship is worth more than it was.' },
];

/** Where each stage sits in world space — a route that climbs as it travels. */
const STAGE_POINTS: [number, number, number][] = [
  [-9.4, -2.2, 1.6],
  [-5.6, 1.4, -2.4],
  [-1.6, -1.6, 2.6],
  [2.4, 1.8, -2.0],
  [6.2, -1.2, 1.8],
  [9.8, 2.0, -1.4],
];

type Opts = {
  canvas: HTMLCanvasElement;
  /** absolutely-positioned layer the stage labels are written into */
  labelLayer: HTMLElement;
  /** 0…1 — how far down the page we are; drives the camera along the route */
  getProgress: () => number;
  /** pointer parallax, -1…1 */
  getPointer: () => { x: number; y: number };
  /** called when the nearest stage changes, so the page can light its copy */
  onStage?: (index: number) => void;
};

/** Brushed-metal PBR set, drawn once onto canvases and reused by every part. */
function makeMetalMaps() {
  const S = 512;
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = c.height = S;
    return { c, x: c.getContext('2d')! };
  };

  // albedo — deep steel with a warm drift, streaked lengthwise
  const al = mk();
  const grad = al.x.createLinearGradient(0, 0, 0, S);
  grad.addColorStop(0, '#39424f');
  grad.addColorStop(0.5, '#5c6675');
  grad.addColorStop(1, '#2b333e');
  al.x.fillStyle = grad;
  al.x.fillRect(0, 0, S, S);

  // roughness — the same streaks, so highlights break up where the grain is
  const ro = mk();
  ro.x.fillStyle = '#3a3a3a';
  ro.x.fillRect(0, 0, S, S);

  // normal — flat blue, then per-streak lighting so the grain has relief
  const no = mk();
  no.x.fillStyle = '#8080ff';
  no.x.fillRect(0, 0, S, S);

  for (let i = 0; i < 1400; i++) {
    const y = Math.random() * S;
    const h = 0.5 + Math.random() * 1.8;
    const a = 0.03 + Math.random() * 0.10;
    al.x.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${a})`;
    al.x.fillRect(0, y, S, h);
    ro.x.fillStyle = `rgba(255,255,255,${a * 1.6})`;
    ro.x.fillRect(0, y, S, h);
    // a groove reads as a light edge above and a dark edge below
    no.x.fillStyle = `rgba(150,150,255,${a * 2.2})`;
    no.x.fillRect(0, y, S, h / 2);
    no.x.fillStyle = `rgba(110,110,255,${a * 2.2})`;
    no.x.fillRect(0, y + h / 2, S, h / 2);
  }

  const tex = (src: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(src);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(8, 1);
    t.anisotropy = 4;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };

  return {
    map: tex(al.c, true),
    roughnessMap: tex(ro.c, false),
    normalMap: tex(no.c, false),
  };
}

export function mountJourneyScene(opts: Opts): () => void {
  const { canvas, labelLayer, getProgress, getPointer, onStage } = opts;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dispose: Array<() => void> = [];
  let raf = 0;
  let lost = false;

  // A viewport of zero — a collapsed pane, a display:none ancestor at mount,
  // a browser reporting 0 before first layout — makes aspect NaN, which
  // poisons the projection matrix permanently: every subsequent frame renders
  // an empty screen even after the window comes back. Never let it be zero.
  const vw = () => Math.max(1, innerWidth);
  const vh = () => Math.max(1, innerHeight);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(vw(), vh());
  const DPR = Math.min(devicePixelRatio, 2);
  renderer.setPixelRatio(DPR);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;

  const NAVY = '#050F1C';
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(NAVY);
  scene.fog = new THREE.FogExp2(NAVY, 0.021);

  const camera = new THREE.PerspectiveCamera(42, vw() / vh(), 0.1, 120);

  // ── environment: the studio softboxes that make chrome read as chrome ──
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.background = new THREE.Color('#0A0A0D');
  const BOOST = 2.6;
  const softbox = (color: string, w: number, h: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(BOOST) }),
    );
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  softbox('#FFFFFF', 16, 6, 0, 10, 0);
  softbox('#FFF6E8', 9, 14, -12, 2, 5);
  softbox('#E9EEF4', 9, 12, 12, 1, -4);
  softbox('#D4A843', 18, 3, 0, -8, 0);
  scene.environment = pmrem.fromScene(env, 0.02).texture;

  scene.add(new THREE.AmbientLight('#FFFFFF', 0.32));
  const key = new THREE.DirectionalLight('#FFFFFF', 1.7);
  key.position.set(5, 9, 6);
  scene.add(key);
  const goldRim = new THREE.PointLight('#D4A843', 60, 34, 1.6);
  goldRim.position.set(-4, -2, 5);
  scene.add(goldRim);
  const coolRim = new THREE.PointLight('#DCE6F2', 36, 30, 1.7);
  coolRim.position.set(6, 4, 4);
  scene.add(coolRim);

  // ── the route ──
  const maps = makeMetalMaps();
  const curve = new THREE.CatmullRomCurve3(
    STAGE_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    true,          // closed: loyalty feeds the next enquiry, so the loop is literal
    'catmullrom',
    0.5,
  );

  const railMat = new THREE.MeshPhysicalMaterial({
    ...maps,
    metalness: 1,
    roughness: 0.24,
    envMapIntensity: 2.1,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  });
  const rail = new THREE.Mesh(new THREE.TubeGeometry(curve, 900, 0.055, 18, true), railMat);
  scene.add(rail);

  // a hairline gold thread shadowing the rail — the assembl accent, and the
  // thing bloom actually catches
  const threadMat = new THREE.MeshPhysicalMaterial({
    color: '#D4A843',
    metalness: 1,
    roughness: 0.08,
    envMapIntensity: 2.4,
    emissive: new THREE.Color('#D4A843'),
    emissiveIntensity: 0.16,
  });
  const thread = new THREE.Mesh(new THREE.TubeGeometry(curve, 900, 0.013, 10, true), threadMat);
  scene.add(thread);

  // ── stage nodes: a docking ring + a core at each stop on the route ──
  // The control points themselves, NOT curve.getPointAt(i/n): getPointAt is
  // arc-length parameterised, so on an irregular route it lands between the
  // stages rather than on them, and the camera ends up looking at empty space.
  const stageAt = STAGE_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const ringGeo = new THREE.TorusGeometry(0.42, 0.022, 12, 96);
  const coreGeo = new THREE.SphereGeometry(0.15, 32, 32);

  const nodes = JOURNEY_STAGES.map((_, i) => {
    const g = new THREE.Group();
    g.position.copy(stageAt[i]);

    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshPhysicalMaterial({
        color: '#D6DADF',
        metalness: 1,
        roughness: 0.05,
        envMapIntensity: 2.4,
        clearcoat: 1,
      }),
    );
    const ring2 = new THREE.Mesh(
      ringGeo,
      new THREE.MeshPhysicalMaterial({
        color: '#D4A843',
        metalness: 1,
        roughness: 0.1,
        envMapIntensity: 2.2,
      }),
    );
    ring2.scale.setScalar(0.72);
    ring2.rotation.x = Math.PI / 2;

    const core = new THREE.Mesh(
      coreGeo,
      new THREE.MeshPhysicalMaterial({
        color: '#0C1836',
        metalness: 0.9,
        roughness: 0.05,
        envMapIntensity: 2.2,
        clearcoat: 1,
        emissive: new THREE.Color('#D4A843'),
        emissiveIntensity: 0.05,
      }),
    );

    g.add(ring, ring2, core);
    scene.add(g);
    return { g, ring, ring2, core, base: stageAt[i].clone() };
  });

  // ── travellers: the work itself, flowing the route and looping forever ──
  const TRAVELLERS = reduced ? 4 : 9;
  const travGeo = new THREE.SphereGeometry(0.062, 20, 20);
  const travMat = new THREE.MeshStandardMaterial({
    color: '#F6E7B5',
    emissive: new THREE.Color('#D4A843'),
    emissiveIntensity: 2.6,
    metalness: 0.4,
    roughness: 0.3,
  });
  const travellers = Array.from({ length: TRAVELLERS }, (_, i) => {
    const m = new THREE.Mesh(travGeo, travMat);
    scene.add(m);
    return { m, offset: i / TRAVELLERS };
  });

  // ── dust, so the space has air in it ──
  const N = 260;
  const pGeo = new THREE.BufferGeometry();
  const pp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pp[i * 3] = (Math.random() - 0.5) * 34;
    pp[i * 3 + 1] = (Math.random() - 0.5) * 16;
    pp[i * 3 + 2] = (Math.random() - 0.5) * 22;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const dust = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: '#D4A843', size: 0.045, transparent: true, opacity: 0.5 }),
  );
  scene.add(dust);

  // ── post: ambient occlusion, then bloom ──
  // GTAO is the expensive one, so it is desktop-only and off for anyone who
  // asked for reduced motion. Bloom is cheap enough to always run.
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(DPR);
  composer.setSize(vw(), vh());
  composer.addPass(new RenderPass(scene, camera));

  const wantAO = !reduced && innerWidth >= 1024 && DPR <= 2;
  let gtao: GTAOPass | null = null;
  if (wantAO) {
    gtao = new GTAOPass(scene, camera, vw(), vh());
    gtao.output = GTAOPass.OUTPUT.Default;
    // shallow radius: we want parts to sit in contact, not a dirty scene
    gtao.updateGtaoMaterial({ radius: 0.24, distanceExponent: 1, thickness: 1, scale: 1.1 });
    composer.addPass(gtao);
  }

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(vw(), vh()),
    0.44,   // strength — at 0.62 the active node blew out and ate its own label
    0.68,   // radius
    0.82,   // threshold: only the travellers and the hottest highlights bloom
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ── HTML labels pinned to 3D stage positions ──
  labelLayer.innerHTML = '';
  const labels = JOURNEY_STAGES.map((s) => {
    const el = document.createElement('div');
    el.className = 'jl';
    el.innerHTML =
      `<span class="jl-n">${s.n}</span>` +
      `<span class="jl-label">${s.label}</span>` +
      `<span class="jl-note">${s.note}</span>`;
    labelLayer.appendChild(el);
    return el;
  });
  const proj = new THREE.Vector3();

  // ── camera rig ──
  // The camera rides its own curve, parallel to the route and pulled back, and
  // looks at a point offset LEFT of the stage — which puts the stage itself on
  // the right of the frame, off the copy column. The copy column is sacred.
  const camPts = STAGE_POINTS.map(([x, y, z]) => new THREE.Vector3(x - 1.6, y + 1.5, z + 7.4));
  const camCurve = new THREE.CatmullRomCurve3(camPts, true, 'catmullrom', 0.5);
  const lookPts = STAGE_POINTS.map(([x, y, z]) => new THREE.Vector3(x - 3.1, y - 0.1, z));
  const lookCurve = new THREE.CatmullRomCurve3(lookPts, true, 'catmullrom', 0.5);

  const camPos = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  let stageNow = -1;
  let t = 0;
  // The camera curves are sampled with getPoint, not getPointAt: getPoint on a
  // closed curve of n control points puts control point i exactly at i/n, so
  // scroll position i/(n-1) lands the camera precisely on stage i. Arc length
  // would drift the stops off the stages. The route is closed, so the last
  // stage sits at (n-1)/n and the final segment is the loop closing behind us.
  const SPAN = (JOURNEY_STAGES.length - 1) / JOURNEY_STAGES.length;

  // Wider windows show more world, so a fixed camera offset lets the route
  // drift back over the headline. Push the look-target further left the wider
  // we get, exactly as the old scene had to.
  function sideBias() {
    const aspect = vw() / vh();
    return Math.min(2.4, Math.max(0.9, aspect / 1.6));
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    if (lost) return;
    // No document.hidden guard: requestAnimationFrame already stops firing on
    // a hidden page, and the explicit check additionally blanked the scene in
    // any headless capture, where the page reports hidden but still paints.

    t += 0.016;
    const tt = reduced ? 0 : t;
    const prog = Math.min(1, Math.max(0, getProgress()));
    const ptr = getPointer();

    // where we are along the route
    const u = prog * SPAN;

    camCurve.getPoint(u % 1, camPos);
    lookCurve.getPoint(u % 1, lookAt);
    const bias = sideBias();
    lookAt.x -= (bias - 1) * 2.2;

    camera.position.set(
      camPos.x + ptr.x * 0.8,
      camPos.y - ptr.y * 0.5 + Math.sin(tt * 0.35) * 0.14,
      camPos.z,
    );
    camera.lookAt(lookAt);

    // the route breathes
    const swell = 1 + Math.sin(tt * 0.42) * 0.012;
    rail.scale.setScalar(swell);
    thread.scale.setScalar(swell);
    thread.rotation.z = Math.sin(tt * 0.18) * 0.01;

    // grain crawls along the rail so the metal has direction of travel
    maps.map.offset.x = -tt * 0.012;
    maps.roughnessMap.offset.x = -tt * 0.012;
    maps.normalMap.offset.x = -tt * 0.012;

    // travellers ride the curve and loop
    for (let i = 0; i < travellers.length; i++) {
      const tr = travellers[i];
      const at = (tt * 0.035 + tr.offset) % 1;
      curve.getPointAt(at, tmp);
      tr.m.position.copy(tmp);
      // each one pulses slightly out of phase — it reads as many small jobs,
      // not one train
      const beat = 1 + Math.sin(tt * 2.4 + i * 1.7) * 0.22;
      tr.m.scale.setScalar(beat);
    }

    // nearest stage → which copy is lit
    const nearest = Math.min(
      JOURNEY_STAGES.length - 1,
      Math.round(prog * (JOURNEY_STAGES.length - 1)),
    );
    if (nearest !== stageNow) {
      stageNow = nearest;
      onStage?.(nearest);
    }

    // stage nodes: breathe on a sine, and the active one opens up
    for (let i = 0; i < nodes.length; i++) {
      const nd = nodes[i];
      const active = i === stageNow;
      nd.g.position.y = nd.base.y + Math.sin(tt * 0.9 + i * 1.1) * 0.1;
      nd.g.rotation.y = tt * 0.22 + i;
      nd.ring.rotation.z = tt * 0.5 + i;
      nd.ring2.rotation.z = -tt * 0.7;
      const want = active ? 1.5 + Math.sin(tt * 1.6) * 0.06 : 1;
      nd.g.scale.setScalar(nd.g.scale.x + (want - nd.g.scale.x) * 0.08);
      const cm = nd.core.material as THREE.MeshPhysicalMaterial;
      const wantE = active ? 0.85 + Math.sin(tt * 2.2) * 0.18 : 0.05;
      cm.emissiveIntensity += (wantE - cm.emissiveIntensity) * 0.08;
    }

    dust.rotation.y = tt * 0.006;

    // ── project each stage to screen and drive its HTML label ──
    for (let i = 0; i < labels.length; i++) {
      const el = labels[i];
      proj.copy(nodes[i].g.position).project(camera);
      const behind = proj.z > 1;
      const x = (proj.x * 0.5 + 0.5) * innerWidth;
      const y = (-proj.y * 0.5 + 0.5) * innerHeight;
      const onScreen =
        !behind && x > -80 && x < innerWidth + 80 && y > -40 && y < innerHeight + 40;
      // only the active stage is fully legible; its neighbours ghost in
      const near = 1 - Math.min(1, Math.abs(i - stageNow));
      const o = onScreen ? (i === stageNow ? 1 : near * 0.28) : 0;
      el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      el.style.opacity = String(o);
      el.classList.toggle('jl-on', i === stageNow && onScreen);
      // The label hangs to the upper right of its node, which walks it off the
      // screen edge whenever the node itself is near the right of frame. Flip
      // it to the other side rather than letting it clip.
      el.classList.toggle('jl-flip', x > vw() - 300);
    }

    composer.render();
  }

  // ── lifecycle ──
  const onResize = () => {
    camera.aspect = vw() / vh();
    camera.updateProjectionMatrix();
    renderer.setSize(vw(), vh());
    composer.setSize(vw(), vh());
    bloom.setSize(vw(), vh());
    gtao?.setSize(vw(), vh());
  };
  addEventListener('resize', onResize);
  dispose.push(() => removeEventListener('resize', onResize));

  // A lost context used to leave the page as a black slab. Stop the loop, keep
  // the last frame, and pick back up if the browser hands the context back.
  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
  };
  const onRestored = () => {
    lost = false;
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);
  dispose.push(() => {
    canvas.removeEventListener('webglcontextlost', onLost);
    canvas.removeEventListener('webglcontextrestored', onRestored);
  });

  frame();

  // visual-QA hook: the page cannot be photographed while scrolled, so the
  // only way to check framing is to interrogate the rig directly.
  (window as unknown as Record<string, unknown>).__journey = {
    camera,
    curve,
    nodes,
    stageAt,
    get pose() {
      return {
        cam: camera.position.toArray().map((n) => +n.toFixed(2)),
        nodes: nodes.map((n) => n.g.position.toArray().map((v) => +v.toFixed(2))),
      };
    },
  };

  return () => {
    cancelAnimationFrame(raf);
    dispose.forEach((fn) => fn());
    labelLayer.innerHTML = '';
    composer.dispose();
    gtao?.dispose();
    bloom.dispose();
    pmrem.dispose();
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    maps.map.dispose();
    maps.normalMap.dispose();
    maps.roughnessMap.dispose();
    renderer.dispose();
  };
}
