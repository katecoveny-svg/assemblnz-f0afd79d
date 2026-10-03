/* Repeatable call UI regression proof. Fictional APIs, media and Google socket only.
 * Run against an already running local Next server. Never requests a provider token.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3023';
const out = process.env.ASSEMBL_CALL_REVIEW_OUTPUT || process.env.ASSEMBL_REVIEW_OUTPUT || '/tmp/assembl-personal-call-review';
const checks = [];
function check(name, value) { assert.ok(value, name); checks.push(name); console.log('PASS ' + name); }
const profile = { displayName: 'Moss', avatar: 'bloom', tone: 'warm', responseLength: 'brief', initiative: 'gentle', preferences: 'Fictional test: use short lists.', voiceName: 'Aoede', onboardingCompleted: true, updatedAt: '2026-09-30T03:00:00.000Z' };
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.ASSEMBL_CHROMIUM_PATH || '/usr/bin/chromium', headless: true });
  let proofPage;
  try {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await context.newPage();
    proofPage = page;
    page.setDefaultTimeout(15_000);
    const errors = [], tokens = [], mutations = [], compiles = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/api/do/personal', (route) => {
      if (route.request().method() !== 'GET') mutations.push(route.request().postDataJSON());
      return route.fulfill({ json: { workspaceKey: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', responsibilities: [], runs: [], worker: { configured: true, lastSeenAt: new Date().toISOString() } } });
    });
    await page.route('**/api/do/personal/profile', (route) => route.fulfill({ json: { profile, saved: true } }));
    await page.route('**/api/do/live-token', (route) => {
      if (route.request().method() === 'GET') return route.fulfill({ json: { enabled: true, configured: true, signedIn: true, remaining: 3, dailyLimit: 3, sessionSeconds: 300, model: 'gemini-3.8-live' } });
      tokens.push(route.request().postDataJSON());
      return route.fulfill({ json: { token: 'auth_tokens/browser-test-only', mode: 'standard', model: 'gemini-3.8-live', voiceName: 'Aoede', displayName: 'Moss', expiresAt: new Date(Date.now() + 300_000).toISOString(), config: { responseModalities: ['AUDIO'], systemInstruction: 'Fictional test only', speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } } } } });
    });
    await page.route('**/api/do/live-compile', (route) => { compiles.push(route.request().postDataJSON()); return route.fulfill({ json: { spec: { brief: 'A newer fictional provider brief.' } } }); });
    await page.addInitScript(() => {
      const state = window.__callTest = { mode: 'deny', tracks: [], contextsClosed: 0, sent: [], sockets: [], recorders: [], mediaRequests: 0 };
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
        constructor() { this.sampleRate = 48000; this.currentTime = 0; this.destination = {}; this.audioWorklet = { addModule: async () => {} }; }
        async resume() {}
        async close() { state.contextsClosed++; }
        createMediaStreamSource() { return { connect() {} }; }
      }
      window.AudioContext = FakeAudioContext;
      window.AudioWorkletNode = class { constructor() { this.port = {}; state.recorders.push(this); } connect() {} disconnect() {} };
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
          if (message.setup) queueMicrotask(() => {
            this.emit({ setupComplete: {} });
            this.emit({ serverContent: { inputTranscription: { text: 'Prepare a fictional proposal outline for Friday.' }, outputTranscription: { text: 'Who should review the outline?' } } });
          });
        }
        emit(value) { this.onmessage?.({ data: JSON.stringify(value) }); }
        close() { this.readyState = 3; this.onclose?.(); }
      }
      window.WebSocket = FakeSocket;
    });
    await page.goto(origin + '/do/personal', { waitUntil: 'networkidle', timeout: 120_000 });
    await page.getByRole('button', { name: 'Voice: open voice options', exact: true }).click();
    const panel = page.getByRole('region', { name: 'Call Moss', exact: true });
    await panel.getByRole('button', { name: 'Call Moss', exact: true }).click();
    const consent = panel.getByRole('checkbox', { name: /Use my microphone with Google Gemini/ });
    const start = panel.getByRole('button', { name: 'Start call', exact: true });
    check('no microphone or token before consent', tokens.length === 0 && await page.evaluate(() => window.__callTest.mediaRequests === 0));
    check('call requires separate unselected consent', !await consent.isChecked() && await start.isDisabled());
    await panel.getByText('Profile shared for this call', { exact: true }).click();
    check('personal profile sharing is reviewable', await panel.getByText(profile.preferences, { exact: true }).isVisible());
    check('saved voice is shown and cannot diverge silently', await panel.getByLabel('Voice', { exact: true }).inputValue() === 'Aoede' && await panel.getByLabel('Voice', { exact: true }).isDisabled());
    await consent.check();
    await panel.getByLabel('Conversation', { exact: true }).selectOption('extended');
    check('changing conversation settings revokes earlier consent', !await consent.isChecked() && await start.isDisabled());
    await panel.getByLabel('Conversation', { exact: true }).selectOption('standard');
    await consent.check();
    await start.click();
    await panel.getByText('Microphone access was declined. You can still type to DO.', { exact: true }).waitFor();
    check('denied microphone never reserves a provider session', tokens.length === 0 && !await consent.isChecked());
    await page.evaluate(() => { window.__callTest.mode = 'pending'; });
    await consent.check();
    const before = await page.evaluate(() => window.__callTest.mediaRequests);
    await start.evaluate((button) => { button.click(); button.click(); });
    await panel.getByRole('button', { name: 'Cancel call', exact: true }).waitFor();
    check('repeated start clicks acquire microphone once', await page.evaluate(() => window.__callTest.mediaRequests) === before + 1);
    await panel.getByRole('button', { name: 'Cancel call', exact: true }).click();
    await page.evaluate(() => window.__callTest.releaseMedia());
    await page.waitForFunction(() => window.__callTest.tracks.at(-1)?.stopped);
    check('late microphone permission after cancel is stopped without connecting', tokens.length === 0 && await page.evaluate(() => window.__callTest.sockets.length === 0));
    await page.evaluate(() => { window.__callTest.mode = 'ok'; });
    await consent.check(); await start.click();
    await panel.getByRole('button', { name: 'Mute microphone', exact: true }).waitFor();
    check('call request is limited to consent and saved profile revision', tokens.length === 1 && tokens[0].includeProfile === true && tokens[0].profileUpdatedAt === profile.updatedAt && !('profile' in tokens[0]));
    await page.evaluate(() => window.__callTest.recorders.at(-1).port.onmessage({ data: new ArrayBuffer(8) }));
    const audioBefore = await page.evaluate(() => window.__callTest.sent.filter((message) => message.realtimeInput?.audio).length);
    await panel.getByRole('button', { name: 'Mute microphone', exact: true }).click();
    await page.evaluate(() => window.__callTest.recorders.at(-1).port.onmessage({ data: new ArrayBuffer(8) }));
    check('mute disables track and sends no further microphone frames', await page.evaluate((count) => !window.__callTest.tracks.at(-1).enabled && window.__callTest.sent.filter((message) => message.realtimeInput?.audio).length === count && window.__callTest.sent.some((message) => message.realtimeInput?.audioStreamEnd), audioBefore));
    await panel.getByRole('button', { name: 'Unmute microphone', exact: true }).click();
    await page.evaluate(() => window.__callTest.recorders.at(-1).port.onmessage({ data: new ArrayBuffer(8) }));
    check('unmute resumes microphone frames', await page.evaluate((count) => window.__callTest.tracks.at(-1).enabled && window.__callTest.sent.filter((message) => message.realtimeInput?.audio).length === count + 1, audioBefore));
    await panel.getByText('Conversation transcript · this session', { exact: true }).click();
    await panel.getByRole('button', { name: 'Review transcript for a responsibility', exact: true }).click();
    const review = panel.getByLabel('Review and edit your call notes', { exact: true });
    await review.fill('My explicitly reviewed fictional outline.');
    await page.evaluate(() => { const socket = window.__callTest.sockets.at(-1); const tool = { toolCall: { functionCalls: [{ id: 'brief-one', name: 'compile_do_agent', args: { brief: 'Prepare a fictional proposal' } }] } }; socket.emit(tool); socket.emit(tool); });
    await panel.getByRole('button', { name: 'Review prepared brief', exact: true }).waitFor();
    check('duplicate provider tool calls are compiled once', compiles.length === 1);
    check('new provider brief never overwrites user edits', await review.inputValue() === 'My explicitly reviewed fictional outline.' && await panel.getByRole('button', { name: 'Review prepared brief', exact: true }).isDisabled());
    await review.fill('');
    check('clearing review text keeps the editor available', await review.isVisible());
    await review.fill('My explicitly reviewed fictional outline.');
    await panel.screenshot({ path: out + '/personal-call-mobile.png' });
    await panel.getByRole('button', { name: 'Use reviewed notes in a responsibility', exact: true }).click();
    const editor = page.getByRole('dialog'); await editor.waitFor();
    check('reviewed notes enter an unsaved responsibility editor', await editor.getByLabel('Notes for DO to remember').inputValue() === 'My explicitly reviewed fictional outline.' && mutations.length === 0);
    check('responsibility needs its own fresh consent', !await editor.getByRole('checkbox').isChecked());
    check('transferring notes closes microphone and audio contexts', await page.evaluate(() => window.__callTest.tracks.at(-1).stopped && window.__callTest.contextsClosed >= 2));
    await page.screenshot({ path: out + '/personal-call-reviewed-editor-mobile.png' });
    await editor.getByRole('button', { name: 'Close editor', exact: true }).click();
    await page.evaluate(() => window.__callTest.sockets.at(-1).emit({ serverContent: { outputTranscription: { text: 'STALE VOICE TEXT MUST NOT APPEAR' } } }));
    check('ended session ignores late transcript messages', await page.getByText('STALE VOICE TEXT MUST NOT APPEAR', { exact: false }).count() === 0);
    check('ending the call preserves its reviewable transcript', await panel.getByText('Prepare a fictional proposal outline for Friday.', { exact: false }).isVisible());
    await consent.check(); await start.click();
    await panel.getByRole('button', { name: 'End call', exact: true }).waitFor();
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
    await panel.getByText('Call ended because this page was hidden. Your microphone is off.', { exact: true }).waitFor();
    check('backgrounding immediately closes microphone and socket', await page.evaluate(() => window.__callTest.tracks.at(-1).stopped && window.__callTest.sockets.at(-1).readyState === 3));
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); });
    await consent.check(); await start.click();
    await panel.getByRole('button', { name: 'End call', exact: true }).waitFor();
    await page.evaluate(() => window.__callTest.sockets.at(-1).onerror());
    await panel.getByText('The voice connection failed. Your microphone is off.', { exact: true }).waitFor();
    check('socket errors stop microphone and require fresh consent for retry', !await consent.isChecked() && await page.evaluate(() => window.__callTest.tracks.at(-1).stopped));
    await consent.check(); await start.click();
    await panel.getByRole('button', { name: 'End call', exact: true }).click();
    check('explicit End call stops microphone', await page.evaluate(() => window.__callTest.tracks.at(-1).stopped));
    check('375px call panel fits viewport', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check('no browser runtime errors', errors.length === 0);
    fs.writeFileSync(out + '/results.json', JSON.stringify({ checks, errors, apiMode: 'fictional intercepted fixtures; mocked media and Google WebSocket', liveProviderTested: false, realMicrophoneTested: false }, null, 2));
  } finally {
    if (proofPage) await proofPage.screenshot({ path: out + '/final-state.png', fullPage: true }).catch(() => {});
    if (!fs.existsSync(out + '/results.json')) fs.writeFileSync(out + '/results.json', JSON.stringify({ checks, completed: false, apiMode: 'Fictional fixtures only; see CI failure log', liveProviderTested: false }, null, 2));
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
