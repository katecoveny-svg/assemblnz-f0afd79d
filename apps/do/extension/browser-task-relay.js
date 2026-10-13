'use strict';
(() => {
  if (globalThis.__doTaskRelay) return;
  globalThis.__doTaskRelay = true;
  const protocol = 'do.browser.connection.v1';
  window.addEventListener('message', event => {
    if (event.source !== window || event.origin !== location.origin || event.data?.protocol !== protocol || event.data?.direction !== 'request' || typeof event.data.requestId !== 'string' || event.data.requestId.length > 50) return;
    const { requestId, command } = event.data;
    chrome.runtime.sendMessage({ type: 'do:browser-page', command }).then(response => {
      window.postMessage({ protocol, direction: 'response', requestId, ...response }, location.origin);
    }).catch(() => window.postMessage({ protocol, direction: 'response', requestId, ok: false, error: 'Companion restarted or disconnected. Reconnect explicitly.' }, location.origin));
  });
})();
