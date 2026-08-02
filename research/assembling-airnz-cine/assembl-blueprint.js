/* assembl-blueprint.js — the blueprint explainer, fleet edition.
 *
 * Ported from the assembling-demonstrator skill (templates/blueprint.js).
 * Deep blue ink on paper white; four panels that draw themselves with
 * stroke-dashoffset. No video files, no libraries. The hero makes the wait
 * feel like something; this makes a person who has never heard the phrase
 * "monetised wait state" understand it. Half the room needs it and none of
 * them will ask.
 *
 * Fleet changes from the skill original: plain script (no ES modules, the
 * demos are single-file), and the party labels + ledger columns come in via
 * cfg so eighteen verticals share one geometry without sharing one client.
 *
 *   AssemblBlueprint.mount(rootEl, {
 *     waitLabel, party, humanRole,
 *     youGet:  [3 short lines],
 *     theyGet: [3 short lines],
 *     captions:[4 one-liners]
 *   })
 */
(function () {
  'use strict';

  var REDUCED = function () {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /* Hand quality, not wobble: deterministic, art-directed imperfection. */
  function jitter(i, amp) {
    var v = Math.sin(i * 91.7) * 43758.5453;
    return (v - Math.floor(v) - 0.5) * (amp || 2);
  }

  /* Wrap a ledger line onto two rows if it will not fit the column. */
  function ledger(lines, x, xTick, y0) {
    var out = [];
    lines.slice(0, 3).forEach(function (line, i) {
      var y = y0 + i * 32;
      out.push({ d: 'M' + xTick + ' ' + (y - 4) + ' h12', kind: 'thin' });
      out.push({ t: line, x: x, y: y, kind: 'ink', anchor: 'start', small: true });
    });
    return out;
  }

  /* The four plates, on a 480x260 board. Structure is shared; the words are
     the vertical's own. */
  function panels(cfg) {
    return [
      {
        id: 'gap',
        aria: 'A customer on the left and ' + cfg.party + ' on the right, with an empty gap between them measured as the real wait.',
        build: [
          { d: 'M40 92 a15 15 0 1 1 0.1 0 Z', kind: 'ink' },
          { d: 'M18 132 q22 -30 44 0', kind: 'ink' },
          { d: 'M18 132 v' + (42 + jitter(1)) + ' M62 132 v' + (42 + jitter(2)), kind: 'ink' },
          { t: 'you', x: 40, y: 205, kind: 'ink', anchor: 'middle' },
          { d: 'M392 84 h72 v96 h-72 Z', kind: 'ink' },
          { d: 'M406 104 h20 M406 124 h20 M438 104 h14 M438 124 h14', kind: 'thin' },
          { t: cfg.party, x: 428, y: 205, kind: 'ink', anchor: 'middle' },
          { d: 'M104 132 h256', kind: 'thin', dashed: true },
          { d: 'M104 122 v20 M360 122 v20', kind: 'thin' },
          { d: 'M104 132 l14 -6 v12 Z M360 132 l-14 -6 v12 Z', kind: 'thin', fill: true },
          { t: cfg.waitLabel, x: 232, y: 118, kind: 'ink', anchor: 'middle' },
          { t: 'nothing happens in here', x: 232, y: 160, kind: 'faint', anchor: 'middle' }
        ]
      },
      {
        id: 'cost',
        aria: 'The same gap, annotated with three costs: people who give up, the same question asked twice, and work done later at a higher price.',
        build: [
          { d: 'M96 48 h288', kind: 'thin', dashed: true },
          { d: 'M96 40 v16 M384 40 v16', kind: 'thin' },
          { t: 'the same gap', x: 240, y: 32, kind: 'faint', anchor: 'middle' },
          { d: 'M96 64 v14 h288 v-14', kind: 'ink' },
          { d: 'M240 78 v' + (26 + jitter(2)), kind: 'thin' },
          { d: 'M112 118 h16', kind: 'thin' },
          { t: 'some people give up part-way', x: 136, y: 122, kind: 'ink', anchor: 'start' },
          { d: 'M112 152 h16', kind: 'thin' },
          { t: 'the same question gets asked twice', x: 136, y: 156, kind: 'ink', anchor: 'start' },
          { d: 'M112 186 h16', kind: 'thin' },
          { t: 'the work still happens — later,', x: 136, y: 190, kind: 'ink', anchor: 'start' },
          { t: 'and by then it costs more', x: 136, y: 208, kind: 'ink', anchor: 'start' },
          { d: 'M104 110 v88', kind: 'thin' },
          { t: 'this is the bit nobody designed', x: 240, y: 238, kind: 'faint', anchor: 'middle' }
        ]
      },
      {
        id: 'fill',
        aria: 'One short question goes into the gap and prepared work comes out, with a small reward handed back to the customer.',
        build: [
          { d: 'M64 40 h352 v150 h-352 Z', kind: 'thin', dashed: true },
          { t: 'the same wait', x: 240, y: 30, kind: 'faint', anchor: 'middle' },
          { d: 'M92 80 h96', kind: 'ink' },
          { d: 'M188 80 l-12 -6 v12 Z', kind: 'ink', fill: true },
          { t: 'one short question', x: 138, y: 68, kind: 'ink', anchor: 'middle' },
          { d: 'M200 62 h80 v14 h-80 Z', kind: 'ink' },
          { d: 'M200 84 h80 v14 h-80 Z', kind: 'ink' },
          { d: 'M200 106 h' + (80 + jitter(3)) + ' v14 h-80 Z', kind: 'ink' },
          { t: 'work prepared', x: 240, y: 140, kind: 'ink', anchor: 'middle' },
          { t: 'while you wait', x: 240, y: 158, kind: 'ink', anchor: 'middle' },
          { d: 'M292 80 h96', kind: 'ink' },
          { d: 'M388 80 l-12 -6 v12 Z', kind: 'ink', fill: true },
          { t: 'a complete file', x: 340, y: 68, kind: 'ink', anchor: 'middle' },
          { d: 'M340 112 a14 14 0 1 1 0.1 0 Z', kind: 'ink' },
          { d: 'M340 100 v20 M332 110 h16', kind: 'thin' },
          { d: 'M326 126 h-64', kind: 'thin' },
          { d: 'M262 126 l12 -6 v12 Z', kind: 'thin', fill: true },
          { t: 'and something back for you', x: 240, y: 206, kind: 'faint', anchor: 'middle' }
        ]
      },
      {
        id: 'money',
        aria: 'A two-column ledger showing what the customer gains and what ' + cfg.party + ' gains, with the human sign-off named underneath.',
        build: [
          { d: 'M60 44 h360', kind: 'ink' },
          { d: 'M240 44 v' + (132 + jitter(5)), kind: 'ink' },
          { t: 'you get', x: 150, y: 34, kind: 'ink', anchor: 'middle' },
          { t: cfg.party + ' gets', x: 330, y: 34, kind: 'ink', anchor: 'middle' }
        ]
          .concat(ledger(cfg.youGet, 100, 78, 74))
          .concat(ledger(cfg.theyGet, 280, 258, 74))
          .concat([
            { d: 'M240 176 h180', kind: 'accent' },
            { t: 'that is the money bit', x: 330, y: 198, kind: 'accent', anchor: 'middle' },
            { d: 'M60 176 h160', kind: 'thin' },
            { t: 'signed off by ' + cfg.humanRole, x: 140, y: 198, kind: 'ink', anchor: 'middle' },
            { t: 'every time', x: 140, y: 216, kind: 'faint', anchor: 'middle' }
          ])
      }
    ];
  }

  var NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function renderPanel(panel) {
    var svg = el('svg', {
      viewBox: '0 0 480 260', class: 'abBp__svg',
      role: 'img', 'aria-label': panel.aria
    });
    var grid = el('g', { class: 'abBp__grid', 'aria-hidden': 'true' });
    for (var x = 24; x < 480; x += 24) grid.appendChild(el('line', { x1: x, y1: 0, x2: x, y2: 260 }));
    for (var y = 24; y < 260; y += 24) grid.appendChild(el('line', { x1: 0, y1: y, x2: 480, y2: y }));
    svg.appendChild(grid);

    var strokes = [];
    panel.build.forEach(function (item) {
      if (item.t !== undefined) {
        var t = el('text', {
          x: item.x, y: item.y,
          class: 'abBp__t abBp__t--' + item.kind + (item.small ? ' abBp__t--small' : ''),
          'text-anchor': item.anchor || 'start'
        });
        t.textContent = item.t;
        svg.appendChild(t);
        strokes.push({ node: t, kind: 'text' });
        return;
      }
      var p = el('path', {
        d: item.d, class: 'abBp__p abBp__p--' + item.kind,
        fill: item.fill ? 'currentColor' : 'none'
      });
      if (item.dashed) p.classList.add('is-dashed');
      svg.appendChild(p);
      strokes.push({ node: p, kind: 'path' });
    });
    return { svg: svg, strokes: strokes };
  }

  function mount(root, cfg) {
    if (!root) return;
    var board = root.querySelector('[data-bp-board]');
    if (!board) return;
    var built = [];

    panels(cfg).forEach(function (panel, idx) {
      var fig = document.createElement('figure');
      fig.className = 'abBp__panel';

      var num = document.createElement('p');
      num.className = 'abBp__num';
      num.textContent = (idx + 1) + ' · ' + ['the wait you already have', 'what the gap costs', 'what fills it', 'who is better off'][idx];
      fig.appendChild(num);

      var r = renderPanel(panel);
      fig.appendChild(r.svg);

      var cap = document.createElement('figcaption');
      cap.textContent = (cfg.captions && cfg.captions[idx]) || '';
      fig.appendChild(cap);

      board.appendChild(fig);
      built.push({ fig: fig, strokes: r.strokes });
    });

    /* Measure once, at init — hard-coded lengths break on the first edit. */
    built.forEach(function (b) {
      b.strokes.forEach(function (s) {
        if (s.kind !== 'path') return;
        var len = 1;
        try { len = s.node.getTotalLength() || 1; } catch (e) {}
        s.node.style.setProperty('--len', len);
      });
    });

    function draw(b) {
      if (b.fig.dataset.drawn === 'true') return;
      b.fig.dataset.drawn = 'true';
      if (REDUCED()) { b.fig.classList.add('is-complete'); return; }
      b.strokes.forEach(function (s, k) {
        s.node.style.animationDelay = (k * 90) + 'ms';
        s.node.classList.add('is-drawing');
      });
    }
    function reset(b) {
      b.fig.dataset.drawn = 'false';
      b.fig.classList.remove('is-complete');
      b.strokes.forEach(function (s) {
        s.node.classList.remove('is-drawing');
        s.node.style.animation = 'none';
        void s.node.offsetWidth;
        s.node.style.animation = '';
      });
    }

    /* Panels arm on scroll and draw once, in order — the viewer causes it. */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          for (var i = 0; i < built.length; i++) {
            if (built[i].fig === e.target) { draw(built[i]); io.unobserve(e.target); break; }
          }
        });
      }, { threshold: 0.35 });
      built.forEach(function (b) { io.observe(b.fig); });
    } else {
      built.forEach(draw);
    }

    var replay = root.querySelector('[data-bp-replay]');
    if (replay) replay.addEventListener('click', function () {
      built.forEach(reset);
      built.forEach(function (b, i) { setTimeout(function () { draw(b); }, i * 900); });
    });
  }

  window.AssemblBlueprint = { mount: mount };
})();
