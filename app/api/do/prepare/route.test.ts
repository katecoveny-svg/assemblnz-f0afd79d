import { beforeEach, describe, expect, it, vi } from 'vitest';
const model = vi.hoisted(() => ({ prepare: vi.fn() }));
vi.mock('@/apps/do/shared/preparation-server', () => ({ prepareDoDraft: model.prepare, DoPreparationError: class extends Error {} }));
vi.mock('@/lib/agents/chat-rate-limit', () => ({ chatClientIp: (headers: Headers) => headers.get('x-test-ip') || 'do-route-tests', checkChatRateLimit: async () => ({ allowed: true }) }));
import { POST, OPTIONS } from './route';
import { POST as legacyCompile } from '../agents/compile/route';
import { GET as legacyList } from '../agents/route';
import { POST as legacyApprove } from '../agents/[id]/approve/route';
import { readDoJson } from '@/apps/do/shared/http';

let ip = 0;
function request(body: unknown, origin = 'https://www.assembl.co.nz') {
  return new Request('https://www.assembl.co.nz/api/do/prepare', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, 'x-test-ip': `ip-${ip++}` }, body: JSON.stringify(body) });
}
const input = { task: 'brief', source: 'A document chosen by this visitor.', consent: true };
beforeEach(() => { model.prepare.mockReset(); model.prepare.mockResolvedValue({ id: 'own-draft', status: 'draft' }); });

describe('public DO preparation boundary', () => {
  it('rejects a foreign site before model invocation', async () => {
    const response = await POST(request(input, 'https://unrelated.example'));
    expect(response.status).toBe(403); expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull(); expect(model.prepare).not.toHaveBeenCalled();
  });
  it('accepts explicit consent from the same site and installed extension without cookies', async () => {
    for (const origin of ['https://www.assembl.co.nz', 'chrome-extension://' + 'a'.repeat(32)]) {
      const response = await POST(request(input, origin));
      expect(response.status).toBe(200); expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBeNull();
    }
  });
  it('rejects missing consent, invalid data and large text before generation', async () => {
    for (const invalid of [{ ...input, consent: false }, { ...input, source: { private: true } }, { ...input, source: 'x'.repeat(12_001) }]) {
      expect((await POST(request(invalid))).status).toBe(400);
    }
    expect(model.prepare).not.toHaveBeenCalled();
  });
  it('accepts the browser host when Next normalises the local request URL', async () => {
    const req = new Request('http://localhost:8790/api/do/prepare', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://127.0.0.1:8790', Host: '127.0.0.1:8790', 'x-test-ip': 'local-host-test' },
      body: JSON.stringify(input),
    });
    expect((await POST(req)).status).toBe(200);
  });
  it('caps a streamed request even without Content-Length', async () => {
    const req = request({ ...input, source: 'x'.repeat(70_000) });
    await expect(readDoJson(req)).rejects.toThrow('too_large');
  });
  it('returns a retryable failure without leaking provider errors', async () => {
    model.prepare.mockRejectedValue(new Error('provider secret detail'));
    const response = await POST(request(input)); expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('provider secret detail');
  });
  it('supports only approved preflight origins', () => {
    expect(OPTIONS(request(input)).status).toBe(204);
    expect(OPTIONS(request(input, 'null')).status).toBe(403);
  });
  it('retires shared list, compile and approval routes without returning visitor records', async () => {
    for (const action of [legacyCompile, legacyList, legacyApprove]) {
      const response = action(); expect(response.status).toBe(410);
      expect((await response.json()).error).toBe('preview_retired');
    }
  });
  it('rate limits repeated requests from one visitor before repeated generation', async () => {
    const make = () => new Request('https://www.assembl.co.nz/api/do/prepare', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://www.assembl.co.nz', 'x-test-ip': 'rate-boundary-test' }, body: JSON.stringify(input) });
    for (let count = 0; count < 6; count++) expect((await POST(make())).status).toBe(200);
    const limited = await POST(make()); expect(limited.status).toBe(429); expect(limited.headers.get('Retry-After')).toBe('60');
  });
});
