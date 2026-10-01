import { expect, it, vi } from 'vitest';
import { buildPublicNzResult } from '@/lib/public-nz/model';
const mocks=vi.hoisted(()=>({retrieve:vi.fn()}));
vi.mock('@/lib/public-nz/server',()=>({retrieveVerifiedPublicNzKnowledge:mocks.retrieve}));
import { GET } from './route';
it('returns safe degraded API without unscoped counts or fabricated freshest source',async()=>{
 mocks.retrieve.mockResolvedValue({discovery:buildPublicNzResult([],[],{now:Date.parse('2026-09-30T22:00:00Z'),failed:true}),verification:{records:[],substantiveContext:false}});
 const response=await GET();const data=await response.json();
 expect(response.status).toBe(200);expect(response.headers.get('Cache-Control')).toContain('no-store');
 expect(data).toMatchObject({figures:[],lastFetch:null,lastFetchSource:null,publicNz:{records:[],degraded:true,substantiveContext:false}});
 expect(mocks.retrieve).toHaveBeenCalledWith({limit:4});
});
