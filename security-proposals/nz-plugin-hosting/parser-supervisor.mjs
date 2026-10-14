import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
const worker = resolve(import.meta.dirname, '../../.local-plugin-packages/freight-parser-proposal/worker.mjs');
/** Offline proposal proof. Immutable entry, clean env, bounded input/output, hard process kill.
 * RSS telemetry/discard is NOT OS memory containment or parent-function credential isolation.
 * A future caller must retain its lease on unconfirmed termination, never assume cancellation.
 */
export async function runOfflineParser(job, { signal, fixtureDeadlineMs = 3000 } = {}) {
  if (signal?.aborted || !Number.isInteger(fixtureDeadlineMs) || fixtureDeadlineMs < 1 || fixtureDeadlineMs > 3000) return { state: 'unavailable' };
  let input;
  try { input = JSON.stringify(job); if (Buffer.byteLength(input) > 12 * 1024 * 1024) throw new Error(); }
  catch { return { state: 'unavailable' }; }
  return new Promise(resolveResult => {
    const p = spawn(process.execPath, ['--max-old-space-size=256', worker], { env: { NODE_ENV: 'production', LANG: 'C', TZ: 'UTC' }, stdio: ['pipe', 'pipe', 'pipe'] });
    let bytes = 0, errors = 0, done = false, forced = false, confirmation; const chunks = [];
    const complete = value => { if (done) return; done = true; clearTimeout(timer); clearTimeout(confirmation); signal?.removeEventListener('abort', terminate); resolveResult(value); };
    const terminate = () => {
      if (done || forced) return; forced = true; p.kill('SIGKILL');
      confirmation = setTimeout(() => complete({ state: 'unavailable', terminationObserved: false }), 100);
    };
    const timer = setTimeout(terminate, fixtureDeadlineMs);
    signal?.addEventListener('abort', terminate, { once: true });
    p.stdout.on('data', c => { if (forced || done) return; bytes += c.length; if (bytes > 524288) terminate(); else chunks.push(c); });
    p.stderr.on('data', c => { if (forced || done) return; errors += c.length; if (errors > 4096) terminate(); });
    p.on('error', terminate); p.stdin.on('error', terminate);
    p.on('close', code => {
      if (done) return;
      if (forced) { complete({ state: 'unavailable', terminationObserved: true }); return; }
      try {
        const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (code !== 0 || value.state !== 'complete' || !Number.isSafeInteger(value.metrics?.peakRssBytes) || value.metrics.peakRssBytes > 512 * 1024 * 1024) throw new Error();
        complete(value);
      } catch { complete({ state: 'unavailable', terminationObserved: true }); }
    });
    p.stdin.end(input);
  });
}
