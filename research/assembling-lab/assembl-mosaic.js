/*! assembl-mosaic.js — the assembling mosaic.
 *
 *  A field of tiles that lands piece by piece until a pattern exists that was
 *  not there before. It is the assembly metaphor at its plainest, and it is
 *  the one ornament an assembl page is allowed — because it is generative
 *  (seeded per client, never the same twice) and because it stops.
 *
 *  IT STOPS. That is the rule. A pattern that keeps churning is decoration and
 *  breaks constitution §11. This one assembles, settles, and holds; a single
 *  tile turns over now and again like a departure board, and nothing else
 *  moves.
 *
 *  USAGE
 *    AssemblMosaic.mount(el, {
 *      colour:'#056268',        // the brand accent
 *      ink:'#14161A',           // the dark
 *      brass:'#BFA37A',         // assembl's metal, used sparingly
 *      seed:'nectar',           // same seed, same pattern, every load
 *      density:22,              // columns
 *      mode:'scroll'|'enter'    // assemble on scroll progress, or once on entry
 *    });
 *
 *  Canvas, no dependencies, retina-aware, stops when off-screen.
 */
(function () {
  'use strict';

  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* deterministic per client — the pattern is theirs and it does not wander */
  function rng(seed) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < String(seed).length; i++) {
      h ^= String(seed).charCodeAt(i); h = Math.imul(h, 16777619);
    }
    return function () {
      h += 0x6D2B79F5; var t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* the six shapes a tile can be. Every one is a quarter, a half or a whole —
     so the field always reads as one system rather than a pile of icons. */
  function drawTile(c, x, y, s, kind, col, rot) {
    c.save(); c.translate(x + s / 2, y + s / 2); c.rotate(rot * Math.PI / 2);
    c.translate(-s / 2, -s / 2); c.fillStyle = col;
    switch (kind) {
      case 0: c.fillRect(0, 0, s, s); break;                       // whole
      case 1: c.beginPath(); c.arc(0, 0, s, 0, Math.PI / 2); c.lineTo(0, 0); c.fill(); break;
      case 2: c.beginPath(); c.moveTo(0, s); c.lineTo(s, s); c.lineTo(0, 0); c.fill(); break;
      case 3: c.fillRect(0, 0, s, s / 2); break;                   // half
      case 4: c.beginPath(); c.arc(s / 2, s / 2, s / 2.6, 0, Math.PI * 2); c.fill(); break;
      case 5: c.fillRect(s * .18, s * .18, s * .64, s * .64); break;
    }
    c.restore();
  }

  function mount(host, opt) {
    if (!host) return null;
    opt = opt || {};
    var COL = opt.colour || '#2F4F44';
    var INK = opt.ink || '#14161A';
    var BRASS = opt.brass || '#BFA37A';
    var COLS = opt.density || 20;
    var MODE = opt.mode || 'enter';
    var rand = rng(opt.seed || 'assembl');

    var cv = document.createElement('canvas');
    cv.className = 'mCanvas'; cv.style.position = 'absolute'; cv.style.inset = '0';
    host.appendChild(cv);
    var c = cv.getContext('2d');

    var tiles = [], W = 0, H = 0, S = 0, dpr = 1;

    function build() {
      var r = host.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = W / COLS;
      var rows = Math.ceil(H / S);
      tiles = [];
      var r2 = rng(opt.seed || 'assembl');           // rebuild identically on resize
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < COLS; x++) {
          var v = r2();
          if (v < .34) continue;                     // negative space is most of it
          var metal = r2();
          tiles.push({
            x: x * S, y: y * S,
            kind: Math.floor(r2() * 6),
            rot: Math.floor(r2() * 4),
            col: metal > .93 ? BRASS : (metal > .72 ? INK : COL),
            /* the diagonal wave: tiles land from the top-left outward, so the
               field reads as assembling rather than switching on */
            at: ((x / COLS) * .55 + (y / rows) * .45) * .8 + r2() * .2
          });
        }
      }
    }

    var p = REDUCED ? 1 : 0, target = REDUCED ? 1 : 0, flipT = 0, flip = null;

    function paint() {
      c.clearRect(0, 0, W, H);
      for (var i = 0; i < tiles.length; i++) {
        var t = tiles[i];
        var lp = Math.min(1, Math.max(0, (p - t.at) / .22));
        if (lp <= 0) continue;
        var e = 1 - Math.pow(1 - lp, 3);
        var s = S * (.35 + e * .65);
        var off = (S - s) / 2;
        c.globalAlpha = Math.min(1, e * 1.15);
        var isFlip = flip === i;
        drawTile(c, t.x + off, t.y + off, s, isFlip ? (t.kind + 1) % 6 : t.kind,
          t.col, isFlip ? t.rot + 1 : t.rot);
      }
      c.globalAlpha = 1;
    }

    var running = true;
    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      p += (target - p) * .05;
      /* once settled, one tile turns over every few seconds. Nothing else. */
      if (!REDUCED && p > .98 && tiles.length) {
        flipT++;
        if (flipT > 190) { flipT = 0; flip = Math.floor(Math.random() * tiles.length); }
        if (flipT === 34) flip = null;
      }
      paint();
    }

    build();
    if (MODE === 'scroll') {
      var stage = opt.stage ? document.querySelector(opt.stage) : host.closest('[data-m-scrub]');
      window.addEventListener('m:scrub', function (ev) {
        if (!stage || ev.detail.el !== stage) return;
        target = ev.detail.p;
      });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { target = 1; io.disconnect(); } });
      }, { threshold: .2 });
      io.observe(host);
    }

    var vis = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !running) { running = true; loop(); }
        else if (!e.isIntersecting) running = false;
      });
    }, { threshold: 0 });
    vis.observe(host);

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(function () { build(); paint(); }, 160);
    }, { passive: true });

    loop();
    return {
      set: function (v) { target = Math.min(1, Math.max(0, v)); },
      destroy: function () { running = false; vis.disconnect(); cv.remove(); }
    };
  }

  window.AssemblMosaic = { mount: mount };
})();
