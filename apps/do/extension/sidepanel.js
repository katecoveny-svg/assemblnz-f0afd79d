'use strict';
const origin = 'https://www.assembl.co.nz';
const frame = document.getElementById('builder');
const captureButton = document.getElementById('capture');
const status = document.getElementById('status');
let ready = false;
let pending = null;
function offer() {
  if (!ready || !pending) return;
  frame.contentWindow.postMessage({ type: 'assembl-do:context', ...pending }, origin);
  pending = null;
  status.textContent = 'Selection added. Review it in the builder before running a task.';
}
window.addEventListener('message', event => {
  if (event.source !== frame.contentWindow || event.origin !== origin || event.data?.type !== 'assembl-do:ready') return;
  ready = true; offer();
});
frame.addEventListener('load', () => { frame.contentWindow.postMessage({ type: 'assembl-do:hello' }, origin); });
captureButton.addEventListener('click', async () => {
  captureButton.disabled = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !/^https?:\/\//.test(tab.url || '')) throw new Error('Click the DO toolbar icon on this page to grant selection access, or paste your text into the builder.');
    const result = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => {
      const active = document.activeElement;
      if (active?.closest('input,textarea,[contenteditable],[role="textbox"]')) return null;
      const text = String(window.getSelection()?.toString() || '').slice(0, 12000);
      return text.trim() ? { text, title: document.title.slice(0, 160), url: location.origin + location.pathname } : null;
    } });
    if (!result[0]?.result) throw new Error('Select page text first. Message fields and form inputs are not captured; copy and paste those yourself.');
    pending = result[0].result;
    status.textContent = 'Selection captured on this device. Waiting for the builder…';
    offer();
  } catch (e) { status.textContent = e instanceof Error ? e.message : 'Selection access is unavailable. Paste the text into the builder.'; }
  finally { captureButton.disabled = false; }
});

document.getElementById('float').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    if (!tab?.id || !/^https?:\/\//.test(tab.url || '')) throw new Error('Click DO’s toolbar icon on a normal webpage first. Browser settings and PDF viewer pages may block extensions.');
    await chrome.scripting.executeScript({target:{tabId:tab.id},files:['floating.js']});
    status.textContent = 'DO is on this page. Drag the purple orb, or focus it and use arrow keys. Click it to reopen this panel.';
  } catch(e) { status.textContent = e instanceof Error ? e.message : 'Could not place DO. Click its toolbar icon on this tab and try again.'; }
});
