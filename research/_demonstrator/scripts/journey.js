/* assembl · journey simulator engine — shared across every vertical
 *
 * Verticals supply steps as data. If a vertical needs new behaviour, it is added
 * here for everyone rather than forked, because the moment two verticals have two
 * engines the tenth vertical costs a week.
 *
 * The scene reads journey state. Never the reverse.
 */

export function createJourney(root, data, { scene, onBeat } = {}) {
  const steps = data.scenario.steps;
  const live = root.querySelector('[data-journey-live]');
  const stage = root.querySelector('[data-journey-stage]');
  const rail = root.querySelector('[data-journey-rail]');
  const progressEl = root.querySelector('[data-journey-progress]');
  /* the proof panel is usually a sibling card rather than a child, so look wider —
     silently rendering nothing is the worst possible failure here */
  const proofEl = root.querySelector('[data-journey-proof]')
               || document.querySelector('[data-journey-proof]');

  let index = 0;
  /* A step takes 400–900ms to hand over. Without this guard a second click during
     that window schedules a second advance, index runs past the end of the array,
     and the whole simulator throws on `steps[index].beat`. Cheap to prevent,
     invisible when it works, fatal when it doesn't. */
  let advancing = false;
  const answers = [];

  /* the rail is the journey's spine — built once, updated as state changes */
  rail.innerHTML = steps.map((s, i) => `
    <li class="rail-step" data-i="${i}" aria-current="${i === 0 ? 'step' : 'false'}">
      <span class="rail-dot" data-beat="${s.beat}"></span>
      <span class="rail-label">${s.stage}</span>
    </li>`).join('');

  function setBeat(beat) {
    root.dataset.beat = beat;
    scene?.setBeat(beat);
    onBeat?.(beat);
  }

  function announce(msg) {
    /* polite, so it doesn't interrupt someone mid-sentence */
    if (live) { live.textContent = ''; setTimeout(() => { live.textContent = msg; }, 60); }
  }

  function render() {
    const s = steps[index];
    const isLast = index === steps.length - 1;
    const p = steps.length > 1 ? index / (steps.length - 1) : 1;

    scene?.setProgress(0.12 + p * 0.88);
    setBeat(s.beat);

    rail.querySelectorAll('.rail-step').forEach((el, i) => {
      el.setAttribute('aria-current', i === index ? 'step' : 'false');
      el.dataset.state = i < index ? 'done' : i === index ? 'now' : 'todo';
    });
    if (progressEl) {
      progressEl.style.setProperty('--p', p);
      progressEl.setAttribute('aria-valuenow', String(index + 1));
    }

    const blocking = s.blocking === true;
    const authority = s.authority || 'observe';

    stage.innerHTML = `
      <article class="step ${blocking ? 'step--gate' : ''}" data-beat="${s.beat}">
        <header class="step__head">
          <span class="label">${s.stage}</span>
          ${s.agent
            ? `<span class="authority-chip" data-level="${authority}">${s.agent} · ${authority}</span>`
            : `<span class="authority-chip" data-level="act with approval">${s.human} · human</span>`}
        </header>

        <p class="step__says">${s.showsCustomer}</p>

        ${blocking ? `
          <div class="gate-note">
            <span class="pulse" aria-hidden="true"></span>
            <div>
              <p class="small"><strong>Approving:</strong> ${s.approving}</p>
              <p class="small caption">${data.human.whyStatutory || 'A named person signs this off.'}</p>
            </div>
          </div>` : ''}

        <details class="step__behind">
          <summary>what happens that you don't see</summary>
          <p class="small">${s.doesBehind}</p>
        </details>

        ${s.question ? `
          <fieldset class="step__ask">
            <legend class="label">${blocking ? 'your call' : 'one question'}</legend>
            <p class="step__q">${s.question}</p>
            <div class="step__options">
              ${s.options.map((o, i) =>
                `<button class="opt tactile" data-opt="${i}">${o}</button>`).join('')}
            </div>
          </fieldset>`
          : `<div class="step__options">
               <button class="opt tactile" data-opt="0">${isLast ? 'see the evidence pack' : 'continue'}</button>
             </div>`}
      </article>`;

    stage.querySelectorAll('[data-opt]').forEach(btn => {
      btn.addEventListener('click', () => advance(btn.textContent.trim()));
    });

    /* keep focus in the flow for keyboard and screen-reader users */
    stage.querySelector('.opt')?.focus({ preventScroll: true });
    announce(`${s.stage}. ${s.showsCustomer}`);

    if (isLast) renderProof();
  }

  function advance(answer) {
    if (advancing) return;
    const s = steps[index];
    if (!s) return;
    answers.push({ step: s.id, stage: s.stage, answer, at: stamp() });

    if (index >= steps.length - 1) { renderProof(true); return; }

    /* cinematic pacing: the hold beat gets a longer, deliberate pause before
       release — the stillness is the argument, so don't rush past it */
    const pause = s.beat === 'hold' ? 900 : 400;
    advancing = true;
    stage.dataset.transitioning = 'true';
    setTimeout(() => {
      index = Math.min(index + 1, steps.length - 1);
      stage.dataset.transitioning = 'false';
      advancing = false;
      render();
    }, prefersReduced() ? 1 : pause);
  }

  function renderProof(scrollTo) {
    const el = proofEl;
    if (!el) return;
    el.hidden = false;
    el.innerHTML = `
      <h3>the evidence pack</h3>
      <p class="small caption">One file. Keep it, or forward it when someone asks six months later how this decision was made.</p>
      <ul class="proof-list">
        ${data.proof.evidencePack.map(r => `
          <li class="proof-row">
            <span class="label">${r.what}</span>
            <span>${r.example}</span>
            <span class="caption tabular">logged</span>
          </li>`).join('')}
        ${answers.map(a => `
          <li class="proof-row">
            <span class="label">${a.stage}</span>
            <span>“${a.answer}”</span>
            <span class="caption tabular">${a.at}</span>
          </li>`).join('')}
      </ul>
      <p class="small caption">
        This walkthrough is a <strong>simulated</strong> scenario built on published sources.
        assembl is <strong>${data.client.status}</strong> for ${data.client.name}.
      </p>
      <button class="opt tactile" data-restart>run it again</button>`;
    el.querySelector('[data-restart]')?.addEventListener('click', reset);
    if (scrollTo && !prefersReduced()) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reset() {
    index = 0; advancing = false; answers.length = 0;
    if (proofEl) { proofEl.hidden = true; proofEl.innerHTML = ''; }
    render();
    root.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
  }

  /* keyboard: the whole journey is driveable without a pointer */
  root.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.classList?.contains('opt')) e.target.click();
  });

  render();
  return { reset, get index() { return index; } };
}

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function stamp() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
