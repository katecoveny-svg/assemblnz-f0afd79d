/*! wait-phone.js — the rewarded wait, on a phone.
 *
 *  Ported from the homepage component (components/site/cinematic/WaitState.tsx)
 *  into dependency-free vanilla JS so the concept demos can run the same thing
 *  the public site runs. Six demos, one behaviour.
 *
 *  A spinner is the one moment a business has someone's whole attention and
 *  spends it on nothing. This is what goes there instead:
 *
 *    1. a ring with the credit counting up in the middle — the payoff is the
 *       biggest thing on the screen, because it is the point;
 *    2. the specialists working in the open, one at a time, named;
 *    3. ONE optional question that genuinely BLOCKS until it is answered or
 *       declined — a question, not a tick — and then says what it learned.
 *
 *  (3) is the part the old static wait sections never had. The question is the
 *  business case: the wait stops being a cost and starts returning data.
 *
 *  Deliberately almost wordless. The screen shows, it does not explain.
 *
 *  ── USING IT ────────────────────────────────────────────────────────────────
 *    <script src="wait-phone.js"></script>
 *    WaitPhone.mount(document.getElementById('mount'), {
 *      chrome: 'phone',            // 'phone' = draw the device; 'none' = mount
 *                                  //   bare inside a phone the demo already has
 *      scenarios: [ { id, label, app, unit, steps } ],
 *      note: 'Illustrative concept screen · not an X product',
 *      finish: { label: 'review the draft →', onDone: fn },
 *      lockup: true,               // the locked assembl phrase under the device
 *      onBlock: fn(isBlocking)     // told when the question is holding the line,
 *                                  //   so a host carousel can stop advancing
 *    });
 *
 *  A step is { agent, doing, credit?, ask? } and an ask is
 *  { q, options: [a, b], learn: [a, b] } — learn[i] is what answering with
 *  options[i] taught the business, said back in their words.
 *
 *  unit is [prefix, suffix, decimals?] — ['$', ''] money, ['', ' pts'] points,
 *  ['$', '', 0] whole dollars. Decimals default to 2 for '$' and 0 otherwise.
 *
 *  ── THEMING ─────────────────────────────────────────────────────────────────
 *  Every colour and face is a custom property, set on the mount element (or any
 *  ancestor) so each demo drives it from its own brand tokens:
 *
 *    --wp-paper   screen surface        --wp-accent  the ring, live dots, labels
 *    --wp-ink     primary text         --wp-done     completed dots + arc
 *    --wp-ink-2   secondary text       --wp-rim      device edge / glow
 *    --wp-line    hairlines            --wp-shell    device body
 *    --wp-sans / --wp-mono / --wp-app  faces (app = the UI face inside the phone)
 *
 *  Nothing here reads a token it does not declare a fallback for, so a demo that
 *  sets none of them still renders correctly in assembl's own champagne.
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'wp-style';
  var R = 52;
  var CIRC = 2 * Math.PI * R;
  var BEAT = 1150;

  var CSS = [
    /* ── tokens + shell ─────────────────────────────────────────────────── */
    '.wp{',
    '  --wp-paper:#FDFBF7; --wp-ink:#1A1917; --wp-ink-2:#4A4842;',
    '  --wp-accent:#BFA37A; --wp-done:#0C1836; --wp-line:rgba(26,25,23,.09);',
    '  --wp-shell:linear-gradient(160deg,#2b2f33 0%,#14171a 42%,#2b2f33 100%);',
    '  --wp-rim:rgba(191,163,122,.55);',
    "  --wp-sans:'Lato',-apple-system,system-ui,sans-serif;",
    "  --wp-mono:'Space Mono',ui-monospace,monospace;",
    '  --wp-app:var(--wp-sans);',
    '  --wp-ease:cubic-bezier(.22,1,.36,1);',
    '  font-family:var(--wp-sans); color:var(--wp-ink);',
    '  display:flex; flex-direction:column; align-items:center; gap:18px;',
    '}',
    '.wp *{box-sizing:border-box}',

    /* ── the device (chrome:'phone') ────────────────────────────────────── */
    '.wp-phone{',
    '  position:relative; width:300px; height:600px; flex-shrink:0;',
    '  border-radius:46px; padding:11px; background:var(--wp-shell);',
    '  box-shadow:0 2px 0 rgba(255,255,255,.16) inset, 0 0 0 1.5px var(--wp-rim),',
    '    0 34px 70px rgba(20,23,26,.34), 0 8px 20px rgba(20,23,26,.2);',
    '  animation:wp-float 7s ease-in-out infinite;',
    '  transition:transform .5s var(--wp-ease);',
    '}',
    '@keyframes wp-float{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-9px) rotate(.35deg)}}',
    '@media (hover:hover){.wp:hover .wp-phone{animation-play-state:paused;',
    '  transform:translateY(-6px) perspective(1100px) rotateY(-3deg) rotateX(1.5deg)}}',
    /* standing on its own light */
    '.wp-phone::after{content:""; position:absolute; left:8%; right:8%; bottom:-30px; height:30px;',
    '  border-radius:50%; z-index:-1; filter:blur(6px);',
    '  background:radial-gradient(ellipse at 50% 0%,var(--wp-rim),transparent 72%)}',
    '.wp-glare{position:absolute; inset:0; border-radius:46px; pointer-events:none; z-index:3;',
    '  background:linear-gradient(118deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 34%,',
    '    rgba(255,255,255,0) 66%,rgba(255,255,255,.07) 100%)}',
    '.wp-phone>.wp-screen{border-radius:36px}',
    '.wp-phone>.wp-screen::before{content:""; position:absolute; top:9px; left:50%;',
    '  transform:translateX(-50%); width:74px; height:20px; border-radius:12px; background:#14171a; z-index:2}',
    '.wp-phone>.wp-screen>.wp-status{padding-top:2px}',

    /* ── the screen (also the whole component when chrome:'none') ───────── */
    '.wp-screen{position:relative; width:100%; height:100%; min-height:0; overflow:hidden;',
    '  background:var(--wp-paper); display:flex; flex-direction:column; align-items:center;',
    '  padding:14px 18px 18px; text-align:left}',
    '.wp-bare>.wp-screen{border-radius:inherit}',

    '.wp-status{width:100%; display:flex; justify-content:space-between; align-items:center;',
    '  font-family:var(--wp-mono); font-size:.5rem; letter-spacing:.08em;',
    '  color:var(--wp-ink-2); margin-bottom:18px}',

    '.wp-app{font-family:var(--wp-app); font-weight:700; font-size:1.02rem; line-height:1.25;',
    '  color:var(--wp-ink); text-align:center; margin-bottom:14px}',

    /* ── the ring: the idea, so the biggest thing here ──────────────────── */
    '.wp-ring{position:relative; width:158px; height:158px; margin-bottom:16px; flex-shrink:0}',
    '.wp-ring svg{width:100%; height:100%; transform:rotate(-90deg); display:block}',
    '.wp-track{fill:none; stroke:var(--wp-line); stroke-width:5}',
    '.wp-arc{fill:none; stroke:var(--wp-accent); stroke-width:5; stroke-linecap:round;',
    '  transition:stroke-dashoffset .75s var(--wp-ease), stroke .5s var(--wp-ease)}',
    '.wp-ring.done .wp-arc{stroke:var(--wp-done)}',
    '.wp-ring.spin::after{content:""; position:absolute; inset:-7px; border-radius:50%;',
    '  border:1.5px solid transparent; border-top-color:var(--wp-accent);',
    '  animation:wp-orbit 1.5s linear infinite}',
    '@keyframes wp-orbit{to{transform:rotate(360deg)}}',
    '.wp-mid{position:absolute; inset:0; display:flex; flex-direction:column;',
    '  align-items:center; justify-content:center; gap:6px}',
    '.wp-credit{font-family:var(--wp-app); font-weight:700; font-size:1.95rem; line-height:1;',
    '  color:var(--wp-ink); font-variant-numeric:tabular-nums}',
    '.wp-credit-l{font-family:var(--wp-mono); font-size:.46rem; letter-spacing:.12em;',
    '  text-transform:uppercase; color:var(--wp-ink-2); text-align:center}',

    /* ── the specialists, in the open ───────────────────────────────────── */
    /* the steps are the one part that can grow, so they are the part that gives */
    '.wp-steps{list-style:none; margin:0; padding:0; width:100%; flex:0 1 auto;',
    '  min-height:0; overflow:hidden auto; scrollbar-width:none}',
    '.wp-steps::-webkit-scrollbar{display:none}',
    '.wp-step{display:grid; grid-template-columns:7px 54px 1fr auto; align-items:center;',
    '  gap:8px; padding:6px 0; border-bottom:1px solid var(--wp-line);',
    '  opacity:.32; transition:opacity .4s var(--wp-ease)}',
    '.wp-step.now,.wp-step.done{opacity:1}',
    '.wp-dot{width:7px; height:7px; border-radius:50%; background:var(--wp-line);',
    '  transition:background .4s var(--wp-ease), box-shadow .4s var(--wp-ease)}',
    '.wp-step.now .wp-dot{background:var(--wp-accent); animation:wp-pulse 1.1s ease-in-out infinite}',
    '.wp-step.done .wp-dot{background:var(--wp-done)}',
    '@keyframes wp-pulse{0%,100%{box-shadow:0 0 0 3px rgba(191,163,122,.28)}50%{box-shadow:0 0 0 9px rgba(191,163,122,0)}}',
    '.wp-who{font-family:var(--wp-mono); font-size:.44rem; letter-spacing:.09em;',
    '  text-transform:uppercase; color:var(--wp-accent); overflow:hidden; text-overflow:ellipsis}',
    '.wp-doing{font-size:.7rem; font-weight:400; color:var(--wp-ink); line-height:1.3}',
    '.wp-earn{font-family:var(--wp-mono); font-size:.52rem; color:var(--wp-ink-2); white-space:nowrap}',
    '.wp-step.done .wp-earn{color:var(--wp-done); font-weight:700}',

    /* ── what the question taught them ─────────────────────────────────── */
    '.wp-learned{width:100%; margin-top:10px; font-size:.68rem; font-weight:400;',
    '  color:var(--wp-ink-2); line-height:1.4}',
    '.wp-learned b{font-weight:700; color:var(--wp-done)}',
    '.wp-learned.muted{opacity:.7}',
    '.wp-learned:empty{display:none}',

    '.wp-foot{width:100%; margin-top:8px; font-family:var(--wp-mono); font-size:.42rem;',
    '  letter-spacing:.06em; color:var(--wp-ink-2); opacity:.7; line-height:1.5}',
    '.wp-foot:empty{display:none}',

    '.wp-go{margin-top:auto; cursor:pointer; width:100%; font-family:var(--wp-sans);',
    '  font-size:.76rem; padding:12px 18px; border-radius:50px; background:var(--wp-done);',
    '  color:var(--wp-paper); border:1px solid var(--wp-done);',
    '  transition:transform .26s var(--wp-ease), opacity .26s var(--wp-ease)}',
    '.wp-go:hover{transform:translateY(-1px)}',
    '.wp-go[hidden]{display:none}',
    '.wp-go.ghost{background:transparent; color:var(--wp-ink); border-color:var(--wp-line)}',
    '.wp-go-row{margin-top:auto; width:100%; display:flex; gap:7px}',
    '.wp-go-row .wp-go{margin-top:0}',

    /* ── the one question, where a phone would put it ───────────────────── */
    /* bottom corners are clipped by .wp-screen's own overflow:hidden, so the
       sheet only needs to round its top edge — and stays right in a bare mount */
    '.wp-sheet{position:absolute; left:0; right:0; bottom:0; z-index:4;',
    '  border-radius:26px 26px 0 0; background:var(--wp-paper);',
    '  border-top:1.5px solid var(--wp-accent); box-shadow:0 -14px 34px rgba(20,23,26,.18);',
    '  padding:18px 18px 20px; text-align:center; animation:wp-rise .4s var(--wp-ease)}',
    '@keyframes wp-rise{from{transform:translateY(100%)}}',
    '.wp-sheet[hidden]{display:none}',
    '.wp-sheet-k{font-family:var(--wp-mono); font-size:.42rem; letter-spacing:.14em;',
    '  text-transform:uppercase; color:var(--wp-accent); margin-bottom:8px}',
    '.wp-sheet-q{font-family:var(--wp-app); font-weight:700; font-size:.92rem;',
    '  color:var(--wp-ink); margin-bottom:12px; line-height:1.3}',
    '.wp-sheet-row{display:flex; gap:8px}',
    '.wp-sheet-btn{flex:1; cursor:pointer; font-family:var(--wp-sans); font-size:.76rem;',
    '  padding:11px 8px; border-radius:50px; background:var(--wp-done);',
    '  color:var(--wp-paper); border:1px solid var(--wp-done);',
    '  transition:transform .2s var(--wp-ease)}',
    '.wp-sheet-btn:hover{transform:translateY(-1px)}',
    '.wp-sheet-skip{margin-top:9px; cursor:pointer; background:none; border:0;',
    '  font-family:var(--wp-sans); font-size:.66rem; color:var(--wp-ink-2); text-decoration:underline}',

    /* ── choosing a wait + the locked lockup ────────────────────────────── */
    '.wp-pick{display:flex; gap:6px; flex-wrap:wrap; justify-content:center}',
    '.wp-pick:empty{display:none}',
    '.wp-tab{font-family:var(--wp-mono); font-size:.55rem; letter-spacing:.1em;',
    '  text-transform:uppercase; padding:7px 13px; border-radius:50px; cursor:pointer;',
    '  border:1px solid var(--wp-line); background:transparent; color:var(--wp-ink-2);',
    '  transition:all .28s var(--wp-ease)}',
    '.wp-tab:hover:not(.on){border-color:var(--wp-accent); color:var(--wp-ink)}',
    '.wp-tab.on{background:var(--wp-done); color:var(--wp-paper); border-color:var(--wp-done)}',
    '.wp-lockup{font-family:var(--wp-mono); font-size:.5rem; letter-spacing:.1em;',
    '  color:var(--wp-ink-2); opacity:.75; text-align:center; line-height:1.6}',

    '@media (max-width:400px){',
    '  .wp-phone{width:272px; height:558px}',
    '  .wp-ring{width:140px; height:140px}',
    '  .wp-credit{font-size:1.7rem}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '  .wp-phone,.wp-ring.spin::after,.wp-step.now .wp-dot,.wp-sheet{animation:none}',
    '}',
  ].join('\n');

  function ensureCss() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /** [prefix, suffix, decimals?] — decimals default to 2 for money, 0 otherwise. */
  function fmt(unit, n) {
    var pre = (unit && unit[0]) || '';
    var suf = (unit && unit[1]) || '';
    var dp = unit && unit.length > 2 && unit[2] != null ? unit[2] : pre === '$' ? 2 : 0;
    var body = dp > 0 ? n.toFixed(dp) : String(Math.round(n));
    if (dp === 0 && Math.abs(n) >= 1000) body = Math.round(n).toLocaleString('en-NZ');
    return pre + body + suf;
  }

  function reduced() {
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion:reduce)').matches;
  }

  /**
   * Mount the wait. Returns a controller: { start, reset, destroy, isBlocking, el }.
   */
  function mount(host, cfg) {
    if (!host) return null;
    ensureCss();
    cfg = cfg || {};

    var scenarios = cfg.scenarios || [];
    if (!scenarios.length) return null;
    var beat = cfg.beat || BEAT;
    var bare = cfg.chrome === 'none';
    var onBlock = typeof cfg.onBlock === 'function' ? cfg.onBlock : null;

    /* ── state ─────────────────────────────────────────────────────────── */
    var sid = scenarios[0].id;
    var at = -1;          // -1 = not started, steps.length = finished
    var done = [];
    var credit = 0;
    var answer = null;    // 0 | 1
    var skipped = false;
    var finished = false;
    var timer = null;
    var blocking = false;

    function sc() {
      for (var i = 0; i < scenarios.length; i++) if (scenarios[i].id === sid) return scenarios[i];
      return scenarios[0];
    }

    /* ── markup ────────────────────────────────────────────────────────── */
    var root = document.createElement('div');
    root.className = 'wp' + (bare ? ' wp-bare' : '');
    if (cfg.className) root.className += ' ' + cfg.className;

    var screenHtml =
      '<div class="wp-screen">' +
        '<div class="wp-status" aria-hidden="true"><span class="wp-clock">9:41</span>' +
          '<span class="wp-sig">▮▮▮</span></div>' +
        '<div class="wp-app"></div>' +
        '<div class="wp-ring">' +
          '<svg viewBox="0 0 120 120" aria-hidden="true">' +
            '<circle class="wp-track" cx="60" cy="60" r="' + R + '"></circle>' +
            '<circle class="wp-arc" cx="60" cy="60" r="' + R + '" stroke-dasharray="' + CIRC + '"' +
              ' stroke-dashoffset="' + CIRC + '"></circle>' +
          '</svg>' +
          '<div class="wp-mid"><div class="wp-credit"></div><div class="wp-credit-l"></div></div>' +
        '</div>' +
        '<ol class="wp-steps"></ol>' +
        '<div class="wp-learned" aria-live="polite"></div>' +
        '<div class="wp-foot">' + esc(cfg.note || '') + '</div>' +
        '<div class="wp-go-row"></div>' +
        '<div class="wp-sheet" role="group" aria-live="polite" hidden>' +
          '<div class="wp-sheet-k">one optional question</div>' +
          '<div class="wp-sheet-q"></div>' +
          '<div class="wp-sheet-row"></div>' +
          '<button type="button" class="wp-sheet-skip">rather not</button>' +
        '</div>' +
      '</div>';

    root.innerHTML =
      (bare
        ? screenHtml
        : '<div class="wp-phone"><div class="wp-glare" aria-hidden="true"></div>' + screenHtml + '</div>') +
      '<div class="wp-pick" role="group" aria-label="Choose a wait"></div>' +
      (cfg.lockup === false
        ? ''
        : '<div class="wp-lockup">assembl — intuitive agentic customer journeys</div>');

    var q = function (s) { return root.querySelector(s); };
    var elApp = q('.wp-app'), elRing = q('.wp-ring'), elArc = q('.wp-arc');
    var elCredit = q('.wp-credit'), elCreditL = q('.wp-credit-l');
    var elSteps = q('.wp-steps'), elLearned = q('.wp-learned');
    var elGoRow = q('.wp-go-row'), elSheet = q('.wp-sheet');
    var elSheetQ = q('.wp-sheet-q'), elSheetRow = q('.wp-sheet-row'), elSkip = q('.wp-sheet-skip');
    var elPick = q('.wp-pick'), elClock = q('.wp-clock');

    if (cfg.clock) elClock.textContent = cfg.clock;
    if (cfg.signal) q('.wp-sig').textContent = cfg.signal;

    /* scenario tabs — only when there is a genuine choice to make */
    if (scenarios.length > 1) {
      scenarios.forEach(function (s) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'wp-tab';
        b.textContent = s.label || s.id;
        b.onclick = function () { reset(s.id); };
        b.dataset.sid = s.id;
        elPick.appendChild(b);
      });
    }

    /* ── rendering ─────────────────────────────────────────────────────── */
    function buildSteps() {
      var s = sc();
      elSteps.innerHTML = s.steps.map(function (st) {
        return '<li class="wp-step">' +
          '<span class="wp-dot" aria-hidden="true"></span>' +
          '<span class="wp-who">' + esc(st.agent) + '</span>' +
          '<span class="wp-doing">' + esc(st.doing) + '</span>' +
          '<span class="wp-earn">' + (st.credit ? '+' + esc(fmt(s.unit, st.credit)) : '') + '</span>' +
        '</li>';
      }).join('');
    }

    function askStep() {
      var st = sc().steps;
      for (var i = 0; i < st.length; i++) if (st[i].ask) return st[i];
      return null;
    }

    function setBlocking(v) {
      if (v === blocking) return;
      blocking = v;
      if (onBlock) onBlock(v);
    }

    function render() {
      var s = sc();
      var pending = at >= 0 && at < s.steps.length && !finished ? s.steps[at] : null;
      var asking = Boolean(pending && pending.ask) && answer === null && !skipped;
      var running = at >= 0 && !finished;

      elApp.textContent = s.app || '';
      elRing.className = 'wp-ring' + (running && !asking ? ' spin' : '') + (finished ? ' done' : '');

      var pct = s.steps.length ? done.length / s.steps.length : 0;
      elArc.setAttribute('stroke-dashoffset', String(CIRC * (1 - pct)));

      elCredit.textContent = fmt(s.unit, credit);
      elCreditL.textContent = finished ? (s.yours || 'yours') : (s.earning || 'earned so far');

      var lis = elSteps.children;
      for (var i = 0; i < lis.length; i++) {
        var isDone = done.indexOf(i) > -1;
        var isNow = i === at && !finished;
        lis[i].className = 'wp-step' + (isDone ? ' done' : '') + (isNow ? ' now' : '');
      }

      var a = askStep();
      if (a && answer !== null) {
        elLearned.className = 'wp-learned';
        elLearned.innerHTML = (s.told || 'they told you:') + ' <b>' + esc(a.ask.learn[answer]) + '</b>';
      } else if (skipped) {
        elLearned.className = 'wp-learned muted';
        elLearned.textContent = s.declined || 'they said no. fine.';
      } else {
        elLearned.textContent = '';
      }

      /* buttons */
      elGoRow.innerHTML = '';
      if (at < 0) {
        elGoRow.appendChild(button(cfg.startLabel || 'tap to wait', '', function () { at = 0; render(); tick(); }));
      } else if (finished) {
        if (cfg.finish && cfg.finish.label) {
          elGoRow.appendChild(button(cfg.finish.label, '', function () {
            if (cfg.finish.onDone) cfg.finish.onDone(ctl);
          }));
        }
        elGoRow.appendChild(button('again ↺', 'ghost', function () { reset(); }));
      }

      /* the sheet */
      if (asking) {
        elSheet.hidden = false;
        elSheetQ.textContent = pending.ask.q;
        elSheetRow.innerHTML = '';
        pending.ask.options.forEach(function (o, i) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'wp-sheet-btn';
          b.textContent = o;
          b.onclick = function () { answer = i; render(); tick(); };
          elSheetRow.appendChild(b);
        });
        elSkip.textContent = cfg.skipLabel || 'rather not';
        setBlocking(true);
      } else {
        elSheet.hidden = true;
        setBlocking(false);
      }
    }

    function button(label, mod, fn) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'wp-go' + (mod ? ' ' + mod : '');
      b.textContent = label;
      b.onclick = fn;
      return b;
    }

    /* ── the clock ─────────────────────────────────────────────────────── */
    function clear() { if (timer) clearTimeout(timer); timer = null; }

    /** Advance one beat, unless the question is holding the line. */
    function tick() {
      clear();
      var s = sc();
      if (at < 0 || finished) return;
      var pending = s.steps[at];
      if (pending && pending.ask && answer === null && !skipped) return; // blocked, on purpose
      timer = setTimeout(function () {
        if (done.indexOf(at) < 0) done.push(at);
        if (s.steps[at] && s.steps[at].credit) credit += s.steps[at].credit;
        if (at + 1 >= s.steps.length) { finished = true; at = s.steps.length; }
        else at += 1;
        render();
        tick();
      }, reduced() ? 60 : beat);
    }

    function reset(next) {
      clear();
      at = -1; done = []; credit = 0;
      answer = null; skipped = false; finished = false;
      if (next) sid = next;
      Array.prototype.forEach.call(elPick.children, function (b) {
        b.className = 'wp-tab' + (b.dataset.sid === sid ? ' on' : '');
      });
      buildSteps();
      setBlocking(false);
      render();
    }

    elSkip.onclick = function () { skipped = true; render(); tick(); };

    var ctl = {
      el: root,
      start: function () { if (at < 0) { at = 0; render(); tick(); } return ctl; },
      reset: reset,
      isBlocking: function () { return blocking; },
      isRunning: function () { return at >= 0 && !finished; },
      scenario: function (id) { reset(id); return ctl; },
      destroy: function () { clear(); if (root.parentNode) root.parentNode.removeChild(root); },
    };

    host.appendChild(root);
    reset();
    if (cfg.autostart) ctl.start();
    return ctl;
  }

  global.WaitPhone = { mount: mount, BEAT: BEAT };
})(typeof window !== 'undefined' ? window : this);
