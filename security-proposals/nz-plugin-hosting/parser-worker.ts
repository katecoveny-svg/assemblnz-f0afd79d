/** OFFLINE proposed child only: supplied bounded public bytes, no env resolver/network/files. */
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { CUSTOMS_URLS, createCustomsReferences, tariffInput, fxInput } from '../../lib/nz-evidence/customs-public';
import { tariffOutput, fxOutput } from '../../plugins/mcp-servers/mcp-nz-evidence/src/output-schemas';
const source = z.object({ url: z.enum([CUSTOMS_URLS.tariff, CUSTOMS_URLS.currentFx, CUSTOMS_URLS.historicFx]), bytesBase64: z.string().max(11272192), observedAt: z.number().int().min(0).max(8640000000000000) }).strict();
const job = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('tariff'), args: tariffInput, snapshots: z.array(source).length(1), now: z.number().int().min(0).max(8640000000000000) }).strict(),
  z.object({ kind: z.literal('fx'), args: fxInput, snapshots: z.array(source).min(1).max(2), now: z.number().int().min(0).max(8640000000000000) }).strict(),
]);
globalThis.fetch = async () => { throw new Error('Offline supplied-source worker'); };
const input: Buffer[] = []; let inputBytes = 0;
process.stdin.on('data', (c: Buffer) => { inputBytes += c.length; if (inputBytes > 12 * 1024 * 1024) process.exit(2); input.push(c); });
process.stdin.on('end', async () => {
  try {
    const p = job.parse(JSON.parse(Buffer.concat(input).toString('utf8')));
    const snapshots = new Map(); let bytes = 0;
    for (const s of p.snapshots) {
      if (s.bytesBase64.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(s.bytesBase64)) throw new Error();
      const b = Buffer.from(s.bytesBase64, 'base64'); if (b.toString('base64') !== s.bytesBase64) throw new Error(); bytes += b.length;
      const cap = s.url === CUSTOMS_URLS.currentFx ? 65536 : 8 * 1024 * 1024;
      if (b.length > cap || bytes > 8 * 1024 * 1024 + 65536 || snapshots.has(s.url)) throw new Error();
      snapshots.set(s.url, { url: s.url, bytes: new Uint8Array(b), sha256: createHash('sha256').update(b).digest('hex'), observedAt: s.observedAt });
    }
    if (p.kind === 'tariff' ? !snapshots.has(CUSTOMS_URLS.tariff) : snapshots.has(CUSTOMS_URLS.tariff)) throw new Error();
    const references = createCustomsReferences(async url => { const s = snapshots.get(url); if (!s) throw new Error(); return s; }, () => p.now);
    const result = p.kind === 'tariff' ? tariffOutput.parse(await references.tariff(p.args)) : fxOutput.parse(await references.fx(p.args));
    const memory = process.memoryUsage();
    const output = JSON.stringify({ state: 'complete', result, metrics: { rssBytes: memory.rss, peakRssBytes: process.resourceUsage().maxRSS * 1024, externalBytes: memory.external, heapUsedBytes: memory.heapUsed, credentialScope: 'explicit_clean_child_env_only' } });
    if (Buffer.byteLength(output) > 524288) throw new Error();
    process.stdout.write(output, () => process.exit(0));
  } catch { process.stdout.write('{"state":"unavailable"}', () => process.exit(0)); }
});
