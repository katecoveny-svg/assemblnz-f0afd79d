const briefEl = document.getElementById('brief');
const compileBtn = document.getElementById('compile');
const activateBtn = document.getElementById('activate');
const statusEl = document.getElementById('status');
const specCard = document.getElementById('specCard');
const apiBaseEl = document.getElementById('apiBase');
const saveBaseBtn = document.getElementById('saveBase');

let lastSpec = null;

function setStatus(text, show = true) {
  statusEl.hidden = !show;
  statusEl.textContent = text;
}

function renderSpec(spec) {
  lastSpec = spec;
  activateBtn.disabled = !spec?.id;
  specCard.hidden = false;
  document.getElementById('specName').textContent = spec.name;
  document.getElementById('specChip').textContent = `${spec.primitive}${spec.lane ? ` · ${spec.lane}` : ''}`;
  document.getElementById('specWatches').textContent = spec.watches.join(' · ');
  document.getElementById('specWhen').textContent = spec.looks_for.join(' · ');
  document.getElementById('specDoes').textContent = spec.can_do_without_asking.join(' · ') || '—';
  document.getElementById('specAsks').textContent = spec.must_ask_before.join(' · ') || '—';
  document.getElementById('specNever').textContent = spec.never.join(' · ');
}

async function captureFromActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return {
      url: tab?.url || '',
      title: tab?.title || '',
      selectedText: '',
      pageText: '',
    };
  }
  try {
    const res = await chrome.tabs.sendMessage(tab.id, { type: 'DO_CAPTURE' });
    if (res?.ok) return res.page;
  } catch {
    /* content script may be missing on chrome:// pages */
  }
  return {
    url: tab.url || '',
    title: tab.title || '',
    selectedText: '',
    pageText: '',
  };
}

compileBtn.addEventListener('click', async () => {
  const brief = briefEl.value.trim() || 'tell me if this changes';
  setStatus('Compiling…');
  compileBtn.disabled = true;
  try {
    const page = await captureFromActiveTab();
    const response = await chrome.runtime.sendMessage({
      type: 'DO_COMPILE',
      payload: { brief, page },
    });
    if (!response?.ok) throw new Error(response?.error || 'compile failed');
    renderSpec(response.data.spec);
    setStatus(response.data.honesty || 'Compiled.');
  } catch (err) {
    setStatus(String(err?.message || err));
  } finally {
    compileBtn.disabled = false;
  }
});

activateBtn.addEventListener('click', async () => {
  if (!lastSpec?.id) return;
  setStatus('Activating…');
  activateBtn.disabled = true;
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'DO_ACTIVATE',
      id: lastSpec.id,
    });
    if (!response?.ok) throw new Error(response?.error || 'activate failed');
    renderSpec(response.data.agent);
    setStatus('Activated · check Working / Needs you at /do');
  } catch (err) {
    setStatus(String(err?.message || err));
    activateBtn.disabled = false;
  }
});

chrome.runtime.sendMessage({ type: 'DO_GET_API_BASE' }, (res) => {
  apiBaseEl.value = res?.apiBase || 'http://localhost:3000';
});

saveBaseBtn.addEventListener('click', () => {
  const apiBase = apiBaseEl.value.trim() || 'http://localhost:3000';
  chrome.runtime.sendMessage({ type: 'DO_SET_API_BASE', apiBase }, () => {
    setStatus(`API base saved · ${apiBase}`);
  });
});

briefEl.value = 'tell me if this changes';

const clearText = document.getElementById('clearText');
const clearChips = document.getElementById('clearChips');
const clearStatus = document.getElementById('clearStatus');

function showClearStatus(text) {
  clearStatus.hidden = !text;
  clearStatus.textContent = text || '';
}

function renderClearChips(issues) {
  clearChips.innerHTML = '';
  for (const issue of issues || []) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `clear-chip ${issue.kind}`;
    btn.textContent = `✦ ${issue.kind}: ${issue.match} → ${issue.suggestion || '∅'}`;
    btn.title = issue.reason;
    btn.addEventListener('click', () => {
      const text = clearText.value;
      clearText.value = text.slice(0, issue.start) + (issue.suggestion || '') + text.slice(issue.end);
      void runClear(false);
    });
    clearChips.appendChild(btn);
  }
}

async function runClear(rewrite) {
  showClearStatus(rewrite ? 'Rewriting…' : 'Scanning…');
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'DO_CLEAR_SCAN',
      text: clearText.value,
      rewrite: !!rewrite,
    });
    // background always requests rewrite:true; use issues + rewritten
    if (!response?.ok) throw new Error(response?.error || 'clear failed');
    const data = response.data;
    if (rewrite && data.rewritten != null) clearText.value = data.rewritten;
    renderClearChips(data.issues || []);
    showClearStatus(data.honesty || `Found ${(data.issues || []).length} issues.`);
  } catch (err) {
    showClearStatus(String(err?.message || err));
  }
}

document.getElementById('clearScan').addEventListener('click', () => void runClear(false));
document.getElementById('clearRewrite').addEventListener('click', () => void runClear(true));
document.getElementById('clearPin').addEventListener('click', async () => {
  setStatus('Pinning clear-writing agent…');
  try {
    const page = await captureFromActiveTab();
    const response = await chrome.runtime.sendMessage({
      type: 'DO_COMPILE',
      payload: {
        brief: 'keep my writing clear on this site — flag AI-slop and basic grammar',
        templateId: 'clear-writing-watch',
        page,
      },
    });
    if (!response?.ok) throw new Error(response?.error || 'compile failed');
    renderSpec(response.data.spec);
    setStatus(response.data.honesty || 'Clear-writing agent compiled.');
  } catch (err) {
    setStatus(String(err?.message || err));
  }
});
