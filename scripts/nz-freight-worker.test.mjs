import test from 'node:test';
import assert from 'node:assert/strict';
import { runOfflineParser } from '../security-proposals/nz-plugin-hosting/parser-supervisor.mjs';
const url = 'https://www.customs.govt.nz/media/tybjeibz/currentexchange.xml';
const xml = '<exchangeRateList><exchangeRate><countryName>Fictional country</countryName><currencyCode>USD</currencyCode><dateNow>2026-10-11</dateNow><rateNow>0.56</rateNow><dateFuture>2026-10-25</dateFuture><rateFuture>0.55</rateFuture><currencyName>Dollar</currencyName></exchangeRate></exchangeRateList>';
const now = Date.parse('2026-10-01T23:00:00Z');
const input = { kind: 'fx', args: { currency: 'USD', entryDate: '2026-10-11' }, now, snapshots: [{ url, observedAt: now, bytesBase64: Buffer.from(xml).toString('base64') }] };
test('offline bounded worker reuses actual strict parser/projection and returns memory telemetry', async () => {
  const p = await runOfflineParser(input);
  assert.equal(p.state, 'complete'); assert.equal(p.result.state, 'found'); assert.equal(p.result.rates[0].foreignPerNzd, '0.56');
  assert.ok(p.metrics.peakRssBytes < 512 * 1024 * 1024); assert.equal(p.metrics.credentialScope, 'explicit_clean_child_env_only');
});
test('arbitrary URLs, raw fields, invalid archives and oversized source bytes fail without echoed body', async () => {
  for (const p of [{ ...input, instruction: 'PRIVATE FIXTURE' }, { ...input, snapshots: [{ ...input.snapshots[0], url: 'https://private.invalid' }] }, { ...input, snapshots: [{ ...input.snapshots[0], bytesBase64: Buffer.alloc(65537).toString('base64') }] }, { kind: 'tariff', args: { code: '3901100001E', entryDate: '2026-10-01' }, now, snapshots: [{ url: 'https://www.customs.govt.nz/media/0nmaamqd/tariff.tar.gz', observedAt: now, bytesBase64: Buffer.from('PRIVATE FIXTURE corrupt archive').toString('base64') }] }]) {
    const out = await runOfflineParser(p); assert.ok(out.state === 'unavailable' || out.result?.state === 'unavailable'); assert.ok(!JSON.stringify(out).includes('PRIVATE FIXTURE'));
  }
});
test('process deadline and caller abort terminate actual child without returning parsed data', async () => {
  const expired = await runOfflineParser(input, { fixtureDeadlineMs: 1 });
  assert.equal(expired.state, 'unavailable'); assert.equal(expired.terminationObserved, true);
  const controller = new AbortController(); const pending = runOfflineParser(input, { signal: controller.signal }); controller.abort();
  const aborted = await pending; assert.equal(aborted.state, 'unavailable'); assert.equal(aborted.terminationObserved, true);
  assert.equal((await runOfflineParser(input, { fixtureDeadlineMs: 3001 })).state, 'unavailable');
});
