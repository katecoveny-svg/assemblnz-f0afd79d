import { afterEach, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({createClient:vi.fn()}));
vi.mock('@supabase/supabase-js',()=>({createClient:mocks.createClient}));
import { retrievePublicNzKnowledge } from './server';
import { PUBLIC_NZ_SOURCES } from './model';
afterEach(()=>{vi.unstubAllEnvs();vi.useRealTimers();vi.clearAllMocks();});
it('fails safely with absent public credentials',async()=>{
 vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','');vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','');
 expect(await retrievePublicNzKnowledge()).toMatchObject({records:[],degraded:true});expect(mocks.createClient).not.toHaveBeenCalled();
});
it('settles within deadline even when transport ignores cancellation',async()=>{
 vi.useFakeTimers();vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://example.supabase.co');vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','public-key');
 const chain={select:vi.fn(),in:vi.fn(),limit:vi.fn(),abortSignal:vi.fn(()=>new Promise(()=>{}))};chain.select.mockReturnValue(chain);chain.in.mockReturnValue(chain);chain.limit.mockReturnValue(chain);
 mocks.createClient.mockReturnValue({from:vi.fn(()=>chain)});
 const promise=retrievePublicNzKnowledge();await vi.advanceTimersByTimeAsync(2500);
 expect(await promise).toMatchObject({records:[],degraded:true});
});
it('uses only public credentials, bounded projection and reviewed source ids',async()=>{
 vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://example.supabase.co');vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','public-key');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','SECRET');
 const chain={select:vi.fn(),in:vi.fn(),limit:vi.fn(),abortSignal:vi.fn(async()=>({data:[],error:null}))};chain.select.mockReturnValue(chain);chain.in.mockReturnValue(chain);chain.limit.mockReturnValue(chain);
 const from=vi.fn(()=>chain);mocks.createClient.mockReturnValue({from});
 await retrievePublicNzKnowledge();
 expect(mocks.createClient.mock.calls[0][1]).toBe('public-key');expect(chain.in).toHaveBeenCalledWith('id',PUBLIC_NZ_SOURCES.map(s=>s.id));expect(chain.limit).toHaveBeenCalledWith(2);expect(chain.select.mock.calls[0][0]).not.toMatch(/content|metadata|config|name/);expect(from).toHaveBeenCalledTimes(1);
});
