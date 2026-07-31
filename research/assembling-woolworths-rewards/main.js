/*!
 * main.js — "The Agentic Pantry"
 * Woolworths NZ & Everyday Rewards Procedural 3D Demonstrator
 * Built by assembl · Aotearoa New Zealand
 */

import * as THREE from 'three';

// ── Brand Color Palette ───────────────────────────────────────────────────
const COLORS = {
  orange: new THREE.Color(0xFD6400),
  orangeDark: new THREE.Color(0xFF5200),
  orangeLight: new THREE.Color(0xFF7A00),
  mint: new THREE.Color(0xCFE2D8),
  charcoal: new THREE.Color(0x38454F),
  brass: new THREE.Color(0xB8964F),
  woolGreen: new THREE.Color(0x00713C),
  paper: new THREE.Color(0xFAFAF7),
  bgDark: new THREE.Color(0x0A0E12)
};

// ── Application State ─────────────────────────────────────────────────────
let scene, camera, renderer;
let coreGroup, coreKnot, wireSphere, ringGroup;
let produceInstancedMesh, particlePoints;
let clock = new THREE.Clock();

let mouseX = 0, mouseY = 0;
let targetCameraPos = { x: 3.5, y: 1.2, z: 12 };
let isWaitActive = false;
let currentPoints = 1847;
let currentProgress = 0;
let waitStep = 0;
let waitInterval = null;

// Recommendation Items
const RECOMMENDATIONS = [
  { tag: 'Member Price', title: 'Fresh NZ Avocados', desc: 'Matched Thursday Whānau recipe pattern. 2 for $5.00 this week.', price: '$5.00', was: '$7.98', save: 'Save $2.98' },
  { tag: '10x Boost', title: 'Anchor Butter 500g', desc: 'Everyday Rewards 10x Boost active. Earn 73 bonus points.', price: '$7.30', was: '$8.50', save: 'Save $1.20 + 73 pts' },
  { tag: 'Member Price', title: 'Woolworths Quality Mince 1kg', desc: 'Fresh NZ Beef. Perfect for 5-day meal plan.', price: '$14.50', was: '$17.00', save: 'Save $2.50' },
  { tag: '5x Boost', title: 'Wattie\'s Baked Beans 4-Pack', desc: 'Pantry staple boost matched for Whānau basket.', price: '$6.50', was: '$7.80', save: 'Save $1.30 + 32 pts' }
];
let recIndex = 0;

// ── 3D Engine Initialization ──────────────────────────────────────────────
function init3D() {
  const container = document.getElementById('webgl-container');
  const canvas = document.getElementById('webgl-canvas');

  // Scene
  scene = new THREE.Scene();
  scene.background = COLORS.bgDark;
  scene.fog = new THREE.FogExp2(0x0A0E12, 0.035);

  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(targetCameraPos.x, targetCameraPos.y, targetCameraPos.z);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xFFFFFF, 2.2);
  dirLight1.position.set(10, 15, 10);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(COLORS.orange, 1.8);
  dirLight2.position.set(-10, -5, -10);
  scene.add(dirLight2);

  const pointLight = new THREE.PointLight(COLORS.brass, 3, 20);
  pointLight.position.set(2.5, 0, 0);
  scene.add(pointLight);

  // Build Central Agent Core
  buildAgentCore();

  // Build Produce Orbs Constellation
  buildProduceOrbs();

  // Build Floating Particle Data Stream
  buildParticleStream();

  // Event Listeners
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('mousemove', onMouseMove);

  // Hide Loading Screen
  setTimeout(() => {
    const loading = document.getElementById('loadingFallback');
    if (loading) loading.classList.add('hidden');
    // Show first recommendation card
    showNextRecommendation();
  }, 1000);

  // Start Animation Loop
  animate();
}

// ── Central Agent Core Sculpture ──────────────────────────────────────────
function buildAgentCore() {
  coreGroup = new THREE.Group();
  coreGroup.position.set(2.5, 0, 0);
  scene.add(coreGroup);

  // Stretched Metallic TorusKnot
  const coreGeo = new THREE.TorusKnotGeometry(1.8, 0.48, 250, 32, 2, 3);
  coreGeo.scale(2.0, 0.5, 1.2);

  const coreMat = new THREE.MeshStandardMaterial({
    color: COLORS.brass,
    metalness: 0.95,
    roughness: 0.1,
    emissive: COLORS.orange,
    emissiveIntensity: 0.2
  });

  coreKnot = new THREE.Mesh(coreGeo, coreMat);
  coreGroup.add(coreKnot);

  // Wireframe Outer Shell
  const wireGeo = new THREE.IcosahedronGeometry(4.5, 2);
  const wireMat = new THREE.MeshBasicMaterial({
    color: COLORS.mint,
    wireframe: true,
    transparent: true,
    opacity: 0.08
  });
  wireSphere = new THREE.Mesh(wireGeo, wireMat);
  coreGroup.add(wireSphere);

  // Concentric Orbit Rings
  ringGroup = new THREE.Group();
  
  const ring1Mat = new THREE.MeshStandardMaterial({ color: COLORS.brass, metalness: 0.9, roughness: 0.1 });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.03, 16, 128), ring1Mat);
  ring1.rotation.x = Math.PI / 2.3;

  const ring2Mat = new THREE.MeshStandardMaterial({ color: COLORS.woolGreen, metalness: 0.8, roughness: 0.2 });
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.03, 16, 128), ring2Mat);
  ring2.rotation.y = Math.PI / 3;

  const ring3Mat = new THREE.MeshStandardMaterial({ color: COLORS.orange, metalness: 0.9, roughness: 0.1 });
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(5.0, 0.03, 16, 128), ring3Mat);
  ring3.rotation.z = Math.PI / 4;

  ringGroup.add(ring1, ring2, ring3);
  coreGroup.add(ringGroup);
}

// ── Produce Orbs Constellation (Instanced Mesh) ───────────────────────────
function buildProduceOrbs() {
  const orbCount = 60;
  const orbGeo = new THREE.SphereGeometry(0.35, 32, 32);
  const orbMat = new THREE.MeshStandardMaterial({
    metalness: 0.2,
    roughness: 0.2,
    roughnessMap: null
  });

  produceInstancedMesh = new THREE.InstancedMesh(orbGeo, orbMat, orbCount);

  const dummy = new THREE.Object3D();
  const palette = [COLORS.orange, COLORS.mint, COLORS.charcoal, COLORS.woolGreen, COLORS.orangeLight];

  for (let i = 0; i < orbCount; i++) {
    const angle = (i / orbCount) * Math.PI * 2;
    const radius = 3.5 + Math.random() * 4.5;
    const y = (Math.random() - 0.5) * 3.5;

    dummy.position.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );
    dummy.scale.setScalar(0.6 + Math.random() * 0.8);
    dummy.updateMatrix();

    produceInstancedMesh.setMatrixAt(i, dummy.matrix);
    produceInstancedMesh.setColorAt(i, palette[i % palette.length]);
  }

  produceInstancedMesh.instanceMatrix.needsUpdate = true;
  if (produceInstancedMesh.instanceColor) produceInstancedMesh.instanceColor.needsUpdate = true;

  coreGroup.add(produceInstancedMesh);
}

// ── Data Particle Stream ──────────────────────────────────────────────────
function buildParticleStream() {
  const particleCount = 600;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2.0 + Math.random() * 6.0;
    
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    const c = Math.random() > 0.5 ? COLORS.orange : COLORS.mint;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  particlePoints = new THREE.Points(geometry, material);
  coreGroup.add(particlePoints);
}

// ── Animation Loop ────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // Core Sculptural Rotation
  coreKnot.rotation.x = t * 0.1;
  coreKnot.rotation.y = t * 0.08;
  wireSphere.rotation.y = -t * 0.05;
  ringGroup.rotation.z = Math.sin(t * 0.15) * 0.12;
  produceInstancedMesh.rotation.y = t * 0.04;

  // Particle Orbit Rotation
  particlePoints.rotation.y = t * 0.12;

  // Mouse Parallax & Smooth Camera Movement
  camera.position.x += (targetCameraPos.x + mouseX * 0.6 - camera.position.x) * 0.05;
  camera.position.y += (targetCameraPos.y + mouseY * 0.4 - camera.position.y) * 0.05;
  camera.position.z += (targetCameraPos.z - camera.position.z) * 0.05;
  camera.lookAt(2.0, 0, 0);

  // Acceleration during Active Wait
  if (isWaitActive) {
    coreGroup.rotation.y += 0.012;
  } else {
    coreGroup.rotation.y += 0.002;
  }

  renderer.render(scene, camera);
}

// ── Window Resize ─────────────────────────────────────────────────────────
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

// ── Interactive Monetised Wait State Pipeline ─────────────────────────────
window.runMonetisedWait = function() {
  if (isWaitActive) return;
  isWaitActive = true;
  waitStep = 0;
  currentProgress = 0;

  const actionBtn = document.getElementById('actionBtn');
  if (actionBtn) actionBtn.innerText = 'Assembling Basket...';

  waitInterval = setInterval(() => {
    currentProgress += 2.5;
    if (currentProgress > 100) currentProgress = 100;

    // Update Progress UI
    const fill = document.getElementById('progressFill');
    const pct = document.getElementById('progressPercent');
    if (fill) fill.style.width = currentProgress + '%';
    if (pct) pct.innerText = Math.round(currentProgress) + '%';

    // Increment Points
    currentPoints += 4;
    const ptsDisp = document.getElementById('pointsDisplay');
    if (ptsDisp) ptsDisp.innerText = currentPoints.toLocaleString();

    // Step Status Updates
    if (currentProgress >= 25 && waitStep === 0) {
      waitStep = 1;
      updateStatus('Step 01 · Whānau Context Scan', 'Retrieved preferences for 4 family members (Gluten-conscious, Woolworths Fresh priority).');
    } else if (currentProgress >= 50 && waitStep === 1) {
      waitStep = 2;
      updateStatus('Step 02 · Woolworths Fresh Quality Guard', 'Checking weekly specials on Woolworths Quality Meats & organic produce.');
    } else if (currentProgress >= 75 && waitStep === 2) {
      waitStep = 3;
      updateStatus('Step 03 · Wattie\'s & Anchor Boost Match', 'Applied 150 Everyday Rewards bonus points & supplier co-op boost.');
      showNextRecommendation();
    } else if (currentProgress >= 100) {
      clearInterval(waitInterval);
      isWaitActive = false;
      updateStatus('Journey Assembled · Customer Approval Ready', 'Order drafted with $3.80 instant reward credit applied. Tap to place order.');

      if (actionBtn) actionBtn.innerText = 'Approve $3.80 Reward & Place Order';

      // Show Voucher Toast
      const toast = document.getElementById('voucherToast');
      if (toast) toast.classList.add('visible');
    }
  }, 100);
};

// ── Interactive Boost Pills ───────────────────────────────────────────────
window.triggerBoost = function(type, btn) {
  document.querySelectorAll('.boost-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  currentPoints += 50;
  const ptsDisp = document.getElementById('pointsDisplay');
  if (ptsDisp) ptsDisp.innerText = currentPoints.toLocaleString();

  if (type === 'fresh') {
    updateStatus('10x Woolworths Fresh Boost Active', 'Earned +50 Everyday Rewards bonus points on NZ fresh produce.');
  } else if (type === 'pantry') {
    updateStatus('5x Wattie\'s & Anchor Boost Active', 'Earned +50 Everyday Rewards bonus points on pantry essentials.');
  } else if (type === 'dairy') {
    updateStatus('3x Meadow Fresh Boost Active', 'Earned +50 Everyday Rewards bonus points on fresh dairy.');
  }

  // Flash Core Glow
  if (coreKnot) {
    coreKnot.material.emissiveIntensity = 0.8;
    setTimeout(() => { if (coreKnot) coreKnot.material.emissiveIntensity = 0.2; }, 600);
  }
};

function updateStatus(tag, msg) {
  const tagEl = document.getElementById('agentTag');
  const msgEl = document.getElementById('agentStatus');
  if (tagEl) tagEl.innerText = tag;
  if (msgEl) msgEl.innerText = msg;
}

function showNextRecommendation() {
  const card = document.getElementById('recCard');
  if (!card) return;

  const item = RECOMMENDATIONS[recIndex % RECOMMENDATIONS.length];
  recIndex++;

  card.classList.remove('visible');

  setTimeout(() => {
    document.getElementById('recTag').innerText = item.tag;
    document.getElementById('recTitle').innerText = item.title;
    document.getElementById('recDesc').innerText = item.desc;
    document.getElementById('recPrice').innerText = item.price;
    document.getElementById('recWas').innerText = item.was;
    document.getElementById('recSave').innerText = item.save;

    card.classList.add('visible');
  }, 300);
}

// ── Init on DOM Load ──────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  init3D();
});
