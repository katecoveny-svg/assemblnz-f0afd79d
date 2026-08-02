/* assembl · the blueprint explainer — whiteboard mini-videos, drawn from code
 *
 * Deep blue ink on paper white. Four panels that draw themselves with
 * stroke-dashoffset. No video files, no libraries, no external assets: the whole
 * explainer is a few KB, works offline, and prints as a proper draughtsman's plate.
 *
 * The hero makes the wait *feel* like something. This makes a person who has never
 * heard the phrase "monetised wait state" understand it. Half the room needs this
 * and none of them will ask.
 *
 * Spec: references/blueprint-explainer.md · Copy: references/plain-language.md
 */

const BP_REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Hand quality, not wobble: a corner that overshoots by a couple of pixels, a
   circle that doesn't quite close. Deterministic, so the drawing is art-directed
   rather than rolled fresh on every load. */
const jitter = (i, amp = 2) => {
  const v = Math.sin(i * 91.7) * 43758.5453;
  return (v - Math.floor(v) - 0.5) * amp;
};

/* ── the four plates ────────────────────────────────────────────
   Each returns an array of {d, kind, label?} — kind drives weight and colour:
   'ink' structure · 'thin' construction · 'accent' the money moment.
   Coordinates are on a 480×260 board. */

const PANELS = [
  {
    id: 'gap',
    title: 'the wait you already have',
    aria: 'A customer on the left and a lender on the right, with an empty gap between them measured as one working day.',
    build: ({ waitLabel }) => [
      /* customer — head, shoulders, and a base line to stand on */
      { d: 'M40 92 a15 15 0 1 1 0.1 0 Z', kind: 'ink' },
      { d: `M18 132 q22 -30 44 0`, kind: 'ink' },
      { d: `M18 132 v${42 + jitter(1)} M62 132 v${42 + jitter(2)}`, kind: 'ink' },
      { t: 'you', x: 40, y: 205, kind: 'ink', anchor: 'middle' },
      /* the business */
      { d: 'M392 84 h72 v96 h-72 Z', kind: 'ink' },
      { d: 'M406 104 h20 M406 124 h20 M438 104 h14 M438 124 h14', kind: 'thin' },
      { t: 'the lender', x: 428, y: 205, kind: 'ink', anchor: 'middle' },
      /* the gap — deliberately empty. that is the whole point. */
      { d: 'M104 132 h256', kind: 'thin', dashed: true },
      { d: 'M104 122 v20 M360 122 v20', kind: 'thin' },
      { d: 'M104 132 l14 -6 v12 Z M360 132 l-14 -6 v12 Z', kind: 'thin', fill: true },
      { t: waitLabel, x: 232, y: 118, kind: 'ink', anchor: 'middle' },
      { t: 'nothing happens in here', x: 232, y: 160, kind: 'faint', anchor: 'middle' },
    ],
  },
  {
    id: 'cost',
    title: 'what the gap costs',
    aria: 'The same gap, annotated with three costs: people who give up, the same question asked twice, and work done later at a higher price.',
    build: () => [
      { d: 'M96 48 h288', kind: 'thin', dashed: true },
      { d: 'M96 40 v16 M384 40 v16', kind: 'thin' },
      { t: 'the same gap', x: 240, y: 32, kind: 'faint', anchor: 'middle' },
      /* a draughtsman's bracket under the gap, dropping to a costed list */
      { d: 'M96 64 v14 h288 v-14', kind: 'ink' },
      { d: `M240 78 v${26 + jitter(2)}`, kind: 'thin' },
      /* three costs, stacked. one leader tick each — never side by side, they collide. */
      { d: 'M112 118 h16', kind: 'thin' },
      { t: 'some people give up part-way', x: 136, y: 122, kind: 'ink', anchor: 'start' },
      { d: 'M112 152 h16', kind: 'thin' },
      { t: 'the same question gets asked twice', x: 136, y: 156, kind: 'ink', anchor: 'start' },
      { d: 'M112 186 h16', kind: 'thin' },
      { t: 'the work still happens — later,', x: 136, y: 190, kind: 'ink', anchor: 'start' },
      { t: 'and by then it costs more', x: 136, y: 208, kind: 'ink', anchor: 'start' },
      /* the bracket that ties the three together */
      { d: 'M104 110 v88', kind: 'thin' },
      { t: 'this is the bit nobody designed', x: 240, y: 238, kind: 'faint', anchor: 'middle' },
    ],
  },
  {
    id: 'fill',
    title: 'what fills it',
    aria: 'One short question goes into the gap and a prepared file comes out, with a small reward handed back to the customer.',
    build: () => [
      { d: 'M64 40 h352 v150 h-352 Z', kind: 'thin', dashed: true },
      { t: 'the same wait', x: 240, y: 30, kind: 'faint', anchor: 'middle' },
      /* one question in */
      { d: 'M92 80 h96', kind: 'ink' },
      { d: 'M188 80 l-12 -6 v12 Z', kind: 'ink', fill: true },
      { t: 'one short question', x: 138, y: 68, kind: 'ink', anchor: 'middle' },
      /* the agent's work, drawn as a stack assembling */
      { d: 'M200 62 h80 v14 h-80 Z', kind: 'ink' },
      { d: `M200 84 h80 v14 h-80 Z`, kind: 'ink' },
      { d: `M200 106 h${80 + jitter(3)} v14 h-80 Z`, kind: 'ink' },
      { t: 'work prepared', x: 240, y: 140, kind: 'ink', anchor: 'middle' },
      { t: 'while you wait', x: 240, y: 158, kind: 'ink', anchor: 'middle' },
      /* a prepared file out */
      { d: 'M292 80 h96', kind: 'ink' },
      { d: 'M388 80 l-12 -6 v12 Z', kind: 'ink', fill: true },
      { t: 'a complete file', x: 340, y: 68, kind: 'ink', anchor: 'middle' },
      /* the reward handed back */
      { d: 'M340 112 a14 14 0 1 1 0.1 0 Z', kind: 'ink' },
      { d: 'M340 100 v20 M332 110 h16', kind: 'thin' },
      { d: 'M326 126 h-64', kind: 'thin' },
      { d: 'M262 126 l12 -6 v12 Z', kind: 'thin', fill: true },
      { t: 'and something back for you', x: 240, y: 206, kind: 'faint', anchor: 'middle' },
    ],
  },
  {
    id: 'money',
    title: 'who is better off',
    aria: 'A two-column ledger. The customer column lists finishing sooner and a decision they can read. The lender column lists fewer abandoned applications and less rework, with the human sign-off named underneath.',
    build: ({ humanRole }) => [
      /* the ledger T */
      { d: 'M60 44 h360', kind: 'ink' },
      { d: `M240 44 v${132 + jitter(5)}`, kind: 'ink' },
      { t: 'you get', x: 150, y: 34, kind: 'ink', anchor: 'middle' },
      { t: 'the lender gets', x: 330, y: 34, kind: 'ink', anchor: 'middle' },
      /* customer side */
      { d: 'M78 70 h12 M78 100 h12 M78 130 h12', kind: 'thin' },
      { t: 'a decision you can read', x: 100, y: 74, kind: 'ink', anchor: 'start' },
      { t: 'no form to fill in twice', x: 100, y: 104, kind: 'ink', anchor: 'start' },
      { t: 'an answer the same day', x: 100, y: 134, kind: 'ink', anchor: 'start' },
      /* lender side */
      { d: 'M258 70 h12 M258 100 h12 M258 130 h12', kind: 'thin' },
      { t: 'fewer half-finished', x: 280, y: 74, kind: 'ink', anchor: 'start' },
      { t: 'applications', x: 280, y: 92, kind: 'ink', anchor: 'start' },
      { t: 'no chasing by email', x: 280, y: 122, kind: 'ink', anchor: 'start' },
      /* the money moment — the only accent in the whole set */
      { d: 'M240 176 h180', kind: 'accent' },
      { t: 'that is the money bit', x: 330, y: 198, kind: 'accent', anchor: 'middle' },
      /* the human */
      { d: 'M60 176 h160', kind: 'thin' },
      { t: `signed off by a ${humanRole}`, x: 140, y: 198, kind: 'ink', anchor: 'middle' },
      { t: 'every time', x: 140, y: 216, kind: 'faint', anchor: 'middle' },
    ],
  },
];

const NS = 'http://www.w3.org/2000/svg';

function el(name, attrs) {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

function renderPanel(panel, ctxData) {
  const svg = el('svg', {
    viewBox: '0 0 480 260', class: 'bp-svg',
    role: 'img', 'aria-label': panel.aria,
  });

  /* the graph grid — barely there, purely decorative */
  const grid = el('g', { class: 'bp-grid', 'aria-hidden': 'true' });
  for (let x = 24; x < 480; x += 24) grid.appendChild(el('line', { x1: x, y1: 0, x2: x, y2: 260 }));
  for (let y = 24; y < 260; y += 24) grid.appendChild(el('line', { x1: 0, y1: y, x2: 480, y2: y }));
  svg.appendChild(grid);

  const strokes = [];
  panel.build(ctxData).forEach((item, i) => {
    if (item.t !== undefined) {
      const t = el('text', {
        x: item.x, y: item.y, class: `bp-t bp-t--${item.kind}`,
        'text-anchor': item.anchor || 'start',
      });
      t.textContent = item.t;
      svg.appendChild(t);
      strokes.push({ node: t, kind: 'text', i });
      return;
    }
    const p = el('path', {
      d: item.d, class: `bp-p bp-p--${item.kind}`,
      fill: item.fill ? 'currentColor' : 'none',
    });
    if (item.dashed) p.classList.add('is-dashed');
    svg.appendChild(p);
    strokes.push({ node: p, kind: 'path', i });
  });

  return { svg, strokes };
}

export function createBlueprint(root, data) {
  const spec = data.explainer;
  if (!spec) return { replay() {} };

  const ctxData = {
    waitLabel: spec.waitLabel,
    humanRole: (data.human?.role || 'named person').toLowerCase(),
  };

  const board = root.querySelector('[data-bp-board]');
  const built = [];

  PANELS.forEach((panel, idx) => {
    const fig = document.createElement('figure');
    fig.className = 'bp-panel';
    fig.dataset.panel = panel.id;

    const num = document.createElement('p');
    num.className = 'label bp-num';
    num.textContent = `${idx + 1} · ${spec.panels?.[idx]?.title || panel.title}`;
    fig.appendChild(num);

    const { svg, strokes } = renderPanel(panel, ctxData);
    fig.appendChild(svg);

    const cap = document.createElement('figcaption');
    cap.textContent = spec.panels?.[idx]?.caption || '';
    fig.appendChild(cap);

    board.appendChild(fig);
    built.push({ fig, strokes });
  });

  /* Measure once, at init. Hard-coded lengths break the moment anyone edits a path. */
  function prime(strokes) {
    strokes.forEach(s => {
      if (s.kind !== 'path') return;
      const len = s.node.getTotalLength() || 1;
      s.node.style.setProperty('--len', len);
    });
  }
  built.forEach(b => prime(b.strokes));

  function draw(b) {
    if (b.fig.dataset.drawn === 'true') return;
    b.fig.dataset.drawn = 'true';
    if (BP_REDUCED()) { b.fig.classList.add('is-complete'); return; }
    b.strokes.forEach((s, k) => {
      s.node.style.animationDelay = `${k * 90}ms`;
      s.node.classList.add('is-drawing');
    });
  }

  function reset(b) {
    b.fig.dataset.drawn = 'false';
    b.fig.classList.remove('is-complete');
    b.strokes.forEach(s => {
      s.node.classList.remove('is-drawing');
      s.node.style.animation = 'none';
      void s.node.offsetWidth;          /* force reflow so the animation can restart */
      s.node.style.animation = '';
    });
  }

  /* Panels arm on scroll and draw once, in order. Never autoplay the whole set on
     load — the viewer should feel they caused it. */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const b = built.find(x => x.fig === e.target);
      if (b) { draw(b); io.unobserve(e.target); }
    });
  }, { threshold: 0.35 });
  built.forEach(b => io.observe(b.fig));

  root.querySelector('[data-bp-replay]')?.addEventListener('click', () => {
    built.forEach(reset);
    built.forEach((b, i) => setTimeout(() => draw(b), i * 900));
  });

  return { replay() { built.forEach(reset); built.forEach(draw); } };
}
