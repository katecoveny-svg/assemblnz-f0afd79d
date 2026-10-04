import { beforeEach, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({ auth: vi.fn(), require: vi.fn(), state: vi.fn(), get: vi.fn(), receive: vi.fn(), from: vi.fn(), audit: vi.fn() }));
vi.mock('@/lib/mcp/auth', () => ({ authenticateMcpRequest: m.auth, hasMcpPermission: (p: { permissions: string[] }, v: string) => p.permissions.includes(v) }));
vi.mock('@/apps/do/enquiries/service', () => ({ EnquiryError: class extends Error { status = 403; }, requireEnquiryOwner: m.require, enquiryState: m.state, getEnquiry: m.get, receiveEnquiry: m.receive }));
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: () => ({ from: m.from }) }));
import { POST } from './route';
const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const id = '11111111-1111-4111-8111-111111111111';
const principal = { userId: owner, tenant: `do-enquiries:${owner}`, permissions: ['work.read', 'proof.read', 'work.create'], authMode: 'oauth', clientId: 'client-1' };
function req(method: string, params: unknown = {}, origin?: string) { return new Request('https://www.assembl.co.nz/api/mcp', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', ...(origin ? { origin } : {}) }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) }); }
async function payload(response: Response) {
  const text = await response.text();
  if (text.startsWith('event:') || text.startsWith('data:')) return JSON.parse(text.split('\n').find(line => line.startsWith('data:'))!.slice(5));
  return JSON.parse(text);
}
beforeEach(() => {
  vi.resetAllMocks(); m.auth.mockResolvedValue({ ok: true, principal });
  m.from.mockImplementation((name: string) => {
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(), insert: m.audit, single: vi.fn(), update: vi.fn() };
    query.select.mockReturnValue(query); query.eq.mockReturnValue(query); query.update.mockReturnValue(query); m.audit.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: { permissions: principal.permissions }, error: null });
    query.single.mockResolvedValue({ data: { id: 'audit-id' }, error: null });
    if (name === 'assembl_audit_log') query.eq.mockResolvedValue({ error: null });
    return query;
  });
});
it('returns OAuth discovery challenge before reading data', async () => {
  m.auth.mockResolvedValue({ ok: false, status: 401, error: 'missing_bearer_token' });
  const response = await POST(req('tools/list'));
  expect(response.status).toBe(401); expect(response.headers.get('www-authenticate')).toContain('/.well-known/oauth-protected-resource/api/mcp');
  expect(m.require).not.toHaveBeenCalled();
});
it('rejects hostile origins and legacy shared tokens', async () => {
  expect((await POST(req('tools/list', {}, 'https://evil.invalid'))).status).toBe(403);
  m.auth.mockResolvedValue({ ok: true, principal: { ...principal, authMode: 'legacy-dev' } });
  expect((await POST(req('tools/list'))).status).toBe(403);
});
it('serves real SDK tool discovery with no approve or send tools', async () => {
  const result = await payload(await POST(req('tools/list')));
  expect(result.result.tools.map((t: { name: string }) => t.name)).toEqual(['list_enquiries', 'get_enquiry_evidence', 'prepare_enquiry_reply']);
});
it('binds evidence to the authenticated owner and records the call', async () => {
  m.get.mockResolvedValue({ id, status: 'sent', provider_id: 'test-receipt', evidence: [] });
  const response = await POST(req('tools/call', { name: 'get_enquiry_evidence', arguments: { id, ownerId: 'someone-else' } }));
  const result = await payload(response);
  expect(result.result.isError).not.toBe(true); expect(m.get).toHaveBeenCalledWith(owner, id);
  expect(m.audit).toHaveBeenCalledWith(expect.objectContaining({ user_id: owner, tool_name: 'get_enquiry_evidence', tool_input: { jobId: id } }));
});
it('enforces per-tool permissions before reading evidence', async () => {
  m.auth.mockResolvedValue({ ok: true, principal: { ...principal, permissions: ['work.read'] } });
  const result = await payload(await POST(req('tools/call', { name: 'get_enquiry_evidence', arguments: { id } })));
  expect(result.result.isError).toBe(true); expect(m.get).not.toHaveBeenCalled();
});
it('does not serve a revoked enquiry membership through another workspace', async () => {
  const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }; query.select.mockReturnValue(query); query.eq.mockReturnValue(query); m.from.mockReturnValue(query);
  expect((await POST(req('tools/list'))).status).toBe(403);
});
