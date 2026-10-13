/* Synthetic reviewed voice-to-mail handoff proof. No real media, provider, retailer or DB. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3000';
const out = 'output/playwright/do-mail-voice';
const checks = [];
const check = (label, result) => { assert.ok(result,label); checks.push(label); console.log('PASS '+label); };
(async () => {
 fs.mkdirSync(out,{recursive:true});
 const browser = await chromium.launch({headless:true, ...(process.env.ASSEMBL_CHROMIUM_PATH ? {executablePath:process.env.ASSEMBL_CHROMIUM_PATH}: {})});
 const context = await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
 const page = await context.newPage(); page.setDefaultTimeout(30000);
 let owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 let continuityOwner=null, delaySession=false;
 const pendingSessions=[];
 const writes=[],errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const profile={displayName:'DO',avatar:'bloom',tone:'warm',responseLength:'brief',initiative:'on_request',preferences:'',voiceName:'Aoede',onboardingCompleted:true,updatedAt:'2026-10-13T00:00:00Z'};
 await context.route('**/*',route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.origin!==origin)return route.abort();
  if(!url.pathname.startsWith('/api/'))return route.continue();
  if(req.method()!=='GET')writes.push(url.pathname);
  if(url.pathname==='/api/do/mail')return route.fulfill({json:{ownerId:owner,metadataOnly:true,mailboxRead:false,accountsAvailable:true,accounts:[{id:'gmail_two',label:'Fictional admin',provider:'gmail',state:'gmail_read_unverified',scopeVerified:false}]}});
  if(url.pathname==='/api/do/personal')return route.fulfill({json:{workspaceKey:owner,responsibilities:[],runs:[],worker:{configured:false,lastSeenAt:null}}});
  if(url.pathname==='/api/do/session'){if(delaySession){pendingSessions.push({route,owner});return;}return route.fulfill({json:{workspaceKey:owner}});}
  if(url.pathname==='/api/do/personal/profile')return route.fulfill({json:{profile,saved:true}});
  if(url.pathname==='/api/do/personal/assistant')return route.fulfill({json:{ready:false,signedIn:true}});
  if(url.pathname==='/api/do/continuity')return route.fulfill({json:{workspaceKey:continuityOwner||owner,durable:!!continuityOwner,access:{enabled:!!continuityOwner}}});
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
            this.emit({ serverContent: { inputTranscription: { text: 'Find Example Clinic correspondence.' }, outputTranscription: { text: 'Who should review the outline?' } } });
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
  await page.getByRole('button',{name:'Talk',exact:true}).click();
  const panel=page.locator('.do-live-panel');
  await panel.getByRole('button',{name:'Call DO',exact:true}).click();
  await panel.getByRole('checkbox',{name:/Use my microphone/}).check();
  await panel.getByRole('button',{name:'Start call',exact:true}).click();
  await panel.getByRole('button',{name:'End call',exact:true}).waitFor();
  await panel.locator('.do-live-transcript summary').filter({hasText:'Conversation transcript'}).click();
  await panel.getByRole('button',{name:'Review transcript',exact:true}).click();
  await panel.getByLabel('Review and edit your call notes').fill('Find Example Clinic correspondence and prepare a task draft.');
  await panel.getByRole('button',{name:'Review correspondence in my DO'}).click();
  const mail=page.locator('#personal-mail');
  await mail.getByLabel('Mail account',{exact:true}).waitFor();
  check('reviewed request reaches mail review',await mail.getByText('Find Example Clinic correspondence and prepare a task draft.',{exact:true}).isVisible());
  check('microphone stops before mail review',await page.evaluate(()=>window.__callTest.tracks.every(t=>t.stopped)));
  check('call consent revoked and mail consent is fresh',!await panel.getByRole('checkbox',{name:/Use my microphone/}).isChecked()&&!await mail.getByRole('checkbox',{name:/Allow DO to search/}).isChecked());
  check('no mailbox read is triggered by voice handoff',writes.every(path=>path==='/api/do/live-token'));
  await mail.getByLabel('Task draft · unsent').fill('Synthetic task to retain');
  await panel.getByRole('button',{name:'Review transcript',exact:true}).click();
  await panel.getByLabel('Review and edit your call notes').fill('Replacement request');
  await panel.getByRole('button',{name:'Review correspondence in my DO'}).click();
  check('second handoff cannot replace existing mail work',await mail.getByLabel('Task draft · unsent').inputValue()==='Synthetic task to retain');
  check('rejected call notes remain reviewable',await panel.getByLabel('Review and edit your call notes').inputValue()==='Replacement request');
  for(const width of [1440,375]){
    await page.setViewportSize({width,height:1000});
    await mail.scrollIntoViewIfNeeded();
    await page.screenshot({path:out+'/mail-voice-'+width+'.png'});
    check('voice destination fits '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  check('reviewed request never enters URL/storage',!page.url().includes('Example')&&await page.evaluate(()=>!JSON.stringify([Object.entries(localStorage),Object.entries(sessionStorage)]).includes('Example Clinic')));
  owner='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await mail.waitFor({state:'detached'});
  check('owner switch clears mail request and task',true);
  check('no uncaught errors',errors.length===0);
  fs.writeFileSync(out+'/proof.json',JSON.stringify({checks,writes,errors,scope:'Synthetic media and accounts; no live mailbox/provider'},null,2));
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
