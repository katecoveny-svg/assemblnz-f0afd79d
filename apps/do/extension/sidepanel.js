const briefEl = document.getElementById('brief');
const compileBtn = document.getElementById('compile');
const activateBtn = document.getElementById('activate');
const statusEl = document.getElementById('status');
const specEl = document.getElementById('spec');
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
  specEl.hidden = false;
  specEl.textContent = [
    `name: ${spec.name}`,
    `primitive: ${spec.primitive}`,
    `status: ${spec.status}`,
    `watches: ${spec.watches.join(' · ')}`,
    `looks_for: ${spec.looks_for.join(' · ')}`,
    `can_do_without_asking: ${spec.can_do_without_asking.join(' · ')}`,
    `must_ask_before: ${spec.must_ask_before.join(' · ')}`,
    `never: ${spec.never.join(' · ')}`,
    spec.lastNote ? `note: ${spec.lastNote}` : '',
  ]
    .filter(Boolean)
    .join('\n');
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
