import * as THREE from './vendor/three.module.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

/** A small, real 3D kitchen. Inventory and all food-life decisions belong to the app. */
export function initKitchen(container, onSelect = () => {}) {
  container.querySelectorAll('.scene-loading, [data-scene-fallback]').forEach(el => el.remove());
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = new THREE.Scene();
  const materials = [], textures = [], geometries = [];
  const foodRoots = new Map();
  let renderer, frame, stopped = false, visible = true, selectedId = null, hoveredId = null;
  let day = 0, doorTarget = -1.94, currentView = 'overview';
  let inventorySignature = null, width = 1, height = 1, dragging = false, moved = 0;
  const pointer = new THREE.Vector2(), raycaster = new THREE.Raycaster();
  const tooltip = document.createElement('div');
  tooltip.setAttribute('aria-hidden', 'true');
  tooltip.style.cssText = 'display:none;position:absolute;z-index:3;pointer-events:none;padding:8px 11px;border:1px solid #ffffffaa;border-radius:12px;background:#fffaf0ee;color:#354e3a;font:600 12px/1.3 "Instrument Sans",sans-serif;box-shadow:0 4px 18px #2c3f2a14;white-space:nowrap;transform:translate(-50%,-100%);backdrop-filter:blur(8px)';
  const target = new THREE.Vector3(0.1, 2.1, 0);
  const desiredTarget = target.clone();
  let azimuth = 0.39, elevation = 0.26, distance = 11.6;
  let goalAzimuth = azimuth, goalElevation = elevation, goalDistance = distance;
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  const safeCall = (fn, ...args) => { try { fn(...args); } catch (e) { console.warn('Kitchen selection:', e); } };

  container.style.position = 'relative';
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.10;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0xedece3, 0);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;outline:none;cursor:grab;';
    renderer.domElement.setAttribute('aria-label', 'Interactive three dimensional kitchen. Drag to look around. Select food using the inventory list, or click a food in the scene.');
    renderer.domElement.setAttribute('role', 'img');
    container.appendChild(renderer.domElement);
    container.appendChild(tooltip);
  } catch (error) {
    container.dataset.sceneReady = 'fallback';
    const fallback = document.createElement('div');
    fallback.dataset.sceneFallback = 'true';
    fallback.style.cssText = 'height:100%;display:grid;place-content:center;text-align:center;padding:32px;color:#355941;font:500 16px/1.5 "Instrument Sans",sans-serif;background:#e4eadf;border-radius:24px';
    fallback.textContent = 'Your kitchen is ready in the inventory below. This device could not start the 3D view.';
    container.appendChild(fallback);
    return { setItems(){}, setDay(){}, setDoor(){}, setView(){}, setSelected(){}, zoom(){}, resize(){}, dispose(){ fallback.remove(); } };
  }

  const mat = (color, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: .56, metalness: .02, ...extra });
    materials.push(m); return m;
  };
  const geo = g => { geometries.push(g); return g; };
  const sage = mat('#79917d', { roughness: .32, metalness: .13 });
  const sageDark = mat('#526c5b');
  const plum = mat('#674653', { roughness: .48 });
  const plumDark = mat('#432f3b');
  const cream = mat('#f6f2e6', { roughness: .38 });
  const porcelain = mat('#e5e8dd', { roughness: .3 });
  const chrome = mat('#cacfc3', { metalness: .78, roughness: .25 });
  const gasket = mat('#a7b4a0', { roughness: .9 });
  const glass = mat('#d3ebdb', { transparent: true, opacity: .22, roughness: .1, metalness: .08, depthWrite: false });
  const wood = mat('#bd9470', { roughness: .8 });
  const darkWood = mat('#9c7553');
  const stone = mat('#eee5d2', { roughness: .8 });
  const shadow = mat('#d2cbbb', { roughness: .9 });
  const white = mat('#fffaf0');
  const dark = mat('#3a4e3b');
  const floor = new THREE.Group(); scene.add(floor);

  function mesh(geometry, material, parent, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    (parent || scene).add(m); return m;
  }
  function box(parent, w, h, d, material, x = 0, y = 0, z = 0, r = .04) {
    return mesh(geo(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2))), material, parent, x, y, z);
  }
  function ball(parent, r, material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
    const m = mesh(geo(new THREE.SphereGeometry(r, 20, 14)), material, parent, x, y, z);
    m.scale.set(sx, sy, sz); return m;
  }
  function cylinder(parent, top, bottom, h, material, x = 0, y = 0, z = 0, segments = 32) {
    return mesh(geo(new THREE.CylinderGeometry(top, bottom, h, segments)), material, parent, x, y, z);
  }
  function lineBetween(parent, a, b, r, material) {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const m = cylinder(parent, r, r, va.distanceTo(vb), material);
    m.position.copy(va.clone().add(vb).multiplyScalar(.5));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.sub(va).normalize());
    return m;
  }
  function label(parent, text, w, h, x, y, z, color = '#3c5041', background = '#f6f2e6', fontSize = 52) {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
    const c = canvas.getContext('2d');
    const draw = () => {
      c.fillStyle = background; c.fillRect(0, 0, 512, 128);
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = color;
      c.font = `600 ${fontSize}px "Instrument Sans", sans-serif`; c.fillText(text, 256, 65, 480);
    };
    draw();
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture);
    texture.userData.redrawLabel = () => { draw(); texture.needsUpdate = true; };
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: false }); materials.push(material);
    return mesh(geo(new THREE.PlaneGeometry(w, h)), material, parent, x, y, z);
  }
  function leaf(parent, material, x, y, z, s = 1, rot = 0) {
    const l = ball(parent, .14, material, x, y, z, .48 * s, 1.8 * s, .14 * s);
    l.rotation.z = rot; l.rotation.x = -.18; return l;
  }

  // A warm studio plinth and a subtle inset tile grid give the room a tangible scale.
  box(floor, 8.3, .22, 4.5, stone, .2, -.08, .05, .16);
  box(floor, 8.05, .035, 4.26, cream, .2, .045, .05, .1);
  for (let i = -3; i <= 3; i++) box(floor, .008, .005, 4.1, shadow, i + .2, .067, .05, 0);
  for (let i = -1; i <= 1; i++) box(floor, 7.9, .005, .008, shadow, .2, .067, i * 1.05 + .05, 0);
  const ground = mesh(geo(new THREE.PlaneGeometry(200, 200)), new THREE.ShadowMaterial({ opacity: .10 }), scene, 0, -.2, 0);
  materials.push(ground.material); ground.rotation.x = -Math.PI / 2; ground.castShadow = false;

  // Enamel fridge, built as walls (not a solid box), with glass shelves and an actual pivoting door.
  const fridge = new THREE.Group(); fridge.position.set(-1.35, .1, -.2); scene.add(fridge);
  box(fridge, 2.56, 4.72, .18, sage, 0, 2.48, -.79, .10);
  box(fridge, .17, 4.72, 1.7, sage, -1.20, 2.48, 0, .08);
  box(fridge, .17, 4.72, 1.7, sage, 1.20, 2.48, 0, .08);
  box(fridge, 2.56, .20, 1.7, sage, 0, 4.78, 0, .09);
  box(fridge, 2.56, .21, 1.7, sage, 0, .20, 0, .07);
  box(fridge, 2.17, 4.24, .055, porcelain, 0, 2.48, -.67, .02);
  box(fridge, .035, 4.30, 1.4, porcelain, -1.09, 2.5, .04, .01);
  box(fridge, .035, 4.30, 1.4, porcelain, 1.09, 2.5, .04, .01);
  box(fridge, 2.17, .05, 1.4, porcelain, 0, .36, .04, .02);
  for (const x of [-.98, .98]) box(fridge, .19, .14, .44, plumDark, x, .075, -.15, .025);
  // The freezer compartment has its own shallow transparent hatch at the very top.
  box(fridge, 2.16, .06, 1.42, porcelain, 0, 3.97, .03, .02);
  box(fridge, 2.10, .48, .04, glass, 0, 4.25, .71, .02);
  box(fridge, .56, .05, .07, chrome, 0, 4.23, .76, .025);
  label(fridge, 'F R E E Z E R', .74, .14, 0, 4.53, .775, '#5c7163', '#e5e8dd', 38);
  // Fine shelf front rails catch the light and visually separate the food.
  for (const y of [1.35, 2.27, 3.18]) {
    box(fridge, 2.16, .045, 1.4, glass, 0, y, .02, .01);
    box(fridge, 2.16, .04, .055, chrome, 0, y, .76, .015);
  }
  for (const x of [-.55, .55]) {
    box(fridge, 1.04, .52, 1.23, glass, x, .72, .07, .04);
    box(fridge, 1.01, .47, .035, glass, x, .72, .70, .01);
    box(fridge, .48, .04, .07, cream, x, .91, .75, .015);
  }
  label(fridge, 'KEEP IT FRESH', 1.05, .16, 0, .43, .79, '#5c7163', '#e5e8dd', 38);
  for (const x of [-1.05, 1.05]) {
    box(fridge, .028, 3.45, .028, mat('#fff3c6', { emissive: '#ffe4a0', emissiveIntensity: 1.7 }), x, 2.5, .60, .01);
  }
  const fridgeLight = new THREE.PointLight('#fff3d4', 4.0, 5, 2); fridgeLight.position.set(0, 4.45, .55); fridge.add(fridgeLight);
  // Little magnet note at the crown, readable at overview size.
  label(fridge, 'assembl', .64, .16, 0, 4.78, .865, '#edf0e5', '#79917d', 48);
  const door = new THREE.Group(); fridge.add(door); door.position.set(-1.22, .02, .91); door.rotation.y = doorTarget;
  box(door, 2.43, 4.55, .18, sage, 1.215, 2.43, .015, .12);
  box(door, 2.24, 4.28, .055, gasket, 1.215, 2.43, -.10, .05);
  box(door, 2.11, 4.16, .07, cream, 1.215, 2.43, -.15, .055);
  // Door shelves face into the kitchen while open, and preserve a believable profile.
  for (const y of [.90, 2.02, 3.08]) {
    box(door, 1.88, .10, .27, cream, 1.215, y, -.32, .03);
    box(door, 1.89, .24, .035, glass, 1.215, y + .15, -.46, .02);
    box(door, .04, .25, .28, cream, .29, y + .13, -.32, .02);
    box(door, .04, .25, .28, cream, 2.14, y + .13, -.32, .02);
  }
  box(door, .10, 1.27, .14, chrome, 2.17, 2.76, .18, .04);
  box(door, .09, .12, .13, chrome, 2.17, 2.21, .13, .02);
  box(door, .09, .12, .13, chrome, 2.17, 3.31, .13, .02);
  label(door, 'eat well.', .77, .24, 1.18, 3.85, .116, '#f7efdd', '#674653', 52);
  // A tiny butter dish and condiment jars make the door feel inhabited.
  box(door, .59, .17, .22, mat('#dac48d'), .75, 1.07, -.31, .06);
  for (let i = 0; i < 3; i++) {
    cylinder(door, .085, .09, .29, mat(['#b98b43', '#9f5441', '#737e49'][i]), .69 + i * .40, 2.23, -.30);
    cylinder(door, .09, .09, .045, chrome, .69 + i * .40, 2.39, -.30);
  }

  // Plum cabinetry, a rounded stone worktop and oak shelves form a miniature kitchen.
  const bench = new THREE.Group(); bench.position.set(2.05, .1, .12); scene.add(bench);
  box(bench, 2.65, 1.54, 1.50, plum, 0, .86, 0, .09);
  box(bench, 2.78, .16, 1.65, stone, 0, 1.68, .02, .075);
  box(bench, 2.45, .10, 1.24, plumDark, 0, .14, 0, .03);
  for (let i = 0; i < 20; i++) box(bench, .025, 1.31, .025, plumDark, -1.22 + i * .128, .87, .756, .01);
  box(bench, .04, 1.32, .035, plumDark, 0, .87, .77, .01);
  for (const x of [-.17, .17]) box(bench, .04, .35, .05, chrome, x, 1.02, .79, .015);
  // Wooden board and ceramic bowl: real surfaces for the bench inventory.
  box(bench, .88, .035, .78, wood, -.58, 1.782, .10, .08);
  const bowlShape = new THREE.Shape(); bowlShape.moveTo(.13, 0); bowlShape.lineTo(.41, .18); bowlShape.lineTo(.47, .27); bowlShape.lineTo(.43, .29); bowlShape.lineTo(.37, .19); bowlShape.lineTo(.10, .055);
  const bowlPoints = [new THREE.Vector2(.10, .0), new THREE.Vector2(.19, .025), new THREE.Vector2(.36, .12), new THREE.Vector2(.47, .25), new THREE.Vector2(.46, .28), new THREE.Vector2(.42, .27), new THREE.Vector2(.32, .14), new THREE.Vector2(.12, .055)];
  mesh(geo(new THREE.LatheGeometry(bowlPoints, 40)), cream, bench, .66, 1.76, .08);
  // Rear open pantry: all stored pantry food remains directly visible.
  const pantry = new THREE.Group(); pantry.position.set(2.05, .10, -1.12); scene.add(pantry);
  for (const x of [-1.23, 1.23]) box(pantry, .055, 2.40, .055, darkWood, x, 3.03, 0, .01);
  for (const y of [2.15, 3.14, 4.16]) box(pantry, 2.65, .09, .65, wood, 0, y, .0, .025);
  box(pantry, 2.58, .12, .07, darkWood, 0, 4.30, -.28, .01);
  label(pantry, 'THE GOOD STUFF', 1.16, .18, 0, 4.30, .045, '#f3e7d1', '#9c7553', 37);
  // Herb pot on the counter, distinct from the selectable food.
  cylinder(bench, .15, .12, .30, mat('#c78a6c'), 1.03, 1.91, -.49);
  const herb = mat('#54734b');
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4, x = 1.03 + Math.cos(a) * .10, z = -.49 + Math.sin(a) * .10;
    lineBetween(bench, [1.03, 2.02, -.49], [x, 2.19 + (i % 3) * .06, z], .009, herb);
    leaf(bench, herb, x, 2.21 + (i % 3) * .06, z, .58, Math.sin(a) * .8);
  }
  // Soft brass pendant: a warm focal point above the counter.
  lineBetween(scene, [2.55, 4.58, -.05], [2.55, 5.02, -.05], .014, plumDark);
  const shade = cylinder(scene, .09, .43, .25, mat('#c9aa70', { metalness: .55, roughness: .3 }), 2.55, 4.48, -.05);
  cylinder(scene, .37, .37, .015, mat('#fff1c8', { emissive: '#ffedbb', emissiveIntensity: .8 }), 2.55, 4.35, -.05);
  const pendant = new THREE.PointLight('#ffdfab', 9, 4.4, 2); pendant.position.set(2.55, 4.25, -.05); scene.add(pendant);

  scene.add(new THREE.HemisphereLight('#fff9e8', '#b5bc9f', 2.3));
  const key = new THREE.DirectionalLight('#fff8e7', 3.8); key.position.set(-4, 9, 7);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -6; key.shadow.camera.right = 6; key.shadow.camera.top = 7; key.shadow.camera.bottom = -5;
  key.shadow.normalBias = .03; key.shadow.bias = -.00008; key.shadow.radius = 4; scene.add(key);
  const fill = new THREE.DirectionalLight('#e5edff', 1.6); fill.position.set(5, 5, -2); scene.add(fill);

  function foodMaterial(color, status, extra = {}) {
    const c = new THREE.Color(color);
    if (status === 'overdue') c.lerp(new THREE.Color('#907b53'), .46);
    if (status === 'frozen') c.lerp(new THREE.Color('#c8e6e3'), .3);
    return mat(c, extra);
  }
  function produce(item) {
    const resourceStart = { g: geometries.length, m: materials.length, t: textures.length };
    const root = new THREE.Group(), model = new THREE.Group(); root.add(model);
    root.userData.itemId = item.id; root.userData.item = item; root.userData.model = model;
    const shape = String(item.shape || item.id || '').toLowerCase();
    const id = String(item.id).toLowerCase();
    const type = ['tomato','broccoli','carrot','potato','banana','apple','bread','egg','milk','pasta','chickpea','spinach','chicken','rice'].find(t => id.includes(t) || shape.includes(t)) || 'jar';
    const stem = foodMaterial('#427242', item.status), leafGreen = foodMaterial('#6c954d', item.status);
    const color = item.color || ({ tomato: '#d9573a', broccoli: '#547b3c', carrot: '#e99b3c', potato: '#bb9366', banana: '#ead25a', apple: '#bf5e48', bread: '#c59150', egg: '#e5d1ae', milk: '#f3f0df', pasta: '#dfbb66', chickpea: '#c5ad75', spinach: '#477d4c', chicken: '#e6b5a2', rice: '#e8ddbf' }[type] || '#bd9e68');
    const body = foodMaterial(color, item.status, { roughness: type === 'tomato' || type === 'apple' ? .29 : .64 });
    switch (type) {
      case 'tomato':
        for (let i = 0; i < 3; i++) {
          const x = (i - 1) * .21, z = (i % 2) * .14;
          ball(model, .19, body, x, .18, z, 1, .87, 1);
          for (let j = 0; j < 5; j++) { const l = leaf(model, stem, x + Math.sin(j * 1.26) * .07, .34, z + Math.cos(j * 1.26) * .07, .33, j * 1.26); l.rotation.x = 1.2; }
        } break;
      case 'broccoli':
        for (let i = 0; i < 3; i++) {
          const x = (i - 1) * .15, z = (i % 2) * .1;
          cylinder(model, .065, .10, .34, leafGreen, x, .17, z);
          for (let j = 0; j < 6; j++) ball(model, .115, body, x + Math.cos(j * 2.4) * .13, .38 + Math.sin(j * 2.4) * .07, z + Math.sin(j * 2.4) * .10, 1, .9, 1);
        } break;
      case 'carrot':
        for (let i = 0; i < 3; i++) {
          const carrot = new THREE.Group(); carrot.position.set((i - 1) * .16, .11, 0); carrot.rotation.x = 1.31; carrot.rotation.z = (i - 1) * .12; model.add(carrot);
          cylinder(carrot, .09, .015, .58, body, 0, 0, 0);
          for (let j = 0; j < 3; j++) leaf(carrot, stem, (j - 1) * .04, .39, 0, .58, (j - 1) * .4);
          for (let j = 0; j < 3; j++) box(carrot, .085 - j * .014, .01, .005, foodMaterial('#b66d32', item.status), .015, .16 - j * .13, .077 - j * .016, .003);
        } break;
      case 'potato':
        for (let i = 0; i < 4; i++) {
          const x = (i % 2 - .5) * .29, z = Math.floor(i / 2) * .21;
          const p = ball(model, .18, body, x, .14, z, 1.14, .8, .88); p.rotation.y = i;
          for (let j = 0; j < 3; j++) ball(model, .012, darkWood, x + (j - 1) * .06, .25, z + .03);
        } break;
      case 'banana': {
        const bananaTip = mat('#6f643b');
        for (let i = 0; i < 3; i++) {
          const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.25, .13, i * .095), new THREE.Vector3(-.10, .06, i * .095), new THREE.Vector3(.12, .08, i * .095), new THREE.Vector3(.29, .24, i * .095)]);
          mesh(geo(new THREE.TubeGeometry(curve, 20, .065, 10, false)), body, model);
          ball(model, .036, bananaTip, -.25, .13, i * .095); ball(model, .038, bananaTip, .29, .24, i * .095);
        } break;
      }
      case 'apple':
        for (let i = 0; i < 2; i++) {
          const x = (i - .5) * .31;
          ball(model, .19, body, x, .19, 0, 1, .95, 1);
          lineBetween(model, [x, .34, 0], [x + .025, .43, 0], .014, darkWood);
          leaf(model, stem, x + .065, .39, 0, .45, -.9);
        } break;
      case 'bread': {
        box(model, .61, .31, .35, body, 0, .17, 0, .14);
        for (let i = 0; i < 4; i++) { const slash = box(model, .026, .012, .24, mat('#e7c58e'), -.21 + i * .14, .325, 0, .005); slash.rotation.y = -.4; }
        box(model, .66, .028, .41, wood, 0, .02, 0, .04);
        break;
      }
      case 'egg': {
        const carton = foodMaterial('#c8b993', item.status);
        box(model, .69, .10, .43, carton, 0, .055, 0, .04);
        for (let i = 0; i < 6; i++) ball(model, .095, body, (i % 3 - 1) * .205, .17, (Math.floor(i / 3) - .5) * .20, 1, 1.28, 1);
        box(model, .69, .20, .025, carton, 0, .12, -.225, .02);
        break;
      }
      case 'milk':
        box(model, .29, .55, .28, body, 0, .28, 0, .055);
        cylinder(model, .08, .14, .13, body, 0, .60, 0);
        cylinder(model, .085, .085, .07, mat('#638b7f'), 0, .70, 0);
        label(model, 'MILK', .245, .18, 0, .34, .145, '#f4f2df', '#638b7f', 49);
        break;
      case 'spinach': {
        box(model, .52, .08, .41, cream, 0, .04, 0, .06);
        for (let i = 0; i < 10; i++) { const a = i * 2.4; const l = leaf(model, i % 2 ? body : leafGreen, Math.cos(a) * .18, .17 + (i % 3) * .025, Math.sin(a) * .13, .65, Math.cos(a)); l.rotation.x = Math.sin(a) * .6; }
        break;
      }
      case 'chicken':
        box(model, .63, .06, .44, cream, 0, .03, 0, .06);
        ball(model, .19, body, -.14, .12, 0, .8, .47, 1);
        ball(model, .19, body, .14, .12, .02, .8, .47, 1);
        box(model, .63, .08, .045, mat('#718466'), 0, .1, .2, .01);
        break;
      default: {
        const jarGlass = mat('#f0e7c5', { transparent: true, opacity: .34, roughness: .16, depthWrite: false });
        const tall = type === 'pasta' ? .68 : type === 'rice' ? .53 : .40;
        cylinder(model, .18, .18, tall, jarGlass, 0, tall / 2, 0);
        cylinder(model, .18, .18, .055, wood, 0, tall + .02, 0);
        if (type === 'pasta') {
          for (let i = 0; i < 13; i++) { const a = i * 2.4; cylinder(model, .018, .018, .51, body, Math.cos(a) * .11, .29, Math.sin(a) * .11, 6); }
        } else {
          cylinder(model, .15, .15, tall * .73, body, 0, tall * .38, 0);
          for (let i = 0; i < 15; i++) { const a = i * 2.4; ball(model, type === 'rice' ? .024 : .036, body, Math.cos(a) * .12, tall * .77 + Math.sin(i) * .015, Math.sin(a) * .12, 1, type === 'rice' ? .5 : 1, 1); }
        }
        label(model, type === 'pasta' ? 'PASTA' : type === 'rice' ? 'RICE' : 'PANTRY', .25, .13, 0, tall * .48, .183, '#5a5840', '#f4edd9', 47);
      }
    }
    const statusColor = { fresh: '#79a06c', soon: '#d79c3d', overdue: '#bb5f50', frozen: '#78b8ca' }[item.status] || '#79a06c';
    const haloMaterial = mat(statusColor, { transparent: true, opacity: .6, roughness: .5, emissive: statusColor, emissiveIntensity: .20, depthWrite: false });
    const halo = mesh(geo(new THREE.TorusGeometry(.39, .014, 8, 56)), haloMaterial, root, 0, .018, .04);
    halo.rotation.x = -Math.PI / 2; halo.visible = item.status === 'soon' || item.status === 'overdue'; halo.castShadow = false;
    root.userData.halo = halo;
    if (item.status === 'frozen') {
      for (let i = 0; i < 3; i++) box(model, .15, .14, .13, glass, (i - 1) * .22, .07, .23, .025);
    }
    root.traverse(o => { if (o.isMesh) o.userData.itemId = item.id; });
    root.userData.resources = {
      geometries: geometries.splice(resourceStart.g),
      materials: materials.splice(resourceStart.m),
      textures: textures.splice(resourceStart.t)
    };
    return root;
  }

  const slots = {
    fridge: [[-1.88, 3.31, .02], [-.80, 3.31, .02], [-1.88, 2.40, .02], [-.80, 2.40, .02], [-1.88, 1.48, .02], [-.80, 1.48, .02]],
    crisper: [[-1.88, .58, .10], [-.80, .58, .10]],
    freezer: [[-1.89, 4.12, -.02], [-.81, 4.12, -.02]],
    bench: [[1.48, 1.90, .25], [2.72, 1.99, .23], [2.10, 1.90, .33]],
    pantry: [[1.24, 3.31, -1.10], [2.07, 3.31, -1.10], [2.89, 3.31, -1.10], [1.30, 2.32, -1.10], [2.20, 2.32, -1.10], [2.90, 2.32, -1.10], [1.5, 4.33, -1.10], [2.5, 4.33, -1.10]]
  };
  const defaults = { tomato:'fridge',broccoli:'fridge',carrot:'crisper',potato:'pantry',banana:'bench',apple:'bench',bread:'pantry',egg:'fridge',milk:'fridge',pasta:'pantry',chickpea:'pantry',spinach:'fridge',chicken:'fridge',rice:'pantry' };
  function setItems(items = []) {
    const signature = JSON.stringify(items.map(({ id, name, color, shape, place, status, qty }) => ({ id, name, color, shape, place, status, qty })));
    if (signature === inventorySignature) return;
    inventorySignature = signature;
    for (const root of foodRoots.values()) {
      scene.remove(root);
      Object.values(root.userData.resources).flat().forEach(resource => resource.dispose());
    }
    foodRoots.clear();
    const indices = { fridge: 0, crisper: 0, freezer: 0, bench: 0, pantry: 0 };
    // Keep taller bottles at the top, and avoid forcing a tiny carton onto a tall shelf.
    const ordered = [...items].filter(i => i.status !== 'used' && i.status !== 'wasted' && Number(i.qty ?? 1) > 0);
    ordered.sort((a, b) => (String(a.id).includes('milk') ? -1 : 0) - (String(b.id).includes('milk') ? -1 : 0));
    for (const item of ordered) {
      const place = slots[item.place] ? item.place : defaults[item.id] || 'fridge';
      const index = indices[place]++, available = slots[place], location = available[index % available.length];
      const root = produce(item); root.position.set(...location);
      if (index >= available.length) { root.position.z -= .34 * Math.floor(index / available.length); root.scale.setScalar(.78); }
      if (place === 'crisper' || place === 'freezer') root.scale.setScalar(.84);
      root.userData.baseY = root.position.y; root.userData.place = place;
      scene.add(root); foodRoots.set(item.id, root);
    }
    setSelected(selectedId); renderOnce();
  }
  function setSelected(id) {
    selectedId = id;
    for (const [foodId, root] of foodRoots) {
      const isSelected = foodId === id;
      root.userData.halo.visible = isSelected || root.userData.item.status === 'soon' || root.userData.item.status === 'overdue';
      root.userData.halo.material.opacity = isSelected ? 1 : .45;
      root.userData.halo.material.emissiveIntensity = isSelected ? .8 : .12;
    }
    renderOnce();
  }
  function setDay(value) { day = Number(value) || 0; renderOnce(); }
  function setDoor(open = true) { doorTarget = open ? -1.94 : 0; if (reduced) door.rotation.y = doorTarget; renderOnce(); }
  /** Positive steps zoom in, negative steps zoom out. One step changes distance by about 11%. */
  function zoom(delta = 1) {
    const step = Number(delta);
    if (!Number.isFinite(step)) return goalDistance;
    goalDistance = THREE.MathUtils.clamp(goalDistance * Math.exp(-step * .12), 5.5, 15);
    if (reduced) distance = goalDistance;
    renderOnce(); return goalDistance;
  }
  function setView(view = 'overview') {
    currentView = view;
    const views = {
      overview: { a: .39, e: .26, d: 11.6, t: [.1, 2.1, 0] },
      fridge: { a: .13, e: .14, d: 8.4, t: [-1.28, 2.45, .05] },
      freezer: { a: .10, e: .15, d: 6.6, t: [-1.30, 3.80, .05] },
      pantry: { a: .23, e: .17, d: 7.7, t: [2.05, 3.00, -.40] },
      bench: { a: .45, e: .57, d: 7.2, t: [2.05, 1.65, 0] },
      top: { a: .15, e: .87, d: 10.8, t: [.1, 1.9, 0] }
    };
    const v = views[view] || views.overview;
    goalAzimuth = v.a; goalElevation = v.e; goalDistance = v.d; desiredTarget.set(...v.t);
    if (view === 'fridge' || view === 'freezer') setDoor(true);
    if (reduced) { azimuth = goalAzimuth; elevation = goalElevation; distance = goalDistance; target.copy(desiredTarget); }
    renderOnce();
  }
  function positionCamera() {
    const responsiveDistance = distance * (width / height < 1 ? 1.38 : width / height < 1.35 ? 1.14 : 1);
    camera.position.set(target.x + Math.sin(azimuth) * Math.cos(elevation) * responsiveDistance, target.y + Math.sin(elevation) * responsiveDistance, target.z + Math.cos(azimuth) * Math.cos(elevation) * responsiveDistance);
    camera.lookAt(target);
  }
  function resize() {
    width = Math.max(container.clientWidth, 1); height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); positionCamera(); renderOnce();
  }
  function pick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects([...foodRoots.values()], true).find(hit => hit.object.userData.itemId)?.object.userData.itemId || null;
  }
  let startX = 0, startY = 0, previousX = 0, previousY = 0;
  const down = e => {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true; moved = 0; startX = previousX = e.clientX; startY = previousY = e.clientY;
    renderer.domElement.setPointerCapture?.(e.pointerId); renderer.domElement.style.cursor = 'grabbing';
    tooltip.style.display = 'none';
  };
  const move = e => {
    if (dragging) {
      moved = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (moved > 5) {
        goalAzimuth = THREE.MathUtils.clamp(goalAzimuth - (e.clientX - previousX) * .005, -.7, 1.05);
        goalElevation = THREE.MathUtils.clamp(goalElevation + (e.clientY - previousY) * .004, .08, .9);
        if (reduced) { azimuth = goalAzimuth; elevation = goalElevation; }
      }
      previousX = e.clientX; previousY = e.clientY; renderOnce();
    } else {
      hoveredId = pick(e); renderer.domElement.style.cursor = hoveredId ? 'pointer' : 'grab';
      const item = foodRoots.get(hoveredId)?.userData.item;
      if (item) {
        const rect = renderer.domElement.getBoundingClientRect();
        const status = { fresh: 'Fresh', soon: 'Use soon', overdue: 'Check before using', frozen: 'Frozen' }[item.status];
        tooltip.textContent = `${item.name || item.id}${status ? ' · ' + status : ''}`;
        tooltip.style.left = `${Math.max(90, Math.min(width - 90, e.clientX - rect.left))}px`;
        tooltip.style.top = `${Math.max(45, e.clientY - rect.top - 14)}px`;
        tooltip.style.display = 'block';
      } else tooltip.style.display = 'none';
    }
  };
  const up = e => {
    if (!dragging) return;
    dragging = false; renderer.domElement.style.cursor = 'grab';
    if (moved < 7) { const id = pick(e); if (id) { setSelected(id); safeCall(onSelect, id); } }
  };
  const cancel = () => { dragging = false; renderer.domElement.style.cursor = 'grab'; tooltip.style.display = 'none'; };
  const leave = () => { tooltip.style.display = 'none'; };
  const wheel = e => {
    // Ctrl/trackpad zoom stays inside the toy; ordinary scrolling still scrolls the page.
    if (!e.ctrlKey && !e.metaKey && !e.altKey) return;
    e.preventDefault(); goalDistance = THREE.MathUtils.clamp(goalDistance + e.deltaY * .015, 5.5, 15);
    if (reduced) distance = goalDistance; renderOnce();
  };
  renderer.domElement.addEventListener('pointerdown', down);
  renderer.domElement.addEventListener('pointermove', move);
  renderer.domElement.addEventListener('pointerup', up);
  renderer.domElement.addEventListener('pointercancel', cancel);
  renderer.domElement.addEventListener('pointerleave', leave);
  renderer.domElement.addEventListener('wheel', wheel, { passive: false });
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container);
  const intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; if (visible) renderOnce(); }, { threshold: .01 }); intersection.observe(container);
  const clock = new THREE.Clock();
  function renderOnce() { if (!frame && !stopped && visible) frame = requestAnimationFrame(tick); }
  function tick() {
    frame = null; if (stopped || !visible) return;
    const dt = Math.min(clock.getDelta(), .05), ease = reduced ? 1 : 1 - Math.exp(-dt * 8);
    azimuth += (goalAzimuth - azimuth) * ease; elevation += (goalElevation - elevation) * ease;
    distance += (goalDistance - distance) * ease; target.lerp(desiredTarget, ease);
    door.rotation.y += (doorTarget - door.rotation.y) * ease;
    fridgeLight.intensity = 1 + Math.abs(door.rotation.y) * 1.6;
    for (const [id, root] of foodRoots) {
      const selected = id === selectedId;
      const lift = selected ? .06 : 0;
      root.position.y += (root.userData.baseY + lift - root.position.y) * ease;
    }
    positionCamera(); renderer.render(scene, camera);
    const unsettled = Math.abs(azimuth - goalAzimuth) + Math.abs(elevation - goalElevation) + Math.abs(distance - goalDistance) + target.distanceTo(desiredTarget) + Math.abs(door.rotation.y - doorTarget) > .001;
    const lifting = [...foodRoots.values()].some(root => Math.abs(root.position.y - root.userData.baseY - (root.userData.itemId === selectedId ? .06 : 0)) > .001);
    if (unsettled || lifting) renderOnce();
  }
  function dispose() {
    stopped = true; cancelAnimationFrame(frame); resizeObserver.disconnect(); intersection.disconnect();
    renderer.domElement.removeEventListener('pointerdown', down); renderer.domElement.removeEventListener('pointermove', move);
    renderer.domElement.removeEventListener('pointerup', up); renderer.domElement.removeEventListener('pointercancel', cancel); renderer.domElement.removeEventListener('pointerleave', leave); renderer.domElement.removeEventListener('wheel', wheel);
    for (const root of foodRoots.values()) Object.values(root.userData.resources).flat().forEach(resource => resource.dispose());
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); renderer.dispose(); renderer.domElement.remove(); tooltip.remove();
  }
  resize(); container.dataset.sceneReady = 'true'; container.dataset.sceneEngine = 'three';
  // Canvas labels are repainted once the actual brand font is ready, without rebuilding the scene.
  document.fonts?.load('600 52px "Instrument Sans"').then(() => {
    if (stopped) return;
    const currentTextures = [...textures, ...[...foodRoots.values()].flatMap(root => root.userData.resources.textures)];
    currentTextures.forEach(texture => texture.userData.redrawLabel?.());
    renderOnce();
  }).catch(() => {});
  return { setItems, setDay, setDoor, setView, setSelected, zoom, resize, dispose };
}
