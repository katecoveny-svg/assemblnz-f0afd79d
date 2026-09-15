'use strict';
const API_ORIGIN = 'https://www.assembl.co.nz';
const byId = id => document.getElementById(id);
const source = byId('source');
const consent = byId('consent');
let sourceTitle = 'Pasted text';
let sourceUrl = '';
let draft = null;
let request = null;
function status(message) { byId('status').textContent = message; byId('status').hidden = !message; }
function invalidateConsent() { consent.checked = false; }
source.addEventListener('input', invalidateConsent);
byId('brief').addEventListener('input', invalidateConsent);
byId('task').addEventListener('change', invalidateConsent);

async function capture(fullPage) {
  if (request) return;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !/^https?:\/\//.test(tab.url || '')) throw new Error('Choose text on a regular web page, or paste it here.');
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id }, args: [fullPage],
      func: function (includePage) {
        // Called only by the capture button. Form field values are never captured.
        const active = document.activeElement;
        const editable = active?.closest('input,textarea,[contenteditable="true"],[role="textbox"]');
        let text = editable ? '' : String(window.getSelection()?.toString() || '');
        if (includePage) {
          const root = document.querySelector('main') || document.body;
          const parts = [];
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          let node, size = 0;
          while ((node = walker.nextNode()) && size < 12000) {
            const element = node.parentElement;
            if (!element || element.closest('script,style,noscript,input,textarea,select,[contenteditable="true"],[role="textbox"],[hidden],[aria-hidden="true"]')) continue;
            const style = getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden' || !element.getClientRects().length) continue;
            const value = (node.textContent || '').trim();
            if (value) { parts.push(value); size += value.length + 1; }
          }
          text = parts.join('\n');
        }
        return { text: text.slice(0, 12000), title: document.title.slice(0, 160), url: location.origin + location.pathname };
      },
    });
    const context = results[0]?.result;
    if (!context?.text?.trim()) throw new Error(fullPage ? 'No readable page text found. Paste the part you want to use.' : 'Select some page text first, or paste it here. Text in form fields is not captured.');
    source.value = context.text; sourceTitle = context.title || 'Captured page'; sourceUrl = context.url;
    byId('sourceLabel').textContent = sourceTitle + ' · ' + source.value.length.toLocaleString() + ' characters';
    invalidateConsent(); status('Text captured on this device. Review it before choosing to prepare.');
  } catch (error) { status(error.message || 'This page cannot be captured. Paste the text instead.'); }
}
byId('captureSelection').addEventListener('click', () => capture(false));
byId('capturePage').addEventListener('click', () => capture(true));
byId('prepareForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (!source.value.trim() || !consent.checked || request) return;
  request = new AbortController(); byId('prepare').disabled = true; byId('stop').hidden = false;
  source.disabled = true; byId('task').disabled = true; byId('brief').disabled = true; consent.disabled = true;
  status('Preparing your draft…');
  try {
    const response = await fetch(API_ORIGIN + '/api/do/prepare', {
      method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, signal: request.signal,
      body: JSON.stringify({ task: byId('task').value, source: source.value, brief: byId('brief').value, sourceTitle, sourceUrl, consent: true }),
    });
    const data = await response.json();
    if (!response.ok || !data.draft) throw new Error(data.message || 'DO could not prepare this draft.');
    draft = data.draft; byId('output').value = draft.text; byId('reviewer').value = ''; byId('reviewer').disabled = false; byId('review').disabled = false;
    byId('result').hidden = false;
    byId('method').textContent = draft.evidence.method === 'model' ? 'Generated with ' + draft.evidence.model : 'Exact text extraction · no model';
    status('Draft prepared. Check and edit it before using it.');
  } catch (error) { status(error.name === 'AbortError' ? 'Preparation stopped. Your text is still here.' : error.message || 'Preparation failed. Your text is still here.'); }
  finally {
    request = null; byId('prepare').disabled = false; byId('stop').hidden = true;
    source.disabled = false; byId('task').disabled = false; byId('brief').disabled = false; consent.disabled = false;
  }
});
byId('stop').addEventListener('click', () => request?.abort());
byId('output').addEventListener('input', () => {
  if (!draft) return;
  draft.text = byId('output').value; draft.status = 'draft';
  delete draft.reviewedAt; delete draft.reviewer; delete draft.reviewedTextHash;
  byId('review').disabled = false; byId('reviewer').disabled = false;
});
byId('review').addEventListener('click', async () => {
  if (!draft) return;
  const reviewer = byId('reviewer').value.trim();
  if (!reviewer) { status('Add the person or team reviewing this draft.'); return; }
  if (!draft.text.trim()) { status('Add draft text before recording a review.'); return; }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(draft.text));
  draft.reviewedTextHash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  draft.status = 'reviewed'; draft.reviewedAt = new Date().toISOString(); draft.reviewer = reviewer;
  byId('review').disabled = true; byId('reviewer').disabled = true; status('Review recorded. You can copy or download the draft for your next step.');
});
byId('copy').addEventListener('click', async () => {
  if (!draft) return;
  try { await navigator.clipboard.writeText(draft.text); status('Draft copied.'); }
  catch { status('Copy is unavailable. Download the draft instead.'); }
});
byId('download').addEventListener('click', () => {
  if (!draft) return;
  const text = '# ' + draft.title + '\n\n' + draft.text + '\n\n## Evidence receipt\n\n```json\n' + JSON.stringify(draft, null, 2) + '\n```\n';
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'do-' + draft.id.slice(0, 8) + '.md'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000); status('Draft and receipt downloaded.');
});

byId('openBuilder').addEventListener('click', async () => {
  try {
    const text = [byId('brief').value, source.value].filter(Boolean).join('\n\n');
    if (text) await navigator.clipboard.writeText(text);
    await chrome.tabs.create({ url: API_ORIGIN + '/do?open=1' });
    status(text ? 'Inputs copied. Paste them into your agent’s ingredients in the visual builder.' : 'Visual builder opened.');
  } catch { status('Open assembl.co.nz/do and paste your inputs into the visual builder.'); }
});
