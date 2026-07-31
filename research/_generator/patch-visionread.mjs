#!/usr/bin/env node
/**
 * patch-visionread.mjs — the vision-read sections, built from the flagship's
 * scan-panel treatment (Kate, 2 Aug 2026: "can you build both").
 *
 *  - assembling-ryman-family:  the lounge, read → /api/room  (villa compare)
 *  - assembling-summerset:     the lounge, read → /api/room  (plan + person)
 *  - assembling-giltrap:       the lot, read    → /api/lot   (drafts, unsigned)
 *
 * Demo image → real opus-5 read (keys live on all three projects); canned
 * fallback mirrors the demo image exactly, so the journey works offline too.
 * Idempotent via vr markers. Giltrap stays monochrome.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = '/Users/kateharland/assembl-web/research';

const CANNED_LOUNGE = {
  estimate: {
    items: [
      { name: 'Three-seater sofa', footprint_m2: 1.8, box: { x: 7, y: 43, w: 39, h: 28 } },
      { name: 'Armchair', footprint_m2: 0.6, box: { x: 52, y: 50, w: 17, h: 21 } },
      { name: 'Coffee table', footprint_m2: 0.5, box: { x: 30, y: 66, w: 22, h: 15 } },
      { name: 'Sideboard', footprint_m2: 0.8, box: { x: 74, y: 37, w: 22, h: 27 } },
      { name: 'Floor lamp', footprint_m2: 0.1, box: { x: 47, y: 27, w: 6, h: 27 } },
    ],
    flags: [
      { note: 'doorway on the right — clear', kind: 'clear', box: { x: 88, y: 8, w: 11, h: 60 } },
      { note: 'rug corner by the table sits lifted', kind: 'care', box: { x: 62, y: 84, w: 9, h: 10 } },
      { note: 'lane between sofa and table is narrow', kind: 'care', box: { x: 46, y: 63, w: 8, h: 15 } },
    ],
    total_footprint_m2: 3.8,
    what_i_saw: 'A warm, well-loved lounge — the three-seater facing the window, the armchair beside it, and a sideboard that has clearly been in the family a long time.',
    confidence: 'medium',
    reasoning: 'Sized against the doorway on the right (about 0.8 m) and the sofa seat depth (about 0.5 m).',
    cannot_tell: ['the doorway width in millimetres', 'whether anything sits behind the camera', 'how that rug corner behaves underfoot'],
  },
};
const CANNED_RYMAN = Object.assign({}, CANNED_LOUNGE, {
  fit: {
    verdict: 'fits',
    line: 'Her things come to roughly 3.8 m² of floor, and the villa living room is 32.4 m². That is room to spare — the sofa, the chair and the sideboard, with space to move around them.',
    total_m2: 3.8, room_m2: 32.4,
    measure: 'This is a read from a photo, not a measurement. Before anything is moved, measure the two seats and the sideboard, and — the thing that catches people out — the width of the doorways they have to pass through.',
    held: 'Nothing here is sent, saved or booked. It is a draft for the family, and for an advisor to check with you.',
  },
});
const CANNED_SUMMERSET = Object.assign({}, CANNED_LOUNGE, {
  guide: {
    total_m2: 3.8,
    line: 'Their things come to roughly 3.8 m² of floor. Take that number to the plan of the apartment you are considering — a person walks it with you, room by room.',
    measure: 'This is a read from a photo, not a measurement. Before anything moves, measure the two biggest pieces and the width of every doorway they travel through.',
    held: 'Nothing here is sent, saved or booked. It is a draft for the family, and for a person to check with you.',
  },
});
const CANNED_GILTRAP = {
  read: {
    silhouette: {
      body: 'Dual-cab ute',
      reads_as: 'reads as a current Kia Tasman dual-cab',
      finish: 'matte grey, photographed in open tussock country',
      notable: ['upright grille', 'flat deck line', 'all-terrain stance'],
      box: { x: 27, y: 22, w: 50, h: 58 },
      detail_boxes: [
        { label: 'grille', x: 30, y: 40, w: 12, h: 22 },
        { label: 'deck', x: 58, y: 30, w: 18, h: 26 },
      ],
    },
    read_source: 'photo',
    campaign: [
      { headline: 'Built for the week that works.', line: 'A dual-cab that carries the job and the weekend in the same tray.' },
      { headline: 'Read straight off the lot.', line: 'Photographed once, drafted in the house voice — a person signs before anything publishes.' },
    ],
    confidence: 'medium',
    cannot_tell: ['trim level and badging from this angle', 'interior', 'odometer and provenance'],
  },
};

const PAGES = [
  {
    dir: 'assembling-ryman-family', anchor: 'plup', mode: 'room', api: '/api/room',
    demoSrc: 'demo-lounge.jpg', demoType: 'image/jpeg',
    A: '#F06022', ink: '#1A1917', card: '#FFFFFF', line: 'rgba(26,25,23,.12)', dark: false,
    kck: 'the lounge, read', head: 'Watch a lounge being read.',
    sub: 'The same reader the family uses below, on a demonstration lounge — every piece found, sized roughly, and set against the villa&rsquo;s 6.0 &times; 5.4 m room. A photo is a starting point for a tape measure, held for a person.',
    demoLabel: 'Read the demo lounge', demoSmall: 'an illustration &middot; the real reader runs on it',
    ownLabel: 'Use your own photo', ownSmall: 'read once &middot; never stored',
    foot: 'One guidance figure, once: a wheelchair turning circle is 1.5 m (NZS 4121). Everything else here is observation from the photo — never care advice. For her real lounge, the multi-photo upload below does the full read.',
    canned: CANNED_RYMAN,
  },
  {
    dir: 'assembling-summerset', anchor: 'mz', mode: 'room-guide', api: '/api/room',
    demoSrc: 'demo-lounge.jpg', demoType: 'image/jpeg',
    A: '#470A68', ink: '#1A1917', card: '#FFFFFF', line: 'rgba(26,25,23,.12)', dark: false,
    kck: 'the lounge, read', head: 'Will it fit the apartment?',
    sub: 'Photograph the lounge as it is. The reader lists what is there and how much floor it wants &mdash; then the total goes against the plan of the apartment you are considering, with a person. No apartment dimensions are guessed here.',
    demoLabel: 'Read the demo lounge', demoSmall: 'an illustration &middot; the real reader runs on it',
    ownLabel: 'Use your own photo', ownSmall: 'read once &middot; never stored',
    foot: 'One guidance figure, once: a wheelchair turning circle is 1.5 m (NZS 4121). Everything else here is observation from the photo — never care advice.',
    canned: CANNED_SUMMERSET,
  },
  {
    dir: 'assembling-giltrap', anchor: 'mz', mode: 'lot', api: '/api/lot',
    demoSrc: 'lot-tasman.jpg', demoType: 'image/jpeg',
    A: '#FFFFFF', ink: '#F2F2F2', card: '#141414', line: 'rgba(255,255,255,.14)', dark: true,
    kck: 'the lot, read', head: 'Every car, read before it is listed.',
    sub: 'Pick a car from the lot &mdash; real photographs, plus the 356 scan &mdash; or photograph one. The reader takes the shape, notes what a buyer&rsquo;s eye lands on, and drafts the giltrap.com card. Nothing publishes until a person signs.',
    demoLabel: 'Read from the lot', demoSmall: 'four cars + the scan &middot; the real reader runs on them',
    ownLabel: 'Photograph a car', ownSmall: 'read once &middot; never stored',
    foot: 'Car photography from giltrap.com, used here for this concept only. No price is estimated from a photo — a person prices. Identification is always &ldquo;reads as&rdquo;, never a claim. Every card stays a draft until a person signs it.',
    canned: CANNED_GILTRAP,
    thumbs: [
      { src: 'lot-tasman.jpg', l: 'the ute' },
      { src: 'lot-lbx.jpg', l: 'the pair' },
      { src: 'lot-discovery.jpg', l: 'the tourer' },
      { src: 'lot-macan.jpg', l: 'the EV' },
      { src: 'car-wide.png', l: 'the scan', type: 'image/png' },
    ],
    queue: true,
  },
];

const CSS = `
/* vr:start — the vision read, scan-panel treatment */
.vrSec{padding:44px 22px 40px;position:relative}
.vrIn{max-width:1080px;margin:0 auto}
.vrK{font:800 10px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;letter-spacing:.24em;
  text-transform:uppercase;color:var(--vrA)}
.vrH{margin:8px 0 8px;font-size:clamp(24px,3.2vw,34px);line-height:1.1;letter-spacing:-.02em;font-weight:800;color:var(--vrInk)}
.vrSub{margin:0 0 16px;font:500 14px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--vrInk);opacity:.82;max-width:640px}
.vrBtns{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}
.vrBtn{display:inline-flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;
  font:800 13px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--vrBtnInk,#fff);
  background:var(--vrA);border:1.5px solid var(--vrA);border-radius:14px;padding:11px 16px;cursor:pointer}
.vrBtn small{font:600 10px -apple-system,sans-serif;opacity:.75;letter-spacing:.04em}
.vrBtn.ghost{background:transparent;color:var(--vrInk);border-color:var(--vrLine)}
.vrBtn:active{transform:scale(.98)}
.vrBtn input{display:none}
.vrGrid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:22px;align-items:start}
@media(max-width:900px){.vrGrid{grid-template-columns:1fr}}
.vrPanel{display:none;position:relative}
.vrPanel.on{display:block}
.vrFrame{position:relative;border-radius:18px;overflow:hidden;background:#101010;
  box-shadow:0 30px 70px -30px rgba(0,0,0,.55),0 0 0 1.5px var(--vrLine)}
.vrFrame img{display:block;width:100%;height:auto}
.vrFx i{position:absolute;width:24px;height:24px;border:2.5px solid var(--vrAcc2,#FF8A3D);z-index:4}
.vrFx i.tl{top:9px;left:9px;border-right:0;border-bottom:0;border-top-left-radius:7px}
.vrFx i.tr{top:9px;right:9px;border-left:0;border-bottom:0;border-top-right-radius:7px}
.vrFx i.bl{bottom:9px;left:9px;border-right:0;border-top:0;border-bottom-left-radius:7px}
.vrFx i.br{bottom:9px;right:9px;border-left:0;border-top:0;border-bottom-right-radius:7px}
.vrSweep{position:absolute;left:0;right:0;top:-14%;height:12%;z-index:3;opacity:0;
  background:linear-gradient(180deg,transparent,var(--vrSweepC,rgba(255,138,61,.4)) 50%,transparent);
  box-shadow:0 0 26px var(--vrSweepC,rgba(255,138,61,.35))}
.vrPanel.scanning .vrSweep{opacity:1;animation:vrSw 2.4s linear infinite}
@keyframes vrSw{from{top:-14%}to{top:102%}}
.vrBox{position:absolute;z-index:5;border:2px solid #fff;border-radius:9px;
  box-shadow:0 0 0 1.5px rgba(0,0,0,.3),0 8px 22px -8px rgba(0,0,0,.5);
  opacity:0;transform:scale(1.22);transition:opacity .45s ease,transform .45s cubic-bezier(.2,.9,.3,1.3)}
.vrBox.in{opacity:1;transform:none}
.vrBox.item{border-color:var(--vrAcc2,#FF8A3D)}
.vrBox.clear{border-color:#7DBB42}
.vrBox.care{border-color:var(--vrAcc2,#FF8A3D);border-style:dashed}
.vrLab{position:absolute;left:-2px;bottom:calc(100% + 5px);white-space:nowrap;
  font:800 9px -apple-system,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#fff;
  padding:3.5px 7px;border-radius:7px;background:var(--vrLabBg,#E85F00)}
.vrBox.clear .vrLab{background:#37823A}
.vrBox.flip .vrLab{bottom:auto;top:calc(100% + 5px)}
.vrBox.rt .vrLab{left:auto;right:-2px}
.vrTag{margin:12px auto 0;width:fit-content;max-width:100%;
  font:700 10px -apple-system,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--vrInk);
  background:var(--vrCard);border:1.5px solid var(--vrLine);border-radius:99px;padding:8px 15px}
.vrTag b{color:var(--vrA)}
.vrSec[data-dark] .vrTag b{color:#fff}
.vrOut{display:none}
.vrOut.on{display:block}
.vrCard{background:var(--vrCard);border:1.5px solid var(--vrLine);border-radius:16px;padding:15px 17px;margin-bottom:12px}
.vrCard h4{margin:0 0 8px;font:800 10px -apple-system,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--vrA)}
.vrSec[data-dark] .vrCard h4{color:#fff}
.vrRow{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid var(--vrLine);
  font:600 12.5px -apple-system,sans-serif;color:var(--vrInk)}
.vrRow:last-child{border-bottom:0}
.vrRow span:last-child{font-variant-numeric:tabular-nums;opacity:.75;white-space:nowrap}
.vrChips{display:flex;flex-direction:column;gap:6px}
.vrChip{font:600 12px/1.5 -apple-system,sans-serif;color:var(--vrInk);padding:7px 11px;border-radius:10px;
  border:1.5px solid var(--vrLine);background:transparent}
.vrChip.clear{border-color:rgba(55,130,58,.45)}
.vrChip.care{border-style:dashed}
.vrBig{font:700 13.5px/1.6 -apple-system,sans-serif;color:var(--vrInk);margin:0 0 8px}
.vrDim{font:500 11.5px/1.6 -apple-system,sans-serif;color:var(--vrInk);opacity:.62;margin:6px 0 0}
.vrDraft{position:relative;border:1.5px solid var(--vrLine);border-radius:12px;padding:11px 13px;margin-bottom:8px}
.vrDraft b{display:block;font:800 14px -apple-system,sans-serif;color:var(--vrInk);letter-spacing:-.01em}
.vrDraft p{margin:4px 0 0;font:500 12.5px/1.55 -apple-system,sans-serif;color:var(--vrInk);opacity:.8}
.vrDraft em{position:absolute;top:9px;right:11px;font:700 8.5px -apple-system,sans-serif;letter-spacing:.14em;
  text-transform:uppercase;font-style:normal;color:var(--vrInk);opacity:.5;border:1px solid var(--vrLine);
  border-radius:6px;padding:2.5px 6px}
.vrFoot{margin:16px 0 0;font:500 11.5px/1.7 -apple-system,sans-serif;color:var(--vrInk);opacity:.62;max-width:720px}
/* the lot thumbs — pick a real car */
.vrThumbs{display:flex;gap:9px;flex-wrap:wrap;margin:-6px 0 18px}
.vrTh{appearance:none;border:1.5px solid var(--vrLine);background:none;border-radius:12px;padding:4px;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;gap:3px}
.vrTh img{display:block;width:74px;height:44px;object-fit:cover;border-radius:8px}
.vrTh span{font:700 8.5px -apple-system,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--vrInk);opacity:.65}
.vrTh:hover,.vrTh.on{border-color:var(--vrA)}
/* the drafted offer card — the giltrap.com artefact, faithful and light */
.vrOffer{background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 30px 70px -30px rgba(0,0,0,.65);margin-bottom:12px}
.vrOfferImg{position:relative}
.vrOfferImg img{display:block;width:100%;height:170px;object-fit:cover}
.vrRound{position:absolute;left:16px;bottom:-20px;width:46px;height:46px;border-radius:50%;background:#fff;
  box-shadow:0 4px 14px rgba(20,30,45,.18);display:flex;align-items:center;justify-content:center}
.vrRound svg{width:26px;height:26px}
.vrStamp{position:absolute;top:12px;right:12px;font:800 9px -apple-system,sans-serif;letter-spacing:.16em;
  text-transform:uppercase;font-style:normal;color:#1B2430;background:rgba(255,255,255,.92);
  border:1.5px dashed #1B2430;border-radius:8px;padding:5px 9px;transform:rotate(3deg)}
.vrStamp.signed{border-style:solid;background:#1B2430;color:#fff;transform:none}
.vrOfferBody{padding:26px 18px 16px}
.vrOfferBody h3{margin:0 0 6px;font:800 18px/1.25 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  color:#1B2430;letter-spacing:-.01em}
.vrOfferBody>p{margin:0 0 10px;font:500 13px/1.6 -apple-system,sans-serif;color:#5A6472}
.vrOfferChips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.vrOfferChips i{font:700 10.5px -apple-system,sans-serif;font-style:normal;color:#33404E;background:#EEF1F5;
  border-radius:99px;padding:5px 11px}
.vrTCs{text-align:center;font:600 11px -apple-system,sans-serif;color:#5A6472;margin-bottom:10px}
.vrPill{display:block;width:100%;text-align:center;font:700 14px -apple-system,sans-serif;color:#1B2430;
  background:#fff;border:1.5px solid #94A0AE;border-radius:99px;padding:12px;cursor:pointer}
.vrPill:active{transform:scale(.99)}
.vrPill[disabled]{opacity:.55;cursor:default}
/* the signing queue — wired to the desk */
.vrQ{margin-top:20px;border:1.5px solid var(--vrLine);border-radius:16px;padding:14px 16px}
.vrQK{font:800 10px -apple-system,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--vrInk);margin-bottom:10px}
.vrQK b{color:var(--vrInk)}
.vrQItem{display:flex;gap:11px;align-items:center;padding:9px 0;border-top:1px solid var(--vrLine)}
.vrQItem img{width:64px;height:40px;object-fit:cover;border-radius:8px;flex:none}
.vrQT{flex:1;min-width:0}
.vrQT b{display:block;font:800 12.5px -apple-system,sans-serif;color:var(--vrInk);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vrQT span{display:block;font:600 10px -apple-system,sans-serif;color:var(--vrInk);opacity:.6;margin-top:2px}
.vrQSign{font:800 11px -apple-system,sans-serif;color:#0d0d0d;background:var(--vrA);border:0;border-radius:10px;
  padding:8px 12px;cursor:pointer;flex:none}
.vrQSign[disabled]{background:transparent;border:1.5px solid var(--vrLine);color:var(--vrInk);opacity:.7;cursor:default}
.vrQGuard{margin-top:11px;font:700 11px -apple-system,sans-serif;color:var(--vrInk);background:none;
  border:1.5px solid var(--vrLine);border-radius:99px;padding:8px 14px;cursor:pointer}
/* vr:end */`;

function sectionHtml(p) {
  return `
<!-- vr:start -->
<section class="vrSec" id="vrSec" ${p.dark ? 'data-dark ' : ''}style="--vrA:${p.A};--vrInk:${p.ink};--vrCard:${p.card};--vrLine:${p.line};${p.dark ? '--vrBtnInk:#0d0d0d;--vrAcc2:#FFFFFF;--vrSweepC:rgba(255,255,255,.35);--vrLabBg:#2b2b2b;' : ''}">
  <div class="vrIn">
    <div class="vrK">${p.kck}</div>
    <h2 class="vrH">${p.head}</h2>
    <p class="vrSub">${p.sub}</p>
    <div class="vrBtns">
      <button type="button" class="vrBtn" id="vrDemo">${p.demoLabel}<small>${p.demoSmall}</small></button>
      <label class="vrBtn ghost">${p.ownLabel}<small>${p.ownSmall}</small><input type="file" id="vrOwn" accept="image/*" /></label>
    </div>${p.thumbs ? `
    <div class="vrThumbs" id="vrThumbs">${p.thumbs.map((t, i) =>
      `<button type="button" class="vrTh" data-i="${i}"><img src="${t.src}" alt="" /><span>${t.l}</span></button>`).join('')}
    </div>` : ''}
    <div class="vrGrid">
      <div class="vrPanel" id="vrPanel">
        <div class="vrFrame"><img id="vrImg" alt="The photo being read" />
          <div class="vrFx"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i>
            <div class="vrSweep"></div></div>
          <div id="vrBoxes"></div>
        </div>
        <div class="vrTag" id="vrTag">reading&hellip;</div>
      </div>
      <div class="vrOut" id="vrOut"></div>
    </div>${p.queue ? `
    <div class="vrQ" id="vrQ" style="display:none">
      <div class="vrQK">the signing queue &middot; today&rsquo;s drafts &middot; <b id="vrQN">0</b> held</div>
      <div id="vrQList"></div>
      <button type="button" class="vrQGuard" id="vrGuardGo">run the guard on these &rarr;</button>
    </div>` : ''}
    <p class="vrFoot">${p.foot}</p>
  </div>
</section>
<!-- vr:end -->`;
}

function engineJs(p) {
  return `
<script>/* vr:start — the vision read */
(function(){
var CFG=__CFG__;
function $(id){return document.getElementById(id)}
/* fresh lookups every time — the page's own boot code may re-render this
   region after load, which orphans cached refs and bound listeners */
function P(){return $('vrPanel')} function IMG(){return $('vrImg')}
function BX(){return $('vrBoxes')} function TAG(){return $('vrTag')} function OUT(){return $('vrOut')}
if(!P()) return;
var busy=false,token=0,curSrc=CFG.demoSrc,curType=CFG.demoType,thumbI=0;
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
    if(done||my!==token){busy=false;return} done=true;busy=false;
    P().classList.remove('scanning');
    render(payload,note);
  }
  /* a careful low-confidence vision read genuinely takes ~20 s — give it 30 */
  var to=setTimeout(function(){finish(CFG.canned,'the live read took too long — showing the concept read')},30000);
  fetch(CFG.api,{method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({images:[{media_type:type,data:b64}]})})
  .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})})
  .then(function(res){clearTimeout(to);
    if(res.ok&&(res.j.estimate||res.j.read)) finish(res.j,null);
    else finish(CFG.canned,'showing the concept read — '+((res.j&&res.j.error)?'the live reader said: '+res.j.error:'the live reader is waking'));})
  .catch(function(){clearTimeout(to);finish(CFG.canned,'offline here — showing the concept read')});
}
function readAsset(src,type){
  fetch(src).then(function(r){return r.blob()}).then(function(b){
    return b64Of(b).then(function(d){startRead(src,d,type)});
  }).catch(function(){render(CFG.canned,'showing the concept read')});
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
  if(e.target.closest('#vrGuardGo')){
    location.hash='#guard';
    var g=document.getElementById('guardBtn'); if(g) g.click();
  }
},true); /* CAPTURE phase — the page's own handlers stopPropagation on bubbled clicks */
document.addEventListener('change',function(e){
  if(!e.target||e.target.id!=='vrOwn') return;
  var f=e.target.files&&e.target.files[0]; e.target.value=''; if(!f) return;
  TAG().textContent='preparing your photo\\u2026';P().classList.add('on');
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
        +(CFG.queue?'<button type="button" class="vrPill" id="vrQueueBtn">Queue for signing &#8599;</button>':'')
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
      var qb=document.getElementById('vrQueueBtn');
      if(qb) qb.addEventListener('click',function(){
        qb.disabled=true; qb.textContent='In the queue \\u2713';
        addToQueue(curSrc,c0.headline||'',document.getElementById('vrStamp'));
      });
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
    +'<button type="button" class="vrQSign">Sign &mdash; as the DP</button>';
  row.querySelector('img').src=src;
  row.querySelector('b').textContent=headline;
  var btn=row.querySelector('.vrQSign'),st=row.querySelector('span');
  btn.addEventListener('click',function(){
    var when=new Date().toLocaleTimeString('en-NZ',{hour:'2-digit',minute:'2-digit'});
    st.textContent='signed '+when+' \\u00b7 ready for giltrap.com \\u2014 publishes from the console';
    btn.disabled=true; btn.textContent='Signed \\u2713';
    if(stampEl){stampEl.classList.add('signed');stampEl.textContent='signed \\u00b7 ready';}
  });
  list.appendChild(row);
  qN++; var n=document.getElementById('vrQN'); if(n) n.textContent=qN;
}

})();/* vr:end */</script>`;
}

function patch(p) {
  const f = `${ROOT}/${p.dir}/index.html`;
  let s = readFileSync(f, 'utf8');
  s = s.replace(/\n?\/\* vr:start[\s\S]*?vr:end \*\//g, '')
       .replace(/\n?<!-- vr:start -->[\s\S]*?<!-- vr:end -->/g, '')
       .replace(/\n?<script>\/\* vr:start[\s\S]*?vr:end \*\/<\/script>/g, '');
  const style = s.lastIndexOf('</style>');
  s = s.slice(0, style) + CSS + '\n' + s.slice(style);
  const band = sectionHtml(p);
  if (p.anchor === 'plup') {
    const i = s.indexOf('class="plup'); // markup only — 'plup' alone matches the CSS in <head>
    const sec = i === -1 ? -1 : s.lastIndexOf('<section', i);
    if (sec === -1) { console.log('NO ANCHOR', p.dir); return false; }
    s = s.slice(0, sec) + band + '\n' + s.slice(sec);
  } else {
    const m = s.indexOf('<!-- mz:end -->');
    if (m === -1) { console.log('NO MZ ANCHOR', p.dir); return false; }
    const e = m + '<!-- mz:end -->'.length;
    s = s.slice(0, e) + band + s.slice(e);
  }
  const cfg = JSON.stringify({ api: p.api, demoSrc: p.demoSrc, demoType: p.demoType, mode: p.mode, canned: p.canned, thumbs: p.thumbs || null, queue: !!p.queue });
  const js = engineJs(p).replace('__CFG__', () => cfg);
  s = s.slice(0, s.lastIndexOf('</body>')) + js + '\n' + s.slice(s.lastIndexOf('</body>'));
  writeFileSync(f, s);
  console.log('vision read →', p.dir, `(${p.mode})`);
  return true;
}

let n = 0;
for (const p of PAGES) if (patch(p)) n++;
console.log(`\n${n}/${PAGES.length} patched`);
