/**
 * DO content script — Grammarly-like floating ✦ + compact on-page sheet.
 * Surface ≠ agent. DEMO honesty banners throughout.
 */

(() => {
  if (window.__doAgentOsInjected) return;
  window.__doAgentOsInjected = true;

  const PAGE_TEXT_MAX = 3500;
  const HOST_ID = 'do-agent-os-host';

  function capture() {
    const selected = window.getSelection()?.toString()?.trim() || '';
    let pageText = '';
    try {
      pageText = (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, PAGE_TEXT_MAX);
    } catch {
      pageText = '';
    }
    return {
      url: location.href,
      title: document.title || '',
      selectedText: selected.slice(0, 2000),
      pageText,
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'DO_CAPTURE') {
      sendResponse({ ok: true, page: capture() });
      return true;
    }
    if (message?.type === 'DO_TOGGLE_SHEET') {
      toggleSheet();
      sendResponse({ ok: true });
      return true;
    }
  });

  const host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: system-ui, -apple-system, 'Segoe UI', 'Instrument Sans', sans-serif; }
    .fab {
      position: fixed; right: 18px; bottom: 18px; z-index: 2147483646;
      width: 52px; height: 52px; border-radius: 999px; border: none;
      background: #240B21; color: #FFFDFB; font-size: 22px; cursor: pointer;
      box-shadow: 0 12px 32px rgba(36,11,33,0.32);
      transition: transform 160ms ease, box-shadow 200ms ease;
    }
    .fab:hover {
      transform: translateY(-2px) scale(1.04);
      box-shadow: 0 16px 40px rgba(36,11,33,0.4), 0 0 18px rgba(145,106,112,0.35);
    }
    .sheet {
      position: fixed; right: 18px; bottom: 82px; z-index: 2147483646;
      width: min(400px, calc(100vw - 24px)); max-height: min(72vh, 680px);
      overflow: auto; padding: 14px 14px 16px; border-radius: 22px;
      background: linear-gradient(165deg, #fff, #FFFDFB 55%, #F5F1F2);
      color: #240B21; border: 1px solid rgba(36,11,33,0.08);
      box-shadow: 0 28px 70px rgba(36,11,33,0.14);
      display: none;
    }
    .sheet.open { display: block; }
    .eyebrow { margin: 0 0 4px; font-family: ui-monospace, monospace; font-size: 10px;
      letter-spacing: 0.14em; text-transform: uppercase; color: #916A70; }
    h2 { margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.02em;
      display: flex; align-items: center; gap: 6px; }
    .head { display: flex; justify-content: space-between; gap: 8px; align-items: start; }
    .close, .btn, .tab, .tpl, .conn {
      appearance: none; cursor: pointer; font: inherit; color: inherit;
    }
    .close {
      border: 1px solid rgba(36,11,33,0.22); background: #FFFDFB;
      border-radius: 999px; padding: 4px 10px; font-size: 12px;
    }
    .honesty { margin: 8px 0; font-family: ui-monospace, monospace; font-size: 10px; color: #916A70; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .chip {
      display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px;
      border-radius: 999px; background: rgba(74,107,82,0.12); color: #3d5a44;
      font-family: ui-monospace, monospace; font-size: 10px; max-width: 100%;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .chip .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    label { display: block; font-size: 13px; font-weight: 500; margin: 0 0 6px; }
    textarea, input[type="text"] {
      width: 100%; border: 1px solid rgba(36,11,33,0.12); border-radius: 12px;
      padding: 10px 12px; font: inherit; background: #FFFDFB; color: #240B21; resize: vertical;
    }
    .row { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0 12px; }
    .btn {
      border: none; border-radius: 999px; padding: 10px 14px; background: #240B21; color: #FFFDFB;
      font-weight: 500; display: inline-flex; align-items: center; gap: 6px;
    }
    .btn.secondary { background: rgba(255,253,251,0.9); color: #240B21; border: 1px solid rgba(36,11,33,0.22); }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .tabs { display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0; }
    .tab {
      border: 1px solid rgba(36,11,33,0.12); background: #FFFDFB; border-radius: 999px;
      padding: 4px 8px; font-family: ui-monospace, monospace; font-size: 9px;
      letter-spacing: 0.06em; text-transform: uppercase; color: #654A4E;
    }
    .tab.active { background: #240B21; color: #FFFDFB; border-color: transparent; }
    .lane-title { margin: 10px 0 6px; font-family: ui-monospace, monospace; font-size: 10px;
      letter-spacing: 0.1em; text-transform: uppercase; color: #916A70; }
    .tpl {
      width: 100%; text-align: left; border: none; background: rgba(255,253,251,0.95);
      border-radius: 14px; padding: 10px 12px; margin: 0 0 6px; display: grid; gap: 2px;
      box-shadow: 0 8px 20px rgba(36,11,33,0.06);
    }
    .tpl .mono { font-family: ui-monospace, monospace; font-size: 9px; letter-spacing: 0.1em;
      text-transform: uppercase; color: #916A70; }
    .tpl strong { font-size: 13px; }
    .tpl span:last-child { font-size: 12px; color: rgba(36,11,33,0.62); line-height: 1.35; }
    .card {
      margin-top: 8px; padding: 12px; border-radius: 16px;
      background: linear-gradient(155deg, #fff, #FFFDFB); box-shadow: 0 12px 28px rgba(36,11,33,0.08);
      border-left: 3px solid #916A70;
    }
    .card h3 { margin: 0 0 4px; font-size: 15px; }
    .card .brief { margin: 0 0 8px; font-size: 12px; color: rgba(36,11,33,0.62); }
    dl { margin: 0; padding: 8px 10px; background: rgba(245,241,242,0.7); border-radius: 12px; display: grid; gap: 6px; }
    dt { font-family: ui-monospace, monospace; font-size: 9px; letter-spacing: 0.1em;
      text-transform: uppercase; color: #916A70; }
    dd { margin: 2px 0 0; font-size: 12px; line-height: 1.35; }
    .status { margin: 8px 0; font-family: ui-monospace, monospace; font-size: 11px; color: #654A4E; }
    .err { color: #8b2e2e; font-family: ui-monospace, monospace; font-size: 11px; }
    .conn {
      width: 100%; text-align: left; border: 1px solid rgba(36,11,33,0.12); background: #FFFDFB;
      border-radius: 12px; padding: 10px; margin: 0 0 6px; display: grid; gap: 2px;
    }
    .conn.active { border-color: rgba(145,106,112,0.55); box-shadow: 0 0 0 1px rgba(145,106,112,0.25); }
    .conn strong { font-size: 13px; }
    .conn span { font-size: 11px; color: rgba(36,11,33,0.62); }
    .templates { max-height: 240px; overflow: auto; }
    @media (prefers-reduced-motion: reduce) {
      .fab { transition: none; }
    }
  `;

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'fab';
  fab.setAttribute('aria-label', 'DO make agent');
  fab.textContent = '✦';

  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-label', 'DO make agent');
  sheet.innerHTML = `
    <div class="head">
      <div>
        <p class="eyebrow">assembl · DO · PREVIEW</p>
        <h2><span aria-hidden>✦</span> DO anything from here</h2>
      </div>
      <button type="button" class="close" data-action="close">Close</button>
    </div>
    <p class="honesty" data-el="honesty">DEMO · buy / book / send / post / submit / pay / sign always need your yes.</p>
    <div class="chips" data-el="chips"></div>
    <p class="err" data-el="error" hidden></p>
    <div data-el="browse">
      <label for="do-brief-ext">Make agent for this</label>
      <textarea id="do-brief-ext" data-el="brief" rows="2" placeholder="e.g. tell me if this changes"></textarea>
      <div class="row">
        <button type="button" class="btn" data-action="compile"><span aria-hidden>✦</span> compile</button>
        <button type="button" class="btn secondary" data-action="open-panel">Side panel</button>
      </div>
      <div class="tabs" data-el="tabs"></div>
      <p class="lane-title">Use a template</p>
      <div class="templates" data-el="templates"></div>
    </div>
    <div data-el="spec" hidden>
      <div class="card">
        <h3 data-el="spec-name"></h3>
        <p class="brief" data-el="spec-brief"></p>
        <dl>
          <div><dt>Watches</dt><dd data-el="spec-watches"></dd></div>
          <div><dt>When</dt><dd data-el="spec-when"></dd></div>
          <div><dt>Does</dt><dd data-el="spec-does"></dd></div>
          <div><dt>Asks first</dt><dd data-el="spec-asks"></dd></div>
        </dl>
        <p class="status" data-el="spec-note"></p>
      </div>
      <div class="row">
        <button type="button" class="btn secondary" data-action="back">Back</button>
        <button type="button" class="btn secondary" data-action="connectors">Connector</button>
        <button type="button" class="btn" data-action="activate"><span aria-hidden>✦</span> Activate</button>
      </div>
    </div>
    <div data-el="connector" hidden>
      <p class="lane-title">Optional connector · stubs only</p>
      <div data-el="connector-list"></div>
      <div class="row">
        <button type="button" class="btn secondary" data-action="back-spec">Back to card</button>
        <button type="button" class="btn" data-action="activate"><span aria-hidden>✦</span> Activate</button>
      </div>
    </div>
  `;

  shadow.appendChild(style);
  shadow.appendChild(fab);
  shadow.appendChild(sheet);
  document.documentElement.appendChild(host);

  const el = (name) => sheet.querySelector(`[data-el="${name}"]`);
  let groups = [];
  let connectors = [];
  let laneFilter = 'all';
  let draft = null;
  let connector = 'hook-later';
  let busy = false;

  function setError(msg) {
    const node = el('error');
    if (!msg) {
      node.hidden = true;
      node.textContent = '';
      return;
    }
    node.hidden = false;
    node.textContent = msg;
  }

  function renderChips() {
    const page = capture();
    const bits = [
      page.title && `Title: ${page.title}`,
      page.url && `URL: ${page.url}`,
      page.selectedText && `Selection: ${page.selectedText.slice(0, 80)}`,
    ].filter(Boolean);
    el('chips').innerHTML = bits
      .map(
        (b) =>
          `<span class="chip" title="${b.replace(/"/g, '&quot;')}"><span class="dot"></span>${b.length > 48 ? `${b.slice(0, 46)}…` : b}</span>`,
      )
      .join('');
  }

  function renderTabs() {
    const tabs = el('tabs');
    const items = [{ lane: 'all', label: 'All' }, ...groups.map((g) => ({ lane: g.lane, label: g.label }))];
    tabs.innerHTML = items
      .map(
        (t) =>
          `<button type="button" class="tab${laneFilter === t.lane ? ' active' : ''}" data-lane="${t.lane}">${t.label}</button>`,
      )
      .join('');
  }

  function renderTemplates() {
    const root = el('templates');
    const visible = laneFilter === 'all' ? groups : groups.filter((g) => g.lane === laneFilter);
    root.innerHTML = visible
      .map((g) => {
        const items = g.templates
          .map(
            (t) => `
          <button type="button" class="tpl" data-template="${t.id}">
            <span class="mono">${t.primitive}</span>
            <strong>${t.name}</strong>
            <span>${t.summary}</span>
          </button>`,
          )
          .join('');
        return `<div><p class="lane-title">${g.label}</p>${items}</div>`;
      })
      .join('');
  }

  function renderConnectors() {
    el('connector-list').innerHTML = connectors
      .map(
        (c) => `
      <button type="button" class="conn${connector === c.id ? ' active' : ''}" data-connector="${c.id}">
        <strong>${c.name}</strong>
        <span>${c.honesty}</span>
      </button>`,
      )
      .join('');
  }

  function showStep(step) {
    el('browse').hidden = step !== 'browse';
    el('spec').hidden = step !== 'spec';
    el('connector').hidden = step !== 'connector';
  }

  function renderSpec() {
    if (!draft) return;
    el('spec-name').textContent = draft.name;
    el('spec-brief').textContent = draft.brief;
    el('spec-watches').textContent = (draft.watches || []).join(' · ');
    el('spec-when').textContent = (draft.looks_for || []).join(' · ');
    el('spec-does').textContent = (draft.can_do_without_asking || []).join(' · ') || '—';
    el('spec-asks').textContent = (draft.must_ask_before || []).join(' · ') || '—';
    el('spec-note').textContent = draft.lastNote || `${draft.status} · ${draft.primitive}`;
    showStep('spec');
  }

  async function loadCatalog() {
    const res = await chrome.runtime.sendMessage({ type: 'DO_GET_TEMPLATES' });
    if (!res?.ok) throw new Error(res?.error || 'templates failed');
    groups = res.data.groups || [];
    connectors = res.data.connectors || [];
    if (res.data.honesty) el('honesty').textContent = res.data.honesty;
    renderTabs();
    renderTemplates();
    renderConnectors();
  }

  async function compile(payload) {
    if (busy) return;
    busy = true;
    setError(null);
    try {
      const page = capture();
      const response = await chrome.runtime.sendMessage({
        type: 'DO_COMPILE',
        payload: { ...payload, page, surface: 'chrome-extension', connector },
      });
      if (!response?.ok) throw new Error(response?.error || 'compile failed');
      draft = response.data.spec;
      if (payload.templateId) {
        const t = groups.flatMap((g) => g.templates).find((x) => x.id === payload.templateId);
        if (t?.connectorHint) connector = t.connectorHint;
      }
      renderSpec();
    } catch (err) {
      setError(String(err?.message || err));
    } finally {
      busy = false;
    }
  }

  async function activate() {
    if (!draft?.id || busy) return;
    busy = true;
    setError(null);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'DO_ACTIVATE',
        id: draft.id,
        connector,
      });
      if (!response?.ok) throw new Error(response?.error || 'activate failed');
      draft = response.data.agent;
      renderSpec();
      el('spec-note').textContent =
        draft.lastNote || 'Activated · check Working / Needs you at /do';
    } catch (err) {
      setError(String(err?.message || err));
    } finally {
      busy = false;
    }
  }

  function openSheet() {
    sheet.classList.add('open');
    renderChips();
    showStep('browse');
    loadCatalog().catch((err) => setError(String(err?.message || err)));
  }

  function closeSheet() {
    sheet.classList.remove('open');
  }

  function toggleSheet() {
    if (sheet.classList.contains('open')) closeSheet();
    else openSheet();
  }

  fab.addEventListener('click', () => {
    toggleSheet();
    // Also nudge the side panel for users who prefer it — non-blocking.
    chrome.runtime.sendMessage({ type: 'DO_OPEN_PANEL', page: capture() }).catch(() => {});
  });

  sheet.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action], [data-lane], [data-template], [data-connector]');
    if (!target) return;
    const action = target.getAttribute('data-action');
    if (action === 'close') return closeSheet();
    if (action === 'back') return showStep('browse');
    if (action === 'back-spec') return showStep('spec');
    if (action === 'connectors') {
      renderConnectors();
      return showStep('connector');
    }
    if (action === 'compile') {
      const brief = el('brief').value.trim() || 'tell me if this changes';
      return void compile({ brief });
    }
    if (action === 'activate') return void activate();
    if (action === 'open-panel') {
      chrome.runtime.sendMessage({ type: 'DO_OPEN_PANEL', page: capture() });
      return;
    }
    const lane = target.getAttribute('data-lane');
    if (lane) {
      laneFilter = lane;
      renderTabs();
      renderTemplates();
      return;
    }
    const templateId = target.getAttribute('data-template');
    if (templateId) {
      const t = groups.flatMap((g) => g.templates).find((x) => x.id === templateId);
      if (t) el('brief').value = t.brief;
      return void compile({ brief: t?.brief || '', templateId });
    }
    const conn = target.getAttribute('data-connector');
    if (conn) {
      connector = conn;
      renderConnectors();
    }
  });
})();
