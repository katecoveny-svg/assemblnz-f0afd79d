(() => {
  'use strict';
  if (globalThis.__assemblDoFloating) return;
  globalThis.__assemblDoFloating = true;
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = `
    :host{all:initial}
    .wrap{position:fixed;right:24px;bottom:28px;z-index:2147483646;width:78px;font:12px 'Instrument Sans',ui-sans-serif,system-ui,sans-serif}
    .orb{width:68px;height:68px;border:0;border-radius:22px;cursor:grab;touch-action:none;display:grid;place-items:center;color:#f3d4de;background:radial-gradient(ellipse at 25% 15%,#c995a8,#916a70 42%,#391333 72%,#240b21);box-shadow:inset 1px 1px 2px #f8e4ea8c,inset -2px -2px 5px #180a1e,0 0 22px #d6a5bd80;position:relative}
    .orb:active{cursor:grabbing}
    .orb svg{width:42px;height:42px;filter:drop-shadow(0 0 4px #e8b6c4);pointer-events:none}
    .label{display:block;margin-top:6px;background:#240b21ee;color:#fffdfb;padding:5px 8px;border-radius:99px;text-align:center;pointer-events:none;border:1px solid #d9a4c388;font-size:10px}
    .close{position:absolute;right:-9px;top:-10px;width:24px;height:24px;border-radius:50%;border:1px solid #d6bfd0;background:#fffdfb;color:#240b21;cursor:pointer}
    .notice{position:absolute;right:0;bottom:110px;width:200px;padding:10px;background:#fffdfb;color:#240b21;border-radius:12px;box-shadow:0 4px 20px #0003;font-size:11px;line-height:1.4}
    .notice:empty{display:none}
    button:focus-visible{outline:3px solid #916a70;outline-offset:4px}
  `;
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  const orb = document.createElement('button');
  orb.className = 'orb';
  orb.type = 'button';
  orb.setAttribute('aria-label', 'Open DO. Drag to move, or use arrow keys.');
  orb.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 12H29C44 12 52 20 52 32S44 52 29 52H16Z" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/><circle cx="30" cy="32" r="6" fill="currentColor"/></svg>`;
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = 'Open DO';
  const close = document.createElement('button');
  close.className = 'close';
  close.type = 'button';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Remove floating DO from this page');
  const notice = document.createElement('div');
  notice.className = 'notice';
  notice.setAttribute('role', 'status');
  function place(x, y) {
    wrap.style.right = 'auto';
    wrap.style.bottom = 'auto';
    wrap.style.left = Math.max(8, Math.min(innerWidth - 92, x)) + 'px';
    wrap.style.top = Math.max(18, Math.min(innerHeight - 110, y)) + 'px';
  }
  let drag = null;
  let suppress = false;
  orb.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const r = wrap.getBoundingClientRect();
    drag = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
    suppress = false;
    orb.setPointerCapture(e.pointerId);
  });
  orb.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 5) suppress = true;
    if (suppress) place(drag.left + e.clientX - drag.x, drag.top + e.clientY - drag.y);
  });
  orb.addEventListener('pointerup', (e) => {
    drag = null;
    if (orb.hasPointerCapture(e.pointerId)) orb.releasePointerCapture(e.pointerId);
  });
  orb.addEventListener('pointercancel', () => {
    drag = null;
    suppress = true;
  });
  orb.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const r = wrap.getBoundingClientRect();
    place(
      r.left + (e.key === 'ArrowRight' ? 24 : e.key === 'ArrowLeft' ? -24 : 0),
      r.top + (e.key === 'ArrowDown' ? 24 : e.key === 'ArrowUp' ? -24 : 0),
    );
  });
  orb.addEventListener('click', () => {
    if (suppress) {
      suppress = false;
      return;
    }
    chrome.runtime.sendMessage({ type: 'do:open-panel' }, (response) => {
      const error = chrome.runtime.lastError;
      notice.textContent =
        error || !response?.ok
          ? 'Open DO using its pinned browser toolbar icon.'
          : '';
    });
  });
  function resize() {
    const r = wrap.getBoundingClientRect();
    place(r.left, r.top);
  }
  window.addEventListener('resize', resize);
  close.addEventListener('click', () => {
    window.removeEventListener('resize', resize);
    host.remove();
    globalThis.__assemblDoFloating = false;
  });
  wrap.append(orb, label, close, notice);
  root.append(style, wrap);
  document.documentElement.append(host);
})();
