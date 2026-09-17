'use strict';
/** Shared only by extension-owned pages and its worker. No credentials or page reads. */
(() => {
  const ORIGIN = 'https://www.assembl.co.nz';
  const PATHS = Object.freeze({ workspace: '/do/widget', meeting: '/do/meetings', typesafe: '/do/typesafe' });
  function context(value) {
    if (!value || typeof value !== 'object' || typeof value.text !== 'string') return null;
    const text = value.text.trim().slice(0, 12000);
    if (!text) return null;
    let url = '';
    try {
      const source = new URL(String(value.url || ''));
      if (['https:', 'http:'].includes(source.protocol) && !source.username && !source.password) url = source.origin + source.pathname;
    } catch { /* URL is a label only, never fetched. */ }
    return { text, title: String(value.title || 'Reviewed selection').slice(0, 160), url: url.slice(0, 2000) };
  }
  function destination(mode) { return Object.hasOwn(PATHS, mode) ? ORIGIN + PATHS[mode] : null; }
  function trustedSender(sender, runtime) {
    return sender?.id === runtime.id && ['sidepanel.html', 'popup.html', 'portable.html'].some(name => sender.url === runtime.getURL(name));
  }
  function targetTab(tab) {
    try { const url = new URL(tab.url); return url.origin === ORIGIN && url.pathname === PATHS.workspace; }
    catch { return false; }
  }
  function pending(value, tabId, now = Date.now()) {
    if (!value || value.tabId !== tabId || !Number.isFinite(value.expiresAt) || value.expiresAt <= now) return null;
    return context(value.context);
  }
  globalThis.DoPortableCore = Object.freeze({ ORIGIN, PATHS, context, destination, trustedSender, targetTab, pending });
})();
