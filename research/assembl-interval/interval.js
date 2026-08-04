/* the interval — assembl's signature object.
 *
 * Six material parts assemble around an intentionally open centre. One part
 * moves at a time; the system reads 100% only when the proof part lands; the
 * resolved form stays slightly alive. The silhouette is fixed — nothing here
 * is randomised, because recognition depends on repetition.
 *
 * Reduced motion and low-power devices get the three stable states — parts,
 * assembly, proof — rendered once each, no loop. No WebGL gets the same three
 * states drawn flat. The centre is never filled in any of them.
 */

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOW_POWER = (navigator.hardwareConcurrency || 8) <= 4
  && !location.search.includes('force3d');
const STATIC_MODE = REDUCED || LOW_POWER;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const PARTS = [
  { id: 'context',     label: 'context' },
  { id: 'permission',  label: 'permission' },
  { id: 'runtime',     label: 'runtime' },
  { id: 'specialists', label: 'specialists' },
  { id: 'wait',        label: 'active wait' },
  { id: 'proof',       label: 'proof' },
];

/* ring seats — a fixed hexagon around the open centre. The silhouette. */
const RING_R = 1.95;
const seat = i => {
  const a = -Math.PI / 2 + i * (Math.PI * 2 / 6);
  return { x: Math.cos(a) * RING_R, y: 0.42, z: Math.sin(a) * RING_R, a };
};

/* the knolled field — a disciplined 3×2 lay, fixed forever */
const LAY = [
  { x: -2.3, y: 0.1, z: -1.15 }, { x: 0, y: 0.1, z: -1.15 }, { x: 2.3, y: 0.1, z: -1.15 },
  { x: -2.3, y: 0.1, z: 1.15 },  { x: 0, y: 0.1, z: 1.15 },  { x: 2.3, y: 0.1, z: 1.15 },
];

function buildScene() {
  const scene = new THREE.Scene();

  /* neutral studio environment — silver and glass need a room to reflect */
  const ec = document.createElement('canvas');
  ec.width = 128; ec.height = 64;
  const x = ec.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, '#F4F3EE');
  g.addColorStop(0.5, '#C9C8C2');
  g.addColorStop(1, '#4A4C4A');
  x.fillStyle = g; x.fillRect(0, 0, 128, 64);
  x.fillStyle = '#FFFFFF'; x.fillRect(14, 8, 24, 18);
  x.fillStyle = 'rgba(255,255,255,0.7)'; x.fillRect(88, 12, 16, 14);
  const envTex = new THREE.CanvasTexture(ec);
  envTex.mapping = THREE.EquirectangularReflectionMapping;

  scene.add(new THREE.HemisphereLight(0xF4F1EA, 0x3A3C3A, 0.5));
  const key = new THREE.DirectionalLight(0xFFF6E8, 1.2);
  key.position.set(5, 8, 3);
  scene.add(key);

  /* materials — porcelain, dark alloy, optical glass, silver, coral */
  const porcelain = new THREE.MeshPhysicalMaterial({
    color: 0xF4F1EC, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.25,
  });
  const alloy = new THREE.MeshPhysicalMaterial({
    color: 0x23272B, metalness: 0.85, roughness: 0.35, envMapIntensity: 0.9,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xEAF2F0, metalness: 0, roughness: 0.06,
    transmission: 0.9, thickness: 0.4, transparent: true, opacity: 0.9,
    envMapIntensity: 1.2,
  });
  const silver = new THREE.MeshPhysicalMaterial({
    color: 0xC9CBCC, metalness: 0.95, roughness: 0.24, envMapIntensity: 1.1,
  });
  const coral = new THREE.MeshPhysicalMaterial({
    color: 0xFF573F, roughness: 0.42, clearcoat: 0.5,
    emissive: 0xFF573F, emissiveIntensity: 0.05,
  });
  const proofFace = new THREE.MeshPhysicalMaterial({
    color: 0xD9D8D1, metalness: 0.4, roughness: 0.3,
    emissive: 0x000000, emissiveIntensity: 0,
  });

  /* the six parts — fixed geometry, distinct materials */
  const groups = [];

  const context = new THREE.Group();
  context.add(new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.15, 0.75), porcelain));
  const inset = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.03, 0.52), silver);
  inset.position.y = 0.09; context.add(inset);
  groups.push(context);

  const permission = new THREE.Group();
  permission.add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.07, 48), glass));
  const permRim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.022, 12, 48), silver);
  permRim.rotation.x = Math.PI / 2; permission.add(permRim);
  groups.push(permission);

  const runtime = new THREE.Group();
  runtime.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.34, 6), alloy));
  const runCap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 6), silver);
  runCap.position.y = 0.2; runtime.add(runCap);
  groups.push(runtime);

  const specialists = new THREE.Group();
  [[-0.22, 0], [0.22, 0], [0, 0.3]].forEach(([px, pz]) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4, 24), silver);
    c.position.set(px, 0.1, pz - 0.1);
    specialists.add(c);
  });
  const specBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.62), alloy);
  specBase.position.y = -0.1; specialists.add(specBase);
  groups.push(specialists);

  const wait = new THREE.Group();
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.09, 16, 60, 4.6), coral);
  arc.rotation.x = Math.PI / 2; arc.rotation.z = 0.9;
  wait.add(arc);
  groups.push(wait);

  const proof = new THREE.Group();
  proof.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.09, 40), silver));
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 40), proofFace);
  face.position.y = 0.06; proof.add(face);
  groups.push(proof);

  groups.forEach((gr, i) => {
    gr.position.set(LAY[i].x, LAY[i].y, LAY[i].z);
    scene.add(gr);
  });

  /* baked contact shadows — one sprite per part, moving with it */
  const shTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const sx = c.getContext('2d');
    const rg = sx.createRadialGradient(64, 64, 4, 64, 64, 62);
    rg.addColorStop(0, 'rgba(10,12,12,0.42)');
    rg.addColorStop(1, 'rgba(10,12,12,0)');
    sx.fillStyle = rg; sx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const shadows = groups.map(() => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.5),
      new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.005;
    scene.add(m);
    return m;
  });

  return { scene, envTex, groups, shadows, coral, proofFace };
}

/* part i's assembly window inside [a0, a1] — one part at a time */
const smooth = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
function partProgress(i, p) {
  const A0 = 0.28, A1 = 0.80, LOCK0 = 0.80, LOCK1 = 0.90;
  if (i === 5) return smooth((p - LOCK0) / (LOCK1 - LOCK0));   /* proof: the lock */
  const span = (A1 - A0) / 5;
  return smooth((p - (A0 + i * span)) / span);
}

function poseParts(ctx, p, now) {
  const { groups, shadows, coral, proofFace } = ctx;
  let landed = 0;
  groups.forEach((gr, i) => {
    const t = partProgress(i, p);
    if (t >= 1) landed += 1;
    const s = seat(i);
    const lift = Math.sin(Math.PI * t) * 1.1;   /* the travel arc */
    gr.position.set(
      LAY[i].x + (s.x - LAY[i].x) * t,
      LAY[i].y + (s.y - LAY[i].y) * t + lift,
      LAY[i].z + (s.z - LAY[i].z) * t
    );
    gr.rotation.y = (-s.a + Math.PI / 2) * t;
    const sh = shadows[i];
    sh.position.x = gr.position.x;
    sh.position.z = gr.position.z;
    const h = gr.position.y;
    sh.material.opacity = Math.max(0.15, 1 - h * 0.55);
    sh.scale.setScalar(1 + h * 0.35);
  });
  /* the resolved form stays slightly alive */
  const alive = p >= 0.9 && !REDUCED;
  coral.emissiveIntensity = alive ? 0.08 + Math.sin(now / 1400) * 0.06 : 0.05;
  /* proof face verifies green only when it has actually landed */
  const locked = partProgress(5, p) >= 1;
  proofFace.emissive.setHex(locked ? 0x28B56D : 0x000000);
  proofFace.emissiveIntensity = locked ? 0.55 : 0;
  proofFace.color.setHex(locked ? 0x2FBF75 : 0xD9D8D1);
  return { landed, locked };
}

function placeCamera(camera, p, yaw, pitch, now) {
  /* overhead flat field → three-quarter view → slow orbit in the hold */
  const t = smooth((p - 0.16) / 0.5);
  const orbit = p >= 0.9 && !REDUCED ? Math.sin(now / 9000) * 0.07 : 0;
  const a = -0.9 + orbit + yaw;
  /* overhead → a three-quarter view far enough back that the whole ring and
     its open centre read as one object */
  const d = 0.01 + t * 5.6;
  const y = 8.6 - t * 4.2;
  camera.position.set(Math.cos(a) * d, y, Math.sin(a) * d + (1 - t) * 0.01);
  camera.lookAt(0, 0.3 * t, 0);
  camera.rotation.x += pitch;
}

function beatFor(p) {
  if (p < 0.14) return 'reveal';
  if (p < 0.28) return 'orient';
  if (p < 0.80) return 'assemble';
  if (p < 0.90) return 'lock';
  return 'hold';
}

/* ── boot ───────────────────────────────────────────────────── */
const canvas = $('#scene');
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
} catch (e) { renderer = null; }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  if ('outputEncoding' in renderer && THREE.sRGBEncoding !== undefined) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
}

const ctx = renderer ? buildScene() : null;
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
if (ctx) {
  ctx.scene.environment = new THREE.PMREMGenerator(renderer)
    .fromEquirectangular(ctx.envTex).texture;
}

const stage = $('[data-stage]');
const beatEl = $('[data-beat]');
const pctEl = $('[data-pct]');

/* callouts */
const calloutEls = PARTS.map(part => {
  const el = document.createElement('span');
  el.className = 'callout';
  el.textContent = part.label;
  $('[data-callouts]').appendChild(el);
  return el;
});

function projectCallouts(p) {
  if (!ctx) return;
  const on = p >= 0.14 && p < 0.84;
  ctx.groups.forEach((gr, i) => {
    const el = calloutEls[i];
    el.classList.toggle('is-on', on && p >= 0.14 + i * 0.012);
    if (!on) return;
    const v = gr.position.clone();
    v.y += 0.5;
    v.project(camera);
    el.style.left = ((v.x * 0.5 + 0.5) * canvas.clientWidth) + 'px';
    el.style.top = ((-v.y * 0.5 + 0.5) * canvas.clientHeight) + 'px';
  });
}

let lastBeat = '', lastPct = -1;
function updateReadout(p, landed, locked) {
  const beat = beatFor(p);
  if (beat !== lastBeat) {
    lastBeat = beat;
    beatEl.textContent = beat;
    $('#live').textContent = `The Interval: ${beat}.`;
  }
  const pct = Math.round(landed / 6 * 100);
  if (pct !== lastPct) {
    lastPct = pct;
    pctEl.textContent = pct + '%';
    pctEl.classList.toggle('is-proof', locked);
  }
  stage.classList.toggle('is-field', p >= 0.30);
  stage.classList.toggle('is-hold', p >= 0.90);
}

function resize() {
  if (!renderer) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize, { passive: true });

/* ── live mode ──────────────────────────────────────────────── */
if (renderer && !STATIC_MODE) {
  const state = { p: 0, target: 0, yaw: 0, yawT: 0, pitch: 0, pitchT: 0, running: true };

  addEventListener('scroll', () => {
    const track = $('#stage-track');
    const r = track.getBoundingClientRect();
    state.target = Math.min(Math.max(-r.top / (r.height - innerHeight), 0), 1);
  }, { passive: true });

  addEventListener('pointermove', e => {
    state.yawT = ((e.clientX / innerWidth) - 0.5) * -0.08;
    state.pitchT = ((e.clientY / innerHeight) - 0.5) * -0.04;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    state.running = !document.hidden;
    if (state.running) requestAnimationFrame(frame);
  });

  function frame(now) {
    if (!state.running) return;
    state.p += (state.target - state.p) * 0.07;
    state.yaw += (state.yawT - state.yaw) * 0.06;
    state.pitch += (state.pitchT - state.pitch) * 0.06;
    const { landed, locked } = poseParts(ctx, state.p, now);
    placeCamera(camera, state.p, state.yaw, state.pitch, now);
    renderer.render(ctx.scene, camera);
    projectCallouts(state.p);
    updateReadout(state.p, landed, locked);
    requestAnimationFrame(frame);
  }
  resize();
  requestAnimationFrame(frame);
}

/* ── the three stable states ────────────────────────────────── */
function renderStates() {
  $('[data-states]').hidden = false;
  $('#stage-track').style.display = 'none';
  const STATE_P = [0.1, 0.62, 1.0];
  $$('[data-state-canvas]').forEach((c2, idx) => {
    const w = c2.clientWidth || 760, h = Math.round(w * 10 / 16);
    c2.width = w; c2.height = h;
    const g2 = c2.getContext('2d');
    if (renderer && ctx) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      poseParts(ctx, STATE_P[idx], 0);
      placeCamera(camera, STATE_P[idx], 0, 0, 0);
      renderer.render(ctx.scene, camera);
      g2.fillStyle = '#111515';
      g2.fillRect(0, 0, w, h);
      g2.drawImage(renderer.domElement, 0, 0, w, h);
    } else {
      /* no WebGL: the same three states, drawn flat. The centre stays open. */
      g2.fillStyle = '#111515'; g2.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, R = h * 0.3;
      PARTS.forEach((part, i) => {
        const t = idx === 0 ? 0 : idx === 1 ? (i < 3 ? 1 : 0) : 1;
        const a = -Math.PI / 2 + i * Math.PI / 3;
        const lx = cx + (i % 3 - 1) * w * 0.28, ly = cy + (i < 3 ? -1 : 1) * h * 0.22;
        const rx = cx + Math.cos(a) * R, ry = cy + Math.sin(a) * R;
        const px = lx + (rx - lx) * t, py = ly + (ry - ly) * t;
        g2.beginPath();
        g2.arc(px, py, h * 0.045, 0, Math.PI * 2);
        g2.fillStyle = i === 4 ? '#FF573F' : i === 5 && idx === 2 ? '#28B56D' : '#D9D8D1';
        g2.fill();
      });
    }
  });
}

if (STATIC_MODE || !renderer) renderStates();
