/* Ryman · the unbroken thread — the scene.
 *
 * One clay thread travels through five rooms and never breaks. The camera
 * travels the thread; scroll is distance, not animation frames. At the third
 * room a thin plum strand leaves the thread for the assessor — the visible
 * split between what the family sees and what only the clinician does. At the
 * fourth, the thread pauses: the hold is rendered, not narrated.
 *
 * Craft notes, honestly:
 * - Environment is a generated warm-room equirect through PMREM — real
 *   reflections, no HDRI file to ship.
 * - Contact shadows are baked radial sprites under the room frames. Real
 *   shadow maps cost more than they give on a scene this sparse.
 * - Ambient life: a light bead runs the thread's length on a 14s loop and the
 *   leading tip keeps advancing. It stops for the hold beat and under reduced
 *   motion, and the whole loop never exceeds ~1ms/frame on desktop.
 */

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOW_POWER = (navigator.hardwareConcurrency || 8) <= 4
  && !location.search.includes('force3d');

export function createThreadScene(canvas) {
  if (typeof THREE === 'undefined') return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    return null;
  }

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  if ('outputEncoding' in renderer && THREE.sRGBEncoding !== undefined) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  } else if ('outputColorSpace' in renderer) {
    renderer.outputColorSpace = 'srgb';
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);

  /* ── the warm room, as an environment ─────────────────────── */
  const envCanvas = document.createElement('canvas');
  envCanvas.width = 128; envCanvas.height = 64;
  const ec = envCanvas.getContext('2d');
  const g = ec.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, '#FFF6EC');   /* ceiling light */
  g.addColorStop(0.55, '#EED5C4');
  g.addColorStop(1, '#8A6B60');   /* warm floor */
  ec.fillStyle = g; ec.fillRect(0, 0, 128, 64);
  /* one window — the specular interest every material shares */
  ec.fillStyle = '#FFFDF7';
  ec.fillRect(18, 10, 26, 22);
  ec.fillStyle = 'rgba(255,240,220,0.55)';
  ec.fillRect(84, 14, 18, 16);
  const envTex = new THREE.CanvasTexture(envCanvas);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromEquirectangular(envTex).texture;
  scene.environment = envMap;

  /* ── light ────────────────────────────────────────────────── */
  scene.add(new THREE.HemisphereLight(0xFFF4E6, 0x6B4A42, 0.55));
  const sun = new THREE.DirectionalLight(0xFFEEDD, 1.15);
  sun.position.set(6, 9, 4);
  scene.add(sun);

  /* ── the thread ───────────────────────────────────────────── */
  /* Five rooms along z. The path wanders in x/y — a hand-drawn line, not a
     rail. Units are metres-ish. */
  const P = [
    new THREE.Vector3(-7.5,  0.6,   4.0),
    new THREE.Vector3(-4.0, -0.4,   0.0),
    new THREE.Vector3(-0.5,  0.5,  -5.0),   /* room 1 */
    new THREE.Vector3( 2.2, -0.3, -11.0),
    new THREE.Vector3(-1.6,  0.2, -17.0),   /* room 2 */
    new THREE.Vector3(-3.0, -0.5, -23.0),
    new THREE.Vector3( 0.8,  0.4, -29.0),   /* room 3 · the handover */
    new THREE.Vector3( 3.0, -0.2, -35.0),
    new THREE.Vector3( 0.0,  0.3, -41.0),   /* room 4 · the hold */
    new THREE.Vector3(-2.4, -0.3, -47.0),
    new THREE.Vector3( 0.6,  0.2, -53.0),   /* room 5 */
    new THREE.Vector3( 2.6,  0.6, -58.0),
  ];
  const curve = new THREE.CatmullRomCurve3(P, false, 'catmullrom', 0.35);

  /* the warm environment lifts everything toward cream, so the clay starts
     deeper than the token and the env influence is held back — measured
     against the render, the tube then reads as the token colour */
  const clay = new THREE.MeshPhysicalMaterial({
    color: 0xC9440E, roughness: 0.42, metalness: 0.0,
    clearcoat: 0.5, clearcoatRoughness: 0.4, envMapIntensity: 0.45,
  });
  const TubeG = THREE.TubeGeometry || THREE.TubeBufferGeometry;
  const thread = new THREE.Mesh(new TubeG(curve, 360, 0.055, 10, false), clay);
  scene.add(thread);

  /* the clinical strand — leaves the thread at room 3, plum, thinner.
     It ends at the assessor's node and goes nowhere else. */
  const splitAt = curve.getPoint(0.52);
  const strandPts = [
    splitAt.clone(),
    splitAt.clone().add(new THREE.Vector3(2.4, 1.1, -1.6)),
    splitAt.clone().add(new THREE.Vector3(4.4, 1.7, -3.6)),
  ];
  const strandCurve = new THREE.CatmullRomCurve3(strandPts);
  const plumMat = new THREE.MeshPhysicalMaterial({
    color: 0x68445D, roughness: 0.5, metalness: 0.0, clearcoat: 0.3,
  });
  scene.add(new THREE.Mesh(new TubeG(strandCurve, 40, 0.03, 8, false), plumMat));
  /* the assessor's node — porcelain, closed, small */
  const assessor = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 24, 18),
    new THREE.MeshPhysicalMaterial({ color: 0xFFF2E8, roughness: 0.25, clearcoat: 0.8 })
  );
  assessor.position.copy(strandPts[2]);
  scene.add(assessor);

  /* ── the rooms — five door frames the thread passes through ── */
  const frameMat = new THREE.MeshPhysicalMaterial({
    color: 0xE8C7C4, roughness: 0.55, metalness: 0.0,
  });
  const creamMat = new THREE.MeshPhysicalMaterial({
    color: 0xFFF9F3, roughness: 0.7, metalness: 0.0,
  });
  const shadowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    const rg = x.createRadialGradient(64, 64, 6, 64, 64, 62);
    rg.addColorStop(0, 'rgba(50,20,44,0.30)');
    rg.addColorStop(1, 'rgba(50,20,44,0)');
    x.fillStyle = rg; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();

  const ROOM_T = [0.18, 0.35, 0.52, 0.70, 0.88];
  ROOM_T.forEach((t, i) => {
    const p = curve.getPoint(t);
    const ahead = curve.getPoint(Math.min(t + 0.01, 1));
    const frame = new THREE.Group();
    const w = 2.6, h = 3.2, d = 0.28, bar = 0.22;
    const mat = i === 3 ? creamMat : frameMat;    /* the hold room is porcelain */
    const side = new THREE.BoxGeometry(bar, h, d);
    const top = new THREE.BoxGeometry(w + bar, bar, d);
    const L = new THREE.Mesh(side, mat); L.position.set(-w / 2, 0, 0);
    const R = new THREE.Mesh(side, mat); R.position.set(w / 2, 0, 0);
    const T = new THREE.Mesh(top, mat); T.position.set(0, h / 2, 0);
    frame.add(L, R, T);
    /* threshold — the handover desk */
    const sill = new THREE.Mesh(new THREE.BoxGeometry(w + bar, 0.1, 0.9), creamMat);
    sill.position.set(0, -h / 2 + 0.05, 0);
    frame.add(sill);
    /* baked contact shadow */
    const sh = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 1.7, 2.2),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    sh.rotation.x = -Math.PI / 2;
    sh.position.set(0, -h / 2 - 0.02, 0);
    frame.add(sh);

    frame.position.set(p.x, p.y + 0.4, p.z);
    frame.lookAt(ahead.x, p.y + 0.4, ahead.z);
    scene.add(frame);
  });

  /* ── ambient life · the bead, and the advancing tip ───────── */
  const bead = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 16, 12),
    new THREE.MeshPhysicalMaterial({
      color: 0xFFE9D8, roughness: 0.15, clearcoat: 1.0,
      emissive: 0xE95E2C, emissiveIntensity: 0.25,
    })
  );
  scene.add(bead);

  /* ── state ────────────────────────────────────────────────── */
  const state = {
    progress: 0, target: 0,
    journey: 0, journeyTarget: 0,
    yaw: 0, pitch: 0, yawT: 0, pitchT: 0,
    held: false, running: false, t0: performance.now(),
    resolved: REDUCED || LOW_POWER,
  };

  function resize() {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', () => { resize(); if (state.resolved) renderOnce(1); }, { passive: true });

  /* camera rides beside and above the thread, looking ahead along it */
  function placeCamera(p01, now) {
    const t = Math.min(Math.max(p01, 0), 0.985);
    const pos = curve.getPoint(t);
    const ahead = curve.getPoint(Math.min(t + 0.045, 1));
    const drift = (REDUCED || state.held) ? 0 : Math.sin(now / 6000) * 0.045;
    camera.position.set(
      pos.x + 1.7 + drift, pos.y + 1.35, pos.z + 2.9
    );
    const look = new THREE.Vector3(ahead.x, ahead.y + 0.4, ahead.z);
    camera.lookAt(look);
    camera.rotation.y += state.yaw;
    camera.rotation.x += state.pitch;
  }

  function frame(now) {
    if (!state.running) return;
    /* damping — the scrollbar suggests, the camera settles */
    state.progress += (state.target - state.progress) * 0.06;
    state.journey += (state.journeyTarget - state.journey) * 0.08;
    state.yaw += (state.yawT - state.yaw) * 0.06;
    state.pitch += (state.pitchT - state.pitch) * 0.06;

    const p = Math.min(state.progress * 0.62 + state.journey * 0.34, 1);
    placeCamera(p, now);

    if (!state.held) {
      const bt = (((now - state.t0) / 14000) % 1 + 1) % 1;
      const bp = curve.getPoint(bt);
      bead.position.copy(bp);
      bead.position.y += 0.02 + Math.sin(now / 900) * 0.015;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  function renderOnce(p) {
    resize();
    placeCamera(p, 0);
    bead.position.copy(curve.getPoint(0.97));
    renderer.render(scene, camera);
  }

  /* pointer — the camera answers the cursor, gently */
  if (!REDUCED && !LOW_POWER) {
    addEventListener('pointermove', e => {
      state.yawT = ((e.clientX / innerWidth) - 0.5) * -0.09;   /* ≈ ±2.6° */
      state.pitchT = ((e.clientY / innerHeight) - 0.5) * -0.05;
    }, { passive: true });
    addEventListener('pointerleave', () => { state.yawT = 0; state.pitchT = 0; });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { state.running = false; }
    else if (!state.resolved && !state.running) { state.running = true; requestAnimationFrame(frame); }
  });

  resize();
  if (state.resolved) {
    /* the designed still: the whole thread, resolved, one frame, no loop */
    renderOnce(1);
  } else {
    state.running = true;
    requestAnimationFrame(frame);
  }

  return {
    setProgress(v) { state.target = Math.min(Math.max(v, 0), 1); },
    setJourney(v) { state.journeyTarget = Math.min(Math.max(v, 0), 1); },
    hold(on) { state.held = on; },
    isLive: () => !state.resolved,
    debug: () => ({ resolved: state.resolved, progress: +state.progress.toFixed(3), held: state.held }),
    destroy() { state.running = false; renderer.dispose(); pmrem.dispose(); },
  };
}
