/* Source-only candidate. No page message can create a toolbar grant. */
importScripts('selected-tab-host.js');
const { SelectedTabExtension, documentUrl, workspaceOwner, selectedText } = DoSelectedTab;
let panel = null;
let pending = null;
const show = status => { if (!panel) throw new Error('Open the DO panel.'); panel.postMessage({ type: 'status', status }); };
const one = rows => { if (rows.length !== 1 || rows[0].frameId !== 0 || !rows[0].documentId || rows[0].error) throw new Error('Document unavailable.'); return rows[0]; };
const browserPort = {
  active: async () => (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0] ?? null,
  identify: async tabId => {
    const tab = await chrome.tabs.get(tabId);
    const row = one(await chrome.scripting.executeScript({ target: { tabId, frameIds: [0] }, func: documentUrl }));
    if (typeof row.result !== 'string' || row.result !== tab.url) throw new Error('Page changed.');
    return { tabId, documentId: row.documentId, url: row.result };
  },
  owner: async workspace => {
    const row = one(await chrome.scripting.executeScript({ target: { tabId: workspace.tabId, documentIds: [workspace.documentId] }, func: workspaceOwner }));
    return row.documentId === workspace.documentId ? row.result : null;
  },
  read: async (target, format) => {
    if (format === 'image') {
      const tab = await chrome.tabs.get(target.tabId);
      return {image: await chrome.tabs.captureVisibleTab(tab.windowId, {format:'jpeg',quality:80}), completeness:'partial'};
    }
    const row = one(await chrome.scripting.executeScript({ target: { tabId: target.tabId, documentIds: [target.documentId] }, func: selectedText }));
    if (row.documentId !== target.documentId) throw new Error('Page changed.');
    return row.result;
  }, show,
};
const host = new SelectedTabExtension(browserPort);
const imageHost = new SelectedTabExtension(browserPort, Date.now, 'image');
const cancel = tabId => { for (const reader of [host,imageHost]) try { reader.invalidate(tabId); } catch { /* Grant cleared even without panel. */ } };
const fail = () => { cancel(); if (panel) show({ state: 'unavailable', message: 'Unavailable. Sign in to DO, select page text and activate the toolbar again.' }); };
async function activate() { const tab = pending; pending = null; if (tab && panel) try { await host.toolbar(tab); await imageHost.toolbar(tab); } catch { fail(); } }
chrome.action.onClicked.addListener(tab => {
  cancel(); pending = tab;
  // Browser gesture is consumed synchronously, before any asynchronous checks.
  chrome.sidePanel.open({ tabId: tab.id }).catch(fail);
  if (panel) void activate();
});
chrome.runtime.onConnect.addListener(port => {
  if (port.name !== 'do-selected-tab' || port.sender?.id !== chrome.runtime.id || port.sender?.url !== chrome.runtime.getURL('panel.html')) { port.disconnect(); return; }
  if (panel) { cancel(); panel.disconnect(); }
  panel = port;
  port.onDisconnect.addListener(() => { if (panel === port) { cancel(); panel = null; pending = null; } });
  port.onMessage.addListener(async message => {
    if (panel !== port) return;
    try {
      if (message?.type === 'ready') await activate();
      else if (message?.type === 'cancel') cancel();
      else if (message?.type === 'capture') port.postMessage({ type: 'evidence', evidence: await host.capture() });
      else if (message?.type === 'capture-image') port.postMessage({ type: 'evidence', evidence: await imageHost.capture() });
      else if (message?.type === 'attach-image') port.postMessage({ type: 'attachment', evidence: await imageHost.attach() });
      else if (message?.type === 'attach') port.postMessage({ type: 'attachment', evidence: await host.attach() });
      // Unknown messages, including page-supplied scripts or activation, are ignored.
    } catch { fail(); }
  });
});
chrome.tabs.onActivated.addListener(() => { pending = null; cancel(); });
chrome.tabs.onUpdated.addListener((id, change) => { if (change.status === 'loading' || change.url) cancel(id); });
chrome.tabs.onRemoved.addListener(id => cancel(id));
chrome.windows.onFocusChanged.addListener(() => { pending = null; cancel(); });
