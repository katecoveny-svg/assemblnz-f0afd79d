(()=>{
if(globalThis.__assemblNWListener)return;globalThis.__assemblNWListener=true;
const {read,cart,text,tid}=NWDOM;
const waitFor=(fn,timeout=6000)=>new Promise((resolve,reject)=>{const started=Date.now();const tick=()=>{let v;try{v=fn();}catch{}if(v)return resolve(v);if(Date.now()-started>timeout)return reject(new Error('New World did not show a confirmed result. Check your trolley before trying anything else.'));setTimeout(tick,150);};tick();});
const used=new Set();
const identity=q=>JSON.stringify([q.url,q.store,q.name,q.priceCents,q.priceUnit,q.quantity,q.unit,q.addMode,q.promotion]);
async function openCart(){let p=document.querySelector(tid('cart-preview'));if(!p){const b=document.querySelector(tid('bar-cart-button'));if(!b)throw new Error('Cannot find the New World trolley.');b.click();p=await waitFor(()=>document.querySelector(tid('cart-preview')));}return p;}
async function closeCart(){const p=document.querySelector(tid('cart-preview'));if(!p)return;const close=[...p.querySelectorAll('button')].find(b=>text(b)==='Your Trolley');if(!close)throw new Error('Close the trolley on New World before continuing.');close.click();await waitFor(()=>!document.querySelector(tid('cart-preview')));}
async function inspect(){await closeCart();return read(document,location.href);}
async function add(message){
 const q=message.quote;
 if(used.has(message.attempt))throw new Error('This addition was already attempted. Verify the trolley.');
 const fresh=await inspect();
 if(fresh.loginRequired)throw new Error('Sign in on New World before adding groceries.');
 if(Date.now()-q.observedAt>300000||identity(q)!==identity(fresh)||q.addMode!=='Add')throw new Error('Product details changed. Read and approve again.');
 await openCart();const before=cart(document,q.url);
 // A missing row is only conclusive when the whole trolley explicitly says empty.
 // For a populated trolley, absence is reviewed by the customer in the next step.
 if(before.found)throw new Error('This product is already in your trolley. Adjust it directly on New World to avoid duplicates.');
 await closeCart();
 const final=read(document,location.href);if(Date.now()-q.observedAt>300000||identity(q)!==identity(final))throw new Error('Product details changed during the trolley check. Nothing was added.');
 const p=document.querySelector(tid('product')),b=p.querySelector(tid('add-to-cart'));
 if(!b||text(b)!=='Add'||b.disabled)throw new Error('The Add button is unavailable.');
 used.add(message.attempt);
 // Exactly one fixed Add action. There is deliberately no checkout or arbitrary-click command.
 b.click();
 let result;
 try{await waitFor(()=>{const pp=document.querySelector(tid('product'));return pp&&text(pp.querySelector(tid('add-to-cart')))!=='Add';},4000);}catch{}
 await openCart();
 try{result=await waitFor(()=>{const r=cart(document,q.url);return r.found&&r.unit===q.unit&&Math.abs(r.quantity-q.quantity)<.001?r:null;},4500);}catch{result=cart(document,q.url);}
 const verified=result.found&&result.unit===q.unit&&Math.abs(result.quantity-q.quantity)<.001;
 return {status:verified?'verified':'uncertain',result,at:Date.now(),message:verified?'Exact product and quantity observed in the trolley.':'An Add was requested. The result needs your review on New World; do not repeat it.'};
}
chrome.runtime.onMessage.addListener((m,s,respond)=>{
 if(s.id!==chrome.runtime.id||!['read-product','approved-add','show-trolley'].includes(m?.type))return;
 const task=m.type==='read-product'?inspect():m.type==='approved-add'?add(m):openCart().then(()=>({opened:true}));
 task.then(data=>respond({ok:true,data})).catch(e=>respond({ok:false,error:e.message}));return true;
});
})();
