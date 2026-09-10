import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({client:vi.fn(),getUser:vi.fn(),from:vi.fn(),select:vi.fn(),eq:vi.fn(),order:vi.fn(),limit:vi.fn(),insert:vi.fn(),update:vi.fn(),single:vi.fn()}));
vi.mock('@/lib/supabase/server',()=>({createClient:mocks.client}));
import { GET, POST, PUT } from './route';
import { blankLead } from '@/lib/specialists/crm';
const request=(body:unknown,origin='https://www.assembl.co.nz')=>new Request('https://www.assembl.co.nz/api/specialists/flux/leads',{method:'POST',headers:{origin},body:JSON.stringify(body)});
beforeEach(()=>{vi.clearAllMocks();const chain={select:mocks.select,eq:mocks.eq,order:mocks.order,limit:mocks.limit,insert:mocks.insert,update:mocks.update,maybeSingle:mocks.single};for(const fn of [mocks.from,mocks.select,mocks.eq,mocks.order,mocks.insert,mocks.update])fn.mockReturnValue(chain);mocks.client.mockResolvedValue({auth:{getUser:mocks.getUser},from:mocks.from});mocks.getUser.mockResolvedValue({data:{user:{id:'owner-a',is_anonymous:false}},error:null});mocks.limit.mockResolvedValue({data:[],error:null});mocks.single.mockResolvedValue({data:{id:'lead-a',...blankLead,name:'Business'},error:null});});
describe('Flux private account boundary',()=>{
  it('requires a verified non-anonymous user',async()=>{mocks.getUser.mockResolvedValue({data:{user:{id:'anon',is_anonymous:true}}});expect((await GET()).status).toBe(401);expect(mocks.from).not.toHaveBeenCalled();});
  it('loads only the verified user records with no-store',async()=>{const r=await GET();expect(r.status).toBe(200);expect(r.headers.get('cache-control')).toContain('no-store');expect(mocks.eq).toHaveBeenCalledWith('user_id','owner-a');});
  it('rejects cross-origin changes before touching identity',async()=>{expect((await POST(request({},'https://elsewhere.example'))).status).toBe(403);expect(mocks.getUser).not.toHaveBeenCalled();});
  it('sets record ownership server-side and rejects a client owner field',async()=>{expect((await POST(request({lead:{...blankLead,name:'Business',user_id:'owner-b'}}))).status).toBe(400);expect(mocks.insert).not.toHaveBeenCalled();expect((await POST(request({lead:{...blankLead,name:'Business'}}))).status).toBe(200);expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({user_id:'owner-a'}));});
  it('filters updates by both record and owner, and reports missing records honestly',async()=>{mocks.single.mockResolvedValue({data:null,error:null});const id='11111111-1111-4111-8111-111111111111';expect((await PUT(request({id,lead:{...blankLead,name:'Business'}}))).status).toBe(404);expect(mocks.eq).toHaveBeenCalledWith('id',id);expect(mocks.eq).toHaveBeenCalledWith('user_id','owner-a');});
  it('does not claim success after a database failure',async()=>{mocks.single.mockResolvedValue({data:null,error:{message:'failed'}});expect((await POST(request({lead:{...blankLead,name:'Business'}}))).status).toBe(503);});
});
