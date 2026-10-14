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

export async function runControlMutationProofs() {
  const results: Record<string, boolean> = {};
  for (const change of ['input identity','button identity','disabled','readOnly','type','max','button type']) {
    const root=document.createElement('div');
    root.innerHTML='<input type="number"><button type="button">Apply</button><input type="number"><button type="button">Other</button>';
    document.body.append(root);
    const inputs=root.querySelectorAll('input'),buttons=root.querySelectorAll('button');
    let selectedInput=inputs[0],selectedButton=buttons[0],clicks=0;
    buttons.forEach(b=>b.addEventListener('click',()=>{clicks++;}));
    inputs[0].addEventListener('change',()=>{
      if(change==='input identity')selectedInput=inputs[1];
      if(change==='button identity')selectedButton=buttons[1];
      if(change==='disabled')inputs[0].disabled=true;
      if(change==='readOnly')inputs[0].readOnly=true;
      if(change==='type')inputs[0].type='text';
      if(change==='max')inputs[0].max='2';
      if(change==='button type')buttons[0].type='submit';
    });
    const scope={connectionId:crypto.randomUUID(),tabId:4,documentId:'fixture-doc',origin:'http://127.0.0.1:4198' as const,navigationRevision:0};
    const context={retailer:'woolworths_nz' as const,accountBinding:'a'.repeat(64),storeId:'store',cartId:'cart',complete:true as const};
    const product={sku:'oats',name:'Fixture oats',variant:'Original',packSize:'500g',saleUnit:'each' as const,restricted:false as const,unitPriceCents:300,available:true,quantity:2};
    const port=createRetailerFixtureDOMPort(document,{read:()=>({scope,context,products:[product],revision:'r1',observedAt:1000,currency:'NZD'}),quantityControl:()=>({input:selectedInput,button:selectedButton})},async()=>{});
    let rejected=false;
    try {await port.compareAndSetQuantity({scope,context,product,expectedRevision:'r1',targetQuantity:3});} catch {rejected=true;}
    results[change]=rejected && clicks===0 && inputs[0].isConnected && buttons[0].isConnected;
    root.remove();
  }
  return results;
}
