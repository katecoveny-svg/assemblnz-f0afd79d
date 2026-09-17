import {describe,it,expect,vi} from 'vitest';
vi.mock('@/lib/pursuit/public-store',()=>({countPublicTool:vi.fn(async()=>false)}));
import {POST,GET} from './route';
const request=(body:unknown,extra:Record<string,string>={})=>new Request('https://www.assembl.co.nz/api/knowledge/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json,text/event-stream',...extra},body:JSON.stringify(body)});
describe('read-only public MCP',()=>{
 it('initializes and advertises only the public read tool',async()=>{const a=await POST(request({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25'}}));expect((await a.json()).result.protocolVersion).toBe('2025-11-25');const l=await POST(request({jsonrpc:'2.0',id:2,method:'tools/list'}));const tools=(await l.json()).result.tools;expect(tools).toHaveLength(1);expect(tools[0].annotations.readOnlyHint).toBe(true);});
 it('returns real published records, no private scope or charge',async()=>{const a=await POST(request({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'search_assembl_public_knowledge',arguments:{query:'Studio pitch'}}}));const r=(await a.json()).result.structuredContent;expect(r.results.length).toBeGreaterThan(0);expect(r.privateKnowledgeSearched).toBe(false);expect(r.charged).toBe(false);});
 it('rejects foreign browser origins and invalid version',async()=>{expect((await POST(request({jsonrpc:'2.0',id:1,method:'ping'},{Origin:'https://evil.example'}))).status).toBe(403);expect((await POST(request({jsonrpc:'2.0',id:1,method:'ping'},{'mcp-protocol-version':'unknown'}))).status).toBe(400);});
 it('accepts notifications and declines optional SSE',async()=>{expect((await POST(request({jsonrpc:'2.0',method:'notifications/initialized'}))).status).toBe(202);expect((await GET(new Request('https://www.assembl.co.nz/api/knowledge/mcp'))).status).toBe(405);});
});
