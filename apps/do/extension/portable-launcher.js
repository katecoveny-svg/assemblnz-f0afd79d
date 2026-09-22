'use strict';
(() => {
  const status = document.getElementById('portable-status');
  const buttons = [...document.querySelectorAll('[data-portable-mode]')];
  const place = document.getElementById('place-do');
  place.addEventListener('click', async () => {
    place.disabled = true;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !/^https?:\/\//.test(tab.url || '')) throw new Error('Open a webpage first. Chrome settings and the web store do not allow a floating companion.');
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['floating.js'] });
      status.textContent = 'DO is on this tab. Drag the glowing D, then open it and choose Point at an area. Nothing has been captured.';
    } catch (error) { status.textContent = error instanceof Error ? error.message : 'This page does not allow DO. Open a separate DO workspace instead.'; }
    finally { place.disabled = false; }
  });
  for (const button of buttons) button.addEventListener('click', async () => {
    buttons.forEach(item => { item.disabled = true; });
    status.textContent = 'Opening your DO window…';
    try {
      const response = await chrome.runtime.sendMessage({ type: 'do:portable-open', mode: button.dataset.portableMode, withSelection: button.dataset.portableSelection === 'true' });
      if (!response?.ok) throw new Error(response?.error || 'The companion could not open. Reload the extension and try again.');
      status.textContent = response.contextQueued
        ? 'Window opened. Check that your selection reached the editor, then approve any provider use. No task has started.'
        : 'Window opened. Sign in there as needed. Microphone and screen access still require your permission.';
    } catch (error) { status.textContent = error instanceof Error ? error.message : 'The companion could not open.'; }
    finally { buttons.forEach(item => { item.disabled = false; }); }
  });
})();
