'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BUILDING_WALLS } from './showroom-building';

/**
 * The showroom — a white, high-end gallery you walk through and assemble in.
 *
 * Kate's brief, 2026-07-26: white NY gallery, brass and liquid metal, black
 * gloss knots, drag-to-assemble. Second brief, 2026-07-27: the room must
 * TEACH — "the plinth should say and explain exactly what that piece of the
 * agent does… the customer journey should be actually explained visually.
 * That's the whole idea." So every piece now carries a lesson card that
 * follows the walk, the dais finale happens in the light (the old path dove
 * into the dark doorway — Kate's "blank dark blue screen"), and assembling
 * all six ends in a downloadable journey document, not the old builder.
 *
 * Engineering notes:
 * - The render loop only runs while the room is on screen (IntersectionObserver)
 *   — this page carries two WebGL scenes, and two live contexts is how mobile
 *   Safari/Chrome start losing one.
 * - webglcontextlost is preventDefault-ed so the context can come back.
 * - ?sp=0..1 pins the camera for capture (scrolled captures composite blank).
 */

const BONE = '#F4F1EA';
const IVORY = '#FBF8F1';
const INKD = '#1B1A17';
const GOLD = '#B8964F';
const GOLD_HI = '#D4A843';

const EXHIBITS = [
  {
    name: 'Knowledge', note: 'what it may read',
    tell: 'Your website, your price list, your policies — the pages you choose, nothing else. It answers from these, and says so when it cannot.',
    journey: 'The first enquiry is answered from your own words, not a guess.',
  },
  {
    name: 'Signals', note: 'what it watches for',
    tell: 'The enquiry that just landed. The order that changed. The silence since March. It notices, so nobody has to remember to.',
    journey: 'The moment something needs attention, it has already been seen.',
  },
  {
    name: 'Ability', note: 'the one job it does',
    tell: 'Draft the quote. Prepare the reply. One job, done properly — never "everything".',
    journey: 'The quote arrives drafted while your customer is still interested.',
  },
  {
    name: 'Boundary', note: 'where it stops',
    tell: 'What it must never say, spend or send — written down and enforced, not hoped for.',
    journey: 'Your customer only ever sees what you would stand behind.',
  },
  {
    name: 'Approval', note: 'your yes, every time',
    tell: 'Nothing leaves without a named person saying so. The agent drafts; a human decides.',
    journey: 'The wait while you decide is rewarded — never resented.',
  },
  {
    name: 'Flight log', note: 'what it did, kept',
    tell: 'Every step recorded in plain words, kept where you can read it — six months later, still there.',
    journey: '"Where did this come from?" has a one-line answer.',
  },
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

/** Gallery name card: ivory, rounded, Lato. */
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
  const [lastPlaced, setLastPlaced] = useState<string | null>(null);
  const [lesson, setLesson] = useState<number>(0);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfErr, setPdfErr] = useState('');

  /**
   * The journey document — what six placed pieces become. Client-side jsPDF,
   * wrapped so a failed chunk can never strand the button (the builder's old
   * downloadPdf taught us that the hard way).
   */
  const downloadPdf = async () => {
    if (pdfBusy) return;
    setPdfBusy(true); setPdfErr('');
    try {
      const { default: JsPDF } = await import('jspdf');
      const doc = new JsPDF({ unit: 'pt', format: 'a4' });
      const W = 595, M = 64;
      const NAVY = '#0B1524', GOLDC = '#B8964F', SOFT = '#6E6A60';

      // cover
      doc.setFillColor(251, 248, 241);
      doc.rect(0, 0, W, 842, 'F');
      doc.setDrawColor(184, 150, 79); doc.setLineWidth(1.4);
      doc.line(M, 130, W - M, 130);
      doc.setTextColor(NAVY);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
      doc.text('assembl', M, 110);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(SOFT);
      doc.text('intuitive agentic customer journeys', M + 52, 110);
      doc.setTextColor(NAVY); doc.setFont('helvetica', 'bold'); doc.setFontSize(40);
      doc.text('Your agent,', M, 300);
      doc.text('assembled.', M, 348);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor(SOFT);
      doc.text('Six parts, placed by hand in the assembl gallery —', M, 396);
      doc.text('and what they become in your customer journey.', M, 414);
      doc.setFontSize(9);
      doc.text(new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' }), M, 760);
      doc.setTextColor(GOLDC);
      doc.text('assembl.co.nz', W - M, 760, { align: 'right' });

      // the six parts
      doc.addPage();
      doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, 842, 'F');
      doc.setTextColor(GOLDC); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text('THE SIX PARTS', M, 88);
      let y = 128;
      EXHIBITS.forEach((ex, i) => {
        doc.setTextColor(GOLDC); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
        doc.text(String(i + 1).padStart(2, '0'), M, y);
        doc.setTextColor(NAVY); doc.setFontSize(15);
        doc.text(`${ex.name} — ${ex.note}`, M + 26, y);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(60, 58, 52);
        const tell = doc.splitTextToSize(ex.tell, W - M * 2 - 26);
        doc.text(tell, M + 26, y + 18);
        doc.setTextColor(GOLDC); doc.setFontSize(9.5);
        const j = doc.splitTextToSize(`In your customer's journey: ${ex.journey}`, W - M * 2 - 26);
        doc.text(j, M + 26, y + 18 + tell.length * 13 + 6);
        y += 34 + tell.length * 13 + j.length * 12 + 26;
      });

      // the journey
      doc.addPage();
      doc.setFillColor(251, 248, 241); doc.rect(0, 0, W, 842, 'F');
      doc.setTextColor(GOLDC); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text('THE JOURNEY THEY RUN TOGETHER', M, 88);
      const MOMENTS: Array<[string, string]> = [
        ['The first enquiry', 'Answered from your own words the moment it lands — Knowledge doing its job while everyone else is at lunch.'],
        ['The quote, prepared', 'Ability drafts it from your prices and terms; Boundary keeps it inside what you would sign; it waits for your yes.'],
        ['The wait, rewarded', 'While Approval holds the line, your customer watches the work happen and earns loyalty for the minutes — the wait state.'],
        ['The follow-through', 'Signals catch the booking, the reminder, the thing your busiest week drops — drafted before anyone had to remember.'],
        ['Years two through ten', 'The Flight log keeps every step in plain words, so "where did this come from?" always has an answer.'],
      ];
      let jy = 130;
      MOMENTS.forEach(([t, b], i) => {
        doc.setTextColor(GOLDC); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text(String(i + 1).padStart(2, '0'), M, jy);
        doc.setTextColor(NAVY); doc.setFontSize(14);
        doc.text(t, M + 26, jy);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(60, 58, 52);
        const lines = doc.splitTextToSize(b, W - M * 2 - 26);
        doc.text(lines, M + 26, jy + 17);
        jy += 30 + lines.length * 13 + 18;
      });
      doc.setDrawColor(184, 150, 79); doc.setLineWidth(1);
      doc.line(M, jy + 6, W - M, jy + 6);
      doc.setTextColor(NAVY); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
      doc.text('Make it yours in one minute.', M, jy + 34);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(60, 58, 52);
      doc.text('This is the concept you assembled by hand. The personalised version reads your own website —', M, jy + 52);
      doc.text('your words, your colours, your gaps — and drafts the journey for your business:', M, jy + 66);
      doc.setTextColor(GOLDC); doc.setFont('helvetica', 'bold');
      doc.text('assembl.co.nz/ai-ready', M, jy + 84);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(SOFT);
      doc.text('assembl — intuitive agentic customer journeys · Aotearoa New Zealand · assembl NZ Limited · NZBN 9429053514950', M, 800);

      doc.save('assembl-your-agent-assembled.pdf');
    } catch {
      setPdfErr('The document could not be assembled just now — refresh and try again.');
    } finally {
      setPdfBusy(false);
    }
  };

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

    // A lost context is recoverable only if the default handling is prevented.
    const onCtxLost = (e: Event) => e.preventDefault();
    canvas.addEventListener('webglcontextlost', onCtxLost);

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
    // The hall itself — authored in Pascal Editor's engine (see
    // showroom-building.ts): long walls, entry stubs, the splayed apse
    // narrowing to the portal, and pilaster pairs marking each bay.
    for (const w of BUILDING_WALLS) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.len, w.h, w.t), wallMat);
      mesh.position.set(w.cx, w.cy, w.cz);
      mesh.rotation.y = w.rotY;
      mesh.receiveShadow = true;
      mesh.castShadow = false;
      scene.add(mesh);
    }
    // brass skirting — the one continuous line of the room
    const skirt = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.18, 64),
      new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: 1, roughness: 0.2, envMapIntensity: 1.6 }),
    );
    [-1, 1].forEach((side) => {
      const sk = skirt.clone();
      sk.position.set(side * 8.24, 0.09, -26);
      scene.add(sk);
    });

    // ── materials: the gallery's language ──
    const brushed = makeNormalTexture(256, 14, 1.2);
    const blackGloss = new THREE.MeshPhysicalMaterial({ color: '#0A0A0C', metalness: 0.92, roughness: 0.05, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: 0.03 });
    const liquid = new THREE.MeshPhysicalMaterial({ color: '#E8ECF0', metalness: 1, roughness: 0.008, envMapIntensity: 3.0, clearcoat: 1, clearcoatRoughness: 0.01 });
    const brass = new THREE.MeshPhysicalMaterial({ color: GOLD_HI, metalness: 1, roughness: 0.14, normalMap: brushed, normalScale: new THREE.Vector2(0.3, 0.3), envMapIntensity: 2.0, clearcoat: 0.7 });

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
      flight: { from: THREE.Vector3; start: number } | null;
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
      const rim = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.05, 1.56), brass.clone());
      rim.position.set(x, 1.62, z);
      scene.add(rim);

      const home = new THREE.Vector3(x, 2.25, z);
      const sample = new THREE.Mesh(sampleGeo[i], sampleMat[i]);
      sample.position.copy(home);
      sample.castShadow = true;
      sample.userData.exhibit = i;
      scene.add(sample);
      exhibits.push({ sample, home, placed: false, slot: i, flight: null });

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
    // the beacon — a gold column that brightens as the agent takes shape,
    // readable from the far end of the corridor (Kate: "you can't really see it")
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.3, 7.2, 44, 1, true),
      new THREE.MeshBasicMaterial({ color: GOLD_HI, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    );
    beacon.position.set(DAIS.x, 3.8, DAIS.z);
    scene.add(beacon);
    // Higher and tighter than before — the assembled cluster reads as one
    // object above the dais rim, not six crumbs lost behind it.
    const slotPos = (slot: number) => new THREE.Vector3(
      DAIS.x + Math.cos((slot / 6) * Math.PI * 2 + Math.PI / 6) * 1.35,
      1.5,
      DAIS.z + Math.sin((slot / 6) * Math.PI * 2 + Math.PI / 6) * 1.35,
    );

    // the doorway beyond the dais — scenery now, never the destination
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
      new THREE.MeshBasicMaterial({ map: doorTex, transparent: true, opacity: 0.85 }),
    );
    door.position.set(0, 3.6, -65.8);
    scene.add(door);

    // ── the fixed path — ends looking AT the dais, in the light. The old
    // path carried on toward the doorway and the last screens went dark. ──
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.7, 9),
      new THREE.Vector3(1.6, 2.4, 0.6),
      new THREE.Vector3(-1.7, 2.3, -8),
      new THREE.Vector3(1.7, 2.4, -16.6),
      new THREE.Vector3(-1.7, 2.3, -25.2),
      new THREE.Vector3(1.6, 2.4, -33.8),
      new THREE.Vector3(-1.2, 2.5, -40.5),
      new THREE.Vector3(0, 3.3, -45.6),
    ]);
    const lookTargets = [
      ...exhibits.map((e) => e.home.clone()),
      new THREE.Vector3(0, 1.5, -50),
      new THREE.Vector3(0, 1.4, -52),   // the dais holds the final frame
    ];

    // ── drag-to-assemble ──
    const ray = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.1); // y = 1.1
    let dragging: Ex | null = null;
    let downAt = 0, moved = 0, downX = 0, downY = 0;
    let placedCount = 0;
    // A tap teaches as well as places: the lesson card follows the walk, but a
    // just-placed piece holds the card for a beat so the person reads what
    // they added.
    let lessonHold: { idx: number; until: number } | null = null;

    const setPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    const placedOrder: string[] = [];
    const place = (ex: Ex) => {
      if (ex.placed) return;
      ex.placed = true;
      placedCount += 1;
      // the builder below assembles FROM these — the placement order travels
      placedOrder.push(EXHIBITS[ex.slot]!.name);
      try { sessionStorage.setItem('assembl-gallery-parts', JSON.stringify(placedOrder)); } catch { /* private mode */ }
      setPlaced(placedCount);
      setLastPlaced(EXHIBITS[ex.slot]!.name);
      lessonHold = { idx: ex.slot, until: performance.now() + 2800 };
      setLesson(ex.slot);
      ex.flight = { from: ex.sample.position.clone(), start: performance.now() };
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
    let lessonShown = 0;
    let finaleW = 0;
    const finalePos = new THREE.Vector3(0, 2.6, -46.6);
    const finaleLook = new THREE.Vector3(0, 1.45, -52);

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
      // Linear, not smoothstepped: the old ease held the camera near-still for
      // the first half-screen of scrolling, which read as "stuck".
      const e = p;
      camera.position.copy(path.getPointAt(e));
      const seg = Math.min(lookTargets.length - 2, e * (lookTargets.length - 1));
      const si = Math.floor(seg), sf = seg - si;
      look.lerpVectors(lookTargets[si]!, lookTargets[si + 1]!, sf * sf * (3 - 2 * sf));
      camera.lookAt(look);

      // Once the agent is whole, the camera settles on the dais and stays —
      // the assembly is the payoff, and it happens in the light.
      if (placedCount === 6) {
        finaleW = Math.min(1, finaleW + 0.016 / 1.6);
        const fw = finaleW * finaleW * (3 - 2 * finaleW);
        camera.position.lerp(finalePos, fw);
        look.lerp(finaleLook, fw);
        camera.lookAt(look);
      }

      // the lesson follows the walk — nearest plinth wins, a fresh placement holds
      if (lessonHold && performance.now() > lessonHold.until) lessonHold = null;
      const nearest = Math.max(0, Math.min(5, Math.round(-camera.position.z / 8.6)));
      const want = lessonHold ? lessonHold.idx : nearest;
      if (want !== lessonShown) { lessonShown = want; setLesson(want); }

      exhibits.forEach((ex, i) => {
        if (ex.flight) {
          const f = Math.min(1, (performance.now() - ex.flight.start) / 1100);
          const e2 = f * f * (3 - 2 * f);
          const to = slotPos(ex.slot);
          ex.sample.position.lerpVectors(ex.flight.from, to, e2);
          ex.sample.position.y += Math.sin(f * Math.PI) * 2.2;   // over the room, not through it
          ex.sample.rotation.y += 0.08;
          if (f >= 1) { ex.flight = null; ex.sample.position.copy(to); ex.sample.scale.setScalar(1.18); }
        } else if (ex.placed) {
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

      // beacon + door — brighter with every placement, alive at six
      (beacon.material as THREE.MeshBasicMaterial).opacity =
        placedCount === 6 ? 0.16 + Math.sin(t * 2.2) * 0.05 : placedCount * 0.022;
      const doorPulse = placedCount === 6 ? 0.9 + Math.sin(t * 2.4) * 0.05 : 0.5 + placedCount * 0.05;
      (door.material as THREE.MeshBasicMaterial).opacity = doorPulse;

      renderer.render(scene, camera);
    }

    // Two WebGL scenes share this page — only the one on screen may render.
    let running = false;
    const start = () => { if (!running) { running = true; tick(); } };
    const stop = () => { if (running) { running = false; cancelAnimationFrame(raf); } };
    const io = new IntersectionObserver(
      (entries) => { (entries[0]?.isIntersecting ? start : stop)(); },
      { rootMargin: '200px 0px' },
    );
    io.observe(wrap);

    return () => {
      stop();
      io.disconnect();
      removeEventListener('resize', onResize);
      canvas.removeEventListener('webglcontextlost', onCtxLost);
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

  const lx = EXHIBITS[lesson]!;
  return (
    <div ref={wrapRef} className="shrm">
      <div className="shrm-stick shrm-light">
        <canvas ref={canvasRef} className="shrm-canvas" />
        <div className="shrm-head">
          <div className="kicker">02 — the gallery</div>
          <h2>Six parts.<br /><span className="accent">Assemble yours.</span></h2>
          <p className="shrm-sub">Walk the room. Tap each piece to place it.</p>
        </div>
        <div className="shrm-count" aria-live="polite">
          {placed} <span>of 6 placed</span>
          {lastPlaced && placed < 6 && <em>{lastPlaced} → the dais</em>}
        </div>

        {/* the plinth speaks: what this piece does, and where it sits in the journey */}
        {placed < 6 && (
          <aside className="shrm-lesson" key={lesson} aria-live="polite">
            <div className="shrm-lesson-k">{String(lesson + 1).padStart(2, '0')} · {lx.note}</div>
            <b>{lx.name}</b>
            <p>{lx.tell}</p>
            <p className="shrm-lesson-j"><span>in your customer&rsquo;s journey</span>{lx.journey}</p>
          </aside>
        )}

        {placed >= 6 ? (
          <div className="shrm-finale">
            <b>Assembled.</b>
            <span>Six parts, one agent — this is the shape of your customer journey.</span>
            <div className="shrm-finale-row">
              <button type="button" onClick={() => void downloadPdf()} disabled={pdfBusy}>
                {pdfBusy ? 'assembling your document…' : 'download your agent · the journey document'}
              </button>
              <a href="/ai-ready">make it personal to your site →</a>
            </div>
            {pdfErr && <i className="shrm-finale-err">{pdfErr}</i>}
          </div>
        ) : (
          <>
            <div className="shrm-hint">scroll to walk the room · tap a piece to send it to the dais</div>
            <a className="shrm-door" href="#builder">skip to the live builder ↓</a>
          </>
        )}
      </div>
    </div>
  );
}
