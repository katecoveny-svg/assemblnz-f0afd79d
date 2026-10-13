/* Synthetic voice-to-real-planner proof. No real media, provider, retailer or DB. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3148';
const out = 'output/playwright/shopper-voice';
const checks = [];
const check = (label, result) => { assert.ok(result,label); checks.push(label); console.log('PASS '+label); };
(async () => {
 fs.mkdirSync(out,{recursive:true});
 const browser = await chromium.launch({headless:true, ...(process.env.ASSEMBL_CHROMIUM_PATH ? {executablePath:process.env.ASSEMBL_CHROMIUM_PATH}: {})});
 const context = await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
 const page = await context.newPage(); page.setDefaultTimeout(30000);
 let owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 const writes=[],errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const profile={displayName:'DO',avatar:'bloom',tone:'warm',responseLength:'brief',initiative:'on_request',preferences:'',voiceName:'Aoede',onboardingCompleted:true,updatedAt:'2026-10-13T00:00:00Z'};
 await context.route('**/*',route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.origin!==origin)return route.abort();
  if(!url.pathname.startsWith('/api/'))return route.continue();
  if(req.method()!=='GET')writes.push(url.pathname);
  if(url.pathname==='/api/do/personal')return route.fulfill({json:{workspaceKey:owner,responsibilities:[],runs:[],worker:{configured:false,lastSeenAt:null}}});
  if(url.pathname==='/api/do/session')return route.fulfill({json:{workspaceKey:owner}});
  if(url.pathname==='/api/do/personal/profile')return route.fulfill({json:{profile,saved:true}});
  if(url.pathname==='/api/do/personal/assistant')return route.fulfill({json:{ready:false,signedIn:true}});
  if(url.pathname==='/api/do/continuity')return route.fulfill({json:{workspaceKey:owner,durable:false,access:{enabled:false}}});
  if(url.pathname==='/api/do/browser-actions')return route.fulfill({json:{protocol:'do.cart.v1',state:'unavailable',canMutateCart:false}});
  if(url.pathname==='/api/do/live-token')return route.fulfill({json:req.method()==='GET'?{enabled:true,configured:true,signedIn:true,remaining:3,dailyLimit:3,sessionSeconds:300,model:'gemini-3.8-live',voiceName:'Aoede',voiceRevision:'a'.repeat(64)}:{token:'fixture-token',model:'gemini-3.8-live',mode:'standard',expiresAt:new Date(Date.now()+300000).toISOString(),config:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Aoede'}}}}}});
  return route.fulfill({status:503,json:{error:'Fixture unavailable'}});
 });
    await page.addInitScript(() => {
      const state = window.__callTest = { tts: 0, mode: 'allow', tracks: [], contextsClosed: 0, sent: [], sockets: [], recorders: [], mediaRequests: 0, audio: [], autoSetup: true, audioPending: false };
      window.speechSynthesis.speak = () => { state.tts++; };
      const media = () => {
        const track = { enabled: true, stopped: false, stop() { this.stopped = true; }, addEventListener() {} };
        state.tracks.push(track);
        return { getTracks: () => [track], getAudioTracks: () => [track] };
      };
      Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
        state.mediaRequests++;
        if (state.mode === 'deny') throw new DOMException('Fictional denied microphone', 'NotAllowedError');
        if (state.mode === 'pending') return new Promise((resolve) => { state.releaseMedia = () => resolve(media()); });
        return media();
      } } });
      class FakeAudioContext {
        constructor() { this.sampleRate = 48000; this.currentTime = 0; this.destination = {}; this.audioWorklet = { addModule: async () => { if (state.audioPending) await new Promise(resolve => { state.releaseAudio = resolve; }); } }; }
        async resume() {}
        async close() { state.contextsClosed++; }
        createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
        createBuffer() { return { copyToChannel() {}, duration: 0.25 }; }
        createBufferSource() { const source = { connect() {}, disconnect() { this.disconnected = true; }, start() {}, stop() { this.stopped = true; } }; state.audio.push(source); return source; }
      }
      window.AudioContext = FakeAudioContext;
      window.AudioWorkletNode = class { constructor() { if (state.recorderFail) throw new Error('Fictional recorder unavailable.'); this.port = { close() {} }; state.recorders.push(this); } connect() {} disconnect() {} };
      const NativeSocket = window.WebSocket;
      class FakeSocket {
        static OPEN = 1; static CLOSING = 2;
        constructor(url) {
          if (!url.includes('generativelanguage.googleapis.com')) return new NativeSocket(url);
          this.readyState = 0; this.bufferedAmount = 0; state.sockets.push(this);
          setTimeout(() => { if (this.readyState !== 0) return; this.readyState = 1; this.onopen?.(); }, 0);
        }
        send(value) {
          const message = JSON.parse(value); state.sent.push(message);
          if (message.setup && state.autoSetup) queueMicrotask(() => {
            this.emit({ setupComplete: {} });
            this.emit({ serverContent: { inputTranscription: { text: 'Dinners for 2 people for 3 nights, budget $90. We have rice.' }, outputTranscription: { text: 'Who should review the outline?' } } });
          });
        }
        emit(value) { this.onmessage?.({ data: JSON.stringify(value) }); }
        close() { this.readyState = 3; this.onclose?.(); }
      }
      window.WebSocket = FakeSocket;
    });

 try {
  await page.goto(origin+'/do/personal',{timeout:120000});
  await page.locator('#personal-assistant-input').fill('');
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.getByRole('region',{name:'Ideas to get started'}).screenshot({path:out+'/shared-tool-cards.png'});
  await page.getByRole('button',{name:'Talk',exact:true}).click();
  const panel=page.locator('.do-live-panel');
  await panel.getByRole('button',{name:'Call DO',exact:true}).click();
  await panel.getByRole('checkbox',{name:/Use my microphone/}).check();
  await panel.getByRole('button',{name:'Start call',exact:true}).click();
  await panel.getByRole('button',{name:'End call',exact:true}).waitFor();
  await panel.locator('.do-live-transcript summary').filter({hasText:'Conversation transcript'}).click();
  await panel.getByRole('button',{name:'Review transcript',exact:true}).click();
  await panel.getByLabel('Review and edit your call notes').fill('Dinners for 2 people for 3 nights, budget $90. We have rice.');
  await panel.getByRole('button',{name:'Review in Shopper DO'}).click();
  const shop=page.locator('#personal-shopping');
  await shop.getByLabel('People',{exact:true}).waitFor();
  check('reviewed call reaches real planner with worker disabled',await shop.getByLabel('People',{exact:true}).inputValue()==='2');
  check('handoff ends microphone and carries no call consent',await page.evaluate(()=>window.__callTest.tracks.every(t=>t.stopped))&&!await panel.getByRole('checkbox',{name:/Use my microphone/}).isChecked());
  await shop.getByLabel('People',{exact:true}).fill('3');
  await shop.getByRole('button',{name:'Use these details · plan dinners'}).click();
  await shop.getByLabel('Night 1 servings').fill('5');
  await shop.getByRole('button',{name:'Back to workspace · keep plan open'}).click();
  await shop.getByRole('button',{name:'Return to shopping plan'}).click();
  check('back and return retain unsaved serving edits',await shop.getByLabel('Night 1 servings').inputValue()==='5');
  await panel.getByRole('button',{name:'Review transcript',exact:true}).click();
  await panel.getByRole('button',{name:'Review in Shopper DO'}).click();
  check('repeat handoff cannot replace open plan',await panel.getByText(/Your existing shopping plan is still open/).isVisible()&&await shop.getByLabel('Night 1 servings').inputValue()==='5');
  page.once('dialog',d=>d.dismiss()); await shop.getByRole('button',{name:'Discard shopping plan',exact:true}).click();
  check('cancel discard retains plan',await shop.getByLabel('Night 1 servings').inputValue()==='5');
  await page.getByRole('link',{name:'Privacy',exact:true}).click();
  await page.getByRole('button',{name:'Stay and keep my work'}).click();
  check('cancel page navigation retains shopping edits',await shop.getByLabel('Night 1 servings').inputValue()==='5');
  const url=page.url();check('private brief never enters URL',!url.includes('Dinners')&&!url.includes('budget'));
  check('brief never enters persistent browser storage',await page.evaluate(()=>!JSON.stringify([Object.entries(localStorage),Object.entries(sessionStorage)]).includes('Dinners for 2')));
  check('no provider permission is reused for persistence',writes.every(p=>p==='/api/do/live-token'));
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  for(const width of [1440,375]){
   await page.setViewportSize({width,height:1000});await shop.locator('#shop-plan-title').evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));
   await page.screenshot({path:out+'/voice-plan-'+width+'.png'});
   check('responsive voice planner '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  owner='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await shop.waitFor({state:'detached'});check('verified account change clears shopping work',true);
  check('fixed saved voice is sent once without browser TTS fallback',await page.evaluate(()=>window.__callTest.tts===0&&window.__callTest.sent.filter(x=>x.setup).every(x=>x.setup.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName==='Aoede')));
  await page.goto(origin+'/do/widget?entry=talk',{timeout:120000});
  await panel.getByRole('button',{name:'Call DO',exact:true}).click();
  await panel.getByRole('checkbox',{name:/Use my microphone/}).check();
  await panel.getByRole('button',{name:'Start call',exact:true}).click();
  await panel.getByRole('button',{name:'End call',exact:true}).waitFor();
  await panel.locator('.do-live-transcript summary').filter({hasText:'Conversation transcript'}).click();
  await panel.getByRole('button',{name:'Review transcript',exact:true}).click();
  await panel.getByLabel('Review and edit your call notes').fill('Dinners for 2 people for 3 nights, budget $90.');
  await panel.getByRole('button',{name:'Review in Shopper DO'}).click();
  const widgetShop=page.getByRole('region',{name:'Shopping plan from reviewed call'});
  await widgetShop.getByLabel('People',{exact:true}).waitFor();
  await widgetShop.getByRole('button',{name:'Use these details · plan dinners'}).click();
  await widgetShop.getByLabel('Night 1 servings').fill('6');
  await page.getByRole('button',{name:'Back to Write',exact:true}).click();
  await page.getByRole('button',{name:'Shopping plan',exact:true}).click();
  check('hosted widget voice opens same planner and retains work across modes',await widgetShop.getByLabel('Night 1 servings').inputValue()==='6');
  await page.evaluate(()=>window.dispatchEvent(new Event('assembl:do-writing-owner-changed')));
  check('widget performs no persistence write',writes.every(p=>p==='/api/do/live-token'));
  check('no uncaught errors',errors.length===0);
  fs.writeFileSync(out+'/results.json',JSON.stringify({checks,writes,errors,scope:'Synthetic accounts/media/sockets; no paid calls, real microphone or retailer action'},null,2));
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
