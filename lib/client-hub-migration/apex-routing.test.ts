import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
import {NextRequest,NextResponse} from 'next/server';
vi.mock('@/lib/supabase/middleware',()=>({updateSession:vi.fn(async()=>NextResponse.next())}));
import {middleware} from '../../middleware';
import {isStudioOwnerReturn} from '@/lib/auth/redirect';
import {resolveAuthOrigin} from '@/lib/auth/origin';
const hosts=['assembl.co.nz','www.assembl.co.nz'];
const request=(host:string,path:string)=>new NextRequest(`https://${host}${path}`,{headers:{host}});
describe('exact owner migration apex routing',()=>{
 beforeEach(()=>{vi.stubEnv('NODE_ENV','production');vi.stubEnv('ASSEMBL_STUDIO_OWNER_WORKSPACE','0');});
 afterEach(()=>vi.unstubAllEnvs());
 it.each(hosts)('lets only exact guarded routes reach their pages on %s',async host=>{
  for(const path of ['/review/client-hub?example=airnz','/review/client-hub?example=pwc','/review/client-hub?example=deloitte','/studio/workspace']){
   const r=await middleware(request(host,path));expect(r.headers.get('x-middleware-rewrite')).toBeNull();expect(r.headers.get('location')).toBeNull();
  }
  for(const path of ['/studio/workspace/extra','/studio/unrelated','/review/client-hub/extra'])expect((await middleware(request(host,path))).headers.get('x-middleware-rewrite')).toBe(`https://${host}/`);
 });
 it.each(hosts)('keeps canonical owner sign-in callbacks on %s',async host=>{
  for(const path of ['/login?redirect=%2Fstudio%2Fworkspace','/auth/callback?next=%2Fstudio%2Fworkspace','/auth/confirm?next=%2Fstudio%2Fworkspace'])expect((await middleware(request(host,path))).headers.get('location')).toBeNull();
  expect(resolveAuthOrigin({host,redirectTo:'/studio/workspace'})).toBe(`https://${host}`);
  expect((await middleware(request(host,'/login?redirect=%2Fstudio%2Funrelated'))).status).toBe(302);
 });
 it.each(hosts)('preserves homepage and DO paths on %s',async host=>{
  expect((await middleware(request(host,'/'))).headers.get('x-middleware-rewrite')).toBeNull();
  expect((await middleware(request(host,'/do/tasks'))).headers.get('x-middleware-rewrite')).toBeNull();
  expect((await middleware(request(host,'/login?redirect=%2Fdo%2Ftasks'))).headers.get('location')).toBeNull();
  expect(resolveAuthOrigin({host,redirectTo:'/do/tasks'})).toBe('https://www.assembl.co.nz');
 });
 it('does not broaden auth returns to sibling paths, external hosts, query or fragment destinations',()=>{
  expect(isStudioOwnerReturn('/studio/workspace')).toBe(true);
  for(const raw of ['/studio/workspace/extra','/studio/workspace?next=evil','/studio/workspace#x','//evil.test/studio/workspace','https://evil.test/studio/workspace','/studio/unrelated'])expect(isStudioOwnerReturn(raw)).toBe(false);
 });
});
