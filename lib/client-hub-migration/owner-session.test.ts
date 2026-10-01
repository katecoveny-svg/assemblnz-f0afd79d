import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
const state=vi.hoisted(()=>({user:{id:'11111111-1111-4111-8111-111111111111',is_anonymous:false},error:null as unknown,access:{data:null as unknown,error:null as unknown},create:vi.fn(),from:vi.fn(),eq:vi.fn()}));
vi.mock('server-only',()=>({}));
vi.mock('@/lib/supabase/server',()=>({createClient:state.create}));
import {ownerSession} from './owner-session';
describe('owner session database enablement',()=>{
 beforeEach(()=>{
  vi.stubEnv('ASSEMBL_STUDIO_OWNER_WORKSPACE','1');vi.stubEnv('ASSEMBL_STUDIO_OWNER_ALLOWLIST',state.user.id);
  state.error=null;state.user.is_anonymous=false;state.access={data:null,error:null};
  const chain={select:vi.fn().mockReturnThis(),eq:state.eq.mockReturnThis(),maybeSingle:async()=>state.access};
  state.from.mockReturnValue(chain);state.create.mockResolvedValue({auth:{getUser:async()=>({data:{user:state.user},error:state.error})},from:state.from});
 });
 afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();});
 it('does not open on the server flag and UUID allowlist alone',async()=>{expect(await ownerSession()).toBeNull();expect(state.from).toHaveBeenCalledWith('studio_owner_access');expect(state.eq).toHaveBeenCalledWith('enabled',true);});
 it('fails closed on DB read error',async()=>{state.access={data:{owner_user_id:state.user.id},error:{message:'Unavailable'}};expect(await ownerSession()).toBeNull();});
 it('opens only after a visible enabled DB row and verified cookie user',async()=>{state.access={data:{owner_user_id:state.user.id},error:null};expect((await ownerSession())?.userId).toBe(state.user.id);expect(state.eq).toHaveBeenCalledWith('owner_user_id',state.user.id);});
 it('does not query access for anonymous or failed authentication',async()=>{state.user.is_anonymous=true;expect(await ownerSession()).toBeNull();expect(state.from).not.toHaveBeenCalled();});
});
