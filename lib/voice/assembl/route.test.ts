import { beforeEach,expect,it,vi } from 'vitest';
const owner=vi.hoisted(()=>vi.fn());
vi.mock('@/apps/do/services/owner',()=>({doOwner:owner,sameDoOrigin:(r:Request)=>r.headers.get('origin')===new URL(r.url).origin,privateDoHeaders:{'Cache-Control':'private, no-store'}}));
import { voiceRoute } from './http';
import { ownerToken,engineConfig } from './client';
const data={text:'Hello',presets:['warm'],language:'en-NZ',consent:true};
const job={id:'00000000-0000-4000-8000-000000000001',text:'Hello',presets:['warm'],state:'queued',expiresAt:1900000000000,accentReview:'pending',outputs:[]};
const req=(body:unknown=data,origin='https://assembl.test')=>new Request('https://assembl.test/api/creative/voices',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
beforeEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();owner.mockResolvedValue({id:'owner-a'});vi.stubEnv('ASSEMBL_VOICE_ENGINE_URL','http://127.0.0.1:8791');vi.stubEnv('ASSEMBL_VOICE_ENGINE_SECRET','test-secret-123456789012345678901234');});
it('requires authentication',async()=>{owner.mockResolvedValue(null);expect((await voiceRoute(req())).status).toBe(401);});
it('rejects cross-origin writes before starting work',async()=>{const f=vi.fn();vi.stubGlobal('fetch',f);expect((await voiceRoute(req(data,'https://other.test'))).status).toBe(403);expect(f).not.toHaveBeenCalled();});
it('rejects missing consent and large bodies',async()=>{expect((await voiceRoute(req({...data,consent:false}))).status).toBe(400);expect((await voiceRoute(req({...data,text:'x'.repeat(5000)}))).status).toBe(413);});
it('fails closed without configured engine',async()=>{vi.stubEnv('ASSEMBL_VOICE_ENGINE_SECRET','');expect((await voiceRoute(req())).status).toBe(503);});
it('forwards an opaque per-owner scope, never browser credentials',async()=>{
  const f=vi.fn().mockResolvedValue(Response.json(job));vi.stubGlobal('fetch',f);
  const r=await voiceRoute(req());expect(r.status).toBe(202);
  expect(f.mock.calls[0][1].headers['X-Assembl-Owner']).toMatch(/^[a-f0-9]{64}$/);
  expect(await r.json()).toEqual(job);expect(r.headers.get('Cache-Control')).toContain('no-store');
  expect(ownerToken('a','secret')).not.toBe(ownerToken('b','secret'));
});
it('rejects malformed job IDs and unsupported presets',async()=>{
  expect((await voiceRoute(new Request('https://assembl.test/api/creative/voices/bad'),'bad')).status).toBe(400);
  expect((await voiceRoute(new Request('https://assembl.test/api/creative/voices/'+job.id),job.id,'other')).status).toBe(400);
});
it('sanitises upstream failure and invalid jobs',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('secret',{status:500})));
  expect(JSON.stringify(await (await voiceRoute(req())).json())).not.toContain('secret');
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({oops:true})));expect((await voiceRoute(req())).status).toBe(502);
});
it('preserves private 404, deletion and valid audio',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(null,{status:404})));
  expect((await voiceRoute(new Request('https://assembl.test/api/creative/voices/'+job.id),job.id)).status).toBe(404);
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(null,{status:204})));
  expect((await voiceRoute(new Request('https://assembl.test/api/creative/voices/'+job.id,{method:'DELETE',headers:{origin:'https://assembl.test'}}),job.id)).status).toBe(204);
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('RIFF0000WAVEdata')));
  expect((await voiceRoute(new Request('https://assembl.test/audio'),job.id,'warm')).headers.get('Content-Type')).toBe('audio/wav');
});
it('refuses non-local HTTP engine, URL credentials and query',()=>{
  for(const url of ['http://example.com','https://user:pass@example.com','https://example.com/?key=a']){vi.stubEnv('ASSEMBL_VOICE_ENGINE_URL',url);expect(()=>engineConfig()).toThrow();}
});
