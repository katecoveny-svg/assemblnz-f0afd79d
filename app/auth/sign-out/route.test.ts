import { expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const signOut=vi.hoisted(()=>vi.fn(async()=>({error:null})));
vi.mock('@/lib/supabase/server',()=>({createClient:async()=>({auth:{signOut}})}));
import {POST} from './route';
it('awaits existing revocation and prevents shared caching of logout redirect',async()=>{
 const response=await POST(new NextRequest('https://www.assembl.co.nz/auth/sign-out',{method:'POST'}));
 expect(signOut).toHaveBeenCalledOnce();
 expect(response.status).toBe(303);
 expect(response.headers.get('cache-control')).toBe('private, no-store');
 expect(response.headers.get('location')).toBe('https://www.assembl.co.nz/login');
});
