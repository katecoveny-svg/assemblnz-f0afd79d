'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * The showroom — a white, high-end gallery you walk through and assemble in.
 *
 * Kate's brief, 2026-07-26, second pass: "white high end … premium high end
 * art gallery in New York with brass, gold, liquid metal, black taurus knots
 * … that people can drag and literally assembl their agent. the labels are
 * horrendous and wrong blue and font … need rounded corners."
 *
 * So: white marble room, warm spotlights with true shadows, six exhibits —
 * black piano-gloss torus knots, brass, liquid chrome — on ivory plinths with
 * rounded ivory Lato name cards. The camera rides a fixed path on scroll, and
 * every sample can be PICKED UP and dragged to the dais at the end of the
 * room: place all six and the doorway lights fully. A tap places a sample
 * too, so it works without a precise drag. That is the product, literally:
 * you assemble the agent.
 *
 * ?sp=0..1 pins the camera for capture (scrolled captures composite blank on
 * this page). Everything disposes on unmount.
 */

const BONE = '#F4F1EA';
const IVORY = '#FBF8F1';
const INKD = '#1B1A17';
const GOLD = '#B8964F';
const GOLD_HI = '#D4A843';

const EXHIBITS = [
  { name: 'Knowledge', note: 'what it may read' },
  { name: 'Signals', note: 'what it watches for' },
  { name: 'Ability', note: 'the one job it does' },
  { name: 'Boundary', note: 'where it stops' },
  { name: 'Approval', note: 'your yes, every time' },
  { name: 'Flight log', note: 'what it did, kept' },
];

/** Subtle height→normal noise; streak >1 smears it into brushed metal. */
function makeNormalTexture(size: number, streak: number, strength: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = '#808080';
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < size * 18; i++) {
    const v = 108 + Math.floor(Math.random() * 40);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(Math.random() * size, Math.random() * size, Math.max(1, streak * (0.5 + Math.random())), 1);
  }
  const h = g.getImageData(0, 0, size, size);
  const out = g.createImageData(size, size);
  const px = (x: number, y: number) => h.data[(((y + size) % size) * size + ((x + size) % size)) * 4]!;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (px(x + 1, y) - px(x - 1, y)) / 255 * strength;
      const dy = (px(x, y + 1) - px(x, y - 1)) / 255 * strength;
      const inv = 1 / Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      out.data[i] = (-dx * inv * 0.5 + 0.5) * 255;
      out.data[i + 1] = (-dy * inv * 0.5 + 0.5) * 255;
      out.data[i + 2] = inv * 255;
      out.data[i + 3] = 255;
    }
  }
  g.putImageData(out, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Gallery name card: ivory, rounded, Lato — the old navy plates were the
 *  "horrendous and wrong blue" Kate called out. */
function makeCard(name: string, note: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 176;
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, 512, 176);
  const r = 30;
  g.beginPath();
  g.roundRect(4, 4, 504, 168, r);
  g.fillStyle = IVORY;
  g.fill();
  g.lineWidth = 2.5;
  g.strokeStyle = 'rgba(184,150,79,0.75)';
  g.stroke();
  g.fillStyle = INKD;
  g.font = '700 46px Lato, sans-serif';
  g.textAlign = 'center';
  g.fillText(name, 256, 76);
  g.fillStyle = 'rgba(27,26,23,0.72)';
  g.font = '300 28px Lato, sans-serif';
  g.fillText(note, 256, 126);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  return t;
}

export function Showroom() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [placed, setPlaced] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BONE);
    scene.fog = new THREE.FogExp2(BONE, 0.02);
    const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 140);

    scene.add(new THREE.AmbientLight('#FFFFFF', 0.55));
    const fill = new THREE.DirectionalLight('#FFF6E6', 0.5);
    fill.position.set(-6, 10, 8);
    scene.add(fill);

    // env for the metals — a bright gallery box
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.background = new THREE.Color('#0A0A0D');
    const panel = (col: string, w: number, h: number, x: number, y: number, z: number, p: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(p) }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    };
    panel('#FFFFFF', 18, 7, 0, 10, 0, 4.4);
    panel('#FFF2E0', 12, 12, -10, 3, 4, 3.2);
    panel('#EDF2F8', 12, 12, 10, 3, -3, 3.0);
    panel(GOLD_HI, 16, 4, 0, -7, 0, 1.6);
    scene.environment = pmrem.fromScene(env, 0.02).texture;

    // ── the room: white marble, warm light ──
    const floorNormal = makeNormalTexture(256, 1, 0.5);
    floorNormal.repeat.set(10, 20);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 100),
      new THREE.MeshStandardMaterial({
        color: '#EFEBE2', normalMap: floorNormal, normalScale: new THREE.Vector2(0.22, 0.22),
        roughness: 0.28, metalness: 0.08,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -20;
    floor.receiveShadow = true;
    scene.add(floor);

    const wallMat = new THREE.MeshStandardMaterial({ color: '#F7F4ED', roughness: 0.94, metalness: 0 });
    [-1, 1].forEach((side) => {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(100, 14), wallMat);
      wall.rotation.y = side * Math.PI / 2;
      wall.position.set(-side * 8.5, 7, -20);
      wall.receiveShadow = true;
      scene.add(wall);
    });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(34, 14), wallMat);
    backWall.position.set(0, 7, -62);
    scene.add(backWall);
    // brass skirting — the one continuous line of the room
    const skirt = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.18, 100),
      new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: 1, roughness: 0.2, envMapIntensity: 1.6 }),
    );
    [-1, 1].forEach((side) => {
      const sk = skirt.clone();
      sk.position.set(side * 8.44, 0.09, -20);
      scene.add(sk);
    });

    // ── materials: the gallery's language ──
    const brushed = makeNormalTexture(256, 14, 1.2);
    const blackGloss = new THREE.MeshPhysicalMaterial({ color: '#0A0A0C', metalness: 0.92, roughness: 0.05, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: 0.03 });
    const liquid = new THREE.MeshPhysicalMaterial({ color: '#E8ECF0', metalness: 1, roughness: 0.008, envMapIntensity: 3.0, clearcoat: 1, clearcoatRoughness: 0.01 });
    const brass = new THREE.MeshPhysicalMaterial({ color: GOLD_HI, metalness: 1, roughness: 0.14, normalMap: brushed, normalScale: new THREE.Vector2(0.3, 0.3), envMapIntensity: 2.0, clearcoat: 0.7 });

    // black torus knots + brass + liquid metal — the sculpture set
    const sampleGeo: THREE.BufferGeometry[] = [
      new THREE.TorusKnotGeometry(0.42, 0.13, 220, 28, 2, 3),   // knowledge — black knot
      new THREE.IcosahedronGeometry(0.5, 3),                    // signals — liquid metal
      new THREE.TorusKnotGeometry(0.4, 0.11, 220, 28, 3, 4),    // ability — brass knot
      new THREE.TorusKnotGeometry(0.44, 0.12, 220, 28, 2, 5),   // boundary — black knot
      new THREE.CylinderGeometry(0.46, 0.46, 0.3, 72),          // approval — brass seal
      new THREE.TorusGeometry(0.48, 0.1, 28, 110),              // flight log — liquid ring
    ];
    const sampleMat = [blackGloss, liquid, brass, blackGloss.clone(), brass.clone(), liquid.clone()];

    // ── plinths + cards + lights down the corridor ──
    type Ex = {
      sample: THREE.Mesh;
      home: THREE.Vector3;
      placed: boolean;
      slot: number;
    };
    const exhibits: Ex[] = [];
    const plinthMat = new THREE.MeshStandardMaterial({ color: IVORY, roughness: 0.42, metalness: 0.05 });

    EXHIBITS.forEach((ex, i) => {
      const side = i % 2 ? 1 : -1;
      const x = side * 3.4;
      const z = -i * 8.6;

      const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.6, 1.5), plinthMat);
      plinth.position.set(x, 0.8, z);
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      scene.add(plinth);
      // brass rim on the plinth top
      const rim = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.05, 1.56), brass.clone());
      rim.position.set(x, 1.62, z);
      scene.add(rim);

      const home = new THREE.Vector3(x, 2.25, z);
      const sample = new THREE.Mesh(sampleGeo[i], sampleMat[i]);
      sample.position.copy(home);
      sample.castShadow = true;
      sample.userData.exhibit = i;
      scene.add(sample);
      exhibits.push({ sample, home, placed: false, slot: i });

      const card = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 0.48),
        new THREE.MeshBasicMaterial({ map: makeCard(ex.name, ex.note), transparent: true }),
      );
      card.position.set(x, 1.05, z + 0.79);
      scene.add(card);

      const spot = new THREE.SpotLight('#FFF4DE', 300, 18, Math.PI / 7, 0.5, 1.9);
      spot.position.set(x * 0.8, 9, z + 0.7);
      spot.target = plinth;
      if (i % 2 === 0) {
        spot.castShadow = true;
        spot.shadow.mapSize.set(1024, 1024);
        spot.shadow.bias = -0.0004;
      }
      scene.add(spot);
      // the beam, barely there on white — presence, not wash
      const beam = new THREE.Mesh(
        new THREE.ConeGeometry(1.6, 7.4, 40, 1, true),
        new THREE.MeshBasicMaterial({ color: '#FFEFC8', transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide }),
      );
      beam.position.set(x * 0.8, 9 - 3.7, z + 0.7);
      scene.add(beam);
    });

    // ── the dais — where the agent is assembled ──
    const DAIS = new THREE.Vector3(0, 0, -52);
    const dais = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.7, 0.35, 96), plinthMat.clone());
    dais.position.set(DAIS.x, 0.175, DAIS.z);
    dais.receiveShadow = true;
    scene.add(dais);
    const daisRim = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.035, 20, 140), brass.clone());
    daisRim.rotation.x = Math.PI / 2;
    daisRim.position.set(DAIS.x, 0.36, DAIS.z);
    scene.add(daisRim);
    const daisSpot = new THREE.SpotLight('#FFF4DE', 420, 22, Math.PI / 6, 0.5, 1.8);
    daisSpot.position.set(0, 10, -51);
    daisSpot.target = dais;
    daisSpot.castShadow = true;
    daisSpot.shadow.mapSize.set(1024, 1024);
    scene.add(daisSpot);
    const slotPos = (slot: number) => new THREE.Vector3(
      DAIS.x + Math.cos((slot / 6) * Math.PI * 2 + Math.PI / 6) * 1.55,
      0.85,
      DAIS.z + Math.sin((slot / 6) * Math.PI * 2 + Math.PI / 6) * 1.55,
    );

    // the doorway beyond the dais — dark aperture, gold light inside
    const doorC = document.createElement('canvas');
    doorC.width = 256; doorC.height = 512;
    const dgc = doorC.getContext('2d')!;
    dgc.fillStyle = '#111013';
    dgc.beginPath();
    dgc.roundRect(0, 0, 256, 512, 26);
    dgc.fill();
    const dgrad = dgc.createRadialGradient(128, 300, 10, 128, 300, 260);
    dgrad.addColorStop(0, 'rgba(255,244,206,0.98)');
    dgrad.addColorStop(0.45, 'rgba(212,168,67,0.7)');
    dgrad.addColorStop(1, 'rgba(212,168,67,0)');
    dgc.fillStyle = dgrad;
    dgc.fillRect(0, 0, 256, 512);
    const doorTex = new THREE.CanvasTexture(doorC);
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 7.2),
      new THREE.MeshBasicMaterial({ map: doorTex, transparent: true, opacity: 0.92 }),
    );
    door.position.set(0, 3.6, -61.8);
    scene.add(door);

    // ── the fixed path ──
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.7, 9),
      new THREE.Vector3(1.6, 2.4, 0.6),
      new THREE.Vector3(-1.7, 2.3, -8),
      new THREE.Vector3(1.7, 2.4, -16.6),
      new THREE.Vector3(-1.7, 2.3, -25.2),
      new THREE.Vector3(1.6, 2.4, -33.8),
      new THREE.Vector3(-1.4, 2.4, -41.5),
      new THREE.Vector3(0, 3.8, -44.6),
    ]);
    const lookTargets = [
      ...exhibits.map((e) => e.home.clone()),
      new THREE.Vector3(0, 1.2, -52),
      new THREE.Vector3(0, 2.5, -57),   // dais in the foreground, door above it
    ];

    // ── drag-to-assemble ──
    const ray = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.1); // y = 1.1
    let dragging: Ex | null = null;
    let downAt = 0, moved = 0, downX = 0, downY = 0;
    let placedCount = 0;

    const setPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    const place = (ex: Ex) => {
      if (ex.placed) return;
      ex.placed = true;
      placedCount += 1;
      setPlaced(placedCount);
      ex.sample.position.copy(slotPos(ex.slot));
    };
    const onDown = (e: PointerEvent) => {
      setPointer(e);
      ray.setFromCamera(pointer, camera);
      const hits = ray.intersectObjects(exhibits.filter((x) => !x.placed).map((x) => x.sample), false);
      if (!hits.length) return;
      const idx = hits[0]!.object.userData.exhibit as number;
      dragging = exhibits[idx]!;
      downAt = performance.now(); moved = 0; downX = e.clientX; downY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
      setPointer(e);
      ray.setFromCamera(pointer, camera);
      const hit = new THREE.Vector3();
      if (ray.ray.intersectPlane(dragPlane, hit)) {
        dragging.sample.position.set(hit.x, 1.35, hit.z);
      }
      e.preventDefault();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      const ex = dragging;
      dragging = null;
      canvas.releasePointerCapture(e.pointerId);
      const quickTap = performance.now() - downAt < 350 && moved < 8;
      const nearDais = ex.sample.position.distanceTo(new THREE.Vector3(DAIS.x, ex.sample.position.y, DAIS.z)) < 3.1;
      if (quickTap || nearDais) place(ex);
      else ex.sample.position.copy(ex.home);   // spring home
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);

    let raf = 0, t = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spRaw = new URLSearchParams(location.search).get('sp');
    const spOverride = spRaw === null ? null : Math.min(1, Math.max(0, Number(spRaw) || 0));

    const onResize = () => {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    };
    addEventListener('resize', onResize);

    const look = new THREE.Vector3();
    function tick() {
      raf = requestAnimationFrame(tick);
      if (!reduced) t += 0.016;

      let p: number;
      if (spOverride !== null) p = spOverride;
      else if (reduced) p = 0.35;
      else {
        const r = wrap!.getBoundingClientRect();
        p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      }
      const e = p * p * (3 - 2 * p);
      camera.position.copy(path.getPointAt(e));
      const seg = Math.min(lookTargets.length - 2, e * (lookTargets.length - 1));
      const si = Math.floor(seg), sf = seg - si;
      look.lerpVectors(lookTargets[si]!, lookTargets[si + 1]!, sf * sf * (3 - 2 * sf));
      camera.lookAt(look);

      exhibits.forEach((ex, i) => {
        if (ex.placed) {
          ex.sample.rotation.y += 0.012;
          const sp = slotPos(ex.slot);
          ex.sample.position.y = sp.y + Math.sin(t * 1.1 + i) * 0.04;
        } else if (dragging !== ex) {
          ex.sample.rotation.y = t * (0.22 + i * 0.05);
          ex.sample.position.y = ex.home.y + Math.sin(t * 0.7 + i * 1.3) * 0.05;
        } else {
          ex.sample.rotation.y += 0.05;
        }
      });

      const doorPulse = placedCount === 6 ? 0.95 + Math.sin(t * 2.4) * 0.05 : 0.55 + placedCount * 0.06;
      (door.material as THREE.MeshBasicMaterial).opacity = doorPulse;

      renderer.render(scene, camera);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      pmrem.dispose();
      renderer.dispose();
      floorNormal.dispose(); brushed.dispose(); doorTex.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
    };
  }, []);

  return (
    <div ref={wrapRef} className="shrm">
      <div className="shrm-stick shrm-light">
        <canvas ref={canvasRef} className="shrm-canvas" />
        <div className="shrm-head">
          <div className="kicker">02 — the gallery</div>
          <h2>Six parts.<br /><span className="accent">Assemble yours.</span></h2>
          <p className="shrm-sub">Drag any piece to the dais — or tap it.</p>
        </div>
        <div className="shrm-count" aria-live="polite">
          {placed} <span>of 6 placed</span>
        </div>
        <div className="shrm-hint">scroll to walk · drag to assemble</div>
        <a className="shrm-door" href="/build-an-agent">
          {placed >= 6 ? 'your agent is assembled — step in →' : 'step into the builder →'}
        </a>
      </div>
    </div>
  );
}
