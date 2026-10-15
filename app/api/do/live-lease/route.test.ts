import { beforeEach, expect, it, vi } from 'vitest';
const calls = vi.hoisted(() => ({ owner: vi.fn(), handle: vi.fn(), factory: vi.fn(), rate: vi.fn(), revoke: vi.fn() }));
vi.mock('@/apps/do/services/owner', async original => ({ ...await original<object>(), doOwner: calls.owner }));
vi.mock('@/apps/do/services/voice-lease/runtime', () => ({ voiceLeaseRuntime: calls.factory, revokeVoiceLease: calls.revoke }));
vi.mock('@/lib/agents/chat-rate-limit', () => ({ chatClientIp: () => 'test', checkChatRateLimit: calls.rate }));
import { POST } from './route';
import { LeaseError } from '@/apps/do/services/voice-lease/service';
const req = (body: object, origin='https://www.assembl.co.nz') => new Request('https://www.assembl.co.nz/api/do/live-lease', {method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
const quote = {action:'quote',requestedSeconds:900,voiceRevision:'a'.repeat(64)};
beforeEach(() => { vi.clearAllMocks(); calls.owner.mockResolvedValue({id:'alice'}); calls.factory.mockReturnValue({handle:calls.handle}); calls.handle.mockResolvedValue({quote:{}}); calls.revoke.mockResolvedValue({revoked:true}); calls.rate.mockResolvedValue({allowed:true}); });
it('authenticates owner and rejects extra client authority before service', async () => {
  expect((await POST(req(quote,'https://foreign.example'))).status).toBe(403);
  calls.owner.mockResolvedValueOnce(null); expect((await POST(req(quote))).status).toBe(401);
  expect((await POST(req({...quote,ownerId:'bob'}))).status).toBe(400);
  expect(calls.handle).not.toHaveBeenCalled();
  expect((await POST(req(quote))).status).toBe(200);
  expect(calls.handle).toHaveBeenCalledWith('alice',quote,expect.any(AbortSignal));
});
it('stays unavailable behind default-off runtime and never falls back', async () => {
  calls.factory.mockImplementation(() => {throw new LeaseError('lease_disabled',503);});
  expect((await POST(req(quote))).status).toBe(503); expect(calls.handle).not.toHaveBeenCalled();
});
it('allows authenticated revoke even when rate allowance is exhausted', async () => {
  calls.rate.mockResolvedValue({allowed:false});
  expect((await POST(req({action:'revoke',leaseId:crypto.randomUUID()}))).status).toBe(200);
  expect(calls.rate).not.toHaveBeenCalled();
});
