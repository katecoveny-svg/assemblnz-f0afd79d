/**
 * DO Clear — content-script heuristics for grammar + anti-AI-slop.
 * Mirrors apps/do/shared/clear-writing.ts (keep in sync for v0).
 * DEMO: local only; optional API rewrite via background.
 */
(() => {
  const SLOP = [
    { re: /\bunlock(s|ed|ing)?\b/gi, reason: 'Hype verb', suggestion: 'open / make available' },
    { re: /\brevolutionis[ee](s|d|ing)?\b/gi, reason: 'Hype verb', suggestion: 'change / rebuild' },
    { re: /\bseamless(ly)?\b/gi, reason: 'Empty marketing adjective', suggestion: 'without extra steps' },
    { re: /\bempower(s|ed|ing)?\b/gi, reason: 'Hype verb', suggestion: 'help / let' },
    { re: /\belevate(s|d|ing)?\b/gi, reason: 'Hype verb', suggestion: 'raise / improve' },
    { re: /\bsupercharge(s|d|ing)?\b/gi, reason: 'Hype verb', suggestion: 'speed up' },
    { re: /\bleverage(s|d|ing)?\b/gi, reason: 'Corporate filler', suggestion: 'use / apply' },
    { re: /\bdelve(s|d|ing)?\b/gi, reason: 'AI-slop filler', suggestion: 'look into' },
    { re: /\brobust\b/gi, reason: 'Vague adjective', suggestion: 'reliable' },
    { re: /\bAI[- ]powered\b/gi, reason: 'Bare AI hype', suggestion: 'automated' },
    { re: /\bnext[- ]generation\b/gi, reason: 'Empty future-hype', suggestion: 'current' },
    { re: /\bcutting[- ]edge\b/gi, reason: 'Empty future-hype', suggestion: 'current' },
    { re: /\bgame[- ]chang(er|ing)\b/gi, reason: 'Empty hype', suggestion: 'useful change' },
    { re: /\blandscape\b/gi, reason: 'Vague abstract noun', suggestion: 'market / setup' },
    { re: /\bin today'?s fast[- ]paced (world|environment)\b/gi, reason: 'Classic AI opener', suggestion: '' },
    { re: /\bquietly\b/gi, reason: 'Banned assembl word', suggestion: '' },
    { re: /\breimagine(s|d|ing)?\b/gi, reason: 'Hype verb', suggestion: 'redesign' },
    { re: /\bit'?s important to note that\b/gi, reason: 'Padding', suggestion: '' },
  ];

  const GRAMMAR = [
    { re: /\bteh\b/gi, reason: 'Typo', suggestion: 'the' },
    { re: /\brecieve(d|s|ing)?\b/gi, reason: 'Spelling', suggestion: 'receive' },
    { re: /\bseperate(d|ly|s)?\b/gi, reason: 'Spelling', suggestion: 'separate' },
    { re: /\bdefinately\b/gi, reason: 'Spelling', suggestion: 'definitely' },
    { re: /\balot\b/gi, reason: 'Two words', suggestion: 'a lot' },
    { re: /\b(could of|would of|should of)\b/gi, reason: 'Use have', suggestion: null },
    { re: /\bits (important|clear|time|worth)\b/gi, reason: 'Missing apostrophe?', suggestion: null },
  ];

  function scan(text) {
    const issues = [];
    function push(kind, m, reason, suggestion) {
      issues.push({
        id: `${kind}-${m.index}-${m[0].slice(0, 10)}`,
        kind,
        match: m[0],
        start: m.index,
        end: m.index + m[0].length,
        reason,
        suggestion:
          suggestion == null
            ? m[0].replace(/\sof$/i, ' have').replace(/^its/i, "it's")
            : suggestion,
      });
    }
    for (const rule of SLOP) {
      const re = new RegExp(rule.re.source, rule.re.flags.includes('g') ? rule.re.flags : `${rule.re.flags}g`);
      let m;
      while ((m = re.exec(text))) push('slop', m, rule.reason, rule.suggestion);
    }
    for (const rule of GRAMMAR) {
      const re = new RegExp(rule.re.source, rule.re.flags.includes('g') ? rule.re.flags : `${rule.re.flags}g`);
      let m;
      while ((m = re.exec(text))) push('grammar', m, rule.reason, rule.suggestion);
    }
    issues.sort((a, b) => a.start - b.start);
    const out = [];
    let last = -1;
    for (const i of issues) {
      if (i.start < last) continue;
      out.push(i);
      last = i.end;
    }
    return out;
  }

  function isEditable(el) {
    if (!el || el.closest?.('#do-agent-os-host, .do-root, [data-do-clear-ignore]')) return false;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'INPUT') {
      const t = (el.type || 'text').toLowerCase();
      return ['text', 'search', 'email', 'url', 'tel', ''].includes(t);
    }
    if (el.isContentEditable) return true;
    return false;
  }

  function getText(el) {
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return el.value || '';
    return el.innerText || '';
  }

  const host = document.createElement('div');
  host.id = 'do-clear-overlay-host';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
    .bar {
      position: fixed; z-index: 2147483645; display: none; flex-wrap: wrap; gap: 6px;
      max-width: min(420px, 90vw); padding: 8px; border-radius: 14px;
      background: #FFFDFB; border: 1px solid rgba(36,11,33,0.12);
      box-shadow: 0 16px 40px rgba(36,11,33,0.16); font: 12px/1.35 system-ui, sans-serif;
      color: #240B21;
    }
    .bar.open { display: flex; }
    .chip {
      appearance: none; border: 1px solid rgba(36,11,33,0.2); background: #fff;
      border-radius: 999px; padding: 4px 8px; cursor: pointer; font: inherit; color: inherit;
      display: inline-flex; align-items: center; gap: 4px; max-width: 100%;
    }
    .chip.slop { background: rgba(160,90,60,0.08); border-color: rgba(160,90,60,0.35); }
    .chip.grammar { background: rgba(145,106,112,0.1); border-color: rgba(145,106,112,0.4); }
    .meta { width: 100%; font: 10px/1.3 ui-monospace, monospace; color: #916A70; }
    .actions { width: 100%; display: flex; gap: 6px; }
    .btn {
      appearance: none; border: none; border-radius: 999px; padding: 6px 10px;
      background: #240B21; color: #FFFDFB; font: 11px system-ui; cursor: pointer;
    }
    .btn.sec { background: #FFFDFB; color: #240B21; border: 1px solid rgba(36,11,33,0.22); }
  `;
  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.setAttribute('data-do-clear-ignore', '1');
  shadow.appendChild(style);
  shadow.appendChild(bar);
  document.documentElement.appendChild(host);

  let activeEl = null;
  let activeIssues = [];

  function placeBar(el) {
    const rect = el.getBoundingClientRect();
    bar.style.left = `${Math.max(8, Math.min(window.innerWidth - 280, rect.left))}px`;
    bar.style.top = `${Math.min(window.innerHeight - 80, rect.bottom + 8)}px`;
  }

  function render(el, issues) {
    activeEl = el;
    activeIssues = issues;
    if (!issues.length) {
      bar.classList.remove('open');
      return;
    }
    placeBar(el);
    bar.innerHTML = '';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `DO Clear · DEMO · ${issues.filter((i) => i.kind === 'slop').length} slop · ${issues.filter((i) => i.kind === 'grammar').length} grammar · not Grammarly parity`;
    bar.appendChild(meta);
    for (const issue of issues.slice(0, 8)) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `chip ${issue.kind}`;
      chip.title = issue.reason;
      chip.textContent = `✦ ${issue.kind}: ${issue.match}${issue.suggestion ? ` → ${issue.suggestion || '∅'}` : ''}`;
      chip.addEventListener('click', () => applyOne(issue));
      bar.appendChild(chip);
    }
    const actions = document.createElement('div');
    actions.className = 'actions';
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'btn';
    pin.textContent = '✦ Make agent: keep clear';
    pin.addEventListener('click', () => {
      chrome.runtime.sendMessage({
        type: 'DO_COMPILE',
        payload: {
          brief: 'keep my writing clear on this site — flag AI-slop and basic grammar',
          templateId: 'clear-writing-watch',
          page: {
            url: location.href,
            title: document.title,
            selectedText: getText(el).slice(0, 500),
          },
          surface: 'chrome',
        },
      });
    });
    const hide = document.createElement('button');
    hide.type = 'button';
    hide.className = 'btn sec';
    hide.textContent = 'Hide';
    hide.addEventListener('click', () => bar.classList.remove('open'));
    actions.appendChild(pin);
    actions.appendChild(hide);
    bar.appendChild(actions);
    bar.classList.add('open');
  }

  function setText(el, value) {
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (el.isContentEditable) {
      el.innerText = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function applyOne(issue) {
    if (!activeEl) return;
    const text = getText(activeEl);
    const next = text.slice(0, issue.start) + (issue.suggestion || '') + text.slice(issue.end);
    setText(activeEl, next);
    render(activeEl, scan(next));
  }

  function onEdit(e) {
    const el = e.target;
    if (!isEditable(el)) return;
    const text = getText(el);
    if (text.length < 8) {
      bar.classList.remove('open');
      return;
    }
    render(el, scan(text));
  }

  document.addEventListener('input', onEdit, true);
  document.addEventListener('focusin', (e) => {
    if (isEditable(e.target)) onEdit(e);
  }, true);

  window.__doClearScan = scan;
})();
