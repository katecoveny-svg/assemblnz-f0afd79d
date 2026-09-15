import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({reserve:vi.fn(),release:vi.fn()}));
vi.mock('@/apps/do/shared/trial',()=>({reserveDoTrial:mocks.reserve,DoTrialError:class extends Error{}}));
vi.mock('@/apps/do/shared/http',()=>({allowedDoOrigin:(r:Request)=>r.headers.get('origin')===new URL(r.url).origin,doHeaders:()=>new Headers({'Cache-Control':'no-store'}),readDoJson:(r:Request)=>r.json(),admitDoRequest:()=>true}));
vi.mock('@/lib/agents/chat-rate-limit',()=>({chatClientIp:()=> 'test'}));
import { POST } from './route';
let fetcher: ReturnType<typeof vi.fn>;
const input={category:'broadband',region:'Auckland',monthlyCost:100,usage:100,exitFee:null,consent:true};
const req=(body:unknown=input,origin='https://www.assembl.co.nz')=>new Request('https://www.assembl.co.nz/api/do/bills',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('GEMINI_API_KEY','test-only');fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);mocks.reserve.mockResolvedValue({release:mocks.release});mocks.release.mockResolvedValue(undefined);});
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
describe('bill research service',()=>{
 it('rejects foreign origins before reserving a task',async()=>{expect((await POST(req(input,'https://elsewhere.example'))).status).toBe(403);expect(mocks.reserve).not.toHaveBeenCalled();});
 it('rejects private source fields before search',async()=>{expect((await POST(req({...input,bill:'private bill'}))).status).toBe(400);expect(fetcher).not.toHaveBeenCalled();});
 it('refunds an ungrounded provider answer',async()=>{fetcher.mockResolvedValue(Response.json({candidates:[{content:{parts:[{text:'An unsupported cheap plan'}]}}]}));expect((await POST(req())).status).toBe(503);expect(mocks.release).toHaveBeenCalledOnce();});
 it('uses the live-search tool and returns the provider source evidence',async()=>{fetcher.mockResolvedValue(Response.json({candidates:[{content:{parts:[{text:'Review a current advertised offer'}]},groundingMetadata:{webSearchQueries:['NZ broadband offers'],groundingChunks:[{web:{uri:'https://provider.example/offer',title:'Provider'}}]}}]}));const response=await POST(req());expect(response.status).toBe(200);expect((await response.json()).sources).toHaveLength(1);expect(JSON.parse(fetcher.mock.calls[0][1].body).tools).toEqual([{google_search:{}}]);expect(mocks.release).not.toHaveBeenCalled();});
});
