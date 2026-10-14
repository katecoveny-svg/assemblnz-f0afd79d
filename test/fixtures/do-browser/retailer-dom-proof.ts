import { createRetailerFixtureDOMPort } from '../../../apps/do/browser/retailers/dom-port';
import { createRetailerFixtureAdapter, prepareSupermarketAddition, type RetailerSnapshot } from '../../../apps/do/browser/retailers/woolworths';
import { executeReviewedCart } from '../../../apps/do/browser/executor';
export async function runRetailerDOMProof() {
  const scope = {connectionId:crypto.randomUUID(),tabId:4,documentId:'fixture-doc',origin:'http://127.0.0.1:4198' as const,navigationRevision:0};
  const context = {retailer:'woolworths_nz' as const,accountBinding:'a'.repeat(64),storeId:'fictional-store',cartId:'fictional-cart',complete:true as const};
  const root = document.querySelector<HTMLElement>('[data-do-cart-fixture]')!;
  const read = (): RetailerSnapshot => ({scope,revision:root.dataset.revision!,observedAt:1000,currency:'NZD',context,products:[...root.querySelectorAll<HTMLElement>('[data-product]')].map(row=>({sku:row.dataset.product!,name:row.querySelector('[data-name]')!.textContent!,variant:'Original',packSize:'500g',saleUnit:'each',restricted:false,unitPriceCents:Number(row.dataset.price),available:true,quantity:Number(row.querySelector('output')!.value)}))});
  let grants = 0;
  const port = createRetailerFixtureDOMPort(document, {read,quantityControl:(_doc,sku)=>{
    const rows=[...root.querySelectorAll<HTMLElement>('[data-product]')].filter(r=>r.dataset.product===sku);if(rows.length!==1)throw new Error('ambiguous');return{input:rows[0].querySelector('input')!,button:rows[0].querySelector('button')!};
  }},async()=>{grants++;});
  const adapter=createRetailerFixtureAdapter('fictional-owner',scope,port,{current:async()=>true,readGrant:async()=>({ownerId:'fictional-owner',scope,context,expiresAt:6000,revoked:false,fields:'product_cart_only'})},()=>1000);
  const prepared=await prepareSupermarketAddition({kind:'add_product',sku:'oats',variant:'Original',packSize:'500g',quantityToAdd:1},adapter,5000,()=>1000);
  const id=crypto.randomUUID();let claimed=false;
  const receipt=await executeReviewedCart({ownerId:'fictional-owner',approvalId:id,proposal:prepared.proposal},{getApproval:async()=>({id,ownerId:'fictional-owner',actionId:prepared.proposal.actionId,revision:1,digest:prepared.digest,scope,expiresAt:5000,revoked:false}),isConnected:async()=>true,claim:async()=>{if(claimed)return false;claimed=true;return true;},finish:async()=>{}},adapter,()=>1000);
  return {receipt,grants};
}
