(function() {
  // Defaults align with the Mārama Whenua brand: Soft Gold #D9BC7A bubble,
  // Mist #F7F3EE iframe surface, soft taupe shadows. The default agent is
  // 'concierge' — the dedicated Assembl knowledge agent.
  var agent = window.assemblAgent || 'concierge';
  var color = window.assemblColor || '#D9BC7A';
  var baseUrl = window.assemblBaseUrl || 'https://assembl.co.nz';

  var SOFT_SHADOW = '0 8px 30px rgba(111,97,88,0.18), 0 2px 8px rgba(111,97,88,0.10)';
  var SOFT_SHADOW_HOVER = '0 12px 40px rgba(111,97,88,0.24), 0 0 0 6px ' + color + '22';
  var PANEL_SHADOW = '0 16px 48px rgba(111,97,88,0.18), 0 4px 16px rgba(111,97,88,0.10)';
  var SOFT_BORDER = '1px solid rgba(142,129,119,0.18)';
  var MIST = '#F7F3EE';

  // Bubble button — Soft Gold on Mist, no neon glow
  var bubble = document.createElement('div');
  bubble.style.cssText = 'position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:' + color + ';cursor:pointer;z-index:99999;display:flex;align-items:center;justify-content:center;box-shadow:' + SOFT_SHADOW + ';transition:transform 0.2s ease, box-shadow 0.2s ease;';
  bubble.innerHTML = '<img src="' + baseUrl + '/toroa-mark.svg" width="32" height="32" alt="Assembl" style="border-radius:50%;" />';
  bubble.onmouseover = function(){ this.style.transform='scale(1.05)'; this.style.boxShadow=SOFT_SHADOW_HOVER; };
  bubble.onmouseout = function(){ this.style.transform='scale(1)'; this.style.boxShadow=SOFT_SHADOW; };

  // Iframe container — Mist surface, soft taupe border, no dark backgrounds
  var container = document.createElement('div');
  container.style.cssText = 'position:fixed;bottom:92px;right:24px;width:380px;height:560px;z-index:99998;display:none;border-radius:24px;overflow:hidden;box-shadow:' + PANEL_SHADOW + ';border:' + SOFT_BORDER + ';background:' + MIST + ';';

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/embed/' + agent;
  iframe.style.cssText = 'width:100%;height:100%;border:none;background:' + MIST + ';';
  iframe.allow = 'clipboard-write';
  container.appendChild(iframe);

  // Toggle on click
  var open = false;
  bubble.onclick = function() {
    open = !open;
    container.style.display = open ? 'block' : 'none';
    bubble.innerHTML = open
       ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#6F6158"/></svg>'
       : '<img src="' + baseUrl + '/toroa-mark.svg" width="32" height="32" alt="Assembl" style="border-radius:50%;" />';
  };

  document.body.appendChild(container);
  document.body.appendChild(bubble);
})();
