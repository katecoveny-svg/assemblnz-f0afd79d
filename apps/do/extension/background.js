'use strict';
// Configures the side panel, toolbar presence, and per-DO browser-seat captures.
// Never sends forms, pays, or submits. Dragging the floating D-mark shares nothing.

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

const BADGE = { text: '1', color: '#916A70' };

async function setSelectionBadge(tabId, hasSelection) {
  try {
    if (hasSelection) {
      await chrome.action.setBadgeText({ tabId, text: BADGE.text });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE.color });
      await chrome.action.setTitle({
        tabId,
        title: 'DO — selection ready. Click to help with this page',
      });
    } else {
      await chrome.action.setBadgeText({ tabId, text: '' });
      await chrome.action.setTitle({ tabId, title: 'Open DO — help with this page' });
    }
  } catch {
    /* Tab may have closed. */
  }
}

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id) return false;

  if (message?.type === 'do:selection-presence' && sender.tab?.id) {
    void setSelectionBadge(sender.tab.id, Boolean(message.hasSelection));
    return false;
  }

  if (message?.type === 'do:open-panel' && sender.tab?.id) {
    chrome.sidePanel.open({ tabId: sender.tab.id }).then(() => reply({ ok: true })).catch(() => reply({ ok: false }));
    return true;
  }

  if (message?.type === 'do:browser-seat-capture') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id || !/^https?:\/\//.test(tab.url || '')) {
          throw new Error('Open a normal webpage first, then capture.');
        }

        const [{ result: page }] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const text = String(document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 12000);
            return {
              url: location.href,
              title: String(document.title || 'Untitled').slice(0, 200),
              pageText: text || '(no visible text)',
            };
          },
        });

        let screenshotBase64;
        let screenshotMimeType;
        if (message.includeScreenshot) {
          const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
          const match = /^data:(image\/png);base64,(.+)$/.exec(dataUrl || '');
          if (match) {
            screenshotMimeType = match[1];
            screenshotBase64 = match[2];
          }
        }

        reply({
          ok: true,
          page: {
            ...page,
            screenshotBase64,
            screenshotMimeType,
          },
        });
      } catch (error) {
        reply({ ok: false, error: error instanceof Error ? error.message : 'Capture failed.' });
      }
    })();
    return true;
  }

  if (message?.type === 'do:open-url-for-do' && typeof message.url === 'string') {
    chrome.tabs.create({ url: message.url }).then(() => reply({ ok: true })).catch((error) => {
      reply({ ok: false, error: error instanceof Error ? error.message : 'Could not open URL.' });
    });
    return true;
  }

  return false;
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  // Clear stale badge titles when switching tabs; content script re-reports.
  void setSelectionBadge(tabId, false);
});
