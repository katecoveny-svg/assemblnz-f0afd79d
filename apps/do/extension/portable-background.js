'use strict';
/** First-party browser windows reuse the browser's Assembl session. No token/CORS bridge. */
importScripts('portable-core.js');
(() => {
  const core = globalThis.DoPortableCore;
  const KEY = 'doPortablePendingContextV1';
  const delivering = new Set();
  const allowed = new Set(['workspace', 'meeting', 'typesafe']);
  async function offer(tabId) {
    if (delivering.has(tabId)) return;
    delivering.add(tabId);
    try {
      const stored = (await chrome.storage.session.get(KEY))[KEY];
      if (!stored || stored.tabId !== tabId) return;
      const payload = core.pending(stored, tabId);
      if (!payload) { await chrome.storage.session.remove(KEY); return; }
      const tab = await chrome.tabs.get(tabId);
      if (tab.status !== 'complete') return;
      // Discard instead of following a redirect into another page/account surface.
      await chrome.storage.session.remove(KEY);
      if (!core.targetTab(tab)) return;
      await chrome.scripting.executeScript({
        target: { tabId },
        args: [payload, core.ORIGIN],
        func: (context, origin) => {
          if (location.origin !== origin || location.pathname !== '/do/widget') return;
          let timer;
          const receive = event => {
            if (event.source !== window || event.origin !== origin || event.data?.type !== 'assembl-do:ready') return;
            window.removeEventListener('message', receive);
            clearTimeout(timer);
            window.postMessage({ type: 'assembl-do:context', ...context }, origin);
          };
          window.addEventListener('message', receive);
          timer = setTimeout(() => window.removeEventListener('message', receive), 5000);
          // Covers both a hydrated app and an app that becomes ready after injection.
          window.postMessage({ type: 'assembl-do:hello' }, origin);
        },
      });
    } catch { /* The user still has the source. No model or external action is invoked. */ }
    finally { delivering.delete(tabId); }
  }
  async function selection() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !/^https?:\/\//.test(tab.url || '')) throw new Error('Open a webpage and select the text you want to bring into DO.');
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const chosen = window.getSelection();
        const editable = 'input,textarea,[contenteditable],[role="textbox"]';
        if (document.activeElement?.closest(editable) || !chosen?.rangeCount) return null;
        // Refuse selections touching form/editable regions, not just password fields.
        for (let i = 0; i < chosen.rangeCount; i++) {
          const range = chosen.getRangeAt(i);
          for (const node of document.querySelectorAll(editable)) {
            if (range.intersectsNode(node)) return null;
          }
        }
        return { text: chosen.toString().slice(0, 12000), title: document.title.slice(0, 160), url: location.origin + location.pathname };
      },
    });
    const result = core.context(results[0]?.result);
    if (!result) throw new Error('Select ordinary page text first. Copy sensitive message or form text yourself, then review it in DO.');
    return result;
  }
  async function open(message) {
    if (!allowed.has(message.mode) || (message.withSelection !== undefined && typeof message.withSelection !== 'boolean')) throw new Error('Choose a supported DO workspace.');
    if (message.withSelection && message.mode !== 'workspace') throw new Error('Selection handoff is available only to the draft workspace.');
    const payload = message.withSelection ? await selection() : null;
    const created = await chrome.windows.create({ url: core.destination(message.mode), type: 'popup', width: 900, height: 820, focused: true });
    const tabId = created.tabs?.[0]?.id;
    if (payload && typeof tabId === 'number') {
      // Only one queued handoff, browser-memory storage, never local/sync storage.
      // Valid for 60 seconds; removed on consumption, tab close, next stale check or browser restart.
      await chrome.storage.session.set({ [KEY]: { tabId, expiresAt: Date.now() + 60000, context: payload } });
      await offer(tabId);
    }
    return { ok: true, opened: true, contextQueued: Boolean(payload && typeof tabId === 'number') };
  }
  chrome.runtime.onMessage.addListener((message, sender, reply) => {
    if (message?.type !== 'do:portable-open') return false;
    if (!core.trustedSender(sender, chrome.runtime)) { reply({ ok: false, error: 'Open this control from the DO extension.' }); return false; }
    open(message).then(reply).catch(error => reply({ ok: false, error: error instanceof Error ? error.message : 'The companion window could not open.' }));
    return true;
  });
  chrome.tabs.onUpdated.addListener((tabId, change) => { if (change.status === 'complete') void offer(tabId); });
  chrome.tabs.onRemoved.addListener(tabId => {
    void chrome.storage.session.get(KEY).then(stored => {
      if (stored[KEY]?.tabId === tabId) return chrome.storage.session.remove(KEY);
    }).catch(() => {});
  });
})();
