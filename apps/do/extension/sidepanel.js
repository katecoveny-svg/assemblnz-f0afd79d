'use strict';

const PRODUCTION_ORIGIN = 'https://www.assembl.co.nz';
const frame = document.getElementById('builder');
const captureButton = document.getElementById('capture');
const status = document.getElementById('status');
const seatStatus = document.getElementById('seat-status');
const doIdInput = document.getElementById('do-id');
const sessionKeyInput = document.getElementById('session-key');
const openUrlInput = document.getElementById('open-url');
const apiOriginSelect = document.getElementById('api-origin');
const seatConsent = document.getElementById('seat-consent');
const seatShot = document.getElementById('seat-shot');
const seatLearn = document.getElementById('seat-learn');
const playbookLabel = document.getElementById('playbook-label');

let ready = false;
let pending = null;
let apiOrigin = PRODUCTION_ORIGIN;

function syncFrame() {
  frame.src = `${apiOrigin}/do/widget`;
}

function offer() {
  if (!ready || !pending) return;
  frame.contentWindow.postMessage({ type: 'assembl-do:context', ...pending }, apiOrigin);
  pending = null;
  status.textContent = 'Selection added. Review it in the builder before running a task.';
}

chrome.storage.local.get(['doBrowserSeat', 'doApiOrigin'], (stored) => {
  if (stored.doApiOrigin) {
    apiOrigin = stored.doApiOrigin;
    apiOriginSelect.value = stored.doApiOrigin;
    syncFrame();
  }
  if (stored.doBrowserSeat?.doId) {
    doIdInput.value = stored.doBrowserSeat.doId;
    sessionKeyInput.value = stored.doBrowserSeat.sessionKey || `do-browser-seat:${stored.doBrowserSeat.doId}`;
  }
});

apiOriginSelect.addEventListener('change', () => {
  apiOrigin = apiOriginSelect.value;
  chrome.storage.local.set({ doApiOrigin: apiOrigin });
  ready = false;
  syncFrame();
});

doIdInput.addEventListener('change', () => {
  const doId = doIdInput.value.trim();
  if (!sessionKeyInput.value.trim() && doId) {
    sessionKeyInput.value = `do-browser-seat:${doId}`;
  }
  chrome.storage.local.set({
    doBrowserSeat: { doId, sessionKey: sessionKeyInput.value.trim() },
  });
});

sessionKeyInput.addEventListener('change', () => {
  chrome.storage.local.set({
    doBrowserSeat: { doId: doIdInput.value.trim(), sessionKey: sessionKeyInput.value.trim() },
  });
});

window.addEventListener('message', (event) => {
  if (event.source !== frame.contentWindow || event.origin !== apiOrigin || event.data?.type !== 'assembl-do:ready') return;
  ready = true;
  offer();
});

frame.addEventListener('load', () => {
  try {
    frame.contentWindow.postMessage({ type: 'assembl-do:hello' }, apiOrigin);
  } catch {
    /* ignore */
  }
});

captureButton.addEventListener('click', async () => {
  captureButton.disabled = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !/^https?:\/\//.test(tab.url || '')) {
      throw new Error('Click the DO toolbar icon on this page to grant selection access, or paste your text into the builder.');
    }
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const active = document.activeElement;
        if (active?.closest('input,textarea,[contenteditable],[role="textbox"]')) return null;
        const text = String(window.getSelection()?.toString() || '').slice(0, 12000);
        return text.trim()
          ? { text, title: document.title.slice(0, 160), url: location.origin + location.pathname }
          : null;
      },
    });
    if (!result[0]?.result) {
      throw new Error('Select page text first. Message fields and form inputs are not captured; copy and paste those yourself.');
    }
    pending = result[0].result;
    status.textContent = 'Selection captured on this device. Waiting for the builder…';
    offer();
  } catch (e) {
    status.textContent = e instanceof Error ? e.message : 'Selection access is unavailable. Paste the text into the builder.';
  } finally {
    captureButton.disabled = false;
  }
});

document.getElementById('float').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !/^https?:\/\//.test(tab.url || '')) {
      throw new Error('Click DO’s toolbar icon on a normal webpage first. Browser settings and PDF viewer pages may block extensions.');
    }
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['floating.js'] });
    status.textContent = 'DO is on this page. Drag the purple orb, or focus it and use arrow keys. Click it to reopen this panel. Dragging does not share the screen.';
  } catch (e) {
    status.textContent = e instanceof Error ? e.message : 'Could not place DO. Click its toolbar icon on this tab and try again.';
  }
});

document.getElementById('open-url-btn').addEventListener('click', async () => {
  const url = openUrlInput.value.trim();
  if (!/^https:\/\//.test(url)) {
    seatStatus.textContent = 'Enter an https URL to open for this DO.';
    return;
  }
  const response = await chrome.runtime.sendMessage({ type: 'do:open-url-for-do', url });
  seatStatus.textContent = response?.ok
    ? 'Opened URL in a new tab. Review it, then capture with consent.'
    : (response?.error || 'Could not open URL.');
});

document.getElementById('seat-capture').addEventListener('click', async () => {
  const button = document.getElementById('seat-capture');
  button.disabled = true;
  try {
    if (!seatConsent.checked) throw new Error('Tick the consent checkbox before capturing.');
    const doId = doIdInput.value.trim();
    const sessionKey = sessionKeyInput.value.trim();
    if (!/^[0-9a-f-]{36}$/i.test(doId)) throw new Error('Paste the DO id UUID from /do/household after install.');
    if (sessionKey !== `do-browser-seat:${doId}`) {
      throw new Error('Session key must be do-browser-seat:<do-id> for this DO.');
    }

    const capture = await chrome.runtime.sendMessage({
      type: 'do:browser-seat-capture',
      includeScreenshot: seatShot.checked,
    });
    if (!capture?.ok) throw new Error(capture?.error || 'Capture failed.');

    const body = {
      doId,
      sessionKey,
      consent: true,
      consentScope: 'session',
      url: capture.page.url,
      title: capture.page.title,
      pageText: capture.page.pageText,
      learnMode: seatLearn.checked || undefined,
      playbookLabel: seatLearn.checked ? (playbookLabel.value.trim() || undefined) : undefined,
    };
    if (capture.page.screenshotBase64 && capture.page.screenshotMimeType) {
      body.screenshotBase64 = capture.page.screenshotBase64;
      body.screenshotMimeType = capture.page.screenshotMimeType;
    }

    const response = await fetch(`${apiOrigin}/api/do/browser-seat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Browser seat API refused the capture.');

    chrome.storage.local.set({ doBrowserSeat: { doId, sessionKey } });
    seatStatus.textContent = data.honesty
      || `Receipt ${data.receipt?.id || ''} saved. Review on Household Floor Needs you. Nothing was submitted.`;
  } catch (e) {
    seatStatus.textContent = e instanceof Error ? e.message : 'Browser seat capture failed.';
  } finally {
    button.disabled = false;
  }
});
