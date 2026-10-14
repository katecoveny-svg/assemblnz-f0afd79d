import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const calls = vi.hoisted(() => ({ token: vi.fn(), profile: vi.fn(), ledger: { quotes: [] as unknown[], leases: [] as unknown[] } }));
vi.mock('@google/genai', () => ({ GoogleGenAI: class { authTokens = {create:calls.token}; } }));
vi.mock('@/apps/do/personal/profile-service', () => ({getPersonalDoProfile:calls.profile}));
vi.mock('./store', () => ({durableVoiceLeaseStore: () => ({transact: async (_owner:string, fn:(s:unknown)=>unknown) => {const draft=structuredClone(calls.ledger);const r=fn(draft);calls.ledger=draft;return r;}})}));
import { voiceLeaseRuntime } from './runtime';
import { DEFAULT_PERSONAL_DO_PROFILE } from '@/apps/do/personal/profile';
import { voiceRevision } from '@/apps/do/services/voice-preference';
beforeEach(() => {
  vi.clearAllMocks(); calls.ledger={quotes:[],leases:[]};
  vi.stubEnv('DO_VOICE_LEASE_ENABLED',''); vi.stubEnv('DO_GEMINI_LIVE_ENABLED','true'); vi.stubEnv('GEMINI_API_KEY','fictional-key');
  vi.stubEnv('DO_VOICE_LEASE_ACCOUNTS_JSON',JSON.stringify({alice:{enabled:true,revision:'reviewed1',dailySeconds:900}}));
  calls.profile.mockResolvedValue({profile:DEFAULT_PERSONAL_DO_PROFILE}); calls.token.mockResolvedValue({name:'fictional-token'});
});
afterEach(() => vi.unstubAllEnvs());
it('is disabled by default before storage or provider access', () => {
  expect(() => voiceLeaseRuntime()).toThrow('lease_disabled'); expect(calls.token).not.toHaveBeenCalled();
});
it('constrains a single fifteen-minute token and resumes without minting another', async () => {
  vi.stubEnv('DO_VOICE_LEASE_ENABLED','true'); const service=voiceLeaseRuntime();
  const q=await service.handle('alice',{action:'quote',requestedSeconds:900,voiceRevision:voiceRevision('alice',DEFAULT_PERSONAL_DO_PROFILE)});
  if (!('quote' in q)) throw new Error('quote');
  const call=await service.handle('alice',{action:'start',consent:true,quoteId:q.quote.quoteId,requestId:crypto.randomUUID()});
  if (!('token' in call)) throw new Error('call');
  const config=calls.token.mock.calls[0][0].config;
  expect(config.uses).toBe(1); expect(config.expireTime).toBe(new Date(call.expiresAt).toISOString());
  expect(config.liveConnectConstraints).toEqual({model:'gemini-3.8-live',config:call.config});
  expect(call.config).toMatchObject({sessionResumption:{},contextWindowCompression:{slidingWindow:{}}});
  await service.handle('alice',{action:'resume',leaseId:call.leaseId}); expect(calls.token).toHaveBeenCalledTimes(1);
  expect(await service.availability('alice')).toMatchObject({remainingSeconds:0,measuredCost:null});
});
it('does not inherit allowance for an unallocated owner or interpret a string budget', async () => {
  vi.stubEnv('DO_VOICE_LEASE_ENABLED','true');
  await expect(voiceLeaseRuntime().availability('bob')).rejects.toThrow('funding_unavailable');
  vi.stubEnv('DO_VOICE_LEASE_ACCOUNTS_JSON',JSON.stringify({alice:{enabled:true,revision:'r',dailySeconds:'900'}}));
  await expect(voiceLeaseRuntime().availability('alice')).rejects.toThrow('funding_unavailable'); expect(calls.token).not.toHaveBeenCalled();
});
