/** The downloadable launcher never reads its host page or starts a task. */
export function doWidgetScript(origin: string): string {
  return `(() => {
  'use strict';
  if (window.assemblDo) return;
  const origin = ${JSON.stringify(origin)};
  const host = document.createElement('div');
  const shadow = host.attachShadow({mode: 'open'});
  const style = document.createElement('style');
  style.textContent = ':host{all:initial}button{font:14px Arial,sans-serif;cursor:pointer}.launch{position:fixed;right:18px;bottom:12px;z-index:2147483000;width:100px;height:84px;border:0;padding:0;background:transparent;filter:drop-shadow(0 0 13px #e0a2ca80);transition:transform .2s}.launch:hover{transform:translateY(-3px)}.launch .spark{display:grid;place-items:center;width:64px;height:64px;margin:auto;border-radius:50%;font-size:43px;color:#fff1ff;background:radial-gradient(circle at 30% 22%,#f6dfff,#b374f5 24%,#792cc6 55%,#2c0d52 83%);box-shadow:inset 0 0 10px #e8b9ff,0 0 17px #b05af7aa,0 0 30px #963be577}.launch{touch-action:none;cursor:grab}.panel{position:fixed;right:20px;bottom:86px;width:min(470px,calc(100vw - 24px));height:min(740px,calc(100dvh - 110px));z-index:2147483001;background:#fffdfb;border:1px solid #916a7070;border-radius:13px;box-shadow:0 12px 60px #240b2150;overflow:hidden}.close{height:36px;width:36px;position:absolute;right:8px;top:8px;border:1px solid #240b2120;background:#fffdfb;border-radius:50%;z-index:2;color:#240b21}.panel iframe{width:100%;height:100%;border:0}button:focus-visible{outline:2px solid #916a70;outline-offset:4px}[hidden]{display:none!important}';
  const launch = document.createElement('button');
  launch.className = 'launch'; launch.type = 'button'; const badge = document.createElement('span'); badge.className='spark'; badge.textContent='✦'; badge.setAttribute('aria-hidden','true'); launch.append(badge);
  launch.setAttribute('aria-label', 'Open DO writing and task widget'); launch.setAttribute('aria-expanded', 'false');
  const panel = document.createElement('section'); panel.className = 'panel'; panel.hidden = true;
  panel.setAttribute('aria-label', 'DO preparation');
  const close = document.createElement('button'); close.className = 'close'; close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', 'Close DO widget');
  const frame = document.createElement('iframe'); frame.title = 'DO by assembl — prepare and review';
  frame.referrerPolicy = 'no-referrer';
  frame.setAttribute('allow', 'clipboard-write');
  frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox');
  let loaded = false; let context = null;
  function offerContext() {
    if (loaded && context) { frame.contentWindow.postMessage({type:'assembl-do:context', text:String(context.text || '').slice(0,12000), title:String(context.title || '').slice(0,160), url:String(context.url || '').slice(0,2000)}, origin); context = null; }
  }
  function open(value) {
    context = value && typeof value === 'object' ? value : null;
    panel.hidden = false; launch.setAttribute('aria-expanded', 'true');
    if (!frame.src) frame.src = origin + '/do/widget'; else offerContext();
    close.focus();
  }
  function hide() { panel.hidden = true; launch.setAttribute('aria-expanded', 'false'); launch.focus(); }
  window.addEventListener('message', event => {
    if (event.source === frame.contentWindow && event.origin === origin && event.data?.type === 'assembl-do:ready') { loaded = true; offerContext(); }
  });
  frame.addEventListener('load', () => { frame.contentWindow.postMessage({type:'assembl-do:hello'}, origin); });
  let dragging = null; let moved = false;
  function place(x,y){launch.style.right='auto';launch.style.bottom='auto';launch.style.left=Math.max(8,Math.min(innerWidth-108,x))+'px';launch.style.top=Math.max(8,Math.min(innerHeight-92,y))+'px';}
  launch.addEventListener('pointerdown',e=>{if(e.button!==0)return;const r=launch.getBoundingClientRect();dragging={x:e.clientX,y:e.clientY,left:r.left,top:r.top};moved=false;launch.setPointerCapture(e.pointerId);});
  launch.addEventListener('pointermove',e=>{if(!dragging)return;if(Math.hypot(e.clientX-dragging.x,e.clientY-dragging.y)>5)moved=true;if(moved)place(dragging.left+e.clientX-dragging.x,dragging.top+e.clientY-dragging.y);});
  launch.addEventListener('pointerup',e=>{dragging=null;if(launch.hasPointerCapture(e.pointerId))launch.releasePointerCapture(e.pointerId);});
  launch.addEventListener('pointercancel',()=>{dragging=null;moved=true;});
  launch.addEventListener('keydown',e=>{if(!e.altKey||!e.key.startsWith('Arrow'))return;e.preventDefault();const r=launch.getBoundingClientRect();place(r.left+(e.key==='ArrowRight'?24:e.key==='ArrowLeft'?-24:0),r.top+(e.key==='ArrowDown'?24:e.key==='ArrowUp'?-24:0));});
  window.addEventListener('resize',()=>{const r=launch.getBoundingClientRect();place(r.left,r.top);});
  launch.addEventListener('click', () => {if(moved){moved=false;return;}panel.hidden ? open(null) : hide();}); close.addEventListener('click', hide);
  shadow.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  panel.append(close, frame); shadow.append(style, launch, panel); document.body.append(host);
  window.assemblDo = Object.freeze({open, close:hide});
})();`;
}

export function doEmbedExample(origin: string): string {
  return `<!doctype html>
<html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DO widget example</title><style>body{font:18px/1.6 Arial,sans-serif;background:#fffdfb;color:#240b21;max-width:660px;padding:8vh 7vw;margin:auto}h1{font-size:42px;font-weight:400;line-height:1.1}code{font-size:13px;background:#f5f1f2;padding:12px;display:block;overflow:auto}button{padding:13px 18px;background:#240b21;color:#fffdfb;border:0;border-radius:5px;cursor:pointer}</style></head><body><h1>A little DO, on your website.</h1><p>Use the DO button to paste text, prepare a draft and review it. The widget does not read this page automatically.</p><p>Add the following before your closing body tag:</p><code>&lt;script src="${origin}/api/do/widget" defer&gt;&lt;/script&gt;</code><script src="${origin}/api/do/widget" defer></script></body></html>`;
}

export const DO_DISTRIBUTION_ORIGIN = 'https://www.assembl.co.nz';
