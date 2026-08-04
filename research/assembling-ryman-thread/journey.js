/* Ryman · the unbroken thread — page logic.
 * All copy renders from data.js. The scene reads journey state, never the
 * reverse. The hold beat is staged here: 850ms of genuine stillness before
 * the gate becomes actionable, and the release is attributed to the role.
 */

import { DATA } from './data.js';
import { createThreadScene } from './thread.js';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ── render all copy from data ──────────────────────────────── */
function text(sel, value) { const el = $(sel); if (el) el.textContent = value; }

function render() {
  const d = DATA;
  document.title = `${d.hero.headline} · a concept for ${d.client.name}`;
  text('[data-disclosure]', d.disclosure);
  text('[data-headline]', d.hero.headline);
  text('[data-heroline]', d.hero.line);
  text('[data-cue]', d.hero.cue);
  $('[data-define]').innerHTML =
    `<b>assembl</b> ${d.define.a.replace('assembl ', '')} <b>assembling</b> ${d.define.b.replace('assembling ', '')}`;

  text('[data-trigger-h]', d.trigger.heading);
  text('[data-trigger-b]', d.trigger.body);
  text('[data-persona]', d.trigger.persona);
  text('[data-modes-h]', d.trigger.modes.heading);
  text('[data-mode-copy]', d.trigger.modes.existing);

  text('[data-v-status]', d.phone.status);
  text('[data-v-status-note]', d.phone.statusNote);
  text('[data-v-scope]', d.phone.scope);
  text('[data-v-conn]', d.phone.connection);
  const choices = $('[data-v-choices]');
  d.phone.choices.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = c;
    b.addEventListener('click', () => {
      $$('.v-choices button').forEach(x => x.classList.remove('is-picked'));
      b.classList.add('is-picked');
      $('[data-v-answer]').textContent = d.phone.answers[i];
      announce(`${c} — ${d.phone.answers[i]}`);
    });
    choices.appendChild(b);
  });
  text('[data-choice-note]', d.phone.choiceNote);

  /* rooms */
  const roomsEl = $('[data-rooms]');
  d.rooms.forEach((r, i) => {
    const el = document.createElement('article');
    el.className = 'room';
    el.dataset.room = r.id;
    el.innerHTML = `
      <span class="room-n" aria-hidden="true">${'i ii iii iv v'.split(' ')[i]}</span>
      <h3>${r.title}</h3>
      <dl>
        <dt>what is really running</dt><dd>${r.underneath}</dd>
        <dt>what the family can do</dt><dd>${r.customer}</dd>
        <dt>what the specialist may touch</dt><dd>${r.specialist}</dd>
        <dt>what stays a human decision</dt><dd>${r.human}</dd>
        <dt>what is being assembled</dt><dd>${r.object}</dd>
        <dt>the proof when this closes</dt><dd>${r.proof}</dd>
      </dl>`;
    if (r.id === 'assessment') {
      el.insertAdjacentHTML('beforeend',
        `<div class="handoff" data-handoff-1>
           <span>the routines agent</span><span class="line"></span><span>the interRAI assessor</span>
         </div>`);
    }
    if (r.id === 'divergence') {
      el.classList.add('room--hold');
      el.insertAdjacentHTML('beforeend',
        `<div class="handoff" data-handoff-2>
           <span>the means agent</span><span class="line"></span><span>the care manager</span>
         </div>
         <div class="gate" data-gate>
           <p class="who">${DATA.gate.role} <span class="chip">${DATA.gate.roleNote}</span></p>
           <p class="rule"><strong>Deciding:</strong> ${DATA.gate.deciding}.<br>${DATA.gate.rule}</p>
           <button type="button" data-gate-btn disabled>${DATA.gate.release}</button>
           <span class="signed">reviewed and signed · Rose · the page moves again</span>
         </div>`);
    }
    roomsEl.appendChild(el);
  });

  /* value */
  const valueEl = $('[data-value]');
  text('[data-value-h]', d.value.heading);
  d.value.items.forEach(v => {
    const el = document.createElement('div');
    el.className = 'value-item';
    el.innerHTML = `<h3>${v.what}</h3><p>${v.detail}</p>`;
    valueEl.appendChild(el);
  });
  $('[data-threshold]').innerHTML =
    `${d.value.thresholdSource.claim} <sup class="ref"><a href="${d.value.thresholdSource.url}">2</a></sup>`;

  /* receipt */
  text('[data-receipt-h]', d.receipt.heading);
  text('[data-receipt-i]', d.receipt.intro);
  const rt = $('[data-receipt-rows]');
  d.receipt.rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th scope="row">${r.label}</th><td>${r.body}</td>`;
    rt.appendChild(tr);
  });

  /* pilot */
  text('[data-pilot-h]', d.pilot.heading);
  text('[data-pilot-b]', d.pilot.body);
  text('[data-pilot-label]', d.pilot.label);
  const pm = $('[data-measures]');
  d.pilot.measures.forEach(m => {
    const el = document.createElement('div');
    el.className = 'measure';
    el.innerHTML = `<span class="metric">${m.metric}</span><span class="muted">${m.note}</span>`;
    pm.appendChild(el);
  });

  /* boundary */
  text('[data-boundary-h]', d.boundary.heading);
  const pub = $('[data-published]'); const prop = $('[data-proposed]');
  d.boundary.published.forEach((t, i) => {
    const li = document.createElement('li');
    li.innerHTML = i === 0 ? `${t} <sup class="ref"><a href="#refs">1</a></sup>` : t;
    pub.appendChild(li);
  });
  d.boundary.proposed.forEach(t => {
    const li = document.createElement('li'); li.textContent = t; prop.appendChild(li);
  });

  /* footer */
  const fd = $('[data-disclaimers]');
  d.footer.disclaimers.forEach(t => {
    const li = document.createElement('li'); li.textContent = t; fd.appendChild(li);
  });
  const fr = $('[data-refs]');
  d.footer.references.forEach(r => {
    const li = document.createElement('li');
    li.innerHTML = `${r.n}. <a href="${r.url}" rel="noopener">${r.text}</a>`;
    fr.appendChild(li);
  });
  text('[data-mark]', d.footer.mark);
  text('[data-wait-moment]', d.wait.moment);
  text('[data-wait-clock]', d.wait.clock.value);
  text('[data-wait-why]', d.wait.whyItExists);
  text('[data-wait-today]', d.wait.todayItFeelsLike);
}

/* ── live region ────────────────────────────────────────────── */
function announce(msg) { const lr = $('#live'); if (lr) lr.textContent = msg; }

/* ── the scene ──────────────────────────────────────────────── */
let scene = null;
function initScene() {
  scene = createThreadScene($('#scene'));
  if (!scene) document.body.classList.add('no-webgl');
  return Promise.resolve();
}

function bindScroll() {
  if (!scene) return;
  const onScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    scene.setProgress(p);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const rooms = $('[data-rooms]');
  rooms.addEventListener('scroll', () => {
    const p = rooms.scrollLeft / Math.max(1, rooms.scrollWidth - rooms.clientWidth);
    scene.setJourney(p);
    updateProgress();
  }, { passive: true });
}

/* ── the journey room ───────────────────────────────────────── */
let roomIndex = 0;
let holdDone = false;

function updateProgress() {
  const rooms = $('[data-rooms]');
  const kids = $$('.room');
  const mid = rooms.scrollLeft + rooms.clientWidth / 2;
  let best = 0, bestD = Infinity;
  kids.forEach((k, i) => {
    const c = k.offsetLeft + k.offsetWidth / 2;
    const dd = Math.abs(c - mid);
    if (dd < bestD) { bestD = dd; best = i; }
  });
  if (best !== roomIndex) {
    roomIndex = best;
    text('[data-journey-progress]', `room ${roomIndex + 1} of ${kids.length}`);
    announce(`${DATA.rooms[roomIndex].title} — room ${roomIndex + 1} of ${kids.length}`);
    if (roomIndex === 3 && !holdDone) beginHold();
    if (roomIndex === 2) liveHandoff('[data-handoff-1]');
  }
  $('[data-prev]').disabled = roomIndex === 0;
  $('[data-next]').disabled = roomIndex === kids.length - 1
    || (roomIndex === 3 && !holdDone);
}

function liveHandoff(sel) {
  const el = $(sel);
  if (el && !el.classList.contains('is-live')) el.classList.add('is-live');
}

/* the hold: 850ms of genuine stillness before the gate is actionable */
function beginHold() {
  const room = $('.room--hold');
  const gate = $('[data-gate]');
  const btn = $('[data-gate-btn]');
  document.body.classList.add('is-held');
  room.classList.add('room--held');
  liveHandoff('[data-handoff-2]');
  if (scene) scene.hold(true);
  announce(`The page has stopped. ${DATA.gate.role} is reviewing the transition brief.`);
  const still = REDUCED ? 0 : 850;
  setTimeout(() => { btn.disabled = false; btn.focus({ preventScroll: true }); }, still);
  btn.addEventListener('click', () => {
    holdDone = true;
    gate.classList.add('is-signed');
    document.body.classList.remove('is-held');
    if (scene) scene.hold(false);
    announce('Reviewed and signed by Rose, the Village Care Manager. The journey continues.');
    updateProgress();
  }, { once: true });
}

function bindJourneyNav() {
  const rooms = $('[data-rooms]');
  const go = dir => {
    const kids = $$('.room');
    const next = Math.min(Math.max(roomIndex + dir, 0), kids.length - 1);
    kids[next].scrollIntoView({
      behavior: REDUCED ? 'auto' : 'smooth', inline: 'center', block: 'nearest',
    });
  };
  $('[data-prev]').addEventListener('click', () => go(-1));
  $('[data-next]').addEventListener('click', () => go(1));
  rooms.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });
  text('[data-journey-progress]', `room 1 of ${DATA.rooms.length}`);
}

/* ── mode toggle ────────────────────────────────────────────── */
function bindModes() {
  const copy = $('[data-mode-copy]');
  $$('.mode-toggle button').forEach(b => {
    b.addEventListener('click', () => {
      $$('.mode-toggle button').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      copy.textContent = b.dataset.mode === 'existing'
        ? DATA.trigger.modes.existing
        : DATA.trigger.modes.prospective;
    });
  });
}

/* ── cursor instrument ──────────────────────────────────────── */
function bindCursor() {
  const c = $('#cursor');
  if (!c || REDUCED) return;
  addEventListener('pointermove', e => {
    c.style.left = e.clientX + 'px';
    c.style.top = e.clientY + 'px';
  }, { passive: true });
  document.addEventListener('pointerover', e => {
    c.classList.toggle('is-on', !!e.target.closest('button, a'));
  });
}

/* ── preloader: the first act, on real progress ─────────────── */
function preload() {
  const loader = $('#loader');
  const path = loader && loader.querySelector('path');
  let steps = 0;
  const total = 3;
  const tick = () => {
    steps += 1;
    if (path) path.style.strokeDashoffset = String(600 * (1 - steps / total));
    if (steps >= total) setTimeout(() => loader.classList.add('is-done'), 350);
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve())
    .then(tick).catch(tick);
  (document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise(r => addEventListener('load', r, { once: true }))).then(tick);
  return { sceneReady: tick };
}

/* ── boot ───────────────────────────────────────────────────── */
const loaderCtl = preload();
render();
initScene().then(() => {
  loaderCtl.sceneReady();
  bindScroll();
});
bindJourneyNav();
bindModes();
bindCursor();
$('[data-cue]').addEventListener('click', () =>
  $('#trigger').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }));
updateProgress();
