'use strict';
(() => {
  const status = document.getElementById('portable-status');
  const buttons = [...document.querySelectorAll('[data-portable-mode]')];
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
