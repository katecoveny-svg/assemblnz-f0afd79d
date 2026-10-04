import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const m=vi.hoisted(()=>({owner:vi.fn(), plan:vi.fn(), entitlement:vi.fn(),customer:vi.fn(),rpc:vi.fn(),list:vi.fn(),create:vi.fn()}));
vi.mock('@/apps/do/services/owner',()=>({doOwner:m.owner,privateDoHeaders:{'Cache-Control':'private, no-store'},sameDoOrigin:(req:Request)=>req.headers.get('origin')===new URL(req.url).origin}));
vi.mock('@/lib/billing/personal-do-stripe',()=>({personalDoStripePlan:m.plan,personalDoCustomer:m.customer}));
vi.mock('@/lib/billing/personal-do-access',()=>({hasPersonalDoEntitlement:m.entitlement}));
vi.mock('@/lib/supabase/service',()=>({getServiceClient:()=>({rpc:m.rpc})}));
import { POST } from './route';
const request=(origin='https://www.assembl.co.nz')=>new Request('https://www.assembl.co.nz/api/do/billing/checkout',{method:'POST',headers:{origin}});
beforeEach(()=>{vi.resetAllMocks();m.owner.mockResolvedValue({id:'owner'});m.entitlement.mockResolvedValue(false);m.customer.mockResolvedValue('cus_owner');m.plan.mockResolvedValue({plan:{priceId:'price_consumer',automaticTax:false},stripe:{subscriptions:{list:m.list},checkout:{sessions:{create:m.create}}}});m.list.mockResolvedValue({data:[],has_more:false});m.rpc.mockResolvedValue({data:{attempt_id:'durable_attempt',expires_at:'2030-01-01T00:00:00Z'},error:null});m.create.mockResolvedValue({url:'https://checkout.stripe.com/test'});});
afterEach(()=>vi.unstubAllEnvs());
describe('consumer checkout boundary',()=>{
 it('requires same origin and authenticated owner before Stripe or account creation',async()=>{expect((await POST(request('https://attacker.example'))).status).toBe(403);expect(m.plan).not.toHaveBeenCalled();m.owner.mockResolvedValue(null);expect((await POST(request())).status).toBe(401);expect(m.customer).not.toHaveBeenCalled();});
 it('has no legacy plan fallback and creates no billing account when config is incomplete',async()=>{m.plan.mockRejectedValue(new Error('missing'));expect((await POST(request())).status).toBe(503);expect(m.customer).not.toHaveBeenCalled();});
 it('uses owner-specific durable checkout idempotency and trusted return origin without granting access',async()=>{expect((await POST(request())).status).toBe(200);expect((await POST(request())).status).toBe(200);expect(m.create).toHaveBeenLastCalledWith(expect.objectContaining({customer:'cus_owner',line_items:[{price:'price_consumer',quantity:1}],success_url:'https://www.assembl.co.nz/do/personal?checkout=returned',automatic_tax:{enabled:false}}),{idempotencyKey:'personal-do-checkout:owner:durable_attempt'});expect(m.rpc).toHaveBeenCalledWith('personal_do_checkout_attempt',{p_owner:'owner'});});
 it('prevents a second subscription during webhook delay and fails closed on durable checkout failure',async()=>{m.list.mockResolvedValue({data:[{status:'active'}],has_more:false});expect((await POST(request())).status).toBe(409);expect(m.create).not.toHaveBeenCalled();m.list.mockResolvedValue({data:[],has_more:false});m.rpc.mockResolvedValue({data:null,error:{}});expect((await POST(request())).status).toBe(503);expect(m.create).not.toHaveBeenCalled();});
});
