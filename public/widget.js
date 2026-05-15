(function () {
  'use strict';

  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  if (!script) return;

  var tenant = script.getAttribute('data-tenant');
  if (!tenant) return;

  var kete = script.getAttribute('data-kete') || '';
  var label = script.getAttribute('data-label') || 'Chat';
  var brand = script.getAttribute('data-brand-color') || '#2B6B57';
  var origin = new URL(script.src, window.location.href).origin;
  var id = 'assembl-widget-' + tenant.replace(/[^a-z0-9_-]/gi, '');
  if (document.getElementById(id)) return;

  var open = false;
  var iframeLoaded = false;

  var root = document.createElement('div');
  root.id = id;
  root.setAttribute('data-assembl-widget', tenant);
  root.style.cssText = [
    'position:fixed',
    'right:20px',
    'bottom:20px',
    'z-index:2147483647',
    'font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
  ].join(';');

  var bubble = document.createElement('button');
  bubble.type = 'button';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.style.cssText = [
    'width:58px',
    'height:58px',
    'border-radius:999px',
    'border:0',
    'background:' + brand,
    'color:#FAF7F2',
    'box-shadow:0 16px 40px rgba(35,33,31,.22)',
    'cursor:pointer',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'transition:transform .18s ease, box-shadow .18s ease'
  ].join(';');
  bubble.innerHTML = '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 0 1 17 0Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var panel = document.createElement('div');
  panel.style.cssText = [
    'position:absolute',
    'right:0',
    'bottom:74px',
    'width:min(390px,calc(100vw - 32px))',
    'height:min(650px,calc(100vh - 108px))',
    'border-radius:12px',
    'overflow:hidden',
    'background:transparent',
    'box-shadow:0 24px 70px rgba(35,33,31,.22)',
    'opacity:0',
    'transform:translateY(10px) scale(.98)',
    'pointer-events:none',
    'transition:opacity .18s ease, transform .18s ease'
  ].join(';');

  var frame = document.createElement('iframe');
  frame.title = label;
  frame.loading = 'lazy';
  frame.allow = 'clipboard-write';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.style.cssText = [
    'width:100%',
    'height:100%',
    'border:0',
    'display:block',
    'background:transparent'
  ].join(';');

  var url = origin + '/c/' + encodeURIComponent(tenant) + '/embed';
  if (kete) url += '?kete=' + encodeURIComponent(kete);

  function setOpen(next) {
    open = next;
    if (open && !iframeLoaded) {
      frame.src = url;
      iframeLoaded = true;
    }
    panel.style.opacity = open ? '1' : '0';
    panel.style.transform = open ? 'translateY(0) scale(1)' : 'translateY(10px) scale(.98)';
    panel.style.pointerEvents = open ? 'auto' : 'none';
    bubble.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    window.postMessage({ type: open ? 'assembl:open' : 'assembl:close', tenant: tenant }, '*');
  }

  bubble.addEventListener('mouseenter', function () {
    bubble.style.transform = 'translateY(-1px)';
    bubble.style.boxShadow = '0 18px 46px rgba(35,33,31,.28)';
  });
  bubble.addEventListener('mouseleave', function () {
    bubble.style.transform = 'translateY(0)';
    bubble.style.boxShadow = '0 16px 40px rgba(35,33,31,.22)';
  });
  bubble.addEventListener('click', function () {
    setOpen(!open);
  });

  window.addEventListener('message', function (event) {
    if (!event || !event.data || typeof event.data !== 'object') return;
    if (event.data.type === 'assembl:close') setOpen(false);
    if (event.data.type === 'assembl:resize' && event.data.height) {
      var nextHeight = Math.max(420, Math.min(Number(event.data.height) || 650, window.innerHeight - 108));
      panel.style.height = nextHeight + 'px';
    }
  });

  panel.appendChild(frame);
  root.appendChild(panel);
  root.appendChild(bubble);
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(root);
  });
  if (document.body) document.body.appendChild(root);
})();
