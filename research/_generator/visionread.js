/* visionread.js — the shared vision-read engine (static, no injection).
   Included with <script src="visionread.js"> after a <script> that sets
   window.VR_CONFIG for the page. One source file; per-site copies deploy
   with each Pages project. Extracted 2 Aug 2026 under the no-injector rule. */
/* vr:start — the vision read */
(function(){
var CFG=window.VR_CONFIG||{};
function $(id){return document.getElementById(id)}
/* fresh lookups every time — the page's own boot code may re-render this
   region after load, which orphans cached refs and bound listeners */
function P(){return $('vrPanel')} function IMG(){return $('vrImg')}
function BX(){return $('vrBoxes')} function TAG(){return $('vrTag')} function OUT(){return $('vrOut')}
if(!P()) return;
var busy=false,token=0,curSrc=CFG.demoSrc,curType=CFG.demoType,thumbI=0;
function vrSanitize(o){
  /* Summerset rule: NO path may emit a room dimension. Gated by CFG.noRoomDims.
     Strips "X m × Y m" / "XxY m" patterns from every string in the payload
     before anything renders. */
  if(!CFG.noRoomDims) return o;
  var re=/\d+(?:\.\d+)?\s*m?\s*[×xX]\s*\d+(?:\.\d+)?\s*m\b/g;
  function walk(v){
    if(typeof v==='string') return v.replace(re,'[room dimensions withheld \u2014 the plan is read with a person]');
    if(Array.isArray(v)) return v.map(walk);
    if(v&&typeof v==='object'){var r={};for(var k in v)r[k]=walk(v[k]);return r}
    return v;
  }
  return walk(o);
}
function cannedFor(){
  var base=String(curSrc||'').split('/').pop();
  return (CFG.cannedBySrc&&CFG.cannedBySrc[base])||CFG.canned;
}
function esc(s){var d=document.createElement('div');d.textContent=String(s==null?'':s);return d.innerHTML}
function b64Of(blob){
  if(blob.arrayBuffer){ return blob.arrayBuffer().then(function(ab){
    var u=new Uint8Array(ab),s='',CH=32768;
    for(var i=0;i<u.length;i+=CH){ s+=String.fromCharCode.apply(null,u.subarray(i,i+CH)); }
    return btoa(s); }); }
  return new Promise(function(res,rej){var r=new FileReader();
    r.onload=function(){res(String(r.result).split(',')[1]||'')};r.onerror=rej;r.readAsDataURL(blob)});
}
function shrink(f){return new Promise(function(res,rej){
  var url=URL.createObjectURL(f),im=new Image();
  im.onload=function(){try{
    var mx=1600,w=im.naturalWidth||1,h=im.naturalHeight||1,k=Math.min(1,mx/Math.max(w,h));
    var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);
    var d=c.toDataURL('image/jpeg',.82);res({b64:d.split(',')[1]||'',preview:d,type:'image/jpeg'});
  }catch(e){rej(e)}};
  im.onerror=function(){URL.revokeObjectURL(url);rej(new Error('decode'))};
  im.src=url;})}
function addBox(b,label,cls,delay){
  if(!b) return;
  var d=document.createElement('div');
  d.className='vrBox '+cls+(b.y<9?' flip':'')+(b.x>55?' rt':'');
  d.style.left=b.x+'%';d.style.top=b.y+'%';d.style.width=b.w+'%';d.style.height=b.h+'%';
  var l=document.createElement('div');l.className='vrLab';l.textContent=label;d.appendChild(l);
  BX().appendChild(d);
  setTimeout(function(){d.classList.add('in')},delay||30);
}
function startRead(src,b64,type){
  if(busy) return; busy=true; var my=++token;
  curSrc=src; curType=type;
  BX().innerHTML='';OUT().classList.remove('on');OUT().innerHTML='';
  IMG().src=src;P().classList.add('on','scanning');
  TAG().innerHTML='reading&hellip; <b>held for a person</b>';
  var done=false;
  function finish(payload,note){
    payload=vrSanitize(payload);
    if(done||my!==token){busy=false;return} done=true;busy=false;
    P().classList.remove('scanning');
    render(payload,note);
  }
  /* a careful low-confidence vision read genuinely takes ~20 s — give it 30 */
  var to=setTimeout(function(){finish(cannedFor(),'the live read took too long — showing the concept read')},30000);
  fetch(CFG.api,{method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({images:[{media_type:type,data:b64}]})})
  .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})})
  .then(function(res){clearTimeout(to);
    if(res.ok&&(res.j.estimate||res.j.read)) finish(res.j,null);
    else finish(cannedFor(),'showing the concept read — '+((res.j&&res.j.error)?'the live reader said: '+res.j.error:'the live reader is waking'));})
  .catch(function(){clearTimeout(to);finish(cannedFor(),'offline here — showing the concept read')});
}
function readAsset(src,type){
  fetch(src).then(function(r){return r.blob()}).then(function(b){
    return b64Of(b).then(function(d){startRead(src,d,type)});
  }).catch(function(){render(cannedFor(),'showing the concept read')});
}
function markThumb(src){
  document.querySelectorAll('.vrTh').forEach(function(b){
    b.classList.toggle('on',(CFG.thumbs[+b.dataset.i]||{}).src===src)});
}
/* DELEGATED bindings — survive any boot-time re-render of the section */
document.addEventListener('click',function(e){
  if(e.target.closest('#vrDemo')){
    if(CFG.thumbs&&CFG.thumbs.length){
      var t=CFG.thumbs[thumbI%CFG.thumbs.length]; thumbI++;
      markThumb(t.src); readAsset(t.src,t.type||'image/jpeg');
    } else readAsset(CFG.demoSrc,CFG.demoType);
    return;
  }
  var th=e.target.closest('.vrTh');
  if(th&&CFG.thumbs){
    var tt=CFG.thumbs[+th.dataset.i]; if(!tt) return;
    thumbI=+th.dataset.i+1; markThumb(tt.src); readAsset(tt.src,tt.type||'image/jpeg');
    return;
  }
  var act=e.target.closest('[data-vr-action]');
  if(act){
    var a=act.getAttribute('data-vr-action');
    if(a==='queue'){
      if(!act.disabled){ act.disabled=true; act.textContent='In the queue \u2713';
        var d=window.__vrLastDraft||{src:curSrc,headline:''};
        addToQueue(d.src,d.headline,document.getElementById('vrStamp')); }
      return;
    }
    if(a==='sign'){ vrSignRow(act.closest('.vrQItem')); return; }
    if(a==='guard'){ vrRunGuard(); return; }
  }
  if(e.target.closest('#vrGuardGo')){ vrRunGuard(); }
},true); /* CAPTURE phase — the page's own handlers stopPropagation on bubbled clicks */
document.addEventListener('change',function(e){
  if(!e.target||e.target.id!=='vrOwn') return;
  var f=e.target.files&&e.target.files[0]; e.target.value=''; if(!f) return;
  TAG().textContent='preparing your photo\u2026';P().classList.add('on');
  shrink(f).then(function(o){startRead(o.preview,o.b64,o.type)})
  .catch(function(){TAG().textContent='could not open that image — try a different photo'});
},true);
function render(p,note){
  var t=0,step=560;
  if(CFG.mode==='lot'){
    var r=p.read||{},s=r.silhouette||{};
    if(s.box){setTimeout(function(){addBox(s.box,s.body||'vehicle','item')},t+=step)}
    (s.detail_boxes||[]).slice(0,3).forEach(function(db){
      setTimeout(function(){addBox(db,db.label||'detail','clear')},t+=step);
      setTimeout(function(){TAG().innerHTML='<b>'+esc((db.label||'detail'))+'</b> &middot; noted'},t);
    });
    setTimeout(function(){
      TAG().innerHTML=esc(r.read_source||'read')+' &middot; <b>'+esc(r.confidence||'honest')+' confidence</b> &middot; drafts unsigned';
      var c0=(r.campaign||[])[0]||{headline:'A car worth photographing properly.',line:String(s.reads_as||'')};
      var CARSVG='<svg viewBox="0 0 84 84" aria-hidden="true"><path d="M14 52 L20 40 C24 32 32 28 42 28 C52 28 60 32 66 40 L70 52 V58 H14 Z" fill="#1B2430"/><circle cx="28" cy="58" r="7" fill="#fff" stroke="#1B2430" stroke-width="4"/><circle cx="56" cy="58" r="7" fill="#fff" stroke="#1B2430" stroke-width="4"/></svg>';
      var h='<div class="vrOffer"><div class="vrOfferImg"><img src="'+esc(curSrc)+'" alt="" />'
        +'<span class="vrRound">'+CARSVG+'</span><em class="vrStamp" id="vrStamp">draft &middot; unsigned</em></div>'
        +'<div class="vrOfferBody"><h3>'+esc(c0.headline||'')+'</h3><p>'+esc(c0.line||'')+'</p>'
        +'<div class="vrOfferChips"><i>'+esc(s.body||'vehicle')+'</i><i>'+esc(r.read_source||'photo')+'</i><i>'+esc(r.confidence||'honest')+' confidence</i></div>'
        +'<div class="vrTCs">every line a draft &middot; a person prices &middot; a person signs</div>'
        +(CFG.queue?'<button type="button" class="vrPill" id="vrQueueBtn" data-vr-action="queue">Hold for signing &#8599;</button>':'')
        +'</div></div>';
      var alts=(r.campaign||[]).slice(1);
      if(alts.length){h+='<div class="vrCard"><h4>alternate lines</h4>';
        alts.forEach(function(c){h+='<div class="vrDraft"><em>draft &middot; unsigned</em><b>'+esc(c.headline||'')+'</b><p>'+esc(c.line||'')+'</p></div>'});
        h+='</div>';}
      h+='<div class="vrCard"><h4>the read</h4><p class="vrBig">'+esc(s.body||'')+' &middot; '+esc(s.reads_as||'')+'</p>'
        +'<div class="vrDim">'+esc(s.finish||'')+((s.notable&&s.notable.length)?' &middot; '+esc(s.notable.join(' · ')):'')+'</div></div>';
      if(r.cannot_tell&&r.cannot_tell.length)
        h+='<div class="vrCard"><h4>what a photo cannot settle</h4><div class="vrDim">'+esc(r.cannot_tell.join(' · '))+'</div></div>';
      if(note) h+='<p class="vrDim">'+esc(note)+'</p>';
      OUT().innerHTML=h;OUT().classList.add('on');
      window.__vrLastDraft={src:curSrc,headline:c0.headline||'',line:c0.line||''};
    },t+=step+300);
    return;
  }
  var e=p.estimate||{};
  (e.items||[]).forEach(function(it){
    setTimeout(function(){
      addBox(it.box,it.name+(it.footprint_m2?' · ~'+it.footprint_m2+' m²':''),'item');
      TAG().innerHTML='<b>'+esc(String(it.name||'').toLowerCase())+'</b> &middot; roughly '+esc(it.footprint_m2)+' m²';
    },t+=step);
  });
  (e.flags||[]).forEach(function(f){
    setTimeout(function(){addBox(f.box,f.note,f.kind==='clear'?'clear':'care')},t+=step);
  });
  setTimeout(function(){
    TAG().innerHTML='read once, never stored &middot; <b>'+esc(e.confidence||'honest')+' confidence</b>';
    var h='';
    if(e.what_i_saw) h+='<div class="vrCard"><h4>what it saw</h4><p class="vrBig">'+esc(e.what_i_saw)+'</p>'
      +(e.reasoning?'<div class="vrDim">'+esc(e.reasoning)+'</div>':'')+'</div>';
    h+='<div class="vrCard"><h4>the pieces &middot; rough floor area</h4>';
    (e.items||[]).forEach(function(it){h+='<div class="vrRow"><span>'+esc(it.name)+'</span><span>~'+esc(it.footprint_m2)+' m²</span></div>'});
    h+='<div class="vrRow"><span><b>together</b></span><span><b>~'+esc(e.total_footprint_m2)+' m²</b></span></div></div>';
    if(e.flags&&e.flags.length){h+='<div class="vrCard"><h4>worth a look</h4><div class="vrChips">';
      e.flags.forEach(function(f){h+='<div class="vrChip '+(f.kind==='clear'?'clear':'care')+'">'+esc(f.note)+'</div>'});
      h+='</div></div>';}
    var g=p.fit||p.guide;
    if(g) h+='<div class="vrCard"><h4>'+(p.fit?'against the villa room':'to the plan, with a person')+'</h4>'
      +'<p class="vrBig">'+esc(g.line||'')+'</p>'
      +(g.measure?'<div class="vrDim">'+esc(g.measure)+'</div>':'')
      +(g.held?'<div class="vrDim">'+esc(g.held)+'</div>':'')+'</div>';
    if(e.cannot_tell&&e.cannot_tell.length)
      h+='<div class="vrCard"><h4>what a photo cannot tell</h4><div class="vrDim">'+esc(e.cannot_tell.join(' · '))+'</div></div>';
    if(note) h+='<p class="vrDim">'+esc(note)+'</p>';
    OUT().innerHTML=h;OUT().classList.add('on');
  },t+=step+300);
}
/* ── the signing queue — drafts held for a person, then the guard ── */
var qN=0;
function addToQueue(src,headline,stampEl){
  var q=document.getElementById('vrQ'),list=document.getElementById('vrQList');
  if(!q||!list) return;
  q.style.display='block';
  var row=document.createElement('div');row.className='vrQItem';
  row.innerHTML='<img alt="" /><div class="vrQT"><b></b><span>held &middot; nothing publishes from this page</span></div>'
    +'<button type="button" class="vrQSign" data-vr-action="sign">Sign &mdash; as the DP</button>';
  row.querySelector('img').src=src;
  row.querySelector('b').textContent=headline;
  if(stampEl) row.__stamp=stampEl;
  list.appendChild(row);
  qN++; var n=document.getElementById('vrQN'); if(n) n.textContent=qN;
  var ops=document.getElementById('opsBody');
  if(ops){
    var tr=document.createElement('tr'); tr.className='vrOpsRow';
    tr.innerHTML='<td></td><td></td><td>lot-read</td><td>named approver</td><td class="vrOpsStatus">draft &middot; unsigned</td>';
    tr.children[0].textContent='the lot \u00b7 '+(((src||'').split('/').pop()||'').replace(/^lot-|\.(jpg|png)$/g,'')||'scan');
    tr.children[1].textContent=headline;
    ops.insertBefore(tr,ops.firstChild);
    row.__ops=tr;
  }
}
function vrSignRow(row){
  if(!row||row.__signed) return; row.__signed=1;
  var when=new Date().toLocaleTimeString('en-NZ',{hour:'2-digit',minute:'2-digit'});
  var st=row.querySelector('.vrQT span'),btn=row.querySelector('.vrQSign');
  if(st){
    /* keep the guard verdict on the record — signature never erases the check */
    var g=(String(st.textContent||'').match(/^(guard: pass[^\u2014]*|held \u00b7 [^\u2014]*)/)||[])[0]||'';
    st.textContent=(g?g.trim()+' \u2014 ':'')+'signed '+when+' \u00b7 ready for giltrap.com \u2014 publishes from the console';
  }
  if(btn){btn.disabled=true;btn.textContent='Signed \u2713';}
  if(row.__stamp){row.__stamp.classList.add('signed');row.__stamp.textContent='signed \u00b7 ready';}
  if(row.__ops){var c=row.__ops.querySelector('.vrOpsStatus'); if(c) c.textContent='signed '+when+' \u00b7 held for release';}
}
function vrRunGuard(){
  var rules=(CFG.guardRules||[]).map(function(r){return {re:new RegExp(r.re,'i'),rule:r.rule}});
  document.querySelectorAll('#vrQList .vrQItem').forEach(function(row){
    var text=(row.querySelector('.vrQT b')||{}).textContent||'';
    var hit=null;
    rules.forEach(function(r){ if(!hit&&r.re.test(text)) hit=r.rule; });
    var st=row.querySelector('.vrQT span');
    var note=hit?('held \u00b7 '+hit):'guard: pass \u00b7 checks clear';
    if(st&&st.textContent.indexOf('guard:')<0)
      st.textContent=note+' \u2014 '+st.textContent;
    if(row.__ops){var c=row.__ops.querySelector('.vrOpsStatus');
      if(c&&hit){c.textContent='held \u00b7 '+hit;}
      else if(c&&c.textContent.indexOf('guard')<0){c.textContent=c.textContent+' \u00b7 guard: pass';}}
  });
  location.hash='#guard';
  var g=document.getElementById('guardBtn'); if(g) g.click();
}


})();/* vr:end */
