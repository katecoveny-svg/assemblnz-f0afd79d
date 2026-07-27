'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FINE, buildFine, fineMaterials, type FineKind } from './fine';
import './directions.css';

/**
 * Four directions, not four variations.
 *
 * Kate, 2026-07-26: "its looking clunky and wrong i think the font is wrong and
 * the old 3d object was way finer and more dynamic i dont know if the navy is
 * right can you experiment with some totally different ideas".
 *
 * So each of these is a whole world — face, weight, colour, object, layout,
 * motion — rather than the same page with the paint changed. Two things are
 * fixed across all four, because they were the actual faults:
 *
 *   1. Lato everywhere — Kate's call. Not Cormorant, and never Inter Tight 600,
 *      which is what the cinematic homepage used at 7rem and is what "clunky"
 *      looks like. The four separate on weight, scale, tracking and case.
 *   2. Nothing in the 3D is thicker than 0.03. See fine.ts.
 *   3. No grey text. The second line differs by weight, not by fading out.
 */

type Direction = {
  id: string;
  label: string;
  premise: string;
  bg: string;
  ink: string;
  ink2: string;
  accent: string;
  dark: boolean;
  object: FineKind;
  /** css font-family stack for the headline */
  face: string;
  weight: number;
  /** the second line, differentiated by weight — never by going grey */
  weight2: number;
  size: string;
  tracking: string;
  leading: string;
  /** where the words sit against the object */
  layout: 'left' | 'centre' | 'low' | 'split';
  /** uppercase, letterspaced label type */
  caps?: boolean;
};

// Lato throughout — Kate's call, 2026-07-26. Not Cormorant, and never Inter
// Tight 600, which is what made the old page feel clunky at headline scale.
// The four directions separate on weight, scale, tracking, case and colour
// instead of on typeface.
const LATO = "'Lato', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

const DIRECTIONS: Direction[] = [
  {
    id: 'museum',
    label: 'Museum',
    premise: 'Lato light at wall-label scale on bone, second line heavy. The object is a specimen under glass — centred, symmetrical, mostly air.',
    bg: '#F4F1E8', ink: '#1B1A17', ink2: '#1B1A17', accent: '#8A6A2E', dark: false,
    object: 'veil', face: LATO, weight: 300, weight2: 700, size: 'clamp(2.7rem, 7vw, 7.6rem)',
    tracking: '-0.03em', leading: '1.04', layout: 'centre',
  },
  {
    id: 'instrument',
    label: 'Instrument',
    premise: 'Assembl navy, monospace labels, small bold caps. Chrome thread wound through gold — a precision instrument, not a brochure.',
    bg: '#030B1F', ink: '#F0EEE9', ink2: '#F0EEE9', accent: '#D4A843', dark: true,
    object: 'filament', face: LATO, weight: 700, weight2: 300, size: 'clamp(1.9rem, 3.6vw, 3.6rem)',
    tracking: '0.03em', leading: '1.24', layout: 'split', caps: true,
  },
  {
    id: 'vapour',
    label: 'Vapour',
    premise: 'Warm white, one huge light weight set tight, and the object as five thousand points of dust filling the frame.',
    bg: '#FBF9F5', ink: '#211F1B', ink2: '#211F1B', accent: '#9A7B3C', dark: false,
    object: 'dust', face: LATO, weight: 300, weight2: 300, size: 'clamp(3rem, 8.4vw, 9.4rem)',
    tracking: '-0.045em', leading: '0.94', layout: 'low',
  },
  {
    id: 'blueprint',
    label: 'Blueprint',
    premise: 'Ink ground, hairline wireframe, small letterspaced caps. Architectural — the drawing, not the render.',
    bg: '#16171A', ink: '#EDEBE6', ink2: '#EDEBE6', accent: '#B8964F', dark: true,
    object: 'wire', face: LATO, weight: 400, weight2: 700, size: 'clamp(1.3rem, 2.2vw, 2.1rem)',
    tracking: '0.22em', leading: '1.7', layout: 'left', caps: true,
  },
];

const HEAD = { a: 'Assembled intuitive', b: 'customer journeys.' };
const SUB = 'Agentic business solutions for Aotearoa.';

export function DirectionsLab() {
  const [id, setId] = useState('instrument');   // Kate's pick, 2026-07-26
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const d = DIRECTIONS.find((x) => x.id === id)!;

  useEffect(() => {
    const v = new URLSearchParams(location.search).get('d');
    if (v && DIRECTIONS.some((x) => x.id === v)) setId(v);
  }, []);
  useEffect(() => { history.replaceState(null, '', `?d=${id}`); }, [id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = d.dark ? 1.2 : 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.background = new THREE.Color('#0A0A0D');
    const box = (c: string, w: number, h: number, x: number, y: number, z: number, p: number) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(p) }));
      mesh.position.set(x, y, z); mesh.lookAt(0, 0, 0); env.add(mesh);
    };
    // Hairline metal needs a bright, high-contrast box or it disappears; a dark
    // page needs more of it again.
    const boost = d.dark ? 1.9 : 1.25;
    box('#FFFFFF', 18, 7, 0, 9, 1, 3.6 * boost);
    box('#FFF2E0', 11, 13, -10, 2, 4, 2.7 * boost);
    box('#E7EFF8', 11, 13, 10, 2, -2, 2.5 * boost);
    box(d.accent, 16, 4, 0, -7, 0, 1.5 * boost);
    scene.environment = pmrem.fromScene(env, 0.02).texture;
    scene.add(new THREE.AmbientLight('#FFFFFF', d.dark ? 0.3 : 0.62));
    const key = new THREE.DirectionalLight('#FFFFFF', d.dark ? 1.9 : 2.4);
    key.position.set(5, 8, 5); scene.add(key);

    const mats = fineMaterials(d.dark, d.accent);
    const built = buildFine(d.object, mats);
    const holder = new THREE.Group();
    holder.add(built.group);
    scene.add(holder);

    camera.position.set(0, 0.3, 9.4);
    camera.lookAt(0, 0, 0);

    let raf = 0, t = 0, mx = 0, my = 0;
    const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2;
    };
    const onResize = () => {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    };
    addEventListener('mousemove', onMove, { passive: true });
    addEventListener('resize', onResize);

    // Where the object sits depends on where the words are, not the other way
    // round — that is what stopped the two fighting on the old page.
    const HOME: Record<Direction['layout'], [number, number, number]> = {
      centre: [0, 0.25, 0.78],
      split: [2.5, 0, 0.92],
      low: [0.4, 0.75, 1.18],
      left: [2.8, 0.1, 0.86],
    };

    function tick() {
      raf = requestAnimationFrame(tick);
      if (!reduced) t += 0.016;
      const max = document.body.scrollHeight - innerHeight;
      const prog = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      built.animate(t, prog);

      const wide = Math.min(1, Math.max(0, (innerWidth - 700) / 700));
      const [hx, hy, hs] = HOME[d.layout];
      holder.scale.setScalar(hs * (0.66 + 0.34 * wide) * (1 + prog * 0.22));
      holder.position.x = hx * (1 + (1 - wide) * 0.35) + mx * 0.34;
      holder.position.y = hy + (1 - wide) * 0.5 - my * 0.24 + Math.sin(t * 0.24) * 0.06;
      holder.rotation.y = t * 0.035 + prog * 1.1 + mx * 0.12;
      camera.position.x = mx * 0.55;
      camera.position.y = 0.3 - my * 0.28;
      camera.lookAt(holder.position.x * 0.24, holder.position.y * 0.2, 0);
      renderer.render(scene, camera);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('mousemove', onMove);
      removeEventListener('resize', onResize);
      pmrem.dispose(); renderer.dispose();
    };
  }, [d]);

  return (
    <div
      className={`dir dir-${d.layout}`}
      style={{
        ['--bg' as string]: d.bg, ['--ink' as string]: d.ink, ['--ink2' as string]: d.ink2,
        ['--accent' as string]: d.accent, ['--face' as string]: d.face,
        ['--wt' as string]: String(d.weight), ['--wt2' as string]: String(d.weight2),
        ['--size' as string]: d.size,
        ['--track' as string]: d.tracking, ['--lead' as string]: d.leading,
        ['--mono' as string]: MONO,
      }}
    >
      <canvas ref={canvasRef} className="dir-canvas" />

      <button type="button" className="dir-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? 'close' : `${d.label.toLowerCase()} · switch`}
      </button>
      <div className={`dir-panel${open ? '' : ' shut'}`}>
        {DIRECTIONS.map((x) => (
          <button key={x.id} type="button" className={x.id === id ? 'on' : ''} onClick={() => setId(x.id)}>
            {x.label}
          </button>
        ))}
        <p className="dir-premise">
          {d.premise}{' '}
          <b>{FINE.find((f) => f.kind === d.object)?.label}</b> — {FINE.find((f) => f.kind === d.object)?.note}
        </p>
      </div>

      <main className="dir-main">
        <section className="dir-hero">
          <div className="dir-kicker">001 — agentic customer journeys</div>
          {/* Both lines full-strength ink. The second differs by weight, not by
              fading to grey — that was the "grey text" Kate called out. */}
          <h1 className={d.caps ? 'caps' : ''}>
            {HEAD.a}<br /><span className="dir-two">{HEAD.b}</span>
          </h1>
          <p className="dir-sub">{SUB}</p>
          <div className="dir-field">
            <input placeholder="yourbusiness.co.nz" readOnly />
            <button type="button">assemble mine</button>
          </div>
        </section>
      </main>
    </div>
  );
}
