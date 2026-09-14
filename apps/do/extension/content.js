/**
 * DO content script — floating ✦ make agent + page capture.
 */

(() => {
  if (window.__doAgentOsInjected) return;
  window.__doAgentOsInjected = true;

  const PAGE_TEXT_MAX = 3500;

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
  });

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'DO make agent');
  btn.textContent = '✦';
  Object.assign(btn.style, {
    position: 'fixed',
    right: '18px',
    bottom: '18px',
    zIndex: '2147483646',
    width: '48px',
    height: '48px',
    borderRadius: '999px',
    border: 'none',
    background: '#240B21',
    color: '#FFFDFB',
    fontSize: '20px',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(36,11,33,0.28)',
    fontFamily: 'system-ui, sans-serif',
  });

  btn.addEventListener('click', () => {
    // Open the extension UI (side panel / popup) by messaging the SW;
    // chrome.sidePanel.open must be called from a user gesture in the SW.
    chrome.runtime.sendMessage({ type: 'DO_OPEN_PANEL', page: capture() });
  });

  document.documentElement.appendChild(btn);
})();
