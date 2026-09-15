(() => {
  'use strict';
  if (globalThis.__assemblDoFloating) return;
  globalThis.__assemblDoFloating = true;
  const host = document.createElement('div');
  const root = host.attachShadow({mode:'closed'});
  const style = document.createElement('style');
  style.textContent = ':host{all:initial}.wrap{position:fixed;right:24px;top:90px;z-index:2147483646;width:78px;font:12px Arial,sans-serif}.orb{width:68px;height:68px;border:0;border-radius:50%;cursor:grab;touch-action:none;background:radial-gradient(circle at 30% 22%,#f7dcff,#b570ff 22%,#792bcb 52%,#290d58 83%);box-shadow:inset 0 0 12px #e8b9ff,0 0 15px #b76bffaa,0 0 34px #9540ed77;position:relative;color:white}.orb:active{cursor:grabbing}.orb:before{content:"";position:absolute;inset:20%;background:#fff1ff;clip-path:polygon(50% 0,61% 36%,100% 50%,61% 62%,50% 100%,38% 62%,0 50%,38% 36%);transform:rotate(12deg)}.orb:after{content:"";position:absolute;right:4px;top:3px;width:7px;height:7px;border-radius:50%;background:white;box-shadow:0 0 10px white}.label{display:block;background:#2b1048;color:white;padding:4px;border-radius:9px;text-align:center;pointer-events:none}.close{position:absolute;right:-9px;top:-10px;width:24px;height:24px;border-radius:50%;border:1px solid #bb8de1;background:#fff;color:#381653;cursor:pointer}.notice{position:absolute;right:0;top:90px;width:190px;padding:10px;background:#fff;color:#381653;border-radius:10px;box-shadow:0 4px 20px #0003}.notice:empty{display:none}button:focus-visible{outline:3px solid #dbacff;outline-offset:4px}';
  const wrap = document.createElement('div'); wrap.className = 'wrap';
  const orb = document.createElement('button'); orb.className = 'orb'; orb.type = 'button'; orb.setAttribute('aria-label','Open DO. Drag to move, or use arrow keys.');
  const label = document.createElement('span'); label.className = 'label'; label.textContent = 'DO';
  const close = document.createElement('button'); close.className = 'close'; close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label','Remove floating DO from this page');
  const notice = document.createElement('div'); notice.className = 'notice'; notice.setAttribute('role','status');
  function place(x,y) { wrap.style.right = 'auto'; wrap.style.left = Math.max(8,Math.min(innerWidth-92,x))+'px'; wrap.style.top = Math.max(18,Math.min(innerHeight-110,y))+'px'; }
  let drag = null; let suppress = false;
  orb.addEventListener('pointerdown', e => { if (e.button !== 0) return; const r=wrap.getBoundingClientRect(); drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top}; suppress=false; orb.setPointerCapture(e.pointerId); });
  orb.addEventListener('pointermove', e => { if (!drag) return; if (Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>5) suppress=true; if(suppress) place(drag.left+e.clientX-drag.x,drag.top+e.clientY-drag.y); });
  orb.addEventListener('pointerup', e => { drag=null; if(orb.hasPointerCapture(e.pointerId))orb.releasePointerCapture(e.pointerId); });
  orb.addEventListener('pointercancel', () => { drag=null; suppress=true; });
  orb.addEventListener('keydown', e => { if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return; e.preventDefault(); const r=wrap.getBoundingClientRect();place(r.left+(e.key==='ArrowRight'?24:e.key==='ArrowLeft'?-24:0),r.top+(e.key==='ArrowDown'?24:e.key==='ArrowUp'?-24:0)); });
  orb.addEventListener('click', () => { if(suppress){suppress=false;return;} chrome.runtime.sendMessage({type:'do:open-panel'}, response => { const error=chrome.runtime.lastError; notice.textContent = error || !response?.ok ? 'Open DO using its pinned browser toolbar icon.' : ''; }); });
  function resize(){const r=wrap.getBoundingClientRect();place(r.left,r.top);}
  window.addEventListener('resize',resize);
  close.addEventListener('click',()=>{window.removeEventListener('resize',resize);host.remove();globalThis.__assemblDoFloating=false;});
  wrap.append(orb,label,close,notice); root.append(style,wrap); document.documentElement.append(host);
})();
