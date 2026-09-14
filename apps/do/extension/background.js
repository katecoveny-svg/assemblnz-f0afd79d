/**
 * DO extension background — opens side panel and relays compile requests.
 * Default API base: http://localhost:3000 (Next /api/do/*).
 */

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'DO_OPEN_PANEL') {
    const tabId = sender.tab?.id;
    if (tabId != null && chrome.sidePanel?.open) {
      chrome.sidePanel
        .open({ tabId })
        .then(async () => {
          try {
            await chrome.storage.session.set({ doLastPage: message.page });
          } catch {
            /* session storage optional */
          }
          sendResponse({ ok: true });
        })
        .catch(() => sendResponse({ ok: false }));
      return true;
    }
    sendResponse({ ok: false });
    return false;
  }
  if (message?.type === 'DO_COMPILE') {
    compile(message.payload)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, error: String(err?.message || err) }));
    return true;
  }
  if (message?.type === 'DO_ACTIVATE') {
    activate(message.id, message.connector)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, error: String(err?.message || err) }));
    return true;
  }
  if (message?.type === 'DO_GET_TEMPLATES') {
    getTemplates()
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, error: String(err?.message || err) }));
    return true;
  }
  if (message?.type === 'DO_GET_API_BASE') {
    chrome.storage.local.get(['doApiBase'], (res) => {
      sendResponse({ apiBase: res.doApiBase || 'http://localhost:3000' });
    });
    return true;
  }
  if (message?.type === 'DO_SET_API_BASE') {
    chrome.storage.local.set({ doApiBase: message.apiBase }, () => sendResponse({ ok: true }));
    return true;
  }
});

async function apiBase() {
  const res = await chrome.storage.local.get(['doApiBase']);
  return res.doApiBase || 'http://localhost:3000';
}

async function compile(payload) {
  const base = await apiBase();
  const res = await fetch(`${base}/api/do/agents/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'compile failed');
  return data;
}

async function activate(id, connector) {
  const base = await apiBase();
  const res = await fetch(`${base}/api/do/agents/${id}/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connector: connector || 'hook-later' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'activate failed');
  return data;
}

async function getTemplates() {
  const base = await apiBase();
  const res = await fetch(`${base}/api/do/templates`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'templates failed');
  return data;
}
