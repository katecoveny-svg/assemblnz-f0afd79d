(() => {
  'use strict';
  // Lights the toolbar when the user has selected page text.
  // Does not send the selection anywhere — only a presence signal.
  if (globalThis.__assemblDoSelectionBadge) return;
  globalThis.__assemblDoSelectionBadge = true;

  let last = false;
  function report() {
    try {
      const active = document.activeElement;
      if (active?.closest('input,textarea,[contenteditable],[role="textbox"]')) {
        if (last) {
          last = false;
          chrome.runtime.sendMessage({ type: 'do:selection-presence', hasSelection: false });
        }
        return;
      }
      const text = String(window.getSelection()?.toString() || '').trim();
      const has = text.length > 0;
      if (has === last) return;
      last = has;
      chrome.runtime.sendMessage({ type: 'do:selection-presence', hasSelection: has });
    } catch {
      /* ignore */
    }
  }

  document.addEventListener('selectionchange', report, { passive: true });
  window.addEventListener('focus', report, { passive: true });
  report();
})();
