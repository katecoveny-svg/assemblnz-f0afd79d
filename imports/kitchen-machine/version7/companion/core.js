export const SITE='https://kitchen-machine-kate.katecoveny.chatgpt.site';
export const RETAILER='https://www.newworld.co.nz';
export const ORIGINS=[SITE+'/*',RETAILER+'/*'];
export const TTL=5*60*1000;
export function fail(message){throw new Error(message);}
export function isSite(url){try{return new URL(url).origin===SITE;}catch{return false;}}
export function allowedRetailer(url){try{const u=new URL(url);return u.origin===RETAILER&&(u.pathname==='/'||/^\/shop\/(product\/|search(?:\/|$)|category\/|specials(?:\/|$))/.test(u.pathname));}catch{return false;}}
export function productURL(url){const u=new URL(url);if(u.origin!==RETAILER||!/^\/shop\/product\/\d+_(?:ea|kgm)_\w+$/.test(u.pathname))fail('Open a New World product page.');return u.origin+u.pathname;}
export function normalisePlan(p){
  if(!p||p.type!=='assembl.newworld.plan'||p.version!==1||!Array.isArray(p.items)||p.items.length<1||p.items.length>30)fail('The plan is empty or unsupported.');
  const ids=new Set();
  const text=(v,max=100)=>typeof v==='string'&&v.trim().length>0&&v.length<=max?v.trim():fail('Invalid plan text.');
  return {type:p.type,version:1,day:text(p.day,20),kind:['main','top'].includes(p.kind)?p.kind:fail('Choose one shop.'),createdAt:new Date().toISOString(),items:p.items.map(x=>{
    const id=text(x.id,30);if(!/^[a-z]+$/.test(id)||ids.has(id))fail('Invalid or duplicate shopping line.');ids.add(id);
    if(!Number.isFinite(x.quantity)||x.quantity<=0||x.quantity>100)fail('Invalid quantity.');
    return {id,name:text(x.name,70),quantity:x.quantity,unit:text(x.unit,30)};
  })};
}
export function validSnapshot(q,now=Date.now()){
  if(!q||q.version!==1)fail('Read a product first.');
  productURL(q.url);
  if(!q.store||!q.store.startsWith('New World ')||q.store.length>150)fail('Choose your New World store first.');
  if(typeof q.name!=='string'||q.name.length<2||q.name.length>200)fail('Product name is unclear.');
  if(!Number.isInteger(q.priceCents)||q.priceCents<=0||q.priceCents>100000)fail('Price is unclear.');
  if(!['ea','kg'].includes(q.unit)||!Number.isFinite(q.quantity)||q.quantity<=0||q.quantity>50||(q.unit==='ea'&&!Number.isInteger(q.quantity)))fail('Check the product quantity and unit.');
  if(q.unit!==q.priceUnit)fail('Choose kg for a per-kg product before reading its price.');
  if(!Number.isFinite(q.observedAt)||now-q.observedAt>TTL||now<q.observedAt-5000)fail('This price check expired. Read the product again.');
  if(q.addMode!=='Add')fail('This product is already in the trolley or its Add control changed. Review it on New World.');
  return q;
}
export function fingerprint(q){return JSON.stringify([productURL(q.url),q.store,q.name,q.priceCents,q.priceUnit,q.quantity,q.unit,q.addMode,q.promotion]);}
export function compareApproval(approved,current,now=Date.now()){
  validSnapshot(approved,now);validSnapshot(current,now);
  if(current.loginRequired)fail('Sign in directly on New World, then read the product again.');
  if(fingerprint(approved)!==fingerprint(current))fail('The store, product, quantity or price changed. Read it again and approve the new details.');
  return true;
}
export function lineEstimate(q){return Math.round(q.priceCents*q.quantity);}
export function publicState(s){return {linked:!!s.enabled,pending:!!s.pending,plan:s.plan||null,planId:s.planId||null,activeId:s.activeId||null,records:s.records||[],store:s.store||null,busy:!!s.busy,quote:s.quote?{...s.quote,tabId:undefined}:null};}
