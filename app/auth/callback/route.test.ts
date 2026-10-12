import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const fixture=vi.hoisted(()=>({exchange:vi.fn(),verify:vi.fn(),set:vi.fn()}));
vi.mock('next/headers',()=>({cookies:async()=>({set:fixture.set})}));
vi.mock('@/lib/supabase/server',()=>({createClient:async()=>({auth:{exchangeCodeForSession:fixture.exchange,verifyOtp:fixture.verify}})}));
import {GET} from './route';
beforeEach(()=>{vi.clearAllMocks();fixture.exchange.mockResolvedValue({error:null});fixture.verify.mockResolvedValue({error:null});});
it('completes a fictional same-browser callback without changing return origin',async()=>{
  const response=await GET(new NextRequest('https://www.assembl.co.nz/auth/callback?code=fictional-code&next=%2Fdo%2Fwidget&remember=1'));
  expect(response.headers.get('location')).toBe('https://www.assembl.co.nz/do/widget');
  expect(fixture.set.mock.invocationCallOrder[0]).toBeLessThan(fixture.exchange.mock.invocationCallOrder[0]);
});
it('returns interrupted/missing verifier flow to login without granting access',async()=>{
  fixture.exchange.mockResolvedValue({error:{message:'Fictional missing verifier'}});
  const response=await GET(new NextRequest('https://www.assembl.co.nz/auth/callback?code=fictional-code&next=%2Fdo%2Fwidget'));
  expect(new URL(response.headers.get('location')!).pathname).toBe('/login');
});
it('rejects missing callback parameters',async()=>{
  const response=await GET(new NextRequest('https://www.assembl.co.nz/auth/callback?next=%2Fdo%2Fwidget'));
  expect(new URL(response.headers.get('location')!).pathname).toBe('/login');
  expect(fixture.exchange).not.toHaveBeenCalled(); expect(fixture.verify).not.toHaveBeenCalled();
});
