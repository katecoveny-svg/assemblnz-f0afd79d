// Local timeline recordings of public startup only. Normal repetitions retain browser cache.
const fs = require('node:fs');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const engine=process.env.PROOF_BROWSER||'chromium', out=(process.env.PROOF_OUTPUT||'output/playwright/startup')+'/'+engine;
fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await ({chromium,webkit}[engine]).launch(engine==='chromium'?{...(process.env.PROOF_CHANNEL?{channel:process.env.PROOF_CHANNEL}:{}),...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--enable-unsafe-swiftshader']} : {});
const results=[];
for(const width of (process.env.PROOF_WIDTHS||'390,1440').split(',').map(Number)) for(const mode of (process.env.PROOF_MODES||'normal,delayed,blocked,poster-slow,poster-failed').split(',')) {
 const context=await browser.newContext({viewport:{width,height:844},recordVideo:{dir:out,size:{width,height:844}}});
 const page=await context.newPage();
      await page.addInitScript(() => {
        let seed = 7; Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
        // Preserve only for pixel readback; production keeps its normal drawing buffer policy.
        const get = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, options) {
          const gl = get.call(this, type, /webgl/.test(type) ? { ...options, preserveDrawingBuffer: true } : options);
          if (gl && /webgl/.test(type) && !gl.__proof) {
            gl.__proof = true; window.__uploads = [];
            const sources = new WeakMap();
            for (const method of ['texImage2D', 'texSubImage2D']) {
            const upload = gl[method].bind(gl);
            gl[method] = (...args) => {
              const source = args.at(-1);
              if (source instanceof HTMLImageElement || source instanceof HTMLVideoElement) {
                const info = { tag: source.tagName, src: source.currentSrc || source.src };
                window.__uploads.push(info); sources.set(gl.getParameter(gl.TEXTURE_BINDING_2D), info);
              }
              return upload(...args);
            };
            }
            for (const method of ['drawElements', 'drawArrays']) {
              const draw = gl[method].bind(gl);
              gl[method] = (...args) => {
                const program = gl.getParameter(gl.CURRENT_PROGRAM);
                const sampler = program && gl.getUniformLocation(program, 'tPlate');
                const blend = program && gl.getUniformLocation(program, 'uPlateMix');
                if(blend) window.__plateBlend = gl.getUniform(program,blend);
                if (sampler) {
                  const active = gl.getParameter(gl.ACTIVE_TEXTURE);
                  gl.activeTexture(gl.TEXTURE0 + gl.getUniform(program, sampler));
                  window.__plateDrawSource = sources.get(gl.getParameter(gl.TEXTURE_BINDING_2D));
                  gl.activeTexture(active);
                }
                return draw(...args);
              };
            }
          }
          return gl;
        };
      });

 await page.addInitScript(()=>{
 window.__timeline=[];
 const stamp=()=>{const root=document.querySelector('.direction-4c'),v=document.querySelector('video'),canvas=document.querySelector('[data-ref="canvasRef"]'); if(root)window.__timeline.push({ms:Math.round(performance.now()),ready:root.hasAttribute('data-ready'),videoReady:root.hasAttribute('data-video-ready'),static:root.hasAttribute('data-static'),sample:window.__plateDrawSource||null,blend:window.__plateBlend,videoState:v?.readyState,videoTime:v?.currentTime,canvasOpacity:canvas&&getComputedStyle(canvas).opacity,videoOpacity:v&&getComputedStyle(v).opacity,fallback:getComputedStyle(root.querySelector('[data-fallback]')||root).display,wordmarkOpacity:getComputedStyle(root.querySelector('[data-fallback]>p')||root).opacity});};
 setInterval(stamp,50);
 // Normal runs retain the real browser HTTP cache: no request routing.
 const fetch0=window.fetch;window.fetch=(u,o)=>{const url=new URL(typeof u==='string'?u:u.url,location.href);return /\/api\//.test(url.pathname)||(o?.method&&o.method!=='GET')?Promise.reject(new Error('Diagnostic blocks API')):fetch0(u,o);};
 });
 const posterCase = mode.startsWith('poster-');
 let releasePoster = () => {};
 const posterGate = new Promise(resolve => { releasePoster = resolve; });
 if(posterCase) await page.route('**/coast-gen-c-poster.jpg', async route => {
  if(mode==='poster-failed') return route.abort();
  await posterGate; return route.continue();
 });
 let mediaDeadline;
 if(mode!=='normal')await page.route(/\.(mp4|webm)(?:\?|$)/,async route=>{if(mode==='blocked'||posterCase)return route.abort();mediaDeadline ||= Date.now()+Number(process.env.PROOF_MEDIA_DELAY_MS||4000);await new Promise(r=>setTimeout(r,Math.max(0,mediaDeadline-Date.now())));return route.continue();});
 const network=[];page.on('response',async r=>{if(/assembl-tide|\.mp4|\.webm|poster|coast/.test(r.url()))network.push({url:r.url(),status:r.status(),headers:await r.allHeaders()});});
 for(let repeat=0;repeat<(mode==='normal'?3:1);repeat++){
 const name=`${width}-${mode}-${repeat===0?'fresh':'warm'+repeat}`;const start=Date.now();
 await page.goto(process.env.HOMEPAGE_URL||'http://localhost:3077/',{waitUntil:'commit'});
 const posterRecovery = mode==='poster-slow' ? page.waitForSelector('.direction-4c[data-ready]').then(() => new Promise(resolve => setTimeout(resolve,1200))).then(releasePoster) : Promise.resolve();
 const captures=[];
 for(const target of [0,250,500,1000,2000,3000,4000,5000,6000,7000,10000]){
 await new Promise(r=>setTimeout(r,Math.max(0,start+target-Date.now())));
 const file=`${out}/${name}-${target}.png`;await page.screenshot({path:file});
 captures.push({target,actual:Date.now()-start,file});
 }
 await posterRecovery;
 const timeline=await page.evaluate(()=>window.__timeline);
 const videoOutcome=await page.locator('video').evaluate(v=>({paused:v.paused,source:v.getAttribute('src'),readyState:v.readyState}));
 const painted = await page.evaluate(() => {
  const canvas=document.querySelector('[data-ref="canvasRef"]'), probe=document.createElement('canvas');probe.width=probe.height=8;
  const ctx=probe.getContext('2d');ctx.drawImage(canvas,0,0,8,8);
  return Array.from(ctx.getImageData(0,0,8,8).data);
 });

results.push({name,width,mode,captures,timeline,painted,videoOutcome,network:[...network],url:page.url()});
 fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log(name,JSON.stringify(timeline.filter((v,i,a)=>!i||v.ready!==a[i-1].ready||v.videoReady!==a[i-1].videoReady||v.sample?.tag!==a[i-1].sample?.tag)));
 if(process.env.PROOF_ASSERT==='1'){
  const assert=require('node:assert/strict');
  assert(timeline.some(x=>x.ready),'composed scene becomes ready');
  assert(!timeline.some(x=>x.videoReady&&x.videoOpacity!=='0'),'raw video never becomes a separate scene');
  assert(!timeline.some(x=>x.ready&&Number(x.canvasOpacity)>.02&&Number(x.wordmarkOpacity)>.02),'HTML and canvas wordmarks never overlap during handoff');
  assert(painted.some((v,i)=>i%4!==3&&v>0),'canvas actually paints colour');
  if(!posterCase) assert(!timeline.some(x=>x.ready&&!x.sample),'available poster/video supplies the ready canvas');
  if(posterCase){
   assert(timeline.some(x=>x.ready&&!x.sample),'unavailable media deliberately uses the procedural fallback');
   assert(!timeline.some(x=>x.static),'optional media failure keeps the flock active');
   assert(!timeline.some(x=>x.sample?.tag==='VIDEO'),'video is unavailable in poster fallback coverage');
   if(mode==='poster-slow') assert(timeline.some(x=>x.ready&&x.sample?.tag==='IMG'),'late poster recovers after the three-second deadline');
   else assert(!timeline.some(x=>x.sample),'failed poster stays on the deliberate procedural fallback');
  }
  if(mode==='blocked')assert(!timeline.some(x=>x.ready&&x.sample?.tag==='VIDEO'),'blocked video stays on poster');
  if(mode==='delayed'){
   const firstVideo=timeline.findIndex(x=>x.ready&&x.sample?.tag==='VIDEO');
   if(firstVideo>=0) {
    if(timeline.slice(0,firstVideo).some(x=>x.ready&&x.sample?.tag==='IMG'))
     assert(timeline.some(x=>x.blend>0&&x.blend<1),'video recovering after a painted poster blends into that composition');
   } else {
    // Software WebGL can consume the six-second media deadline. That is a supported failure path.
    assert(timeline.filter(x=>x.ready).every(x=>x.sample?.tag==='IMG'),'unavailable delayed video retains the painted poster');
    assert(videoOutcome.paused&&!videoOutcome.source,'unavailable video is stopped and discarded');
   }
  }
 }
 }
 const video=page.video();await context.close();await video.saveAs(`${out}/${width}-${mode}.webm`);
}
await browser.close();})();
