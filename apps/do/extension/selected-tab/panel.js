const port = chrome.runtime.connect({ name: 'do-selected-tab' });
let imageCapture = false;
const find = id => document.getElementById(id);
port.onMessage.addListener(message => {
  if (message.type === 'status') {
    find('status').textContent = message.status.message;
    find('scope').textContent = message.status.source ? `${message.status.source} · access ends ${new Date(message.status.expiresAt).toLocaleTimeString()}` : '';
    find('capture').disabled = find('capture-image').disabled = message.status.state !== 'ready';
    if (message.status.state !== 'ready') { find('review').hidden = true; find('text').textContent = ''; find('picture').removeAttribute('src'); }
  } else if (message.type === 'evidence') {
    imageCapture = Boolean(message.evidence.data.image); find('picture').hidden = !imageCapture; if(imageCapture) find('picture').src = message.evidence.data.image; find('text').textContent = message.evidence.data.text ?? '';  find('review').hidden = false;
  } else if (message.type === 'attachment') {
    find('conversation').contentWindow.postMessage({ type: imageCapture ? 'assembl-do:selected-image' : 'assembl-do:selected-text', evidence: message.evidence }, 'https://www.assembl.co.nz');
    find('review').hidden = true;
    find('status').textContent = 'Snapshot offered. Review and attach it in the conversation below.';
  }
});
for (const id of ['capture','capture-image','cancel','attach']) find(id).onclick = () => port.postMessage({ type: id === 'attach' && imageCapture ? 'attach-image' : id });
port.onDisconnect.addListener(() => { find('capture').disabled = find('capture-image').disabled = true; find('review').hidden = true; find('status').textContent = 'Connection closed. Activate the toolbar again.'; });
document.addEventListener('visibilitychange', () => { if (document.hidden) { port.postMessage({type:'cancel'}); find('conversation').contentWindow.postMessage({type:'assembl-do:hidden'}, 'https://www.assembl.co.nz'); } });
port.postMessage({ type: 'ready' });
