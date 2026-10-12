import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const fixture=vi.hoisted(()=>({exchange:vi.fn(),verify:vi.fn(),set:vi.fn()}));
vi.mock('next/headers',()=>({cookies:async()=>({set:fixture.set})}));
vi.mock('@/lib/supabase/server',()=>({createClient:async()=>({auth:{exchangeCodeForSession:fixture.exchange,verifyOtp:fixture.verify}})}));
import {GET} from './route';
beforeEach(()=>{vi.clearAllMocks();fixture.verify.mockResolvedValue({error:null});});
it('OTP confirmation can run without an originating-browser verifier and applies explicit preference first',async()=>{
  const response=await GET(new NextRequest('https://www.assembl.co.nz/auth/confirm?token_hash=fictional-hash&type=magiclink&next=%2Fdo%2Fwidget&remember=0'));
  expect(response.headers.get('location')).toBe('https://www.assembl.co.nz/do/widget');
  expect(fixture.exchange).not.toHaveBeenCalled();
  expect(fixture.set).toHaveBeenCalledWith('assembl-remember','0',expect.any(Object));
  expect(fixture.set.mock.invocationCallOrder[0]).toBeLessThan(fixture.verify.mock.invocationCallOrder[0]);
});
it('expired or already consumed confirmation returns to login',async()=>{
  fixture.verify.mockResolvedValue({error:{message:'Fictional expired link'}});
  const response=await GET(new NextRequest('https://www.assembl.co.nz/auth/confirm?token_hash=fictional-hash&type=magiclink&next=%2Fdo%2Fwidget'));
  expect(new URL(response.headers.get('location')!).pathname).toBe('/login');
});
