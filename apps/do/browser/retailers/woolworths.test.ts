import { describe, it, expect, vi } from 'vitest';
import { createRetailerFixtureAdapter, createWoolworthsAdapter, prepareSupermarketAddition, retailerSnapshot, supermarketIntent, type RetailerSnapshot, type ReadGrant, type RetailerCartPort } from './woolworths';
import { executeReviewedCart, type Approval, type AuthorityStore } from '../executor';
import { WOOLWORTHS_LIVE_ENABLED } from './gate';

async function fixture() {
  let now = 1000;
  const scope = { connectionId: crypto.randomUUID(), tabId: 7, documentId: 'native-doc', origin: 'http://127.0.0.1:4198' as const, navigationRevision: 1 };
  const state: RetailerSnapshot = { scope, revision:'r1', observedAt:now, currency:'NZD', context:{retailer:'woolworths_nz',accountBinding:'a'.repeat(64),storeId:'store-1',cartId:'cart-1',complete:true}, products:[{sku:'100001',name:'Fictional oats',variant:'Original',packSize:'500g',saleUnit:'each',restricted:false,unitPriceCents:350,available:true,quantity:1},{sku:'100002',name:'Fictional oats',variant:'Organic',packSize:'750g',saleUnit:'each',restricted:false,unitPriceCents:700,available:true,quantity:0}] };
  const readGrant: ReadGrant = {ownerId:'owner',scope,context:structuredClone(state.context),expiresAt:60000,revoked:false,fields:'product_cart_only'};
  let current = true;
  const authority = {readGrant:vi.fn(async()=>readGrant),current:vi.fn(async()=>current)};
  const port: RetailerCartPort = {readProductCartFields:vi.fn(async()=>structuredClone(state)),compareAndSetQuantity:vi.fn(async c=>{
    if(c.expectedRevision!==state.revision || JSON.stringify(c.context)!==JSON.stringify(state.context)) throw new Error('Atomic facts changed');
    expect(c.product).toEqual(state.products.find(p=>p.sku===c.product.sku));
    state.products.find(p=>p.sku===c.product.sku)!.quantity=c.targetQuantity;state.revision+='+';
  })};
  const adapter=createRetailerFixtureAdapter('owner',scope,port,authority,()=>now);
  const intent={kind:'add_product',sku:'100001',variant:'Original',packSize:'500g',quantityToAdd:1};
  const prepared=await prepareSupermarketAddition(intent,adapter,50000,()=>now);
  const approval: Approval={id:crypto.randomUUID(),ownerId:'owner',actionId:prepared.proposal.actionId,revision:1,digest:prepared.digest,scope,expiresAt:50000,revoked:false};
  const claims=new Set<string>();
  const store: AuthorityStore={getApproval:async()=>approval,isConnected:async()=>current,claim:vi.fn(async(owner,id)=>{const key=owner+id;if(claims.has(key))return false;claims.add(key);return true;}),finish:vi.fn(async()=>{})};
  const run=()=>executeReviewedCart({ownerId:'owner',approvalId:approval.id,proposal:prepared.proposal},store,adapter,()=>now);
  return {scope,state,port,readGrant,authority,adapter,intent,prepared,approval,store,run,setNow:(n:number)=>{now=n;},revoke:()=>{current=false;}};
}
describe('Woolworths adapter staged behind source gate',()=>{
  it('cannot construct a live adapter or execute live-origin requests, before reads',async()=>{
    const f=await fixture();vi.mocked(f.port.readProductCartFields).mockClear();
    expect(WOOLWORTHS_LIVE_ENABLED).toBe(false);
    expect(()=>createWoolworthsAdapter('owner',{...f.scope,origin:'https://www.woolworths.co.nz'},f.port,f.authority)).toThrow('disabled');
    expect(()=>createRetailerFixtureAdapter('owner',{...f.scope,origin:'https://www.woolworths.co.nz'},f.port,f.authority)).toThrow('fixture');
    await expect(executeReviewedCart({ownerId:'owner',approvalId:f.approval.id,proposal:f.prepared.proposal},f.store,{...f.adapter,mode:'retailer_dom'})).rejects.toThrow('disabled');
    expect(f.port.readProductCartFields).not.toHaveBeenCalled();expect(f.port.compareAndSetQuantity).not.toHaveBeenCalled();
  });
  it('prepares a total quantity and uses the shared runtime for one approved SKU with full readback',async()=>{
    const f=await fixture();expect(f.prepared.proposal.items[0].targetQuantity).toBe(2);expect(f.port.compareAndSetQuantity).not.toHaveBeenCalled();
    const receipt=await f.run();expect(receipt.status).toBe('verified');expect(receipt.retailerExecuted).toBe(false);
    expect(receipt.items[0]).toMatchObject({productId:'100001',retailerProduct:{variant:'Original',packSize:'500g'},beforeQuantity:1,observedQuantity:2,status:'verified'});
    expect(f.state.products[1].quantity).toBe(0);expect(f.port.compareAndSetQuantity).toHaveBeenCalledTimes(1);
  });
  it.each(['variant','packSize','price','quantity','account','store','cart','incomplete','duplicate','weighted','restricted','unavailable'])('rejects changed/unsupported %s before a cart effect',async kind=>{
    const f=await fixture();
    if(kind==='variant')f.state.products[0].variant='Organic';if(kind==='packSize')f.state.products[0].packSize='1kg';if(kind==='price')f.state.products[0].unitPriceCents++;
    if(kind==='quantity')f.state.products[0].quantity++;if(kind==='account')f.state.context.accountBinding='b'.repeat(64);if(kind==='store')f.state.context.storeId='other';if(kind==='cart')f.state.context.cartId='other';
    if(kind==='incomplete')Object.assign(f.state.context,{complete:false});if(kind==='duplicate')f.state.products.push({...f.state.products[0]});if(kind==='weighted')Object.assign(f.state.products[0],{saleUnit:'kg'});if(kind==='restricted')Object.assign(f.state.products[0],{restricted:true});if(kind==='unavailable')f.state.products[0].available=false;
    await expect(f.run()).rejects.toThrow();expect(f.port.compareAndSetQuantity).not.toHaveBeenCalled();
  });
  it.each(['revoked','expired','owner','scope','fields','offline'])('refuses reads without native grant: %s',async kind=>{
    const f=await fixture();vi.mocked(f.port.readProductCartFields).mockClear();
    if(kind==='revoked')f.readGrant.revoked=true;if(kind==='expired')f.setNow(60000);if(kind==='owner')f.readGrant.ownerId='other';if(kind==='scope')f.readGrant.scope={...f.scope,tabId:99};if(kind==='fields')Object.assign(f.readGrant,{fields:'whole_page'});if(kind==='offline')f.revoke();
    await expect(f.adapter.observe()).rejects.toThrow();expect(f.port.readProductCartFields).not.toHaveBeenCalled();
  });
  it('rejects grant loss during a read before releasing fields',async()=>{const f=await fixture();f.port.readProductCartFields=vi.fn(async()=>{f.readGrant.revoked=true;return f.state;});await expect(f.adapter.observe()).rejects.toThrow();});
  it('rejects changed facts even if a faulty retailer revision does not change',async()=>{const f=await fixture();await f.adapter.observe();f.state.products[0].unitPriceCents++;await expect(f.adapter.setQuantity(f.scope,'r1','100001',2)).rejects.toThrow('facts changed');expect(f.port.compareAndSetQuantity).not.toHaveBeenCalled();});
  it('prevents duplicate execution after a lost acknowledgement',async()=>{
    const f=await fixture();f.port.compareAndSetQuantity=vi.fn(async()=>{f.state.products[0].quantity=2;throw new Error('lost acknowledgement');});
    expect((await f.run()).items[0].status).toBe('uncertain');f.state.products[0].quantity=1;
    await expect(f.run()).rejects.toThrow('Already claimed');expect(f.port.compareAndSetQuantity).toHaveBeenCalledTimes(1);
  });
  it('two competing reviews cannot blindly double-add the same SKU',async()=>{
    const f=await fixture();
    const other=await prepareSupermarketAddition(f.intent,f.adapter,50000,()=>1000);
    const secondApproval={...f.approval,id:crypto.randomUUID(),actionId:other.proposal.actionId,digest:other.digest};
    f.store.getApproval=async(_owner,id)=>id===secondApproval.id?secondApproval:f.approval;
    const results=await Promise.allSettled([f.run(),executeReviewedCart({ownerId:'owner',approvalId:secondApproval.id,proposal:other.proposal},f.store,f.adapter,()=>1000)]);
    expect(f.state.products[0].quantity).toBe(2);
    expect(results.filter(r=>r.status==='fulfilled'&&r.value.status==='verified')).toHaveLength(1);
  });
  it('stops on unexpected cart readback and does not accept an unrelated product change',async()=>{const f=await fixture();f.port.compareAndSetQuantity=vi.fn(async()=>{f.state.products[1].quantity=2;});expect((await f.run()).status).toBe('stopped');});
  it('never treats names as identity or admits checkout/JS/client ownership',async()=>{
    const f=await fixture();await expect(prepareSupermarketAddition({...f.intent,variant:'Organic'},f.adapter,50000,()=>1000)).rejects.toThrow();
    for(const extra of [{kind:'checkout'},{javascript:'x'},{ownerId:'other'},{selector:'button'},{quantityToAdd:0}])expect(supermarketIntent.safeParse({...f.intent,...extra}).success).toBe(false);
    expect(retailerSnapshot.safeParse({...f.state,cookies:'secret'}).success).toBe(false);
  });
});
