/* Offline UI proof: fictional accounts/storage, fake media and sockets, no provider traffic. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3129';
const out = process.env.ASSEMBL_REVIEW_OUTPUT || 'output/playwright/voice-choice';
const checks = [];
function check(label, result) { assert.ok(result, label); checks.push(label); console.log('PASS ' + label); }
(async () => {
  fs.mkdirSync(out, { recursive: true });
  fs.rmSync(out + '/results.json', { force: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.ASSEMBL_CHROMIUM_PATH ? { executablePath: process.env.ASSEMBL_CHROMIUM_PATH } : {}) });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    let profile = { displayName: 'DO', avatar: 'bloom', tone: 'warm', responseLength: 'balanced', initiative: 'gentle', preferences: '', voiceName: 'Kore', onboardingCompleted: false, updatedAt: null };
    let revision = 'a'.repeat(64), saved = false, version = 0;
    const tokens = [], saves = [], errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) return route.abort();
      if (!url.pathname.startsWith('/api/')) return route.continue();
      const method = route.request().method();
      if (url.pathname === '/api/do/personal/profile') {
        if (method === 'POST') {
          const { consent, ...input } = route.request().postDataJSON();
          assert.equal(consent, true); saves.push(input);
          profile = { ...input, updatedAt: new Date(Date.UTC(2026, 9, 13, 3, 0, ++version)).toISOString() }; saved = true; revision = version.toString(16).padStart(64, '0');
        }
        return route.fulfill({ json: { profile, saved } });
      }
      if (url.pathname === '/api/do/live-token') {
        if (method === 'GET') return route.fulfill({ json: { enabled: true, configured: true, signedIn: true, remaining: 3, dailyLimit: 3, sessionSeconds: 300, model: 'gemini-3.8-live', voiceName: profile.voiceName, voiceRevision: revision } });
        const input = route.request().postDataJSON(); tokens.push(input);
        if (input.voiceName !== profile.voiceName || input.voiceRevision !== revision || (input.includeProfile && input.profileUpdatedAt !== profile.updatedAt)) return route.fulfill({ status: 409, json: { error: 'Fictional stale profile review' } });
        return route.fulfill({ json: { token: 'auth_tokens/fictional-only', model: 'gemini-3.8-live', mode: 'standard', voiceName: profile.voiceName, expiresAt: new Date(Date.now() + 300000).toISOString(), config: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: profile.voiceName } } } } } });
      }
      if (url.pathname === '/api/do/personal') return route.fulfill({ json: { workspaceKey: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', responsibilities: [], runs: [], worker: { configured: false, lastSeenAt: null } } });
      return route.fulfill({ status: 503, json: { error: 'Fictional offline test' } });
    });
    await page.addInitScript(() => {
      const state = window.__callTest = { mode: 'deny', tracks: [], contextsClosed: 0, sent: [], sockets: [], recorders: [], mediaRequests: 0, audio: [], autoSetup: true, audioPending: false };
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
            this.emit({ serverContent: { inputTranscription: { text: 'Prepare a fictional proposal outline for Friday.' }, outputTranscription: { text: 'Who should review the outline?' } } });
          });
        }
        emit(value) { this.onmessage?.({ data: JSON.stringify(value) }); }
        close() { this.readyState = 3; this.onclose?.(); }
      }
      window.WebSocket = FakeSocket;
    });
    await page.goto(origin + '/do/widget?entry=talk', { waitUntil: 'networkidle', timeout: 120000 });
    const panel = page.locator('.do-live-panel');
    await panel.getByRole('button', { name: 'Call DO', exact: true }).click();
    await panel.getByRole('button', { name: 'Choose call voice', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Your call voice').selectOption('Puck');
    check('male choices have provider descriptions', (await dialog.textContent()).includes('Puck · male · upbeat') && (await dialog.textContent()).includes('Charon · male · informative'));
    check('voice change needs storage consent', await dialog.getByRole('button', { name: 'Save call voice' }).isDisabled());
    check('settings do not acquire microphone or token', tokens.length === 0 && await page.evaluate(() => window.__callTest.mediaRequests === 0));
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 1000 });
      await dialog.screenshot({ path: out + `/voice-settings-${width}.png` });
      check(`no horizontal overflow at ${width}`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Save call voice' }).click();
    await dialog.waitFor({ state: 'hidden' });
    await panel.getByText('Call voice: Puck · male · upbeat', { exact: true }).first().waitFor();
    check('save reuses profile field and preserves DO name', saves.length === 1 && saves[0].voiceName === 'Puck' && saves[0].displayName === 'DO');
    const consent = panel.getByRole('checkbox', { name: /Use my microphone/ });
    check('saving does not grant call consent', !await consent.isChecked());
    await page.evaluate(() => { window.__callTest.mode = 'allow'; });
    await consent.check();
    await panel.getByRole('button', { name: 'Start call', exact: true }).click();
    await panel.getByRole('button', { name: 'End call', exact: true }).waitFor();
    check('next call uses the saved voice', tokens.length === 1 && tokens[0].voiceName === 'Puck');
    profile = { ...profile, voiceName: 'Charon', updatedAt: '2026-10-13T02:00:00Z' }; revision = 'c'.repeat(64);
    await page.evaluate(() => window.dispatchEvent(new Event('pageshow')));
    await page.waitForTimeout(200);
    check('active call keeps its voice and socket', (await panel.textContent()).includes('Puck · male · upbeat') && await page.evaluate(() => window.__callTest.sockets.length === 1 && window.__callTest.sockets[0].readyState === 1));
    await panel.getByRole('button', { name: 'End call', exact: true }).click();
    await panel.getByText('Call voice: Charon · male · informative', { exact: true }).first().waitFor();
    check('ending refreshes next-call voice and requires fresh consent', !await consent.isChecked());
    await consent.check(); await panel.getByRole('button', { name: 'Start call', exact: true }).click();
    await panel.getByRole('button', { name: 'End call', exact: true }).waitFor();
    check('restart uses the newly saved voice', tokens.length === 2 && tokens[1].voiceName === 'Charon');
    await panel.getByRole('button', { name: 'End call', exact: true }).click();
    await page.reload({ waitUntil: 'networkidle' });
    await panel.getByText('Call voice: Charon · male · informative', { exact: true }).waitFor();
    check('saved voice persists across widget reload (Mac uses this hosted surface)', true);
    await page.goto(origin + '/do/personal', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Talk', exact: true }).click();
    await panel.getByText('Call voice: Charon · male · informative', { exact: true }).waitFor();
    check('Personal DO loads the same saved voice', true);
    await page.screenshot({ path: out + '/personal-saved-voice-375.png', fullPage: false });

    // Exercise the two real mounted settings instances with a populated account.
    // Collect both save orders before failing, so the pre-fix run proves both losses.
    const regressions = [];
    const record = (label, passed, detail) => { regressions.push({ label, passed, detail }); console.log((passed ? 'PASS ' : 'FAIL ') + label); };
    const seeded = { displayName: 'Mira', avatar: 'orbit', tone: 'direct', responseLength: 'detailed', initiative: 'on_request', preferences: 'Keep my populated preferences.', voiceName: 'Kore', onboardingCompleted: true };
    async function openPopulated() {
      profile = { ...seeded, updatedAt: new Date(Date.UTC(2026, 9, 13, 3, 0, ++version)).toISOString() };
      saved = true; revision = version.toString(16).padStart(64, '0');
      await page.goto(origin + '/do/personal', { waitUntil: 'networkidle' });
      await page.locator('header').getByRole('button', { name: 'Customise Mira', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Talk', exact: true }).click();
      await panel.getByRole('button', { name: 'Call Mira', exact: true }).click();
      await panel.getByRole('button', { name: 'Choose call voice', exact: true }).waitFor();
      await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Choose call voice' && !b.disabled));
    }
    async function saveVoice(voice) {
      await panel.getByRole('button', { name: 'Choose call voice', exact: true }).click();
      await dialog.getByLabel('Your call voice').selectOption(voice);
      await dialog.getByRole('checkbox').check();
      await dialog.getByRole('button', { name: 'Save call voice', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
    }
    async function saveHeader(name, preferences, voice) {
      await page.locator('header').getByRole('button', { name: /Customise / }).click();
      await dialog.getByLabel('What shall we call your DO?').fill(name);
      await dialog.getByRole('button', { name: 'Next', exact: true }).click();
      await dialog.getByRole('button', { name: 'Next', exact: true }).click();
      await dialog.getByLabel('Anything else about how you like to work?').fill(preferences);
      if (voice) await dialog.getByLabel('Your call voice').selectOption(voice);
      await dialog.getByRole('checkbox').check();
      await dialog.getByRole('button', { name: 'Save my DO', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
    }
    await openPopulated();
    await saveVoice('Puck');
    await saveHeader('Mira edited', 'Keep the new header preferences.');
    record('voice then header preserves the saved voice and unrelated populated fields',
      profile.voiceName === 'Puck' && profile.displayName === 'Mira edited' && profile.preferences === 'Keep the new header preferences.' && profile.avatar === 'orbit' && profile.tone === 'direct' && profile.responseLength === 'detailed' && profile.initiative === 'on_request', { ...profile });

    await openPopulated();
    await consent.check();
    const idleMedia = await page.evaluate(() => window.__callTest.mediaRequests);
    const idleTokens = tokens.length;
    await saveHeader('Mira revised', 'New preferences must survive voice save.', 'Charon');
    await panel.getByText('Call voice: Charon · male · informative', { exact: true }).first().waitFor({ timeout: 5000 }).catch(() => {});
    const reviewed = (await panel.textContent()).includes('Call voice: Charon · male · informative');
    record('header revision refreshes idle call and invalidates consent without microphone or token',
      reviewed && !await consent.isChecked() && await page.evaluate(() => window.__callTest.mediaRequests) === idleMedia && tokens.length === idleTokens,
      { reviewed, consent: await consent.isChecked(), media: await page.evaluate(() => window.__callTest.mediaRequests), tokens: tokens.length });
    await saveVoice('Puck');
    record('header then voice preserves the new name, preferences and populated style',
      profile.displayName === 'Mira revised' && profile.preferences === 'New preferences must survive voice save.' && profile.avatar === 'orbit' && profile.tone === 'direct' && profile.responseLength === 'detailed' && profile.initiative === 'on_request' && profile.voiceName === 'Puck', { ...profile });
    fs.writeFileSync(out + '/dual-settings-results.json', JSON.stringify(regressions, null, 2));
    check('both real settings instances preserve sequential saves and idle review', regressions.every(r => r.passed));
    await panel.getByText('Call voice: Puck · male · upbeat', { exact: true }).first().waitFor();

    await page.evaluate(() => { window.__callTest.mode = 'allow'; });
    await consent.check();
    await panel.getByRole('button', { name: 'Start call', exact: true }).click();
    await panel.getByRole('button', { name: 'End call', exact: true }).waitFor();
    check('call after dual settings saves uses the fresh full profile revision', tokens.at(-1).profileUpdatedAt === profile.updatedAt && tokens.at(-1).voiceName === 'Puck');
    const activeSockets = await page.evaluate(() => window.__callTest.sockets.length);
    await saveHeader('Mira active edit', 'Apply after this call.', 'Charon');
    check('header save during a call preserves its voice and live socket', (await panel.textContent()).includes('Call voice: Puck · male · upbeat') && await page.evaluate(() => !window.__callTest.tracks.at(-1).stopped && window.__callTest.sockets.at(-1).readyState === 1 && window.__callTest.sockets.length) === activeSockets);
    await panel.getByRole('button', { name: 'End call', exact: true }).click();
    await panel.getByText('Call voice: Charon · male · informative', { exact: true }).first().waitFor();
    check('active header edit is reviewed only for the next call', !await consent.isChecked());

    check('no browser runtime errors', errors.length === 0);
    fs.writeFileSync(out + '/results.json', JSON.stringify({ checks, errors, tokens: tokens.map(({ voiceName, includeProfile }) => ({ voiceName, includeProfile })), microphone: 'mock only', provider: 'mock only' }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
