(()=>{
if(globalThis.__assemblWWListener)return;globalThis.__assemblWWListener=true;
const {read,addButton}=WWDOM,used=new Set();
const identity=q=>JSON.stringify([q.url,q.store,q.name,q.priceCents,q.priceUnit,q.quantity,q.unit,q.addMode,q.promotion]);
async function add(m){
 const q=m.quote;
 if(typeof m.attempt!=='string'||used.has(m.attempt))throw new Error('This addition was already attempted. Review the trolley.');
 const fresh=read(document,location.href);
 if(fresh.loginRequired!==false)throw new Error('Sign in directly on Woolworths, then read the product again.');
 if(!q||q.quantity!==1||q.unit!=='ea'||q.priceUnit!=='ea'||!Number.isFinite(q.observedAt)||Date.now()-q.observedAt>300000||q.observedAt>Date.now()+5000||identity(q)!==identity(fresh))throw new Error('Product, price or pickup store changed. Read and approve the new details.');
 const button=addButton(document);
 used.add(m.attempt);
 // One fixed, approved action. Never click quantity, checkout, payment or arbitrary selectors.
 button.click();
 // The current signed-in cart layout is not yet validated. A click is NOT proof of addition.
 return {status:'uncertain',at:Date.now(),message:'One Add to cart was requested. Open your Woolworths trolley and check the exact pack, quantity and pickup store. Nothing will be repeated automatically.'};
}
chrome.runtime.onMessage.addListener((m,s,respond)=>{
 if(s.id!==chrome.runtime.id||!['read-product','approved-add'].includes(m?.type))return;
 Promise.resolve().then(()=>m.type==='read-product'?read(document,location.href):add(m)).then(data=>respond({ok:true,data})).catch(e=>respond({ok:false,error:e.message}));return true;
});
})();
