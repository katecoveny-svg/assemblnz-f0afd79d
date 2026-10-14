import {afterEach, expect, it, vi} from 'vitest';
import {getConfiguredAuthProviders,getReadyAuthProviders} from './providers';
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
function setup(external: object){
 vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://fictional.supabase.co');
 vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','fictional-public-key');
 vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({external})})));
}
it('reads only strict enabled booleans',async()=>{setup({google:true,apple:'true'});expect(await getConfiguredAuthProviders()).toEqual({google:true,apple:false});});
it('configured providers remain hidden without release verification',async()=>{
 setup({google:true,apple:true});vi.stubEnv('AUTH_GOOGLE_VERIFIED','');vi.stubEnv('AUTH_APPLE_VERIFIED','');
 expect(await getReadyAuthProviders()).toEqual({google:false,apple:false});
});
it('a release gate cannot enable an unconfigured provider',async()=>{
 setup({google:true,apple:false});vi.stubEnv('AUTH_GOOGLE_VERIFIED','1');vi.stubEnv('AUTH_APPLE_VERIFIED','1');
 expect(await getReadyAuthProviders()).toEqual({google:true,apple:false});
});
it('network failures leave email/password usable',async()=>{
 setup({});vi.stubGlobal('fetch',vi.fn(async()=>{throw new Error('fictional outage');}));
 expect(await getReadyAuthProviders()).toEqual({google:false,apple:false});
});
