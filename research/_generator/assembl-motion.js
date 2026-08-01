/*! assembl-motion.js — the motion layer, dependency-free.
 *
 *  Companion to assembl-motion.css. Reads data attributes, needs no init call,
 *  and degrades to finished-state on prefers-reduced-motion.
 *
 *  Design constitution §11: motion communicates work, never entertainment.
 *  Every primitive here answers "this is becoming more complete". Nothing
 *  spins, bounces, or asks for attention.
 *
 *    data-m="rise|lines|type|wipe|count|magnet|depth"
 *    data-m-delay="120"          stagger in ms
 *    data-m-to="68"              count target      (count)
 *    data-m-suffix="%"           count suffix      (count)
 *    data-m-dur="1400"           count duration    (count)
 *    data-m-cursor="read it"     cursor label on hover
 *
 *  Scrubbed stages:
 *    <section class="mStage" data-m-scrub>       height sets the scroll budget
 *      <div class="mStage__pin"> … </div>        pins for the duration
 *    fires window CustomEvent('m:scrub', {detail:{el, p}}) with p = 0..1
 */
(function () {
  'use strict';

  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var FINE = window.matchMedia &&
    window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ── 1. entry: assemble when it earns the viewport ───────────────────── */
  function observe() {
    var els = [].slice.call(document.querySelectorAll('[data-m],.mGrid'));
    if (!els.length) return;
    if (REDUCED) { els.forEach(function (el) { el.classList.add('m-in'); }); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, d = parseInt(el.getAttribute('data-m-delay') || '0', 10);
        setTimeout(function () {
          el.classList.add('m-in');
          if (el.getAttribute('data-m') === 'count') count(el);
        }, d);
        io.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ── 2. type: wrap each word in its own mask so the line builds ──────── */
  function prepareType() {
    [].forEach.call(document.querySelectorAll('[data-m="type"]'), function (el) {
      if (el.__done) return; el.__done = 1;
      var step = parseFloat(el.getAttribute('data-m-step') || '0.045');
      var n = 0;
      // walk text nodes only, so <em>/<br> survive intact
      (function walk(node) {
        [].slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            String(c.nodeValue).split(/(\s+)/).forEach(function (t) {
              if (!t) return;
              if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
              var s = document.createElement('span'); s.className = 'm-w';
              var i = document.createElement('i'); i.textContent = t;
              i.style.transitionDelay = (n++ * step).toFixed(3) + 's';
              s.appendChild(i); frag.appendChild(s);
            });
            node.replaceChild(frag, c);
          } else if (c.nodeType === 1 && c.tagName !== 'BR') { walk(c); }
        });
      })(el);
    });
  }

  /* ── 3. lines: stagger children that are already marked ──────────────── */
  function prepareLines() {
    [].forEach.call(document.querySelectorAll('[data-m="lines"]'), function (el) {
      [].forEach.call(el.querySelectorAll('.m-line > *'), function (c, i) {
        c.style.transitionDelay = (i * 0.09).toFixed(2) + 's';
      });
    });
  }

  /* ── 4. count: a number materialising, eased so it settles ───────────── */
  function count(el) {
    var to = parseFloat(el.getAttribute('data-m-to') || el.textContent || '0');
    var dur = parseInt(el.getAttribute('data-m-dur') || '1500', 10);
    var suffix = el.getAttribute('data-m-suffix') || '';
    var dec = (el.getAttribute('data-m-to') || '').indexOf('.') > -1 ? 1 : 0;
    if (REDUCED) { el.textContent = to.toFixed(dec) + suffix; return; }
    var t0 = null;
    requestAnimationFrame(function loop(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);            // settles, never overshoots
      el.textContent = (to * e).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(loop);
    });
  }

  /* ── 5. magnet: a control leans toward the pointer. 6px, felt not seen ─ */
  function magnets() {
    if (REDUCED || !FINE) return;
    [].forEach.call(document.querySelectorAll('[data-m="magnet"]'), function (el) {
      var R = 90, MAX = 6;
      function move(e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var d = Math.hypot(dx, dy);
        if (d > R + Math.max(r.width, r.height) / 2) { el.style.transform = ''; return; }
        el.style.transform = 'translate3d(' + (dx / R * MAX).toFixed(2) + 'px,' +
          (dy / R * MAX).toFixed(2) + 'px,0)';
      }
      window.addEventListener('pointermove', move, { passive: true });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ── 6. depth: a photograph holds depth against the pointer ──────────── */
  function depth() {
    if (REDUCED || !FINE) return;
    [].forEach.call(document.querySelectorAll('[data-m="depth"]'), function (el) {
      var img = el.querySelector('img') || el;
      img.style.transition = 'transform .9s cubic-bezier(.16,.84,.28,1)';
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5;
        var y = (e.clientY - r.top) / r.height - .5;
        img.style.transform = 'scale(1.045) translate3d(' + (-x * 14).toFixed(1) + 'px,' +
          (-y * 10).toFixed(1) + 'px,0)';
      }, { passive: true });
      el.addEventListener('pointerleave', function () { img.style.transform = ''; });
    });
  }

  /* ── 7. scrub: a stage that advances with scroll ─────────────────────── */
  function scrub() {
    var stages = [].slice.call(document.querySelectorAll('[data-m-scrub]'));
    if (!stages.length) return;
    var ticking = false;
    function frame() {
      ticking = false;
      stages.forEach(function (st) {
        var r = st.getBoundingClientRect();
        var total = r.height - window.innerHeight;
        if (total <= 0) return;
        var p = Math.min(1, Math.max(0, -r.top / total));
        var fill = st.querySelector('.mStage__fill');
        if (fill) fill.style.width = (p * 100).toFixed(2) + '%';
        var steps = st.querySelectorAll('.mStage__step');
        if (steps.length) {
          var idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
          [].forEach.call(steps, function (s, i) { s.classList.toggle('on', i === idx); });
        }
        window.dispatchEvent(new CustomEvent('m:scrub', { detail: { el: st, p: p } }));
      });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }, { passive: true });
    window.addEventListener('resize', frame, { passive: true });
    frame();
  }

  /* ── 8. the cursor — a ring that widens on anything that answers ─────── */
  function cursor() {
    if (REDUCED || !FINE) return;
    if (!document.body.hasAttribute('data-m-cursor-on')) return;
    var c = document.createElement('div'); c.className = 'mCursor';
    var l = document.createElement('div'); l.className = 'mCursor__l';
    c.appendChild(l); document.body.appendChild(c);
    document.body.classList.add('m-cursor');
    var x = -100, y = -100, cx = -100, cy = -100;
    window.addEventListener('pointermove', function (e) { x = e.clientX; y = e.clientY; }, { passive: true });
    (function loop() {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      c.style.transform = 'translate3d(' + (cx - 17) + 'px,' + (cy - 17) + 'px,0)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest('a,button,[data-m-cursor]');
      if (!t) { c.classList.remove('on'); l.textContent = ''; return; }
      c.classList.add('on');
      l.textContent = t.getAttribute('data-m-cursor') || '';
    });
  }

  /* ── 9. tilt: a card that holds its own space against the pointer ────────
     Kate's brief, 1 Aug 2026 — CSS 3D perspective. Max 7deg: a card standing
     in a room, never a novelty flip. */
  function tilt() {
    if (REDUCED || !FINE) return;
    [].forEach.call(document.querySelectorAll('[data-m3d="card"]'), function (el) {
      var card = el.querySelector('.m3d__card') || el.firstElementChild;
      if (!card) return;
      var MAX = parseFloat(el.getAttribute('data-m3d-max') || '7');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5;
        var y = (e.clientY - r.top) / r.height - .5;
        card.style.transition = 'transform .18s linear';
        card.style.transform = 'rotateY(' + (x * MAX * 2).toFixed(2) + 'deg) rotateX(' +
          (-y * MAX * 1.5).toFixed(2) + 'deg) translateZ(14px)';
      }, { passive: true });
      el.addEventListener('pointerleave', function () {
        card.style.transition = 'transform .9s cubic-bezier(.16,.84,.28,1)';
        card.style.transform = '';
      });
    });
  }

  /* ── boot ────────────────────────────────────────────────────────────── */
  function init() {
    prepareType(); prepareLines(); observe(); magnets(); depth(); scrub(); cursor(); tilt();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  window.AssemblMotion = { init: init, reduced: REDUCED };
})();
