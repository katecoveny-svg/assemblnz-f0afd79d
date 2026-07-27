'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJECTS, buildObject, makeMaterials, type ObjectKind } from './objects';
import { WaitState } from '@/components/site/cinematic/WaitState';
import './lab.css';

/**
 * Homepage lab — five palettes × five assembled objects, live.
 *
 * Kate, 2026-07-26: "maybe try playing with a navy background and play with the
 * 3d assembled object and large format text or more of a balance like the
 * pricing page is visually. come up with variations in colour through the page
 * journey and try different 3d assembled objects."
 *
 * So this is not a proposal, it is a switchboard: pick a palette, pick an
 * object, pick a type scale, scroll it. Nothing here is wired into the live
 * homepage — it exists to be chosen from, and then thrown away.
 *
 * Internal only: noindex, and not linked from anywhere public.
 */

type Palette = {
  id: string;
  label: string;
  note: string;
  /** one entry per stage, so colour can move through the journey */
  stages: { bg: string; ink: string; ink2: string; accent: string; panel: string; panelInk: string }[];
};

const PAPER = '#FDFBF7';
const SAND = '#F1E9DA';
const NAVY = '#080D1A';
const NAVY_2 = '#101A31';
const INK = '#1A1917';
const BRASS = '#B8964F';
const BRASS_HI = '#D4A843';
const CHROME = '#C8CCD2';

const four = (s: Palette['stages'][number]) => [s, s, s, s];

const PALETTES: Palette[] = [
  {
    id: 'paper',
    label: 'Paper',
    note: 'what is live now — gallery walls, ink on paper',
    stages: four({ bg: PAPER, ink: INK, ink2: '#4A4842', accent: BRASS, panel: 'rgba(253,251,247,0.93)', panelInk: INK }),
  },
  {
    id: 'navy',
    label: 'Navy',
    note: 'the whole page dark — the object glows instead of sitting on a wall',
    stages: four({ bg: NAVY, ink: PAPER, ink2: 'rgba(253,251,247,0.62)', accent: BRASS_HI, panel: 'rgba(16,26,49,0.86)', panelInk: PAPER }),
  },
  {
    id: 'journey',
    label: 'Journey',
    note: 'colour moves as you scroll — paper, sand, navy, paper again',
    stages: [
      { bg: PAPER, ink: INK, ink2: '#4A4842', accent: BRASS, panel: 'rgba(253,251,247,0.93)', panelInk: INK },
      { bg: SAND, ink: INK, ink2: '#5A5348', accent: '#8A6A2E', panel: 'rgba(255,253,248,0.94)', panelInk: INK },
      { bg: NAVY_2, ink: PAPER, ink2: 'rgba(253,251,247,0.66)', accent: BRASS_HI, panel: 'rgba(8,13,26,0.82)', panelInk: PAPER },
      { bg: NAVY, ink: PAPER, ink2: 'rgba(253,251,247,0.6)', accent: BRASS_HI, panel: 'rgba(16,26,49,0.86)', panelInk: PAPER },
    ],
  },
  {
    id: 'inverse',
    label: 'Inverse',
    note: 'dark at the ends, light in the middle — the wait is the bright room',
    stages: [
      { bg: NAVY, ink: PAPER, ink2: 'rgba(253,251,247,0.62)', accent: BRASS_HI, panel: 'rgba(16,26,49,0.86)', panelInk: PAPER },
      { bg: PAPER, ink: INK, ink2: '#4A4842', accent: BRASS, panel: 'rgba(253,251,247,0.95)', panelInk: INK },
      { bg: SAND, ink: INK, ink2: '#5A5348', accent: '#8A6A2E', panel: 'rgba(255,253,248,0.95)', panelInk: INK },
      { bg: NAVY, ink: PAPER, ink2: 'rgba(253,251,247,0.6)', accent: BRASS_HI, panel: 'rgba(16,26,49,0.86)', panelInk: PAPER },
    ],
  },
  {
    id: 'ink',
    label: 'Ink',
    note: 'near-black and chrome — coldest of the five, most product-like',
    stages: four({ bg: '#141412', ink: '#F2EFE8', ink2: 'rgba(242,239,232,0.58)', accent: CHROME, panel: 'rgba(28,28,25,0.88)', panelInk: '#F2EFE8' }),
  },
];

/** The accent was brass at headline scale and read as yellow. These are the
 *  ways off it that do not invent a new brand colour. */
type Accent = { id: string; label: string; note: string; on: (dark: boolean) => string };
const ACCENTS: Accent[] = [
  { id: 'none', label: 'No colour', note: 'same ink, half weight — the line reads quieter, not yellower',
    on: (d) => (d ? 'rgba(253,251,247,0.52)' : 'rgba(26,25,23,0.42)') },
  { id: 'solid', label: 'Full contrast', note: 'accent line is the brightest thing — no hue at all',
    on: (d) => (d ? '#FFFFFF' : '#000000') },
  { id: 'chrome', label: 'Chrome', note: 'cool pale grey — matches the object, no warmth',
    on: (d) => (d ? '#C8CCD2' : '#7C838C') },
  { id: 'brass', label: 'Brass', note: 'the gold you have now, for comparison',
    on: (d) => (d ? '#D4A843' : '#B8964F') },
];

/** Short enough to land before someone scrolls — and about the journey, which
 *  is the product. "Agents that draft" described the mechanism instead, which
 *  is a different and much smaller claim. */
type Head = { id: string; label: string; h: string[]; accentLine: string; note: string };
const HEADS: Head[] = [
  // Kate's, 2026-07-26 — the decision.
  { id: 'kate', label: "Kate's", h: ['Assembled intuitive'], accentLine: 'customer journeys.',
    note: 'the chosen one · subhead: agentic business solutions for Aotearoa' },
  { id: 'whole', label: 'Whole journey', h: ['The whole journey.'], accentLine: 'Not the first enquiry.',
    note: 'the objection and the answer in six words' },
  { id: 'twenty', label: 'Twenty years', h: ['A customer is not an enquiry.'], accentLine: "They're twenty years.",
    note: 'your own line — the longest of the four but the one that lands' },
  { id: 'joined', label: 'Joined up', h: ['One customer.'], accentLine: 'Every step, joined up.',
    note: 'sharpest — says journey without using the word' },
  { id: 'remember', label: 'Remembers', h: ['Customer journeys'], accentLine: 'that remember.',
    note: 'three words, and the promise is memory rather than automation' },
];

type TypeScale = { id: string; label: string; h1: string; h2: string; lede: string; note: string };
const SCALES: TypeScale[] = [
  { id: 'large', label: 'Large format', h1: 'clamp(2.9rem, 6.6vw, 7.4rem)', h2: 'clamp(2.4rem, 5.4vw, 5.4rem)', lede: 'clamp(1.05rem, 1.5vw, 1.45rem)', note: 'poster type — headline does the work, almost no body' },
  { id: 'balanced', label: 'Balanced', h1: 'clamp(2.6rem, 5.6vw, 5.2rem)', h2: 'clamp(1.9rem, 3.6vw, 3.2rem)', lede: 'clamp(0.98rem, 1.2vw, 1.15rem)', note: 'nearer the pricing page — type and panels carry equal weight' },
  { id: 'quiet', label: 'Quiet', h1: 'clamp(2rem, 3.8vw, 3.4rem)', h2: 'clamp(1.5rem, 2.6vw, 2.2rem)', lede: 'clamp(0.92rem, 1.05vw, 1.02rem)', note: 'editorial — the object leads, the words annotate' },
];

const STAGES = [
  { kicker: '001 — agentic customer journeys', h: [] as string[], accentLine: '', lede: 'Agentic business solutions for Aotearoa.' },
  { kicker: '002 — the wait', h: ['The only part'], accentLine: 'nobody else builds.', lede: 'They earn something. You learn something.' },
  { kicker: '003 — ask it', h: ['Ask it'], accentLine: 'something.', lede: 'A real agent. It drafts, it never sends.' },
  { kicker: '004 — begin', h: ['Build intelligence'], accentLine: 'you can understand.', lede: '' },
];

/** Read the variant out of the URL so a combination can be linked, not described. */
function fromUrl<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const v = new URLSearchParams(location.search).get(key) as T | null;
  return v && allowed.includes(v) ? v : fallback;
}

export function HomepageLab() {
  const [pal, setPal] = useState('inverse');   // Kate's pick, 2026-07-26
  const [obj, setObj] = useState<ObjectKind>('knot');
  const [scale, setScale] = useState(SCALES[0]!.id);
  const [acc, setAcc] = useState(ACCENTS[0]!.id);
  const [head, setHead] = useState(HEADS[0]!.id);
  // Applied after mount, not during render, so the server and client markup agree.
  useEffect(() => {
    setPal(fromUrl('p', PALETTES.map((x) => x.id), 'inverse'));
    setObj(fromUrl('o', OBJECTS.map((x) => x.kind), 'knot'));
    setScale(fromUrl('t', SCALES.map((x) => x.id), SCALES[0]!.id));
    setAcc(fromUrl('a', ACCENTS.map((x) => x.id), ACCENTS[0]!.id));
    setHead(fromUrl('h', HEADS.map((x) => x.id), HEADS[0]!.id));
    // ?s=2 jumps straight to a stage, so a single stage is linkable and can be
    // captured without a scroll animation racing the screenshot.
    const want = Number(new URLSearchParams(location.search).get('s'));
    if (Number.isFinite(want) && want > 0) {
      // Twice, and late: a frame after mount the fonts and the canvas have not
      // settled, offsetTop is wrong, and it lands in blank space between
      // stages. Re-assert once layout is real.
      const go = () => {
        const el = document.querySelectorAll('[data-stage]')[want] as HTMLElement | undefined;
        el?.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
      };
      setTimeout(go, 500);
      setTimeout(go, 1500);
    }
  }, []);
  const [stage, setStage] = useState(0);
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = new URLSearchParams({ p: pal, o: obj, t: scale, a: acc, h: head });
    history.replaceState(null, '', `?${q}`);
  }, [pal, obj, scale, acc, head]);

  const palette = PALETTES.find((p) => p.id === pal)!;
  const type = SCALES.find((s) => s.id === scale)!;
  const accent = ACCENTS.find((a) => a.id === acc)!;
  const headline = HEADS.find((h) => h.id === head)!;
  const s = palette.stages[Math.min(stage, palette.stages.length - 1)]!;
  const darkStage = s.bg !== PAPER && s.bg !== SAND;
  // the kicker keeps a hint of brass even when the headline drops colour, or
  // the page loses its only warm note entirely
  const accentColour = accent.on(darkStage);

  // Which stage is under the middle of the window — drives both colour and pose.
  useEffect(() => {
    const onScroll = () => {
      const secs = Array.from(rootRef.current?.querySelectorAll('[data-stage]') ?? []);
      secs.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight * 0.55 && r.bottom > innerHeight * 0.45) setStage(i);
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => removeEventListener('scroll', onScroll);
  }, []);

  // The scene is rebuilt whenever the object or the background changes, because
  // the environment map is what makes metal read and it is baked from the bg.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);

    // Kate's softbox recipe: emissive planes in a black room, then PMREM. A
    // dark page needs a brighter box or the metal goes to mud.
    const dark = s.bg !== PAPER && s.bg !== SAND;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.background = new THREE.Color('#0A0A0D');
    const box = (c: string, w: number, h: number, x: number, y: number, z: number, p: number) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(p) }));
      mesh.position.set(x, y, z); mesh.lookAt(0, 0, 0); env.add(mesh);
    };
    const boost = dark ? 1.55 : 1;
    box('#FFFFFF', 16, 6, 0, 9, 1, 3.4 * boost);
    box('#FFF0DC', 10, 12, -10, 2, 4, 2.6 * boost);
    box('#E9F0F8', 10, 12, 10, 2, -2, 2.4 * boost);
    box(dark ? '#BFA37A' : '#D9DEE6', 16, 4, 0, -7, 0, 1.6 * boost);
    scene.environment = pmrem.fromScene(env, 0.02).texture;
    scene.add(new THREE.AmbientLight('#FFFFFF', dark ? 0.32 : 0.5));
    const key = new THREE.DirectionalLight('#FFFFFF', dark ? 2.1 : 2.5);
    key.position.set(5, 8, 5); scene.add(key);

    const mats = makeMaterials();
    const built = buildObject(obj, mats, dark);
    const holder = new THREE.Group();
    holder.add(built.group);
    scene.add(holder);

    camera.position.set(0, 0.4, 10);
    camera.lookAt(0, 0, 0);

    // One pose per stage. Alternates sides so the type always has a clear half.
    const POSE = [
      { s: 1.00, x:  2.9, y: -0.1, ry: 0.2 },
      { s: 0.62, x: -4.6, y:  1.5, ry: 1.9 },   // the wait — smallest and furthest out; the phone is the subject here
      { s: 1.20, x:  2.9, y: -0.1, ry: 3.6 },
      { s: 1.55, x:  0.0, y:  0.1, ry: 5.4 },
    ];

    let raf = 0, t = 0, mx = 0, my = 0, cur = 0;
    const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const onMove = (ev: MouseEvent) => {
      mx = (ev.clientX / innerWidth - 0.5) * 2; my = (ev.clientY / innerHeight - 0.5) * 2;
    };
    const onResize = () => {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    };
    addEventListener('mousemove', onMove, { passive: true });
    addEventListener('resize', onResize);

    function tick() {
      raf = requestAnimationFrame(tick);
      if (!reduced) t += 0.016;
      const max = document.body.scrollHeight - innerHeight;
      const prog = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      const sf = prog * (POSE.length - 1);
      const i0 = Math.floor(sf), i1 = Math.min(i0 + 1, POSE.length - 1);
      const f = sf - i0, e = f * f * (3 - 2 * f);
      const A = POSE[i0]!, B = POSE[i1]!;
      const k = (a: number, b: number) => a + (b - a) * e;

      // narrow windows show less world, so push it further out and shrink it
      const wide = Math.min(1, Math.max(0, (innerWidth - 700) / 700));
      holder.scale.setScalar(k(A.s, B.s) * (0.72 + 0.28 * wide));
      holder.position.x = k(A.x, B.x) * (1 + (1 - wide) * 0.4) + mx * 0.3;
      holder.position.y = k(A.y, B.y) + (1 - wide) * 1.2 + Math.sin(t * 0.3) * 0.08 - my * 0.2;
      holder.rotation.y = k(A.ry, B.ry) + t * 0.09;
      holder.rotation.x = Math.sin(t * 0.22) * 0.05;

      // one part lights per stage, so the object answers the scroll
      const next = Math.round(sf);
      if (next !== cur) built.setStage?.(next);
      cur = next;
      built.parts.forEach((p, i) => {
        const lit = i % Math.max(1, built.parts.length) === cur % Math.max(1, built.parts.length);
        const mat = p.material as THREE.MeshPhysicalMaterial;
        mat.emissive = new THREE.Color(BRASS_HI);
        mat.emissiveIntensity = lit ? 0.3 + Math.sin(t * 2.2) * 0.1 : 0.02;
      });
      if (built.ring) {
        built.ring.rotation.z = t * 0.05;
        const rm = built.ring.material as THREE.MeshPhysicalMaterial;
        rm.emissive = new THREE.Color(BRASS_HI);
        rm.emissiveIntensity = cur === POSE.length - 1 ? 0.34 : 0.05;
      }
      camera.position.x = mx * 0.8;
      camera.position.y = 0.4 - my * 0.35;
      camera.lookAt(holder.position.x * 0.3, holder.position.y * 0.25, 0);
      renderer.render(scene, camera);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('mousemove', onMove);
      removeEventListener('resize', onResize);
      pmrem.dispose();
      renderer.dispose();
    };
  }, [obj, s.bg]);

  const objNote = useMemo(() => OBJECTS.find((o) => o.kind === obj)?.note ?? '', [obj]);

  return (
    <div
      ref={rootRef}
      className="lab"
      style={{
        ['--bg' as string]: s.bg, ['--ink' as string]: s.ink, ['--ink2' as string]: s.ink2,
        ['--accent' as string]: accentColour,
        ['--kicker' as string]: s.accent,
        ['--panel' as string]: s.panel, ['--panelInk' as string]: s.panelInk,
        ['--h1' as string]: type.h1, ['--h2' as string]: type.h2, ['--lede' as string]: type.lede,
      }}
    >
      <canvas ref={canvasRef} className="lab-canvas" />

      <button type="button" className="lab-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? 'hide controls' : 'controls'}
      </button>
      <div className={`lab-bar${open ? '' : ' shut'}`}>
        <div className="lab-group">
          <span className="lab-l">palette</span>
          {PALETTES.map((p) => (
            <button key={p.id} className={p.id === pal ? 'on' : ''} onClick={() => setPal(p.id)}>{p.label}</button>
          ))}
        </div>
        <div className="lab-group">
          <span className="lab-l">object</span>
          {OBJECTS.map((o) => (
            <button key={o.kind} className={o.kind === obj ? 'on' : ''} onClick={() => setObj(o.kind)}>{o.label}</button>
          ))}
        </div>
        <div className="lab-group">
          <span className="lab-l">headline</span>
          {HEADS.map((h) => (
            <button key={h.id} className={h.id === head ? 'on' : ''} onClick={() => setHead(h.id)}>{h.label}</button>
          ))}
        </div>
        <div className="lab-group">
          <span className="lab-l">accent</span>
          {ACCENTS.map((a) => (
            <button key={a.id} className={a.id === acc ? 'on' : ''} onClick={() => setAcc(a.id)}>{a.label}</button>
          ))}
        </div>
        <div className="lab-group">
          <span className="lab-l">type</span>
          {SCALES.map((t) => (
            <button key={t.id} className={t.id === scale ? 'on' : ''} onClick={() => setScale(t.id)}>{t.label}</button>
          ))}
        </div>
        <div className="lab-note">
          <b>{OBJECTS.find((o) => o.kind === obj)?.label}</b> — {objNote}
        </div>
      </div>

      <main className="lab-main">
        {STAGES.map((st, i) => (
          <section key={i} data-stage={i} className={`lab-stage${i % 2 ? ' flip' : ''}`}>
            <div className="lab-copy">
              <div className="lab-kicker">{st.kicker}</div>
              <h1 style={i === 0 ? undefined : { fontSize: 'var(--h2)' }}>
                {(i === 0 ? headline.h : st.h).map((line) => <span key={line}>{line}<br /></span>)}
                <span className="lab-accent">{i === 0 ? headline.accentLine : st.accentLine}</span>
              </h1>
              {st.lede && <p className="lab-lede">{st.lede}</p>}
              {i === 0 && (
                <div className="lab-field">
                  <input placeholder="yourbusiness.co.nz" readOnly />
                  <button type="button">assemble mine</button>
                </div>
              )}
              {i === 1 && (
                <div className="lab-phone"><WaitState /></div>
              )}
              {i === 3 && (
                <div className="lab-row">
                  <button type="button" className="solid">begin a conversation</button>
                  <button type="button" className="ghost">see pricing</button>
                </div>
              )}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
