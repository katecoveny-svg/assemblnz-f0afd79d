/* assembl · the drawing sheet
 *
 * Every demonstrator is framed as a technical drawing: a title block bottom-right,
 * corner registration ticks, a faint sheet grid, balloon part numbers on the flat lay
 * and dimension lines on the wait moment.
 *
 * The reason is not decoration. A prospect's engineering, risk or compliance people
 * read drawings for a living, and a page that behaves like a drawing tells them this
 * was specified rather than styled — which is exactly the claim assembl is making
 * about the journey underneath it.
 */

const pad2 = n => String(n).padStart(2, '0');

/* Sheet numbers are stable per vertical, not random — a drawing whose number changes
   on reload is a drawing nobody can refer to in a meeting. */
export function sheetMeta(data, index = 1, total = 1) {
  const d = new Date();
  return {
    client: data.client?.name || 'assembl',
    title: data.sheet?.title || `${data.client?.sector || 'customer journey'} — assembling`,
    drawing: data.sheet?.drawing || `ASM-${(data.id || 'gen').toUpperCase().slice(0, 4)}-001`,
    rev: data.sheet?.rev || 'A',
    scale: data.sheet?.scale || 'NTS',
    sheet: `${pad2(index)} / ${pad2(total)}`,
    date: `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`,
    status: data.client?.status || 'proposed',
    material: data.sheet?.material || 'agentic wait state',
  };
}

export function mountSheet(root, data, opts = {}) {
  const m = sheetMeta(data, opts.index, opts.total);

  const block = root.querySelector('[data-title-block]');
  if (block) {
    block.innerHTML = `
      <div class="tb__row tb__row--head">
        <span class="tb__k">client</span><span class="tb__v">${m.client}</span>
      </div>
      <div class="tb__row">
        <span class="tb__k">title</span><span class="tb__v">${m.title}</span>
      </div>
      <div class="tb__grid">
        <div><span class="tb__k">drawing</span><span class="tb__v tabular">${m.drawing}</span></div>
        <div><span class="tb__k">rev</span><span class="tb__v tabular">${m.rev}</span></div>
        <div><span class="tb__k">sheet</span><span class="tb__v tabular">${m.sheet}</span></div>
        <div><span class="tb__k">scale</span><span class="tb__v tabular">${m.scale}</span></div>
        <div><span class="tb__k">date</span><span class="tb__v tabular">${m.date}</span></div>
        <div><span class="tb__k">status</span><span class="tb__v tb__v--status">${m.status}</span></div>
      </div>
      <div class="tb__row tb__row--foot">
        <span class="tb__k">subject</span><span class="tb__v">${m.material}</span>
      </div>`;
  }

  /* corner registration ticks — the cheapest, most legible drawing signal there is */
  root.querySelectorAll('[data-sheet]').forEach(el => {
    if (el.querySelector('.sheet__tick')) return;
    ['tl', 'tr', 'bl', 'br'].forEach(pos => {
      const t = document.createElement('span');
      t.className = `sheet__tick sheet__tick--${pos}`;
      t.setAttribute('aria-hidden', 'true');
      el.appendChild(t);
    });
  });

  return m;
}

/* Balloon part numbers, the way an assembly drawing numbers its bill of materials.
   Rendered as DOM over the canvas rather than inside it, so they are selectable,
   translatable and readable by a screen reader — the canvas is aria-hidden. */
export function mountBalloons(layer, families) {
  if (!layer) return;
  layer.innerHTML = families.map(([name, why], i) => `
    <li class="balloon-item">
      <span class="balloon" aria-hidden="true">${i + 1}</span>
      <span class="balloon-name">${name}</span>
      <span class="balloon-why">${why}</span>
    </li>`).join('');
}

/* A dimension line with arrowheads and a measurement, for the wait moment.
   `value` is the measured wait; `note` is what makes it a real number or a
   simulated one — the honesty rule applies to drawings too. */
export function dimension(el, value, note, simulated) {
  if (!el) return;
  el.innerHTML = `
    <span class="dim__line" aria-hidden="true">
      <span class="dim__tick"></span><span class="dim__rule"></span><span class="dim__tick"></span>
    </span>
    <span class="dim__value tabular">${value}${simulated ? '<span class="simulated-badge">simulated</span>' : ''}</span>
    ${note ? `<span class="dim__note">${note}</span>` : ''}`;
}
