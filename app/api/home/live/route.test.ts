import { expect, it, vi } from 'vitest';
import { buildPublicNzResult } from '@/lib/public-nz/model';
const mocks=vi.hoisted(()=>({retrieve:vi.fn()}));
vi.mock('@/lib/public-nz/server',()=>({retrievePublicNzKnowledge:mocks.retrieve}));
import { GET } from './route';
it('returns safe degraded API without unscoped counts or fabricated freshest source',async()=>{
 mocks.retrieve.mockResolvedValue(buildPublicNzResult([],[],{now:Date.parse('2026-09-30T22:00:00Z'),failed:true}));
 const response=await GET();const data=await response.json();
 expect(response.status).toBe(200);expect(response.headers.get('Cache-Control')).toContain('no-store');
 expect(data).toMatchObject({figures:[],lastFetch:null,lastFetchSource:null,publicNz:{records:[],degraded:true,substantiveContext:false}});
 expect(mocks.retrieve).toHaveBeenCalledWith({limit:4});
});
