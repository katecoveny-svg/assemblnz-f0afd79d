/** Portable launcher. Host context is opt-in; neither dragging nor opening starts a task. */
export function doWidgetScript(origin: string): string {
  const url = new URL(origin);
  if (!['https:', 'http:'].includes(url.protocol) || url.origin !== origin) throw new Error('Expected an HTTP(S) origin');
  return `(() => {
  'use strict';
  if (window.assemblDo) return;
  const origin = ${JSON.stringify(origin)};
  const host = document.createElement('div');
  const shadow = host.attachShadow({mode: 'open'});
  const style = document.createElement('style');
  style.textContent = ":host{all:initial}button,a{font:13px 'Instrument Sans',ui-sans-serif,system-ui,sans-serif}button{cursor:pointer}.launch{position:fixed;right:18px;bottom:12px;z-index:2147483000;width:100px;height:84px;border:0;padding:0;background:transparent;touch-action:none;cursor:grab}.spark{display:grid;place-items:center;width:66px;height:66px;margin:auto;border-radius:22px;color:#FFFDFB;background:radial-gradient(ellipse at 25% 15%,#916A70,#654A4E 42%,#240B21 72%);box-shadow:inset 1px 1px 2px #fffdfb80,0 5px 22px #240b2130}.spark svg{width:42px;height:42px}.panel{position:fixed;right:20px;bottom:102px;width:min(470px,calc(100vw - 24px));height:min(740px,calc(100dvh - 120px));z-index:2147483001;background:#FFFDFB;color:#240B21;border:1px solid #916A70;border-radius:13px;box-shadow:0 12px 60px #240b2130;overflow:hidden;box-sizing:border-box}.bar{height:54px;display:flex;align-items:center;gap:8px;padding:0 8px;background:#F5F1F2;box-sizing:border-box;border-bottom:1px solid #916A70}.grab{touch-action:none;cursor:grab;flex:1;text-align:left;border:0;background:transparent;color:#240B21;min-height:44px;font-weight:600;min-width:70px}.popout{color:#240B21;font-size:11px;display:flex;align-items:center;min-height:44px;text-decoration:underline}.close{height:38px;min-width:38px;border:1px solid #916A70;background:#FFFDFB;border-radius:50%;color:#240B21;font-size:22px}.panel iframe{display:block;width:100%;height:calc(100% - 54px);border:0}button:focus-visible,a:focus-visible{outline:3px solid #916A70;outline-offset:-3px}[hidden]{display:none!important}";
  const launch = document.createElement('button');
  launch.className = 'launch'; launch.type = 'button';
  const badge = document.createElement('span'); badge.className = 'spark'; badge.setAttribute('aria-hidden','true');
  badge.innerHTML = '<svg viewBox="0 0 64 64"><path d="M16 12H29C44 12 52 20 52 32S44 52 29 52H16Z" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/><circle cx="30" cy="32" r="6" fill="currentColor"/></svg>';
  launch.append(badge); launch.setAttribute('aria-label','Open DO writing and task widget'); launch.setAttribute('aria-expanded','false');
  launch.title = 'Drag to move. Alt + arrow keys also move DO. Moving shares nothing.';
  const panel = document.createElement('section'); panel.className = 'panel'; panel.hidden = true; panel.setAttribute('aria-label','DO preparation');
  const bar = document.createElement('div'); bar.className = 'bar';
  const grab = document.createElement('button'); grab.type = 'button'; grab.className = 'grab'; grab.textContent = '⠿ DO workspace';
  grab.setAttribute('aria-label','Move DO workspace'); grab.title = 'Drag this handle, or focus it and use arrow keys.';
  const popout = document.createElement('a'); popout.className = 'popout'; popout.href = origin + '/do/widget'; popout.target = '_blank'; popout.rel = 'noopener noreferrer';
  popout.textContent = 'Voice / full window ↗'; popout.title = 'Open the signed-in workspace. Context is not copied automatically.';
  const close = document.createElement('button'); close.className='close'; close.type='button'; close.textContent='×'; close.setAttribute('aria-label','Close DO widget');
  const frame = document.createElement('iframe'); frame.title = 'DO by assembl — prepare and review'; frame.referrerPolicy='no-referrer';
  frame.setAttribute('allow','clipboard-write');
  frame.setAttribute('sandbox','allow-scripts allow-forms allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox');
  let loaded=false; let context=null;
  function offerContext() {
    if (loaded && context) {
      frame.contentWindow.postMessage({type:'assembl-do:context',text:String(context.text || '').slice(0,12000),title:String(context.title || '').slice(0,160),url:String(context.url || '').slice(0,2000)},origin);
      context=null;
    }
  }
  function place(element,x,y) {
    const r=element.getBoundingClientRect();
    element.style.right='auto'; element.style.bottom='auto';
    element.style.left=Math.max(8,Math.min(Math.max(8,innerWidth-r.width-8),x))+'px';
    element.style.top=Math.max(8,Math.min(Math.max(8,innerHeight-r.height-8),y))+'px';
  }
  function open(value) {
    context=value && typeof value==='object' ? value : null;
    panel.hidden=false; launch.setAttribute('aria-expanded','true');
    const r=panel.getBoundingClientRect(); place(panel,r.left,r.top);
    if (!frame.src) frame.src=origin+'/do/widget'; else offerContext();
    close.focus();
  }
  function hide() { panel.hidden=true; launch.setAttribute('aria-expanded','false'); launch.focus(); }
  window.addEventListener('message',event=>{
    if(event.source===frame.contentWindow && event.origin===origin && event.data?.type==='assembl-do:ready'){loaded=true;offerContext();}
  });
  frame.addEventListener('load',()=>{loaded=false;frame.contentWindow.postMessage({type:'assembl-do:hello'},origin);});
  function draggable(handle,element) {
    let start=null; let moved=false;
    const update=e=>{
      if(!start || e.pointerId!==start.pointerId)return;
      const dx=e.clientX-start.x,dy=e.clientY-start.y;
      if(Math.hypot(dx,dy)>5)moved=true;
      if(moved)place(element,start.left+dx,start.top+dy);
    };
    handle.addEventListener('pointerdown',e=>{
      if(e.button!==0 || !e.isPrimary)return;
      const r=element.getBoundingClientRect();start={x:e.clientX,y:e.clientY,left:r.left,top:r.top,pointerId:e.pointerId};moved=false;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove',update);
    handle.addEventListener('pointerup',e=>{
      if(!start || e.pointerId!==start.pointerId)return;
      update(e); start=null;
      if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);
    });
    handle.addEventListener('pointercancel',()=>{start=null;moved=true;});
    handle.addEventListener('lostpointercapture',()=>{start=null;});
    handle.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key) || (handle===launch && !e.altKey))return;
      e.preventDefault(); const r=element.getBoundingClientRect();
      place(element,r.left+(e.key==='ArrowRight'?24:e.key==='ArrowLeft'?-24:0),r.top+(e.key==='ArrowDown'?24:e.key==='ArrowUp'?-24:0));
    });
    return ()=>{const result=moved;moved=false;return result;};
  }
  const dragged=draggable(launch,launch); draggable(grab,panel);
  launch.addEventListener('click',e=>{if(e.detail!==0 && dragged())return;panel.hidden?open(null):hide();});
  close.addEventListener('click',hide);
  shadow.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
  window.addEventListener('resize',()=>{
    for(const element of [launch,panel]){if(element.hidden)continue;const r=element.getBoundingClientRect();place(element,r.left,r.top);}
  });
  bar.append(grab,popout,close); panel.append(bar,frame); shadow.append(style,launch,panel); document.body.append(host);
  window.assemblDo=Object.freeze({open,close:hide});
})();`;
}

export function doEmbedExample(origin: string): string {
  return `<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DO widget example</title><style>body{font:18px/1.6 'Instrument Sans',system-ui,sans-serif;background:#FFFDFB;color:#240B21;max-width:660px;padding:8vh 7vw;margin:auto}h1{font-size:42px;font-weight:450;line-height:1.1}code{font-size:13px;background:#F5F1F2;padding:12px;display:block;overflow:auto}</style></head><body><h1>A little DO, on your website.</h1><p>Move the launcher or drag the workspace by its handle. Review drafts here; open the full window for voice and meeting recording.</p><p>Moving shares nothing. The widget does not read this page automatically, and context is not automatically copied to a new window.</p><code>&lt;script src="${origin}/api/do/widget" defer&gt;&lt;/script&gt;</code><script src="${origin}/api/do/widget" defer></script></body></html>`;
}
export const DO_DISTRIBUTION_ORIGIN = 'https://www.assembl.co.nz';
