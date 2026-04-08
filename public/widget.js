(function() {
  var agent = window.assemblAgent || 'aura';
  var color = window.assemblColor || '#D4A843';
  var baseUrl = window.assemblBaseUrl || 'https://assembl.co.nz';

  // Create bubble button
  var bubble = document.createElement('div');
  bubble.style.cssText = 'position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:' + color + ';cursor:pointer;z-index:99999;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(0,0,0,0.4), 0 0 20px ' + color + '33;transition:transform 0.2s, box-shadow 0.2s;';
  bubble.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#09090F"/></svg>';
  bubble.onmouseover = function(){ this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 32px rgba(0,0,0,0.5), 0 0 30px ' + color + '55'; };
  bubble.onmouseout = function(){ this.style.transform='scale(1)'; this.style.boxShadow='0 4px 24px rgba(0,0,0,0.4), 0 0 20px ' + color + '33'; };

  // Create iframe container (hidden by default)
  var container = document.createElement('div');
  container.style.cssText = 'position:fixed;bottom:92px;right:24px;width:380px;height:560px;z-index:99998;display:none;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.5), 0 0 60px ' + color + '11;border:1px solid rgba(255,255,255,0.08);';

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/embed/' + agent;
  iframe.style.cssText = 'width:100%;height:100%;border:none;background:#09090F;';
  iframe.allow = 'clipboard-write';
  container.appendChild(iframe);

  // Toggle on click
  var open = false;
  bubble.onclick = function() {
    open = !open;
    container.style.display = open ? 'block' : 'none';
    bubble.innerHTML = open
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#09090F"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#09090F"/></svg>';
  };

  document.body.appendChild(container);
  document.body.appendChild(bubble);
})();
