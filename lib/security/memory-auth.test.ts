import { describe, expect, it, vi } from 'vitest';
import { isMemoryServiceRequest, memoryPrincipal, resolveMemoryUser } from '../../supabase/functions/_shared/memory-auth';

const alice = '11111111-1111-4111-8111-111111111111';
const bob = '22222222-2222-4222-8222-222222222222';
const service = 'synthetic-service-test-value';
const request = (token?: string) => new Request('https://test.invalid', {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});

describe('private memory identity boundary', () => {
  it('ignores a claimed identity without a verified session', async () => {
    const verify = vi.fn();
    const principal = await memoryPrincipal(request(), service, verify);
    expect(resolveMemoryUser(principal, bob)).toBeNull();
    expect(verify).not.toHaveBeenCalled();
  });
  it('binds a valid user session to its owner rather than the claimed user', async () => {
    const principal = await memoryPrincipal(request('user-token'), service, async () => ({ id: alice }));
    expect(resolveMemoryUser(principal, bob)).toBe(alice);
  });
  it('rejects anonymous Supabase accounts for private recall', async () => {
    const principal = await memoryPrincipal(request('anonymous-token'), service, async () => ({ id: alice, is_anonymous: true }));
    expect(resolveMemoryUser(principal, alice)).toBeNull();
  });
  it('fails closed on expired credentials and Auth outages', async () => {
    for (const verify of [async () => null, async () => { throw new Error('offline'); }]) {
      expect(resolveMemoryUser(await memoryPrincipal(request('bad'), service, verify), bob)).toBeNull();
    }
  });
  it('allows trusted services only with a concrete valid owner', async () => {
    const verify = vi.fn();
    const principal = await memoryPrincipal(request(service), service, verify);
    expect(resolveMemoryUser(principal, bob)).toBe(bob);
    expect(resolveMemoryUser(principal, null)).toBeNull();
    expect(resolveMemoryUser(principal, '*')).toBeNull();
    expect(verify).not.toHaveBeenCalled();
  });
  it('does not elevate a user token, missing configuration or matching prefix to service', async () => {
    expect(await isMemoryServiceRequest(request('user-token'), service)).toBe(false);
    expect(await isMemoryServiceRequest(request(service + '-forged'), service)).toBe(false);
    expect(await isMemoryServiceRequest(request(), '')).toBe(false);
    expect(await isMemoryServiceRequest(request(service), '')).toBe(false);
  });
});
